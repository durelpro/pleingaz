import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tâche 4.5 & 4.6 : Recherche géospatiale et textuelle
   */
  async searchStores(params: {
    productId?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number; // Défaut: 5
    textQuery?: string;
    userId?: string;
  }) {
    const { productId, latitude, longitude, textQuery, userId } = params;
    const radiusMeters = (params.radiusKm || 5) * 1000;

    let queryCondition = `WHERE s."isVisible" = true AND s."isVerifiedBadge" = true`;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (productId) {
      queryCondition += ` AND EXISTS (SELECT 1 FROM "Inventory" inv WHERE inv."storeId" = s.id AND inv."productId" = $${paramIndex})`;
      queryParams.push(productId);
      paramIndex++;
    }

    // Condition textuelle multi-mots (nom, quartier, ville, description du lieu/repère)
    if (textQuery && textQuery.trim().length > 0) {
      const words = textQuery.trim().split(/\s+/).filter(w => w.length > 0);
      const wordConditions: string[] = [];

      for (const word of words) {
        wordConditions.push(`(
          unaccent(lower(concat_ws(' ', s.name, s.neighborhood, s.city, coalesce(s.landmark, '')))) ILIKE unaccent(lower($${paramIndex}))
          OR s.neighborhood % $${paramIndex}
          OR coalesce(s.landmark, '') % $${paramIndex}
        )`);
        queryParams.push(`%${word}%`);
        paramIndex++;
      }

      if (wordConditions.length > 0) {
        queryCondition += ` AND (${wordConditions.join(' AND ')})`;
      }
    }

    // Condition géospatiale (PostGIS)
    let orderBy = `ORDER BY s."updatedAt" DESC`;
    if (latitude !== undefined && longitude !== undefined) {
      queryCondition += ` AND ST_DWithin(
        ST_MakePoint(s.longitude, s.latitude)::geography,
        ST_MakePoint($${paramIndex}, $${paramIndex + 1})::geography,
        $${paramIndex + 2}
      )`;
      
      orderBy = `ORDER BY distance ASC, s."updatedAt" DESC`;
      queryParams.push(longitude, latitude, radiusMeters);
      paramIndex += 3;
    }

    // Requête principale
    const sql = `
      SELECT 
        s.id, s.name, s.neighborhood, s.city, s.landmark, s."whatsappNumber",
        s.latitude, s.longitude, s."ownerId",
        COALESCE(
          (SELECT level FROM "Inventory" inv WHERE inv."storeId" = s.id ORDER BY inv.level ASC LIMIT 1),
          'HIGH'
        ) as "stockLevel",
        COALESCE(
          (SELECT "lastConfirmedAt" FROM "Inventory" inv WHERE inv."storeId" = s.id ORDER BY inv."lastConfirmedAt" DESC LIMIT 1),
          s."updatedAt"
        ) as "lastConfirmedAt",
        ${latitude !== undefined && longitude !== undefined 
          ? `ST_Distance(ST_MakePoint(s.longitude, s.latitude)::geography, ST_MakePoint(${longitude}, ${latitude})::geography) as distance`
          : `0 as distance`}
      FROM "Store" s
      ${queryCondition}
      ${orderBy}
      LIMIT 20
    `;

    const results = await this.prisma.$queryRawUnsafe<any[]>(sql, ...queryParams);

    // Tâche 4.6 : Journaliser les recherches
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
      const lastDate = row.lastConfirmedAt ? new Date(row.lastConfirmedAt).getTime() : Date.now();
      const minutesAgo = Math.max(0, Math.floor((Date.now() - lastDate) / 60000));
      let freshness = '🔴 Plus de 12h';
      if (minutesAgo < 60) freshness = '🟢 Moins de 1h';
      else if (minutesAgo < 180) freshness = '🟠 Moins de 3h';
      else if (minutesAgo < 720) freshness = '🔴 Moins de 12h';

      return {
        ...row,
        distanceStr: row.distance ? `${(row.distance / 1000).toFixed(1)} km` : null,
        stockFreshness: `Confirmé il y a ${minutesAgo} min (${freshness})`,
        recommendationReason: row.distance && row.distance < 2000 ? '📍 Le plus proche' : (row.stockLevel === 'HIGH' ? '🔥 Stock disponible' : ''),
      };
    });
  }

  async getStoreDetails(storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { 
        id: storeId,
        isVisible: true,
      },
      include: {
        inventories: {
          include: { product: true }
        },
        orders: {
          where: { review: { isNot: null } },
          include: {
            review: true,
            customer: {
              select: {
                id: true,
                phone: true,
                customerProfile: { select: { firstName: true, lastName: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const reviewsList = store.orders
      .filter((o: any) => o.review)
      .map((o: any) => {
        const name = o.customer.customerProfile
          ? `${o.customer.customerProfile.firstName} ${o.customer.customerProfile.lastName ? o.customer.customerProfile.lastName[0] + '.' : ''}`
          : (o.customer.phone ? `Client (${o.customer.phone.slice(-4)})` : 'Client Vérifié');
        return {
          id: o.review.id,
          rating: o.review.rating,
          comment: o.review.comment,
          createdAt: o.review.createdAt,
          authorName: name,
        };
      });

    const reviewsCount = reviewsList.length;
    const avgRating = reviewsCount > 0 
      ? Number((reviewsList.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount).toFixed(1))
      : null;

    return {
      id: store.id,
      ownerId: store.ownerId,
      name: store.name,
      description: store.landmark ? `Repère : ${store.landmark}` : null,
      address: `${store.landmark ? store.landmark + ', ' : ''}${store.neighborhood || ''}`,
      neighborhood: store.neighborhood,
      landmark: store.landmark,
      city: store.city,
      rating: avgRating,
      reviews: reviewsCount,
      reviewsList,
      latitude: store.latitude,
      longitude: store.longitude,
      phone: store.whatsappNumber,
      hours: store.openingHours ? JSON.stringify(store.openingHours) : null,
      inventory: store.inventories.map(inv => {
        const lastDate = inv.lastConfirmedAt ? new Date(inv.lastConfirmedAt).getTime() : Date.now();
        const minutesAgo = Math.max(0, Math.floor((Date.now() - lastDate) / 60000));
        let freshness = '🔴 Plus de 12h';
        if (minutesAgo < 60) freshness = '🟢 Moins de 1h';
        else if (minutesAgo < 180) freshness = '🟠 Moins de 3h';
        else if (minutesAgo < 720) freshness = '🔴 Moins de 12h';

        return {
          id: inv.id,
          brand: inv.product.brand,
          weight: `${inv.product.weightKg}Kg`,
          price: inv.product.publicPrice,
          status: inv.level === 'OUT_OF_STOCK' ? 'Rupture' : 'En stock',
          color: inv.product.brand === 'SCTM' ? 'bg-blue-600' : 'bg-yellow-500',
          lastConfirmedAt: inv.lastConfirmedAt,
          freshness: `Confirmé il y a ${minutesAgo} min (${freshness})`
        };
      })
    };
  }

  async getSuggestions(query: string) {
    if (!query || query.trim().length === 0) return [];
    const cleanQuery = query.trim();

    const sql = `
      SELECT DISTINCT
        s.neighborhood, s.city, s.landmark, s.name, s.id
      FROM "Store" s
      WHERE s."isVisible" = true
        AND (
          unaccent(lower(concat_ws(' ', s.name, s.neighborhood, s.city, coalesce(s.landmark, '')))) ILIKE unaccent(lower($1))
          OR s.neighborhood % $1
          OR coalesce(s.landmark, '') % $1
        )
      LIMIT 10
    `;

    const rows = await this.prisma.$queryRawUnsafe<any[]>(sql, `%${cleanQuery}%`);

    const suggestions: { type: 'neighborhood' | 'landmark' | 'store'; text: string; subtext?: string; storeId?: string }[] = [];
    const seenTexts = new Set<string>();

    for (const row of rows) {
      if (row.neighborhood && !seenTexts.has(row.neighborhood.toLowerCase())) {
        seenTexts.add(row.neighborhood.toLowerCase());
        suggestions.push({
          type: 'neighborhood',
          text: row.neighborhood,
          subtext: `${row.city || 'Douala'} (Quartier)`
        });
      }
      if (row.landmark && !seenTexts.has(row.landmark.toLowerCase())) {
        seenTexts.add(row.landmark.toLowerCase());
        suggestions.push({
          type: 'landmark',
          text: row.landmark,
          subtext: `${row.neighborhood || 'Quartier'}, ${row.city || 'Douala'} (Repère)`
        });
      }
      if (row.name && !seenTexts.has(row.name.toLowerCase())) {
        seenTexts.add(row.name.toLowerCase());
        suggestions.push({
          type: 'store',
          text: row.name,
          subtext: `${row.neighborhood || 'Quartier'} (Boutique)`,
          storeId: row.id
        });
      }
    }

    return suggestions.slice(0, 8);
  }
}

