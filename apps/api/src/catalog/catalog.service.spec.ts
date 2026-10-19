import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('CatalogService (D-01 & D-06: Maker-Checker des Prix PLEINGAZ)', () => {
  let service: CatalogService;
  let prisma: any;
  let audit: any;

  const mockProduct = {
    id: 'prod-125',
    name: 'Bouteille 12.5 kg PLEINGAZ',
    sku: 'PG-BOT-125',
    isActive: true,
    prices: [
      {
        id: 'price-old',
        publicPrice: 6500,
        distributorPrice: 5800,
        status: 'APPROVED',
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      productCategory: {
        findMany: jest.fn(),
      },
      productPrice: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      priceHistory: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  describe('proposePrice (Rôle Maker)', () => {
    it('devrait créer une proposition tarifaire au statut PROPOSED', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.productPrice.create.mockResolvedValue({
        id: 'price-new',
        productId: 'prod-125',
        publicPrice: 7000,
        distributorPrice: 6200,
        status: 'PROPOSED',
        createdById: 'maker-1',
      });

      const result = await service.proposePrice('maker-1', {
        productId: 'prod-125',
        publicPrice: 7000,
        distributorPrice: 6200,
        reason: 'Ajustement coût logistique',
      });

      expect(result.status).toBe('PROPOSED');
      expect(prisma.productPrice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PROPOSED',
            createdById: 'maker-1',
          }),
        })
      );
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'PROPOSE_PRICE' })
      );
    });

    it('devrait refuser une proposition si le prix distributeur est supérieur au prix public', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.proposePrice('maker-1', {
          productId: 'prod-125',
          publicPrice: 6500,
          distributorPrice: 7000, // Incohérence
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.proposePrice('maker-1', {
          productId: 'prod-inconnu',
          publicPrice: 6500,
          distributorPrice: 5800,
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('approvePrice (Rôle Checker & Règle Maker-Checker)', () => {
    it('devrait INTERDIRE au créateur d\'approuver sa propre proposition (Violation Maker-Checker)', async () => {
      prisma.productPrice.findUnique.mockResolvedValue({
        id: 'price-new',
        productId: 'prod-125',
        publicPrice: 7000,
        distributorPrice: 6200,
        status: 'PROPOSED',
        createdById: 'user-same', // Même identifiant
        product: mockProduct,
      });

      await expect(
        service.approvePrice('user-same', 'price-new', { comment: 'Validation' })
      ).rejects.toThrow(ForbiddenException);
    });

    it('devrait autoriser un Checker distinct à approuver et archiver l\'ancien prix actif', async () => {
      prisma.productPrice.findUnique.mockResolvedValue({
        id: 'price-new',
        productId: 'prod-125',
        publicPrice: 7000,
        distributorPrice: 6200,
        status: 'PROPOSED',
        createdById: 'maker-1',
        product: mockProduct,
      });

      prisma.productPrice.update
        .mockResolvedValueOnce({ id: 'price-old', status: 'EXPIRED' })
        .mockResolvedValueOnce({ id: 'price-new', status: 'APPROVED' });

      const result = await service.approvePrice('checker-2', 'price-new', {
        comment: 'Validation Direction Financière',
      });

      expect(result.status).toBe('APPROVED');
      expect(prisma.priceHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            productId: 'prod-125',
            oldPublicPrice: 6500,
            newPublicPrice: 7000,
            changedByUserId: 'checker-2',
          }),
        })
      );
    });

    it('devrait refuser d\'approuver un prix qui n\'est pas au statut PROPOSED', async () => {
      prisma.productPrice.findUnique.mockResolvedValue({
        id: 'price-already-approved',
        status: 'APPROVED',
        createdById: 'maker-1',
        product: mockProduct,
      });

      await expect(
        service.approvePrice('checker-2', 'price-already-approved')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectPrice (Rôle Checker)', () => {
    it('devrait refuser le rejet si aucun motif explicite n\'est renseigné', async () => {
      prisma.productPrice.findUnique.mockResolvedValue({
        id: 'price-new',
        status: 'PROPOSED',
        createdById: 'maker-1',
      });

      await expect(
        service.rejectPrice('checker-2', 'price-new', { rejectionReason: '' })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait permettre à un Checker distinct de rejeter la proposition avec motif', async () => {
      prisma.productPrice.findUnique.mockResolvedValue({
        id: 'price-new',
        productId: 'prod-125',
        status: 'PROPOSED',
        createdById: 'maker-1',
      });

      prisma.productPrice.update.mockResolvedValue({
        id: 'price-new',
        status: 'REJECTED',
      });

      const result = await service.rejectPrice('checker-2', 'price-new', {
        rejectionReason: 'Marge distributeur insuffisante',
      });

      expect(result.status).toBe('REJECTED');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REJECT_PRICE' })
      );
    });
  });
});
