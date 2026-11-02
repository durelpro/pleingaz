import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppAuthService } from './whatsapp-auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('WhatsAppAuthService', () => {
  let service: WhatsAppAuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(async () => {
    prisma = {
      verificationChallenge: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      session: {
        create: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<WhatsAppAuthService>(WhatsAppAuthService);
  });

  describe('normalizeE164', () => {
    it('devrait normaliser un numéro local camerounais en E.164 (+237...) standard', () => {
      expect(service.normalizeE164('699112233')).toBe('+237699112233');
      expect(service.normalizeE164('+237699112233')).toBe('+237699112233');
      expect(service.normalizeE164('00237699112233')).toBe('+237699112233');
    });

    it('devrait lever une erreur si le numéro est vide', () => {
      expect(() => service.normalizeE164('')).toThrow(BadRequestException);
    });
  });

  describe('initiateChallenge', () => {
    it('devrait créer un défi avec un code au format PG-XXXX et une URL wa.me préremplie', async () => {
      prisma.verificationChallenge.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'ch-123',
          ...args.data,
        })
      );

      const result = await service.initiateChallenge({
        phone: '699112233',
        purpose: 'REGISTER',
      });

      expect(result.challengeId).toBe('ch-123');
      expect(result.code).toMatch(/^PG-\d{4}$/);
      expect(result.phone).toBe('+237699112233');
      expect(result.whatsappUrl).toContain('https://wa.me/');
      expect(result.whatsappUrl).toContain('PLEINGAZ');
    });
  });

  describe('verifyIncomingMessage', () => {
    it('devrait valider avec succès le message WhatsApp portant le bon code', async () => {
      const code = 'PG-1234';
      const codeHash = await argon2.hash(code);

      prisma.verificationChallenge.findMany.mockResolvedValue([
        {
          id: 'ch-active',
          phone: '+237699112233',
          codeHash,
          attempts: 0,
          expiresAt: new Date(Date.now() + 60000),
          consumedAt: null,
          purpose: 'REGISTER',
        },
      ]);

      prisma.verificationChallenge.update.mockResolvedValue({
        id: 'ch-active',
        phone: '+237699112233',
        purpose: 'REGISTER',
        consumedAt: new Date(),
      });

      const res = await service.verifyIncomingMessage(
        '+237699112233',
        'PLEINGAZ : Activer mon compte code PG-1234.'
      );

      expect(res.verified).toBe(true);
      expect(res.challengeId).toBe('ch-active');
    });

    it('devrait échouer si aucun code PG-XXXX n’est trouvé dans le message', async () => {
      await expect(
        service.verifyIncomingMessage('+237699112233', 'Bonjour je veux activer')
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait échouer si le numéro n’a aucun défi actif', async () => {
      prisma.verificationChallenge.findMany.mockResolvedValue([]);

      await expect(
        service.verifyIncomingMessage('+237699112233', 'Code PG-1234')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('registerWithWhatsApp (Règle des deux numéros D-12.3)', () => {
    it('devrait interdire que le numéro d’appel de secours soit identique au numéro WhatsApp principal', async () => {
      await expect(
        service.registerWithWhatsApp({
          challengeId: 'ch-1',
          whatsappPhone: '+237699112233',
          callPhone: '+237699112233', // IDENTIQUE -> INTERDIT
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait refuser l’inscription si le défi n’a pas été validé par la preuve entrante', async () => {
      prisma.verificationChallenge.findUnique.mockResolvedValue({
        id: 'ch-1',
        phone: '+237699112233',
        consumedAt: null, // NON VALIDÉ
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(
        service.registerWithWhatsApp({
          challengeId: 'ch-1',
          whatsappPhone: '+237699112233',
          callPhone: '+237677889900',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait créer le compte avec les deux numéros distincts si le défi est prouvé', async () => {
      prisma.verificationChallenge.findUnique.mockResolvedValue({
        id: 'ch-1',
        phone: '+237699112233',
        consumedAt: new Date(), // VALIDÉ
        expiresAt: new Date(Date.now() + 60000),
      });

      prisma.user.findFirst.mockResolvedValue(null);
      prisma.role.findUnique.mockResolvedValue({ id: 'role-cust', name: 'CUSTOMER' });

      prisma.user.create.mockResolvedValue({
        id: 'user-new',
        phone: '+237699112233',
        whatsappPhone: '+237699112233',
        callPhone: '+237677889900',
        customerProfile: { firstName: 'Jean', lastName: 'Kamga', loyaltyPoints: 100 },
      });

      prisma.verificationChallenge.update.mockResolvedValue({});
      prisma.session.create.mockResolvedValue({});

      const res = await service.registerWithWhatsApp({
        challengeId: 'ch-1',
        whatsappPhone: '+237699112233',
        callPhone: '+237677889900',
        firstName: 'Jean',
        lastName: 'Kamga',
      });

      expect(res.user.whatsappPhone).toBe('+237699112233');
      expect(res.user.callPhone).toBe('+237677889900');
      expect(res.tokens.accessToken).toBe('mock_jwt_token');
    });
  });
});
