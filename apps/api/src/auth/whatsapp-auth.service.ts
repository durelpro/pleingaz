import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

export interface InitiateChallengeDto {
  phone: string;
  purpose?: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET' | 'PHONE_CHANGE';
  ipAddress?: string;
}

export interface RegisterWithWhatsAppDto {
  challengeId: string;
  whatsappPhone: string;
  callPhone: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  neighborhood?: string;
  landmark?: string;
}

export interface LoginWithWhatsAppDto {
  whatsappPhone: string;
  password?: string;
}

@Injectable()
export class WhatsAppAuthService {
  private readonly OFFICIAL_WHATSAPP_NUMBER = process.env.WHATSAPP_OFFICIAL_NUMBER || '+237657696567';
  private readonly CHALLENGE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Normalise un numéro en format international E.164 (+237...)
   */
  normalizeE164(phone: string): string {
    if (!phone) {
      throw new BadRequestException('Le numéro de téléphone est obligatoire');
    }
    const clean = phone.replace(/[\s\-\(\)]/g, '').trim();
    if (clean.startsWith('+')) {
      return clean;
    }
    // Si format camerounais standard sans indicatif (ex: 6XXXXXXXX)
    const digitsOnly = clean.replace(/^00/, '').replace(/^0+/, '');
    if (digitsOnly.startsWith('237')) {
      return `+${digitsOnly}`;
    }
    return `+237${digitsOnly}`;
  }

  /**
   * Génère un défi court de preuve entrante WhatsApp (ex: PG-4921)
   */
  async initiateChallenge(dto: InitiateChallengeDto) {
    const cleanPhone = this.normalizeE164(dto.phone);
    const purpose = dto.purpose || 'REGISTER';

    // Génération d'un code alphanumérique lisible à 4 caractères (ex: PG-8492)
    const randomSuffix = crypto.randomInt(1000, 9999).toString();
    const code = `PG-${randomSuffix}`;
    const codeHash = await argon2.hash(code);

    const expiresAt = new Date(Date.now() + this.CHALLENGE_TTL_MS);

    const challenge = await this.prisma.verificationChallenge.create({
      data: {
        phone: cleanPhone,
        codeHash,
        purpose,
        channel: 'WHATSAPP',
        ipAddress: dto.ipAddress || null,
        expiresAt,
      },
    });

    const prefilledText = encodeURIComponent(
      `PLEINGAZ : Activer mon compte code ${code}. Ne partagez jamais ce message.`
    );
    const targetNumber = this.OFFICIAL_WHATSAPP_NUMBER.replace('+', '');
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${prefilledText}`;

    return {
      challengeId: challenge.id,
      code,
      phone: cleanPhone,
      purpose,
      expiresAt,
      whatsappUrl,
      officialNumber: this.OFFICIAL_WHATSAPP_NUMBER,
    };
  }

  /**
   * Traite la réception d'un webhook entrant ou d'un message simulé
   */
  async verifyIncomingMessage(senderPhone: string, messageText: string) {
    const cleanSender = this.normalizeE164(senderPhone);

    // Extraction du code PG-XXXX ou similaire dans le texte
    const match = messageText.match(/PG-\d{4}/i);
    if (!match) {
      throw new BadRequestException('Format de message invalide : code PG-XXXX manquant');
    }
    const code = match[0].toUpperCase();

    // Recherche des défis non expirés et non consommés pour ce numéro
    const activeChallenges = await this.prisma.verificationChallenge.findMany({
      where: {
        phone: cleanSender,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    if (!activeChallenges || activeChallenges.length === 0) {
      throw new NotFoundException('Aucun défi actif en attente pour ce numéro de téléphone');
    }

    let matchingChallenge = null;
    for (const ch of activeChallenges) {
      if (ch.attempts >= this.MAX_ATTEMPTS) {
        continue;
      }
      const isMatch = await argon2.verify(ch.codeHash, code);
      if (isMatch) {
        matchingChallenge = ch;
        break;
      } else {
        await this.prisma.verificationChallenge.update({
          where: { id: ch.id },
          data: { attempts: { increment: 1 } },
        });
      }
    }

    if (!matchingChallenge) {
      throw new UnauthorizedException('Code de défi invalide ou tentatives dépassées');
    }

    // Marquer le défi comme consommé
    const consumed = await this.prisma.verificationChallenge.update({
      where: { id: matchingChallenge.id },
      data: { consumedAt: new Date() },
    });

    return {
      verified: true,
      challengeId: consumed.id,
      phone: consumed.phone,
      purpose: consumed.purpose,
    };
  }

  /**
   * Permet la validation simulée en mode développement / tests automatisés
   */
  async simulateChallengeVerification(challengeId: string) {
    const challenge = await this.prisma.verificationChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Défi introuvable');
    }
    if (challenge.consumedAt) {
      return { verified: true, challengeId: challenge.id, alreadyConsumed: true };
    }
    if (challenge.expiresAt < new Date()) {
      throw new BadRequestException('Le défi a expiré');
    }

    const updated = await this.prisma.verificationChallenge.update({
      where: { id: challengeId },
      data: { consumedAt: new Date() },
    });

    return {
      verified: true,
      challengeId: updated.id,
      phone: updated.phone,
      purpose: updated.purpose,
    };
  }

  /**
   * Vérifie le statut d'un challenge (pour polling / SSE navigateur)
   */
  async getChallengeStatus(challengeId: string) {
    const challenge = await this.prisma.verificationChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Défi introuvable');
    }

    const isExpired = challenge.expiresAt < new Date();
    const isVerified = challenge.consumedAt !== null;

    return {
      id: challenge.id,
      phone: challenge.phone,
      purpose: challenge.purpose,
      status: isVerified ? 'VERIFIED' : isExpired ? 'EXPIRED' : 'PENDING',
      consumedAt: challenge.consumedAt,
      expiresAt: challenge.expiresAt,
    };
  }

  /**
   * Inscription sécurisée WhatsApp avec la règle des deux numéros (D-12.3)
   */
  async registerWithWhatsApp(dto: RegisterWithWhatsAppDto) {
    const whatsappPhone = this.normalizeE164(dto.whatsappPhone);
    const callPhone = this.normalizeE164(dto.callPhone);

    // Règle des deux numéros obligatoires et distincts (D-12.3)
    if (whatsappPhone === callPhone) {
      throw new BadRequestException(
        'Le numéro de secours (appel) doit être obligatoirement distinct du numéro WhatsApp principal'
      );
    }

    // Vérification du défi
    const challenge = await this.prisma.verificationChallenge.findUnique({
      where: { id: dto.challengeId },
    });

    if (!challenge) {
      throw new BadRequestException('Défi de vérification introuvable');
    }
    if (challenge.phone !== whatsappPhone) {
      throw new UnauthorizedException('Le défi ne correspond pas au numéro WhatsApp fourni');
    }
    if (!challenge.consumedAt) {
      throw new UnauthorizedException("La preuve entrante WhatsApp n'a pas encore été validée");
    }

    // Vérifier l'unicité du numéro principal et du numéro WhatsApp
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: whatsappPhone },
          { whatsappPhone: whatsappPhone },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Un compte existe déjà avec ce numéro WhatsApp. Veuillez vous connecter.');
    }

    const passwordHash = dto.password ? await argon2.hash(dto.password) : null;

    const customerRole = await this.prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });

    const user = await this.prisma.user.create({
      data: {
        phone: whatsappPhone,
        whatsappPhone,
        callPhone,
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

    // Lier le challenge à l'utilisateur
    await this.prisma.verificationChallenge.update({
      where: { id: challenge.id },
      data: { userId: user.id },
    });

    const tokens = await this.generateTokens(user.id);

    return {
      message: 'Compte acheteur créé avec succès via validation WhatsApp !',
      user: {
        id: user.id,
        phone: user.phone,
        whatsappPhone: user.whatsappPhone,
        callPhone: user.callPhone,
        firstName: user.customerProfile?.firstName,
        lastName: user.customerProfile?.lastName,
        loyaltyPoints: user.customerProfile?.loyaltyPoints ?? 100,
      },
      tokens,
    };
  }

  /**
   * Connexion avec le numéro WhatsApp principal et mot de passe
   */
  async loginWithWhatsApp(dto: LoginWithWhatsAppDto) {
    const whatsappPhone = this.normalizeE164(dto.whatsappPhone);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { whatsappPhone },
          { phone: whatsappPhone },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(`Compte verrouillé jusqu'à ${user.lockedUntil.toISOString()}`);
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Aucun mot de passe configuré sur ce compte. Veuillez utiliser la réinitialisation.');
    }

