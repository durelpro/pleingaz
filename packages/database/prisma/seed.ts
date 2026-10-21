/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Démarrage du seed PLEINGAZ (Conforme CR-001)...');

  // Sécurité : interdiction des données de démo en production
  const isProduction = process.env.NODE_ENV === 'production';
  const allowDemoSeed = process.env.ALLOW_DEMO_SEED === 'true';

  if (isProduction && allowDemoSeed) {
    throw new Error('FATAL: ALLOW_DEMO_SEED est strictement interdit en environnement de production.');
  }

  // ==========================================
  // 1. LES 9 RÔLES OFFICIELS & PERMISSIONS (02-cadrage-ux-roles.md)
  // ==========================================
  const rolesData = [
    { name: 'CUSTOMER', description: 'Client acheteur particulier ou professionnel' },
    { name: 'DISTRIBUTOR', description: 'Point de vente distributeur agréé PLEINGAZ' },
    { name: 'COURIER', description: 'Livreur rattaché à la plateforme PLEINGAZ' },
    { name: 'LOGISTICS_MANAGER', description: 'Superviseur de la régulation et des courses' },
    { name: 'FINANCE_MANAGER', description: 'Gestionnaire comptable et financier (Maker)' },
    { name: 'SUPPORT_AGENT', description: 'Agent du service client et des litiges' },
    { name: 'CONTENT_MANAGER', description: 'Gestionnaire du catalogue et des contenus' },
    { name: 'ADMIN', description: 'Administrateur système et opérations (Checker)' },
    { name: 'SUPER_ADMIN', description: 'Super-administrateur souverain PLEINGAZ' },
  ];

  const rolesMap = new Map<string, string>();
  for (const r of rolesData) {
    const createdRole = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    rolesMap.set(r.name, createdRole.id);
  }
  console.log('✅ 9 Rôles RBAC initialisés.');

  // ==========================================
  // 2. GRAND LIVRE : PLAN DE COMPTES TYPE (D-06)
  // ==========================================
  const accountsData = [
    { code: '1010', name: 'Banque / Compte Marchand Mobile Money', type: 'ASSET' as const, description: 'Trésorerie Mobile Money MTN & Orange' },
    { code: '1020', name: 'Caisse Espèces Distributeurs', type: 'ASSET' as const, description: 'Créances d’espèces dues par les distributeurs' },
    { code: '1030', name: 'Caisse Espèces Livreurs', type: 'ASSET' as const, description: 'Créances d’espèces dues par les livreurs' },
    { code: '4010', name: 'Dettes Reversements Distributeurs', type: 'LIABILITY' as const, description: 'Montants nets à reverser aux distributeurs' },
    { code: '4020', name: 'Dettes Rémunération Livreurs', type: 'LIABILITY' as const, description: 'Rémunérations de course à reverser aux livreurs' },
    { code: '7010', name: 'Produits des Ventes Gaz & Accessoires', type: 'REVENUE' as const, description: 'Chiffre d’affaires brut des ventes directes' },
    { code: '7020', name: 'Produits des Commissions PLEINGAZ', type: 'REVENUE' as const, description: 'Commissions perçues par la plateforme' },
    { code: '6010', name: 'Charges de Frais Opérateurs Mobile Money', type: 'EXPENSE' as const, description: 'Frais de transaction prélevés par MTN/Orange' },
    { code: '6020', name: 'Charges de Rémunération des Livraisons', type: 'EXPENSE' as const, description: 'Coût des prestations de livraison' },
  ];

  for (const acc of accountsData) {
    await prisma.ledgerAccount.upsert({
      where: { code: acc.code },
      update: { name: acc.name, type: acc.type, description: acc.description },
      create: acc,
    });
  }
  console.log('✅ Plan de comptes du Grand Livre (D-06) initialisé.');

  // ==========================================
  // 3. PARAMÈTRES SYSTÈME (PlatformSettings)
  // ==========================================
  await prisma.platformSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      searchDefaultRadiusKm: 5,
      searchGpsTimeoutSeconds: 8,
      maxCashHoldingCourier: 50000,
      payoutDoubleApprovalThreshold: 500000,
      maxUploadSizeBytes: 5242880,
      supportPhone: '+237 657696567',
      supportEmail: 'contact@monpleingaz.com',
    },
  });
  console.log('✅ Paramètres globaux de la plateforme configurés.');

  // ==========================================
  // 4. COMPTE ADMINISTRATEUR SYSTÈME
  // ==========================================
  const adminPhone = process.env.INITIAL_ADMIN_PHONE || '+237600000000';
  const superAdminRole = rolesMap.get('SUPER_ADMIN');
  const adminRole = rolesMap.get('ADMIN');

  const adminUser = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      phone: adminPhone,
      email: 'admin@monpleingaz.com',
      isPhoneVerified: true,
      isEmailVerified: true,
      roles: {
        create: [
          ...(superAdminRole ? [{ roleId: superAdminRole }] : []),
          ...(adminRole ? [{ roleId: adminRole }] : []),
        ],
      },
    },
  });
  console.log(`✅ Compte Administrateur initialisé (${adminPhone}).`);

  // ==========================================
  // 5. CATALOGUE EXCLUSIF PLEINGAZ (D-01)
  // ==========================================
  const catBouteilles = await prisma.productCategory.upsert({
    where: { slug: 'bouteilles' },
    update: { name: 'Bouteilles de Gaz', displayOrder: 1 },
    create: {
      name: 'Bouteilles de Gaz',
      slug: 'bouteilles',
      description: 'Gamme officielle des bouteilles de gaz PLEINGAZ (Infotech S.A.)',
      displayOrder: 1,
    },
  });

  const catAccessoires = await prisma.productCategory.upsert({
    where: { slug: 'accessoires' },
    update: { name: 'Accessoires Officiels', displayOrder: 2 },
    create: {
      name: 'Accessoires Officiels',
      slug: 'accessoires',
      description: 'Accessoires certifiés PLEINGAZ pour une utilisation sécurisée',
      displayOrder: 2,
    },
  });

  const officialProducts = [
    {
      sku: 'PG-BOT-125',
      name: 'Bouteille de gaz 12,5 kg',
      weightKg: 12.5,
      categoryId: catBouteilles.id,
      description: 'Bouteille robuste contenant 12,5 kg de GPL. Adaptée aux besoins domestiques réguliers.',
      publicPrice: 6500,
      distributorPrice: 6000,
    },
    {
      sku: 'PG-BOT-060',
      name: 'Bouteille de gaz 6 kg',
      weightKg: 6.0,
      categoryId: catBouteilles.id,
      description: 'Bouteille en acier robuste, livrée pleine de 6 kg de GPL. Idéale pour petites familles et usages occasionnels.',
      publicPrice: 3120,
      distributorPrice: 2900,
    },
    {
      sku: 'PG-BOT-500',
      name: 'Bouteille de gaz 50 kg',
      weightKg: 50.0,
      categoryId: catBouteilles.id,
      description: 'Bouteille de 50 kg pour usages intensifs. Idéale pour restaurants, hôtels et industries.',
      publicPrice: 26000,
      distributorPrice: 24000,
    },
    {
      sku: 'PG-PLA-VER',
      name: 'Plaque à gaz en verre',
      weightKg: 4.5,
      categoryId: catAccessoires.id,
      description: 'Table de cuisson PLEINGAZ moderne en verre trempé. Élégante, résistante à la chaleur, facile à nettoyer.',
      publicPrice: 18000,
      distributorPrice: 16000,
    },
    {
      sku: 'PG-PLA-ACI',
      name: 'Plaque à gaz en acier',
      weightKg: 3.2,
      categoryId: catAccessoires.id,
      description: 'Table de cuisson robuste et économique. Adaptée aux usages domestiques quotidiens.',
      publicPrice: 16000,
      distributorPrice: 14000,
    },
    {
      sku: 'PG-DET-125',
      name: 'Détendeur pour bouteille 12,5 kg',
      weightKg: 0.5,
      categoryId: catAccessoires.id,
      description: 'Régulateur de pression pour bouteilles 12,5 kg à robinet. Sécurité et régulation optimale pour usage domestique.',
      publicPrice: 3000,
      distributorPrice: 2500,
    },
    {
      sku: 'PG-DET-060',
      name: 'Détendeur pour bouteille 6 kg',
      weightKg: 0.4,
      categoryId: catAccessoires.id,
      description: 'Détendeur PLEINGAZ conçu pour bouteilles 6 kg à valve. Simple à visser, sûr et pratique.',
      publicPrice: 3000,
      distributorPrice: 2500,
    },
    {
      sku: 'PG-ACC-TUY',
      name: 'Tuyau de gaz',
      weightKg: 0.3,
      categoryId: catAccessoires.id,
      description: 'Tuyau de 1.5 m pour relier bouteille et appareil. Garantit une alimentation en gaz sûre et durable.',
      publicPrice: 2000,
      distributorPrice: 1600,
    },
    {
      sku: 'PG-ACC-BRU',
      name: 'Brûleur vissable pour bouteille 6 kg',
      weightKg: 0.4,
      categoryId: catAccessoires.id,
      description: 'Brûleur à fixer directement sur la valve. Solution simple et mobile pour cuisson rapide.',
      publicPrice: 1500,
      distributorPrice: 1200,
    },
  ];

  for (const prod of officialProducts) {
    const product = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        weightKg: prod.weightKg,
        description: prod.description,
        categoryId: prod.categoryId,
        isActive: true,
      },
      create: {
        sku: prod.sku,
        name: prod.name,
        weightKg: prod.weightKg,
        description: prod.description,
        categoryId: prod.categoryId,
        isActive: true,
      },
    });

    // Barème de prix actif (ProductPrice)
    const activePrice = await prisma.productPrice.findFirst({
      where: { productId: product.id, status: 'APPROVED' },
    });

    if (!activePrice) {
      await prisma.productPrice.create({
        data: {
          productId: product.id,
          publicPrice: prod.publicPrice,
          distributorPrice: prod.distributorPrice,
          status: 'APPROVED',
          createdById: adminUser.id,
          approvedById: adminUser.id,
        },
      });
    }
  }
  console.log('✅ Catalogue exclusif et barèmes de prix officiels PLEINGAZ (D-01) créés.');

  // ==========================================
  // 5b. BOUTIQUE OFFICIELLE CENTRALE PLEINGAZ (CONCEPTEUR & SIÈGE OFFICIEL INFOTECH S.A.)
  // ==========================================
  const officialHeadquarterStore = await prisma.store.upsert({
    where: { id: 'store-pleingaz-siege-officiel' },
    update: {
      name: 'Boutique Officielle PLEINGAZ (Siège Central & Vente Directe)',
      city: 'Douala',
      neighborhood: 'Akwa',
      landmark: 'Boulevard de la Liberté, Immeuble Infotech S.A.',
      latitude: 4.0511,
      longitude: 9.7085,
      whatsappNumber: '+237699000000',
      isVerifiedBadge: true,
      isVisible: true,
      deliveryAvailable: true,
      reliabilityScore: 100,
    },
    create: {
      id: 'store-pleingaz-siege-officiel',
      ownerId: adminUser.id,
      name: 'Boutique Officielle PLEINGAZ (Siège Central & Vente Directe)',
      city: 'Douala',
      neighborhood: 'Akwa',
      landmark: 'Boulevard de la Liberté, Immeuble Infotech S.A.',
      latitude: 4.0511,
      longitude: 9.7085,
      whatsappNumber: '+237699000000',
      isVerifiedBadge: true,
      isVisible: true,
      deliveryAvailable: true,
      reliabilityScore: 100,
    },
  });

  const allOfficialProducts = await prisma.product.findMany();
  for (const prod of allOfficialProducts) {
    await prisma.inventory.upsert({
      where: {
        storeId_productId: {
          storeId: officialHeadquarterStore.id,
          productId: prod.id,
        },
      },
      update: {
        level: 'BON',
        lastConfirmedAt: new Date(),
      },
      create: {
        storeId: officialHeadquarterStore.id,
        productId: prod.id,
        level: 'BON',
        lastConfirmedAt: new Date(),
      },
    });
  }
  console.log('✅ Boutique Officielle Centrale PLEINGAZ (Siège & Vente Directe) créée avec stock optimal.');

  // ==========================================
  // 6. DONNÉES DE SIMULATION / DÉMO (SI ALLOW_DEMO_SEED=true)
  // ==========================================
  if (allowDemoSeed) {
    console.log('ℹ️ Déploiement des données de test autorisées (ALLOW_DEMO_SEED=true)...');

    const distRole = rolesMap.get('DISTRIBUTOR');
    const courierRole = rolesMap.get('COURIER');

    // Distributeur de démonstration
    const distUser = await prisma.user.upsert({
      where: { phone: '+237670000001' },
      update: {},
      create: {
        phone: '+237670000001',
        email: 'depot.bonamoussadi@pleingaz-demo.cm',
        isPhoneVerified: true,
        roles: { create: distRole ? [{ roleId: distRole }] : [] },
      },
    });

    const distApp = await prisma.distributorApplication.upsert({
      where: { userId: distUser.id },
      update: {},
      create: {
        userId: distUser.id,
        status: 'APPROVED',
        businessName: 'Dépôt Agréé PLEINGAZ Bonamoussadi',
        city: 'Douala',
        neighborhood: 'Bonamoussadi',
        landmark: 'Face École Publique',
        latitude: 4.0833,
        longitude: 9.7500,
        whatsappNumber: '+237670000001',
        documents: {
          create: [
            { type: 'ID_CARD_FRONT', fileUrl: 'demo/cni_front.jpg', isValid: true },
            { type: 'ID_CARD_BACK', fileUrl: 'demo/cni_back.jpg', isValid: true },
            { type: 'PORTRAIT_PHOTO', fileUrl: 'demo/portrait.jpg', isValid: true },
            { type: 'SHOP_PHOTO', fileUrl: 'demo/shop.jpg', isValid: true },
          ],
        },
      },
    });

    const demoStore = await prisma.store.upsert({
      where: { applicationId: distApp.id },
      update: {},
      create: {
        applicationId: distApp.id,
        ownerId: distUser.id,
        name: 'Dépôt Agréé PLEINGAZ Bonamoussadi',
        city: 'Douala',
        neighborhood: 'Bonamoussadi',
        landmark: 'Face École Publique',
        latitude: 4.0833,
        longitude: 9.7500,
        whatsappNumber: '+237670000001',
        openingHours: { monday: '07:30-18:30', saturday: '08:00-14:00' },
        deliveryAvailable: true,
        momoReceiverNumber: '670000001',
      },
    });

    // Stock qualitatif (BON pour la 12.5 kg)
    const prod12 = await prisma.product.findUnique({ where: { sku: 'PG-BOT-125' } });
    if (prod12) {
      await prisma.inventory.upsert({
        where: { storeId_productId: { storeId: demoStore.id, productId: prod12.id } },
        update: { level: 'BON' },
        create: {
          storeId: demoStore.id,
          productId: prod12.id,
          level: 'BON',
          lastConfirmedAt: new Date(),
        },
      });
    }

    // Livreur de démonstration
    const courierUser = await prisma.user.upsert({
      where: { phone: '+237670000002' },
      update: {},
      create: {
        phone: '+237670000002',
        email: 'livreur.douala@pleingaz-demo.cm',
        isPhoneVerified: true,
        roles: { create: courierRole ? [{ roleId: courierRole }] : [] },
      },
    });

    await prisma.courier.upsert({
      where: { userId: courierUser.id },
      update: {},
      create: {
        userId: courierUser.id,
        vehicleType: 'MOTO',
        status: 'APPROVED',
        cashBalance: 0,
        availability: { create: { isOnline: true } },
        zones: { create: [{ city: 'Douala', areaName: 'Bonamoussadi' }] },
      },
    });

    console.log('✅ Distributeur et Livreur de démo déployés avec succès.');
  }

  console.log('🎉 Seeding conforme terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
