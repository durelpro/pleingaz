import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('stores')
  // Endpoint accessible publiquement ou via JwtAuthGuard optionnel
  async search(
    @Query('productId') productId: string,
    @Query('q') textQuery?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    if (!productId) {
      return { error: 'productId required' };
    }

    return this.searchService.searchStores({
      productId,
      textQuery,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      radiusKm: radius ? parseFloat(radius) : 5,
    });
  }
}
