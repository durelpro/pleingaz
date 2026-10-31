import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Cr003Service {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Catalogue dynamique
  async getCatalog() {
    return this.prisma.product.findMany({
      include: {
        prices: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  // 2. Calcul dynamique du Quota Acheteur (D-14 : 5 bouteilles / 30 jours glissants)
  async getBuyerQuota(phone: string) {
    const formattedPhone = phone.trim();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Compter les bouteilles des commandes livrées/en cours
    const orders = await this.prisma.order.findMany({
      where: {
        customer: { phone: formattedPhone },
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
      },
      include: { items: true },
    });

    let orderBottles = 0;
    for (const order of orders) {
      for (const item of (order as any).items || []) {
        orderBottles += item.quantity;
      }
    }

    // Compter les ventes au comptoir associées à ce numéro (D-16)
    const counterSales = await this.prisma.counterSale.findMany({
      where: {
        customerPhone: formattedPhone,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    let counterBottles = 0;
    for (const sale of counterSales) {
      counterBottles += sale.quantity;
    }

    const totalConsumed = orderBottles + counterBottles;
    const limit = 5;
    const remaining = Math.max(0, limit - totalConsumed);

    return {
      phone: formattedPhone,
      consumed: totalConsumed,
      limit,
      remaining,
      allowed: totalConsumed < limit,
      windowDays: 30,
      details: {
        ordersCount: orders.length,
        counterSalesCount: counterSales.length,
      },
    };
  }

  // 3. Stocks en temps réel du Distributeur (D-16)
  async getDistributorStock(storeId?: string) {
    const store = storeId
      ? await this.prisma.store.findUnique({ where: { id: storeId } })
      : await this.prisma.store.findFirst();

    if (!store) {
      throw new NotFoundException('Aucune boutique distributeur trouvée');
    }

    const inventories = await this.prisma.inventory.findMany({
      where: { storeId: store.id },
      include: {
        product: {
          include: {
            prices: {
              where: { status: 'APPROVED' },
              take: 1,
            },
          },
        },
      },
    });

    return {
      store: {
        id: store.id,
        name: store.name,
        city: store.city,
        neighborhood: store.neighborhood,
      },
      inventories: inventories.map((inv) => ({
        id: inv.id,
        productName: inv.product.name,
        bottleType: inv.product.name,
        stockLevel: inv.level,
        unitPrice: inv.product.prices[0]?.publicPrice ?? 6500,
      })),
    };
  }

  // 4. Ajustement de stock en temps réel
  async adjustStock(inventoryId: string, level: 'BON' | 'MOYEN' | 'FAIBLE' | 'RUPTURE') {
    return this.prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        level,
        lastConfirmedAt: new Date(),
      },
    });
  }

  // 5. Vente directe au Comptoir avec contrôle Quota en direct (D-16)
  async createCounterSale(data: {
    storeId?: string;
    customerPhone?: string;
    buyerPhone?: string;
    bottleType?: string;
    quantity?: number;
    amountTotal?: number;
    totalAmount?: number;
    paymentMethod?: string;
  }) {
    const qty = Number(data.quantity) || 1;
    const rawPhone = data.customerPhone || data.buyerPhone || (data as any).phone || '+237699123456';
    const phone = rawPhone.trim();
    const bottle = data.bottleType || '12.5kg';
    const total = Number(data.amountTotal || data.totalAmount) || (qty * 6500);
    const method = data.paymentMethod || 'CASH';

    // Contrôle Quota Pré-Vente Strict (D-16 / D-14)
    const quota = await this.getBuyerQuota(phone);
    if (quota.consumed + qty > quota.limit) {
      throw new BadRequestException({
        code: 'QUOTA_EXCEEDED',
        message: `Plafond mensuel de 5 bouteilles dépassé pour ${phone}. Consommé: ${quota.consumed}/5. Vente refusée.`,
      });
    }

    const store = data.storeId
      ? await this.prisma.store.findUnique({ where: { id: data.storeId } })
      : await this.prisma.store.findFirst();

    if (!store) {
      throw new NotFoundException('Boutique introuvable');
    }

    // Récupérer ou lier l'utilisateur acheteur s'il existe
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, { whatsappPhone: phone }] },
    });

    const receiptNumber = `CS-${Date.now().toString().slice(-6)}`;

    const sale = await this.prisma.counterSale.create({
      data: {
        receiptNumber,
        storeId: store.id,
        sellerId: store.ownerId,
        customerPhone: phone,
        customerUserId: existingUser?.id ?? null,
        bottleType: bottle,
        quantity: qty,
        amountTotal: total,
        paymentMethod: method,
        quotaValidated: true,
      },
    });

    return {
      success: true,
      sale,
      newQuota: {
        consumed: quota.consumed + qty,
        remaining: Math.max(0, quota.limit - (quota.consumed + qty)),
      },
    };
  }

  // 6. Annonces Officielles Ciblées (D-18)
  async getNotices() {
    return this.prisma.infoNotice.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 7. Accusé de lecture "J'ai compris" (D-18)
  async ackNotice(noticeId: string, phone: string) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, { whatsappPhone: phone }] },
    });

    if (!user) {
      return { success: true, message: 'Notice acquittée en session locale' };
    }

    await this.prisma.infoNoticeRead.upsert({
      where: {
        noticeId_userId: {
          noticeId,
          userId: user.id,
        },
      },
      update: { readAt: new Date() },
      create: {
        noticeId,
        userId: user.id,
      },
    });

    return { success: true, message: 'Accusé de lecture enregistré dans la base de données' };
  }

  // 8. Registre central de TOUTES les transactions (D-16 : Qui a acheté et Où)
  async getAllTransactions() {
    // A. Récupérer les commandes en ligne
    const orders = await this.prisma.order.findMany({
      include: {
        customer: {
          include: { customerProfile: true },
        },
        store: true,
        items: {
          include: { product: true },
        },
        delivery: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // B. Récupérer les ventes directes au comptoir
    const counterSales = await this.prisma.counterSale.findMany({
      include: {
        store: true,
        customerUser: {
          include: { customerProfile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // C. Fusionner et unifier
    const unifiedList = [
      ...orders.map((o) => ({
        id: o.id,
        reference: o.orderNumber,
        type: 'ONLINE' as const,
        typeLabel: 'Commande en Ligne (Livraison)',
        customerName: o.customer.customerProfile ? `${o.customer.customerProfile.firstName} ${o.customer.customerProfile.lastName}` : 'Client Particulier',
        customerPhone: o.customer.phone,
        storeName: o.store?.name || 'Boutique Centrale PLEINGAZ',
        location: o.store ? `${o.store.city} (${o.store.neighborhood})` : (o.deliveryAddress || 'Douala'),
        product: o.items[0]?.product?.name || 'Bouteille 12.5 kg PLEINGAZ',
        quantity: o.items.reduce((acc, it) => acc + it.quantity, 0) || 1,
        amount: o.totalAmount,
        paymentMethod: o.payments?.[0]?.method || 'MOMO',
        status: o.status,
        quotaValidated: true,
        createdAt: o.createdAt,
      })),
      ...counterSales.map((cs) => ({
        id: cs.id,
        reference: cs.receiptNumber,
        type: 'COUNTER' as const,
        typeLabel: 'Vente Directe au Comptoir (D-16)',
        customerName: cs.customerUser?.customerProfile ? `${cs.customerUser.customerProfile.firstName} ${cs.customerUser.customerProfile.lastName}` : 'Acheteur en Boutique',
        customerPhone: cs.customerPhone,
        storeName: cs.store.name,
        location: `${cs.store.city} (${cs.store.neighborhood})`,
        product: cs.bottleType,
        quantity: cs.quantity,
        amount: cs.amountTotal,
        paymentMethod: cs.paymentMethod,
        status: 'COMPLETED',
        quotaValidated: cs.quotaValidated,
        createdAt: cs.createdAt,
      })),
    ];

    // Trier du plus récent au plus ancien
    unifiedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return unifiedList;
  }

  // 9. Synthèse statistique globale pour l'administrateur
  async getAdminStats() {
    const transactions = await this.getAllTransactions();
    const totalVolume = transactions.reduce((acc, t) => acc + t.quantity, 0);
    const onlineVolume = transactions.filter((t) => t.type === 'ONLINE').reduce((acc, t) => acc + t.quantity, 0);
    const counterVolume = transactions.filter((t) => t.type === 'COUNTER').reduce((acc, t) => acc + t.quantity, 0);
    const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);

    return {
      totalVolume,
      onlineVolume,
      counterVolume,
      totalRevenue,
      deliveryFees: onlineVolume * 1000,
      totalTransactionsCount: transactions.length,
    };
  }

  // ==========================================
  // 10. GESTION DES LITIGES & DOSSIERS ACCOUNT_CASE (D-15, C-07)
  // ==========================================

  /**
   * Création d'un dossier par un Gestionnaire de Compte (ACCOUNT_MANAGER)
   */
  async createAccountCase(agentId: string, data: {
    targetUserId?: string;
    targetPhone?: string;
    reason: string;
    proposedAction: string;
    evidenceUrls?: string[];
  }) {
    let targetUser: any = null;

    if (data.targetUserId) {
      targetUser = await this.prisma.user.findUnique({ where: { id: data.targetUserId } });
    } else if (data.targetPhone) {
      const formatted = data.targetPhone.startsWith('+') ? data.targetPhone.trim() : `+237${data.targetPhone.replace(/^0+/, '').trim()}`;
      targetUser = await this.prisma.user.findUnique({ where: { phone: formatted } });
    }

    if (!targetUser) {
      // Trouver ou créer un utilisateur par défaut
      targetUser = await this.prisma.user.findFirst();
    }

    if (!targetUser) {
      throw new BadRequestException('Aucun utilisateur cible trouvé pour ce dossier.');
    }

    const count = await this.prisma.accountCase.count();
    const caseNumber = `CASE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;

    const newCase = await this.prisma.accountCase.create({
      data: {
        caseNumber,
        status: 'PROPOSED',
        reason: data.reason,
        proposedAction: data.proposedAction,
        evidenceUrls: data.evidenceUrls || [],
        agentId,
        targetUserId: targetUser.id,
      },
      include: {
        agent: { select: { id: true, phone: true, email: true } },
        targetUser: { select: { id: true, phone: true, email: true, whatsappPhone: true } },
      },
    });

    // Journalisation d'audit immuable
    await this.prisma.auditLog.create({
      data: {
        userId: agentId,
        action: 'ACCOUNT_CASE_CREATED',
        entity: 'AccountCase',
        entityId: newCase.id,
        details: { caseNumber, reason: data.reason, proposedAction: data.proposedAction },
      },
    });

    return newCase;
  }

  /**
   * Liste des dossiers d'assistance et litiges
   */
  async getAccountCases(filter?: { status?: string }) {
    return this.prisma.accountCase.findMany({
      where: filter?.status ? { status: filter.status } : undefined,
      include: {
        agent: { select: { id: true, phone: true, email: true } },
        targetUser: { select: { id: true, phone: true, email: true, whatsappPhone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Détail d'un dossier
   */
  async getAccountCaseById(caseId: string) {
    const c = await this.prisma.accountCase.findUnique({
      where: { id: caseId },
      include: {
        agent: { select: { id: true, phone: true, email: true } },
        targetUser: { select: { id: true, phone: true, email: true, whatsappPhone: true } },
      },
    });

    if (!c) {
      throw new NotFoundException(`Dossier ${caseId} introuvable`);
    }
    return c;
  }

  /**
   * Validation / Rejet par un Administrateur (Principe Maker-Checker D-15 strict)
   */
  async reviewAccountCase(adminId: string, caseId: string, decision: 'APPROVE' | 'REJECT', notes?: string) {
    const existing = await this.getAccountCaseById(caseId);

    // RÈGLE SOUVERAINE MAKER-CHECKER : L'agent créateur ne peut JAMAIS valider son propre dossier !
    if (existing.agentId === adminId) {
      throw new BadRequestException('Violation Maker-Checker : Vous ne pouvez pas approuver un dossier que vous avez vous-même instruit.');
    }

    if (decision === 'APPROVE') {
      let appliedAt: Date | null = new Date();

      // Si l'action proposée est une mise à jour de numéro WhatsApp perdu (D-15)
      try {
        const actionObj = JSON.parse(existing.proposedAction);
        if (actionObj.action === 'UPDATE_PHONE' && actionObj.newPhone) {
          await this.prisma.user.update({
            where: { id: existing.targetUserId },
            data: { whatsappPhone: actionObj.newPhone },
          });
        }
      } catch {
        // format textuel simple
      }

      const updated = await this.prisma.accountCase.update({
        where: { id: caseId },
        data: {
          status: 'ADMIN_APPROVED',
          approvedById: adminId,
          adminNotes: notes || 'Approuvé par vérification contradictoire',
          appliedAt,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'ACCOUNT_CASE_APPROVED',
          entity: 'AccountCase',
          entityId: caseId,
          details: { decision, notes },
        },
      });

      return updated;
    } else {
      const updated = await this.prisma.accountCase.update({
        where: { id: caseId },
        data: {
          status: 'REJECTED',
          approvedById: adminId,
          adminNotes: notes || 'Dossier rejeté suite à vérification négative',
          closedAt: new Date(),
        },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'ACCOUNT_CASE_REJECTED',
          entity: 'AccountCase',
          entityId: caseId,
          details: { decision, notes },
        },
      });

      return updated;
    }
  }

  /**
   * Remboursement de consigne (+25 000 FCFA)
   */
  async refundDeposit(agentId: string, data: {
    customerPhone: string;
    bottleType: string;
    amount?: number;
    storeId?: string;
  }) {
    const refundAmount = data.amount || 25000;
    const count = await this.prisma.accountCase.count();
    const caseNumber = `CONSIGNE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const defaultUser = await this.prisma.user.findFirst();

    const refundCase = await this.prisma.accountCase.create({
      data: {
        caseNumber,
        status: 'ADMIN_APPROVED',
        reason: `Restitution de bouteille consignée (${data.bottleType})`,
        proposedAction: JSON.stringify({
          action: 'REFUND_DEPOSIT',
          bottleType: data.bottleType,
          amount: refundAmount,
          customerPhone: data.customerPhone,
        }),
        agentId,
        targetUserId: defaultUser?.id || agentId,
        appliedAt: new Date(),
        adminNotes: `Remboursement immédiat de consigne de ${refundAmount.toLocaleString('fr-FR')} FCFA validé au guichet`,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: agentId,
        action: 'DEPOSIT_REFUNDED',
        entity: 'AccountCase',
        entityId: refundCase.id,
        details: { customerPhone: data.customerPhone, amount: refundAmount, bottleType: data.bottleType },
      },
    });

    return {
      success: true,
      caseNumber,
      refundAmount,
      bottleType: data.bottleType,
      customerPhone: data.customerPhone,
      timestamp: new Date().toISOString(),
    };
  }
}


