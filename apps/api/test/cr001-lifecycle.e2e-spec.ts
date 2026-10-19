import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from '../src/catalog/catalog.service';
import { DistributorService } from '../src/distributor/distributor.service';
import { DistributorAdminService } from '../src/distributor/distributor.admin.service';
import { InventoryService } from '../src/inventory/inventory.service';
import { SearchService } from '../src/search/search.service';
import { OrdersService } from '../src/orders/orders.service';
import { DeliveriesService } from '../src/deliveries/deliveries.service';
import { LedgerService } from '../src/payments/ledger.service';
import { PayoutService } from '../src/payments/payout.service';
import { ReportsService } from '../src/dashboard/reports.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuditService } from '../src/audit/audit.service';
import { DocumentType, StockLevel, PaymentMethod, PaymentStatus, OrderStatus, ApplicationStatus } from '@pleingaz/database';
import * as crypto from 'crypto';

jest.mock('@nestjs/bullmq', () => ({
  InjectQueue: (name: string) => (target: any, propertyKey: string, parameterIndex: number) => {
    require('@nestjs/common').Inject(`BullQueue_${name}`)(target, propertyKey, parameterIndex);
  },
  getQueueToken: (name: string) => `BullQueue_${name}`,
}));
jest.mock('bullmq', () => ({
  Queue: class {
    add = jest.fn().mockResolvedValue(true);
  },
}));

