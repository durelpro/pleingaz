import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StockLevel } from '@pleingaz/database';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('store/:storeId')
  async getInventory(@Param('storeId') storeId: string) {
    return this.inventoryService.getStoreInventory(storeId);
  }

  @Put('store/:storeId/product/:productId')
  async updateStock(
    @Request() req: any,
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Body('level') level: StockLevel,
  ) {
    return this.inventoryService.updateStock(req.user.userId, storeId, productId, level);
  }
}
