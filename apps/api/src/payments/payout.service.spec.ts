import { Test, TestingModule } from '@nestjs/testing';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LedgerService } from './ledger.service';
import { ForbiddenException } from '@nestjs/common';

describe('PayoutService (Maker-Checker des Reversements & Seuil 500k D-06)', () => {
  let service: PayoutService;
  let prisma: any;
  let audit: any;
  let ledgerService: any;

  beforeEach(async () => {
    prisma = {
      payoutBatch: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      platformSettings: {
        findUnique: jest.fn().mockResolvedValue({ payoutDoubleApprovalThreshold: 500000 }),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    ledgerService = {
      recordDoubleEntry: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: LedgerService, useValue: ledgerService },
      ],
    }).compile();

    service = module.get<PayoutService>(PayoutService);
  });

  describe('approveBatch (Règle Maker-Checker)', () => {
    it('devrait INTERDIRE au créateur d\'approuver son propre lot de reversement', async () => {
      prisma.payoutBatch.findUnique.mockResolvedValue({
        id: 'batch-1',
        totalAmount: 200000,
        status: 'PROPOSED',
        createdById: 'user-maker',
      });

      await expect(
        service.approveBatch('user-maker', 'batch-1')
      ).rejects.toThrow(ForbiddenException);
    });

    it('devrait passer directement à APPROVED avec un seul approbateur si montant <= 500 000 FCFA', async () => {
      prisma.payoutBatch.findUnique.mockResolvedValue({
        id: 'batch-1',
        totalAmount: 300000, // Inférieur au seuil
        status: 'PROPOSED',
        createdById: 'user-maker',
      });

      prisma.payoutBatch.update.mockResolvedValue({
        id: 'batch-1',
        status: 'APPROVED',
      });

      const res = await service.approveBatch('user-checker-1', 'batch-1');

      expect(res.batch.status).toBe('APPROVED');
      expect(prisma.payoutBatch.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'APPROVED', approvedById: 'user-checker-1' }),
        })
      );
    });

    it('devrait EXIGER une 2e approbation distincte si montant > 500 000 FCFA', async () => {
      // 1ère étape : lot de 800 000 FCFA sans approbation préalable
      prisma.payoutBatch.findUnique.mockResolvedValue({
        id: 'batch-big',
        totalAmount: 800000, // Dépasse le seuil de 500 000 FCFA
        status: 'PROPOSED',
        createdById: 'user-maker',
        approvedById: null,
      });

      prisma.payoutBatch.update.mockResolvedValue({
        id: 'batch-big',
        status: 'PROPOSED',
        approvedById: 'user-checker-1',
      });

      const step1 = await service.approveBatch('user-checker-1', 'batch-big');
      expect(step1.message).toContain('seconde approbation requise');

      // 2ème étape : tentative par le même checker -> bloqué
      prisma.payoutBatch.findUnique.mockResolvedValue({
        id: 'batch-big',
        totalAmount: 800000,
        status: 'PROPOSED',
        createdById: 'user-maker',
        approvedById: 'user-checker-1',
      });

      await expect(
        service.approveBatch('user-checker-1', 'batch-big')
      ).rejects.toThrow(ForbiddenException);

      // 3ème étape : 2e checker distinct -> validation finale
      prisma.payoutBatch.update.mockResolvedValue({
        id: 'batch-big',
        status: 'APPROVED',
        secondApprovedById: 'user-checker-2',
      });

      const step2 = await service.approveBatch('user-checker-2', 'batch-big');
      expect(step2.batch.status).toBe('APPROVED');
    });
  });
});
