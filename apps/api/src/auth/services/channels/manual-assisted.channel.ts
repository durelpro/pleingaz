import { Injectable, Logger } from '@nestjs/common';
import { VerificationChannel, VerificationResult, OutboundMessage } from '../../interfaces/verification-channel.interface';

@Injectable()
export class ManualAssistedChannel implements VerificationChannel {
  readonly channelName = 'MANUAL_ASSISTED';
  private readonly logger = new Logger(ManualAssistedChannel.name);

  async processInbound(from: string, text: string, metadata?: Record<string, any>): Promise<VerificationResult> {
    const caseId = metadata?.caseId || 'N/A';
    this.logger.log(`[MANUAL-ASSISTED] Validation assistée opérateur (Dossier: ${caseId}) pour ${from}`);
    return {
      success: true,
      phone: from,
      code: text,
      messageId: `assist-${Date.now()}`,
    };
  }

  async recordOutbound(to: string, text: string): Promise<OutboundMessage> {
    return {
      id: `manual-out-${Date.now()}`,
      to,
      text,
      timestamp: new Date(),
    };
  }
}
