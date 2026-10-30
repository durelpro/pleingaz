import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Cr003Service } from './cr003.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Cr003Service - Tests Souverains D-11 à D-18', () => {
  let service: Cr003Service;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      findMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    counterSale: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    store: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    inventory: {
      update: jest.fn(),
    },
    infoNotice: {
      findMany: jest.fn(),
    },
    infoNoticeRead: {
      upsert: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Cr003Service,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<Cr003Service>(Cr003Service);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('D-14: Plafond souverain 5 bouteilles / 30 jours', () => {
    it('doit autoriser un acheteur sans historique (5 bouteilles restantes)', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1', phone: '+237699123456' });
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.counterSale.findMany.mockResolvedValue([]);

      const quota = await service.getBuyerQuota('+237699123456');

      expect(quota.consumed).toBe(0);
      expect(quota.remaining).toBe(5);
      expect(quota.allowed).toBe(true);
      expect(quota.limit).toBe(5);
      expect(quota.windowDays).toBe(30);
    });

    it('doit additionner commandes livrées et ventes au comptoir sur les 30 derniers jours', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1', phone: '+237699123456' });
      mockPrisma.order.findMany.mockResolvedValue([
        { items: [{ quantity: 2 }] },
      ]);
      mockPrisma.counterSale.findMany.mockResolvedValue([
        { quantity: 1 },
      ]);

      const quota = await service.getBuyerQuota('+237699123456');

      expect(quota.consumed).toBe(3);
      expect(quota.remaining).toBe(2);
      expect(quota.allowed).toBe(true);
    });

    it('doit indiquer remaining = 0 et allowed = false si quota >= 5', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1', phone: '+237699123456' });
      mockPrisma.order.findMany.mockResolvedValue([
        { items: [{ quantity: 3 }] },
      ]);
      mockPrisma.counterSale.findMany.mockResolvedValue([
        { quantity: 2 },
      ]);

      const quota = await service.getBuyerQuota('+237699123456');

      expect(quota.consumed).toBe(5);
      expect(quota.remaining).toBe(0);
      expect(quota.allowed).toBe(false);
    });
  });

  describe('D-16: Vente directe au Comptoir et contrôle pré-vente', () => {
    it('doit rejeter la vente avec QUOTA_EXCEEDED si le volume demandé dépasse le plafond', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1', phone: '+237699123456' });
      mockPrisma.order.findMany.mockResolvedValue([
        { items: [{ quantity: 4 }] },
      ]);
      mockPrisma.counterSale.findMany.mockResolvedValue([]);

      // 4 déjà consommées, demande de 2 -> 6 > 5 -> REJET
      await expect(
        service.createCounterSale({
          buyerPhone: '+237699123456',
          bottleType: '12.5kg',
          quantity: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('doit enregistrer la vente avec succès, reçu fiscal et nouveau quota si dans la limite', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1', phone: '+237699123456' });
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.counterSale.findMany.mockResolvedValue([]);
      mockPrisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        ownerId: 'owner-1',
      });
      mockPrisma.counterSale.create.mockImplementation((args: any) => Promise.resolve({
        id: 'sale-1',
        ...args.data,
      }));

      const res = await service.createCounterSale({
        buyerPhone: '+237699123456',
        bottleType: '12.5kg',
        quantity: 1,
        totalAmount: 6500,
        paymentMethod: 'CASH',
      });

      expect(res.success).toBe(true);
      expect(res.sale.receiptNumber).toMatch(/^CS-\d+/);
      expect(res.sale.amountTotal).toBe(6500);
      expect(res.sale.quotaValidated).toBe(true);
      expect(res.newQuota.consumed).toBe(1);
      expect(res.newQuota.remaining).toBe(4);
    });
  });

  describe('D-18: Accusé de lecture des InfoNotices', () => {
    it('doit enregistrer l accusé de lecture pour l utilisateur ciblé', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1', phone: '+237699123456' });
      mockPrisma.infoNoticeRead.upsert.mockResolvedValue({
        id: 'read-1',
        noticeId: 'notice-1',
        userId: 'user-1',
        readAt: new Date(),
      });

      const res = await service.ackNotice('notice-1', '+237699123456');

      expect(res.success).toBe(true);
      expect(mockPrisma.infoNoticeRead.upsert).toHaveBeenCalledWith({
        where: {
          noticeId_userId: {
            noticeId: 'notice-1',
            userId: 'user-1',
          },
        },
        create: {
          noticeId: 'notice-1',
          userId: 'user-1',
        },
        update: {
          readAt: expect.any(Date),
        },
      });
    });
  });
});
