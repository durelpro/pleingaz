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

  async getDashboardMetrics(city?: string) {
    // 1. Risque de Rupture (Boutiques avec au moins un produit en OUT_OF_STOCK)
    const storeWhere: any = {};
    if (city && city !== 'all') {
      storeWhere.city = { equals: city, mode: 'insensitive' };
    }

    const outOfStockStores = await this.prisma.store.findMany({
      where: {
        ...storeWhere,
        inventories: {
          some: { level: 'OUT_OF_STOCK' }
        }
      },
      select: { id: true, name: true, city: true, neighborhood: true }
    });

    // 2. Fiabilité Moyenne
    const storesAgg = await this.prisma.store.aggregate({
      where: storeWhere,
      _avg: { reliabilityScore: true }
    });
    const avgReliability = storesAgg._avg.reliabilityScore ? Math.round(storesAgg._avg.reliabilityScore) : 100;

    // 3. Dossiers en attente
    const pendingDocsCount = await this.prisma.distributorApplication.count({
      where: { status: 'PENDING' }
    });

    // 4. Liste des villes disponibles pour le filtre
    const storesCities = await this.prisma.store.findMany({
      select: { city: true },
      distinct: ['city']
    });
    const cities = storesCities.map(s => s.city).filter(Boolean);

    return {
      outOfStockCount: outOfStockStores.length,
      outOfStockStores: outOfStockStores,
      averageReliability: avgReliability,
      pendingDocsCount: pendingDocsCount,
      cities,
    };
  }

  async getSalesStats(timeframe: string, city?: string) {
    const result = [];
    const orderWhereExtra: any = {};
    if (city && city !== 'all') {
      orderWhereExtra.store = { city: { equals: city, mode: 'insensitive' } };
    }

    if (timeframe === 'jour') {
      // Les 24 dernières heures, regroupées par intervalles de 4h
      for (let i = 20; i >= 0; i -= 4) {
        const start = new Date();
        start.setHours(start.getHours() - i - 4, 0, 0, 0);
        const end = new Date(start);
        end.setHours(end.getHours() + 4);

        const orders = await this.prisma.order.findMany({
          where: {
            createdAt: { gte: start, lt: end },
            status: { in: ['DELIVERED', 'CONFIRMED'] },
            ...orderWhereExtra
          },
          select: { totalAmount: true }
        });
        
        const ruptures = await this.prisma.searchEvent.count({
          where: { createdAt: { gte: start, lt: end }, resultsCount: 0 }
        });

        result.push({
          name: `${start.getHours()}h`,
          ventes: orders.reduce((sum, o) => sum + o.totalAmount, 0),
          ruptures
        });
      }
    } else if (timeframe === 'mois') {
      // Les 4 dernières semaines
      for (let i = 3; i >= 0; i--) {
        const end = new Date();
        end.setDate(end.getDate() - (i * 7));
        const start = new Date(end);
        start.setDate(start.getDate() - 7);

        const orders = await this.prisma.order.findMany({
          where: {
            createdAt: { gte: start, lt: end },
            status: { in: ['DELIVERED', 'CONFIRMED'] },
            ...orderWhereExtra
          },
          select: { totalAmount: true }
        });

        const ruptures = await this.prisma.searchEvent.count({
          where: { createdAt: { gte: start, lt: end }, resultsCount: 0 }
        });

        result.push({
          name: `S-${i+1}`,
          ventes: orders.reduce((sum, o) => sum + o.totalAmount, 0),
          ruptures
        });
      }
    } else {
      // "semaine" par défaut : les 7 derniers jours
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);

        const orders = await this.prisma.order.findMany({
          where: {
            createdAt: { gte: d, lt: nextDay },
            status: { in: ['DELIVERED', 'CONFIRMED'] },
            ...orderWhereExtra
          },
          select: { totalAmount: true }
        });
        
        const ruptures = await this.prisma.searchEvent.count({
          where: { createdAt: { gte: d, lt: nextDay }, resultsCount: 0 }
        });

        result.push({
          name: dayNames[d.getDay()],
          ventes: orders.reduce((sum, o) => sum + o.totalAmount, 0),
          ruptures
        });
      }
    }

    return result;
  }

  async getDistributorRankings(city?: string) {
    const storeWhere: any = {};
    if (city && city !== 'all') {
      storeWhere.city = { equals: city, mode: 'insensitive' };
    }

    const stores = await this.prisma.store.findMany({
      where: storeWhere,
      include: {
        inventories: true,
        orders: { select: { status: true } },
      },
      orderBy: { reliabilityScore: 'desc' },
      take: 20,
    });

    return stores.map(s => {
      const totalInv = s.inventories.length;
      const outOfStock = s.inventories.filter(i => i.level === 'OUT_OF_STOCK').length;
      const ruptureRate = totalInv > 0 ? `${Math.round((outOfStock / totalInv) * 100)}%` : '0%';

      let parsedBadges: string[] = [];
      try {
        if (s.badges) parsedBadges = JSON.parse(s.badges);
      } catch {
        parsedBadges = [];
      }

      return {
        id: s.id,
        name: s.name,
        city: s.city,
        neighborhood: s.neighborhood,
        score: s.reliabilityScore || 80,
        badges: Array.isArray(parsedBadges) ? parsedBadges : [],
        rupture: ruptureRate,
        totalOrders: s.orders.length,
      };
    });
  }

  async exportOrdersCsv(city?: string, timeframe?: string): Promise<string> {
    const where: any = {};
    if (city && city !== 'all') {
      where.store = { city: { equals: city, mode: 'insensitive' } };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: { customer: true, store: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const header = 'Numero_Commande;Date;Client_Telephone;Boutique;Ville;Quartier;Montant_FCFA;Statut;Methode_Paiement\n';
    const rows = orders.map(o => {
      const d = o.createdAt.toISOString();
      const phone = o.customer?.phone || '';
      const storeName = (o.store?.name || 'Central').replace(/;/g, ' ');
      const c = (o.store?.city || '').replace(/;/g, ' ');
      const n = (o.store?.neighborhood || '').replace(/;/g, ' ');
      return `${o.orderNumber};${d};${phone};${storeName};${c};${n};${o.totalAmount};${o.status};${o.paymentMethod}`;
    }).join('\n');

    return header + rows;
  }

  async exportStoresCsv(city?: string): Promise<string> {
    const where: any = {};
    if (city && city !== 'all') {
      where.city = { equals: city, mode: 'insensitive' };
    }

    const stores = await this.prisma.store.findMany({
      where,
      include: {
        inventories: { include: { product: true } },
      },
      orderBy: { name: 'asc' },
    });

    const header = 'Nom_Boutique;Ville;Quartier;Score_Fiabilite;Visible;Total_Produits;Produits_En_Rupture\n';
    const rows = stores.map(s => {
      const name = s.name.replace(/;/g, ' ');
      const c = s.city.replace(/;/g, ' ');
      const n = s.neighborhood.replace(/;/g, ' ');
      const total = s.inventories.length;
      const ruptures = s.inventories.filter(i => i.level === 'OUT_OF_STOCK').length;
      return `${name};${c};${n};${s.reliabilityScore || 0};${s.isVisible ? 'OUI' : 'NON'};${total};${ruptures}`;
    }).join('\n');

    return header + rows;
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
