import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding de test pour PLEINGAZ...');

  // 1. Catégories
  const catDomestique = await prisma.productCategory.upsert({
    where: { name: 'Gaz Domestique' },
    update: {},
    create: { name: 'Gaz Domestique', description: 'Bouteilles pour un usage ménager quotidien.' },
  });

  // 2. Produits (Bouteilles de gaz)
  const products = [
    { brand: 'SCTM', weightKg: 12.5, publicPrice: 6500, distributorPrice: 6000 },
    { brand: 'Camgaz', weightKg: 12.5, publicPrice: 6500, distributorPrice: 6000 },
    { brand: 'Tradex', weightKg: 12.5, publicPrice: 6500, distributorPrice: 6000 },
    { brand: 'GreenOil', weightKg: 12.5, publicPrice: 6500, distributorPrice: 6000 },
    { brand: 'Oilibya', weightKg: 12.5, publicPrice: 6500, distributorPrice: 6000 },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { brand_weightKg: { brand: prod.brand, weightKg: prod.weightKg } },
      update: {},
      create: {
        categoryId: catDomestique.id,
        brand: prod.brand,
        weightKg: prod.weightKg,
        publicPrice: prod.publicPrice,
        distributorPrice: prod.distributorPrice,
      },
    });
  }

  // 3. Rôles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrateur système' },
  });

  const distributorRole = await prisma.role.upsert({
    where: { name: 'DISTRIBUTOR' },
    update: {},
    create: { name: 'DISTRIBUTOR', description: 'Distributeur agréé' },
  });

  // 4. Utilisateurs
  const adminUser = await prisma.user.upsert({
    where: { phone: '+237600000000' },
    update: {},
    create: {
      phone: '+237600000000',
      email: 'admin@pleingaz.cm',
      roles: { create: { roleId: adminRole.id } },
    },
  });

  const distUser1 = await prisma.user.upsert({
    where: { phone: '+237611111111' },
    update: {},
    create: {
      phone: '+237611111111',
      roles: { create: { roleId: distributorRole.id } },
    },
  });

  const distUser2 = await prisma.user.upsert({
    where: { phone: '+237622222222' },
    update: {},
    create: {
      phone: '+237622222222',
      roles: { create: { roleId: distributorRole.id } },
    },
  });

  // 5. Demandes de distribution (Application) & Boutiques (Store)
  const app1 = await prisma.distributorApplication.upsert({
    where: { userId: distUser1.id },
    update: {},
    create: {
      userId: distUser1.id,
      status: 'APPROVED',
      businessName: 'Dépôt Central SCTM Bonamoussadi',
      city: 'Douala',
      neighborhood: 'Bonamoussadi',
      latitude: 4.0833,
      longitude: 9.7500,
      whatsappNumber: '+237611111111',
    },
  });

  const app2 = await prisma.distributorApplication.upsert({
    where: { userId: distUser2.id },
    update: {},
    create: {
      userId: distUser2.id,
      status: 'APPROVED',
      businessName: 'Relais Tradex Akwa',
      city: 'Douala',
      neighborhood: 'Akwa',
      latitude: 4.0500,
      longitude: 9.7000,
      whatsappNumber: '+237622222222',
    },
  });

  const store1 = await prisma.store.upsert({
    where: { applicationId: app1.id },
    update: {},
    create: {
      applicationId: app1.id,
      ownerId: distUser1.id,
      name: 'Dépôt Central SCTM Bonamoussadi',
      city: 'Douala',
      neighborhood: 'Bonamoussadi',
      latitude: 4.0833,
      longitude: 9.7500,
      whatsappNumber: '+237611111111',
      openingHours: { monday: "08:00-18:00", tuesday: "08:00-18:00" },
      momoReceiverNumber: '611111111',
      badges: ['FAST', 'TOP_RATED'],
    },
  });

  const store2 = await prisma.store.upsert({
    where: { applicationId: app2.id },
    update: {},
    create: {
      applicationId: app2.id,
      ownerId: distUser2.id,
      name: 'Relais Tradex Akwa',
      city: 'Douala',
      neighborhood: 'Akwa',
      latitude: 4.0500,
      longitude: 9.7000,
      whatsappNumber: '+237622222222',
      openingHours: { monday: "07:00-20:00" },
      momoReceiverNumber: '622222222',
    },
  });

  // 6. Inventaires (Stocks)
  const dbProducts = await prisma.product.findMany();
  
  for (const prod of dbProducts) {
    if (prod.brand === 'SCTM' || prod.brand === 'Camgaz') {
      await prisma.inventory.upsert({
        where: { storeId_productId: { storeId: store1.id, productId: prod.id } },
        update: { level: 'HIGH' },
        create: { storeId: store1.id, productId: prod.id, level: 'HIGH' },
      });
    }

    if (prod.brand === 'Tradex') {
      await prisma.inventory.upsert({
        where: { storeId_productId: { storeId: store2.id, productId: prod.id } },
        update: { level: 'MEDIUM' },
        create: { storeId: store2.id, productId: prod.id, level: 'MEDIUM' },
      });
    }
  }

  // 7. Base de Connaissances IA
  await prisma.knowledgeDocument.create({
    data: {
      title: 'Politique de Prix et Livraison Pleingaz',
      content: `Le prix officiel de la bouteille de gaz SCTM, Camgaz, Tradex et GreenOil de 12.5Kg est fixé à 6 500 FCFA. Il est interdit aux distributeurs agréés de surfacturer. Pleingaz assure la géolocalisation des dépôts et propose un service de livraison à domicile ou de retrait. Les distributeurs peuvent postuler en fournissant leur CNI et RCCM. Pour tout signalement de prix abusif, le client peut utiliser le "Centre d'Assistance & Signalements".`,
    }
  });

  console.log('Seeding terminé avec succès ! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
