import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validatePhoneOTP(phone: string, otp: string) {
    // Simulons la validation OTP locale pour le développement.
    // En production, vérifier via le service SMS externe.
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    
    this.checkLockout(user);

    if (otp !== '1234') { // Fake OTP pour le dev
      await this.incrementFailedAttempts(user);
      throw new UnauthorizedException('OTP invalide');
    }

    await this.resetFailedAttempts(user);
    return this.generateTokens(user.id);
  }

  async validateEmailPassword(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    this.checkLockout(user);

    if (!user.passwordHash) {
      throw new BadRequestException('Mot de passe non défini pour ce compte');
    }

    const isMatch = await argon2.verify(user.passwordHash, pass);
    if (!isMatch) {
      await this.incrementFailedAttempts(user);
      throw new UnauthorizedException('Identifiants invalides');
    }

    await this.resetFailedAttempts(user);
    return this.generateTokens(user.id);
  }

  private checkLockout(user: any) {
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(`Compte verrouillé jusqu'à ${user.lockedUntil.toISOString()}`);
    }
  }

  private async incrementFailedAttempts(user: any) {
    let { failedAttempts } = user;
    failedAttempts += 1;

    let lockedUntil = null;
    if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + this.LOCK_DURATION_MS);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts, lockedUntil },
    });
  }

  private async resetFailedAttempts(user: any) {
    if (user.failedAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    }
  }

  async generateTokens(userId: string) {
    const payload = { sub: userId };
    
    // Access token court (ex: 15m)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    // Refresh token long (ex: 7d)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshHash = await argon2.hash(refreshToken);

    // Save refresh token session (with real UserAgent/IP in production)
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken: refreshHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  }
}
