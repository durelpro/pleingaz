import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

class NearbySearchDto {
  productId: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * D-02: Recherche géolocalisée immédiate lors du clic client
   * Coordonnées éphémères du clic (AUCUN stockage persistant des coordonnées)
   */
  @Post('stores/nearby')
  @UseGuards(OptionalJwtAuthGuard)
  async searchNearby(
    @Body() body: NearbySearchDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.searchService.searchStores({
      productId: body.productId,
      latitude: body.latitude,
      longitude: body.longitude,
      radiusKm: body.radiusKm,
      userId,
    });
  }

  /**
   * D-02: Recherche de repli par zone géographique macroscopique
   * Utilisé lors d'un refus de géolocalisation ou d'un timeout de 8 secondes
   */
  @Get('stores/by-area')
  @UseGuards(OptionalJwtAuthGuard)
  async searchByArea(
    @Query('productId') productId: string,
    @Query('city') city: string,
    @Query('neighborhood') neighborhood?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.searchService.searchByArea({
      productId,
      city,
      neighborhood,
      userId,
    });
  }

  /**
   * Endpoint unifié de recherche par Query Parameters (Public / Optionnel Auth)
   */
  @Get('stores')
  @UseGuards(OptionalJwtAuthGuard)
  async search(
    @Query('productId') productId: string,
    @Query('q') textQuery?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @Query('city') city?: string,
    @Query('neighborhood') neighborhood?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.searchService.searchStores({
      productId,
      textQuery,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      radiusKm: radius ? parseFloat(radius) : undefined,
      city,
      neighborhood,
      userId,
    });
  }
}
