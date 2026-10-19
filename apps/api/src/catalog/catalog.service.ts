import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ProposePriceDto } from './dto/propose-price.dto';
import { ApprovePriceDto, RejectPriceDto } from './dto/decision-price.dto';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * D-01: Récupération de la liste ordonnée des catégories de produits PLEINGAZ
   */
  async getCategories() {
    return this.prisma.productCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * D-01: Récupération du catalogue officiel PLEINGAZ exclusif (sans marques tierces)
   * Seuls les prix approuvés (APPROVED) sont retournés aux clients.
   */
  async getProducts(params?: { categoryId?: string; search?: string; onlyActive?: boolean }) {
    const where: any = {};

    if (params?.onlyActive !== false) {
      where.isActive = true;
    }

    if (params?.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        category: true,
        prices: {
          where: { status: 'APPROVED' },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * D-01: Fiche détaillée d'un produit PLEINGAZ avec son prix officiel en vigueur
   */
  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        prices: {
          where: { status: 'APPROVED' },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Produit PLEINGAZ introuvable (ID: ${id})`);
    }

    return product;
  }

  /**
   * D-01 & D-06: Proposition d'un barème de prix (Rôle Maker)
   * Tout nouveau prix est créé en attente (PENDING_APPROVAL) et ne peut être actif immédiatement.
   */
  async proposePrice(makerId: string, dto: ProposePriceDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Produit introuvable (ID: ${dto.productId})`);
    }

    // Cohérence économique
    if (dto.publicPrice <= 0 || dto.distributorPrice <= 0) {
      throw new BadRequestException('Les prix public et distributeur doivent être strictement positifs.');
    }

    if (dto.distributorPrice > dto.publicPrice) {
      throw new BadRequestException(
        'Le prix de cession distributeur ne peut pas être supérieur au prix public TTC.'
      );
    }

    const proposedPrice = await this.prisma.productPrice.create({
      data: {
        productId: dto.productId,
        publicPrice: dto.publicPrice,
        distributorPrice: dto.distributorPrice,
        status: 'PROPOSED',
        createdById: makerId,
      },
    });

    await this.audit.log({
      userId: makerId,
      action: 'PROPOSE_PRICE',
      entity: 'ProductPrice',
      entityId: proposedPrice.id,
      details: {
        productId: dto.productId,
        publicPrice: dto.publicPrice,
        distributorPrice: dto.distributorPrice,
        reason: dto.reason,
      },
    });

    return proposedPrice;
  }

  /**
   * D-01 & D-06: Approbation d'un barème de prix (Rôle Checker)
   * RÈGLE ABSOLUE : approvedById !== createdById (Séparation stricte des pouvoirs).
   */
  async approvePrice(checkerId: string, priceId: string, dto?: ApprovePriceDto) {
    const price = await this.prisma.productPrice.findUnique({
      where: { id: priceId },
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
    });

    if (!price) {
      throw new NotFoundException(`Proposition tarifaire introuvable (ID: ${priceId})`);
    }

    if (price.status !== 'PROPOSED') {
      throw new BadRequestException(
        `Cette proposition ne peut être approuvée car son statut actuel est ${price.status}.`
      );
    }

    // Règle Maker-Checker non négociable
    if (price.createdById === checkerId) {
      throw new ForbiddenException(
        'Principe Maker-Checker : vous ne pouvez pas approuver une modification tarifaire que vous avez vous-même initiée.'
      );
    }

    const now = new Date();
    const currentActivePrice = price.product.prices[0];

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Archiver le prix actif précédent s'il existe
      if (currentActivePrice) {
        await tx.productPrice.update({
          where: { id: currentActivePrice.id },
          data: {
            status: 'EXPIRED',
            effectiveTo: now,
          },
        });
      }

      // 2. Activer le nouveau prix
      const approvedPrice = await tx.productPrice.update({
        where: { id: priceId },
        data: {
          status: 'APPROVED',
          approvedById: checkerId,
          effectiveFrom: now,
        },
      });

      // 3. Enregistrer l'historique officiel d'audit
      await tx.priceHistory.create({
        data: {
          productId: price.productId,
          oldPublicPrice: currentActivePrice?.publicPrice ?? 0,
          newPublicPrice: price.publicPrice,
          oldDistributorPrice: currentActivePrice?.distributorPrice ?? 0,
          newDistributorPrice: price.distributorPrice,
          changeReason: dto?.comment || 'Approbation tarifaire Maker-Checker',
          changedByUserId: checkerId,
        },
      });

      return approvedPrice;
    });

    await this.audit.log({
      userId: checkerId,
      action: 'APPROVE_PRICE',
      entity: 'ProductPrice',
      entityId: priceId,
      details: {
        productId: price.productId,
        publicPrice: price.publicPrice,
        distributorPrice: price.distributorPrice,
        createdById: price.createdById,
        comment: dto?.comment,
      },
    });

    return result;
  }

  /**
   * D-01 & D-06: Rejet d'un barème de prix (Rôle Checker)
   */
  async rejectPrice(checkerId: string, priceId: string, dto: RejectPriceDto) {
    const price = await this.prisma.productPrice.findUnique({
      where: { id: priceId },
    });

    if (!price) {
      throw new NotFoundException(`Proposition tarifaire introuvable (ID: ${priceId})`);
    }

    if (price.status !== 'PROPOSED') {
      throw new BadRequestException(
        `Cette proposition ne peut être rejetée car son statut actuel est ${price.status}.`
      );
    }

    if (!dto.rejectionReason || dto.rejectionReason.trim().length === 0) {
      throw new BadRequestException('Un motif de rejet explicite est obligatoire pour l\'audit.');
    }

    if (price.createdById === checkerId) {
      throw new ForbiddenException(
        'Principe Maker-Checker : vous ne pouvez pas rejeter votre propre proposition en qualité de Checker.'
      );
    }

    const rejectedPrice = await this.prisma.productPrice.update({
      where: { id: priceId },
      data: {
        status: 'REJECTED',
        approvedById: checkerId,
      },
    });

    await this.audit.log({
      userId: checkerId,
      action: 'REJECT_PRICE',
      entity: 'ProductPrice',
      entityId: priceId,
      details: {
        productId: price.productId,
        createdById: price.createdById,
        rejectionReason: dto.rejectionReason,
      },
    });

    return rejectedPrice;
  }

  /**
   * Consultation des propositions tarifaires en attente d'approbation (Checker Dashboard)
   */
  async getPendingPrices() {
    return this.prisma.productPrice.findMany({
      where: { status: 'PROPOSED' },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: { select: { name: true } },
          },
        },
        createdBy: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Consultation de l'historique d'audit des prix d'un produit PLEINGAZ
   */
  async getPriceHistory(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true },
    });

    if (!product) {
      throw new NotFoundException(`Produit introuvable (ID: ${productId})`);
    }

    const history = await this.prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { changedAt: 'desc' },
      include: {
        changedByUser: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return {
      product,
      history,
    };
  }
}
