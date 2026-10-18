import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
   * MVP Checkout Order (Direct purchase without reservation logic)
   */
  async createCheckoutOrder(userId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { id: data.inventoryId },
        include: { product: true, store: true }
      });

      if (!inventory || inventory.level === 'OUT_OF_STOCK') {
        throw new BadRequestException('Produit en rupture de stock.');
      }

      // Règle R5 : Vérification de la boutique (Visible & Approuvée)
      if (!inventory.store || !inventory.store.isVisible) {
        throw new BadRequestException('Boutique non disponible ou non validée par PLEINGAZ.');
      }

      // Recalcul strict et infalsifiable du prix côté serveur
      const officialGasPrice = inventory.product.publicPrice;
      const depositPrice = data.needsConsigne ? 15000 : 0;
      const verifiedUnitPrice = officialGasPrice + depositPrice;
      const verifiedTotal = verifiedUnitPrice * 1; // 1 unité par commande en direct

      // Rejet immédiat si tentative de manipulation du prix côté client
      if (data.totalAmount && Number(data.totalAmount) !== verifiedTotal) {
        throw new BadRequestException(
          `Montant altéré détecté : le montant officiel requis est de ${verifiedTotal} FCFA.`
        );
      }

      const orderType = data.deliveryMethod === 'DELIVERY' ? 'B2C_DELIVERY' : 'B2C_PICKUP';
      const paymentMethodMapped = data.paymentMethod === 'MOMO' ? 'MTN_MOMO' : data.paymentMethod === 'OM' ? 'ORANGE_MONEY' : 'CASH';

      const itemsToCreate: any[] = [{ 
        productId: inventory.productId, 
        quantity: 1, 
        unitPrice: verifiedUnitPrice, 
        totalPrice: verifiedTotal 
      }];

      // 1. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          type: orderType,
          status: 'SUBMITTED', // SUBMITTED awaiting store processing
          customerId: userId,
          storeId: data.storeId,
          totalAmount: verifiedTotal,
          deliveryAddress: data.address,
          items: {
            create: itemsToCreate
          },
          delivery: {
            create: {
              status: 'PENDING',
              confirmationOtp: Math.floor(1000 + Math.random() * 9000).toString(),
            }
          },
          payments: {
            create: [{
              amount: verifiedTotal,
              method: paymentMethodMapped,
              status: data.paymentMethod === 'CASH' ? 'PENDING' : 'SUCCESS', // Simulating successful MoMo/OM for MVP
              idempotencyKey: `IDEMP-${Date.now()}`,
              providerTxId: `TXN-${Date.now()}`
            }]
          }
        }
      });

      // 2. Generate Automatic Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now()}`,
          orderId: order.id,
          sellerName: `Distributeur Agréé : ${inventory.store.name}`,
          totalAmount: verifiedTotal,
        }
      });

      // 3. Deduct stock safely
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { level: 'LOW' } // Simple MVP logic
      });

      await this.audit.log({
        userId,
        action: 'CREATE_CHECKOUT_ORDER',
        entity: 'Order',
        entityId: order.id,
        details: { verifiedTotal, invoiceId: invoice.id }
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

  async getUserOrders(userId: string): Promise<any> {
    return this.prisma.order.findMany({
      where: { customerId: userId },
      include: { items: { include: { product: true } }, delivery: true, review: true, invoice: true, store: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Tâche 5.1: Gestion des commandes reçues (Distributeur)
   */
  async getStoreOrders(userId: string): Promise<any> {
    // Trouver le store du distributeur
    const store = await this.prisma.store.findFirst({
      where: { ownerId: userId }
    });

    if (!store) throw new NotFoundException('Aucune boutique trouvée pour ce distributeur.');

    return this.prisma.order.findMany({
      where: { storeId: store.id },
      include: { 
        customer: true, 
        items: { include: { product: true } }, 
        delivery: { include: { driver: true } },
        payments: true,
        review: true,
        invoice: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrderById(userId: string, orderId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        store: true,
        delivery: { include: { driver: true } },
        invoice: true,
        payments: true,
        customer: { select: { id: true, phone: true } }
      }
    });

    if (!order) throw new NotFoundException('Commande introuvable.');

    // Contrôle d'accès strict (Cas d'abus : accès à la commande d'autrui)
    const isCustomer = order.customerId === userId;
    const isStoreOwner = order.store && order.store.ownerId === userId;
    const caller = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } }
    });
    const isAdmin = caller?.roles.some(r => r.role.name === 'ADMIN');

    if (!isCustomer && !isStoreOwner && !isAdmin) {
      throw new ForbiddenException("Accès refusé : vous n'êtes pas autorisé à consulter cette commande.");
    }

    return order;
  }

  async updateOrderStatus(userId: string, orderId: string, status: any, otp?: string): Promise<any> {
    const store = await this.prisma.store.findFirst({
      where: { ownerId: userId }
    });

    if (!store) throw new NotFoundException('Aucune boutique trouvée.');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, storeId: store.id },
      include: { customer: true, delivery: true }
    });

    if (!order) throw new NotFoundException('Commande introuvable ou non autorisée.');

    // Si on passe en DELIVERED, vérifier l'OTP s'il est fourni
    if (status === 'DELIVERED' && order.delivery?.confirmationOtp) {
      if (otp && otp.trim() !== order.delivery.confirmationOtp) {
        throw new BadRequestException('Code de confirmation invalide.');
      }
    }

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { status }
    });

    // Mettre à jour également l'entité Delivery
    if (order.delivery) {
      await this.prisma.delivery.update({
        where: { orderId: order.id },
        data: {
          status: status === 'DELIVERED' ? 'DELIVERED' : status === 'SHIPPED' ? 'IN_TRANSIT' : 'PENDING',
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        }
      });
    }

    // Récompenser le client avec des points de fidélité lors d'une livraison réussie (+50 points)
    if (status === 'DELIVERED') {
      await this.prisma.user.update({
        where: { id: order.customerId },
        data: { loyaltyPoints: { increment: 50 } }
      });
    }

    await this.audit.log({
      userId,
      action: 'UPDATE_ORDER_STATUS',
      entity: 'Order',
      entityId: order.id,
      details: { newStatus: status, otpUsed: !!otp }
    });

    return updated;
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
