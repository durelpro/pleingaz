import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

export interface ChallengeResponse {
  challengeId: string;
  code: string;
  whatsappLink: string;
  expiresAt: Date;
  officialNumber: string;
}

@Injectable()
export class WhatsAppAuthService {
  private readonly logger = new Logger(WhatsAppAuthService.name);
  private readonly OFFICIAL_WHATSAPP_NUMBER = process.env.OFFICIAL_WHATSAPP_NUMBER || '+237699000000';
  private readonly CHALLENGE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Normalise un numéro au format E.164 (+2376XXXXXXXX)
   */
  normalizePhone(phone: string): string {
    if (!phone) {
      throw new BadRequestException('Le numéro de téléphone est obligatoire');
    }
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    if (cleaned.startsWith('00')) {
      return `+${cleaned.substring(2)}`;
    }
    // Cas camerounais par défaut (ex: 6XXXXXXXX)
    const local = cleaned.replace(/^0+/, '');
    return `+237${local}`;
  }

  /**
   * Génère un code de défi court aléatoire (ex: "PG-7489")
   */
  private generateChallengeCode(): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    return `PG-${randomDigits}`;
  }

  /**
   * Crée un nouveau défi de preuve entrante WhatsApp (D-12, C-04)
   */
  async createChallenge(
    phoneInput: string,
    purpose: 'LOGIN' | 'REGISTER' | 'PHONE_CHANGE' = 'LOGIN',
    ipAddress?: string,
  ): Promise<ChallengeResponse> {
    const phone = this.normalizePhone(phoneInput);
    const code = this.generateChallengeCode();
    const codeHash = await argon2.hash(code);
    const expiresAt = new Date(Date.now() + this.CHALLENGE_TTL_MS);

    // Invalide les défis non consommés antérieurs pour ce numéro
    await this.prisma.verificationChallenge.updateMany({
      where: {
        phone,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    const challenge = await this.prisma.verificationChallenge.create({
      data: {
        phone,
        codeHash,
        purpose,
        channel: 'WHATSAPP',
        ipAddress: ipAddress || '127.0.0.1',
        expiresAt,
      },
    });

    // Génération de l'URL universelle WhatsApp avec message prérempli
    const message = encodeURIComponent(`CONNEXION PLEINGAZ : ${code}`);
    const whatsappLink = `https://wa.me/${this.OFFICIAL_WHATSAPP_NUMBER.replace('+', '')}?text=${message}`;

    this.logger.log(`[WHATSAPP-AUTH] Défi généré pour ${phone} : ${code} (Exp: ${expiresAt.toISOString()})`);

    return {
      challengeId: challenge.id,
      code,
      whatsappLink,
      expiresAt,
      officialNumber: this.OFFICIAL_WHATSAPP_NUMBER,
    };
  }

  /**
   * Vérifie un code soumis par l'utilisateur ou acquitté par le webhook
   */
  async verifyChallenge(phoneInput: string, codeInput: string): Promise<boolean> {
    const phone = this.normalizePhone(phoneInput);
    const cleanCode = codeInput.trim().toUpperCase();

    const challenge = await this.prisma.verificationChallenge.findFirst({
      where: {
        phone,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new UnauthorizedException('Aucun défi WhatsApp actif ou le délai de 10 minutes a expiré.');
    }

    if (challenge.attempts >= 5) {
      await this.prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() },
      });
      throw new UnauthorizedException('Trop de tentatives infructueuses sur ce défi WhatsApp.');
    }

    const isValid = await argon2.verify(challenge.codeHash, cleanCode);
    if (!isValid) {
      await this.prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Code de défi WhatsApp incorrect.');
    }

    // Marquer comme consommé avec succès
    await this.prisma.verificationChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    return true;
  }

  /**
   * Traite un webhook entrant de Meta WhatsApp Cloud API (Preuve Entrante)
   */
  async handleInboundWebhook(senderPhone: string, messageText: string, signature?: string): Promise<{ success: boolean; phone: string; code?: string }> {
    const phone = this.normalizePhone(senderPhone);
    const codeMatch = messageText.match(/PG-\d{4}/i);

    if (!codeMatch) {
      this.logger.warn(`[WEBHOOK-WHATSAPP] Message reçu sans code PG valide de ${phone} : ${messageText}`);
      return { success: false, phone };
    }

    const code = codeMatch[0].toUpperCase();
    const verified = await this.verifyChallenge(phone, code);

    this.logger.log(`[WEBHOOK-WHATSAPP] Preuve entrante validée avec succès pour ${phone} (Code: ${code})`);
    return { success: verified, phone, code };
  }
}
