import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  async getProducts() {
    return this.catalogService.getProducts();
  }

  @Put('admin/products/:id/price')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('catalog:manage')
  async updatePrice(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { publicPrice: number; distributorPrice: number },
  ) {
    return this.catalogService.updateProductPrice(req.user.userId, id, body.publicPrice, body.distributorPrice);
  }
}
