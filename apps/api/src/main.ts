import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Phase 10: Sécurité en production
  app.use(helmet());
  app.enableCors({ origin: true, credentials: true });

  // Préfixe d'API REST global versionné
  app.setGlobalPrefix('api/v1');

  // Middleware de parsing de cookies léger et résilient
  app.use((req: any, res: any, next: any) => {
    const cookieHeader = req.headers?.cookie;
    req.cookies = req.cookies || {};
    if (cookieHeader) {
      cookieHeader.split(';').forEach((c: string) => {
        const [k, v] = c.trim().split('=');
        if (k && v) req.cookies[k] = decodeURIComponent(v);
      });
    }
    next();
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
