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

  async registerCustomer(dto: { phone: string; password: string; firstName: string; lastName: string; email?: string }) {
    let cleanPhone = dto.phone.trim().replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+237')) {
      if (cleanPhone.startsWith('237')) {
        cleanPhone = `+${cleanPhone}`;
      } else {
        cleanPhone = `+237${cleanPhone}`;
      }
    }

    // Check if phone or email already registered
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(dto.email ? [{ email: dto.email.trim() }] : []),
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Un compte existe déjà avec ce numéro de téléphone ou cet email');
    }

    // Ensure CUSTOMER role exists
    let customerRole = await this.prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });
    if (!customerRole) {
      customerRole = await this.prisma.role.create({
        data: { name: 'CUSTOMER', description: 'Client acheteur PLEINGAZ' },
      });
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        phone: cleanPhone,
        email: dto.email?.trim() || null,
        passwordHash,
        isPhoneVerified: true,
        loyaltyPoints: 100, // Bonus de bienvenue
        roles: {
          create: {
            roleId: customerRole.id,
          },
        },
        customerProfile: {
          create: {
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
          },
        },
      },
      include: {
        customerProfile: true,
        roles: { include: { role: true } },
      },
    });

    const tokens = await this.generateTokens(user.id);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        loyaltyPoints: user.loyaltyPoints,
        roles: user.roles.map((r) => r.role.name),
        profile: user.customerProfile,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: { include: { addresses: true } },
        roles: { include: { role: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      loyaltyPoints: user.loyaltyPoints,
      roles: user.roles.map((r) => r.role.name),
      profile: user.customerProfile,
    };
  }

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

  async validatePhonePassword(phoneOrEmail: string, pass: string) {
    const clean = phoneOrEmail.trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: clean },
          { phone: `+237${clean}` },
          { phone: clean.startsWith('+237') ? clean.replace('+237', '') : `+237${clean}` },
          { email: clean }
        ]
      }
    });

    if (!user) {
      throw new UnauthorizedException('Numéro ou mot de passe incorrect');
    }

    this.checkLockout(user);

    if (!user.passwordHash) {
      throw new BadRequestException('Aucun mot de passe configuré pour ce compte');
    }

    const isMatch = await argon2.verify(user.passwordHash, pass);
    if (!isMatch) {
      await this.incrementFailedAttempts(user);
      throw new UnauthorizedException('Numéro ou mot de passe incorrect');
    }

    await this.resetFailedAttempts(user);
    const tokens = await this.generateTokens(user.id);

    // Fetch user details with roles
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        customerProfile: true,
        roles: { include: { role: true } },
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: fullUser?.id || user.id,
        phone: fullUser?.phone || user.phone,
        email: fullUser?.email,
        loyaltyPoints: fullUser?.loyaltyPoints || 0,
        roles: fullUser?.roles.map((r) => r.role.name) || [],
        profile: fullUser?.customerProfile || null,
      },
    };
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
