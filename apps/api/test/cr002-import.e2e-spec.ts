if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://pleingaz:pleingaz_dev@localhost:5432/pleingaz_db?schema=public';
}

import { PrismaClient } from '@pleingaz/database';
import { SearchService } from '../src/search/search.service';

describe('CR-002 E2E Import Réseau & Publication Contrôlée', () => {
  let prisma: PrismaClient;
  let searchService: SearchService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    searchService = new SearchService(prisma as any);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('devrait contenir exactement 69 points de vente importés au statut LISTED', async () => {
    const importedStores = await prisma.store.findMany({
      where: { source: 'MY_MAPS_IMPORT' },
    });

    expect(importedStores).toHaveLength(69);

    for (const store of importedStores) {
      expect(store.verificationLevel).toBe('LISTED');
      expect(store.claimStatus).toBe('UNCLAIMED');
      expect(store.ownerId).toBeNull();
      expect(store.onlineOrderingEnabled).toBe(false);
      expect(store.isVerifiedBadge).toBe(false);
      expect(store.isVisible).toBe(true);
      expect(store.latitude).not.toBeNull();
      expect(store.longitude).not.toBeNull();
    }
  });

  it('devrait avoir consigné le cas particulier en QUARANTINE_INDIVIDUAL sans création de Store (D-08)', async () => {
    const quarantinedRecord = await prisma.importRecord.findFirst({
      where: { status: 'QUARANTINE_INDIVIDUAL' },
    });

    expect(quarantinedRecord).toBeDefined();
    expect(quarantinedRecord?.classifiedType).toBe('PARTICULIER_OU_MENAGE');
    expect(quarantinedRecord?.storeId).toBeNull();

    // Vérifier qu'aucune boutique ne porte cette sourceRef
    const storeExists = await prisma.store.findFirst({
      where: { sourceRef: quarantinedRecord?.sourceRef },
    });
    expect(storeExists).toBeNull();
  });

  it('devrait retourner les points LISTED dans la recherche avec mention de vérification et sans badge vérifié (D-07)', async () => {
    // Recherche sur Douala
    const results = await searchService.searchStores({
      productId: 'PG-BOT-125',
      latitude: 4.0511,
      longitude: 9.7085,
      radiusKm: 20,
    });

    expect(results.length).toBeGreaterThan(0);

    const listedStores = results.filter((s) => s.verificationLevel === 'LISTED');
    expect(listedStores.length).toBeGreaterThan(0);

    for (const ls of listedStores) {
      expect(ls.isVerifiedBadge).toBe(false);
      expect(ls.isListedUnclaimed).toBe(true);
      expect(ls.verificationNotice).toBe(
        'Point de vente PLEINGAZ — Informations en cours de vérification',
      );
      expect(ls.onlineOrderingEnabled).toBe(false);
      expect(ls.stockFreshness).toBe(
        '⚪ Information non actualisée. Contactez le point de vente.',
      );
    }
  });
});
