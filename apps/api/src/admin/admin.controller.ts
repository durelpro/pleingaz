import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('admin/system')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('applications:manage') // Uses the same permission as distributor management for MVP admin
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('kpis')
  async getKpis() {
    return this.adminService.getKpis();
  }

  @Get('dashboard-metrics')
  async getDashboardMetrics(@Query('city') city?: string) {
    return this.adminService.getDashboardMetrics(city);
  }

  @Get('sales-stats')
  async getSalesStats(
    @Query('timeframe') timeframe?: string,
    @Query('city') city?: string,
  ) {
    return this.adminService.getSalesStats(timeframe || 'semaine', city);
  }

  @Get('distributors/rankings')
  async getRankings(@Query('city') city?: string) {
    return this.adminService.getDistributorRankings(city);
  }

  @Get('export/orders')
  async exportOrders(
    @Query('city') city?: string,
    @Query('timeframe') timeframe?: string,
  ) {
    return {
      filename: `commandes-pleingaz-${new Date().toISOString().slice(0, 10)}.csv`,
      content: await this.adminService.exportOrdersCsv(city, timeframe),
    };
  }

  @Get('export/stores')
  async exportStores(@Query('city') city?: string) {
    return {
      filename: `distributeurs-pleingaz-${new Date().toISOString().slice(0, 10)}.csv`,
      content: await this.adminService.exportStoresCsv(city),
    };
  }

  @Get('audit')
  async getAuditLogs(@Query('limit') limit?: string): Promise<any> {
    return this.adminService.getAuditLogs(limit ? parseInt(limit, 10) : 50);
  }
}
