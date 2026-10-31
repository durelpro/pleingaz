import { Test, TestingModule } from '@nestjs/testing';
import { Inject, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

jest.mock('@nestjs/bullmq', () => ({
  InjectQueue: (name: string) => (target: any, propertyKey: string, parameterIndex: number) => {
    Inject(`BullQueue_${name}`)(target, propertyKey, parameterIndex);
  },
  getQueueToken: (name: string) => `BullQueue_${name}`,
}));
jest.mock('bullmq', () => ({
  Queue: class {},
}));

import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, ReportReason } from '@pleingaz/database';

describe('NotificationsService (Centre de Notifications, Meta WhatsApp D-12, M24)', () => {
  let service: NotificationsService;
  let prisma: any;
  let queueMock: any;

  beforeEach(async () => {
    prisma = {
      notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      report: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      verificationChallenge: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findUnique: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
      },
    };

    queueMock = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'BullQueue_notifications', useValue: queueMock },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('Handshake GET Meta Cloud API', () => {
    it('devrait retourner le challenge si le verify token est valide', () => {
      const challenge = 'random_hub_challenge_12345';
      const result = service.verifyMetaWebhookChallenge('subscribe', 'PLEINGAZ_META_WA_VERIFY_TOKEN', challenge);
      expect(result).toBe(challenge);
    });

    it('devrait lever ForbiddenException si le token ou le mode est incorrect', () => {
      expect(() => {
        service.verifyMetaWebhookChallenge('subscribe', 'wrong_token', '12345');
      }).toThrow(ForbiddenException);
    });
  });

  describe('Signature HMAC SHA-256 (Menace M24 anti-spoofing)', () => {
    it('devrait valider une signature authentique calculée avec le secret', () => {
      const rawBody = '{"object":"whatsapp_business_account"}';
      const secret = 'pleingaz_meta_secret_key_2026';
      const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      const signatureHeader = `sha256=${hmac}`;

      const isValid = service.verifyMetaSignature(rawBody, signatureHeader);
      expect(isValid).toBe(true);
    });

    it('devrait rejeter une fausse signature HMAC', () => {
      const rawBody = '{"object":"whatsapp_business_account"}';
      const fakeHeader = 'sha256=invalid_hash_value_1234567890abcdef';

      const isValid = service.verifyMetaSignature(rawBody, fakeHeader);
      expect(isValid).toBe(false);
    });

    it('devrait rejeter un webhook entrant si la signature est invalide', async () => {
      await expect(
        service.processIncomingMetaWebhook('{"test":1}', {}, 'sha256=forged_bad_hash')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Défi entrant WhatsApp (D-12)', () => {
    it('devrait créer un challenge entrant avec code et lien wa.me prérempli', async () => {
      prisma.verificationChallenge.create.mockImplementation((args: any) => ({
        id: 'challenge-1',
        ...args.data,
      }));

      const res = await service.createWhatsAppChallenge('+237699123456', 'LOGIN');
      expect(res.phone).toBe('+237699123456');
      expect(res.code).toMatch(/^VERIF-\d{6}$/);
      expect(res.waLink).toContain('wa.me');
      expect(prisma.verificationChallenge.create).toHaveBeenCalled();
    });

    it('devrait consommer le challenge automatiquement lors de la réception du message WhatsApp correspondant', async () => {
      const cleanPhone = '+237699123456';
      const codeNumber = '839201';
      const textMsg = `Bonjour voici mon code VERIF-${codeNumber}`;

      prisma.verificationChallenge.findFirst.mockResolvedValue({
        id: 'challenge-xyz',
        phone: cleanPhone,
        codeHash: codeNumber,
        consumedAt: null,
        expiresAt: new Date(Date.now() + 600000),
      });

      prisma.verificationChallenge.update.mockResolvedValue({
        id: 'challenge-xyz',
        consumedAt: new Date(),
      });

      const simRes = await service.simulateIncomingWebhookMessage(cleanPhone, textMsg, true);
      expect(simRes.success).toBe(true);
      expect(simRes.processed).toBe(1);
      expect(prisma.verificationChallenge.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'challenge-xyz' },
          data: { consumedAt: expect.any(Date) },
        })
      );
    });
  });

  describe('Notifications de commandes et signalements', () => {
    it('devrait programmer une notification d’arrivée de coursier avec code PIN', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-12345678',
        customer: { id: 'cust-1', phone: '+237699112233' },
      });
      prisma.notification.create.mockImplementation((args: any) => ({
        id: 'notif-pin',
        ...args.data,
      }));

      const notif = await service.sendOrderEventNotification('order-12345678', 'DELIVERY_ARRIVED', '+237699112233', '9842');
      expect(notif.content).toContain('9842');
      expect(queueMock.add).toHaveBeenCalled();
    });

    it('devrait enregistrer un signalement utilisateur pour boutique fermée', async () => {
      const mockReport = {
        id: 'report-1',
        userId: 'client-1',
        storeId: 'store-abc',
        reason: ReportReason.STORE_CLOSED,
        details: 'Boutique fermée à 14h.',
        isResolved: false,
      };
      prisma.report.create.mockResolvedValue(mockReport);

      const res = await service.createReport(
        'client-1',
        'store-abc',
        ReportReason.STORE_CLOSED,
        'Boutique fermée à 14h.',
      );

      expect(prisma.report.create).toHaveBeenCalled();
      expect(res.id).toBe('report-1');
    });
  });
});
