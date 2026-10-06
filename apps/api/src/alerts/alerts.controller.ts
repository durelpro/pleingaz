import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('demand')
  async subscribeAlert(
    @Request() req: any,
    @Body() body: { productId: string; latitude?: number; longitude?: number; storeId?: string },
  ) {
    return this.alertsService.subscribeToRestockAlert(
      req.user.userId,
      body.productId,
      body.latitude,
      body.longitude,
      body.storeId,
    );
  }
}
