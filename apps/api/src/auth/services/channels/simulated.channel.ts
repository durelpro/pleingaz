import { Injectable, Logger } from '@nestjs/common';
import { VerificationChannel, VerificationResult, OutboundMessage } from '../../interfaces/verification-channel.interface';

@Injectable()
export class SimulatedChannel implements VerificationChannel {
  readonly channelName = 'SIMULATED';
  private readonly logger = new Logger(SimulatedChannel.name);
  private outbox: OutboundMessage[] = [];

  async processInbound(from: string, text: string): Promise<VerificationResult> {
    this.logger.log(`[SIMULATED-CHANNEL] Réception message entrant simulé : de=${from}, texte="${text}"`);
    return {
      success: true,
      phone: from,
      code: text,
      messageId: `sim-msg-${Date.now()}`,
    };
  }

  async recordOutbound(to: string, text: string): Promise<OutboundMessage> {
    const msg: OutboundMessage = {
      id: `outbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      to,
      text,
      timestamp: new Date(),
    };
    this.outbox.unshift(msg);
    // Limiter la taille mémoire de l'outbox
    if (this.outbox.length > 100) {
      this.outbox = this.outbox.slice(0, 100);
    }
    this.logger.log(`[SIMULATED-CHANNEL] Message consigné dans l'outbox pour ${to} : ${text}`);
    return msg;
  }

  getOutbox(): OutboundMessage[] {
    return [...this.outbox];
  }

  clearOutbox(): void {
    this.outbox = [];
  }
}
