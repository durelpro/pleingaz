import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '../auth/constants/roles.enum';
import { ProposePriceDto } from './dto/propose-price.dto';
import { ApprovePriceDto, RejectPriceDto } from './dto/decision-price.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Catégories de produits PLEINGAZ ordonnées (Public)
   */
  @Get('categories')
  async getCategories() {
    return this.catalogService.getCategories();
  }

  /**
   * Catalogue des produits officiels PLEINGAZ avec prix actifs approuvés (Public)
   */
  @Get('products')
  async getProducts(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.catalogService.getProducts({ categoryId, search, onlyActive: true });
  }

  /**
   * Fiche détaillée d'un produit officiel PLEINGAZ (Public)
   */
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }

  /**
   * D-01 & D-06: Rôle Maker - Soumission d'une proposition tarifaire
   * Autorisé pour: ADMIN_STOCK, ADMIN_FINANCE, SUPER_ADMIN
   */
  @Post('prices/propose')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_STOCK, RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  async proposePrice(
    @CurrentUser('id') makerId: string,
    @Body() dto: ProposePriceDto,
  ) {
    return this.catalogService.proposePrice(makerId, dto);
  }

  /**
   * D-01 & D-06: Rôle Checker - Liste des prix en attente d'approbation
   * Autorisé pour: ADMIN_FINANCE, SUPER_ADMIN
   */
  @Get('prices/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  async getPendingPrices() {
    return this.catalogService.getPendingPrices();
  }

  /**
   * D-01 & D-06: Rôle Checker - Approbation d'un barème de prix
   * Règle absolue: Checker distinct du Maker
   * Autorisé pour: ADMIN_FINANCE, SUPER_ADMIN
   */
  @Post('prices/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  async approvePrice(
    @CurrentUser('id') checkerId: string,
    @Param('id') priceId: string,
    @Body() dto: ApprovePriceDto,
  ) {
    return this.catalogService.approvePrice(checkerId, priceId, dto);
  }

  /**
   * D-01 & D-06: Rôle Checker - Rejet d'une proposition tarifaire avec motif
   * Autorisé pour: ADMIN_FINANCE, SUPER_ADMIN
   */
  @Post('prices/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  async rejectPrice(
    @CurrentUser('id') checkerId: string,
    @Param('id') priceId: string,
    @Body() dto: RejectPriceDto,
  ) {
    return this.catalogService.rejectPrice(checkerId, priceId, dto);
  }

  /**
   * Historique d'audit des prix d'un produit
   * Autorisé pour: ADMIN_STOCK, ADMIN_FINANCE, SUPER_ADMIN
   */
  @Get('prices/history/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN_STOCK, RoleName.ADMIN_FINANCE, RoleName.SUPER_ADMIN)
  async getPriceHistory(@Param('productId') productId: string) {
    return this.catalogService.getPriceHistory(productId);
  }
}
