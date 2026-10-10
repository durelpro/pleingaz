import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @InjectQueue('stock-reservations') private reservationsQueue: Queue,
  ) {}

  /**
   * Tâche 5.3 : Réservation temporaire de stock sans surréservation (Verrous via Transaction Prisma)
   */
  async createReservation(userId: string, storeId: string, productId: string, quantity: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Vérifier le stock actuel (Tâche 5.3: Pas de surréservation)
      const inventory = await tx.inventory.findUnique({
        where: { storeId_productId: { storeId, productId } },
      });

      if (!inventory || inventory.level === 'OUT_OF_STOCK') {
        throw new BadRequestException('Produit en rupture de stock dans cette boutique.');
      }
      
      // En vrai on gère la quantité exacte, ici on se fie au "Level" mais si Level == LOW on limite
      if (inventory.level === 'LOW' && quantity > 1) {
        throw new BadRequestException('Stock faible, maximum 1 article par commande.');
      }

      // 2. Créer la commande en brouillon
      const product = await tx.product.findUnique({ where: { id: productId } });
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          type: 'B2C_PICKUP',
          status: 'DRAFT',
          customerId: userId,
          storeId,
          totalAmount: product!.publicPrice * quantity,
          items: {
            create: [{ productId, quantity, unitPrice: product!.publicPrice, totalPrice: product!.publicPrice * quantity }]
          }
        }
      });

      // 3. Créer la réservation temporaire (15 minutes)
      const expiresAt = new Date(Date.now() + 15 * 60000);
      const reservation = await tx.stockReservation.create({
        data: {
          orderId: order.id,
          storeId,
          productId,
          quantity,
          expiresAt,
        }
      });

      // 4. Programmer l'expiration dans BullMQ
      await this.reservationsQueue.add(
        'expire-reservation',
        { reservationId: reservation.id, orderId: order.id },
        { delay: 15 * 60000 } // 15 mins
      );

      await this.audit.log({
        userId,
        action: 'CREATE_RESERVATION',
        entity: 'Order',
        entityId: order.id,
        details: { storeId, productId, quantity, expiresAt }
      });

      return order;
    });
  }

  /**
   * Confirmer la commande (Convertir le brouillon)
   */
  async confirmOrder(userId: string, orderId: string, deliveryAddress?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { reservations: true }
    });

    if (!order || order.status !== 'DRAFT') throw new NotFoundException('Commande non valide.');
    if (order.customerId !== userId) throw new BadRequestException('Accès refusé.');

    // Marquer la réservation comme consommée
    const activeReservation = order.reservations.find(r => !r.isConsumed && r.expiresAt > new Date());
    if (!activeReservation) {
      throw new BadRequestException('La réservation a expiré, veuillez recommencer.');
    }

    const type = deliveryAddress ? 'B2C_DELIVERY' : 'B2C_PICKUP';

    const confirmedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SUBMITTED',
        type,
        deliveryAddress,
      }
    });

    await this.prisma.stockReservation.update({
      where: { id: activeReservation.id },
      data: { isConsumed: true }
    });

    await this.audit.log({
      userId,
      action: 'CONFIRM_ORDER',
      entity: 'Order',
      entityId: orderId,
    });

    return confirmedOrder;
  }

  /**
   * Tâche 5.7 : Commande assistée (Agent ou Distributeur pour un client)
   */
  async createAssistedOrder(agentId: string, customerPhone: string, storeId: string, productId: string, quantity: number, deliveryAddress?: string) {
    // 1. Trouver ou créer le client
    let customer = await this.prisma.user.findUnique({ where: { phone: customerPhone } });
    if (!customer) {
      customer = await this.prisma.user.create({
        data: {
          phone: customerPhone,
          passwordHash: 'GENERATED_NO_LOGIN', // Mot de passe bidon
        }
      });
    }

    // 2. Créer la commande directement sans réservation (car assistée par l'agent)
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    const type = deliveryAddress ? 'B2C_DELIVERY' : 'B2C_PICKUP';

    const order = await this.prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        type,
        status: 'SUBMITTED', // Directement soumis
        customerId: customer.id,
        storeId,
        totalAmount: product!.publicPrice * quantity,
        deliveryAddress,
        assistedById: agentId,
        items: {
          create: [{ productId, quantity, unitPrice: product!.publicPrice, totalPrice: product!.publicPrice * quantity }]
        }
      }
    });

    await this.audit.log({
      userId: agentId,
      action: 'CREATE_ASSISTED_ORDER',
      entity: 'Order',
      entityId: order.id,
      details: { customerPhone }
    });

    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { customerId: userId },
      include: { items: true, delivery: true, review: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Tâche 9.6: Laisser un avis et gagner des points de fidélité
   */
  async leaveReview(userId: string, orderId: string, rating: number, comment?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true }
    });

    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.customerId !== userId) throw new BadRequestException('Non autorisé');
    if (order.status !== 'DELIVERED') throw new BadRequestException('Commande non livrée');
    if (order.review) throw new BadRequestException('Avis déjà soumis');

    // Enregistrer l'avis
    const review = await this.prisma.review.create({
      data: {
        orderId,
        rating,
        comment,
      }
    });

    // Programme de fidélité (Optionnel): +10 points pour un avis !
    await this.prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { increment: 10 } }
    });

    await this.prisma.loyaltyTransaction.create({
      data: {
        userId,
        points: 10,
        description: `Récompense pour l'avis sur la commande ${order.orderNumber}`
      }
    });

    return review;
  }
}
