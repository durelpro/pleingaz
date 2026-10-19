import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { StockLevel } from '@pleingaz/database';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Consultation du stock d'une boutique (Public ou Authentifié)
   */
  async getStoreInventory(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, isVerifiedBadge: true, isVisible: true },
    });

    if (!store) {
      throw new NotFoundException(`Boutique introuvable (ID: ${storeId})`);
    }

    return this.prisma.inventory.findMany({
      where: { storeId },
      include: {
        product: {
          include: {
            prices: {
              where: { status: 'APPROVED' },
              orderBy: { effectiveFrom: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { product: { createdAt: 'asc' } },
    });
  }

  /**
   * Consultation du stock de la boutique du commerçant connecté
   */
  async getMyStoreInventory(userId: string) {
    const store = await this.prisma.store.findFirst({
      where: { ownerId: userId },
    });

    if (!store) {
      throw new NotFoundException('Aucune boutique active associée à votre compte distributeur.');
    }

    const items = await this.getStoreInventory(store.id);

    return {
      store: {
        id: store.id,
        name: store.name,
        city: store.city,
        neighborhood: store.neighborhood,
        isVerifiedBadge: store.isVerifiedBadge,
        reliabilityScore: store.reliabilityScore,
      },
      inventory: items.map((item) => {
        const minutesAgo = Math.floor(
          (Date.now() - new Date(item.lastConfirmedAt).getTime()) / 60000
        );

        return {
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          weightKg: item.product.weightKg,
          currentPrice: item.product.prices[0]?.publicPrice ?? null,
          distributorPrice: item.product.prices[0]?.distributorPrice ?? null,
          level: item.level,
          lastConfirmedAt: item.lastConfirmedAt,
          minutesSinceConfirmation: minutesAgo,
          isStale: minutesAgo > 48 * 60, // Plus de 48 heures sans confirmation
        };
      }),
    };
  }

  /**
   * D-01 / D-03: Déclaration qualitative de stock par le distributeur
   * Niveaux stricts: BON, MOYEN, FAIBLE, RUPTURE
   */
  async updateStock(
    userId: string,
    storeId: string,
    productId: string,
    level: StockLevel,
  ) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: userId },
    });

    if (!store) {
      throw new ForbiddenException('Boutique introuvable ou vous n\'avez pas les droits d\'administration sur ce point de vente.');
    }

    const validLevels: StockLevel[] = ['BON', 'MOYEN', 'FAIBLE', 'RUPTURE'];
    if (!validLevels.includes(level)) {
      throw new BadRequestException(`Niveau de stock invalide: "${level}". Valeurs acceptées: BON, MOYEN, FAIBLE, RUPTURE.`);
    }

    const now = new Date();
    const inventory = await this.prisma.inventory.upsert({
      where: { storeId_productId: { storeId, productId } },
      update: {
        level,
        lastConfirmedAt: now,
      },
      create: {
        storeId,
        productId,
        level,
        lastConfirmedAt: now,
      },
    });

    // En cas de retour de stock (BON ou MOYEN), résolution des alertes de réapprovisionnement D-02
    if (level === 'BON' || level === 'MOYEN') {
      await this.resolveDemandAlerts(store, productId);
    }

    await this.audit.log({
      userId,
      action: 'UPDATE_INVENTORY_LEVEL',
      entity: 'Inventory',
      entityId: inventory.id,
      details: {
        storeId,
        productId,
        newLevel: level,
      },
    });

    return inventory;
  }

  /**
   * Confirmation en 1-clic : actualise la date de dernière confirmation de stock
   * sans changer les niveaux qualitatifs (garantit la fraîcheur D-02 pour la recherche).
   */
  async quickConfirmStock(userId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: userId },
    });

    if (!store) {
      throw new ForbiddenException('Boutique introuvable ou accès non autorisé.');
    }

    const now = new Date();
    await this.prisma.inventory.updateMany({
      where: { storeId },
      data: { lastConfirmedAt: now },
    });

    await this.audit.log({
      userId,
      action: 'QUICK_CONFIRM_INVENTORY',
      entity: 'Store',
      entityId: storeId,
      details: { confirmedAt: now },
    });

    return {
      message: 'Stock global confirmé avec succès.',
      confirmedAt: now,
    };
  }

  /**
   * Résolution des alertes clients lors du retour de stock
   */
  private async resolveDemandAlerts(store: { id: string; city: string; neighborhood: string }, productId: string) {
    const alerts = await this.prisma.demandAlert.findMany({
      where: {
        productId,
        isFulfilled: false,
        OR: [
          { storeId: store.id },
          { city: { equals: store.city, mode: 'insensitive' } },
          { neighborhood: { equals: store.neighborhood, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });

    if (alerts.length > 0) {
      await this.prisma.demandAlert.updateMany({
        where: { id: { in: alerts.map((a) => a.id) } },
        data: {
          isFulfilled: true,
          fulfilledAt: new Date(),
        },
      });
    }
  }
}
