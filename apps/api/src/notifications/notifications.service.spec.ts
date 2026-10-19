import { Test, TestingModule } from '@nestjs/testing';
import { Inject } from '@nestjs/common';

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

describe('NotificationsService (Centre de Notifications BullMQ & Signalements)', () => {
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

  describe('queueNotification', () => {
    it('devrait enregistrer la notification en base PENDING et programmer le job BullMQ avec backoff', async () => {
      const mockNotif = {
        id: 'notif-1',
        userId: 'user-123',
        type: 'WHATSAPP' as NotificationType,
        title: 'Confirmation Commande',
        content: 'Votre commande est confirmée.',
        status: 'PENDING',
      };
      prisma.notification.create.mockResolvedValue(mockNotif);

      const result = await service.queueNotification(
        'user-123',
        'WHATSAPP' as NotificationType,
        'Confirmation Commande',
        'Votre commande est confirmée.',
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          type: 'WHATSAPP',
          title: 'Confirmation Commande',
          content: 'Votre commande est confirmée.',
          metadata: undefined,
        },
      });

      expect(queueMock.add).toHaveBeenCalledWith(
        'send-notification',
        { notificationId: 'notif-1' },
        expect.objectContaining({ attempts: 3, backoff: expect.any(Object) }),
      );

      expect(result).toEqual(mockNotif);
    });
  });

  describe('createReport & getReports (Signalements boutiques)', () => {
    it('devrait enregistrer un signalement utilisateur pour boutique fermée ou mauvais numéro', async () => {
      const mockReport = {
        id: 'report-1',
        userId: 'client-1',
        storeId: 'store-abc',
        reason: ReportReason.STORE_CLOSED,
        details: 'Boutique fermée à 14h alors qu’elle est déclarée ouverte.',
        isResolved: false,
      };
      prisma.report.create.mockResolvedValue(mockReport);

      const res = await service.createReport(
        'client-1',
        'store-abc',
        ReportReason.STORE_CLOSED,
        'Boutique fermée à 14h alors qu’elle est déclarée ouverte.',
      );

      expect(prisma.report.create).toHaveBeenCalled();
      expect(res.id).toBe('report-1');
    });

    it('devrait marquer un signalement comme résolu', async () => {
      prisma.report.update.mockResolvedValue({ id: 'report-1', isResolved: true, details: 'Vérifié par admin' });

      const res = await service.resolveReport('report-1', 'Vérifié par admin');
      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: { isResolved: true, details: 'Vérifié par admin' },
      });
      expect(res.isResolved).toBe(true);
    });
  });
});
