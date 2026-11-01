import { Controller, Post, Get, Body, HttpCode, HttpStatus, Res, UseGuards, Req, Headers } from '@nestjs/common';
import { AuthService, PortalType } from './auth.service';
import { WhatsAppAuthService } from './services/whatsapp-auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly whatsappAuthService: WhatsAppAuthService,
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
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;
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
      return this.whatsappAuthService.handleInboundWebhook(
        message.from,
        message.text.body,
        signature,
      );
    }

    // Cas test simplifié / émulation directe
    if (body.senderPhone && body.messageText) {
      return this.whatsappAuthService.handleInboundWebhook(
        body.senderPhone,
        body.messageText,
        signature,
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
}
