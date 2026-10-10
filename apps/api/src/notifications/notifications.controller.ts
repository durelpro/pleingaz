import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportReason } from '@pleingaz/database';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('reports')
  async createReport(
    @Request() req: any,
    @Body() body: { storeId: string; reason: ReportReason; details?: string }
  ) {
    return this.notificationsService.createReport(req.user.userId, body.storeId, body.reason, body.details);
  }
}
