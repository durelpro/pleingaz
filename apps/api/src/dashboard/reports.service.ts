import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as ExcelJS from 'exceljs';

export interface ReportResult {
  reportId: string;
  name: string;
  calculatedAt: string;
  isDemo: boolean;
  filtersApplied: Record<string, any>;
  summary: Record<string, any>;
  data: any[];
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Générateur universel des 15 rapports réels du Control Center (D-03 / CR-001)
   */
  async getReport(reportId: string, filters: Record<string, any> = {}): Promise<ReportResult> {
    const id = reportId.toUpperCase();
    const calculatedAt = new Date().toISOString();

    switch (id) {
      case 'R01':
        return this.getR01VentesEtCA(filters, calculatedAt);
      case 'R02':
        return this.getR02CommandesReseau(filters, calculatedAt);
      case 'R03':
        return this.getR03FinancesEtTresorerie(filters, calculatedAt);
      case 'R04':
        return this.getR04PaiementsEtReconciliation(filters, calculatedAt);
      case 'R05':
        return this.getR05DisponibiliteDesStocks(filters, calculatedAt);
      case 'R06':
        return this.getR06RupturesCritiques(filters, calculatedAt);
      case 'R07':
        return this.getR07ActiviteDistributeurs(filters, calculatedAt);
      case 'R08':
        return this.getR08StocksNonActualises(filters, calculatedAt);
      case 'R09':
        return this.getR09ActiviteLivreurs(filters, calculatedAt);
      case 'R10':
        return this.getR10RecherchesSansResultat(filters, calculatedAt);
      case 'R11':
        return this.getR11DemandeGeographique(filters, calculatedAt);
      case 'R12':
        return this.getR12AvisEtSatisfaction(filters, calculatedAt);
      case 'R13':
        return this.getR13IncidentsEtLitiges(filters, calculatedAt);
      case 'R14':
        return this.getR14AuditTrail(filters, calculatedAt);
      case 'R15':
        return this.getR15SantePlateforme(filters, calculatedAt);
      default:
        throw new NotFoundException(`Rapport inconnu : ${reportId}. Les identifiants valides sont de R01 à R15.`);
    }
  }

  // R01 : Ventes & CA
  private async getR01VentesEtCA(filters: any, calculatedAt: string): Promise<ReportResult> {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        ...(filters.city ? { store: { city: filters.city } } : {}),
      },
      include: { items: { include: { product: true } }, store: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageBasket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    return {
      reportId: 'R01',
      name: 'Ventes & Chiffre d’Affaires',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { totalOrders: orders.length, totalRevenueFCFA: totalRevenue, averageBasketFCFA: averageBasket },
      data: orders.map(o => ({
        orderNumber: o.orderNumber,
        date: o.createdAt,
        amount: o.totalAmount,
        store: o.store?.name,
        city: o.store?.city,
        itemsCount: o.items.length,
      })),
    };
  }

