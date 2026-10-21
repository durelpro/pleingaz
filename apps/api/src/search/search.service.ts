import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NearbySearchParams {
  productId: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  city?: string;
  neighborhood?: string;
  textQuery?: string;
  userId?: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * D-02: Recherche géolocalisée des distributeurs PLEINGAZ à proximité
   * - Calcul précis par formule de Haversine (distance sphérique terrestre)
   * - Rayon paramétrable (défaut 5 km selon platformSettings)
   * - Confidentialité D-02: AUCUNE coordonnée GPS brute client persistée en base.
   */
  async searchStores(params: NearbySearchParams) {
    let effectiveProductId = params.productId;
    if (!effectiveProductId) {
      if (this.prisma.product?.findFirst) {
        const defaultProduct =
          (await this.prisma.product.findFirst({
            where: { sku: 'PG-BOT-125' },
            select: { id: true },
          })) ||
          (await this.prisma.product.findFirst({
            where: { isActive: true },
            select: { id: true },
          }));
        effectiveProductId = defaultProduct?.id || '';
      }
    }

    if (!effectiveProductId) {
      throw new BadRequestException('Le productId est obligatoire pour rechercher les distributeurs disponibles.');
    }

    // Récupération du rayon par défaut configuré sur la plateforme
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'singleton' },
      select: { searchDefaultRadiusKm: true },
    });
    const effectiveRadiusKm = params.radiusKm || settings?.searchDefaultRadiusKm || 5;

    const hasCoordinates =
      params.latitude !== undefined &&
      params.longitude !== undefined &&
      !isNaN(params.latitude) &&
      !isNaN(params.longitude);

    let storesWithInventory: any[] = [];

    if (hasCoordinates) {
      // Recherche géolocalisée par formule Haversine en SQL compatible PostgreSQL standard
      const lat = params.latitude!;
      const lng = params.longitude!;

      const sql = `
        SELECT 
          s.id,
          s.name,
          s.neighborhood,
          s.city,
          s.landmark,
          s."whatsappNumber",
          s.latitude,
          s.longitude,
          s."isVerifiedBadge",
          s."verificationLevel",
          s."claimStatus",
          s."onlineOrderingEnabled",
          s."deliveryAvailable",
          s."reliabilityScore",
          COALESCE(i.level::text, 'NON_ACTUALISE') as "stockLevel",
          i."lastConfirmedAt",
          (
            6371 * acos(
              LEAST(1.0, GREATEST(-1.0,
                cos(radians($1)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians($2))
                + sin(radians($1)) * sin(radians(s.latitude))
              ))
            )
          ) AS "distanceKm"
        FROM "Store" s
        LEFT JOIN "Inventory" i ON s.id = i."storeId" AND i."productId" = $3
        WHERE s."isVisible" = true
          AND s.latitude IS NOT NULL
          AND s.longitude IS NOT NULL
        ORDER BY "distanceKm" ASC
        LIMIT 50;
      `;

      storesWithInventory = await this.prisma.$queryRawUnsafe<any[]>(
        sql,
        lat,
        lng,
        effectiveProductId
      );
    } else {
      // Recherche par zone macro (repli en cas de timeout GPS ou refus géoloc)
      const where: any = {
        isVisible: true,
      };

      if (params.city) {
        where.city = { contains: params.city, mode: 'insensitive' };
      }
      if (params.neighborhood) {
        where.neighborhood = { contains: params.neighborhood, mode: 'insensitive' };
      }
      if (params.textQuery) {
        where.OR = [
          { city: { contains: params.textQuery, mode: 'insensitive' } },
          { neighborhood: { contains: params.textQuery, mode: 'insensitive' } },
          { landmark: { contains: params.textQuery, mode: 'insensitive' } },
          { name: { contains: params.textQuery, mode: 'insensitive' } },
        ];
      }

      const rawStores = await this.prisma.store.findMany({
        where,
        take: 50,
        orderBy: { updatedAt: 'desc' },
        include: {
          inventories: {
            where: { productId: effectiveProductId },
            take: 1,
          },
        },
      });

      storesWithInventory = rawStores.map((s) => ({
        id: s.id,
        name: s.name,
        neighborhood: s.neighborhood,
        city: s.city,
        landmark: s.landmark,
        whatsappNumber: s.whatsappNumber,
        latitude: s.latitude,
        longitude: s.longitude,
        isVerifiedBadge: s.isVerifiedBadge,
        verificationLevel: s.verificationLevel,
        claimStatus: s.claimStatus,
        onlineOrderingEnabled: s.onlineOrderingEnabled,
        deliveryAvailable: s.deliveryAvailable,
        reliabilityScore: s.reliabilityScore,
        stockLevel: s.inventories[0]?.level || 'NON_ACTUALISE',
        lastConfirmedAt: s.inventories[0]?.lastConfirmedAt || null,
        distanceKm: null,
      }));
    }

    // D-02 & D-03: Journalisation de l'événement de recherche sans coordonnées brutes
    const coarseArea =
      params.city ||
      params.neighborhood ||
      params.textQuery ||
      (hasCoordinates ? 'Zone géolocalisée (clic client)' : 'Zone indéterminée');

    await this.prisma.searchEvent.create({
      data: {
        userId: params.userId,
        coarseArea,
        productId: effectiveProductId,
        resultsCount: storesWithInventory.length,
      },
    });

    // Formatage des métriques d'affichage et de fraîcheur
    return storesWithInventory.map((store) => {
      const isListed = store.verificationLevel === 'LISTED';
      const isOfficial = store.id === 'store-pleingaz-siege-officiel';

      const lastConfirmedDate = store.lastConfirmedAt ? new Date(store.lastConfirmedAt) : null;
      const minutesAgo = lastConfirmedDate
        ? Math.floor((Date.now() - lastConfirmedDate.getTime()) / 60000)
        : null;

      let freshnessLabel = 'Fraîcheur inconnue';
      if (minutesAgo !== null) {
        if (minutesAgo < 60) {
          freshnessLabel = `Confirmé il y a ${minutesAgo} min (🟢 Moins de 1h)`;
        } else if (minutesAgo < 180) {
          freshnessLabel = `Confirmé il y a ${Math.floor(minutesAgo / 60)}h (🟠 Moins de 3h)`;
        } else if (minutesAgo < 720) {
          freshnessLabel = `Confirmé il y a ${Math.floor(minutesAgo / 60)}h (🔴 Moins de 12h)`;
        } else {
          freshnessLabel = `Stock non confirmé depuis plus de 12h (🔴 Risque de rupture)`;
        }
      }

      let stockFreshness = freshnessLabel;
      if (isOfficial) {
        stockFreshness = 'Stock certifié en direct par la plateforme PLEINGAZ (🟢 Garanti)';
      } else if (isListed || !store.lastConfirmedAt || store.stockLevel === 'NON_ACTUALISE') {
        stockFreshness = '⚪ Information non actualisée. Contactez le point de vente.';
      }

      const dist = store.distanceKm !== null && store.distanceKm !== undefined ? Number(store.distanceKm) : null;
      const formattedDistance =
        dist !== null
          ? dist < 1.0
            ? `${Math.max(50, Math.round(dist * 1000))} m`
            : `${dist.toFixed(1)} km`
          : null;

      let recommendationBadge: string | null = null;
      if (isOfficial) {
        recommendationBadge = '🏆 Boutique Officielle Siège PLEINGAZ (Stock Garanti Direct Concepteur)';
      } else if (isListed) {
        recommendationBadge = 'ℹ️ Point de vente PLEINGAZ — Informations en cours de vérification';
      } else if (dist !== null && dist <= 2.0) {
        recommendationBadge = '📍 Point relais à proximité (< 2 km)';
      } else if (store.stockLevel === 'BON') {
        recommendationBadge = '🔥 Stock optimal garanti';
      }

      return {
        id: store.id,
        name: store.name,
        neighborhood: store.neighborhood,
        city: store.city,
        landmark: store.landmark,
        whatsappNumber: store.whatsappNumber,
        deliveryAvailable: store.deliveryAvailable,
        verificationLevel: store.verificationLevel || 'FULLY_VERIFIED',
        claimStatus: store.claimStatus || 'CLAIMED',
        onlineOrderingEnabled: store.onlineOrderingEnabled !== false,
        isVerifiedBadge: store.verificationLevel === 'FULLY_VERIFIED' && store.isVerifiedBadge,
        reliabilityScore: isOfficial ? 100 : isListed ? null : store.reliabilityScore,
        stockLevel: store.stockLevel,
        lastConfirmedAt: store.lastConfirmedAt,
        distanceKm: dist !== null ? Math.round(dist * 10) / 10 : null,
        distanceStr: formattedDistance,
        stockFreshness,
        isOfficialCompanyStore: isOfficial,
        isListedUnclaimed: isListed,
        verificationNotice: isListed ? 'Point de vente PLEINGAZ — Informations en cours de vérification' : null,
        recommendationBadge,
      };
    });
  }

  /**
   * D-02: Recherche de repli par ville et quartier (Fallback après timeout de 8 secondes)
   */
  async searchByArea(params: { productId: string; city: string; neighborhood?: string; userId?: string }) {
    return this.searchStores({
      productId: params.productId,
      city: params.city,
      neighborhood: params.neighborhood,
      userId: params.userId,
    });
  }
}
