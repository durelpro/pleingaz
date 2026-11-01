import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { WhatsAppAuthService } from './services/whatsapp-auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('AuthService (CR-003 Phase 2 - Règle des 2 numéros & Preuve Entrante)', () => {
  let service: AuthService;
  let whatsappService: WhatsAppAuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn().mockResolvedValue({ id: 'role-customer-id', name: 'CUSTOMER' }),
      },
      session: {
        create: jest.fn().mockResolvedValue({ id: 'session-1' }),
      },
      verificationChallenge: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        WhatsAppAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    whatsappService = module.get<WhatsAppAuthService>(WhatsAppAuthService);
  });

  describe('Règle des Deux Numéros Obligatoires (D-12.3)', () => {
    it('devrait rejeter l\'inscription si le numéro secondaire est identique au numéro principal', async () => {
      await expect(
        service.registerCustomer({
          phone: '+237699112233',
          backupPhone: '+237699112233', // Identique !
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait rejeter l\'inscription si le numéro secondaire est manquant', async () => {
      await expect(
        service.registerCustomer({
          phone: '+237699112233',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait rejeter l\'inscription si le numéro secondaire est déjà utilisé comme numéro principal tiers (Anti-contournement C-03.2)', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // primary phone libre
        .mockResolvedValueOnce({ id: 'user-collision', phone: '+237677889900' }); // secondary déjà pris en primary

      await expect(
        service.registerCustomer({
          phone: '+237699112233',
          backupPhone: '+237677889900',
        }),
      ).rejects.toThrow('déjà utilisé comme numéro principal');
    });

    it('devrait créer le compte avec succès lorsque les deux numéros sont distincts et valides', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // primary libre
        .mockResolvedValueOnce(null); // secondary libre

      prisma.user.create.mockResolvedValueOnce({
        id: 'new-user-uuid',
        phone: '+237699112233',
        callPhone: '+237677889900',
        customerProfile: {
          firstName: 'Jean',
          lastName: 'Mballa',
          loyaltyPoints: 100,
        },
      });

      const res = await service.registerCustomer({
        phone: '+237699112233',
        backupPhone: '+237677889900',
        firstName: 'Jean',
        lastName: 'Mballa',
        password: 'SecurePassword2026!',
      });

      expect(res.message).toContain('créé avec succès');
      expect(res.user.phone).toBe('+237699112233');
      expect(res.user.callPhone).toBe('+237677889900');
      expect(res.tokens.accessToken).toBe('mocked-jwt-token');
      expect(res.tokens.aud).toBe('pleingaz:portal:customer');
    });
  });

  describe('Preuve Entrante WhatsApp (D-12, C-04)', () => {
    it('devrait générer un défi avec code PG-XXXX et lien WhatsApp valide', async () => {
      prisma.verificationChallenge.create.mockImplementation((args: any) => ({
        id: 'challenge-1',
        ...args.data,
      }));

      const challenge = await whatsappService.createChallenge('+237699112233', 'LOGIN');

      expect(challenge.code).toMatch(/^PG-\d{4}$/);
      expect(challenge.whatsappLink).toContain('https://wa.me/');
      expect(challenge.whatsappLink).toContain(challenge.code);
      expect(challenge.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('devrait valider un défi avec le bon code et consommer le défi', async () => {
      const code = 'PG-5432';
      const codeHash = await argon2.hash(code);

      prisma.verificationChallenge.findFirst.mockResolvedValueOnce({
        id: 'challenge-1',
        phone: '+237699112233',
        codeHash,
        attempts: 0,
        consumedAt: null,
        expiresAt: new Date(Date.now() + 60000),
      });

      const isValid = await whatsappService.verifyChallenge('+237699112233', code);
      expect(isValid).toBe(true);
      expect(prisma.verificationChallenge.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'challenge-1' },
          data: expect.objectContaining({ consumedAt: expect.any(Date) }),
        }),
      );
    });

    it('devrait rejeter un défi avec un code erroné', async () => {
      const codeHash = await argon2.hash('PG-1111');

      prisma.verificationChallenge.findFirst.mockResolvedValueOnce({
        id: 'challenge-1',
        phone: '+237699112233',
        codeHash,
        attempts: 0,
        consumedAt: null,
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(whatsappService.verifyChallenge('+237699112233', 'PG-9999')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Isolation et Connexion Portail (D-11)', () => {
    it('devrait rejeter un client tentant d\'accéder au portail distributeur avec message générique', async () => {
      const passwordHash = await argon2.hash('SecretPass123!');
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-client-1',
        phone: '+237699112233',
        passwordHash,
        roles: [{ role: { name: 'CUSTOMER' } }],
      });

      await expect(
        service.loginWithPhonePassword('+237699112233', 'SecretPass123!', 'DISTRIBUTOR'),
      ).rejects.toThrow('Identifiants non reconnus');
    });

    it('devrait autoriser la connexion et générer un jeton avec audience portail conforme', async () => {
      const passwordHash = await argon2.hash('SecretPass123!');
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-client-1',
        phone: '+237699112233',
        passwordHash,
        roles: [{ role: { name: 'CUSTOMER' } }],
      });

      const res = await service.loginWithPhonePassword('+237699112233', 'SecretPass123!', 'CUSTOMER');
      expect(res.accessToken).toBe('mocked-jwt-token');
      expect(res.portal).toBe('CUSTOMER');
      expect(res.aud).toBe('pleingaz:portal:customer');
    });
  });
});
