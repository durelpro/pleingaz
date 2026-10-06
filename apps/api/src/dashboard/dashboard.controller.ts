import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('insights')
  async getInsights() {
    return this.dashboardService.getInsights();
  }

  @Get('metrics')
  async getMetrics(@Query('timeframe') timeframe: string) {
    return this.dashboardService.getMetrics({ timeframe });
  }

  @Get('heatmap')
  async getHeatmap() {
    return this.dashboardService.getHeatmapData();
  }

  @Get('export/sales')
  async exportSales(@Res() res: Response) {
    const buffer = await this.dashboardService.exportSalesReportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=ventes-pleingaz.xlsx',
    });
    res.send(buffer);
  }
}
