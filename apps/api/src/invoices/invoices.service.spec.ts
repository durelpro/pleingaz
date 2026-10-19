import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('InvoicesService (Facturation Légale Immuable & Avoirs CreditNote D-06)', () => {
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
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      creditNote: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
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

  describe('generateInvoice (Immuabilité légale)', () => {
    it('devrait refuser de générer une facture pour une commande annulée', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'CANCELLED',
      });

      await expect(
        service.generateInvoice('order-1', 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait générer la facture avec numéro légal INV-YYYYMM-XXXX', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'PG-20261019-1001',
        totalAmount: 6500,
        status: 'CONFIRMED',
        store: { name: 'Dépôt Akwa', city: 'Douala' },
        invoice: null,
      });

      prisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-202610-1001',
        totalAmount: 6500,
      });

      const res = await service.generateInvoice('order-1', 'admin-1');

      expect(res.invoiceNumber).toBe('INV-202610-1001');
      expect(prisma.invoice.create).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'GENERATE_INVOICE' })
      );
    });
  });

  describe('issueCreditNote (Émission d\'avoir sans suppression de la facture d\'origine)', () => {
    it('devrait émettre un avoir et marquer la facture isVoided = true', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-202610-1001',
        totalAmount: 6500,
        isVoided: false,
      });

      prisma.creditNote.create.mockResolvedValue({
        id: 'cn-1',
        creditNoteNumber: 'AVOIR-20261019-1001',
        amount: 6500,
      });

      const res = await service.issueCreditNote('inv-1', 'Bouteille endommagée au déchargement', 'admin-1');

      expect(res.amount).toBe(6500);
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: { isVoided: true },
        })
      );
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ISSUE_CREDIT_NOTE' })
      );
    });
  });
});
