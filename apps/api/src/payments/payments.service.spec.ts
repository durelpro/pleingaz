import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LedgerService } from './ledger.service';
import { MtnMomoProvider } from './providers/mtn.provider';
import { OrangeMoneyProvider } from './providers/orange.provider';

describe('PaymentsService (Paiements Directs Orange & MTN MoMo)', () => {
  let service: PaymentsService;
  let prisma: any;
  let audit: any;
  let ledgerService: any;

  beforeEach(async () => {
    prisma = {
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      platformSettings: {
        findUnique: jest.fn().mockResolvedValue({
          adminOrangeNumber: '657696567',
          adminMomoNumber: '675119989',
        }),
      },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    ledgerService = {
      recordOrderSettlement: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: LedgerService, useValue: ledgerService },
        {
          provide: MtnMomoProvider,
          useValue: { initiatePayment: jest.fn() },
        },
        {
          provide: OrangeMoneyProvider,
          useValue: { initiatePayment: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('getOfficialPaymentAccounts', () => {
    it('devrait retourner les numéros officiels Orange 657696567 et MTN 675119989', async () => {
      const accounts = await service.getOfficialPaymentAccounts();

      expect(accounts.orangeMoney.number).toBe('657696567');
      expect(accounts.orangeMoney.ussdPrefix).toContain('657696567');
      expect(accounts.mtnMomo.number).toBe('675119989');
      expect(accounts.mtnMomo.ussdPrefix).toContain('675119989');
    });
  });

  describe('submitManualTransfer', () => {
    it('devrait enregistrer le transfert manuel en attente et soumettre la commande', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-123',
        status: 'DRAFT',
        totalAmount: 7500,
      });

      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-123',
        method: 'ORANGE_MONEY',
        status: 'PENDING',
        amount: 7500,
      });

      const res = await service.submitManualTransfer({
        orderId: 'order-123',
        method: 'ORANGE_MONEY',
        senderPhone: '699112233',
        transactionRef: 'CI2409012345',
        amount: 7500,
      });

      expect(res.success).toBe(true);
      expect(res.targetNumber).toBe('657696567');
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: 'SUBMITTED' },
      });
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'SUBMIT_MANUAL_PAYMENT',
        }),
      );
    });
  });

  describe('confirmManualPayment', () => {
    it('devrait valider le paiement, confirmer la commande et imputer au Grand Livre', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-123',
        method: 'MTN_MOMO',
        status: 'PENDING',
        amount: 7500,
        lastWebhookData: {},
      });

      prisma.payment.update.mockResolvedValue({
        id: 'pay-1',
        status: 'SUCCESS',
      });

      const res = await service.confirmManualPayment('admin-user-1', 'pay-1', 'Reçu vérifié sur le téléphone MTN');

      expect(res.success).toBe(true);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: 'CONFIRMED' },
      });
      expect(ledgerService.recordOrderSettlement).toHaveBeenCalledWith(
        'order-123',
        'MTN_MOMO',
        7500,
        6750,
        1000,
      );
    });
  });

  describe('pauseOrderForUnpaidTimeout', () => {
    it('devrait mettre la commande en pause si aucun paiement validé', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-123',
        payments: [{ status: 'PENDING' }],
      });

      prisma.order.update.mockResolvedValue({
        id: 'order-123',
        status: 'DRAFT',
      });

      const res = await service.pauseOrderForUnpaidTimeout('order-123');

      expect(res.paused).toBe(true);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: 'DRAFT' },
      });
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ORDER_PAYMENT_PAUSED',
        }),
      );
    });
  });
});

