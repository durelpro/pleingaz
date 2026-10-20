import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import { CreateOrderDto, NotifyPaymentDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @InjectQueue('stock-reservations') private reservationsQueue: Queue,
  ) {}

  /**
   * Création d'une commande B2C avec réservation éphémère de 15 minutes et code SHA-256 (D-05)
   */
  async createOrder(customerId: string, dto: CreateOrderDto): Promise<any> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('La commande doit contenir au moins un produit.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Vérification de la boutique si spécifiée
      let store = null;
      if (dto.storeId) {
        store = await tx.store.findUnique({
          where: { id: dto.storeId },
        });
        if (!store || !store.isVisible) {
          throw new BadRequestException('Boutique sélectionnée indisponible.');
        }
      }

      // 2. Vérification des produits et calcul du montant avec prix approuvés (D-01)
      let totalAmount = 0;
      const orderItemsData: any[] = [];
      const reservationsData: any[] = [];
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60000); // 15 minutes strictes

      for (const item of dto.items) {
        if (item.quantity <= 0) {
          throw new BadRequestException('La quantité doit être strictement positive.');
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            prices: {
              where: { status: 'APPROVED' },
              orderBy: { effectiveFrom: 'desc' },
              take: 1,
            },
          },
        });

        if (!product || !product.isActive) {
          throw new NotFoundException(`Produit PLEINGAZ indisponible (ID: ${item.productId})`);
        }

        const activePrice = product.prices[0];
        if (!activePrice) {
          throw new BadRequestException(`Aucun barème tarifaire approuvé pour ${product.name}`);
        }

        const unitPrice = activePrice.publicPrice;
        const lineTotal = unitPrice * item.quantity;
        totalAmount += lineTotal;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          totalPrice: lineTotal,
        });

        if (dto.storeId) {
          // Réservation temporaire de 15 minutes
          reservationsData.push({
            storeId: dto.storeId,
            productId: item.productId,
            quantity: item.quantity,
            expiresAt,
          });
        }
      }

      // 3. Génération du numéro de commande unique (ex: PG-20261019-XXXX)
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `PG-${dateStr}-${randomSuffix}`;

      const orderType =
        dto.deliveryMode === 'HOME_DELIVERY' ? 'B2C_DELIVERY' : 'B2C_PICKUP';

      // 4. Création de la commande
      const order = await tx.order.create({
        data: {
          orderNumber,
          type: orderType,
          status: 'SUBMITTED',
          customerId,
          storeId: dto.storeId,
          totalAmount,
          deliveryAddress: dto.deliveryAddress,
          deliveryNotes: dto.deliveryNotes,
          deliveryLat: dto.deliveryLat,
          deliveryLng: dto.deliveryLng,
          items: {
            create: orderItemsData,
          },
          reservations: {
            create: reservationsData,
          },
        },
      });

      // 5. Si livraison à domicile, génération du code secret SHA-256 (D-05)
      let clearOtpCode: string | null = null;
      if (dto.deliveryMode === 'HOME_DELIVERY') {
        clearOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const confirmationCodeHash = crypto
          .createHash('sha256')
          .update(clearOtpCode)
          .digest('hex');

        await tx.delivery.create({
          data: {
            orderId: order.id,
            status: 'PENDING',
            confirmationCodeHash,
          },
        });
      }

      // 6. Planification de l'expiration automatique après 15 minutes dans BullMQ
      if (reservationsData.length > 0) {
        await this.reservationsQueue.add(
          'expire-reservation',
          { orderId: order.id },
          { delay: 15 * 60000 }
        );
      }

      await this.audit.log({
        userId: customerId,
        action: 'CREATE_ORDER',
        entity: 'Order',
        entityId: order.id,
        details: {
          orderNumber,
          totalAmount,
          deliveryMode: dto.deliveryMode,
          expiresAt,
        },
      });

      return {
        order,
        reservationExpiresAt: reservationsData.length > 0 ? expiresAt : null,
        clientConfirmationCode: clearOtpCode, // Remis au client pour la livraison
      };
    });
  }

  /**
   * Consultation des commandes du client connecté
   */
  async getMyOrders(userId: string): Promise<any> {
    return this.prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
        delivery: {
          select: {
            id: true,
            status: true,
            courier: {
              select: {
                id: true,
                vehicleType: true,
                user: { select: { phone: true } },
              },
            },
          },
        },
        store: {
          select: { id: true, name: true, city: true, neighborhood: true },
        },
      },
    });
  }

  /**
   * Détail d'une commande
   */
  async getOrderById(userId: string, orderId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        delivery: {
          include: {
            courier: {
              select: {
                id: true,
                vehicleType: true,
                user: { select: { phone: true } },
              },
            },
          },
        },
        store: true,
        reservations: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Commande introuvable (ID: ${orderId})`);
    }

    if (order.customerId !== userId) {
      throw new ForbiddenException('Accès refusé à cette commande.');
    }

    return order;
  }

  /**
   * Annulation de commande et libération de la réservation
   */
  async cancelOrder(userId: string, orderId: string, reason?: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable.');
    }

    if (order.customerId !== userId) {
      throw new ForbiddenException('Action non autorisée.');
    }

    if (['DELIVERED', 'SHIPPED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException(`Impossible d'annuler une commande au statut ${order.status}.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      // Libérer les réservations
      await tx.stockReservation.updateMany({
        where: { orderId, isConsumed: false },
        data: { isConsumed: true },
      });

      // Annuler la livraison si elle était programmée
      if (order.delivery) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: { status: 'CANCELLED', failedReason: reason || 'Annulation par le client' },
        });
      }

      await this.audit.log({
        userId,
        action: 'CANCEL_ORDER',
        entity: 'Order',
        entityId: orderId,
        details: { reason },
      });

      return updatedOrder;
    });
  }

  /**
   * Consultation des commandes de la boutique par le distributeur connecté
   */
  async getStoreOrders(userId: string): Promise<any> {
    const store = await this.prisma.store.findFirst({
      where: { ownerId: userId },
    });

    if (!store) {
      throw new NotFoundException('Aucun point de vente associé à cet utilisateur.');
    }

    return this.prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            phone: true,
            customerProfile: { select: { firstName: true, lastName: true } },
          },
        },
        items: {
          include: { product: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        delivery: {
          include: {
            courier: {
              select: {
                id: true,
                vehicleType: true,
                user: { select: { phone: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Le client signale avoir envoyé son paiement direct (MoMo, OM ou Espèces)
   */
  async notifyPaid(
    userId: string,
    orderId: string,
    dto: NotifyPaymentDto,
  ): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true, payments: true },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable.');
    }

    if (order.customerId !== userId) {
      throw new ForbiddenException('Seul le titulaire de la commande peut signaler le paiement.');
    }

    if (order.status === 'CONFIRMED' || order.status === 'DELIVERED') {
      throw new BadRequestException('Cette commande a déjà été confirmée ou livrée.');
    }

    const paymentAmount = dto.amount || order.totalAmount;
    const idempotencyKey = `direct-pay-${order.id}-${Date.now()}`;

    // Création de l'enregistrement de paiement en attente de vérification par le titulaire du compte
    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: dto.method,
        status: 'PENDING',
        amount: paymentAmount,
        idempotencyKey,
        customerTxRef: dto.customerTxRef || 'Transfert Direct Effectué',
      },
    });

    await this.audit.log({
      userId,
      action: 'PAYMENT_SUBMITTED_BY_CUSTOMER',
      entity: 'Payment',
      entityId: payment.id,
      details: {
        orderId: order.id,
        method: dto.method,
        customerTxRef: dto.customerTxRef,
        amount: paymentAmount,
      },
    });

    return {
      message: 'Règlement soumis avec succès. En attente de validation par le titulaire du compte.',
      payment,
      orderStatus: order.status,
    };
  }

  /**
   * Confirmation souveraine de la réception des fonds par le titulaire du compte (Gérant distributeur)
   */
  async confirmPayment(userId: string, orderId: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
        reservations: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable.');
    }

    // Vérifier que l'utilisateur est bien le propriétaire de la boutique réceptrice ou un admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    const isOwner = order.store && order.store.ownerId === userId;
    const isAdmin =
      user &&
      user.roles.some(
        (r) => r.role?.name === 'ADMIN' || r.role?.name === 'SUPER_ADMIN',
      );

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Seul le propriétaire du point de vente récepteur ou un administrateur peut confirmer la réception des fonds.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();

      // 1. Mise à jour ou création du paiement validé
      let payment = order.payments[0];
      if (payment) {
        payment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            confirmedByUserId: userId,
            confirmedAt: now,
          },
        });
      } else {
        payment = await tx.payment.create({
          data: {
            orderId: order.id,
            method: 'CASH',
            status: 'SUCCESS',
            amount: order.totalAmount,
            idempotencyKey: `confirmed-${order.id}-${now.getTime()}`,
            customerTxRef: 'Paiement direct vérifié par le gérant',
            confirmedByUserId: userId,
            confirmedAt: now,
          },
        });
      }

      // 2. Mise à jour du statut de la commande vers CONFIRMED
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
        include: {
          items: { include: { product: true } },
          store: true,
          payments: true,
        },
      });

      // 3. Consommation des réservations éphémères de 15 min
      await tx.stockReservation.updateMany({
        where: { orderId: order.id, isConsumed: false },
        data: { isConsumed: true },
      });

      // 4. Si livraison prévue, mise à jour
      if (order.type === 'B2C_DELIVERY') {
        const delivery = await tx.delivery.findUnique({ where: { orderId: order.id } });
        if (delivery && delivery.status === 'PENDING') {
          await tx.delivery.update({
            where: { id: delivery.id },
            data: { status: 'ASSIGNED' },
          });
        }
      }

      await this.audit.log({
        userId,
        action: 'PAYMENT_CONFIRMED_BY_RECEIVER',
        entity: 'Order',
        entityId: order.id,
        details: {
          orderNumber: order.orderNumber,
          amount: payment.amount,
          confirmedByUserId: userId,
          confirmedAt: now,
        },
      });

      return {
        message: 'Paiement confirmé avec succès par le titulaire du compte.',
        order: updatedOrder,
        payment,
      };
    });
  }
}

