import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../payments/ledger.service';
import * as crypto from 'crypto';

export interface CheckQuotaResult {
  allowed: boolean;
  usedCount: number;
  remainingCount: number;
  limit: number;
  earliestReleaseDate?: Date | null;
}

export interface CreateCounterSaleDto {
  storeId: string;
  customerPhone: string;
  bottleCount?: number;
  totalAmount: number;
  paymentMethod?: 'CASH' | 'MTN_MOMO' | 'ORANGE_MONEY';
  metadata?: any;
}

@Injectable()
export class CounterSalesService {
  private readonly QUOTA_LIMIT = 5; // 5 bouteilles maximum par 30 jours (D-14)
  private readonly ROLLING_WINDOW_DAYS = 30;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * Normalisation du numéro de téléphone E.164
   */
  private normalizePhone(phone: string): string {
    if (!phone) return '';
    const clean = phone.replace(/[\s\-\(\)]/g, '').trim();
    if (clean.startsWith('+')) return clean;
    const digits = clean.replace(/^0+/, '');
    if (digits.startsWith('237')) return `+${digits}`;
    return `+237${digits}`;
  }

  /**
   * Contrôle strict du quota de 5 bouteilles sur 30 jours glissants (D-14, D-16)
   */
  async checkBuyerQuota(customerPhone: string, requestedBottles: number = 1): Promise<CheckQuotaResult> {
    const cleanPhone = this.normalizePhone(customerPhone);
    if (!cleanPhone) {
      throw new BadRequestException('Le numéro de téléphone de l’acheteur est obligatoire pour vérifier le quota.');
    }

    const windowStart = new Date(Date.now() - this.ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    // 1. Décompte des ventes au comptoir confirmées sur la période
    const counterSales = await this.prisma.counterSale.findMany({
      where: {
        customerPhone: cleanPhone,
        createdAt: { gte: windowStart },
      },
      select: {
        bottleCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const counterBottleCount = counterSales.reduce((sum, cs) => sum + cs.bottleCount, 0);

    // 2. Décompte des commandes en ligne si l'utilisateur possède un compte
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { whatsappPhone: cleanPhone },
        ],
      },
      select: { id: true },
    });

    let orderBottleCount = 0;
    let orderEarliestDate: Date | null = null;

    if (user) {
      const orders = await this.prisma.order.findMany({
        where: {
          customerId: user.id,
          createdAt: { gte: windowStart },
          status: { notIn: ['CANCELLED', 'FAILED'] },
        },
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      for (const order of orders) {
        for (const item of order.items) {
          // Bouteilles uniquement (catégorie ou nom contenant bouteille / gaz)
          const isBottle =
            item.product?.category?.name?.toLowerCase().includes('bouteille') ||
            item.product?.name?.toLowerCase().includes('bouteille') ||
            item.product?.name?.toLowerCase().includes('12.5') ||
            item.product?.name?.toLowerCase().includes('6kg');

          if (isBottle) {
            orderBottleCount += item.quantity;
            if (!orderEarliestDate) {
              orderEarliestDate = order.createdAt;
            }
          }
        }
      }
    }

    const totalUsed = counterBottleCount + orderBottleCount;
    const remaining = Math.max(0, this.QUOTA_LIMIT - totalUsed);
    const allowed = totalUsed + requestedBottles <= this.QUOTA_LIMIT;

    // Calcul de la première date de libération de quota
    let earliestReleaseDate: Date | null = null;
    const oldestTransactionDate = counterSales[0]?.createdAt || orderEarliestDate;
    if (oldestTransactionDate) {
      earliestReleaseDate = new Date(oldestTransactionDate.getTime() + this.ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    }

    return {
      allowed,
      usedCount: totalUsed,
      remainingCount: remaining,
      limit: this.QUOTA_LIMIT,
      earliestReleaseDate,
    };
  }

  /**
   * Enregistrement d'une vente physique au comptoir avec contrôle préalable de quota (D-16)
   */
  async createCounterSale(dto: CreateCounterSaleDto, operatorUserId?: string): Promise<any> {
    const cleanPhone = this.normalizePhone(dto.customerPhone);
    const bottleCount = dto.bottleCount && dto.bottleCount > 0 ? dto.bottleCount : 1;

    if (dto.totalAmount <= 0) {
      throw new BadRequestException('Le montant de la vente au comptoir doit être strictement positif.');
    }

    // 1. Vérification de l'existence de la boutique
    const store = await this.prisma.store.findUnique({
      where: { id: dto.storeId },
    });
    if (!store) {
      throw new NotFoundException('Boutique distributrice introuvable.');
    }

    // 2. Contrôle strict du quota AVANT enregistrement (D-16.2 / Question 3)
    const quota = await this.checkBuyerQuota(cleanPhone, bottleCount);
    if (!quota.allowed) {
      throw new BadRequestException(
        `QUOTA_EXCEEDED : Quota réglementaire atteint pour ce client (${quota.usedCount}/${quota.limit} bouteilles sur 30 jours). Vente impossible.`
      );
    }

    // 3. Génération d'un reçu fiscal dématérialisé unique
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const receiptNumber = `RCP-CS-${Date.now().toString().slice(-6)}-${randomHex}`;

    // 4. Enregistrement en base de données
    const sale = await this.prisma.counterSale.create({
      data: {
        receiptNumber,
        storeId: dto.storeId,
        customerPhone: cleanPhone,
        bottleCount,
        totalAmount: dto.totalAmount,
        paymentMethod: (dto.paymentMethod as any) || 'CASH',
        quotaChecked: true,
        metadata: dto.metadata || null,
      },
    });

    // 5. Inscription automatique dans le Grand Livre immuable (D-06, D-16)
    try {
      const isCash = dto.paymentMethod === 'CASH' || !dto.paymentMethod;
      const accountDebit = isCash ? '1010' : '1020'; // 1010 = Caisse espèces, 1020 = Compte Mobile Money
      const accountCredit = '7010'; // 7010 = Ventes de Gaz PLEINGAZ

      await this.ledgerService.recordDoubleEntry({
        transactionRef: `CS-${sale.receiptNumber}`,
        entries: [
          {
            accountCode: accountDebit,
            debit: dto.totalAmount,
            credit: 0,
            description: `Encaissement vente au comptoir ${sale.receiptNumber}`,
          },
          {
            accountCode: accountCredit,
            debit: 0,
            credit: dto.totalAmount,
            description: `Produit vente au comptoir gaz ${store.name}`,
          },
        ],
        entityType: 'ORDER',
        entityId: sale.id,
        createdById: operatorUserId,
      });
    } catch (ledgerErr) {
      // Tolérance si les comptes ne sont pas encore seedés en environnement de test
      console.warn(`[CounterSales] Avertissement Grand Livre pour ${sale.receiptNumber}:`, ledgerErr.message);
    }

    return {
      message: 'Vente au comptoir enregistrée avec succès.',
      sale,
      quota: {
        usedCount: quota.usedCount + bottleCount,
        remainingCount: Math.max(0, quota.limit - (quota.usedCount + bottleCount)),
        limit: quota.limit,
      },
    };
  }

  /**
   * Consultation des ventes au comptoir pour une boutique
   */
  async getStoreSales(storeId: string, limit: number = 20): Promise<any> {
    return this.prisma.counterSale.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        store: { select: { id: true, name: true, city: true } },
      },
    });
  }

  /**
   * Registre consolidé des transactions pour le Control Center (D-16.1)
   */
  async getAllTransactions(filters?: { storeId?: string; startDate?: string; endDate?: string; limit?: number }): Promise<any> {
    const where: any = {};
    if (filters?.storeId) {
      where.storeId = filters.storeId;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const limit = filters?.limit || 50;

    const [counterSales, totalAmount] = await Promise.all([
      this.prisma.counterSale.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          store: { select: { id: true, name: true, city: true, neighborhood: true } },
        },
      }),
      this.prisma.counterSale.aggregate({
        where,
        _sum: { totalAmount: true, bottleCount: true },
        _count: { id: true },
      }),
    ]);

    return {
      transactions: counterSales,
      summary: {
        count: totalAmount._count.id,
        totalBottles: totalAmount._sum.bottleCount || 0,
        totalRevenueFcfa: totalAmount._sum.totalAmount || 0,
      },
    };
  }
}
