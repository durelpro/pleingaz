import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async checkout(
    @Request() req: any,
    @Body() body: { 
      storeId: string; 
      inventoryId: string; 
      deliveryMethod: 'PICKUP' | 'DELIVERY'; 
      address: string; 
      needsConsigne: boolean; 
      paymentMethod: 'MOMO' | 'OM' | 'CASH'; 
      totalAmount: number 
    }
  ) {
    return this.ordersService.createCheckoutOrder(req.user.userId, body);
  }

  @Post('reserve')
  async reserve(
    @Request() req: any,
    @Body() body: { storeId: string; productId: string; quantity: number }
  ) {
    return this.ordersService.createReservation(req.user.userId, body.storeId, body.productId, body.quantity);
  }

  @Post(':id/confirm')
  async confirm(
    @Request() req: any,
    @Param('id') orderId: string,
    @Body() body: { deliveryAddress?: string }
  ) {
    return this.ordersService.confirmOrder(req.user.userId, orderId, body.deliveryAddress);
  }

  @Post('assisted')
  async createAssisted(
    @Request() req: any,
    @Body() body: { customerPhone: string; storeId: string; productId: string; quantity: number; deliveryAddress?: string }
  ) {
    return this.ordersService.createAssistedOrder(
      req.user.userId,
      body.customerPhone,
      body.storeId,
      body.productId,
      body.quantity,
      body.deliveryAddress,
    );
  }

  @Get()
  async getMyOrders(@Request() req: any): Promise<any> {
    return this.ordersService.getUserOrders(req.user.userId);
  }

  @Get('store')
  async getStoreOrders(@Request() req: any): Promise<any> {
    return this.ordersService.getStoreOrders(req.user.userId);
  }

  @Get(':id')
  async getOrderById(@Request() req: any, @Param('id') orderId: string): Promise<any> {
    return this.ordersService.getOrderById(req.user.userId, orderId);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Request() req: any,
    @Param('id') orderId: string,
    @Body('status') status: any,
    @Body('otp') otp?: string
  ) {
    return this.ordersService.updateOrderStatus(req.user.userId, orderId, status, otp);
  }

  @Post(':id/review')
  async leaveReview(
    @Request() req: any,
    @Param('id') orderId: string,
    @Body() body: { rating: number; comment?: string }
  ) {
    return this.ordersService.leaveReview(req.user.userId, orderId, body.rating, body.comment);
  }
}
