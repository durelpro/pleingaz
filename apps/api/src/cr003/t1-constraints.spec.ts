import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';

describe('T1 : Contraintes Fondamentales D-11 et D-12 (BDD & Schéma)', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  describe('1. Contraintes de format et disjonction numéro (D-12)', () => {
    it('doit rejeter l’insertion d’un utilisateur avec le même numéro pour principal et secondaire', async () => {
      const duplicatePhone = '+237699000111';
      await expect(
        prisma.user.create({
          data: {
            phone: duplicatePhone,
            whatsappPhone: duplicatePhone,
            callPhone: duplicatePhone,
            spaceType: 'CUSTOMER',
          },
        }),
      ).rejects.toThrow();
    });

    it('doit rejeter un format de numéro de téléphone non E.164', async () => {
      await expect(
        prisma.user.create({
          data: {
            phone: '0612345678', // Invalide: sans indicatif international E.164
            whatsappPhone: '0612345678',
            callPhone: '+237699000222',
            spaceType: 'CUSTOMER',
          },
        }),
      ).rejects.toThrow();
    });

    it('doit accepter un utilisateur avec un numéro principal et un numéro secondaire distincts au format E.164 valide', async () => {
      const mainPhone = `+237699${Math.floor(100000 + Math.random() * 900000)}`;
      const secPhone = `+237655${Math.floor(100000 + Math.random() * 900000)}`;

      const user = await prisma.user.create({
        data: {
          phone: mainPhone,
          whatsappPhone: mainPhone,
          callPhone: secPhone,
          spaceType: 'CUSTOMER',
        },
      });

      expect(user).toBeDefined();
      expect(user.whatsappPhone).toBe(mainPhone);
      expect(user.callPhone).toBe(secPhone);
      expect(user.spaceType).toBe('CUSTOMER');
    });

    it('doit interdire la création de deux comptes avec le même numéro WhatsApp (Unicité D-11/D-12)', async () => {
      const sharedPhone = `+237688${Math.floor(100000 + Math.random() * 900000)}`;
      await prisma.user.create({
        data: {
          phone: sharedPhone,
          whatsappPhone: sharedPhone,
          callPhone: '+237677112233',
          spaceType: 'CUSTOMER',
        },
      });

      // Tentative de créer un second utilisateur avec le même numéro WhatsApp
      await expect(
        prisma.user.create({
          data: {
            phone: `+237699${Math.floor(100000 + Math.random() * 900000)}`,
            whatsappPhone: sharedPhone, // Déjà pris
            callPhone: '+237677998877',
            spaceType: 'DISTRIBUTOR',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('2. Immutabilité absolue de la table AuditLog (Append-Only)', () => {
    it('doit interdire strictement la suppression d’une entrée dans AuditLog (Trigger SQL)', async () => {
      const log = await prisma.auditLog.create({
        data: {
          action: 'SECURITY_TEST_AUDIT',
          entity: 'System',
          entityId: 'test-123',
        },
      });

      expect(log.id).toBeDefined();

      // Tentative de suppression directe
      await expect(
        prisma.auditLog.delete({
          where: { id: log.id },
        }),
      ).rejects.toThrow();
    });
  });

  describe('3. Paramètres souverains Setting (buyer_bottle_limit = 5)', () => {
    it('doit contenir le paramètre Setting avec buyerBottleLimit fixé à 5', async () => {
      const setting = await prisma.setting.findUnique({
        where: { id: 'singleton' },
      });

      expect(setting).toBeDefined();
      expect(setting?.buyerBottleLimit).toBe(5);
    });
  });
});
