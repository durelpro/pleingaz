import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getProducts() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        prices: { where: { status: 'APPROVED' }, orderBy: { effectiveFrom: 'desc' }, take: 1 },
      },
    });
  }

  async updateProductPrice(adminId: string, productId: string, newPublicPrice: number, newDistributorPrice: number, reason?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { prices: { where: { status: 'APPROVED' }, orderBy: { effectiveFrom: 'desc' }, take: 1 } },
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    const oldPrice = product.prices[0];
    const oldPublicPrice = oldPrice?.publicPrice ?? 0;
    const oldDistributorPrice = oldPrice?.distributorPrice ?? 0;

    // Créer le nouveau prix actif
    const newPrice = await this.prisma.productPrice.create({
      data: {
        productId,
        publicPrice: newPublicPrice,
        distributorPrice: newDistributorPrice,
        status: 'APPROVED',
        createdById: adminId,
        approvedById: adminId,
      },
    });

    // Enregistrer l'historique
    await this.prisma.priceHistory.create({
      data: {
        productId,
        oldPublicPrice,
        newPublicPrice,
        oldDistributorPrice,
        newDistributorPrice,
        changeReason: reason || 'Mise à jour tarifaire administrateur',
        changedByUserId: adminId,
      },
    });

    await this.audit.log({
      userId: adminId,
      action: 'UPDATE_PRICE',
      entity: 'ProductPrice',
      entityId: newPrice.id,
      details: {
        oldPublicPrice,
        newPublicPrice,
      },
    });

    return newPrice;
  }
}
