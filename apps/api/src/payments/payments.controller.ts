import { Controller, Post, Body, UseGuards, Request, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentMethod } from '@pleingaz/database';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiate(
    @Request() req: any,
    @Body() body: { orderId: string; method: PaymentMethod; phone: string }
  ): Promise<any> {
    return this.paymentsService.initiatePayment(req.user.userId, body.orderId, body.method, body.phone);
  }

  // Webhooks (Publique)
  @Post('webhooks/mtn')
  async mtnWebhook(@Body() payload: any, @Headers('x-signature') signature: string) {
    await this.paymentsService.handleWebhook('MTN', payload, signature);
    return { ok: true };
  }

  @Post('webhooks/orange')
  async orangeWebhook(@Body() payload: any, @Headers('x-signature') signature: string) {
    await this.paymentsService.handleWebhook('ORANGE', payload, signature);
    return { ok: true };
  }
}
