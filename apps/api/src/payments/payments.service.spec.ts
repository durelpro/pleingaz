import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { MtnMomoProvider } from './providers/mtn.provider';
import { OrangeMoneyProvider } from './providers/orange.provider';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsService - Sécurité, Idempotence & Règle R4', () => {
  let service: PaymentsService;
  let prisma: any;
  let audit: any;
  let mtnProvider: any;
  let orangeProvider: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn((cb) => cb(prisma)),
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    mtnProvider = {
      initiatePayment: jest.fn().mockResolvedValue({
        providerTxId: 'mtn_tx_123',
        status: 'PENDING',
      }),
    };

    orangeProvider = {
      initiatePayment: jest.fn().mockResolvedValue({
        providerTxId: 'orange_tx_123',
        status: 'PENDING',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: MtnMomoProvider, useValue: mtnProvider },
        { provide: OrangeMoneyProvider, useValue: orangeProvider },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('initiatePayment', () => {
    it('Cas d\'abus : Rejeter le double paiement si la commande est déjà réglée avec succès', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'SUBMITTED',
        customerId: 'user-alice',
        totalAmount: 6500,
        payments: [
          { id: 'pay-done', status: 'SUCCESS', amount: 6500 },
        ],
      });

      await expect(
        service.initiatePayment('user-alice', 'order-1', 'MTN_MOMO', '+237670000000')
      ).rejects.toThrow(BadRequestException);
    });

    it('Cas d\'abus : Rejeter l\'initiation de paiement si l\'utilisateur n\'est pas le client de la commande', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'SUBMITTED',
        customerId: 'user-alice',
        totalAmount: 6500,
        payments: [],
      });

      await expect(
        service.initiatePayment('user-fraud', 'order-1', 'MTN_MOMO', '+237670000000')
      ).rejects.toThrow(BadRequestException);
    });

    it('Initier un paiement électronique valide', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'SUBMITTED',
        customerId: 'user-alice',
        totalAmount: 6500,
        store: { momoReceiverNumber: '+237671111111' },
        payments: [],
      });

      prisma.payment.create.mockResolvedValue({
        id: 'pay-new',
        status: 'PENDING',
        amount: 6500,
      });

      const res = await service.initiatePayment('user-alice', 'order-1', 'MTN_MOMO', '+237670000000');
      expect(res).toBeDefined();
      expect(prisma.payment.create).toHaveBeenCalled();
    });
  });

  describe('handleWebhook (Règle R4)', () => {
    it('Cas d\'abus : Rejeter un webhook sans signature de sécurité', async () => {
      await expect(
        service.handleWebhook('MTN', { transaction_id: 'tx_1' }, '')
      ).rejects.toThrow(BadRequestException);
    });

    it('Idempotence : Ignorer un webhook en doublon sur une transaction déjà traitée en SUCCESS', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        status: 'SUCCESS', // Déjà traité !
        orderId: 'order-1',
      });

      const res = await service.handleWebhook(
        'MTN',
        { transaction_id: 'tx_already_success', status: 'SUCCESSFUL' },
        'sig_mock'
      );

      expect(res).toEqual(expect.objectContaining({ duplicate: true }));
      expect(prisma.payment.update).not.toHaveBeenCalled();
    });

    it('Règle R4 : Valider le paiement et confirmer la commande sur webhook serveur SUCCESS', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        status: 'PENDING',
        orderId: 'order-1',
        order: { id: 'order-1', status: 'SUBMITTED' },
      });

      const res = await service.handleWebhook(
        'MTN',
        { transaction_id: 'tx_new_success', status: 'SUCCESSFUL' },
        'sig_valid'
      );

      expect(res).toEqual(expect.objectContaining({ ok: true, status: 'SUCCESS' }));
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({ status: 'SUCCESS' }),
        })
      );
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1' },
          data: expect.objectContaining({ status: 'CONFIRMED' }),
        })
      );
    });
  });
});