describe('Recette E2E Globale CR-001 (Cycle Complet Décisions D-01 à D-06)', () => {
  let catalogService: CatalogService;
  let distributorService: DistributorService;
  let distributorAdminService: DistributorAdminService;
  let inventoryService: InventoryService;
  let searchService: SearchService;
  let ordersService: OrdersService;
  let deliveriesService: DeliveriesService;
  let ledgerService: LedgerService;
  let payoutService: PayoutService;
  let reportsService: ReportsService;

  let prismaMock: any;
  let auditMock: any;

  beforeAll(async () => {
    prismaMock = {
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      productPrice: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      priceHistory: {
        create: jest.fn().mockResolvedValue({ id: 'ph-1' }),
      },
      distributorApplication: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      storeDocument: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      userRole: {
        findFirst: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
      role: {
        findUnique: jest.fn().mockResolvedValue({ id: 'role-dist', name: 'DISTRIBUTOR' }),
      },
      platformSettings: {
        findUnique: jest.fn().mockResolvedValue({
          maxUploadSizeBytes: 5 * 1024 * 1024,
          maxCashHoldingCourier: 50000,
          payoutDoubleApprovalThreshold: 500000,
        }),
      },
      store: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        update: jest.fn(),
      },
      inventory: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
      },
      cashCollection: {
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      orderItem: {
        create: jest.fn(),
        createMany: jest.fn(),
      },
      delivery: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      courier: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      stockReservation: {
        create: jest.fn(),
        createMany: jest.fn(),
        updateMany: jest.fn(),
      },
      ledgerAccount: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'acc-1010', code: '1010', name: 'Banque MoMo' },
          { id: 'acc-4010', code: '4010', name: 'Dettes Distributeurs' },
          { id: 'acc-7010', code: '7010', name: 'Commissions PLEINGAZ' },
        ]),
        findUnique: jest.fn(),
      },
      ledgerEntry: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: `entry-${Date.now()}`, ...data })),
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
      payoutBatch: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        count: jest.fn().mockResolvedValue(10),
      },
      payment: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      demandAlert: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      report: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      searchEvent: {
        create: jest.fn().mockResolvedValue({ id: 'evt-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRaw: jest.fn(),
      $queryRawUnsafe: jest.fn(),
      $transaction: jest.fn((callback) => (typeof callback === 'function' ? callback(prismaMock) : Promise.all(callback))),
    };

    auditMock = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        DistributorService,
        DistributorAdminService,
        InventoryService,
        SearchService,
        OrdersService,
        DeliveriesService,
        LedgerService,
        PayoutService,
        ReportsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditMock },
        { provide: 'BullQueue_stock-reservations', useValue: { add: jest.fn().mockResolvedValue(true) } },
        { provide: 'BullQueue_orders', useValue: { add: jest.fn().mockResolvedValue(true) } },
        { provide: 'BullQueue_notifications', useValue: { add: jest.fn().mockResolvedValue(true) } },
      ],
    }).compile();

    catalogService = moduleRef.get<CatalogService>(CatalogService);
    distributorService = moduleRef.get<DistributorService>(DistributorService);
    distributorAdminService = moduleRef.get<DistributorAdminService>(DistributorAdminService);
    inventoryService = moduleRef.get<InventoryService>(InventoryService);
    searchService = moduleRef.get<SearchService>(SearchService);
    ordersService = moduleRef.get<OrdersService>(OrdersService);
    deliveriesService = moduleRef.get<DeliveriesService>(DeliveriesService);
    ledgerService = moduleRef.get<LedgerService>(LedgerService);
    payoutService = moduleRef.get<PayoutService>(PayoutService);
    reportsService = moduleRef.get<ReportsService>(ReportsService);
  });

  describe('Étape 1 : D-01 & D-06 — Homologation Tarifaire Maker-Checker', () => {
    it('devrait refuser qu’un Maker approuve son propre prix et valider l’approbation par un Checker distinct', async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: 'prod-12kg', sku: 'PG-12KG' });
      prismaMock.productPrice.create.mockResolvedValue({
        id: 'price-1',
        productId: 'prod-12kg',
        publicPrice: 6500,
        distributorPrice: 5800,
        status: 'PROPOSED',
        createdById: 'user-maker-1',
      });

      // 1. Maker propose le prix
      const prop = await catalogService.proposePrice('user-maker-1', {
        productId: 'prod-12kg',
        publicPrice: 6500,
        distributorPrice: 5800,
      });
      expect(prop.status).toBe('PROPOSED');

      // 2. Maker tente d'approuver sa propre proposition -> INTERDIT (HTTP 403 / Maker-Checker)
      prismaMock.productPrice.findUnique.mockResolvedValue({
        id: 'price-1',
        productId: 'prod-12kg',
        createdById: 'user-maker-1',
        status: 'PROPOSED',
      });
      await expect(catalogService.approvePrice('user-maker-1', 'price-1')).rejects.toThrow(
        /Maker-Checker/i,
      );

      // 3. Checker distinct approuve le prix officiel PLEINGAZ -> SUCCÈS
      prismaMock.productPrice.findUnique.mockResolvedValue({
        id: 'price-1',
        productId: 'prod-12kg',
        createdById: 'user-maker-1',
        status: 'PROPOSED',
        product: { prices: [] },
      });
      prismaMock.productPrice.update.mockResolvedValue({ id: 'price-1', status: 'APPROVED', approvedById: 'user-checker-2' });
      const approved = await catalogService.approvePrice('user-checker-2', 'price-1');
      expect(approved.status).toBe('APPROVED');
    });
  });

  describe('Étape 2 : D-04 — KYC Stricte 3 Documents & Création Distributeur', () => {
    it('devrait rejeter un document fiscal étranger (ex: RCCM) et valider les pièces officielles D-04', async () => {
      // 1. Rejet document étranger à D-04
      await expect(
        distributorService.uploadDocument(
          'user-dist-1',
          'RCCM_DOCUMENT' as any,
          Buffer.from('dummy-content'),
          'application/pdf',
          1024,
        ),
      ).rejects.toThrow(/Type de document invalide/);

      // 2. Upload des documents autorisés et soumission
      prismaMock.distributorApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-dist-1',
        status: ApplicationStatus.DRAFT,
        businessName: 'ETS Gaz Akwa',
        city: 'Douala',
        neighborhood: 'Akwa',
      });
      prismaMock.storeDocument.findMany.mockResolvedValue([
        { type: DocumentType.ID_CARD_FRONT },
        { type: DocumentType.ID_CARD_BACK },
        { type: DocumentType.PORTRAIT_PHOTO },
        { type: DocumentType.SHOP_PHOTO },
      ]);
      prismaMock.distributorApplication.update.mockResolvedValue({ id: 'app-1', status: ApplicationStatus.PENDING });

      const submitted = await distributorService.submitApplication('user-dist-1');
      expect(submitted.status).toBe(ApplicationStatus.PENDING);

      // 3. Approbation administrative et création automatique de la boutique
      prismaMock.distributorApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        userId: 'user-dist-1',
        status: 'PENDING',
        businessName: 'ETS Gaz Akwa',
        city: 'Douala',
        neighborhood: 'Akwa',
        user: { phone: '+237690000000' },
      });
      prismaMock.product.findMany.mockResolvedValue([{ id: 'prod-12kg' }]);
      prismaMock.inventory.upsert.mockResolvedValue({ id: 'inv-1' });
      prismaMock.store.create.mockResolvedValue({ id: 'store-akwa', name: 'ETS Gaz Akwa' });

      prismaMock.distributorApplication.update.mockResolvedValue({ id: 'app-1', status: ApplicationStatus.APPROVED });
      const reviewed = await distributorAdminService.reviewApplication('admin-1', 'app-1', {
        decision: 'APPROVE',
      });
      expect(reviewed.application.status).toBe(ApplicationStatus.APPROVED);
      expect(prismaMock.store.create).toHaveBeenCalled();
    });
  });

  describe('Étape 3 : D-03 — Gestion Qualitative & Confirmation 1-Clic', () => {
    it('devrait refuser une quantité numérique, accepter BON/MOYEN/FAIBLE/RUPTURE et réactualiser en 1 clic', async () => {
      prismaMock.store.findUnique.mockResolvedValue({ id: 'store-akwa', ownerId: 'user-dist-1' });
      prismaMock.store.findFirst.mockResolvedValue({ id: 'store-akwa', ownerId: 'user-dist-1' });

      // 1. Refus valeur non conforme (ex: 50 bouteilles numériques)
      await expect(
        inventoryService.updateStock('user-dist-1', 'store-akwa', 'prod-12kg', '50_BOUTEILLES' as any),
      ).rejects.toThrow(/Niveau de stock invalide/);

      // 2. Mise à jour qualitative vers BON
      prismaMock.inventory.findUnique.mockResolvedValue({ id: 'inv-1', storeId: 'store-akwa', productId: 'prod-12kg' });
      prismaMock.inventory.upsert.mockResolvedValue({ id: 'inv-1', level: StockLevel.BON, lastConfirmedAt: new Date() });

      const stockUpdated = await inventoryService.updateStock('user-dist-1', 'store-akwa', 'prod-12kg', StockLevel.BON);
      expect(stockUpdated.level).toBe(StockLevel.BON);

      // 3. Confirmation rapide 1-clic de tout le stock
      prismaMock.inventory.updateMany.mockResolvedValue({ count: 5 });
      const confirmed = await inventoryService.quickConfirmStock('user-dist-1', 'store-akwa');
      expect(confirmed.confirmedAt).toBeDefined();
      expect(confirmed.message).toContain('confirmé');
    });
  });

  describe('Étape 4 : D-02 — Moteur de Recherche Géolocalisée', () => {
    it('devrait trouver les dépôts avec Haversine SQL sans exposer de coordonnées brutes', async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([
        {
          id: 'store-akwa',
          name: 'ETS Gaz Akwa',
          city: 'Douala',
          neighborhood: 'Akwa',
          distanceKm: 0.65,
          stockLevel: 'BON',
          lastConfirmedAt: new Date(),
        },
      ]);

      const searchRes = await searchService.searchStores({
        productId: 'prod-12kg',
        latitude: 4.05,
        longitude: 9.71,
      });

      expect(searchRes).toHaveLength(1);
      expect(searchRes[0].distanceKm).toBe(0.7);
      expect(searchRes[0].stockLevel).toBe('BON');
      expect(prismaMock.searchEvent.create).toHaveBeenCalled();
    });
  });

  describe('Étape 5 : D-05 — Commande B2C, Réservation 15 min & Code SHA-256', () => {
    it('devrait créer la commande avec réservation temporisée et hachage du code client', async () => {
      prismaMock.store.findUnique.mockResolvedValue({ id: 'store-akwa', isVisible: true });
      prismaMock.product.findUnique.mockResolvedValue({
        id: 'prod-12kg',
        name: 'Gaz 12.5kg',
        isActive: true,
        prices: [{ publicPrice: 6500, status: 'APPROVED' }],
      });
      prismaMock.order.create.mockResolvedValue({
        id: 'ord-100',
        orderNumber: 'CMD-100',
        status: OrderStatus.SUBMITTED,
        totalAmount: 6500,
      });
      prismaMock.delivery.create.mockResolvedValue({ id: 'del-100', orderId: 'ord-100' });
      prismaMock.stockReservation.create.mockResolvedValue({ id: 'res-100', orderId: 'ord-100' });

      const result = await ordersService.createOrder('client-1', {
        storeId: 'store-akwa',
        items: [{ productId: 'prod-12kg', quantity: 1 }],
        deliveryMode: 'HOME_DELIVERY',
        paymentMethod: 'CASH',
      });

      expect(result.order.orderNumber).toBe('CMD-100');
      expect(result.clientConfirmationCode).toBeDefined();
      expect(result.reservationExpiresAt).toBeDefined();
      // Vérification que le code secret SHA-256 est généré et stocké haché
      expect(prismaMock.delivery.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            confirmationCodeHash: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('Étape 6 : D-06 — Grand Livre Comptable Insert-Only & Équilibre Débit=Crédit', () => {
    it('devrait rejeter une écriture déséquilibrée et accepter un lot parfaitement équilibré', async () => {
      // 1. Écriture déséquilibrée -> REJET IMMÉDIAT
      await expect(
        ledgerService.recordDoubleEntry({
          transactionRef: 'REF-DESEQUILIBRE-001',
          entries: [
            { accountCode: '1010', debit: 7500, credit: 0, description: 'Encaissement MoMo' },
            { accountCode: '7010', debit: 0, credit: 6000, description: 'Ventes' }, // Manque 1500 FCFA
          ],
        }),
      ).rejects.toThrow(/Déséquilibre comptable/);

      // 2. Écriture équilibrée (7500 Débit = 7500 Crédit) -> SUCCÈS
      const balanced = await ledgerService.recordDoubleEntry({
        transactionRef: 'REF-001',
        entityId: 'ord-100',
        entityType: 'ORDER',
        entries: [
          { accountCode: '1010', debit: 7500, credit: 0, description: 'Banque MoMo' },
          { accountCode: '4010', debit: 0, credit: 6500, description: 'Dette Distributeur' },
          { accountCode: '7010', debit: 0, credit: 1000, description: 'Commission PLEINGAZ' },
        ],
      });
      expect(balanced.totalAmount).toBe(7500);
      expect(balanced.entriesCount).toBe(3);
    });
  });

  describe('Étape 7 : D-05 — Livraison par Livreur Tiers & Plafond Cash 50k', () => {
    it('devrait bloquer les attributions si le cash dépasse 50 000 FCFA et valider la remise par code SHA-256', async () => {
      // 1. Livreur avec 55 000 FCFA de cash -> BLOQUÉ MÉCANIQUEMENT
      prismaMock.courier.findUnique.mockResolvedValue({ id: 'courier-1', cashBalance: 55000 });
      const availableWhenBlocked = await deliveriesService.getAvailableDeliveries('courier-1');
      expect(availableWhenBlocked.blocked).toBe(true);
      expect(availableWhenBlocked.deliveries).toHaveLength(0);

      // 2. Validation de livraison avec code client SHA-256
      const plainCode = '4829';
      const hash = crypto.createHash('sha256').update(plainCode).digest('hex');

      prismaMock.courier.findUnique.mockResolvedValue({ id: 'courier-2', cashBalance: 10000 });
      prismaMock.courier.update.mockResolvedValue({ id: 'courier-2', cashBalance: 17500 });
      prismaMock.cashCollection.create.mockResolvedValue({ id: 'cc-1' });
      prismaMock.delivery.findUnique.mockResolvedValue({
        id: 'del-100',
        confirmationCodeHash: hash,
        orderId: 'ord-100',
        courierId: 'courier-2',
        status: 'ASSIGNED',
        order: { totalAmount: 7500 },
      });
      prismaMock.delivery.update.mockResolvedValue({ id: 'del-100', status: 'DELIVERED' });
      prismaMock.order.update.mockResolvedValue({ id: 'ord-100', status: 'DELIVERED' });

      // Code incorrect -> ÉCHEC
      await expect(
        deliveriesService.completeDelivery('courier-2', 'del-100', { confirmationCode: '0000' }),
      ).rejects.toThrow(/Code de confirmation client incorrect/);

      // Code exact -> SUCCÈS
      const deliveryCompleted = await deliveriesService.completeDelivery('courier-2', 'del-100', {
        confirmationCode: '4829',
      });
      expect(deliveryCompleted.delivery.status).toBe('DELIVERED');
      expect(deliveryCompleted.cashCollected).toBe(7500);
      expect(deliveryCompleted.currentCashBalance).toBe(17500);
    });
  });

  describe('Étape 8 : D-06 — Reversements Maker-Checker & Seuil 500k', () => {
    it('devrait exiger une 2e approbation si le lot de reversement dépasse 500 000 FCFA', async () => {
      prismaMock.payoutBatch.findUnique.mockResolvedValue({
        id: 'batch-big',
        totalAmount: 1200000, // 1 200 000 FCFA > 500 000 FCFA
        createdById: 'fin-maker',
        status: 'PROPOSED',
        approvedById: null,
      });
      prismaMock.payoutBatch.update.mockResolvedValue({
        id: 'batch-big',
        status: 'PROPOSED',
        approvedById: 'fin-checker-1',
      });

      const firstApproval = await payoutService.approveBatch('fin-checker-1', 'batch-big');
      expect(firstApproval.message).toContain('seconde approbation requise');
    });
  });

  describe('Étape 9 : D-03 — Consultation et Export Audité des 15 Rapports', () => {
    it('devrait générer le rapport R01 avec données réelles et enregistrer une trace audit trail lors de l’export', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        {
          orderNumber: 'CMD-100',
          totalAmount: 7500,
          status: 'DELIVERED',
          createdAt: new Date(),
          items: [{ product: { name: 'Gaz 12.5kg' } }],
          store: { name: 'ETS Gaz Akwa', city: 'Douala' },
        },
      ]);

      // Consultation R01
      const rep01 = await reportsService.getReport('R01', { city: 'Douala' });
      expect(rep01.reportId).toBe('R01');
      expect(rep01.isDemo).toBe(false);
      expect(rep01.summary.totalRevenueFCFA).toBe(7500);

      // Export CSV audité
      const exported = await reportsService.exportReport('admin-1', 'R01', 'CSV');
      expect(exported.contentType).toBe('text/csv');
      expect(auditMock.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REPORT_EXPORTED',
          userId: 'admin-1',
          entityId: 'R01',
        }),
      );
    });
  });
});
