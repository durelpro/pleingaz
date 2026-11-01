import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

import { getRequiredJwtSecret, JWT_EXPIRATION_ACCESS } from './constants/jwt.config';

import { PortalAudienceGuard } from './guards/portal-audience.guard';
import { WhatsAppAuthService } from './services/whatsapp-auth.service';
import { SimulatedChannel } from './services/channels/simulated.channel';
import { WhatsAppInboundChannel } from './services/channels/whatsapp-inbound.channel';
import { ManualAssistedChannel } from './services/channels/manual-assisted.channel';
import { SpaceAuthController } from './controllers/space-auth.controller';
import { WhatsAppWebhookController } from './controllers/whatsapp-webhook.controller';
import { DevWhatsAppController } from './controllers/dev-whatsapp.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getRequiredJwtSecret(),
        signOptions: { expiresIn: JWT_EXPIRATION_ACCESS },
      }),
    }),
  ],
  providers: [
    AuthService,
    WhatsAppAuthService,
    SimulatedChannel,
    WhatsAppInboundChannel,
    ManualAssistedChannel,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    PortalAudienceGuard,
  ],
  controllers: [
    AuthController,
    SpaceAuthController,
    WhatsAppWebhookController,
    DevWhatsAppController,
  ],
  exports: [
    AuthService,
    WhatsAppAuthService,
    SimulatedChannel,
    WhatsAppInboundChannel,
    ManualAssistedChannel,
    RolesGuard,
    PermissionsGuard,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    PortalAudienceGuard,
  ],
})
export class AuthModule {}