  // R02 : Commandes Réseau
  private async getR02CommandesReseau(filters: any, calculatedAt: string): Promise<ReportResult> {
    const orders = await this.prisma.order.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.city ? { store: { city: filters.city } } : {}),
      },
      include: { store: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      reportId: 'R02',
      name: 'Commandes Réseau PLEINGAZ',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { totalRetrieved: orders.length, breakdownByStatus: byStatus },
      data: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        type: o.type,
        amount: o.totalAmount,
        createdAt: o.createdAt,
      })),
    };
  }

  // R03 : Finances & Trésorerie (Grand Livre D-06)
  private async getR03FinancesEtTresorerie(filters: any, calculatedAt: string): Promise<ReportResult> {
    const entries = await this.prisma.ledgerEntry.findMany({
      include: { account: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalDebits = entries.reduce((s, e) => s + (e.debit || 0), 0);
    const totalCredits = entries.reduce((s, e) => s + (e.credit || 0), 0);

    return {
      reportId: 'R03',
      name: 'Finances & Trésorerie (Grand Livre D-06)',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { totalDebits, totalCredits, balanceStrictZero: totalDebits === totalCredits },
      data: entries.map(e => ({
        id: e.id,
        date: e.createdAt,
        accountNumber: e.account?.code || e.accountId,
        accountName: e.account?.name || 'Compte Comptable',
        debit: e.debit,
        credit: e.credit,
        description: e.description,
      })),
    };
  }

  // R04 : Paiements & Réconciliation
  private async getR04PaiementsEtReconciliation(filters: any, calculatedAt: string): Promise<ReportResult> {
    const payments = await this.prisma.payment.findMany({
      where: {
        ...(filters.method ? { method: filters.method } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalSuccessful = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + (p.amount || 0), 0);

    return {
      reportId: 'R04',
      name: 'Paiements Mobile Money & Réconciliation',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { count: payments.length, totalSuccessfulFCFA: totalSuccessful },
      data: payments.map(p => ({
        id: p.id,
        method: p.method,
        amount: p.amount,
        fee: p.fee,
        status: p.status,
        providerTxId: p.providerTxId,
        createdAt: p.createdAt,
      })),
    };
  }

  // R05 : Disponibilité des Stocks Qualitatifs (D-01 / D-03)
  private async getR05DisponibiliteDesStocks(filters: any, calculatedAt: string): Promise<ReportResult> {
    const inventories = await this.prisma.inventory.findMany({
      include: { product: true, store: true },
    });

    const distribution = {
      BON: inventories.filter(i => i.level === 'BON').length,
      MOYEN: inventories.filter(i => i.level === 'MOYEN').length,
      FAIBLE: inventories.filter(i => i.level === 'FAIBLE').length,
      RUPTURE: inventories.filter(i => i.level === 'RUPTURE').length,
    };

    return {
      reportId: 'R05',
      name: 'Disponibilité Qualitative des Stocks',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { totalInventories: inventories.length, distribution },
      data: inventories.map(i => ({
        store: i.store.name,
        city: i.store.city,
        product: i.product.name,
        level: i.level,
        lastConfirmedAt: i.lastConfirmedAt,
      })),
    };
  }

  // R06 : Ruptures Critiques
  private async getR06RupturesCritiques(filters: any, calculatedAt: string): Promise<ReportResult> {
    const ruptures = await this.prisma.inventory.findMany({
      where: { level: { in: ['RUPTURE', 'FAIBLE'] } },
      include: { store: true, product: true },
    });

    return {
      reportId: 'R06',
      name: 'Ruptures Critiques Réseau',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { count: ruptures.length, alertLevel: ruptures.length > 5 ? 'CRITIQUE' : 'NORMAL' },
      data: ruptures.map(r => ({
        storeName: r.store.name,
        city: r.store.city,
        productName: r.product.name,
        level: r.level,
        lastConfirmedAt: r.lastConfirmedAt,
      })),
    };
  }

  // R07 : Activité Distributeurs
  private async getR07ActiviteDistributeurs(filters: any, calculatedAt: string): Promise<ReportResult> {
    const apps = await this.prisma.distributorApplication.findMany({
      include: { user: true, store: true },
    });

    return {
      reportId: 'R07',
      name: 'Activité Distributeurs & Candidatures KYC',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: {
        total: apps.length,
        approved: apps.filter(a => a.status === 'APPROVED').length,
        pending: apps.filter(a => a.status === 'PENDING').length,
      },
      data: apps.map(a => ({
        id: a.id,
        businessName: a.businessName,
        city: a.city,
        status: a.status,
        createdAt: a.createdAt,
      })),
    };
  }

  // R08 : Stocks Non Actualisés
  private async getR08StocksNonActualises(filters: any, calculatedAt: string): Promise<ReportResult> {
    const thresholdHours = Number(filters.hours || 48);
    const thresholdDate = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

    const outdated = await this.prisma.inventory.findMany({
      where: { lastConfirmedAt: { lt: thresholdDate } },
      include: { store: true, product: true },
    });

    return {
      reportId: 'R08',
      name: `Stocks Non Actualisés (> ${thresholdHours}h)`,
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { count: outdated.length, thresholdHours },
      data: outdated.map(o => ({
        store: o.store.name,
        product: o.product.name,
        level: o.level,
        lastConfirmedAt: o.lastConfirmedAt,
      })),
    };
  }

  // R09 : Activité Livreurs
  private async getR09ActiviteLivreurs(filters: any, calculatedAt: string): Promise<ReportResult> {
    const deliveries = await this.prisma.delivery.findMany({
      include: { courier: true, order: true },
      take: 100,
    });

    const couriers = await this.prisma.courier.findMany();

    return {
      reportId: 'R09',
      name: 'Activité Livreurs Tiers & Gestion du Cash (D-05)',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: {
        activeCouriers: couriers.length,
        totalDeliveries: deliveries.length,
        blockedForCashThreshold: couriers.filter(c => (c.cashBalance || 0) >= 50000).length,
      },
      data: couriers.map(c => ({
        courierId: c.id,
        cashBalanceFCFA: c.cashBalance,
        isBlocked: (c.cashBalance || 0) >= 50000,
      })),
    };
  }

  // R10 : Recherches sans Résultat
  private async getR10RecherchesSansResultat(filters: any, calculatedAt: string): Promise<ReportResult> {
    const events = await this.prisma.demandAlert.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    return {
      reportId: 'R10',
      name: 'Recherches sans Résultat & Demande Non Satisfaite',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { unfulfilledSearchesCount: events.length },
      data: events.map(e => ({
        id: e.id,
        city: e.city,
        neighborhood: e.neighborhood,
        createdAt: e.createdAt,
      })),
    };
  }

  // R11 : Demande Géographique
  private async getR11DemandeGeographique(filters: any, calculatedAt: string): Promise<ReportResult> {
    const orders = await this.prisma.order.findMany({
      include: { store: true },
    });

    const cityStats: Record<string, number> = {};
    orders.forEach(o => {
      const city = o.store?.city || 'Non renseigné';
      cityStats[city] = (cityStats[city] || 0) + 1;
    });

    return {
      reportId: 'R11',
      name: 'Demande Géographique Consolidée',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { ordersByCity: cityStats },
      data: Object.entries(cityStats).map(([city, count]) => ({ city, count })),
    };
  }

  // R12 : Avis & Satisfaction
  private async getR12AvisEtSatisfaction(filters: any, calculatedAt: string): Promise<ReportResult> {
    const stores = await this.prisma.store.findMany({
      select: { id: true, name: true, city: true, reliabilityScore: true },
    });

    return {
      reportId: 'R12',
      name: 'Scores de Fiabilité & Satisfaction',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { count: stores.length },
      data: stores.map(s => ({
        store: s.name,
        city: s.city,
        reliabilityScore: s.reliabilityScore,
      })),
    };
  }

  // R13 : Incidents & Litiges
  private async getR13IncidentsEtLitiges(filters: any, calculatedAt: string): Promise<ReportResult> {
    const reports = await this.prisma.report.findMany({
      include: { store: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      reportId: 'R13',
      name: 'Incidents & Signalements Réseau',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: {
        totalIncidents: reports.length,
        unresolved: reports.filter(r => !r.isResolved).length,
      },
      data: reports.map(r => ({
        id: r.id,
        store: r.store.name,
        reason: r.reason,
        details: r.details,
        isResolved: r.isResolved,
        createdAt: r.createdAt,
      })),
    };
  }

  // R14 : Pistes d'Audit Trail
  private async getR14AuditTrail(filters: any, calculatedAt: string): Promise<ReportResult> {
    const logs = await this.prisma.auditLog.findMany({
      take: 200,
      orderBy: { createdAt: 'desc' },
    });

    return {
      reportId: 'R14',
      name: 'Journal d’Audit Trail Immuable',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: { count: logs.length },
      data: logs.map(l => ({
        id: l.id,
        action: l.action,
        userId: l.userId,
        entity: l.entity,
        createdAt: l.createdAt,
      })),
    };
  }

  // R15 : Santé de la Plateforme
  private async getR15SantePlateforme(filters: any, calculatedAt: string): Promise<ReportResult> {
    const totalUsers = await this.prisma.user.count();
    const totalOrders = await this.prisma.order.count();
    const totalStores = await this.prisma.store.count();

    return {
      reportId: 'R15',
      name: 'Santé & Métriques Système de la Plateforme',
      calculatedAt,
      isDemo: false,
      filtersApplied: filters,
      summary: {
        status: 'HEALTHY',
        database: 'CONNECTED',
        usersCount: totalUsers,
        ordersCount: totalOrders,
        storesCount: totalStores,
      },
      data: [
        { metric: 'Database Status', value: 'Connected (PostgreSQL)' },
        { metric: 'Total Registered Users', value: totalUsers },
        { metric: 'Total Processed Orders', value: totalOrders },
        { metric: 'Total Active Stores', value: totalStores },
      ],
    };
  }

  /**
   * Export universel (CSV ou Excel) avec consignation dans AuditLog
   */
  async exportReport(
    userId: string,
    reportId: string,
    format: 'CSV' | 'EXCEL',
    filters: Record<string, any> = {},
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const report = await this.getReport(reportId, filters);

    // Enregistrement infalsifiable dans AuditLog (CR-001)
    await this.auditService.log({
      action: 'REPORT_EXPORTED',
      userId,
      entity: 'Report',
      entityId: reportId,
      details: { format, filters, itemsExported: report.data.length },
    });

    if (format === 'CSV') {
      const csvContent = this.generateCsv(report);
      return {
        buffer: Buffer.from(csvContent, 'utf-8'),
        filename: `rapport_${reportId.toLowerCase()}_${Date.now()}.csv`,
        contentType: 'text/csv',
      };
    } else {
      const buffer = await this.generateExcel(report);
      return {
        buffer,
        filename: `rapport_${reportId.toLowerCase()}_${Date.now()}.xlsx`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
  }

  private generateCsv(report: ReportResult): string {
    if (report.data.length === 0) {
      return `Rapport ${report.reportId} - ${report.name}\nCalculé le ${report.calculatedAt}\nAucune donnée enregistrée.`;
    }
    const headers = Object.keys(report.data[0]);
    const rows = report.data.map(row =>
      headers
        .map(h => {
          const val = row[h];
          return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val ?? '';
        })
        .join(','),
    );
    return [headers.join(','), ...rows].join('\n');
  }

  private async generateExcel(report: ReportResult): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(report.name.slice(0, 31));

    if (report.data.length > 0) {
      const headers = Object.keys(report.data[0]);
      sheet.columns = headers.map(h => ({ header: h, key: h, width: 25 }));
      report.data.forEach(item => sheet.addRow(item));
    } else {
      sheet.addRow(['Aucune donnée enregistrée pour les filtres appliqués']);
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
