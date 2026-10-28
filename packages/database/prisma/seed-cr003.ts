import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Insertion des données dynamiques CR-003...');

  // 1. Rôle ACCOUNT_MANAGER (D-15)
  const roleAccountMgr = await prisma.role.upsert({
    where: { name: 'ACCOUNT_MANAGER' },
    update: {},
    create: {
      name: 'ACCOUNT_MANAGER',
      description: 'Gestionnaire de compte - Support opérationnel délégué encadré sous AccountCase',
    },
  });
  console.log('✅ Rôle ACCOUNT_MANAGER configuré.');

  // 2. Annonce officielle dynamique (D-18)
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

  // 3. Utilisateur Acheteur de test (Marie T.) avec 2 numéros E.164 (D-12)
  const buyerUser = await prisma.user.upsert({
    where: { phone: '+237699123456' },
    update: {
      whatsappPhone: '+237699123456',
      callPhone: '+237677654321',
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

  // 4. Utilisateur Livreur certifié (Paul M.) (D-17)
  const courierUser = await prisma.user.upsert({
    where: { phone: '+237699555666' },
    update: {
      whatsappPhone: '+237699555666',
      callPhone: '+237699555666',
    },
    create: {
      phone: '+237699555666',
      whatsappPhone: '+237699555666',
      callPhone: '+237699555666',
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
  console.log('✅ Livreur Partenaire réel (Paul M.) configuré.');

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
