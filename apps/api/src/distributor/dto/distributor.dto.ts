export class ApplyDistributorDto {
  businessName: string;
  city: string;
  neighborhood: string;
  landmark?: string;
  whatsappNumber: string;
  latitude?: number;
  longitude?: number;
}

export class ReviewApplicationDto {
  decision: 'APPROVE' | 'REJECT';
  reason?: string;
}

export class UpdatePaymentSettingsDto {
  momoReceiverNumber?: string;
  momoAccountName?: string;
  orangeReceiverNumber?: string;
  orangeAccountName?: string;
  acceptCash?: boolean;
}

