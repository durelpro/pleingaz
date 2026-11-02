import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WhatsAppAuthService } from './whatsapp-auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly whatsAppAuthService: WhatsAppAuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body()
    body: {
      phone: string;
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
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('id') userId: string): Promise<any> {
    return this.authService.getMe(userId);
  }

  @Post('login/otp')
  @HttpCode(HttpStatus.OK)
  async loginWithOTP(@Body() body: { phone: string; otp: string }, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.validatePhoneOTP(body.phone, body.otp);
    
    // Refresh token in HttpOnly Cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('login/email')
  @HttpCode(HttpStatus.OK)
  async loginWithEmail(@Body() body: { email: string; pass: string }, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.validateEmailPassword(body.email, body.pass);
    
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  // ==========================================
  // ENDPOINTS CR-003 WHATSAPP AUTH (D-12)
  // ==========================================

  @Post('challenge/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateChallenge(@Body() body: { phone: string; purpose?: any }) {
    return this.whatsAppAuthService.initiateChallenge(body);
  }

  @Get('challenge/:id/status')
  async getChallengeStatus(@Param('id') challengeId: string) {
    return this.whatsAppAuthService.getChallengeStatus(challengeId);
  }

  @Post('challenge/simulate-verify')
  @HttpCode(HttpStatus.OK)
  async simulateVerify(@Body() body: { challengeId: string }) {
    return this.whatsAppAuthService.simulateChallengeVerification(body.challengeId);
  }

  @Post('webhook/whatsapp')
  @HttpCode(HttpStatus.OK)
  async handleWhatsAppWebhook(@Body() body: { senderPhone: string; messageText: string }) {
    return this.whatsAppAuthService.verifyIncomingMessage(body.senderPhone, body.messageText);
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
}

