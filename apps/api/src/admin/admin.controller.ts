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
  async getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('sales-stats')
  async getSalesStats(@Query('timeframe') timeframe?: string) {
    return this.adminService.getSalesStats(timeframe || 'semaine');
  }

  @Get('audit')
  async getAuditLogs(@Query('limit') limit?: string): Promise<any> {
    return this.adminService.getAuditLogs(limit ? parseInt(limit, 10) : 50);
  }
}
