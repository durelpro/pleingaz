import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'LOGISTICS', 'SUPPORT')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':reportId')
  async getReport(
    @Param('reportId') reportId: string,
    @Query() filters: Record<string, any>,
  ): Promise<any> {
    return this.reportsService.getReport(reportId, filters);
  }

  @Post(':reportId/export')
  async exportReport(
    @Request() req: any,
    @Param('reportId') reportId: string,
    @Body() body: { format?: 'CSV' | 'EXCEL'; filters?: Record<string, any> },
    @Res() res: Response,
  ): Promise<void> {
    const format = body.format === 'CSV' ? 'CSV' : 'EXCEL';
    const result = await this.reportsService.exportReport(
      req.user.userId,
      reportId,
      format,
      body.filters || {},
    );

    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    });
    res.send(result.buffer);
  }
}
