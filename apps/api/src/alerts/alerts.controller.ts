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
    @Body() body: { productId: string; city?: string; neighborhood?: string; storeId?: string },
  ): Promise<any> {
    return this.alertsService.subscribeToRestockAlert(
      req.user.userId,
      body.productId,
      body.city,
      body.neighborhood,
      body.storeId,
    );
  }
}
