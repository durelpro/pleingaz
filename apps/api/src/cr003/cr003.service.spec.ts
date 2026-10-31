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
      findUnique: jest.fn(),
      update: jest.fn(),
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
    accountCase: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    auditLog: {
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

  describe('D-16: Visibilité totale de TOUTES les transactions Admin', () => {
    it('doit agréger les commandes en ligne et les ventes directes au comptoir', async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: 'ord-1',
          orderNumber: 'ORD-101',
          totalAmount: 7500,
          paymentMethod: 'MOMO',
          status: 'DELIVERED',
          createdAt: new Date('2026-10-30T10:00:00Z'),
          customer: { phone: '+237699111222', customerProfile: { firstName: 'Jean', lastName: 'Kamga' } },
          store: { name: 'Dépôt Akwa Nord', city: 'Douala', neighborhood: 'Akwa' },
          items: [{ quantity: 1, product: { name: 'Bouteille 12.5 kg PLEINGAZ' } }],
          delivery: { id: 'del-1' },
        },
      ]);

      mockPrisma.counterSale.findMany.mockResolvedValue([
        {
          id: 'cs-1',
          receiptNumber: 'CS-505',
          bottleType: 'Bouteille 12.5 kg PLEINGAZ',
          quantity: 2,
          amountTotal: 13000,
          paymentMethod: 'CASH',
          quotaValidated: true,
          customerPhone: '+237677333444',
          createdAt: new Date('2026-10-30T11:00:00Z'),
          store: { name: 'Dépôt Akwa Nord', city: 'Douala', neighborhood: 'Akwa' },
          customerUser: null,
        },
      ]);

      const txs = await service.getAllTransactions();

      expect(txs.length).toBe(2);
      expect(txs[0].reference).toBe('CS-505'); // Le plus récent
      expect(txs[0].type).toBe('COUNTER');
      expect(txs[0].location).toContain('Douala');
      expect(txs[1].reference).toBe('ORD-101');
      expect(txs[1].type).toBe('ONLINE');
    });

    it('doit calculer les métriques globales administratives', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.counterSale.findMany.mockResolvedValue([]);

      const stats = await service.getAdminStats();

      expect(stats.totalVolume).toBe(0);
      expect(stats.totalRevenue).toBe(0);
      expect(stats.deliveryFees).toBe(0);
    });
  });

  describe('D-15 & C-07: Gestion des Litiges, Dossiers AccountCase & Maker-Checker', () => {
    it('doit créer un dossier AccountCase en statut PROPOSED avec caseNumber formaté', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({ id: 'target-1', phone: '+237699112233' });
      mockPrisma.accountCase.count.mockResolvedValue(4);
      mockPrisma.accountCase.create.mockImplementation((args: any) => ({
        id: 'case-101',
        ...args.data,
      }));

      const res = await service.createAccountCase('agent-mgr-1', {
        targetPhone: '+237699112233',
        reason: 'Perte de carte SIM et demande de mise à jour WhatsApp',
        proposedAction: JSON.stringify({ action: 'UPDATE_PHONE', newPhone: '+237677998877' }),
      });

      expect(res.status).toBe('PROPOSED');
      expect(res.caseNumber).toContain('CASE-');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('doit STRICTEMENT rejeter l’approbation si l’admin est le créateur du dossier (Maker-Checker D-15)', async () => {
      mockPrisma.accountCase.findUnique.mockResolvedValue({
        id: 'case-101',
        agentId: 'same-user-id',
        status: 'PROPOSED',
      });

      await expect(
        service.reviewAccountCase('same-user-id', 'case-101', 'APPROVE')
      ).rejects.toThrow(BadRequestException);
    });

    it('doit approuver le dossier si l’admin est distinct et appliquer la mise à jour (D-15)', async () => {
      mockPrisma.accountCase.findUnique.mockResolvedValue({
        id: 'case-101',
        agentId: 'agent-1',
        targetUserId: 'user-client-1',
        status: 'PROPOSED',
        proposedAction: JSON.stringify({ action: 'UPDATE_PHONE', newPhone: '+237677998877' }),
      });
      mockPrisma.user.update = jest.fn().mockResolvedValue({ id: 'user-client-1' });
      mockPrisma.accountCase.update.mockResolvedValue({
        id: 'case-101',
        status: 'ADMIN_APPROVED',
        approvedById: 'distinct-admin-2',
      });

      const res = await service.reviewAccountCase('distinct-admin-2', 'case-101', 'APPROVE', 'Identité validée');
      expect(res.status).toBe('ADMIN_APPROVED');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-client-1' },
          data: { whatsappPhone: '+237677998877' },
        })
      );
    });

    it('doit traiter un remboursement de consigne (+25 000 FCFA) et créer la trace comptable', async () => {
      mockPrisma.accountCase.count.mockResolvedValue(12);
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-default' });
      mockPrisma.accountCase.create.mockImplementation((args: any) => ({
        id: 'case-consigne-1',
        ...args.data,
      }));

      const res = await service.refundDeposit('agent-1', {
        customerPhone: '+237699112233',
        bottleType: 'Bouteille 12.5 kg PLEINGAZ',
      });

      expect(res.success).toBe(true);
      expect(res.refundAmount).toBe(25000);
      expect(res.caseNumber).toContain('CONSIGNE-');
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'DEPOSIT_REFUNDED' }),
        })
      );
    });
  });
});

