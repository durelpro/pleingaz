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
   * D-05 : Assigner un livreur officiel PLEINGAZ
   */
  async assignDriver(orderId: string, courierId: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { orderId } });
    if (!delivery || delivery.status !== 'PENDING') {
      throw new BadRequestException('Livraison non disponible pour assignation.');
    }

    // Vérifier que le livreur est APPROVED
    const courier = await this.prisma.courier.findUnique({ where: { id: courierId } });
    if (!courier || courier.status !== 'APPROVED') {
      throw new BadRequestException('Livreur non habilité ou suspendu.');
    }

    // Générer le code secret remis au client (4-6 chiffres) et stocker son hash
    const rawCode = crypto.randomInt(100000, 999999).toString();
    const confirmationCodeHash = crypto.createHash('sha256').update(rawCode).digest('hex');

    const updated = await this.prisma.delivery.update({
      where: { orderId },
      data: {
        courierId,
        status: 'ASSIGNED',
        confirmationCodeHash,
      },
    });

    await this.prisma.order.update({ where: { id: orderId }, data: { status: 'PREPARING' } });

    await this.audit.log({
      userId: courier.userId,
      action: 'ASSIGN_COURIER',
      entity: 'Delivery',
      entityId: delivery.id,
      details: { courierId },
    });

    return { ...updated, clientCode: rawCode };
  }

  /**
   * D-05 : Mettre à jour l'état de la course (PICKED_UP, IN_TRANSIT)
   */
  async updateStatus(courierId: string, deliveryId: string, status: DeliveryStatus) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (delivery?.courierId !== courierId) throw new ForbiddenException('Non autorisé.');

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status,
        pickedUpAt: status === 'PICKED_UP' ? new Date() : undefined,
      },
    });

    if (status === 'IN_TRANSIT') {
      await this.prisma.order.update({ where: { id: delivery.orderId }, data: { status: 'SHIPPED' } });
    }

    await this.audit.log({
      userId: courierId,
      action: 'UPDATE_DELIVERY_STATUS',
      entity: 'Delivery',
      entityId: deliveryId,
      details: { status },
    });

    return updated;
  }

  /**
   * D-05 : Finaliser la livraison avec code client obligatoire
   */
  async completeDelivery(courierId: string, deliveryId: string, code: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (delivery?.courierId !== courierId) throw new ForbiddenException('Non autorisé.');

    const inputHash = crypto.createHash('sha256').update(code).digest('hex');
    if (delivery.confirmationCodeHash !== inputHash) {
      throw new BadRequestException('Code de confirmation invalide.');
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'DELIVERED', deliveredAt: new Date(), confirmationCodeHash: null },
    });

    await this.prisma.order.update({ where: { id: delivery.orderId }, data: { status: 'DELIVERED' } });

    await this.audit.log({
      userId: courierId,
      action: 'COMPLETE_DELIVERY',
      entity: 'Delivery',
      entityId: deliveryId,
    });

    return updated;
  }
}
