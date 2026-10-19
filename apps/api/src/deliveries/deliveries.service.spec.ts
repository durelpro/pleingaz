import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesService } from './deliveries.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('DeliveriesService (Module Livreurs Tiers D-05 & Code SHA-256)', () => {
  let service: DeliveriesService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
    prisma = {
      courier: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      courierAvailability: {
        upsert: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      userRole: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      platformSettings: {
        findUnique: jest.fn().mockResolvedValue({ maxCashHoldingCourier: 50000 }),
      },
      delivery: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: {
        update: jest.fn(),
      },
      stockReservation: {
        updateMany: jest.fn(),
      },
      cashCollection: {
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<DeliveriesService>(DeliveriesService);
  });

  describe('getAvailableDeliveries (Plafond Cash D-05: 50 000 FCFA)', () => {
    it('devrait BLOQUER l\'attribution de courses si le solde de cash atteint ou dépasse 50 000 FCFA', async () => {
      prisma.courier.findUnique.mockResolvedValue({
        id: 'courier-1',
        cashBalance: 52000, // Dépassé
      });

      const result = await service.getAvailableDeliveries('user-courier');

      expect(result.blocked).toBe(true);
      expect(result.reason).toBe('MAX_CASH_HOLDING_REACHED');
      expect(result.deliveries).toEqual([]);
    });

    it('devrait AUTORISER les courses si le solde de cash est inférieur à 50 000 FCFA', async () => {
      prisma.courier.findUnique.mockResolvedValue({
        id: 'courier-1',
        cashBalance: 15000, // En dessous du plafond
      });

      prisma.delivery.findMany.mockResolvedValue([{ id: 'del-1' }]);

      const result = await service.getAvailableDeliveries('user-courier');

      expect(result.blocked).toBe(false);
      expect(result.deliveries).toHaveLength(1);
    });
  });

  describe('completeDelivery (Validation cryptographique SHA-256 D-05)', () => {
    const validClientCode = '7412';
    const validHash = crypto.createHash('sha256').update(validClientCode).digest('hex');

    it('devrait REJETER la remise physique si le code saisi par le livreur est incorrect', async () => {
      prisma.courier.findUnique.mockResolvedValue({ id: 'courier-1', cashBalance: 0 });
      prisma.delivery.findUnique.mockResolvedValue({
        id: 'del-1',
        courierId: 'courier-1',
        status: 'PICKED_UP',
        confirmationCodeHash: validHash,
        order: { totalAmount: 6500 },
      });

      await expect(
        service.completeDelivery('user-courier', 'del-1', {
          confirmationCode: '9999', // Mauvais code
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait VALIDER la livraison et incrémenter le cash lorsque le code SHA-256 correspond', async () => {
      prisma.courier.findUnique.mockResolvedValue({ id: 'courier-1', cashBalance: 10000 });
      prisma.delivery.findUnique.mockResolvedValue({
        id: 'del-1',
        courierId: 'courier-1',
        status: 'PICKED_UP',
        confirmationCodeHash: validHash,
        order: { id: 'order-1', totalAmount: 6500 },
      });

      prisma.delivery.update.mockResolvedValue({ id: 'del-1', status: 'DELIVERED' });
      prisma.courier.update.mockResolvedValue({ id: 'courier-1', cashBalance: 16500 });

      const res = await service.completeDelivery('user-courier', 'del-1', {
        confirmationCode: '7412', // Bon code
      });

      expect(res.delivery.status).toBe('DELIVERED');
      expect(res.cashCollected).toBe(6500);
      expect(res.currentCashBalance).toBe(16500);
      expect(prisma.cashCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            courierId: 'courier-1',
            amount: 6500,
            status: 'COLLECTED',
          }),
        })
      );
    });
  });

  describe('remitCash (Versement et déblocage livreur)', () => {
    it('devrait déduire le montant versé et débloquer le livreur', async () => {
      prisma.courier.findUnique.mockResolvedValue({
        id: 'courier-1',
        cashBalance: 55000,
      });

      prisma.courier.update.mockResolvedValue({
        id: 'courier-1',
        cashBalance: 5000,
      });

      const res = await service.remitCash('admin-finance', 'courier-1', { amount: 50000 });

      expect(res.remainingCashBalance).toBe(5000);
      expect(res.isUnlocked).toBe(true);
      expect(prisma.cashCollection.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'REMITTED_TO_PLEINGAZ' }),
        })
      );
    });
  });
});
