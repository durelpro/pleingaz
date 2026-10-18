import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('InvoicesService - Sécurité & Contrôle d\'accès (Cas d\'abus)', () => {
  let service: InvoicesService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
    prisma = {
      order: {
        findUnique: jest.fn(),
      },
      invoice: {
        create: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  describe('getInvoiceByOrderId', () => {
    const mockOrder = {
      id: 'order-123',
      orderNumber: 'ORD-2026-001',
      customerId: 'client-alice',
      store: {
        name: 'Boutique Akwa',
        ownerId: 'distrib-bob',
      },
      invoice: {
        id: 'inv-123',
        invoiceNumber: 'INV-2026-001',
        totalAmount: 6500,
      },
      items: [],
      delivery: null,
      customer: { id: 'client-alice', phone: '+237690000001' },
      createdAt: new Date(),
    };

    it('Cas d\'abus : Rejeter l\'accès à la facture d\'autrui par un tiers non autorisé (403)', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      // L'utilisateur tiers n'a aucun rôle admin
      prisma.user.findUnique.mockResolvedValue({
        id: 'hacker-eve',
        roles: [{ role: { name: 'CUSTOMER' } }],
      });

      await expect(
        service.getInvoiceByOrderId('order-123', 'hacker-eve')
      ).rejects.toThrow(ForbiddenException);
    });

    it('Autoriser l\'acheteur propriétaire de la commande à consulter sa facture', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.user.findUnique.mockResolvedValue({
        id: 'client-alice',
        roles: [{ role: { name: 'CUSTOMER' } }],
      });

      const res = await service.getInvoiceByOrderId('order-123', 'client-alice');
      expect(res).toBeDefined();
      expect(res.orderNumber).toEqual('ORD-2026-001');
    });

    it('Autoriser le gérant de la boutique vendeuse à consulter la facture', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.user.findUnique.mockResolvedValue({
        id: 'distrib-bob',
        roles: [{ role: { name: 'DISTRIBUTOR' } }],
      });

      const res = await service.getInvoiceByOrderId('order-123', 'distrib-bob');
      expect(res).toBeDefined();
      expect(res.seller.name).toEqual('Boutique Akwa');
    });

    it('Autoriser un administrateur central à superviser la facture', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.user.findUnique.mockResolvedValue({
        id: 'admin-super',
        roles: [{ role: { name: 'ADMIN' } }],
      });

      const res = await service.getInvoiceByOrderId('order-123', 'admin-super');
      expect(res).toBeDefined();
    });

    it('Rejeter si la commande n\'existe pas (404)', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getInvoiceByOrderId('order-unknown', 'client-alice')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateInvoice', () => {
    it('Cas d\'abus : Rejeter la double génération d\'une même facture (Immuable)', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-123',
        orderNumber: 'ORD-123',
        status: 'CONFIRMED',
        invoice: { id: 'existing-inv' }, // Facture déjà générée
        store: { ownerId: 'distrib-bob' },
      });

      prisma.user.findUnique.mockResolvedValue({
        id: 'distrib-bob',
        roles: [{ role: { name: 'DISTRIBUTOR' } }],
      });

      await expect(
        service.generateInvoice('order-123', 'distrib-bob')
      ).rejects.toThrow(BadRequestException);
    });

    it('Cas d\'abus : Rejeter la génération par un tiers non autorisé', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-123',
        orderNumber: 'ORD-123',
        status: 'CONFIRMED',
        invoice: null,
        store: { ownerId: 'distrib-bob' },
      });

      prisma.user.findUnique.mockResolvedValue({
        id: 'random-user',
        roles: [{ role: { name: 'CUSTOMER' } }],
      });

      await expect(
        service.generateInvoice('order-123', 'random-user')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
