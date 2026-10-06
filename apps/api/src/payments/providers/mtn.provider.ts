import { PaymentProvider, PaymentInitResult } from './payment.provider.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MtnMomoProvider implements PaymentProvider {
  async initiatePayment(amount: number, currency: string, phone: string, idempotencyKey: string): Promise<PaymentInitResult> {
    // Sandbox MTN MoMo implementation
    console.log(\`[MTN MoMo Sandbox] Init payment \${amount} \${currency} for \${phone}\`);
    
    // On simule une réponse de l'API MTN
    return {
      providerTxId: \`mtn_tx_\${Date.now()}\`,
      status: 'PENDING',
    };
  }

  async verifyPaymentStatus(providerTxId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'> {
    console.log(\`[MTN MoMo Sandbox] Verify tx \${providerTxId}\`);
    return 'SUCCESS';
  }
}