    if (!dto.password) {
      throw new BadRequestException('Le mot de passe est obligatoire');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      const attempts = user.failedAttempts + 1;
      let lockedUntil = null;
      if (attempts >= this.MAX_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: attempts, lockedUntil },
      });
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Reset lockout
    if (user.failedAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    }

    const tokens = await this.generateTokens(user.id);
    return {
      message: 'Connexion réussie',
      user: {
        id: user.id,
        phone: user.phone,
        whatsappPhone: user.whatsappPhone,
      },
      tokens,
    };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshHash = await argon2.hash(refreshToken);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken: refreshHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Réinitialisation de mot de passe par vérification de défi WhatsApp
   */
  async resetPasswordWithWhatsApp(dto: {
    phone: string;
    code: string;
    newPassword?: string;
  }) {
    const cleanPhone = this.normalizeE164(dto.phone);

    const activeChallenges = await this.prisma.verificationChallenge.findMany({
      where: {
        phone: cleanPhone,
        purpose: 'PASSWORD_RESET',
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    if (!activeChallenges || activeChallenges.length === 0) {
      throw new BadRequestException('Aucune demande de réinitialisation en cours ou code expiré.');
    }

    let matchingChallenge = null;
    const cleanCode = dto.code.trim().toUpperCase();

    for (const ch of activeChallenges) {
      if (ch.attempts >= this.MAX_ATTEMPTS) {
        continue;
      }
      const isMatch = await argon2.verify(ch.codeHash, cleanCode);
      if (isMatch) {
        matchingChallenge = ch;
        break;
      } else {
        await this.prisma.verificationChallenge.update({
          where: { id: ch.id },
          data: { attempts: { increment: 1 } },
        });
      }
    }

    if (!matchingChallenge) {
      throw new BadRequestException('Code de confirmation incorrect.');
    }

    // Marquer le défi comme consommé
    await this.prisma.verificationChallenge.update({
      where: { id: matchingChallenge.id },
      data: { consumedAt: new Date() },
    });

    // Mettre à jour le mot de passe
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ phone: cleanPhone }, { whatsappPhone: cleanPhone }] },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const newPass = dto.newPassword || 'Pleingaz2026!';
    const passwordHash = await argon2.hash(newPass);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès.',
    };
  }
}
