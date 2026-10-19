import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportReason } from '@pleingaz/database';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Request() req: any): Promise<any> {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  @Patch(':id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string): Promise<any> {
    return this.notificationsService.markAsRead(req.user.userId, id);
  }

  @Post('reports')
  async createReport(
    @Request() req: any,
    @Body() body: { storeId: string; reason: ReportReason; details?: string }
  ): Promise<any> {
    return this.notificationsService.createReport(req.user.userId, body.storeId, body.reason, body.details);
  }

  @Get('reports')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT')
  async getReports(
    @Query('storeId') storeId?: string,
    @Query('isResolved') isResolved?: string,
  ): Promise<any> {
    const resolvedBool = isResolved !== undefined ? isResolved === 'true' : undefined;
    return this.notificationsService.getReports({ storeId, isResolved: resolvedBool });
  }

  @Patch('reports/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'SUPPORT')
  async resolveReport(
    @Param('id') id: string,
    @Body() body: { details?: string },
  ): Promise<any> {
    return this.notificationsService.resolveReport(id, body.details);
  }
}
