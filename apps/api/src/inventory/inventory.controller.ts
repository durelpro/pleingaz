import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '../auth/constants/roles.enum';
import { StockLevel } from '@pleingaz/database';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Consultation publique du stock d'un point de vente
   */
  @Get('store/:storeId')
  async getStoreInventory(@Param('storeId') storeId: string) {
    return this.inventoryService.getStoreInventory(storeId);
  }

  /**
   * Consultation de l'inventaire de la boutique du commerçant connecté
   */
  @Get('my-store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.DISTRIBUTOR, RoleName.SUPER_ADMIN)
  async getMyStoreInventory(@CurrentUser('id') userId: string) {
    return this.inventoryService.getMyStoreInventory(userId);
  }

  /**
   * D-01 / D-03: Déclaration qualitative de stock (BON / MOYEN / FAIBLE / RUPTURE)
   */
  @Put('store/:storeId/product/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.DISTRIBUTOR, RoleName.SUPER_ADMIN)
  async updateStock(
    @CurrentUser('id') userId: string,
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Body('level') level: StockLevel,
  ) {
    return this.inventoryService.updateStock(userId, storeId, productId, level);
  }

  /**
   * Confirmation en 1-clic de la disponibilité actuelle de la boutique
   */
  @Post('store/:storeId/quick-confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.DISTRIBUTOR, RoleName.SUPER_ADMIN)
  async quickConfirm(
    @CurrentUser('id') userId: string,
    @Param('storeId') storeId: string,
  ) {
    return this.inventoryService.quickConfirmStock(userId, storeId);
  }
}
