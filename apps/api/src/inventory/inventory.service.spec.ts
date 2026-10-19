import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('InventoryService (Gestion Qualitative du Stock Distributeur D-01 / D-03)', () => {
  let service: InventoryService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
    prisma = {
      store: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      inventory: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        updateMany: jest.fn(),
      },
      demandAlert: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  describe('updateStock (Niveaux qualitatifs)', () => {
    it('devrait refuser la mise à jour si l\'utilisateur n\'est pas le gérant du store', async () => {
      prisma.store.findFirst.mockResolvedValue(null); // Pas propriétaire

      await expect(
        service.updateStock('user-voleur', 'store-1', 'prod-125', 'BON')
      ).rejects.toThrow(ForbiddenException);
    });

    it('devrait refuser un niveau de stock non conforme (ex: EXCELLENT ou valeur numérique)', async () => {
      prisma.store.findFirst.mockResolvedValue({ id: 'store-1', ownerId: 'user-gerant' });

      await expect(
        service.updateStock('user-gerant', 'store-1', 'prod-125', 'EXCELLENT' as any)
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait mettre à jour le stock vers BON et mettre à jour lastConfirmedAt', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        ownerId: 'user-gerant',
        city: 'Douala',
        neighborhood: 'Akwa',
      });

      prisma.inventory.upsert.mockResolvedValue({
        id: 'inv-1',
        storeId: 'store-1',
        productId: 'prod-125',
        level: 'BON',
        lastConfirmedAt: new Date(),
      });

      const inv = await service.updateStock('user-gerant', 'store-1', 'prod-125', 'BON');

      expect(inv.level).toBe('BON');
      expect(prisma.inventory.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ level: 'BON' }),
        })
      );
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE_INVENTORY_LEVEL' })
      );
    });
  });

  describe('quickConfirmStock (Bouton 1-clic)', () => {
    it('devrait actualiser la date de confirmation de tous les stocks du store en 1 clic', async () => {
      prisma.store.findFirst.mockResolvedValue({ id: 'store-1', ownerId: 'user-gerant' });
      prisma.inventory.updateMany.mockResolvedValue({ count: 5 });

      const res = await service.quickConfirmStock('user-gerant', 'store-1');

      expect(res.message).toBe('Stock global confirmé avec succès.');
      expect(prisma.inventory.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { storeId: 'store-1' } })
      );
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'QUICK_CONFIRM_INVENTORY' })
      );
    });
  });
});
