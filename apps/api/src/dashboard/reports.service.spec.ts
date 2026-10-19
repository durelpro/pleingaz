import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotFoundException } from '@nestjs/common';

describe('ReportsService (15 Rapports Réels du Control Center & Exports Audités D-03)', () => {
  let service: ReportsService;
  let prisma: any;
  let auditService: any;

  beforeEach(async () => {
    prisma = {
      order: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
      ledgerEntry: { findMany: jest.fn().mockResolvedValue([]) },
      payment: { findMany: jest.fn().mockResolvedValue([]) },
      inventory: { findMany: jest.fn().mockResolvedValue([]) },
      store: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
      distributorApplication: { findMany: jest.fn().mockResolvedValue([]) },
      delivery: { findMany: jest.fn().mockResolvedValue([]) },
      courier: { findMany: jest.fn().mockResolvedValue([]) },
      demandAlert: { findMany: jest.fn().mockResolvedValue([]) },
      report: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: { findMany: jest.fn().mockResolvedValue([]) },
      user: { count: jest.fn().mockResolvedValue(0) },
    };

    auditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  describe('getReport (Exhaustivité R01 à R15)', () => {
    it('devrait générer le rapport R01 (Ventes & CA) avec calculs réels et isDemo: false', async () => {
      prisma.order.findMany.mockResolvedValue([
        {
          orderNumber: 'CMD-001',
          totalAmount: 15000,
          status: 'DELIVERED',
          createdAt: new Date(),
          items: [{ product: { name: 'Gaz 12.5kg' } }],
          store: { name: 'Dépôt Akwa', city: 'Douala' },
        },
      ]);

      const res = await service.getReport('R01', { city: 'Douala' });

      expect(res.reportId).toBe('R01');
      expect(res.isDemo).toBe(false);
      expect(res.summary.totalRevenueFCFA).toBe(15000);
      expect(res.summary.averageBasketFCFA).toBe(15000);
      expect(res.data).toHaveLength(1);
    });

    it('devrait générer le rapport R03 (Finances & Grand Livre D-06)', async () => {
      prisma.ledgerEntry.findMany.mockResolvedValue([
        { id: '1', accountNumber: '1010', debit: 50000, credit: 0, description: 'MoMo', createdAt: new Date() },
        { id: '2', accountNumber: '4011', debit: 0, credit: 50000, description: 'Dette', createdAt: new Date() },
      ]);

      const res = await service.getReport('R03');
      expect(res.reportId).toBe('R03');
      expect(res.summary.balanceStrictZero).toBe(true);
      expect(res.summary.totalDebits).toBe(50000);
      expect(res.summary.totalCredits).toBe(50000);
    });

    it('devrait supporter l’ensemble des identifiants valides de R01 à R15', async () => {
      const reports = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15'];
      for (const repId of reports) {
        const res = await service.getReport(repId);
        expect(res.reportId).toBe(repId);
        expect(res.isDemo).toBe(false);
        expect(res.calculatedAt).toBeDefined();
      }
    });

    it('devrait rejeter un identifiant inconnu avec NotFoundException', async () => {
      await expect(service.getReport('R99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportReport (Audit Trail obligatoire)', () => {
    it('devrait exporter en CSV et enregistrer une trace audit trail immuable', async () => {
      prisma.order.findMany.mockResolvedValue([
        { orderNumber: 'CMD-1', totalAmount: 10000, createdAt: new Date(), items: [], store: { name: 'Store A', city: 'Yaoundé' } },
      ]);

      const exportResult = await service.exportReport('admin-123', 'R01', 'CSV');

      expect(exportResult.contentType).toBe('text/csv');
      expect(exportResult.filename).toContain('rapport_r01_');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REPORT_EXPORTED',
          userId: 'admin-123',
          entity: 'Report',
          entityId: 'R01',
          details: expect.objectContaining({ format: 'CSV' }),
        }),
      );
    });

    it('devrait exporter en Excel avec format binaire valide et audit', async () => {
      const exportResult = await service.exportReport('admin-123', 'R05', 'EXCEL');

      expect(exportResult.contentType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(exportResult.buffer).toBeInstanceOf(Buffer);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REPORT_EXPORTED', entityId: 'R05' }),
      );
    });
  });
});
