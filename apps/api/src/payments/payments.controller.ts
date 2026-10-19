import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayoutService } from './payout.service';
import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '../auth/constants/roles.enum';
import { InitiatePaymentDto } from './dto/payment.dto';
import {
  CreatePayoutBatchDto,
  ApprovePayoutDto,
  ExecutePayoutDto,
} from './dto/payout.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly payoutService: PayoutService,
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * D-06: Initiation de paiement MoMo / OM / Cash
   */
  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiate(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ): Promise<any> {
    return this.paymentsService.initiatePayment(
      userId,
      dto.orderId,
      dto.method,
      dto.phone,
    );
  }

  /**
   * Webhook opérateur MTN MoMo (sécurisé par signature HMAC)
   */
  @Post('webhooks/mtn')
  async mtnWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature?: string,
  ): Promise<any> {
    await this.paymentsService.handleWebhook('MTN', payload, signature);
    return { received: true };
  }

  /**
   * Webhook opérateur Orange Money (sécurisé par signature HMAC)
   */
  @Post('webhooks/orange')
  async orangeWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature?: string,
  ): Promise<any> {
    await this.paymentsService.handleWebhook('ORANGE', payload, signature);
    return { received: true };
  }

  /**
   * D-06: Création d'un lot de reversement (Rôle Maker)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  @Post('payouts/batches')
  async createPayoutBatch(
    @CurrentUser('id') makerId: string,
    @Body() dto: CreatePayoutBatchDto,
  ): Promise<any> {
    return this.payoutService.createBatch(makerId, dto);
  }

  /**
   * D-06: Liste des lots de reversement
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  @Get('payouts/batches')
  async getPayoutBatches(@Query('status') status?: string): Promise<any> {
    return this.payoutService.getBatches(status);
  }

  /**
   * D-06: Approbation d'un lot de reversement (Rôle Checker + Seuil 500k)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  @Post('payouts/batches/:id/approve')
  async approvePayoutBatch(
    @CurrentUser('id') checkerId: string,
    @Param('id') batchId: string,
    @Body() dto: ApprovePayoutDto,
  ): Promise<any> {
    return this.payoutService.approveBatch(checkerId, batchId, dto);
  }

  /**
   * D-06: Exécution d'un lot de reversement avec imputation comptable
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  @Post('payouts/batches/:id/execute')
  async executePayoutBatch(
    @CurrentUser('id') adminId: string,
    @Param('id') batchId: string,
    @Body() dto: ExecutePayoutDto,
  ): Promise<any> {
    return this.payoutService.executeBatch(adminId, batchId, dto);
  }

  /**
   * D-06: Consultation du solde d'un compte du Grand Livre
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  @Get('ledger/account/:code')
  async getAccountBalance(@Param('code') code: string): Promise<any> {
    return this.ledgerService.getAccountBalance(code);
  }
}
