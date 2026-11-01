import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { VerificationChannel, VerificationResult, OutboundMessage } from '../../interfaces/verification-channel.interface';
import * as crypto from 'crypto';

@Injectable()
export class WhatsAppInboundChannel implements VerificationChannel {
  readonly channelName = 'WHATSAPP_INBOUND';
  private readonly logger = new Logger(WhatsAppInboundChannel.name);

  /**
   * Vérifie la signature cryptographique HMAC SHA-256 du webhook Meta
   */
  verifyMetaSignature(payload: string | Buffer, signatureHeader: string | undefined, appSecret: string): boolean {
    if (!signatureHeader || !appSecret) {
      return false;
    }
    const [algorithm, signature] = signatureHeader.split('=');
    if (algorithm !== 'sha256' || !signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  async processInbound(from: string, text: string, metadata?: Record<string, any>): Promise<VerificationResult> {
    const messageId = metadata?.messageId;
    this.logger.log(`[WHATSAPP-INBOUND] Preuve entrante reçue de ${from} : ${text} (MsgId: ${messageId})`);

    return {
      success: true,
      phone: from,
      code: text,
      messageId,
    };
  }

  async recordOutbound(to: string, text: string): Promise<OutboundMessage> {
    // Dans le modèle D-12 Option A, la plateforme n'envoie aucun message sortant payant (R-03)
    this.logger.warn(`[WHATSAPP-INBOUND] Envoi sortant ignoré (Option A zéro envoi payant) pour ${to}`);
    return {
      id: `noop-${Date.now()}`,
      to,
      text,
      timestamp: new Date(),
    };
  }
}
