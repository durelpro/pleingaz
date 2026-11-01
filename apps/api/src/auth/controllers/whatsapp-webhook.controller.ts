import { Controller, Get, Post, Query, Body, Headers, HttpCode, HttpStatus, UnauthorizedException, Logger, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { WhatsAppAuthService } from '../services/whatsapp-auth.service';
import { WhatsAppInboundChannel } from '../services/channels/whatsapp-inbound.channel';

@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);
  private readonly processedMessageIds = new Set<string>();

  constructor(
    private readonly whatsappAuthService: WhatsAppAuthService,
    private readonly whatsappInboundChannel: WhatsAppInboundChannel,
  ) {}

  /**
   * Poignée de main de vérification Meta (Challenge Handshake)
   * GET /api/v1/webhooks/whatsapp
   */
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
  ) {
    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'pleingaz_webhook_verify_token_2026';

    if (mode === 'subscribe' && token === expectedToken) {
      this.logger.log('[WEBHOOK-WHATSAPP] Poignée de main Meta vérifiée avec succès.');
      return challenge;
    }

    this.logger.warn(`[WEBHOOK-WHATSAPP] Échec poignée de main : token=${token}`);
    throw new UnauthorizedException('Token de vérification webhook invalide.');
  }

  /**
   * Réception des messages entrants WhatsApp Cloud API
   * POST /api/v1/webhooks/whatsapp
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature?: string,
  ) {
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    // Vérification de signature si secret configuré (sécurité renforcée)
    if (appSecret && signature) {
      const isValid = this.whatsappInboundChannel.verifyMetaSignature(
        JSON.stringify(body),
        signature,
        appSecret,
      );
      if (!isValid) {
        this.logger.error('[WEBHOOK-WHATSAPP] Signature cryptographique x-hub-signature-256 REJETÉE');
        throw new UnauthorizedException('Signature webhook Meta invalide.');
      }
    }

    // Extraction du payload Meta WhatsApp
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message || !message.from) {
      return { status: 'IGNORED_NO_MESSAGE' };
    }

    const messageId = message.id;

    // Idempotence par identifiant de message (éviter double validation d'un même message rejoué)
    if (messageId && this.processedMessageIds.has(messageId)) {
      this.logger.log(`[WEBHOOK-WHATSAPP] Message ${messageId} déjà traité (idempotence).`);
      return { status: 'ALREADY_PROCESSED', messageId };
    }

    const from = message.from;
    const text = message.text?.body || message.button?.text || '';

    const result = await this.whatsappAuthService.processInboundMessage(from, text, { messageId });

    if (messageId) {
      this.processedMessageIds.add(messageId);
      // Maintenir une taille bornée du cache d'idempotence
      if (this.processedMessageIds.size > 1000) {
        const first = this.processedMessageIds.values().next().value;
        if (first) this.processedMessageIds.delete(first);
      }
    }

    return {
      status: 'PROCESSED',
      verified: result.success,
      phone: result.phone,
    };
  }
}
