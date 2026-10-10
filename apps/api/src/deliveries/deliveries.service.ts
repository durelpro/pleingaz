import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DeliveryStatus } from '@pleingaz/database';
import * as crypto from 'crypto';

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Tâche 5.4 : Assigner un livreur
   */
  async assignDriver(orderId: string, driverId: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { orderId } });
    if (!delivery || delivery.status !== 'PENDING') {
      throw new BadRequestException('Livraison non disponible pour assignation.');
    }

    // Générer le code OTP remis au client
    const otp = crypto.randomInt(1000, 9999).toString();

    const updated = await this.prisma.delivery.update({
      where: { orderId },
      data: {
        driverId,
        status: 'ASSIGNED',
        confirmationOtp: otp, // A envoyer au client par SMS/WhatsApp
      },
    });

    await this.prisma.order.update({ where: { id: orderId }, data: { status: 'PREPARING' } });

    await this.audit.log({
      userId: driverId,
      action: 'ASSIGN_DRIVER',
      entity: 'Delivery',
      entityId: delivery.id,
    });

    return updated;
  }

  /**
   * Changer le statut (PICKED_UP, IN_TRANSIT)
   */
  async updateStatus(driverId: string, deliveryId: string, status: DeliveryStatus) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (delivery?.driverId !== driverId) throw new ForbiddenException('Non autorisé.');

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status },
    });

    if (status === 'IN_TRANSIT') {
      await this.prisma.order.update({ where: { id: delivery.orderId }, data: { status: 'SHIPPED' } });
    }

    await this.audit.log({
      userId: driverId,
      action: 'UPDATE_DELIVERY_STATUS',
      entity: 'Delivery',
      entityId: deliveryId,
      details: { status },
    });

    return updated;
  }

  /**
   * Finaliser la livraison (Exige l'OTP)
   */
  async completeDelivery(driverId: string, deliveryId: string, otp: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (delivery?.driverId !== driverId) throw new ForbiddenException('Non autorisé.');

    if (delivery.confirmationOtp !== otp) {
      throw new BadRequestException('Code de confirmation invalide.');
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'DELIVERED', deliveredAt: new Date(), confirmationOtp: null },
    });

    await this.prisma.order.update({ where: { id: delivery.orderId }, data: { status: 'DELIVERED' } });

    await this.audit.log({
      userId: driverId,
      action: 'COMPLETE_DELIVERY',
      entity: 'Delivery',
      entityId: deliveryId,
    });

    return updated;
  }
}
