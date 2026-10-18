// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Inject } = require('@nestjs/common');

jest.mock('@nestjs/bullmq', () => ({
  InjectQueue: (name: string) => Inject(`BullQueue_${name}`),
}));
jest.mock('bullmq', () => ({
  Queue: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('OrdersService - Intégrité des Commandes & Cas d\'abus', () => {
  let service: OrdersService;
  let prisma: any;
  let audit: any;
  let reservationsQueue: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn((cb) => cb(prisma)),
      inventory: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      invoice: {
        create: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      delivery: {
        update: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    reservationsQueue = {
      add: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: 'BullQueue_stock-reservations', useValue: reservationsQueue },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('createCheckoutOrder', () => {
    const validInventory = {
      id: 'inv-1',
      productId: 'prod-12-5',
      storeId: 'store-approved',
      level: 'HIGH',
      product: {
        id: 'prod-12-5',
        brand: 'PLEINGAZ',
        weightKg: 12.5,
        publicPrice: 6500,
      },
      store: {
        id: 'store-approved',
        name: 'Boutique Officielle Akwa',
        isVisible: true,
      },
    };

    it('Valider une commande légitime au prix officiel (6500 FCFA)', async () => {
      prisma.inventory.findUnique.mockResolvedValue(validInventory);
      prisma.order.create.mockResolvedValue({ id: 'order-1', totalAmount: 6500 });
      prisma.invoice.create.mockResolvedValue({ id: 'inv-1', totalAmount: 6500 });

      const res = await service.createCheckoutOrder('user-1', {
        storeId: 'store-approved',
        inventoryId: 'inv-1',
        deliveryMethod: 'PICKUP',
        address: 'Akwa Douala',
        needsConsigne: false,
        paymentMethod: 'MOMO',
        totalAmount: 6500,
      });

      expect(res).toBeDefined();
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 6500,
            customerId: 'user-1',
          }),
        })
      );
    });

    it('Cas d\'abus : Rejeter immédiatement une altération du prix côté client (ex: 500 FCFA au lieu de 6500)', async () => {
      prisma.inventory.findUnique.mockResolvedValue(validInventory);

      await expect(
        service.createCheckoutOrder('user-1', {
          storeId: 'store-approved',
          inventoryId: 'inv-1',
          deliveryMethod: 'PICKUP',
          address: 'Akwa Douala',
          needsConsigne: false,
          paymentMethod: 'MOMO',
          totalAmount: 500, // Prix falsifié
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('Cas d\'abus (Règle R5) : Rejeter une commande chez un distributeur non validé / masqué', async () => {
      prisma.inventory.findUnique.mockResolvedValue({
        ...validInventory,
        store: {
          id: 'store-pending',
          name: 'Boutique Non Validée',
          isVisible: false, // Distributeur non approuvé
        },
      });

      await expect(
        service.createCheckoutOrder('user-1', {
          storeId: 'store-pending',
          inventoryId: 'inv-1',
          deliveryMethod: 'PICKUP',
          address: 'Akwa Douala',
          needsConsigne: false,
          paymentMethod: 'MOMO',
          totalAmount: 6500,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('Cas d\'abus : Rejeter une commande sur un produit en rupture de stock', async () => {
      prisma.inventory.findUnique.mockResolvedValue({
        ...validInventory,
        level: 'OUT_OF_STOCK',
      });

      await expect(
        service.createCheckoutOrder('user-1', {
          storeId: 'store-approved',
          inventoryId: 'inv-1',
          deliveryMethod: 'PICKUP',
          address: 'Akwa Douala',
          needsConsigne: false,
          paymentMethod: 'MOMO',
          totalAmount: 6500,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrderById', () => {
    const mockOrder = {
      id: 'order-123',
      customerId: 'buyer-alice',
      store: { ownerId: 'distrib-bob' },
    };

    it('Cas d\'abus : Rejeter l\'accès à la commande d\'autrui par un tiers non autorisé (403)', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-charlie',
        roles: [{ role: { name: 'CUSTOMER' } }],
      });

      await expect(
        service.getOrderById('user-charlie', 'order-123')
      ).rejects.toThrow(ForbiddenException);
    });

    it('Autoriser l\'acheteur propriétaire de la commande', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.user.findUnique.mockResolvedValue({
        id: 'buyer-alice',
        roles: [{ role: { name: 'CUSTOMER' } }],
      });

      const res = await service.getOrderById('buyer-alice', 'order-123');
      expect(res).toBeDefined();
      expect(res.id).toEqual('order-123');
    });
  });
});
