import { Injectable, BadRequestException, UnauthorizedException, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { SimulatedChannel } from './channels/simulated.channel';
import { WhatsAppInboundChannel } from './channels/whatsapp-inbound.channel';
import { ManualAssistedChannel } from './channels/manual-assisted.channel';

export interface ChallengeResponse {
  challengeId: string;
  code: string;
  whatsappLink: string;
  expiresAt: Date;
  officialNumber: string;
  sessionBinding: string;
}

export type ChallengeStatus = 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'CONSUMED';

@Injectable()
export class WhatsAppAuthService {
  private readonly logger = new Logger(WhatsAppAuthService.name);
  private readonly OFFICIAL_WHATSAPP_NUMBER = process.env.OFFICIAL_WHATSAPP_NUMBER || '+237699000000';
  private readonly CHALLENGE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly simulatedChannel: SimulatedChannel,
    private readonly whatsappInboundChannel: WhatsAppInboundChannel,
    private readonly manualAssistedChannel: ManualAssistedChannel,
  ) {}

  /**
   * Normalise un numéro au format E.164 (+2376XXXXXXXX)
   */
  normalizePhone(phone: string): string {
    if (!phone) {
      throw new BadRequestException('Le numéro de téléphone est obligatoire.');
    }
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    if (cleaned.startsWith('00')) {
      return `+${cleaned.substring(2)}`;
    }
    const local = cleaned.replace(/^0+/, '');
    return `+237${local}`;
  }

  /**
   * Génère un code de défi court (ex: "PG-7489" ou "4589-1234")
   */
  private generateChallengeCode(): string {
    const part1 = Math.floor(1000 + Math.random() * 9000).toString();
    return `PG-${part1}`;
  }

  /**
   * Crée un nouveau défi de preuve entrante WhatsApp (D-12) lié à la session
   */
  async createChallenge(
    phoneInput: string,
    purpose: 'LOGIN' | 'REGISTER' | 'PHONE_CHANGE' = 'LOGIN',
    sessionBinding?: string,
    ipAddress?: string,
  ): Promise<ChallengeResponse> {
    const phone = this.normalizePhone(phoneInput);
    const code = this.generateChallengeCode();
    const codeHash = await argon2.hash(code);
    const expiresAt = new Date(Date.now() + this.CHALLENGE_TTL_MS);
    const binding = sessionBinding || crypto.randomBytes(24).toString('hex');

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
        expected_e164: phone,
        codeHash,
        purpose,
        channel: 'WHATSAPP',
        sessionBinding: binding,
        ipAddress: ipAddress || '127.0.0.1',
        expiresAt,
      },
    });

    // Enregistrement dans l'outbox de simulation pour le développement
    await this.simulatedChannel.recordOutbound(
      phone,
      `Code PLEINGAZ : ${code}. Cliquez sur le lien pour valider votre numéro.`,
    );

    const message = encodeURIComponent(`Code PLEINGAZ : ${code}`);
    const whatsappLink = `https://wa.me/${this.OFFICIAL_WHATSAPP_NUMBER.replace('+', '')}?text=${message}`;

    this.logger.log(`[WHATSAPP-AUTH] Défi créé pour ${phone} [ID: ${challenge.id}]`);

    return {
      challengeId: challenge.id,
      code,
      whatsappLink,
      expiresAt,
      officialNumber: this.OFFICIAL_WHATSAPP_NUMBER,
      sessionBinding: binding,
    };
  }

  /**
   * Récupère le statut d'un défi (pour polling automatique frontend)
   */
  async getChallengeStatus(challengeId: string, sessionBinding?: string): Promise<{ status: ChallengeStatus; verified: boolean; phone?: string }> {
    const challenge = await this.prisma.verificationChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Défi de vérification introuvable.');
    }

    if (sessionBinding && challenge.sessionBinding && challenge.sessionBinding !== sessionBinding) {
      throw new ForbiddenException('Défi non associé à cette session de navigation.');
    }

    if (challenge.consumedAt) {
      return { status: 'CONSUMED', verified: true, phone: challenge.phone };
    }

    if (challenge.expiresAt < new Date()) {
      return { status: 'EXPIRED', verified: false, phone: challenge.phone };
    }

    if (challenge.verifiedAt) {
      return { status: 'VERIFIED', verified: true, phone: challenge.phone };
    }

    return { status: 'PENDING', verified: false, phone: challenge.phone };
  }

  /**
   * Traite la preuve entrante (inbound) envoyée par WhatsApp ou simulée
   */
  async processInboundMessage(fromPhone: string, text: string, metadata?: Record<string, any>): Promise<{ success: boolean; challengeId?: string; phone: string }> {
    const phone = this.normalizePhone(fromPhone);
    const codeMatch = text.match(/PG-\d{4}/i) || text.match(/\d{4}-\d{4}/) || text.match(/\b\d{4}\b/);

    if (!codeMatch) {
      this.logger.warn(`[INBOUND-PROOF] Message sans format de code reconnu de ${phone} : "${text}"`);
      return { success: false, phone };
    }

    const code = codeMatch[0].toUpperCase();

    // Recherche du défi actif pour ce numéro
    const activeChallenges = await this.prisma.verificationChallenge.findMany({
      where: {
        phone,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    if (activeChallenges.length === 0) {
      this.logger.warn(`[INBOUND-PROOF] Aucun défi actif trouvé pour ${phone}`);
      return { success: false, phone };
    }

    for (const challenge of activeChallenges) {
      if (challenge.attempts >= 5) {
        continue;
      }

      const isMatch = await argon2.verify(challenge.codeHash, code);
      if (isMatch) {
        // Validation réussie de la preuve entrante !
        await this.prisma.verificationChallenge.update({
          where: { id: challenge.id },
          data: {
            verifiedAt: new Date(),
          },
        });

        // Journalisation de sécurité AuditLog
        await this.prisma.auditLog.create({
          data: {
            action: 'WHATSAPP_INBOUND_PROOF_VERIFIED',
            entity: 'VerificationChallenge',
            entityId: challenge.id,
            details: { phone, purpose: challenge.purpose, channel: challenge.channel },
          },
        });

        this.logger.log(`[INBOUND-PROOF] Preuve entrante WhatsApp VALIDÉE pour ${phone} (Défi: ${challenge.id})`);
        return { success: true, challengeId: challenge.id, phone };
      } else {
        await this.prisma.verificationChallenge.update({
          where: { id: challenge.id },
          data: { attempts: { increment: 1 } },
        });
      }
    }

    this.logger.warn(`[INBOUND-PROOF] Code incorrect soumis pour ${phone}`);
    return { success: false, phone };
  }

  /**
   * Consomme le défi une fois l'étape terminée
   */
  async consumeChallenge(challengeId: string, sessionBinding?: string): Promise<boolean> {
    const challenge = await this.prisma.verificationChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Défi introuvable.');
    }

    if (sessionBinding && challenge.sessionBinding && challenge.sessionBinding !== sessionBinding) {
      throw new ForbiddenException('Défi non lié à cette session.');
    }

    if (!challenge.verifiedAt) {
      throw new UnauthorizedException('Le défi WhatsApp n’a pas encore été vérifié par preuve entrante.');
    }

    await this.prisma.verificationChallenge.update({
      where: { id: challengeId },
      data: { consumedAt: new Date() },
    });

    return true;
  }

  /**
   * Méthode de vérification directe (compatibilité)
   */
  async verifyChallenge(phoneInput: string, codeInput: string): Promise<boolean> {
    const res = await this.processInboundMessage(phoneInput, codeInput);
    if (!res.success) {
      throw new UnauthorizedException('Code de défi WhatsApp incorrect ou expiré.');
    }
    return true;
  }

  /**
   * Méthode de webhook direct (compatibilité)
   */
  async handleInboundWebhook(senderPhone: string, messageText: string, signature?: string): Promise<{ success: boolean; phone: string; code?: string }> {
    const res = await this.processInboundMessage(senderPhone, messageText);
    return { success: res.success, phone: res.phone, code: messageText };
  }

  getSimulatedOutbox() {
    return this.simulatedChannel.getOutbox();
  }

  clearSimulatedOutbox() {
    this.simulatedChannel.clearOutbox();
  }
}
