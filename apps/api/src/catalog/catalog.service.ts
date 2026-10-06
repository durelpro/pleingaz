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
      include: { category: true },
    });
  }

  async updateProductPrice(adminId: string, productId: string, newPublicPrice: number, newDistributorPrice: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produit introuvable');

    // Mettre à jour le produit
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        publicPrice: newPublicPrice,
        distributorPrice: newDistributorPrice,
      },
    });

    // Enregistrer l'historique (Règle 4.1: historique des changements de prix audité)
    await this.prisma.priceHistory.create({
      data: {
        productId,
        oldPublicPrice: product.publicPrice,
        newPublicPrice,
        oldDistributorPrice: product.distributorPrice,
        newDistributorPrice,
        changedByUserId: adminId,
      },
    });

    await this.audit.log({
      userId: adminId,
      action: 'UPDATE_PRICE',
      entity: 'Product',
      entityId: productId,
      details: {
        oldPublicPrice: product.publicPrice,
        newPublicPrice,
      },
    });

    return updated;
  }
}
