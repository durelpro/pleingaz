import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    // Basic KPIs for MVP
    const totalOrders = await this.prisma.order.count();
    const deliveredOrders = await this.prisma.order.count({ where: { status: 'DELIVERED' } });
    
    const stores = await this.prisma.store.count();
    
    // Total revenue (delivered orders only)
    const orders = await this.prisma.order.findMany({
      where: { status: 'DELIVERED' },
      select: { totalAmount: true }
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalOrders,
      deliveredOrders,
      deliveryRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
      activeStores: stores,
      totalRevenue,
    };
  }

  async getDashboardMetrics() {
    // 1. Risque de Rupture (Boutiques avec au moins un produit en OUT_OF_STOCK)
    const outOfStockStores = await this.prisma.store.findMany({
      where: {
        inventories: {
          some: { level: 'OUT_OF_STOCK' }
        }
      },
      select: { name: true, neighborhood: true }
    });

    // 2. Fiabilité Moyenne
    const storesAgg = await this.prisma.store.aggregate({
      _avg: { reliabilityScore: true }
    });
    const avgReliability = storesAgg._avg.reliabilityScore ? Math.round(storesAgg._avg.reliabilityScore) : 100;

    // 3. Dossiers en attente
    const pendingDocsCount = await this.prisma.distributorApplication.count({
      where: { status: 'PENDING' }
    });

    return {
      outOfStockCount: outOfStockStores.length,
      outOfStockStores: outOfStockStores,
      averageReliability: avgReliability,
      pendingDocsCount: pendingDocsCount,
    };
  }

  async getSalesStats(timeframe: string) {
    const days = 7; // Pour simplifier on retourne toujours les 7 derniers jours ou on adapte selon timeframe
    
    // Noms de jours en français
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const result = [];
    
    // On construit le tableau pour les 7 derniers jours
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      // Total des ventes de ce jour
      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: {
            gte: d,
            lt: nextDay
          },
          status: { in: ['DELIVERED', 'CONFIRMED'] }
        },
        select: { totalAmount: true }
      });
      
      const totalVentes = orders.reduce((sum, o) => sum + o.totalAmount, 0);

      // Simuler les ruptures ou compter les searchEvents sans résultat ? 
      // Pour être réaliste, on compte les SearchEvents avec resultsCount = 0 ce jour-là
      const ruptures = await this.prisma.searchEvent.count({
        where: {
          createdAt: {
            gte: d,
            lt: nextDay
          },
          resultsCount: 0
        }
      });

      result.push({
        name: dayNames[d.getDay()],
        ventes: totalVentes,
        ruptures: ruptures
      });
    }

    return result;
  }

  async getAuditLogs(limit: number = 50): Promise<any> {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { phone: true }
        }
      }
    });
  }
}
