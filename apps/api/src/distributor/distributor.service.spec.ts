import { Test, TestingModule } from '@nestjs/testing';
import { DistributorService } from './distributor.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BadRequestException } from '@nestjs/common';

describe('DistributorService', () => {
  let service: DistributorService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
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
        findUnique: jest.fn(),
        delete: jest.fn(),
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
      ],
    }).compile();

    service = module.get<DistributorService>(DistributorService);
  });

  it('should reject invalid MIME types', async () => {
    await expect(
      service.uploadDocument(
        'user-1',
        'CNI_FRONT',
        Buffer.from('test'),
        'application/x-executable',
        100,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject files exceeding 5MB', async () => {
    await expect(
      service.uploadDocument(
        'user-1',
        'CNI_FRONT',
        Buffer.from('test'),
        'image/png',
        6 * 1024 * 1024,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
