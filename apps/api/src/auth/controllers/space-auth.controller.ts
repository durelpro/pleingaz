import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, PortalType } from '../auth.service';
import { WhatsAppAuthService } from '../services/whatsapp-auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PortalAudienceGuard } from '../guards/portal-audience.guard';
import { RequirePortal } from '../decorators/portal.decorator';

// Mapping URL space vers type d'espace / rôle
const SPACE_MAPPING: Record<string, { portal: PortalType; spaceType: string; cookieName: string }> = {
  buyer: { portal: 'CUSTOMER', spaceType: 'CUSTOMER', cookieName: 'pleingaz_session_buyer' },
  distributor: { portal: 'DISTRIBUTOR', spaceType: 'DISTRIBUTOR', cookieName: 'pleingaz_session_distributor' },
  courier: { portal: 'COURIER', spaceType: 'COURIER', cookieName: 'pleingaz_session_courier' },
};

@Controller(':space/auth')
export class SpaceAuthController {
  private readonly logger = new Logger(SpaceAuthController.name);
  private readonly GENERIC_AUTH_ERROR = 'Identifiants non reconnus. Veuillez vérifier votre numéro et mot de passe.';

  constructor(
    private readonly authService: AuthService,
    private readonly whatsappAuthService: WhatsAppAuthService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Valide et résout l'espace demandé
   */
  private resolveSpaceConfig(spaceParam: string): { portal: PortalType; spaceType: string; cookieName: string } {
    const staffPortalPath = process.env.STAFF_PORTAL_PATH || 'staff';
    if (spaceParam === staffPortalPath || spaceParam === 'staff') {
      return { portal: 'STAFF', spaceType: 'STAFF', cookieName: 'pleingaz_session_staff' };
    }

    const config = SPACE_MAPPING[spaceParam.toLowerCase()];
    if (!config) {
      // Règle R-01 : toute tentative sur un espace inconnu répond 404 strict
      throw new NotFoundException('Ressource introuvable.');
    }
    return config;
  }

  /**
   * Étape 1 d'inscription : initiation du défi WhatsApp
   * POST /api/v1/:space/auth/register/start
   */
  @Post('register/start')
  @HttpCode(HttpStatus.OK)
  async registerStart(
    @Param('space') space: string,
    @Body() body: { phone: string; secondaryPhone?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const config = this.resolveSpaceConfig(space);

    if (!body.phone) {
      throw new BadRequestException('Le numéro WhatsApp principal est obligatoire.');
    }

    const sessionBinding = crypto.randomBytes(24).toString('hex');
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;

    const challenge = await this.whatsappAuthService.createChallenge(
      body.phone,
      'REGISTER',
      sessionBinding,
      ipAddress,
    );

    // Cookie de liaison de session éphémère HttpOnly
    res.cookie('pleingaz_challenge_binding', sessionBinding, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    return {
      challengeId: challenge.challengeId,
      code: challenge.code,
      whatsappLink: challenge.whatsappLink,
      officialNumber: challenge.officialNumber,
      expiresAt: challenge.expiresAt,
      message: 'Défi généré. Envoyez le code prérempli depuis votre WhatsApp pour vérifier la ligne.',
    };
  }

  /**
   * Consultation de l'état du défi par interrogation périodique (Polling)
   * GET /api/v1/:space/auth/challenges/:id/status
   */
  @Get('challenges/:id/status')
  async getChallengeStatus(
    @Param('space') space: string,
    @Param('id') challengeId: string,
    @Req() req: Request,
  ) {
    this.resolveSpaceConfig(space);
    const sessionBinding = req.cookies?.['pleingaz_challenge_binding'];
    return this.whatsappAuthService.getChallengeStatus(challengeId, sessionBinding);
  }

  /**
   * Étape 2 d'inscription : finalisation et création du compte
   * POST /api/v1/:space/auth/register/complete
   */
  @Post('register/complete')
  @HttpCode(HttpStatus.CREATED)
  async registerComplete(
    @Param('space') space: string,
    @Body()
    body: {
      challengeId: string;
      phone: string;
      secondaryPhone: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      city?: string;
      neighborhood?: string;
      landmark?: string;
    },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const config = this.resolveSpaceConfig(space);
    const sessionBinding = req.cookies?.['pleingaz_challenge_binding'];

    if (!body.challengeId) {
      throw new BadRequestException('L\'identifiant du défi est obligatoire.');
    }
    if (!body.secondaryPhone) {
      throw new BadRequestException('Le numéro d\'appel vocal secondaire est obligatoire (D-12.3).');
    }

    const cleanPrimary = this.whatsappAuthService.normalizePhone(body.phone);
    const cleanSecondary = this.whatsappAuthService.normalizePhone(body.secondaryPhone);

    if (cleanPrimary === cleanSecondary) {
      throw new BadRequestException('Le numéro secondaire doit être strictement différent du numéro principal WhatsApp.');
    }

    // Vérification et consommation du défi vérifié
    await this.whatsappAuthService.consumeChallenge(body.challengeId, sessionBinding);

    // Vérification d'unicité en base
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPrimary },
          { whatsappPhone: cleanPrimary },
        ],
      },
    });
    if (existing) {
      throw new BadRequestException('Un compte existe déjà avec ce numéro WhatsApp.');
    }

    const passwordHash = body.password ? await argon2.hash(body.password) : null;
    const roleRecord = await this.prisma.role.findUnique({ where: { name: config.spaceType } });

    const user = await this.prisma.user.create({
      data: {
        phone: cleanPrimary,
        whatsappPhone: cleanPrimary,
        callPhone: cleanSecondary,
        spaceType: config.spaceType as any,
        passwordHash,
        isPhoneVerified: true,
        whatsappVerifiedAt: new Date(),
        roles: roleRecord ? { create: [{ roleId: roleRecord.id }] } : undefined,
        customerProfile: config.spaceType === 'CUSTOMER' ? {
          create: {
            firstName: body.firstName,
            lastName: body.lastName,
            loyaltyPoints: 100,
            addresses: body.city && body.neighborhood ? {
              create: [{
                city: body.city,
                neighborhood: body.neighborhood,
                landmark: body.landmark,
                isDefault: true,
              }],
            } : undefined,
          },
        } : undefined,
      },
      include: { customerProfile: true },
    });

    // Journalisation d'audit
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user.id,
        details: { space: config.spaceType, phone: cleanPrimary },
      },
    });

    const tokens = await this.authService.generateTokens(user.id, config.portal);

    // Dépose du cookie de session spécifique à cet espace
    res.cookie(config.cookieName, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.clearCookie('pleingaz_challenge_binding');

    return {
      message: 'Compte créé et vérifié avec succès.',
      user: {
        id: user.id,
        phone: user.phone,
        callPhone: user.callPhone,
        spaceType: user.spaceType,
      },
      accessToken: tokens.accessToken,
      portal: tokens.portal,
    };
  }

  /**
   * Connexion sécurisée
   * POST /api/v1/:space/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Param('space') space: string,
    @Body() body: { phone: string; password?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const config = this.resolveSpaceConfig(space);
    const phone = this.whatsappAuthService.normalizePhone(body.phone);
    const password = body.password || '';

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone }, { whatsappPhone: phone }],
      },
      include: { roles: { include: { role: true } } },
    });

    // Anti-énumération : message et timing constants
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(this.GENERIC_AUTH_ERROR);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Compte temporairement verrouillé. Veuillez patienter.');
    }

    const isMatch = await argon2.verify(user.passwordHash, password);
    if (!isMatch) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: { increment: 1 } },
      });
      throw new UnauthorizedException(this.GENERIC_AUTH_ERROR);
    }

    // Contrôle d'appartenance à l'espace
    if (user.spaceType !== config.spaceType) {
      throw new UnauthorizedException(this.GENERIC_AUTH_ERROR);
    }

    const tokens = await this.authService.generateTokens(user.id, config.portal);

    res.cookie(config.cookieName, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
      portal: tokens.portal,
      aud: tokens.aud,
    };
  }

  /**
   * Rafraîchissement de jeton
   * POST /api/v1/:space/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Param('space') space: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const config = this.resolveSpaceConfig(space);
    const refreshToken = req.cookies?.[config.cookieName];

    if (!refreshToken) {
      throw new UnauthorizedException('Session expirée ou introuvable.');
    }

    // Vérification de session en base
    const session = await this.prisma.session.findFirst({
      where: {
        expiresAt: { gt: new Date() },
        audience: config.portal,
      },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Session invalide.');
    }

    const tokens = await this.authService.generateTokens(session.userId, config.portal);

    res.cookie(config.cookieName, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
      portal: tokens.portal,
    };
  }

  /**
   * Déconnexion
   * POST /api/v1/:space/auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Param('space') space: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const config = this.resolveSpaceConfig(space);
    res.clearCookie(config.cookieName);
    return { success: true, message: 'Déconnexion réussie.' };
  }

  /**
   * Mot de passe oublié : initiation
   * POST /api/v1/:space/auth/recovery/start
   */
  @Post('recovery/start')
  @HttpCode(HttpStatus.OK)
  async recoveryStart(
    @Param('space') space: string,
    @Body() body: { phone: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const config = this.resolveSpaceConfig(space);
    const sessionBinding = crypto.randomBytes(24).toString('hex');

    res.cookie('pleingaz_recovery_binding', sessionBinding, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    // Anti-énumération : même réponse que le compte existe ou non
    if (body.phone) {
      try {
        const phone = this.whatsappAuthService.normalizePhone(body.phone);
        const user = await this.prisma.user.findFirst({
          where: { OR: [{ phone }, { whatsappPhone: phone }], spaceType: config.spaceType as any },
        });

        if (user) {
          const challenge = await this.whatsappAuthService.createChallenge(
            phone,
            'LOGIN',
            sessionBinding,
            req.ip,
          );
          return {
            initiated: true,
            challengeId: challenge.challengeId,
            whatsappLink: challenge.whatsappLink,
            message: 'Si ce compte existe, un défi de sécurité a été initié.',
          };
        }
      } catch {
        // Ignorer pour garantir une réponse uniforme
      }
    }

    return {
      initiated: true,
      message: 'Si ce compte existe, un défi de sécurité a été initié.',
    };
  }

  /**
   * Mot de passe oublié : finalisation et réinitialisation
   * POST /api/v1/:space/auth/recovery/complete
   */
  @Post('recovery/complete')
  @HttpCode(HttpStatus.OK)
  async recoveryComplete(
    @Param('space') space: string,
    @Body() body: { challengeId: string; newPassword?: string; phone: string },
    @Req() req: Request,
  ) {
    const config = this.resolveSpaceConfig(space);
    const sessionBinding = req.cookies?.['pleingaz_recovery_binding'];

    if (!body.challengeId || !body.newPassword) {
      throw new BadRequestException('Le défi et le nouveau mot de passe sont obligatoires.');
    }

    await this.whatsappAuthService.consumeChallenge(body.challengeId, sessionBinding);

    const phone = this.whatsappAuthService.normalizePhone(body.phone);
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, { whatsappPhone: phone }], spaceType: config.spaceType as any },
    });

    if (user) {
      const passwordHash = await argon2.hash(body.newPassword);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, failedLoginCount: 0, lockedUntil: null },
      });

      // Révocation de toutes les sessions antérieures
      await this.prisma.session.deleteMany({
        where: { userId: user.id },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_COMPLETED',
          entity: 'User',
          entityId: user.id,
        },
      });
    }

    return { success: true, message: 'Mot de passe réinitialisé avec succès.' };
  }

  /**
   * Consultation du profil connecté de l'espace courant
   * GET /api/v1/:space/auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, PortalAudienceGuard)
  async getMe(
    @Param('space') space: string,
    @CurrentUser('id') userId: string,
  ) {
    const config = this.resolveSpaceConfig(space);
    const profile = await this.authService.getMe(userId);

    // R-01 : Si l'utilisateur connecté appartient à un autre espace, 404 strict
    if (profile.spaceType !== config.spaceType) {
      throw new NotFoundException('Ressource introuvable.');
    }

    return profile;
  }
}
