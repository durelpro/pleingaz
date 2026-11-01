export interface VerificationResult {
  success: boolean;
  phone: string;
  code?: string;
  messageId?: string;
}

export interface OutboundMessage {
  id: string;
  to: string;
  text: string;
  timestamp: Date;
}

export interface VerificationChannel {
  readonly channelName: string;

  /**
   * Valide la réception ou la saisie d'un défi
   */
  processInbound(from: string, text: string, metadata?: Record<string, any>): Promise<VerificationResult>;

  /**
   * Envoi ou enregistrement dans l'outbox (simulé / assisté)
   */
  recordOutbound?(to: string, text: string): Promise<OutboundMessage>;
}
