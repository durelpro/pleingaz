import { Controller, Get, Post, Body, Query, Param, Patch } from '@nestjs/common';
import { Cr003Service } from './cr003.service';

@Controller('api/v1/cr003')
export class Cr003Controller {
  constructor(private readonly cr003Service: Cr003Service) {}

  @Get('catalog')
  async getCatalog() {
    return this.cr003Service.getCatalog();
  }

  @Get('buyer/quota')
  async getBuyerQuota(@Query('phone') phone: string) {
    const targetPhone = phone || '+237699123456';
    return this.cr003Service.getBuyerQuota(targetPhone);
  }

  @Get('distributor/stock')
  async getDistributorStock(@Query('storeId') storeId?: string) {
    return this.cr003Service.getDistributorStock(storeId);
  }

  @Patch('distributor/stock/:id')
  async adjustStock(
    @Param('id') inventoryId: string,
    @Body('level') level: 'BON' | 'MOYEN' | 'FAIBLE' | 'RUPTURE',
  ) {
    return this.cr003Service.adjustStock(inventoryId, level);
  }

  @Post('counter-sales')
  async createCounterSale(
    @Body()
    body: {
      storeId?: string;
      customerPhone: string;
      bottleType: string;
      quantity?: number;
      amountTotal?: number;
    },
  ) {
    return this.cr003Service.createCounterSale(body);
  }

  @Get('notices')
  async getNotices(
    @Query('role') role?: string,
    @Query('city') city?: string,
  ) {
    return this.cr003Service.getNotices({ role, city });
  }

  @Post('notices')
  async createNotice(
    @Body()
    body: {
      title: string;
      content: string;
      category?: string;
      targetRole?: string;
      targetCity?: string;
      requiresAck?: boolean;
      createdById?: string;
    },
  ) {
    return this.cr003Service.createNotice(body);
  }

  @Post('notices/ack')
  async ackNotice(@Body() body: { noticeId: string; phone: string }) {
    return this.cr003Service.ackNotice(body.noticeId, body.phone || '+237699123456');
  }

  @Get('admin/transactions')
  async getAllTransactions() {
    return this.cr003Service.getAllTransactions();
  }

  @Get('admin/stats')
  async getAdminStats() {
    return this.cr003Service.getAdminStats();
  }

  // ==========================================
  // DOSSIERS LITIGES & ASSISTANCE (D-15, C-07)
  // ==========================================

  @Post('cases')
  async createCase(
    @Body()
    body: {
      agentId?: string;
      targetUserId?: string;
      targetPhone?: string;
      reason: string;
      proposedAction: string;
      evidenceUrls?: string[];
    },
  ) {
    const agentId = body.agentId || 'agent-account-manager-default';
    return this.cr003Service.createAccountCase(agentId, body);
  }

  @Get('cases')
  async getCases(@Query('status') status?: string) {
    return this.cr003Service.getAccountCases({ status });
  }

  @Get('cases/:id')
  async getCaseById(@Param('id') id: string) {
    return this.cr003Service.getAccountCaseById(id);
  }

  @Patch('cases/:id/review')
  async reviewCase(
    @Param('id') id: string,
    @Body()
    body: {
      adminId?: string;
      decision: 'APPROVE' | 'REJECT';
      notes?: string;
    },
  ) {
    const adminId = body.adminId || 'admin-reviewer-default';
    return this.cr003Service.reviewAccountCase(adminId, id, body.decision, body.notes);
  }

  @Post('refund-deposit')
  async refundDeposit(
    @Body()
    body: {
      agentId?: string;
      customerPhone: string;
      bottleType: string;
      amount?: number;
      storeId?: string;
    },
  ) {
    const agentId = body.agentId || 'agent-account-manager-default';
    return this.cr003Service.refundDeposit(agentId, body);
  }

  // ==========================================
  // BARÈMES DYNAMIQUES & DOUBLE CONFIRMATION D-17
  // ==========================================

  @Get('pricing')
  async getPricing() {
    return this.cr003Service.getPlatformPricing();
  }

  @Post('deliveries/:id/courier-confirm')
  async courierConfirm(
    @Param('id') id: string,
    @Body('courierUserId') courierUserId?: string,
  ) {
    return this.cr003Service.courierMarkDelivered(id, courierUserId || 'courier-default-id');
  }

  @Post('deliveries/:id/customer-confirm')
  async customerConfirm(
    @Param('id') id: string,
    @Body('customerUserId') customerUserId?: string,
  ) {
    return this.cr003Service.customerConfirmDelivery(id, customerUserId || 'customer-default-id');
  }

  @Post('deliveries/:id/dispute')
  async disputeDelivery(
    @Param('id') id: string,
    @Body() body: { customerUserId?: string; reason: string },
  ) {
    return this.cr003Service.customerDisputeDelivery(id, body.customerUserId || 'customer-default-id', body.reason);
  }

  @Post('deliveries/auto-validate')
  async autoValidateDeliveries() {
    return this.cr003Service.autoValidateExpiredDeliveries();
  }
}
