import { Controller, Post, Get, Body, HttpCode, HttpStatus, ForbiddenException, Logger } from '@nestjs/common';
import { WhatsAppAuthService } from '../services/whatsapp-auth.service';

@Controller('dev/whatsapp')
export class DevWhatsAppController {
  private readonly logger = new Logger(DevWhatsAppController.name);

  constructor(private readonly whatsappAuthService: WhatsAppAuthService) {}

  private checkDevEnvironment() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Les endpoints de développement et simulation WhatsApp sont strictement interdits en production.');
    }
  }

  /**
   * Simule un message WhatsApp entrant envoyé par un utilisateur (Option A Preuve Entrante)
   * POST /api/v1/dev/whatsapp/simulate-inbound
   */
  @Post('simulate-inbound')
  @HttpCode(HttpStatus.OK)
  async simulateInbound(@Body() body: { from: string; text: string }) {
    this.checkDevEnvironment();

    if (!body.from || !body.text) {
      throw new ForbiddenException('Les champs "from" et "text" sont obligatoires.');
    }

    this.logger.log(`[DEV-SIMULATE] Simulation message entrant de ${body.from} : "${body.text}"`);
    const result = await this.whatsappAuthService.processInboundMessage(body.from, body.text);

    return {
      simulated: true,
      verified: result.success,
      phone: result.phone,
      challengeId: result.challengeId,
      message: result.success
        ? 'Preuve entrante validée avec succès pour le défi.'
        : 'Code non reconnu ou aucun défi actif correspondant.',
    };
  }

  /**
   * Consulte les messages préparés/envoyés dans l'outbox de simulation
   * GET /api/v1/dev/whatsapp/outbox
   */
  @Get('outbox')
  async getOutbox() {
    this.checkDevEnvironment();
    return {
      count: this.whatsappAuthService.getSimulatedOutbox().length,
      messages: this.whatsappAuthService.getSimulatedOutbox(),
    };
  }
}
