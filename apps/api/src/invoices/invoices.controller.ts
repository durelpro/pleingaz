import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '../auth/constants/roles.enum';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * Consultation de la facture d'une commande
   */
  @Get('order/:orderId')
  async getInvoice(@Param('orderId') orderId: string): Promise<any> {
    return this.invoicesService.getInvoiceByOrderId(orderId);
  }

  /**
   * Génération de facture pour une commande
   */
  @Post('order/:orderId/generate')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN, RoleName.DISTRIBUTOR)
  async generateInvoice(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ): Promise<any> {
    return this.invoicesService.generateInvoice(orderId, userId);
  }

  /**
   * Émission d'un Avoir légal (Credit Note)
   */
  @Post(':id/credit-note')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  async issueCreditNote(
    @CurrentUser('id') adminId: string,
    @Param('id') invoiceId: string,
    @Body('reason') reason: string,
  ): Promise<any> {
    return this.invoicesService.issueCreditNote(invoiceId, reason, adminId);
  }
}
