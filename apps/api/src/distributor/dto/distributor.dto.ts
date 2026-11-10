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
