import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post(':orderId/generate')
  async generate(@Request() req: any, @Param('orderId') orderId: string) {
    return this.invoicesService.generateInvoice(orderId, req.user.userId);
  }
}
