import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LedgerService } from './ledger.service';
import {
  CreatePayoutBatchDto,
  ApprovePayoutDto,
  ExecutePayoutDto,
} from './dto/payout.dto';

@Injectable()
export class PayoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * D-06: Rôle Maker - Création d'un lot de reversement groupé (Statut PROPOSED)
   */
  async createBatch(makerId: string, dto: CreatePayoutBatchDto): Promise<any> {
    if (dto.totalAmount <= 0) {
      throw new BadRequestException('Le montant du lot doit être strictement positif.');
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const batchNumber = `BATCH-${dateStr}-${randomSuffix}`;

    const batch = await this.prisma.payoutBatch.create({
      data: {
        batchNumber,
        beneficiaryType: dto.beneficiaryType,
        totalAmount: dto.totalAmount,
        status: 'PROPOSED',
        createdById: makerId,
      },
    });

    await this.audit.log({
      userId: makerId,
      action: 'CREATE_PAYOUT_BATCH',
      entity: 'PayoutBatch',
      entityId: batch.id,
      details: {
        batchNumber,
        beneficiaryType: dto.beneficiaryType,
        totalAmount: dto.totalAmount,
      },
    });

    return batch;
  }

  /**
   * D-06: Rôle Checker - Approbation du lot de reversement avec gestion du seuil (500 000 FCFA)
   * Si totalAmount > 500 000 FCFA : deux approbateurs distincts sont obligatoires.
   */
  async approveBatch(
    checkerId: string,
    batchId: string,
    dto?: ApprovePayoutDto,
  ): Promise<any> {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException(`Lot de reversement introuvable (ID: ${batchId})`);
    }

    if (batch.status !== 'PROPOSED') {
      throw new BadRequestException(`Ce lot ne peut pas être approuvé car son statut est ${batch.status}.`);
    }

    // 1. Règle Maker-Checker absolue : le créateur ne peut approuver son propre lot
    if (batch.createdById === checkerId) {
      throw new ForbiddenException(
        'Principe Maker-Checker : vous ne pouvez pas approuver un lot de reversement que vous avez créé.'
      );
    }

    // 2. Seuil de double validation (défaut 500 000 FCFA selon PlatformSettings)
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'singleton' },
      select: { payoutDoubleApprovalThreshold: true },
    });
    const threshold = settings?.payoutDoubleApprovalThreshold || 500000;

    const requiresDoubleApproval = batch.totalAmount > threshold;

    if (requiresDoubleApproval) {
      // Cas où le premier checker a déjà approuvé
      if (batch.approvedById) {
        // Le second checker doit être différent du premier
        if (batch.approvedById === checkerId) {
          throw new ForbiddenException(
            'Double approbation D-06 : le second approbateur doit être une personne distincte du premier approbateur.'
          );
        }

        // Seconde approbation validée -> Passage à APPROVED
        const approvedBatch = await this.prisma.payoutBatch.update({
          where: { id: batchId },
          data: {
            secondApprovedById: checkerId,
            status: 'APPROVED',
          },
        });

        await this.audit.log({
          userId: checkerId,
          action: 'SECOND_APPROVE_PAYOUT_BATCH',
          entity: 'PayoutBatch',
          entityId: batchId,
          details: { firstApprover: batch.approvedById, secondApprover: checkerId },
        });

        return {
          batch: approvedBatch,
          message: 'Lot validé avec succès (Double approbation franchie). Prêt pour exécution.',
        };
      } else {
        // Première approbation
        const partiallyApproved = await this.prisma.payoutBatch.update({
          where: { id: batchId },
          data: {
            approvedById: checkerId,
            // Reste PROPOSED en attendant le 2e approbateur
          },
        });

        await this.audit.log({
          userId: checkerId,
          action: 'FIRST_APPROVE_PAYOUT_BATCH',
          entity: 'PayoutBatch',
          entityId: batchId,
          details: { firstApprover: checkerId, pendingSecondApproval: true },
        });

        return {
          batch: partiallyApproved,
          message: `Première approbation enregistrée. Montant supérieur à ${threshold.toLocaleString()} FCFA : seconde approbation requise.`,
        };
      }
    } else {
      // Montant <= 500 000 FCFA : une seule approbation suffit
      const approvedBatch = await this.prisma.payoutBatch.update({
        where: { id: batchId },
        data: {
          approvedById: checkerId,
          status: 'APPROVED',
        },
      });

      await this.audit.log({
        userId: checkerId,
        action: 'APPROVE_PAYOUT_BATCH',
        entity: 'PayoutBatch',
        entityId: batchId,
      });

      return {
        batch: approvedBatch,
        message: 'Lot approuvé avec succès. Prêt pour exécution.',
      };
    }
  }

  /**
   * D-06: Exécution bancaire/télécom du lot et imputation comptable immédiate
   */
  async executeBatch(
    adminId: string,
    batchId: string,
    dto: ExecutePayoutDto,
  ): Promise<any> {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException('Lot introuvable.');
    }

    if (batch.status !== 'APPROVED') {
      throw new BadRequestException(
        `Ce lot ne peut être exécuté car il n'a pas été entièrement approuvé (Statut actuel: ${batch.status}).`
      );
    }

    if (!dto.operatorTxRef) {
      throw new BadRequestException('La référence de transaction opérateur/banque est obligatoire.');
    }

    const now = new Date();

    const executedBatch = await this.prisma.payoutBatch.update({
      where: { id: batchId },
      data: {
        status: 'EXECUTED',
        operatorTxRef: dto.operatorTxRef,
        proofFileUrl: dto.proofFileUrl,
        executedAt: now,
      },
    });

    // Écriture comptable au Grand Livre (D-06)
    // Débit de la Dette (4010 distributeur ou 4020 livreur) et Crédit de la Trésorerie (1010)
    const liabilityAccount =
      batch.beneficiaryType === 'DISTRIBUTOR' ? '4010' : '4020';

    await this.ledgerService.recordDoubleEntry({
      transactionRef: `PAYOUT-${batch.batchNumber}`,
      entries: [
        {
          accountCode: liabilityAccount,
          debit: batch.totalAmount,
          credit: 0,
          description: `Règlement lot reversement ${batch.batchNumber} (${batch.beneficiaryType})`,
        },
        {
          accountCode: '1010', // Trésorerie PLEINGAZ
          debit: 0,
          credit: batch.totalAmount,
          description: `Décaissement compte MoMo/Banque - Réf Opérateur: ${dto.operatorTxRef}`,
        },
      ],
      entityType: 'PAYOUT',
      entityId: batchId,
      createdById: adminId,
    });

    await this.audit.log({
      userId: adminId,
      action: 'EXECUTE_PAYOUT_BATCH',
      entity: 'PayoutBatch',
      entityId: batchId,
      details: { operatorTxRef: dto.operatorTxRef },
    });

    return executedBatch;
  }

  /**
   * Liste des lots de reversement
   */
  async getBatches(status?: string): Promise<any> {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.payoutBatch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, phone: true } },
        approvedBy: { select: { id: true, phone: true } },
        secondApprovedBy: { select: { id: true, phone: true } },
      },
    });
  }
}
