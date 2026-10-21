import { ClaimsService } from './claims.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('ClaimsService Unit Tests (CR-002 M38/M39)', () => {
  let service: ClaimsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      store: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      storeClaim: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      importBatch: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    service = new ClaimsService(prismaMock as any);
  });

  describe('requestOtp', () => {
    it('devrait rejeter si le point de vente est introuvable', async () => {
      prismaMock.store.findUnique.mockResolvedValue(null);

      await expect(
        service.requestOtp('unknown-id', '699112233'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait rejeter si le point est déjà CLAIMED', async () => {
      prismaMock.store.findUnique.mockResolvedValue({
        id: 's1',
        name: 'Boutique Déjà Attribuée',
        claimStatus: 'CLAIMED',
      });

      await expect(
        service.requestOtp('s1', '699112233'),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait rejeter un numéro de téléphone invalide', async () => {
      prismaMock.store.findUnique.mockResolvedValue({
        id: 's1',
        name: 'Boutique Libre',
        claimStatus: 'UNCLAIMED',
      });

      await expect(
        service.requestOtp('s1', 'invalid-phone'),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait générer un code OTP et enregistrer la demande en PHONE_OTP_PENDING', async () => {
      prismaMock.store.findUnique.mockResolvedValue({
        id: 's1',
        name: 'Boutique Akwa Importée',
        claimStatus: 'UNCLAIMED',
      });

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        phone: '+237699112233',
      });

      prismaMock.storeClaim.findFirst.mockResolvedValue(null);
      prismaMock.storeClaim.create.mockResolvedValue({
        id: 'claim-1',
        storeId: 's1',
        userId: 'user-1',
        applicantPhone: '+237699112233',
        status: 'PHONE_OTP_PENDING',
      });

      const res = await service.requestOtp('s1', '699112233');

      expect(res.claimId).toBe('claim-1');
      expect(res.maskedPhone).toContain('+237699');
      expect(res.debugOtpCode).toHaveLength(6);
      expect(prismaMock.storeClaim.create).toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('devrait rejeter un code OTP incorrect', async () => {
      const realOtp = '123456';
      const realHash = crypto.createHash('sha256').update(realOtp).digest('hex');

      prismaMock.storeClaim.findFirst.mockResolvedValue({
        id: 'claim-1',
        storeId: 's1',
        applicantPhone: '+237699112233',
        otpHash: realHash,
        otpExpiresAt: new Date(Date.now() + 60000),
        status: 'PHONE_OTP_PENDING',
        store: { name: 'Boutique Test' },
      });

      await expect(
        service.verifyOtp('s1', '699112233', '999999'),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait valider l OTP et passer la boutique à PENDING_VERIFICATION', async () => {
      const realOtp = '654321';
      const realHash = crypto.createHash('sha256').update(realOtp).digest('hex');

      prismaMock.storeClaim.findFirst.mockResolvedValue({
        id: 'claim-1',
        storeId: 's1',
        userId: 'user-1',
        applicantPhone: '+237699112233',
        otpHash: realHash,
        otpExpiresAt: new Date(Date.now() + 60000),
        status: 'PHONE_OTP_PENDING',
        store: { name: 'Boutique Akwa' },
      });

      prismaMock.storeClaim.update.mockResolvedValue({
        id: 'claim-1',
        status: 'UNDER_ADMIN_REVIEW',
      });

      prismaMock.store.update.mockResolvedValue({});
      prismaMock.user.update.mockResolvedValue({});

      const res = await service.verifyOtp('s1', '699112233', '654321');

      expect(res.status).toBe('UNDER_ADMIN_REVIEW');
      expect(prismaMock.store.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 's1' },
          data: expect.objectContaining({
            claimStatus: 'PENDING_VERIFICATION',
            verificationLevel: 'CLAIMED_PENDING',
          }),
        }),
      );
    });
  });

  describe('reviewClaim', () => {
    it('devrait approuver la revendication, rattacher le propriétaire et passer à BASIC_VERIFIED', async () => {
      prismaMock.storeClaim.findUnique.mockResolvedValue({
        id: 'claim-1',
        storeId: 's1',
        userId: 'user-distr-1',
        applicantPhone: '+237699112233',
        store: {
          id: 's1',
          name: 'Boutique Bonabéri',
          fieldLocks: [],
        },
      });

      prismaMock.storeClaim.update.mockResolvedValue({
        id: 'claim-1',
        status: 'APPROVED',
      });

      prismaMock.store.update.mockResolvedValue({
        id: 's1',
        name: 'Boutique Bonabéri',
        verificationLevel: 'BASIC_VERIFIED',
        claimStatus: 'CLAIMED',
        ownerId: 'user-distr-1',
      });

      const res = await service.reviewClaim(
        'claim-1',
        'APPROVE',
        'Validé par téléphone',
        'admin-user',
      );

      expect(res.store.verificationLevel).toBe('BASIC_VERIFIED');
      expect(res.store.claimStatus).toBe('CLAIMED');
      expect(prismaMock.store.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 's1' },
          data: expect.objectContaining({
            ownerId: 'user-distr-1',
            verificationLevel: 'BASIC_VERIFIED',
            onlineOrderingEnabled: true,
          }),
        }),
      );
    });

    it('devrait rejeter la revendication et rétablir le statut UNCLAIMED', async () => {
      prismaMock.storeClaim.findUnique.mockResolvedValue({
        id: 'claim-1',
        storeId: 's1',
        userId: 'user-fake',
        applicantPhone: '+237699000000',
        store: {
          id: 's1',
          name: 'Boutique Suspecte',
        },
      });

      prismaMock.storeClaim.update.mockResolvedValue({
        id: 'claim-1',
        status: 'REJECTED',
      });

      prismaMock.store.update.mockResolvedValue({
        id: 's1',
        claimStatus: 'UNCLAIMED',
        verificationLevel: 'LISTED',
      });

      const res = await service.reviewClaim(
        'claim-1',
        'REJECT',
        'Soupçon de SIM swap',
        'admin-user',
      );

      expect(res.store.claimStatus).toBe('UNCLAIMED');
      expect(prismaMock.store.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 's1' },
          data: expect.objectContaining({
            claimStatus: 'UNCLAIMED',
            verificationLevel: 'LISTED',
          }),
        }),
      );
    });
  });
});
