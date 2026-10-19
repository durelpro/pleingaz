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
import { CreateOrderDto } from './dto/create-order.dto';

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
}
