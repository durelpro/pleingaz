import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { WhatsAppAuthService } from './services/whatsapp-auth.service';
import { PortalAudience, JWT_EXPIRATION_ACCESS, JWT_EXPIRATION_REFRESH } from './constants/jwt.config';

export type PortalType = 'CUSTOMER' | 'DISTRIBUTOR' | 'COURIER' | 'STAFF';

@Injectable()
export class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  private readonly GENERIC_AUTH_ERROR = 'Identifiants non reconnus. Veuillez vérifier votre numéro et mot de passe.';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly whatsappAuthService: WhatsAppAuthService,
  ) {}

  /**
   * Résout l'audience portail associée au type d'espace (D-11, CR-003 R-01)
   */
  private getAudienceForPortal(portal: PortalType): string {
    switch (portal) {
      case 'CUSTOMER':
        return PortalAudience.CUSTOMER;
      case 'DISTRIBUTOR':
        return PortalAudience.DISTRIBUTOR;
      case 'COURIER':
        return PortalAudience.COURIER;
      case 'STAFF':
        return PortalAudience.STAFF;
      default:
        return PortalAudience.CUSTOMER;
    }
  }

  /**
   * Normalisation E.164
   */
  private normalizePhone(phone: string): string {
    return this.whatsappAuthService.normalizePhone(phone);
  }

  /**
   * Initialise un défi de preuve entrante WhatsApp (D-12)
   */
  async initiateWhatsAppChallenge(phone: string, purpose: 'LOGIN' | 'REGISTER' | 'PHONE_CHANGE' = 'LOGIN', ipAddress?: string) {
    return this.whatsappAuthService.createChallenge(phone, purpose, ipAddress);
  }

  /**
   * Valide un défi WhatsApp entrant et connecte l'utilisateur
   */
  async verifyWhatsAppChallengeAndLogin(phoneInput: string, code: string, portal: PortalType = 'CUSTOMER') {
    const phone = this.normalizePhone(phoneInput);
    await this.whatsappAuthService.verifyChallenge(phone, code);

    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Aucun compte associé à ce numéro. Veuillez créer un compte.');
    }

    this.checkLockout(user);
    await this.resetFailedAttempts(user);

    return this.generateTokens(user.id, portal);
  }

  /**
   * Inscription d'un acheteur avec la Règle des 2 Numéros Obligatoires (D-12.3)
   */
  async registerCustomer(dto: {
    phone: string;
    backupPhone?: string;
    callPhone?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    city?: string;
    neighborhood?: string;
    landmark?: string;
  }) {
    if (!dto.phone) {
      throw new BadRequestException('Le numéro WhatsApp principal est obligatoire.');
    }

    const cleanPhone = this.normalizePhone(dto.phone);
    const secondaryRaw = dto.backupPhone || dto.callPhone;

    if (!secondaryRaw) {
      throw new BadRequestException('Le numéro secondaire de secours (contact d\'urgence) est obligatoire (D-12.3).');
    }

    const cleanSecondary = this.normalizePhone(secondaryRaw);

    // Règle 1 : Les deux numéros doivent être strictement distincts (D-12.3)
    if (cleanPhone === cleanSecondary) {
      throw new BadRequestException('Le numéro secondaire doit être strictement différent du numéro WhatsApp principal.');
    }

    // Règle 2 : Le numéro principal ne doit pas déjà exister
    const existingPrimary = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
    });
    if (existingPrimary) {
      throw new BadRequestException('Un compte existe déjà avec ce numéro WhatsApp principal.');
    }

    // Règle 3 Anti-contournement (C-03.2) : Le numéro secondaire ne doit pas être le numéro principal d'un autre utilisateur
    const collisionUser = await this.prisma.user.findUnique({
      where: { phone: cleanSecondary },
    });
    if (collisionUser) {
      throw new BadRequestException('Ce numéro secondaire est déjà utilisé comme numéro principal d\'un autre compte actif.');
    }

    // Hachage Argon2id si mot de passe fourni
    const passwordHash = dto.password ? await argon2.hash(dto.password) : null;

    const customerRole = await this.prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });

    const user = await this.prisma.user.create({
      data: {
        phone: cleanPhone,
        callPhone: cleanSecondary,
        passwordHash,
        isPhoneVerified: true,
        roles: customerRole ? { create: [{ roleId: customerRole.id }] } : undefined,
        customerProfile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            loyaltyPoints: 100, // 100 points de bienvenue
            addresses: dto.city && dto.neighborhood ? {
              create: [
                {
                  city: dto.city,
                  neighborhood: dto.neighborhood,
                  landmark: dto.landmark,
                  isDefault: true,
                },
              ],
            } : undefined,
          },
        },
      },
      include: {
        customerProfile: {
          include: { addresses: true },
        },
      },
    });

    const tokens = await this.generateTokens(user.id, 'CUSTOMER');
    return {
      message: 'Compte acheteur créé avec succès ! 100 points de bienvenue ont été crédités.',
      user: {
        id: user.id,
        phone: user.phone,
        callPhone: user.callPhone,
        firstName: user.customerProfile?.firstName,
        lastName: user.customerProfile?.lastName,
        loyaltyPoints: user.customerProfile?.loyaltyPoints ?? 100,
      },
      tokens,
    };
  }

  /**
   * Connexion sécurisée avec Numéro WhatsApp + Mot de passe (D-11, D-12)
   */
  async loginWithPhonePassword(phoneInput: string, pass: string, portal: PortalType = 'CUSTOMER') {
    const phone = this.normalizePhone(phoneInput);
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException(this.GENERIC_AUTH_ERROR);
    }

    this.checkLockout(user);

    if (!user.passwordHash) {
      await this.incrementFailedAttempts(user);
      throw new UnauthorizedException(this.GENERIC_AUTH_ERROR);
    }

    const isMatch = await argon2.verify(user.passwordHash, pass);
    if (!isMatch) {
      await this.incrementFailedAttempts(user);
      throw new UnauthorizedException(this.GENERIC_AUTH_ERROR);
    }

    // Vérification de compatibilité de rôle avec le portail demandé (Règle d'étanchéité D-11)
    const userRoles = user.roles.map(ur => ur.role.name);
    const hasPortalAccess = this.verifyPortalRoleAccess(userRoles, portal);

    if (!hasPortalAccess) {
      // Message générique invariant pour ne pas révéler les rôles
      throw new UnauthorizedException(this.GENERIC_AUTH_ERROR);
    }

    await this.resetFailedAttempts(user);
    return this.generateTokens(user.id, portal);
  }

  /**
   * Contrôle d'accès aux portails selon les rôles RBAC
   */
  private verifyPortalRoleAccess(userRoles: string[], portal: PortalType): boolean {
    if (userRoles.includes('SUPER_ADMIN')) {
      return true; // Super Admin a accès de supervision
    }

    switch (portal) {
      case 'CUSTOMER':
        return userRoles.includes('CUSTOMER');
      case 'DISTRIBUTOR':
        return userRoles.includes('DISTRIBUTOR');
      case 'COURIER':
        return userRoles.includes('COURIER');
      case 'STAFF':
        return userRoles.some(r =>
          ['ADMIN', 'SUPPORT_AGENT', 'DISTRIBUTOR_MANAGER', 'LOGISTICS_MANAGER', 'FINANCE_MANAGER', 'ACCOUNT_MANAGER'].includes(r)
        );
      default:
        return false;
    }
  }

  /**
   * Validation progressive de lockout
   */
  private checkLockout(user: any) {
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      throw new ForbiddenException(
        `Compte temporairement verrouillé par mesure de sécurité. Réessayez dans ${minutesRemaining} minute(s).`
      );
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

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getMe(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        callPhone: true,
        email: true,
        spaceType: true,
        status: true,
        roles: { include: { role: true } },
        customerProfile: {
          include: { addresses: true },
        },
        distributorApp: {
          include: { documents: true, store: true },
        },
        courierProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const recentOrders = await this.prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: { include: { product: true } },
        store: { select: { name: true, city: true } },
      },
    });

    return {
      ...user,
      recentOrders,
    };
  }

  /**
   * Génération de jetons JWT avec Audience Portails (CR-003 D-11, R-01)
   */
  async generateTokens(userId: string, portal: PortalType = 'CUSTOMER') {
    const audience = this.getAudienceForPortal(portal);
    const payload = {
      sub: userId,
      portal,
      aud: audience,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: JWT_EXPIRATION_ACCESS });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: JWT_EXPIRATION_REFRESH });
    const refreshHash = await argon2.hash(refreshToken);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken: refreshHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });

    return { accessToken, refreshToken, portal, aud: audience };
  }
}
