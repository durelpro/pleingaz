import { Test, TestingModule } from '@nestjs/testing';
import { InfoNoticesService } from './info-notices.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BadRequestException } from '@nestjs/common';

describe('InfoNoticesService', () => {
  let service: InfoNoticesService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
    prisma = {
      infoNotice: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      infoNoticeRead: {
        upsert: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfoNoticesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<InfoNoticesService>(InfoNoticesService);
  });

  describe('createNotice (Sécurité Anti-XSS D-18.2)', () => {
    it('devrait refuser tout contenu contenant des balises HTML ou scripts', async () => {
      await expect(
        service.createNotice('admin-1', {
          title: 'Alerte stock',
          content: 'Attention <script>alert("hack")</script>',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait créer une annonce textuelle brute et tracer l’événement', async () => {
      prisma.infoNotice.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'notice-1',
          ...args.data,
        })
      );

      const res = await service.createNotice('admin-1', {
        title: 'Disponibilité Douala',
        content: 'Nouveau stock de bouteilles 12.5kg disponible dans le réseau Douala.',
        targetCity: 'Douala',
        targetRole: 'CUSTOMER',
        requiresAck: true,
      });

      expect(res.id).toBe('notice-1');
      expect(res.title).toBe('Disponibilité Douala');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'info_notice:create' })
      );
    });
  });

  describe('getNoticesForUser & acknowledgeNotice (D-18.1)', () => {
    it('devrait calculer le nombre d’annonces non acquittées pour un utilisateur', async () => {
      prisma.infoNotice.findMany.mockResolvedValue([
        {
          id: 'n-1',
          title: 'Notice 1',
          content: 'Texte',
          requiresAck: true,
          reads: [], // NON LU
          createdAt: new Date(),
        },
        {
          id: 'n-2',
          title: 'Notice 2',
          content: 'Texte',
          requiresAck: true,
          reads: [{ acknowledgedAt: new Date() }], // LU
          createdAt: new Date(),
        },
      ]);

      const res = await service.getNoticesForUser('user-1', 'CUSTOMER', 'Douala');

      expect(res.total).toBe(2);
      expect(res.unacknowledgedCount).toBe(1);
      expect(res.notices[0].hasAcknowledged).toBe(false);
      expect(res.notices[1].hasAcknowledged).toBe(true);
    });

    it('devrait enregistrer l’accusé de lecture "J’ai compris" de l’utilisateur', async () => {
      prisma.infoNotice.findUnique.mockResolvedValue({ id: 'n-1' });
      prisma.infoNoticeRead.upsert.mockResolvedValue({
        noticeId: 'n-1',
        userId: 'user-1',
        acknowledgedAt: new Date(),
      });

      const res = await service.acknowledgeNotice('n-1', 'user-1');

      expect(res.noticeId).toBe('n-1');
      expect(res.message).toContain('succès');
      expect(prisma.infoNoticeRead.upsert).toHaveBeenCalled();
    });
  });
});
