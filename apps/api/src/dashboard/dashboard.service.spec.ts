import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService (Agrégations Réelles & Fiabilité D-03)', () => {
  let service: DashboardService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      store: {
        count: jest.fn(),
        aggregate: jest.fn(),
        update: jest.fn(),
      },
      inventory: {
        findMany: jest.fn(),
      },
      order: {
        count: jest.fn(),
        aggregate: jest.fn(),
        findMany: jest.fn(),
      },
      heatmapEvent: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getMetrics', () => {
    it('devrait agréger les métriques réelles (chiffre d’affaires, commandes et score moyen de fiabilité)', async () => {
      prisma.order.count.mockResolvedValue(42);
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 420000 } });
      prisma.store.count.mockResolvedValue(15);
      prisma.store.aggregate.mockResolvedValue({ _avg: { reliabilityScore: 96.4 } });

      const metrics = await service.getMetrics({ city: 'Douala' });

      expect(metrics.totalOrders).toBe(42);
      expect(metrics.totalRevenue).toBe(420000);
      expect(metrics.activeStores).toBe(15);
      expect(metrics.averageReliabilityScore).toBe(96);
    });
  });

  describe('updateStoreReliabilityScore', () => {
    it('devrait calculer le score en pénalisant les annulations et attribuer les badges mérités', async () => {
      prisma.order.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(5); // cancelled (5%)

      prisma.store.update.mockResolvedValue({ id: 'store-1', reliabilityScore: 98 });

      const res = await service.updateStoreReliabilityScore('store-1');

      // 100 - (5/100 * 50) = 100 - 2.5 = 98 (arrondi)
      expect(res.score).toBe(98);
      expect(res.badges).toContain('TOP_SELLER');
      expect(res.badges).toContain('RELIABLE');
      expect(prisma.store.update).toHaveBeenCalledWith({
        where: { id: 'store-1' },
        data: { reliabilityScore: 98, badges: JSON.stringify(['TOP_SELLER', 'RELIABLE']) },
      });
    });
  });

  describe('getInsights', () => {
    it('devrait identifier les distributeurs inactifs et les stocks critiques', async () => {
      prisma.store.count.mockResolvedValue(3);
      prisma.inventory.findMany.mockResolvedValue([
        { id: 'inv-1', level: 'RUPTURE' },
        { id: 'inv-2', level: 'FAIBLE' },
      ]);

      const insights = await service.getInsights();
      expect(insights).toHaveLength(2);
      expect(insights[0].title).toBe('Mises à jour Distributeurs');
      expect(insights[1].title).toBe('Risque de Rupture Éminent');
    });
  });
});
