import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Insertion des données dynamiques CR-003...');

  // 1. Paramètres de la plateforme (PlatformSettings)
  await prisma.platformSettings.upsert({
    where: { id: 'singleton' },
    update: {
      buyerBottleLimit: 5,
      deliveryFixedPrice: 2000,
      priceGasPerLitre: 850,
      priceBottlePerLitre: 2500,
      supportPhone: '+237 657696567',
      supportEmail: 'donfackdurel1980@icloud.com',
      maxCashHoldingCourier: 50000,
      payoutDoubleApprovalThreshold: 500000,
      searchDefaultRadiusKm: 5,
    },
    create: {
      id: 'singleton',
      buyerBottleLimit: 5,
      deliveryFixedPrice: 2000,
      priceGasPerLitre: 850,
      priceBottlePerLitre: 2500,
      supportPhone: '+237 657696567',
      supportEmail: 'donfackdurel1980@icloud.com',
      maxCashHoldingCourier: 50000,
      payoutDoubleApprovalThreshold: 500000,
      searchDefaultRadiusKm: 5,
    },
  });
  console.log('✅ Paramètres globaux PlatformSettings configurés (plafond quota 5 btl, livraison 2000 FCFA).');

  // 2. Rôle ACCOUNT_MANAGER (D-15)
  await prisma.role.upsert({
    where: { name: 'ACCOUNT_MANAGER' },
    update: {},
    create: {
      name: 'ACCOUNT_MANAGER',
      description: 'Gestionnaire de compte - Support opérationnel délégué encadré sous AccountCase',
    },
  });
  console.log('✅ Rôle ACCOUNT_MANAGER configuré.');

  // 3. Annonce officielle dynamique (D-18)
  const existingNotice = await prisma.infoNotice.findFirst({
    where: { title: 'Approvisionnement Douala & Yaoundé' },
  });
  if (!existingNotice) {
    await prisma.infoNotice.create({
      data: {
        title: 'Approvisionnement Douala & Yaoundé',
        content: 'Tous les dépôts partenaires sont approvisionnés en bouteilles 12.5 kg homologuées. Livraison garantie en moins de 45 minutes.',
        category: 'INFO',
        targetRole: 'ALL',
        targetCity: 'ALL',
        isActive: true,
        requiresAck: true,
        createdById: 'admin-seed',
      },
    });
    console.log('✅ Annonce officielle InfoNotice créée.');
  }

  // 4. Utilisateur Acheteur de test (Marie T.) avec 2 numéros E.164 distincts (D-12.3)
  await prisma.user.upsert({
    where: { phone: '+237699123456' },
    update: {
      whatsappPhone: '+237699123456',
      callPhone: '+237677654321', // Distinct
    },
    create: {
      phone: '+237699123456',
      whatsappPhone: '+237699123456',
      callPhone: '+237677654321',
      isPhoneVerified: true,
      customerProfile: {
        create: {
          firstName: 'Marie',
          lastName: 'Tchouassi',
        },
      },
    },
  });
  console.log('✅ Usager Acheteur réel (Marie T.) configuré avec quota.');

  // 5. Utilisateur Livreur certifié (Paul M.) avec 2 numéros distincts (D-12.3, D-17)
  await prisma.user.upsert({
    where: { phone: '+237699555666' },
    update: {
      whatsappPhone: '+237699555666',
      callPhone: '+237655443322', // Strictement distinct du principal
    },
    create: {
      phone: '+237699555666',
      whatsappPhone: '+237699555666',
      callPhone: '+237655443322',
      isPhoneVerified: true,
      courierProfile: {
        create: {
          vehicleType: 'MOTO',
          status: 'APPROVED',
          cashBalance: 0,
        },
      },
    },
  });
  console.log('✅ Livreur Partenaire réel (Paul M.) configuré avec 2 numéros distincts.');

  console.log('🎉 Données dynamiques CR-003 insérées avec succès dans PostgreSQL !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed CR-003:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
