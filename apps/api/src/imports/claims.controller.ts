import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';

@Controller()
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  /**
   * Étape 1 : Demande de code OTP pour revendiquer une boutique importée
   */
  @Post('stores/:id/claim/request-otp')
  async requestOtp(
    @Param('id') storeId: string,
    @Body('phone') phone: string,
  ) {
    return this.claimsService.requestOtp(storeId, phone);
  }

  /**
   * Étape 2 : Vérification du code OTP et soumission de la revendication
   */
  @Post('stores/:id/claim/verify-otp')
  async verifyOtp(
    @Param('id') storeId: string,
    @Body('phone') phone: string,
    @Body('code') code: string,
  ) {
    return this.claimsService.verifyOtp(storeId, phone, code);
  }

  /**
   * Admin : Liste des demandes de revendication en attente
   */
  @Get('admin/stores/claims')
  async listClaims(@Query('status') status?: string) {
    return this.claimsService.listClaims(status);
  }

  /**
   * Admin : Arbitrage d'une demande de revendication (Approbation / Rejet)
   */
  @Post('admin/stores/claims/:id/review')
  async reviewClaim(
    @Param('id') claimId: string,
    @Body('decision') decision: 'APPROVE' | 'REJECT',
    @Body('notes') notes?: string,
    @Request() req?: any,
  ): Promise<any> {
    const reviewerUserId = req?.user?.id;
    return this.claimsService.reviewClaim(
      claimId,
      decision,
      notes,
      reviewerUserId,
    );
  }

  /**
   * Admin : Liste des lots d'importation réseau
   */
  @Get('admin/imports')
  async listBatches(): Promise<any> {
    return this.claimsService.listBatches();
  }

  /**
   * Admin : Détails d'un lot d'importation et fiches en quarantaine
   */
  @Get('admin/imports/:id')
  async getBatchDetails(@Param('id') batchId: string): Promise<any> {
    return this.claimsService.getBatchDetails(batchId);
  }
}
