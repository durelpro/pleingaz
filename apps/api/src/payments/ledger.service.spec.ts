import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService } from './ledger.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('LedgerService (Grand Livre Comptable Double Partie D-06 Insert-Only)', () => {
  let service: LedgerService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      ledgerAccount: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'acc-1010', code: '1010', name: 'Trésorerie PLEINGAZ', type: 'ASSET' },
          { id: 'acc-4010', code: '4010', name: 'Dettes Distributeurs', type: 'LIABILITY' },
          { id: 'acc-7010', code: '7010', name: 'Commissions PLEINGAZ', type: 'REVENUE' },
        ]),
        findUnique: jest.fn(),
      },
      ledgerEntry: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: `entry-${Date.now()}`, ...data })),
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
  });

  describe('recordDoubleEntry (Règle d\'équilibre Débit = Crédit)', () => {
    it('devrait REJETER immédiatement une écriture comptable déséquilibrée', async () => {
      await expect(
        service.recordDoubleEntry({
          transactionRef: 'TX-DESEQUILIBRE-001',
          entries: [
            { accountCode: '1010', debit: 6500, credit: 0, description: 'Débit' },
            { accountCode: '4010', debit: 0, credit: 6000, description: 'Crédit insuffisant (différence de 500)' },
          ],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait ACCEPTER et persister une écriture parfaitement équilibrée (Insert-Only)', async () => {
      const result = await service.recordDoubleEntry({
        transactionRef: 'TX-OK-001',
        entries: [
          { accountCode: '1010', debit: 6500, credit: 0, description: 'Trésorerie client' },
          { accountCode: '4010', debit: 0, credit: 6000, description: 'Dette distributeur' },
          { accountCode: '7010', debit: 0, credit: 500, description: 'Commission PLEINGAZ' },
        ],
      });

      expect(result.totalAmount).toBe(6500);
      expect(result.entriesCount).toBe(3);
      expect(prisma.ledgerEntry.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('recordExtourne (Contre-passation sans modification ni suppression)', () => {
    it('devrait générer les écritures rigoureusement inverses pour extourner une transaction', async () => {
      prisma.ledgerEntry.findMany.mockResolvedValue([
        { id: 'e1', debit: 6500, credit: 0, account: { code: '1010' } },
        { id: 'e2', debit: 0, credit: 6500, account: { code: '4010' } },
      ]);

      const res = await service.recordExtourne('TX-ORIGINE', 'Annulation commande');

      expect(res.transactionRef).toBe('EXTOURNE-TX-ORIGINE');
      expect(prisma.ledgerEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            debit: 0,
            credit: 6500, // L'ancien débit 6500 est devenu un crédit 6500
          }),
        })
      );
    });
  });
});
