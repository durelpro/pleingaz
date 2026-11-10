import { Test, TestingModule } from '@nestjs/testing';
import { CounterSalesService } from './counter-sales.service';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../payments/ledger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CounterSalesService', () => {
  let service: CounterSalesService;
  let prisma: any;
  let ledgerService: any;

  beforeEach(async () => {
    prisma = {
      counterSale: {
        findMany: jest.fn(),
        create: jest.fn(),
        aggregate: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
      },
      store: {
        findUnique: jest.fn(),
      },
    };

    ledgerService = {
      recordDoubleEntry: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CounterSalesService,
        { provide: PrismaService, useValue: prisma },
        { provide: LedgerService, useValue: ledgerService },
      ],
    }).compile();

    service = module.get<CounterSalesService>(CounterSalesService);
  });

  describe('checkBuyerQuota (D-14, D-16)', () => {
    it('devrait autoriser l’achat si la consommation sur 30 jours est inférieure à 5 bouteilles', async () => {
      prisma.counterSale.findMany.mockResolvedValue([
        { bottleCount: 2, createdAt: new Date() },
      ]);
      prisma.user.findFirst.mockResolvedValue(null);

      const quota = await service.checkBuyerQuota('+237699112233', 1);

      expect(quota.allowed).toBe(true);
      expect(quota.usedCount).toBe(2);
      expect(quota.remainingCount).toBe(3);
      expect(quota.limit).toBe(5);
    });

    it('devrait bloquer strictement l’achat si le client a déjà consommé ses 5 bouteilles sur 30 jours', async () => {
      prisma.counterSale.findMany.mockResolvedValue([
        { bottleCount: 3, createdAt: new Date() },
        { bottleCount: 2, createdAt: new Date() },
      ]);
      prisma.user.findFirst.mockResolvedValue(null);

      const quota = await service.checkBuyerQuota('+237699112233', 1);

      expect(quota.allowed).toBe(false);
      expect(quota.usedCount).toBe(5);
      expect(quota.remainingCount).toBe(0);
    });
  });

  describe('createCounterSale', () => {
    it('devrait rejeter immédiatement la vente au comptoir si le quota est dépassé', async () => {
      prisma.store.findUnique.mockResolvedValue({ id: 'store-1', name: 'Dépôt Akwa' });
      prisma.counterSale.findMany.mockResolvedValue([
        { bottleCount: 5, createdAt: new Date() },
      ]);
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.createCounterSale({
          storeId: 'store-1',
          customerPhone: '+237699112233',
          bottleCount: 1,
          totalAmount: 6500,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait enregistrer la vente au comptoir et inscrire l’écriture au Grand Livre si le quota est valide', async () => {
      prisma.store.findUnique.mockResolvedValue({ id: 'store-1', name: 'Dépôt Akwa' });
      prisma.counterSale.findMany.mockResolvedValue([]);
      prisma.user.findFirst.mockResolvedValue(null);

      prisma.counterSale.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'cs-1',
          ...args.data,
        })
      );

      const res = await service.createCounterSale({
        storeId: 'store-1',
        customerPhone: '699112233',
        bottleCount: 1,
        totalAmount: 6500,
        paymentMethod: 'CASH',
      });

      expect(res.sale.receiptNumber).toMatch(/^RCP-CS-/);
      expect(res.sale.customerPhone).toBe('+237699112233');
      expect(res.quota.usedCount).toBe(1);
      expect(res.quota.remainingCount).toBe(4);
      expect(ledgerService.recordDoubleEntry).toHaveBeenCalled();
    });
  });
});
