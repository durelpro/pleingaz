import { BeneficiaryType } from '@pleingaz/database';

export class CreatePayoutBatchDto {
  beneficiaryType: BeneficiaryType;
  totalAmount: number;
  courierPayoutIds?: string[];
  description?: string;
}

export class ApprovePayoutDto {
  comment?: string;
}

export class ExecutePayoutDto {
  operatorTxRef: string;
  proofFileUrl?: string;
}
