import { Test, TestingModule } from '@nestjs/testing';
import { AccountCasesService } from './account-cases.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AccountCasesService', () => {
  let service: AccountCasesService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
    prisma = {
      accountCase: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      session: {
        deleteMany: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountCasesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<AccountCasesService>(AccountCasesService);
  });

  describe('createCase (D-15.1)', () => {
    it('devrait exiger un motif formel pour ouvrir un dossier d’assistance', async () => {
      await expect(
        service.createCase('agent-1', {
          targetUserId: 'user-1',
          reason: 'ko', // Trop court
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait créer un dossier avec numéro unique et tracer l’action dans AuditLog', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.accountCase.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'case-1',
          ...args.data,
          targetUser: { id: 'user-1', phone: '+237699112233' },
        })
      );

      const res = await service.createCase('agent-1', {
        targetUserId: 'user-1',
        reason: 'Perte de carte SIM déclarée par l’acheteur',
      });

      expect(res.caseNumber).toMatch(/^CASE-/);
      expect(res.status).toBe('OPEN');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'account_case:create' })
      );
    });
  });

  describe('Maker-Checker sur le changement de numéro (D-15.2)', () => {
    it('devrait interdire qu’un gestionnaire approuve sa propre proposition (Double contrôle)', async () => {
      prisma.accountCase.findUnique.mockResolvedValue({
        id: 'case-1',
        agentId: 'agent-1', // Agent créateur
        status: 'PROPOSED',
        proposedAction: JSON.stringify({ newPhone: '+237677889900' }),
      });

      await expect(
        service.adminApprovePhoneChange('case-1', 'agent-1', true) // MÊME ID -> INTERDIT
      ).rejects.toThrow(ForbiddenException);
    });

    it('devrait autoriser l’approbation par un ADMIN distinct et appliquer la mutation du numéro', async () => {
      prisma.accountCase.findUnique.mockResolvedValue({
        id: 'case-1',
        caseNumber: 'CASE-001',
        agentId: 'agent-1',
        targetUserId: 'user-1',
        status: 'PROPOSED',
        proposedAction: JSON.stringify({ newPhone: '+237677889900' }),
      });

      prisma.user.update.mockResolvedValue({});
      prisma.accountCase.update.mockResolvedValue({
        id: 'case-1',
        status: 'APPLIED',
      });

      const res = await service.adminApprovePhoneChange('case-1', 'admin-distinct-2', true);

      expect(res.status).toBe('APPLIED');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: { phone: '+237677889900', whatsappPhone: '+237677889900' },
        })
      );
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'account_case:approve_phone_change' })
      );
    });
  });

  describe('unmaskPhone & unlockAccount (D-15.2)', () => {
    it('devrait exiger une justification formelle pour démasquer un numéro', async () => {
      await expect(
        service.unmaskPhone('case-1', 'agent-1', '')
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait déverrouiller un compte verrouillé', async () => {
      prisma.accountCase.findUnique.mockResolvedValue({
        id: 'case-1',
        targetUserId: 'user-locked',
      });
      prisma.user.update.mockResolvedValue({});

      const res = await service.unlockAccount('case-1', 'agent-1');
      expect(res.message).toContain('déverrouillé');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-locked' },
          data: { failedAttempts: 0, lockedUntil: null },
        })
      );
    });
  });
});
