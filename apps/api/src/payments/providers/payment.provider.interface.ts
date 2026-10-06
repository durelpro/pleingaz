export interface PaymentInitResult {
  providerTxId?: string;
  paymentUrl?: string; // S'il y a une page de redirection
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface PaymentProvider {
  /**
   * Initialise un paiement auprès de l'opérateur
   */
  initiatePayment(amount: number, currency: string, phone: string, idempotencyKey: string): Promise<PaymentInitResult>;

  /**
   * Vérifie le statut d'un paiement (utile si le webhook n'est pas reçu)
   */
  verifyPaymentStatus(providerTxId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'>;
}
