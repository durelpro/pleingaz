import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface CreateNoticeDto {
  title: string;
  content: string;
  category?: 'INFO' | 'ALERT' | 'PROMO' | 'REGULATION';
  targetRole?: 'ALL' | 'CUSTOMER' | 'DISTRIBUTOR' | 'COURIER';
  targetCity?: string;
  requiresAck?: boolean;
}

@Injectable()
export class InfoNoticesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Création d'une annonce institutionnelle ciblée (D-18)
   */
  async createNotice(createdById: string, dto: CreateNoticeDto): Promise<any> {
    if (!dto.title || dto.title.trim().length < 3) {
      throw new BadRequestException('Le titre de l’annonce est obligatoire (min 3 caractères).');
    }
    if (!dto.content || dto.content.trim().length < 5) {
      throw new BadRequestException('Le contenu de l’annonce est obligatoire (min 5 caractères).');
    }

    // Sécurité Anti-XSS (D-18.2) : Interdiction stricte de balises HTML ou scripts
    const hasHtmlTags = /<[^>]*>/g.test(dto.content) || /<[^>]*>/g.test(dto.title);
    if (hasHtmlTags) {
      throw new BadRequestException('Sécurité D-18.2 : Le texte doit être strictement brut et ne comporter aucune balise HTML.');
    }

    const notice = await this.prisma.infoNotice.create({
      data: {
        title: dto.title.trim(),
        content: dto.content.trim(),
        category: dto.category || 'INFO',
        targetRole: dto.targetRole || 'ALL',
        targetCity: dto.targetCity ? dto.targetCity.trim() : 'ALL',
        requiresAck: dto.requiresAck || false,
        createdById,
        isActive: true,
      },
    });

    await this.audit.log({
      action: 'info_notice:create',
      userId: createdById,
      entity: 'INFO_NOTICE',
      entityId: notice.id,
      details: { description: `Création de l’annonce "${notice.title}" ciblée [Rôle: ${notice.targetRole}, Ville: ${notice.targetCity}]` },
    });

    return notice;
  }

  /**
   * Récupère les annonces actives pertinentes pour un utilisateur connecté (D-18.1)
   */
  async getNoticesForUser(userId: string, userRole: string = 'CUSTOMER', userCity?: string): Promise<any> {
    const roleCriteria = ['ALL', userRole.toUpperCase()];
    const cityCriteria = ['ALL'];
    if (userCity) {
      cityCriteria.push(userCity.trim());
    }

    const notices = await this.prisma.infoNotice.findMany({
      where: {
        isActive: true,
        targetRole: { in: roleCriteria },
        targetCity: { in: cityCriteria },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        reads: {
          where: { userId },
          select: { acknowledgedAt: true },
        },
      },
    });

    let unacknowledgedCount = 0;
    const items = notices.map((n) => {
      const hasAcknowledged = n.reads && n.reads.length > 0;
      if (!hasAcknowledged && n.requiresAck) {
        unacknowledgedCount += 1;
      }
      return {
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        targetRole: n.targetRole,
        targetCity: n.targetCity,
        requiresAck: n.requiresAck,
        hasAcknowledged,
        acknowledgedAt: n.reads[0]?.acknowledgedAt || null,
        createdAt: n.createdAt,
      };
    });

    return {
      total: items.length,
      unacknowledgedCount,
      notices: items,
    };
  }

  /**
   * Enregistre l'accusé de lecture formel "J'ai compris" (D-18.1)
   */
  async acknowledgeNotice(noticeId: string, userId: string): Promise<any> {
    const notice = await this.prisma.infoNotice.findUnique({
      where: { id: noticeId },
    });
    if (!notice) {
      throw new NotFoundException('Annonce introuvable.');
    }

    const read = await this.prisma.infoNoticeRead.upsert({
      where: {
        noticeId_userId: {
          noticeId,
          userId,
        },
      },
      create: {
        noticeId,
        userId,
        acknowledgedAt: new Date(),
      },
      update: {
        acknowledgedAt: new Date(),
      },
    });

    return {
      message: 'Accusé de lecture enregistré avec succès.',
      noticeId,
      acknowledgedAt: read.acknowledgedAt,
    };
  }

  /**
   * Consultation consolidée des annonces et statistiques réelles (Control Center D-18.4)
   */
  async getAllNoticesForAdmin(): Promise<any> {
    const notices = await this.prisma.infoNotice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, phone: true } },
        _count: { select: { reads: true } },
      },
    });

    return notices.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      targetRole: n.targetRole,
      targetCity: n.targetCity,
      isActive: n.isActive,
      requiresAck: n.requiresAck,
      createdAt: n.createdAt,
      readCount: n._count.reads,
      createdBy: n.createdBy,
    }));
  }

  /**
   * Activation ou désactivation d'une annonce
   */
  async toggleNotice(noticeId: string, isActive: boolean, operatorId: string): Promise<any> {
    const updated = await this.prisma.infoNotice.update({
      where: { id: noticeId },
      data: { isActive },
    });

    await this.audit.log({
      action: 'info_notice:toggle',
      userId: operatorId,
      entity: 'INFO_NOTICE',
      entityId: noticeId,
      details: { description: `Bascule statut annonce ${noticeId} -> isActive=${isActive}` },
    });

    return updated;
  }
}
