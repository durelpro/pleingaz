import { Controller, Post, Param, Body, UseGuards, Request, Put } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeliveryStatus } from '@pleingaz/database';

@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post(':orderId/assign')
  async assign(@Request() req: any, @Param('orderId') orderId: string) {
    return this.deliveriesService.assignDriver(orderId, req.user.userId);
  }

  @Put(':id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: DeliveryStatus
  ) {
    return this.deliveriesService.updateStatus(req.user.userId, id, status);
  }

  @Post(':id/complete')
  async complete(
    @Request() req: any,
    @Param('id') id: string,
    @Body('otp') otp: string
  ) {
    return this.deliveriesService.completeDelivery(req.user.userId, id, otp);
  }
}
