import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
