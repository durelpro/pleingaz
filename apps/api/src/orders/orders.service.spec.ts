import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import * as crypto from 'crypto';

jest.mock('@nestjs/bullmq', () => ({
  InjectQueue: (name: string) => (target: any, propertyKey: string, parameterIndex: number) => {
    Inject(`BullQueue_${name}`)(target, propertyKey, parameterIndex);
  },
  getQueueToken: (name: string) => `BullQueue_${name}`,
}));
jest.mock('bullmq', () => ({
  Queue: class {},
}));

import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('OrdersService (Commandes B2C & Réservations Éphémères 15 min)', () => {
  let service: OrdersService;
  let prisma: any;
  let audit: any;
  let queue: any;

  beforeEach(async () => {
    prisma = {
      store: {
        findUnique: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      delivery: {
        create: jest.fn(),
        update: jest.fn(),
      },
      stockReservation: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    queue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: getQueueToken('stock-reservations'), useValue: queue },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('devrait créer une commande avec réservation de 15 minutes et code SHA-256 pour livraison à domicile', async () => {
    prisma.store.findUnique.mockResolvedValue({ id: 'store-1', isVisible: true });
    prisma.product.findUnique.mockResolvedValue({
      id: 'prod-125',
      name: 'Bouteille PLEINGAZ 12.5 kg',
      isActive: true,
      prices: [{ publicPrice: 6500, status: 'APPROVED' }],
    });

    prisma.order.create.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'PG-20261019-1001',
      totalAmount: 6500,
      status: 'SUBMITTED',
    });

    prisma.delivery.create.mockResolvedValue({ id: 'del-1' });

    const result = await service.createOrder('user-client', {
      storeId: 'store-1',
      deliveryMode: 'HOME_DELIVERY',
      deliveryAddress: 'Bonapriso, Douala',
      paymentMethod: 'CASH',
      items: [{ productId: 'prod-125', quantity: 1 }],
    });

    expect(result.order.id).toBe('order-1');
    expect(result.order.totalAmount).toBe(6500);
    expect(result.clientConfirmationCode).toBeDefined();
    expect(result.clientConfirmationCode).toHaveLength(4);

    // Vérification de la réservation de 15 minutes
    const expiresAt = new Date(result.reservationExpiresAt);
    const diffMinutes = Math.round((expiresAt.getTime() - Date.now()) / 60000);
    expect(diffMinutes).toBe(15);

    // Vérification de l'ajout dans BullMQ
    expect(queue.add).toHaveBeenCalledWith(
      'expire-reservation',
      expect.objectContaining({ orderId: 'order-1' }),
      { delay: 15 * 60000 }
    );

    // Vérification du stockage exclusif du hachage SHA-256
    const expectedHash = crypto
      .createHash('sha256')
      .update(result.clientConfirmationCode)
      .digest('hex');

    expect(prisma.delivery.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          confirmationCodeHash: expectedHash,
          status: 'PENDING',
        }),
      })
    );
  });

  it('devrait annuler une commande et libérer les réservations de stock associées', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      customerId: 'user-client',
      status: 'SUBMITTED',
      delivery: { id: 'del-1' },
    });

    prisma.order.update.mockResolvedValue({ id: 'order-1', status: 'CANCELLED' });

    const res = await service.cancelOrder('user-client', 'order-1', 'Changement d\'avis');

    expect(res.status).toBe('CANCELLED');
    expect(prisma.stockReservation.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderId: 'order-1', isConsumed: false },
        data: { isConsumed: true },
      })
    );
  });
});
