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
  async getNotices() {
    return this.cr003Service.getNotices();
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
}

