import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tâche 4.5 & 4.6 : Recherche géospatiale et textuelle
   */
  async searchStores(params: {
    productId: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number; // Défaut: 5
    textQuery?: string;
    userId?: string;
  }) {
    const { productId, latitude, longitude, textQuery, userId } = params;
    const radiusMeters = (params.radiusKm || 5) * 1000;

    let queryCondition = `WHERE i."productId" = $1 AND s."isVisible" = true AND s."isVerifiedBadge" = true`;
    const queryParams: any[] = [productId];
    let paramIndex = 2;

    // Condition textuelle (pg_trgm + unaccent)
    if (textQuery) {
      queryCondition += ` AND (
        unaccent(s.neighborhood) ILIKE unaccent($${paramIndex}) 
        OR unaccent(s.city) ILIKE unaccent($${paramIndex})
        OR unaccent(s.landmark) ILIKE unaccent($${paramIndex})
        OR s.neighborhood % $${paramIndex}
      )`;
      queryParams.push(`%${textQuery}%`);
      paramIndex++;
    }

    // Condition géospatiale (PostGIS)
    let orderBy = `ORDER BY i.level ASC, s."updatedAt" DESC`; // High level d'abord par ex
    if (latitude !== undefined && longitude !== undefined) {
      queryCondition += ` AND ST_DWithin(
        ST_MakePoint(s.longitude, s.latitude)::geography,
        ST_MakePoint($${paramIndex}, $${paramIndex + 1})::geography,
        $${paramIndex + 2}
      )`;
      
      orderBy = `ORDER BY distance ASC, i.level ASC`;
      queryParams.push(longitude, latitude, radiusMeters);
      paramIndex += 3;
    }

    // Requête principale
    const sql = `
      SELECT 
        s.id, s.name, s.neighborhood, s.city, s.landmark, s."whatsappNumber",
        s.latitude, s.longitude,
        i.level as "stockLevel", i."lastConfirmedAt",
        ${latitude !== undefined && longitude !== undefined 
          ? `ST_Distance(ST_MakePoint(s.longitude, s.latitude)::geography, ST_MakePoint(${longitude}, ${latitude})::geography) as distance`
          : `0 as distance`}
      FROM "Store" s
      JOIN "Inventory" i ON s.id = i."storeId"
      ${queryCondition}
      ${orderBy}
      LIMIT 20
    `;

    const results = await this.prisma.$queryRawUnsafe<any[]>(sql, ...queryParams);

    // Tâche 4.6 : Journaliser les recherches (surtout si pas de résultat pour analyse métier)
    if (results.length === 0 || textQuery) {
      await this.prisma.searchEvent.create({
        data: {
          userId,
          searchQuery: textQuery,
          latitude,
          longitude,
          radiusKm: params.radiusKm,
          resultsCount: results.length,
        },
      });
    }

    // Enrichissement R6 : Libellé métier ("Stock confirmé il y a X min")
    return results.map(row => {
      const minutesAgo = Math.floor((Date.now() - new Date(row.lastConfirmedAt).getTime()) / 60000);
      let freshness = '🔴 Plus de 12h';
      if (minutesAgo < 60) freshness = '🟢 Moins de 1h';
      else if (minutesAgo < 180) freshness = '🟠 Moins de 3h';
      else if (minutesAgo < 720) freshness = '🔴 Moins de 12h';

      return {
        ...row,
        distanceStr: row.distance ? `${(row.distance / 1000).toFixed(1)} km` : null,
        stockFreshness: `Confirmé il y a ${minutesAgo} min (${freshness})`,
        recommendationReason: row.distance && row.distance < 2000 ? '📍 Le plus proche' : (row.stockLevel === 'HIGH' ? '🔥 Beaucoup de stock' : ''),
      };
    });
  }
}
