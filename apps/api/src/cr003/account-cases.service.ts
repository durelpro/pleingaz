import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';

export interface CreateCaseDto {
  targetUserId: string;
  reason: string;
  proposedAction?: string;
  evidenceUrls?: string[];
}

export interface ProposePhoneChangeDto {
  newPhone: string;
  explanation: string;
}

@Injectable()
export class AccountCasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Création d'un dossier formel d'assistance (D-15)
   */
  async createCase(agentId: string, dto: CreateCaseDto): Promise<any> {
    if (!dto.reason || dto.reason.trim().length < 5) {
      throw new BadRequestException('Le motif formel d’ouverture du dossier est obligatoire (min 5 caractères).');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('Utilisateur cible introuvable.');
    }

    const randomSuffix = crypto.randomInt(1000, 9999).toString();
    const caseNumber = `CASE-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    const accountCase = await this.prisma.accountCase.create({
      data: {
        caseNumber,
        status: 'OPEN',
        reason: dto.reason,
        proposedAction: dto.proposedAction || 'ASSISTANCE_REQUEST',
        evidenceUrls: dto.evidenceUrls || [],
        agentId,
        targetUserId: dto.targetUserId,
      },
      include: {
        targetUser: {
          select: { id: true, phone: true, whatsappPhone: true, callPhone: true },
        },
      },
    });

    await this.audit.log({
      action: 'account_case:create',
      userId: agentId,
      entity: 'ACCOUNT_CASE',
      entityId: accountCase.id,
      details: { description: `Ouverture dossier ${caseNumber} pour usager ${dto.targetUserId} (Motif: ${dto.reason})` },
    });

    return accountCase;
  }

  /**
   * Liste des dossiers d'assistance avec filtres
   */
  async getCases(filters?: { status?: string; agentId?: string }): Promise<any> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.agentId) where.agentId = filters.agentId;

    return this.prisma.accountCase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        agent: { select: { id: true, phone: true, whatsappPhone: true } },
        targetUser: { select: { id: true, phone: true, whatsappPhone: true, callPhone: true } },
        approvedBy: { select: { id: true, phone: true } },
      },
    });
  }

  /**
   * Consultation d'un dossier avec numéros masqués par défaut (D-15.2)
   */
  async getCaseById(caseId: string): Promise<any> {
    const accountCase = await this.prisma.accountCase.findUnique({
      where: { id: caseId },
      include: {
        agent: { select: { id: true, phone: true } },
        targetUser: { select: { id: true, phone: true, whatsappPhone: true, callPhone: true, lockedUntil: true, failedAttempts: true } },
        approvedBy: { select: { id: true, phone: true } },
      },
    });

    if (!accountCase) {
      throw new NotFoundException('Dossier d’assistance introuvable.');
    }

    // Masquage du numéro par défaut (ex: +237 6** ** ** 12)
    const mask = (p?: string | null) => {
      if (!p || p.length < 6) return p;
      return `${p.slice(0, 6)}******${p.slice(-2)}`;
    };

    return {
      ...accountCase,
      targetUser: {
        ...accountCase.targetUser,
        phone: mask(accountCase.targetUser.phone),
        whatsappPhone: mask(accountCase.targetUser.whatsappPhone),
        callPhone: mask(accountCase.targetUser.callPhone),
      },
    };
  }

  /**
   * Démasquage exceptionnel du numéro complet avec traçabilité AuditLog obligatoire (D-15.2)
   */
  async unmaskPhone(caseId: string, agentId: string, justification: string): Promise<any> {
    if (!justification || justification.trim().length < 5) {
      throw new BadRequestException('Un motif explicite est obligatoire pour démasquer le numéro (min 5 caractères).');
    }

    const accountCase = await this.prisma.accountCase.findUnique({
      where: { id: caseId },
      include: { targetUser: true },
    });

    if (!accountCase) {
      throw new NotFoundException('Dossier introuvable.');
    }

    await this.audit.log({
      action: 'account:unmask_phone',
      userId: agentId,
      entity: 'ACCOUNT_CASE',
      entityId: caseId,
      details: { description: `Démasquage des coordonnées complètes de ${accountCase.targetUserId} (Justification: ${justification})` },
    });

    return {
      phone: accountCase.targetUser.phone,
      whatsappPhone: accountCase.targetUser.whatsappPhone,
      callPhone: accountCase.targetUser.callPhone,
      unmaskedAt: new Date(),
    };
  }

  /**
   * Levée d'un verrouillage temporaire (Lockout) pour un usager légitime (D-15.2)
   */
  async unlockAccount(caseId: string, agentId: string): Promise<any> {
    const accountCase = await this.prisma.accountCase.findUnique({
      where: { id: caseId },
    });
    if (!accountCase) throw new NotFoundException('Dossier introuvable.');

    await this.prisma.user.update({
      where: { id: accountCase.targetUserId },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    await this.audit.log({
      action: 'account:unlock',
      userId: agentId,
      entity: 'ACCOUNT_CASE',
      entityId: caseId,
      details: { description: `Déverrouillage du compte ${accountCase.targetUserId} suite à vérification d’identité` },
    });

    return { message: 'Compte déverrouillé avec succès.' };
  }

  /**
   * Révocation forcée de toutes les sessions actives (D-15.2)
   */
  async revokeSessions(caseId: string, agentId: string): Promise<any> {
    const accountCase = await this.prisma.accountCase.findUnique({
      where: { id: caseId },
    });
    if (!accountCase) throw new NotFoundException('Dossier introuvable.');

    await this.prisma.session.deleteMany({
      where: { userId: accountCase.targetUserId },
    });

    await this.audit.log({
      action: 'account:revoke_sessions',
      userId: agentId,
      entity: 'ACCOUNT_CASE',
      entityId: caseId,
      details: { description: `Révocation de l’intégralité des sessions actives pour l’usager ${accountCase.targetUserId}` },
    });

    return { message: 'Toutes les sessions ont été révoquées.' };
  }

  /**
   * Préparation d'une proposition de changement de numéro (D-15.2 / Dual-Control)
   */
  async proposePhoneChange(caseId: string, agentId: string, dto: ProposePhoneChangeDto): Promise<any> {
    if (!dto.newPhone || !dto.explanation) {
      throw new BadRequestException('Le nouveau numéro et l’explication de la démarche sont obligatoires.');
    }

    const cleanNewPhone = dto.newPhone.trim();

    const accountCase = await this.prisma.accountCase.findUnique({
      where: { id: caseId },
    });
    if (!accountCase) throw new NotFoundException('Dossier introuvable.');

    const proposedAction = JSON.stringify({
      actionType: 'PHONE_CHANGE',
      newPhone: cleanNewPhone,
      explanation: dto.explanation,
      proposedAt: new Date().toISOString(),
    });

    const updated = await this.prisma.accountCase.update({
      where: { id: caseId },
      data: {
        status: 'PROPOSED',
        proposedAction,
      },
    });

    await this.audit.log({
      action: 'account:prepare_phone_change',
      userId: agentId,
      entity: 'ACCOUNT_CASE',
      entityId: caseId,
      details: { description: `Proposition de remplacement de numéro par ${cleanNewPhone} soumise pour validation administrateur` },
    });

    return updated;
  }

  /**
   * Approbation formelle par un ADMIN distinct (Principe Maker-Checker / D-15.2)
   */
  async adminApprovePhoneChange(caseId: string, adminId: string, approved: boolean, adminNotes?: string): Promise<any> {
    const accountCase = await this.prisma.accountCase.findUnique({
      where: { id: caseId },
    });
    if (!accountCase) throw new NotFoundException('Dossier introuvable.');

    // RÈGLE ABSOLUE MAKER-CHECKER : L'administrateur approbateur doit être STRICTEMENT DISTINCT du gestionnaire ayant instruit le dossier
    if (accountCase.agentId === adminId) {
      throw new ForbiddenException(
        'Principe des deux personnes (Maker-Checker) : Vous ne pouvez pas approuver une demande que vous avez vous-même initiée.'
      );
    }

    if (accountCase.status !== 'PROPOSED') {
      throw new BadRequestException('Ce dossier n’a aucune proposition en attente de validation.');
    }

    if (!approved) {
      const rejected = await this.prisma.accountCase.update({
        where: { id: caseId },
        data: {
          status: 'REJECTED',
          approvedById: adminId,
          adminNotes: adminNotes || 'Demande rejetée par l’administration',
          closedAt: new Date(),
        },
      });

      await this.audit.log({
        action: 'account_case:reject',
        userId: adminId,
        entity: 'ACCOUNT_CASE',
        entityId: caseId,
        details: { description: `Rejet de la proposition du dossier ${accountCase.caseNumber}` },
      });

      return rejected;
    }

    // Extraction du nouveau numéro depuis la proposition
    let proposedData: any = {};
    try {
      proposedData = JSON.parse(accountCase.proposedAction);
    } catch {
      throw new BadRequestException('Données de proposition corrompues.');
    }

    const { newPhone } = proposedData;
    if (!newPhone) {
      throw new BadRequestException('Nouveau numéro manquant dans la proposition.');
    }

    // Application atomique de la mutation du numéro
    await this.prisma.user.update({
      where: { id: accountCase.targetUserId },
      data: {
        phone: newPhone,
        whatsappPhone: newPhone,
      },
    });

    // Mise à jour du statut du dossier
    const resolved = await this.prisma.accountCase.update({
      where: { id: caseId },
      data: {
        status: 'APPLIED',
        approvedById: adminId,
        adminNotes: adminNotes || 'Approuvé et appliqué par l’administration',
        appliedAt: new Date(),
        closedAt: new Date(),
      },
    });

    await this.audit.log({
      action: 'account_case:approve_phone_change',
      userId: adminId,
      entity: 'ACCOUNT_CASE',
      entityId: caseId,
      details: { description: `Approbation et application du nouveau numéro ${newPhone} pour ${accountCase.targetUserId}` },
    });

    return resolved;
  }

  /**
   * Clôture formelle d'un dossier (D-15)
   */
  async closeCase(caseId: string, agentId: string): Promise<any> {
    const accountCase = await this.prisma.accountCase.findUnique({
      where: { id: caseId },
    });
    if (!accountCase) throw new NotFoundException('Dossier introuvable.');

    const closed = await this.prisma.accountCase.update({
      where: { id: caseId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    await this.audit.log({
      action: 'account_case:close',
      userId: agentId,
      entity: 'ACCOUNT_CASE',
      entityId: caseId,
      details: { description: `Clôture du dossier ${accountCase.caseNumber}` },
    });

    return closed;
  }
}
