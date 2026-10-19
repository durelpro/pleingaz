import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  providers: [DashboardService, ReportsService],
  controllers: [DashboardController, ReportsController],
  exports: [DashboardService, ReportsService],
})
export class DashboardModule {}
