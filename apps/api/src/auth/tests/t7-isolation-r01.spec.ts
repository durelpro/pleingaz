import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('T7 : Preuve d’Étanchéité Souveraine R-01 (Invisibilité & 404 Strict)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let buyerToken: string;
  let distributorToken: string;
  let courierToken: string;
  let staffToken: string;

  const testBuyerId = 'usr-buyer-t7-iso';
  const testDistributorId = 'usr-distributor-t7-iso';
  const testCourierId = 'usr-courier-t7-iso';
  const testStaffId = 'usr-staff-t7-iso';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      const cookieHeader = req.headers?.cookie;
      req.cookies = req.cookies || {};
      if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie: string) => {
          const parts = cookie.split('=');
          const name = parts[0]?.trim();
          const val = parts.slice(1).join('=').trim();
          if (name) req.cookies[name] = decodeURIComponent(val);
        });
      }
      next();
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Nettoyage préalable
    await prisma.customerProfile.deleteMany({ where: { userId: testBuyerId } });
    await prisma.userRole.deleteMany({
      where: { userId: { in: [testBuyerId, testDistributorId, testCourierId, testStaffId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testBuyerId, testDistributorId, testCourierId, testStaffId] } },
    });

    // 1. Acheteur réel
    await prisma.user.create({
      data: {
        id: testBuyerId,
        phone: '+237699770001',
        callPhone: '+237655770001',
        spaceType: 'CUSTOMER',
        status: 'ACTIVE',
        customerProfile: {
          create: {
            firstName: 'Acheteur',
            lastName: 'Isolation',
          },
        },
      },
    });

    // 2. Distributeur réel
    await prisma.user.create({
      data: {
        id: testDistributorId,
        phone: '+237699770002',
        callPhone: '+237655770002',
        spaceType: 'DISTRIBUTOR',
        status: 'ACTIVE',
      },
    });

    // 3. Livreur réel
    await prisma.user.create({
      data: {
        id: testCourierId,
        phone: '+237699770003',
        callPhone: '+237655770003',
        spaceType: 'COURIER',
        status: 'ACTIVE',
      },
    });

    // 4. Staff réel
    await prisma.user.create({
      data: {
        id: testStaffId,
        phone: '+237699770004',
        callPhone: '+237655770004',
        spaceType: 'STAFF',
        status: 'ACTIVE',
      },
    });

    // Génération de tokens JWT valides
    buyerToken = jwtService.sign({
      sub: testBuyerId,
      portal: 'CUSTOMER',
      aud: 'pleingaz:portal:customer',
    });

    distributorToken = jwtService.sign({
      sub: testDistributorId,
      portal: 'DISTRIBUTOR',
      aud: 'pleingaz:portal:distributor',
    });

    courierToken = jwtService.sign({
      sub: testCourierId,
      portal: 'COURIER',
      aud: 'pleingaz:portal:courier',
    });

    staffToken = jwtService.sign({
      sub: testStaffId,
      portal: 'STAFF',
      aud: 'pleingaz:portal:staff',
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.customerProfile.deleteMany({ where: { userId: testBuyerId } });
      await prisma.userRole.deleteMany({
        where: { userId: { in: [testBuyerId, testDistributorId, testCourierId, testStaffId] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [testBuyerId, testDistributorId, testCourierId, testStaffId] } },
      });
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  describe('1. Règle R-01 : Invisibilité inter-espaces & 404 strict', () => {
    it('doit renvoyer STRICTEMENT 404 si un acheteur tente d’accéder à l’espace distributeur', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/distributor/auth/me')
        .set('Authorization', `Bearer ${buyerToken}`);

      // L'invisibilité exige 404 (comme si la route ou l'espace n'existait pas)
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('introuvable');
    });

    it('doit renvoyer STRICTEMENT 404 si un distributeur tente d’accéder à l’espace acheteur', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/buyer/auth/me')
        .set('Authorization', `Bearer ${distributorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('introuvable');
    });

    it('doit renvoyer STRICTEMENT 404 si un livreur tente d’accéder à l’espace staff', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/staff/auth/me')
        .set('Authorization', `Bearer ${courierToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('introuvable');
    });

    it('doit renvoyer 404 sur un espace inconnu ou arbitraire', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/espace-inconnu/auth/register/start')
        .send({ phone: '+237699112233' });

      expect(res.status).toBe(404);
    });

    it('doit accepter avec 200 un utilisateur légitime sur son propre espace', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/buyer/auth/me')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testBuyerId);
      expect(res.body.spaceType).toBe('CUSTOMER');
    });
  });

  describe('2. Isolation cryptographique des Audiences JWT (D-11.4)', () => {
    it('doit renvoyer 404 si un jeton acheteur valide tente de se présenter avec une audience forgée', async () => {
      const forgedToken = jwtService.sign({
        sub: testBuyerId,
        portal: 'CUSTOMER',
        aud: 'pleingaz:portal:distributor', // Audience contradictoire
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/distributor/auth/me')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(404);
    });
  });
});
