import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { StockLevel } from '@pleingaz/database';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getStoreInventory(storeId: string) {
    return this.prisma.inventory.findMany({
      where: { storeId },
      include: { product: true },
    });
  }

  // Confirmer mon stock maintenant (Tâche 4.2)
  async updateStock(userId: string, storeId: string, productId: string, level: StockLevel) {
    // Sécurité: vérifier que l'utilisateur est bien le proprio du store
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: userId },
    });
    
    if (!store) {
      throw new NotFoundException('Boutique introuvable ou accès refusé');
    }

    const inventory = await this.prisma.inventory.upsert({
      where: { storeId_productId: { storeId, productId } },
      update: { level, lastConfirmedAt: new Date() },
      create: { storeId, productId, level, lastConfirmedAt: new Date() },
    });

    // Si on repasse de RUPTURE à BON/MOYEN, on déclenche les alertes (Tâche 4.7)
    if (level === 'HIGH' || level === 'MEDIUM') {
      await this.triggerDemandAlerts(storeId, productId);
    }

    await this.audit.log({
      userId,
      action: 'UPDATE_INVENTORY',
      entity: 'Inventory',
      entityId: inventory.id,
      details: { level },
    });

    return inventory;
  }

  private async triggerDemandAlerts(storeId: string, productId: string) {
    // Récupérer les coordonnées du store
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store || !store.latitude || !store.longitude) return;

    // Trouver les alertes pour ce produit dans un rayon de 2km
    // C'est ici qu'on utiliserait PostGIS (ST_DWithin), mais pour la démo on appelle Prisma avec requêtes brutes
    const query = `
      SELECT id FROM "DemandAlert"
      WHERE "productId" = $1
        AND "isFulfilled" = false
        AND ST_DWithin(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint($2, $3)::geography,
          2000 -- 2km
        )
    `;

    const alerts = await this.prisma.$queryRawUnsafe<{id: string}[]>(query, productId, store.longitude, store.latitude);
    
    if (alerts.length > 0) {
      // Marquer comme traité et notifier
      await this.prisma.demandAlert.updateMany({
        where: { id: { in: alerts.map(a => a.id) } },
        data: { isFulfilled: true, fulfilledAt: new Date() },
      });

      // TODO: Envoyer notification (Push / SMS)
      console.log(`[ALERTS] ${alerts.length} utilisateurs notifiés pour le produit ${productId}`);
    }
  }
}
