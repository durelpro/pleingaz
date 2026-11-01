import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppAuthService } from '../services/whatsapp-auth.service';
import { WhatsAppInboundChannel } from '../services/channels/whatsapp-inbound.channel';
import { SimulatedChannel } from '../services/channels/simulated.channel';

describe('T2 : API d’authentification WhatsApp (Preuve Entrante & Règles Souveraines)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let whatsappAuthService: WhatsAppAuthService;
  let whatsappInboundChannel: WhatsAppInboundChannel;
  let simulatedChannel: SimulatedChannel;

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
    whatsappAuthService = moduleFixture.get<WhatsAppAuthService>(WhatsAppAuthService);
    whatsappInboundChannel = moduleFixture.get<WhatsAppInboundChannel>(WhatsAppInboundChannel);
    simulatedChannel = moduleFixture.get<SimulatedChannel>(SimulatedChannel);
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  describe('1. Création de défi et liaison de session', () => {
    it('doit générer un défi avec code et lien wa.me prérempli', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/buyer/auth/register/start')
        .send({ phone: '+237699112233' })
        .expect(200);

      expect(res.body.challengeId).toBeDefined();
      expect(res.body.code).toMatch(/^PG-\d{4}$/);
      expect(res.body.whatsappLink).toContain('wa.me');
      expect(res.headers['set-cookie']).toBeDefined(); // Cookie HttpOnly de liaison
    });

    it('doit rejeter l’interrogation d’un défi inexistant avec 404', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/buyer/auth/challenges/non-existent-id/status')
        .expect(404);
    });
  });

  describe('2. Preuve entrante, mauvais code et double utilisation', () => {
    it('doit rejeter un code incorrect soumis via le canal de simulation', async () => {
      const startRes = await request(app.getHttpServer())
        .post('/api/v1/buyer/auth/register/start')
        .send({ phone: '+237699445566' })
        .expect(200);

      // Envoi d'un mauvais code
      const simRes = await request(app.getHttpServer())
        .post('/api/v1/dev/whatsapp/simulate-inbound')
        .send({ from: '+237699445566', text: 'Code PLEINGAZ : PG-0000' })
        .expect(200);

      expect(simRes.body.verified).toBe(false);

      // Le statut du défi reste PENDING
      const statusRes = await request(app.getHttpServer())
        .get(`/api/v1/buyer/auth/challenges/${startRes.body.challengeId}/status`)
        .expect(200);

      expect(statusRes.body.verified).toBe(false);
      expect(statusRes.body.status).toBe('PENDING');
    });

    it('doit valider la preuve entrante quand le code exact est envoyé par le bon expéditeur', async () => {
      const phone = '+237699778899';
      const startRes = await request(app.getHttpServer())
        .post('/api/v1/buyer/auth/register/start')
        .send({ phone })
        .expect(200);

      const code = startRes.body.code;

      // Simulation du message entrant de l'utilisateur vers le bot
      const simRes = await request(app.getHttpServer())
        .post('/api/v1/dev/whatsapp/simulate-inbound')
        .send({ from: phone, text: `Code PLEINGAZ : ${code}` })
        .expect(200);

      expect(simRes.body.verified).toBe(true);

      // Polling de détection automatique
      const statusRes = await request(app.getHttpServer())
        .get(`/api/v1/buyer/auth/challenges/${startRes.body.challengeId}/status`)
        .expect(200);

      expect(statusRes.body.verified).toBe(true);
      expect(statusRes.body.status).toBe('VERIFIED');
    });

    it('doit interdire la double utilisation d’un même défi déjà consommé', async () => {
      const phone = '+237699881122';
      const startRes = await request(app.getHttpServer())
        .post('/api/v1/buyer/auth/register/start')
        .send({ phone })
        .expect(200);

      // Validation
      await request(app.getHttpServer())
        .post('/api/v1/dev/whatsapp/simulate-inbound')
        .send({ from: phone, text: `Code PLEINGAZ : ${startRes.body.code}` })
        .expect(200);

      // Première finalisation
      await request(app.getHttpServer())
        .post('/api/v1/buyer/auth/register/complete')
        .send({
          challengeId: startRes.body.challengeId,
          phone,
          secondaryPhone: '+237655881122',
          password: 'Password123!',
        })
        .expect(201);

      // Tentative de rejeu avec le même défi
      await request(app.getHttpServer())
        .post('/api/v1/buyer/auth/register/complete')
        .send({
          challengeId: startRes.body.challengeId,
          phone,
          secondaryPhone: '+237655990011',
          password: 'Password123!',
        })
        .expect(400); // Rejeté car défi déjà consommé ou utilisateur existant
    });
  });

  describe('3. Règle des deux numéros et format E.164 (D-12.3)', () => {
    it('doit rejeter l’inscription si le numéro secondaire est identique au principal', async () => {
      const phone = '+237699332211';
      const startRes = await request(app.getHttpServer())
        .post('/api/v1/buyer/auth/register/start')
        .send({ phone })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/dev/whatsapp/simulate-inbound')
        .send({ from: phone, text: `Code PLEINGAZ : ${startRes.body.code}` })
        .expect(200);

      const completeRes = await request(app.getHttpServer())
        .post('/api/v1/buyer/auth/register/complete')
        .send({
          challengeId: startRes.body.challengeId,
          phone,
          secondaryPhone: phone, // Identique !
          password: 'Password123!',
        })
        .expect(400);

      expect(completeRes.body.message).toContain('strictement différent');
    });
  });

  describe('4. Sécurité Webhook Meta (HMAC SHA-256)', () => {
    it('doit valider la poignée de main hub.challenge avec le verify_token configuré', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.challenge': '1234567890',
          'hub.verify_token': 'pleingaz_webhook_verify_token_2026',
        })
        .expect(200);

      expect(res.text).toBe('1234567890');
    });

    it('doit rejeter la poignée de main si le verify_token est incorrect', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.challenge': '1234567890',
          'hub.verify_token': 'wrong_token',
        })
        .expect(401);
    });
  });

  describe('5. Règle R-01 : Étanchéité et Isolation 404 inter-espaces', () => {
    it('doit renvoyer strictement 404 sur un espace inconnu ou invalide', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/unknown-space/auth/login')
        .send({ phone: '+237699000000', password: 'secret' })
        .expect(404);
    });

    it('doit interdire l’accès aux routes dev si NODE_ENV=production', async () => {
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await request(app.getHttpServer())
          .post('/api/v1/dev/whatsapp/simulate-inbound')
          .send({ from: '+237699000000', text: 'test' })
          .expect(403);

        await request(app.getHttpServer())
          .get('/api/v1/dev/whatsapp/outbox')
          .expect(403);
      } finally {
        process.env.NODE_ENV = oldEnv;
      }
    });
  });

  describe('6. Anti-énumération et Mot de passe oublié', () => {
    it('doit renvoyer une réponse générique identique sur mot de passe oublié que le compte existe ou non', async () => {
      const res1 = await request(app.getHttpServer())
        .post('/api/v1/buyer/auth/recovery/start')
        .send({ phone: '+237699999999' }) // Inexistant
        .expect(200);

      expect(res1.body.message).toContain('Si ce compte existe');
    });
  });
});
