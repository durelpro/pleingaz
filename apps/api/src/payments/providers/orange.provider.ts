import { PaymentProvider, PaymentInitResult } from './payment.provider.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrangeMoneyProvider implements PaymentProvider {
  async initiatePayment(amount: number, currency: string, phone: string, idempotencyKey: string): Promise<PaymentInitResult> {
    // Sandbox Orange Money implementation
    console.log(\`[Orange Money Sandbox] Init payment \${amount} \${currency} for \${phone}\`);
    
    return {
      providerTxId: \`orange_tx_\${Date.now()}\`,
      status: 'PENDING',
    };
  }

  async verifyPaymentStatus(providerTxId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'> {
    console.log(\`[Orange Money Sandbox] Verify tx \${providerTxId}\`);
    return 'SUCCESS';
  }
}
