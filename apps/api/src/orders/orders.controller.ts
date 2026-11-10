import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Création d'une commande B2C avec réservation éphémère de 15 minutes
   */
  @Post()
  async createOrder(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateOrderDto,
  ): Promise<any> {
    return this.ordersService.createOrder(customerId, dto);
  }

  /**
   * Consultation de mes commandes
   */
  @Get('my-orders')
  async getMyOrders(@CurrentUser('id') userId: string): Promise<any> {
    return this.ordersService.getMyOrders(userId);
  }

  /**
   * Détail d'une commande
   */
  @Get(':id')
  async getOrderById(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ): Promise<any> {
    return this.ordersService.getOrderById(userId, orderId);
  }

  /**
   * Annulation de commande
   */
  @Post(':id/cancel')
  async cancelOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body('reason') reason?: string,
  ): Promise<any> {
    return this.ordersService.cancelOrder(userId, orderId, reason);
  }
}
