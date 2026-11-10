import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Res, UseGuards, Req, Headers } from '@nestjs/common';
import { AuthService, PortalType } from './auth.service';
import { WhatsAppAuthService } from './whatsapp-auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly whatsAppAuthService: WhatsAppAuthService,
  ) {}

  /**
   * Inscription d'un acheteur avec règle des 2 numéros obligatoires (D-12.3)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body()
    body: {
      phone: string;
      backupPhone?: string;
      callPhone?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
      city?: string;
      neighborhood?: string;
      landmark?: string;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerCustomer(body);

    res.cookie('refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: result.message,
      user: result.user,
      accessToken: result.tokens.accessToken,
      portal: result.tokens.portal,
    };
  }

  /**
   * Connexion par Numéro WhatsApp + Mot de passe (D-11, D-12)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body()
    body: {
      phone: string;
      password?: string;
      pass?: string;
      portal?: PortalType;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const password = body.password || body.pass || '';
    const portal = body.portal || 'CUSTOMER';

    const tokens = await this.authService.loginWithPhonePassword(body.phone, password, portal);

    res.cookie('refresh_token', tokens.refreshToken, {
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
   * Demande de défi éphémère WhatsApp (Preuve Entrante D-12)
   */
  @Post('challenge/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateChallenge(
    @Body()
    body: {
      phone: string;
      purpose?: 'LOGIN' | 'REGISTER' | 'PHONE_CHANGE';
    },
    @Req() req: Request,
  ) {
    const forwarded = req.headers ? req.headers['x-forwarded-for'] : undefined;
    const ipAddress = (Array.isArray(forwarded) ? forwarded[0] : (forwarded as string | undefined)) || req.socket?.remoteAddress;
    return this.authService.initiateWhatsAppChallenge(body.phone, body.purpose || 'LOGIN', ipAddress);
  }

  /**
   * Validation d'un défi éphémère WhatsApp par code
   */
  @Post('challenge/verify')
  @HttpCode(HttpStatus.OK)
  async verifyChallenge(
    @Body()
    body: {
      phone: string;
      code: string;
      portal?: PortalType;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const portal = body.portal || 'CUSTOMER';
    const tokens = await this.authService.verifyWhatsAppChallengeAndLogin(body.phone, body.code, portal);

    res.cookie('refresh_token', tokens.refreshToken, {
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
   * Webhook de réception Meta WhatsApp Cloud API (Preuve Entrante Inbound)
   */
  @Post('webhook/whatsapp')
  @HttpCode(HttpStatus.OK)
  async webhookWhatsApp(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature?: string,
  ) {
    // Cas payload standard WhatsApp Cloud API
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (message && message.from && message.text?.body) {
      return this.whatsAppAuthService.verifyIncomingMessage(
        message.from,
        message.text.body,
      );
    }

    // Cas test simplifié / émulation directe
    if (body.senderPhone && body.messageText) {
      return this.whatsAppAuthService.verifyIncomingMessage(
        body.senderPhone,
        body.messageText,
      );
    }

    return { received: true };
  }

  /**
   * Profil de la session active
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('id') userId: string): Promise<any> {
    return this.authService.getMe(userId);
  }

  // ==========================================
  // ENDPOINTS CR-003 WHATSAPP AUTH (D-12)
  // ==========================================

  @Get('challenge/:id/status')
  async getChallengeStatus(@Param('id') challengeId: string) {
    return this.whatsAppAuthService.getChallengeStatus(challengeId);
  }

  @Post('challenge/simulate-verify')
  @HttpCode(HttpStatus.OK)
  async simulateVerify(@Body() body: { challengeId: string }) {
    return this.whatsAppAuthService.simulateChallengeVerification(body.challengeId);
  }

  @Post('register-whatsapp')
  @HttpCode(HttpStatus.CREATED)
  async registerWithWhatsApp(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.whatsAppAuthService.registerWithWhatsApp(body);

    res.cookie('refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: result.message,
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Post('login-whatsapp')
  @HttpCode(HttpStatus.OK)
  async loginWithWhatsApp(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.whatsAppAuthService.loginWithWhatsApp(body);

    res.cookie('refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: result.message,
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  /**
   * Demande de réinitialisation de mot de passe par WhatsApp (100% gratuit)
   */
  @Post('forgot-password/initiate')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordInitiate(
    @Body() body: { phone: string },
    @Req() req: Request,
  ) {
    const forwarded = req.headers ? req.headers['x-forwarded-for'] : undefined;
    const ipAddress =
      (Array.isArray(forwarded)
        ? forwarded[0]
        : (forwarded as string | undefined)) || req.socket?.remoteAddress;
    return this.whatsAppAuthService.initiateChallenge({
      phone: body.phone,
      purpose: 'PASSWORD_RESET',
      ipAddress,
    });
  }

  /**
   * Validation du code WhatsApp et réinitialisation du mot de passe
   */
  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordReset(
    @Body()
    body: {
      phone: string;
      code: string;
      newPassword?: string;
    },
  ) {
    return this.whatsAppAuthService.resetPasswordWithWhatsApp(body);
  }
}
