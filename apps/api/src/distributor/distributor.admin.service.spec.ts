import { Test, TestingModule } from '@nestjs/testing';
import { DistributorAdminService } from './distributor.admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BadRequestException } from '@nestjs/common';

describe('DistributorAdminService (Instruction Administrative KYC D-04)', () => {
  let service: DistributorAdminService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
    prisma = {
      distributorApplication: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      store: {
        create: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      userRole: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
      inventory: {
        upsert: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributorAdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<DistributorAdminService>(DistributorAdminService);
  });

  describe('reviewApplication (Approbation & Attribution de Rôle)', () => {
    it('devrait attribuer le rôle DISTRIBUTOR et créer le Store lors de l\'approbation', async () => {
      prisma.distributorApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-cand',
        businessName: 'PLEINGAZ Bonaberi',
        city: 'Douala',
        neighborhood: 'Bonaberi',
        status: 'PENDING',
        user: { phone: '+237699000001' },
      });

      prisma.distributorApplication.update.mockResolvedValue({
        id: 'app-1',
        status: 'APPROVED',
      });

      prisma.store.create.mockResolvedValue({
        id: 'store-1',
        ownerId: 'user-cand',
        name: 'PLEINGAZ Bonaberi',
        isVerifiedBadge: true,
      });

      prisma.role.findUnique.mockResolvedValue({ id: 'role-dist', name: 'DISTRIBUTOR' });
      prisma.userRole.findFirst.mockResolvedValue(null);
      prisma.product.findMany.mockResolvedValue([{ id: 'prod-125' }, { id: 'prod-060' }]);

      const result = await service.reviewApplication('admin-1', 'app-1', {
        decision: 'APPROVE',
      });

      expect(result.application.status).toBe('APPROVED');
      expect(result.store.isVerifiedBadge).toBe(true);
      expect(prisma.userRole.create).toHaveBeenCalledWith({
        data: { userId: 'user-cand', roleId: 'role-dist' },
      });
      expect(prisma.inventory.upsert).toHaveBeenCalledTimes(2);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'APPROVE_DISTRIBUTOR_KYC' })
      );
    });

    it('devrait exiger un motif explicite lors d\'un rejet administratif', async () => {
      prisma.distributorApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        status: 'PENDING',
        user: { phone: '+237699000001' },
      });

      await expect(
        service.reviewApplication('admin-1', 'app-1', {
          decision: 'REJECT',
          reason: '', // Motif vide
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait enregistrer le rejet motivé avec traçabilité d\'audit', async () => {
      prisma.distributorApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        status: 'PENDING',
        user: { phone: '+237699000001' },
      });

      prisma.distributorApplication.update.mockResolvedValue({
        id: 'app-1',
        status: 'REJECTED',
        rejectionReason: 'Pièce d\'identité illisible',
      });

      const res = await service.reviewApplication('admin-1', 'app-1', {
        decision: 'REJECT',
        reason: 'Pièce d\'identité illisible',
      });

      expect(res.status).toBe('REJECTED');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REJECT_DISTRIBUTOR_KYC' })
      );
    });
  });
});
