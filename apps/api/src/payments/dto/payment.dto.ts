import { PaymentMethod } from '@pleingaz/database';

export class InitiatePaymentDto {
  orderId: string;
  method: PaymentMethod;
  phone: string;
}

export class WebhookPayloadDto {
  transactionId: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  amount: number;
  currency?: string;
  externalReference?: string;
  signature?: string;
}

export class SubmitManualTransferDto {
  orderId: string;
  method: PaymentMethod;
  senderPhone: string;
  transactionRef?: string;
  amount?: number;
}

export class ConfirmManualPaymentDto {
  notes?: string;
}
