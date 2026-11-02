import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppAuthService } from '../src/auth/whatsapp-auth.service';
import { CounterSalesService } from '../src/cr003/counter-sales.service';
import { AccountCasesService } from '../src/cr003/account-cases.service';
import { InfoNoticesService } from '../src/cr003/info-notices.service';
import { LedgerService } from '../src/payments/ledger.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuditService } from '../src/audit/audit.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('Recette E2E Globale CR-003 (Accès, Espaces étanches et Expérience utilisateur D-11 à D-18)', () => {
  let whatsAppAuthService: WhatsAppAuthService;
  let counterSalesService: CounterSalesService;
  let accountCasesService: AccountCasesService;
  let infoNoticesService: InfoNoticesService;
  let ledgerService: LedgerService;

  let prismaMock: any;
  let auditMock: any;

  beforeAll(async () => {
    prismaMock = {
      verificationChallenge: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      session: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      store: {
        findUnique: jest.fn(),
      },
      counterSale: {
        findMany: jest.fn(),
        create: jest.fn(),
        aggregate: jest.fn(),
      },
      accountCase: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      infoNotice: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      infoNoticeRead: {
        upsert: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
      },
    };

    auditMock = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppAuthService,
        CounterSalesService,
        AccountCasesService,
        InfoNoticesService,
        {
          provide: LedgerService,
          useValue: {
            recordDoubleEntry: jest.fn().mockResolvedValue({ id: 'ledger-tx-1' }),
          },
        },
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditMock },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock_jwt_token') } },
      ],
    }).compile();

    whatsAppAuthService = moduleRef.get<WhatsAppAuthService>(WhatsAppAuthService);
    counterSalesService = moduleRef.get<CounterSalesService>(CounterSalesService);
    accountCasesService = moduleRef.get<AccountCasesService>(AccountCasesService);
    infoNoticesService = moduleRef.get<InfoNoticesService>(InfoNoticesService);
    ledgerService = moduleRef.get<LedgerService>(LedgerService);
  });

  describe('Étape 1 : D-12 & 14a — Preuve Entrante WhatsApp et Règle des Deux Numéros', () => {
    it('devrait générer un défi éphémère PG-XXXX, valider la preuve entrante et refuser deux numéros identiques', async () => {
      // 1. Initialisation du défi
      prismaMock.verificationChallenge.create.mockImplementation((args: any) =>
        Promise.resolve({ id: 'ch-test-1', ...args.data })
      );

      const challenge = await whatsAppAuthService.initiateChallenge({
        phone: '699112233',
        purpose: 'REGISTER',
      });

      expect(challenge.code).toMatch(/^PG-\d{4}$/);
      expect(challenge.whatsappUrl).toContain('wa.me');

      // 2. Interdiction de numéros identiques (D-12.3)
      await expect(
        whatsAppAuthService.registerWithWhatsApp({
          challengeId: 'ch-test-1',
          whatsappPhone: '+237699112233',
          callPhone: '+237699112233', // IDENTIQUE -> REJET
        })
      ).rejects.toThrow(BadRequestException);

      // 3. Validation de la preuve entrante
      const codeHash = await argon2.hash('PG-1234');
      prismaMock.verificationChallenge.findMany.mockResolvedValue([
        {
          id: 'ch-test-1',
          phone: '+237699112233',
          codeHash,
          attempts: 0,
          expiresAt: new Date(Date.now() + 600000),
          consumedAt: null,
          purpose: 'REGISTER',
        },
      ]);
      prismaMock.verificationChallenge.update.mockResolvedValue({
        id: 'ch-test-1',
        phone: '+237699112233',
        purpose: 'REGISTER',
        consumedAt: new Date(),
      });

      const verification = await whatsAppAuthService.verifyIncomingMessage(
        '+237699112233',
        'PLEINGAZ : Activer mon compte code PG-1234.'
      );
      expect(verification.verified).toBe(true);

      // 4. Inscription réussie avec 2 numéros distincts
      prismaMock.verificationChallenge.findUnique.mockResolvedValue({
        id: 'ch-test-1',
        phone: '+237699112233',
        consumedAt: new Date(),
        expiresAt: new Date(Date.now() + 600000),
      });
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.role.findUnique.mockResolvedValue({ id: 'role-customer', name: 'CUSTOMER' });
      prismaMock.user.create.mockResolvedValue({
        id: 'user-created-1',
        phone: '+237699112233',
        whatsappPhone: '+237699112233',
        callPhone: '+237677889900',
        customerProfile: { firstName: 'Paul', lastName: 'Kamga', loyaltyPoints: 100 },
      });

      const reg = await whatsAppAuthService.registerWithWhatsApp({
        challengeId: 'ch-test-1',
        whatsappPhone: '+237699112233',
        callPhone: '+237677889900',
        firstName: 'Paul',
        lastName: 'Kamga',
      });

      expect(reg.user.whatsappPhone).toBe('+237699112233');
      expect(reg.user.callPhone).toBe('+237677889900');
      expect(reg.tokens.accessToken).toBe('mock_jwt_token');
    });
  });

  describe('Étape 2 : D-14, D-16 & 14f — Vente au Comptoir et Régulation Stricte Quota 5 Bouteilles', () => {
    it('devrait bloquer la vente si quota atteint (5/5) et valider la vente avec écriture Grand Livre sinon', async () => {
      prismaMock.store.findUnique.mockResolvedValue({ id: 'store-akwa', name: 'PLEINGAZ Akwa' });

      // Scénario A : Quota atteint (5 bouteilles déjà consommées)
      prismaMock.counterSale.findMany.mockResolvedValueOnce([
        { bottleCount: 3, createdAt: new Date() },
        { bottleCount: 2, createdAt: new Date() },
      ]);
      prismaMock.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        counterSalesService.createCounterSale({
          storeId: 'store-akwa',
          customerPhone: '+237699112233',
          bottleCount: 1,
          totalAmount: 6500,
        })
      ).rejects.toThrow(BadRequestException);

      // Scénario B : Quota autorisé (0 bouteille consommée)
      prismaMock.counterSale.findMany.mockResolvedValueOnce([]);
      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      prismaMock.counterSale.create.mockImplementation((args: any) =>
        Promise.resolve({ id: 'cs-sale-1', ...args.data })
      );

      const saleResult = await counterSalesService.createCounterSale({
        storeId: 'store-akwa',
        customerPhone: '+237699112233',
        bottleCount: 1,
        totalAmount: 6500,
        paymentMethod: 'CASH',
      });

      expect(saleResult.sale.receiptNumber).toMatch(/^RCP-CS-/);
      expect(saleResult.quota.usedCount).toBe(1);
      expect(saleResult.quota.remainingCount).toBe(4);
      expect(ledgerService.recordDoubleEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionRef: expect.stringContaining('CS-RCP-CS-'),
          entityType: 'ORDER',
        })
      );
    });
  });

  describe('Étape 3 : D-15 & 14e — Gestionnaire de Compte et Maker-Checker Invariant', () => {
    it('devrait ouvrir un dossier audité, interdire l’auto-approbation et valider le changement par un ADMIN distinct', async () => {
      // 1. Création de dossier avec motif
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-client-1' });
      prismaMock.accountCase.create.mockImplementation((args: any) =>
        Promise.resolve({ id: 'case-test-1', ...args.data, targetUser: { id: 'user-client-1' } })
      );

      const accountCase = await accountCasesService.createCase('agent-marct', {
        targetUserId: 'user-client-1',
        reason: 'Client signale perte de carte SIM en boutique',
      });

      expect(accountCase.caseNumber).toMatch(/^CASE-/);
      expect(accountCase.status).toBe('OPEN');

      // 2. Proposition de nouveau numéro
      prismaMock.accountCase.findUnique.mockResolvedValue({
        id: 'case-test-1',
        agentId: 'agent-marct',
        targetUserId: 'user-client-1',
        caseNumber: accountCase.caseNumber,
        status: 'OPEN',
      });
      prismaMock.accountCase.update.mockResolvedValue({
        id: 'case-test-1',
        status: 'PROPOSED',
        proposedAction: JSON.stringify({ newPhone: '+237699445566' }),
      });

      await accountCasesService.proposePhoneChange('case-test-1', 'agent-marct', {
        newPhone: '+237699445566',
        explanation: 'Contre-appel vocal effectué sur numéro de secours',
      });

      // 3. Violation Maker-Checker : L'agent tente d'approuver sa propre proposition
      prismaMock.accountCase.findUnique.mockResolvedValue({
        id: 'case-test-1',
        agentId: 'agent-marct',
        status: 'PROPOSED',
        proposedAction: JSON.stringify({ newPhone: '+237699445566' }),
      });

      await expect(
        accountCasesService.adminApprovePhoneChange('case-test-1', 'agent-marct', true)
      ).rejects.toThrow(ForbiddenException);

      // 4. Approbation légitime par un ADMIN distinct
      prismaMock.user.update.mockResolvedValue({});
      prismaMock.accountCase.update.mockResolvedValue({
        id: 'case-test-1',
        status: 'APPLIED',
      });

      const approved = await accountCasesService.adminApprovePhoneChange(
        'case-test-1',
        'admin-supervisor-distinct',
        true
      );

      expect(approved.status).toBe('APPLIED');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { phone: '+237699445566', whatsappPhone: '+237699445566' },
        })
      );
    });
  });

  describe('Étape 4 : D-18 & 14g — Rubrique Infos, Anti-XSS et Accusé de Lecture Horodaté', () => {
    it('devrait bloquer les injections HTML, diffuser l’annonce et enregistrer le clic "J’ai compris"', async () => {
      // 1. Rejet XSS
      await expect(
        infoNoticesService.createNotice('admin-1', {
          title: 'Alerte',
          content: 'Stock gaz <img src=x onerror=alert(1)>',
        })
      ).rejects.toThrow(BadRequestException);

      // 2. Création annonce brute
      prismaMock.infoNotice.create.mockImplementation((args: any) =>
        Promise.resolve({ id: 'notice-douala-1', ...args.data })
      );

      const notice = await infoNoticesService.createNotice('admin-1', {
        title: 'Approvisionnement Douala',
        content: 'Arrivage de 500 bouteilles 12.5kg au dépôt central.',
        targetCity: 'Douala',
        targetRole: 'CUSTOMER',
        requiresAck: true,
      });

      expect(notice.id).toBe('notice-douala-1');

      // 3. Accusé de lecture
      prismaMock.infoNotice.findUnique.mockResolvedValue({ id: 'notice-douala-1' });
      prismaMock.infoNoticeRead.upsert.mockResolvedValue({
        noticeId: 'notice-douala-1',
        userId: 'user-paul-1',
        acknowledgedAt: new Date(),
      });

      const ack = await infoNoticesService.acknowledgeNotice('notice-douala-1', 'user-paul-1');
      expect(ack.acknowledgedAt).toBeDefined();
      expect(ack.noticeId).toBe('notice-douala-1');
    });
  });
});
