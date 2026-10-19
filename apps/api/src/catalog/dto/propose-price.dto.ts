export class ProposePriceDto {
  productId: string;
  publicPrice: number;
  distributorPrice: number;
  depositAmount?: number;
  gasAmount?: number;
  reason?: string;
}
