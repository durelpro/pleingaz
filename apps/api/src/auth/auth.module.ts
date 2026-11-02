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

import { WhatsAppAuthService } from './whatsapp-auth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getRequiredJwtSecret(),
        signOptions: { expiresIn: JWT_EXPIRATION_ACCESS },
      }),
    }),
  ],
  providers: [AuthService, WhatsAppAuthService, JwtStrategy, RolesGuard, PermissionsGuard, JwtAuthGuard, OptionalJwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, WhatsAppAuthService, RolesGuard, PermissionsGuard, JwtAuthGuard, OptionalJwtAuthGuard],
})
export class AuthModule {}
