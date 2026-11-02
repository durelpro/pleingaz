import { Controller, Post, Get, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CounterSalesService, CreateCounterSaleDto } from './counter-sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('counter-sales')
export class CounterSalesController {
  constructor(private readonly counterSalesService: CounterSalesService) {}

  /**
   * Vérification du quota 30 jours pour un acheteur (D-14, D-16)
   */
  @Post('check-quota')
  @HttpCode(HttpStatus.OK)
  async checkQuota(@Body() body: { customerPhone: string; bottleCount?: number }) {
    return this.counterSalesService.checkBuyerQuota(body.customerPhone, body.bottleCount || 1);
  }

  /**
   * Enregistrement d'une vente physique au comptoir par le personnel distributeur
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DISTRIBUTOR_OWNER', 'DISTRIBUTOR_STAFF', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createSale(@Body() body: CreateCounterSaleDto, @CurrentUser('id') operatorUserId: string): Promise<any> {
    return this.counterSalesService.createCounterSale(body, operatorUserId);
  }

  /**
   * Consultation des ventes au comptoir d'une boutique
   */
  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DISTRIBUTOR_OWNER', 'DISTRIBUTOR_STAFF', 'ADMIN', 'SUPER_ADMIN')
  async getStoreSales(@Param('storeId') storeId: string, @Query('limit') limit?: number): Promise<any> {
    return this.counterSalesService.getStoreSales(storeId, limit ? Number(limit) : 20);
  }

  /**
   * Registre consolidé des transactions pour le Control Center Administrateur (D-16.1)
   */
  @Get('admin/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FINANCE_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async getAdminRegister(
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.counterSalesService.getAllTransactions({
      storeId,
      startDate,
      endDate,
      limit: limit ? Number(limit) : 50,
    });
  }
}
