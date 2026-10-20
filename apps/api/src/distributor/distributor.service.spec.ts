import { Test, TestingModule } from '@nestjs/testing';
import { DistributorService } from './distributor.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BadRequestException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

describe('DistributorService (D-04: KYC Distributeur Stricte 3 Documents)', () => {
  let service: DistributorService;
  let prisma: any;
  let audit: any;
  let jwtService: any;

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    prisma = {
      distributorApplication: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      storeDocument: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      platformSettings: {
        findUnique: jest.fn().mockResolvedValue({ maxUploadSizeBytes: 5 * 1024 * 1024 }),
      },
    };

    audit = {
      log: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributorService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<DistributorService>(DistributorService);
  });

  describe('uploadDocument (Règle D-04 stricte)', () => {
    it('devrait REJETER tout type de document étranger à la liste D-04 (ex: RCCM)', async () => {
      await expect(
        service.uploadDocument(
          'user-1',
          'REGISTRE_DU_COMMERCE', // Interdit par D-04
          Buffer.from('fake'),
          'image/jpeg',
          1024
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait REJETER un fichier dépassant la limite de 5 Mo', async () => {
      const oversized = 6 * 1024 * 1024; // 6 Mo

      await expect(
        service.uploadDocument(
          'user-1',
          'ID_CARD_FRONT',
          Buffer.from('fake'),
          'image/jpeg',
          oversized
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait ACCEPTER un document officiel D-04 valide (ex: ID_CARD_FRONT)', async () => {
      prisma.distributorApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        status: 'DRAFT',
      });
      prisma.storeDocument.findFirst.mockResolvedValue(null);
      prisma.storeDocument.create.mockResolvedValue({
        id: 'doc-1',
        applicationId: 'app-1',
        type: 'ID_CARD_FRONT',
      });

      const doc = await service.uploadDocument(
        'user-1',
        'ID_CARD_FRONT',
        Buffer.from('fake image content'),
        'image/jpeg',
        2 * 1024 * 1024
      );

      expect(doc.type).toBe('ID_CARD_FRONT');
      expect(prisma.storeDocument.create).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPLOAD_KYC_DOCUMENT' })
      );
    });
  });

  describe('submitApplication (Complétude D-04)', () => {
    it('devrait REJETER la soumission si l\'un des 4 documents obligatoires est manquant', async () => {
      prisma.distributorApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        businessName: 'Gaz Express',
        city: 'Douala',
        neighborhood: 'Akwa',
      });

      // Il ne manque que SHOP_PHOTO
      prisma.storeDocument.findMany.mockResolvedValue([
        { type: 'ID_CARD_FRONT' },
        { type: 'ID_CARD_BACK' },
        { type: 'PORTRAIT_PHOTO' },
      ]);

      await expect(service.submitApplication('user-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('devrait VALIDER la soumission si les 4 documents requis sont présents', async () => {
      prisma.distributorApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-1',
        businessName: 'Gaz Express',
        city: 'Douala',
        neighborhood: 'Akwa',
      });

      prisma.storeDocument.findMany.mockResolvedValue([
        { type: 'ID_CARD_FRONT' },
        { type: 'ID_CARD_BACK' },
        { type: 'PORTRAIT_PHOTO' },
        { type: 'SHOP_PHOTO' },
      ]);

      prisma.distributorApplication.update.mockResolvedValue({
        id: 'app-1',
        status: 'PENDING',
      });

      const result = await service.submitApplication('user-1');
      expect(result.status).toBe('PENDING');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SUBMIT_DISTRIBUTOR_APPLICATION' })
      );
    });
  });
});
