import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tâche 9.1: Insights actionnables
   */
  async getInsights() {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    // Distributeurs inactifs
    const inactiveStores = await this.prisma.store.count({
      where: {
        updatedAt: { lt: fortyEightHoursAgo }
      }
    });

    // Risque de rupture (Tâche 9.3: algorithme basique)
    const outOfStockStores = await this.prisma.inventory.count({
      where: { quantity: { lte: 0 } }
    });

    return [
      {
        id: '1',
        title: 'Mises à jour Distributeurs',
        description: \`\${inactiveStores} distributeurs sans mise à jour depuis 48 h\`,
        level: inactiveStores > 10 ? 'HIGH' : 'LOW'
      },
      {
        id: '2',
        title: 'Risque de Rupture',
        description: \`\${outOfStockStores} stocks actuellement épuisés dans le réseau\`,
        level: outOfStockStores > 5 ? 'HIGH' : 'MEDIUM'
      }
    ];
  }

  /**
   * Statistiques Globales (Filtres à venir)
   */
  async getMetrics(filters: { timeframe?: string }) {
    // Dans une implémentation complète, 'timeframe' (jour, semaine, mois) filtrerait les dates.
    const totalOrders = await this.prisma.order.count();
    
    const revenueQuery = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'DELIVERED' }
    });
    
    const activeStores = await this.prisma.store.count({ where: { isActive: true } });

    return {
      totalOrders,
      totalRevenue: revenueQuery._sum.totalAmount || 0,
      activeStores,
      averageReliabilityScore: 92 // Mock, devrait être moyenné
    };
  }

  /**
   * Tâche 9.2: Heatmap Events
   */
  async getHeatmapData() {
    // Retourne les zones avec le plus de demandes non satisfaites
    return this.prisma.heatmapEvent.findMany({
      take: 1000,
      orderBy: { createdAt: 'desc' }
    });
  }
}
