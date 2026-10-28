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
}
