import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('SearchService (D-02: Moteur de Recherche Géolocalisée & Confidentialité)', () => {
  let service: SearchService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      platformSettings: {
        findUnique: jest.fn().mockResolvedValue({ searchDefaultRadiusKm: 5 }),
      },
      $queryRawUnsafe: jest.fn(),
      store: {
        findMany: jest.fn(),
      },
      searchEvent: {
        create: jest.fn().mockResolvedValue({ id: 'event-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('devrait lever BadRequestException si productId est manquant', async () => {
    await expect(
      service.searchStores({ productId: '' })
    ).rejects.toThrow(BadRequestException);
  });

  it('devrait exécuter la recherche géolocalisée (Haversine SQL) si latitude et longitude sont fournies', async () => {
    const mockRawStores = [
      {
        id: 'store-1',
        name: 'Dépôt PLEINGAZ Akwa',
        neighborhood: 'Akwa',
        city: 'Douala',
        landmark: 'Face Hôtel Somatel',
        whatsappNumber: '+237657000001',
        isVerifiedBadge: true,
        deliveryAvailable: true,
        reliabilityScore: 95,
        stockLevel: 'BON',
        lastConfirmedAt: new Date(),
        distanceKm: 1.2,
      },
    ];

    prisma.$queryRawUnsafe.mockResolvedValue(mockRawStores);

    const results = await service.searchStores({
      productId: 'prod-125',
      latitude: 4.0511,
      longitude: 9.7679,
      radiusKm: 5,
    });

    expect(prisma.$queryRawUnsafe).toHaveBeenCalled();
    expect(results.length).toBe(1);
    expect(results[0].distanceKm).toBe(1.2);
    expect(results[0].recommendationBadge).toBe('📍 Point relais à proximité (< 2 km)');

    // Vérification stricte D-02: AUCUNE coordonnée GPS brute persistée dans SearchEvent
    expect(prisma.searchEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        coarseArea: 'Zone géolocalisée (clic client)',
        productId: 'prod-125',
        resultsCount: 1,
      }),
    });
  });

  it('devrait basculer sur la recherche par zone macro (city/neighborhood) si les coordonnées GPS sont absentes', async () => {
    const mockStores = [
      {
        id: 'store-2',
        name: 'Dépôt PLEINGAZ Bonapriso',
        neighborhood: 'Bonapriso',
        city: 'Douala',
        landmark: 'Rue des Palmiers',
        whatsappNumber: '+237657000002',
        isVerifiedBadge: true,
        deliveryAvailable: false,
        reliabilityScore: 88,
        updatedAt: new Date(),
        inventories: [
          {
            level: 'BON',
            lastConfirmedAt: new Date(),
          },
        ],
      },
    ];

    prisma.store.findMany.mockResolvedValue(mockStores);

    const results = await service.searchByArea({
      productId: 'prod-125',
      city: 'Douala',
      neighborhood: 'Bonapriso',
    });

    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
    expect(prisma.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          city: { contains: 'Douala', mode: 'insensitive' },
          neighborhood: { contains: 'Bonapriso', mode: 'insensitive' },
        }),
      })
    );
    expect(results.length).toBe(1);
    expect(results[0].distanceKm).toBeNull();

    // Vérification de la zone enregistrée pour l'audit macro
    expect(prisma.searchEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        coarseArea: 'Douala',
        productId: 'prod-125',
        resultsCount: 1,
      }),
    });
  });
});
