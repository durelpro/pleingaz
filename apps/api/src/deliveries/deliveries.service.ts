import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';
import {
  RegisterCourierDto,
  UpdateAvailabilityDto,
  CompleteDeliveryDto,
  RemitCashDto,
} from './dto/delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * D-05: Inscription d'un livreur partenaire indépendant
   */
  async registerCourier(userId: string, dto: RegisterCourierDto): Promise<any> {
    const existing = await this.prisma.courier.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('Vous possédez déjà un profil livreur sur PLEINGAZ.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Créer le profil livreur
      const courier = await tx.courier.create({
        data: {
          userId,
          vehicleType: dto.vehicleType,
          status: 'APPROVED', // Activation directe pour le réseau local
          cashBalance: 0,
          availability: {
            create: {
              isOnline: true,
              lastSeenAt: new Date(),
            },
          },
          zones: {
            create: [
              {
                city: dto.city,
                areaName: dto.areaName,
              },
            ],
          },
        },
        include: { availability: true, zones: true },
      });

      // 2. Attribuer le rôle COURIER à l'utilisateur
      const courierRole = await tx.role.findUnique({
        where: { name: 'COURIER' },
      });

      if (courierRole) {
        const existingRole = await tx.userRole.findFirst({
          where: { userId, roleId: courierRole.id },
        });
        if (!existingRole) {
          await tx.userRole.create({
            data: { userId, roleId: courierRole.id },
          });
        }
      }

      await this.audit.log({
        userId,
        action: 'REGISTER_COURIER',
        entity: 'Courier',
        entityId: courier.id,
        details: { vehicleType: dto.vehicleType, city: dto.city },
      });

      return courier;
    });
  }

  /**
   * D-05: Bascule de disponibilité en temps réel (En ligne / Hors ligne)
   */
  async updateAvailability(userId: string, dto: UpdateAvailabilityDto): Promise<any> {
    const courier = await this.prisma.courier.findUnique({
      where: { userId },
      include: { availability: true },
    });

    if (!courier) {
      throw new NotFoundException('Profil livreur introuvable.');
    }

    return this.prisma.courierAvailability.upsert({
      where: { courierId: courier.id },
      update: {
        isOnline: dto.isOnline,
        currentLat: dto.currentLat,
        currentLng: dto.currentLng,
        lastSeenAt: new Date(),
      },
      create: {
        courierId: courier.id,
        isOnline: dto.isOnline,
        currentLat: dto.currentLat,
        currentLng: dto.currentLng,
        lastSeenAt: new Date(),
      },
    });
  }

  /**
   * D-05: Courses disponibles avec contrôle du plafond de détention d'espèces (50 000 FCFA)
   */
  async getAvailableDeliveries(userId: string): Promise<any> {
    const courier = await this.prisma.courier.findUnique({
      where: { userId },
    });

    if (!courier) {
      throw new NotFoundException('Profil livreur introuvable.');
    }

    // Récupération du plafond d'espèces depuis PlatformSettings (défaut: 50 000 FCFA)
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'singleton' },
      select: { maxCashHoldingCourier: true },
    });
    const maxCashLimit = settings?.maxCashHoldingCourier || 50000;

    // Règle de sécurité D-05 bloquante :
    if (courier.cashBalance >= maxCashLimit) {
      return {
        blocked: true,
        reason: 'MAX_CASH_HOLDING_REACHED',
        cashBalance: courier.cashBalance,
        maxCashLimit,
        message: `Plafond de détention d'espèces atteint (${courier.cashBalance.toLocaleString()} / ${maxCashLimit.toLocaleString()} FCFA). Veuillez verser vos fonds au dépôt ou siège PLEINGAZ pour accepter de nouvelles courses.`,
        deliveries: [],
      };
    }

    const deliveries = await this.prisma.delivery.findMany({
      where: { status: 'PENDING' },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            deliveryAddress: true,
            deliveryNotes: true,
            store: {
              select: {
                id: true,
                name: true,
                city: true,
                neighborhood: true,
                landmark: true,
                whatsappNumber: true,
              },
            },
            customer: {
              select: {
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      blocked: false,
      cashBalance: courier.cashBalance,
      maxCashLimit,
      deliveries,
    };
  }

  /**
   * D-05: Acceptation d'une livraison par un livreur
   */
  async acceptDelivery(userId: string, deliveryId: string): Promise<any> {
    const courier = await this.prisma.courier.findUnique({
      where: { userId },
    });

    if (!courier) {
      throw new NotFoundException('Profil livreur introuvable.');
    }

    // Contrôle plafond cash
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'singleton' },
      select: { maxCashHoldingCourier: true },
    });
    const maxCashLimit = settings?.maxCashHoldingCourier || 50000;

    if (courier.cashBalance >= maxCashLimit) {
      throw new ForbiddenException('Plafond d\'espèces atteint. Versement requis avant de prendre une course.');
    }

    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery || delivery.status !== 'PENDING') {
      throw new BadRequestException('Cette course n\'est plus disponible.');
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'ASSIGNED',
        courierId: courier.id,
      },
      include: { order: true },
    });

    await this.audit.log({
      userId,
      action: 'ACCEPT_DELIVERY',
      entity: 'Delivery',
      entityId: deliveryId,
      details: { courierId: courier.id },
    });

    return updated;
  }

  /**
   * D-05: Confirmation de retrait du colis chez le distributeur
   */
  async pickupDelivery(userId: string, deliveryId: string): Promise<any> {
    const courier = await this.prisma.courier.findUnique({
      where: { userId },
    });

    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery || delivery.courierId !== courier?.id) {
      throw new ForbiddenException('Cette livraison ne vous est pas attribuée.');
    }

    if (delivery.status !== 'ASSIGNED') {
      throw new BadRequestException(`Statut invalide pour le retrait: ${delivery.status}`);
    }

    const updated = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'PICKED_UP',
        pickedUpAt: new Date(),
      },
    });

    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'SHIPPED' },
    });

    return updated;
  }

  /**
   * D-05: Validation de la livraison par code secret client SHA-256 et encaissement
   */
  async completeDelivery(
    userId: string,
    deliveryId: string,
    dto: CompleteDeliveryDto,
  ): Promise<any> {
    const courier = await this.prisma.courier.findUnique({
      where: { userId },
    });

    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery || delivery.courierId !== courier?.id) {
      throw new ForbiddenException('Cette livraison ne vous est pas attribuée.');
    }

    if (delivery.status !== 'PICKED_UP' && delivery.status !== 'ASSIGNED') {
      throw new BadRequestException(`Impossible de finaliser une livraison au statut ${delivery.status}.`);
    }

    // 1. Validation cryptographique du code secret SHA-256 (D-05)
    if (!dto.confirmationCode) {
      throw new BadRequestException('Le code de confirmation remis par le client est obligatoire.');
    }

    const computedHash = crypto
      .createHash('sha256')
      .update(dto.confirmationCode.trim())
      .digest('hex');

    if (computedHash !== delivery.confirmationCodeHash) {
      throw new BadRequestException('Code de confirmation client incorrect. Livraison non validée.');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      // 2. Marquer la livraison comme livrée
      const completedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'DELIVERED',
          deliveredAt: now,
        },
      });

      // 3. Marquer la commande comme livrée
      await tx.order.update({
        where: { id: delivery.orderId },
        data: { status: 'DELIVERED' },
      });

      // 4. Libérer/consommer définitivement la réservation de stock
      await tx.stockReservation.updateMany({
        where: { orderId: delivery.orderId },
        data: { isConsumed: true },
      });

      // 5. Encaissement Cash à la livraison (D-05)
      const orderAmount = delivery.order.totalAmount;
      await tx.cashCollection.create({
        data: {
          deliveryId,
          courierId: courier.id,
          amount: orderAmount,
          status: 'COLLECTED',
        },
      });

      // Incrémenter le solde d'espèces détenu par le livreur
      const updatedCourier = await tx.courier.update({
        where: { id: courier.id },
        data: {
          cashBalance: {
            increment: orderAmount,
          },
        },
      });

      await this.audit.log({
        userId,
        action: 'COMPLETE_DELIVERY',
        entity: 'Delivery',
        entityId: deliveryId,
        details: {
          cashCollected: orderAmount,
          newCashBalance: updatedCourier.cashBalance,
        },
      });

      return {
        delivery: completedDelivery,
        cashCollected: orderAmount,
        currentCashBalance: updatedCourier.cashBalance,
      };
    });
  }

  /**
   * D-05: Versement et réconciliation des espèces collectées (Déblocage livreur)
   */
  async remitCash(
    adminOrStoreUserId: string,
    courierId: string,
    dto: RemitCashDto,
  ): Promise<any> {
    const courier = await this.prisma.courier.findUnique({
      where: { id: courierId },
    });

    if (!courier) {
      throw new NotFoundException('Livreur introuvable.');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Le montant versé doit être strictement positif.');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const newBalance = Math.max(0, courier.cashBalance - dto.amount);

      const updatedCourier = await tx.courier.update({
        where: { id: courierId },
        data: {
          cashBalance: newBalance,
        },
      });

      // Mettre à jour les encaissements en statut reversé
      await tx.cashCollection.updateMany({
        where: {
          courierId,
          status: 'COLLECTED',
        },
        data: {
          status: 'REMITTED_TO_PLEINGAZ',
          remittedAt: now,
          reconciledById: adminOrStoreUserId,
        },
      });

      await this.audit.log({
        userId: adminOrStoreUserId,
        action: 'RECONCILE_COURIER_CASH',
        entity: 'Courier',
        entityId: courierId,
        details: {
          amountRemitted: dto.amount,
          remainingCashBalance: newBalance,
        },
      });

      return {
        courierId,
        amountRemitted: dto.amount,
        remainingCashBalance: newBalance,
        isUnlocked: newBalance < 50000,
      };
    });
  }

  /**
   * Enregistrement d'un livreur rattaché à un distributeur local
   */
  async createDistributorCourier(
    distributorUserId: string,
    dto: { name: string; phone: string; vehicleType?: any; areaName?: string },
  ) {
    if (!dto.phone || !dto.name) {
      throw new BadRequestException('Le nom et le numéro de téléphone du livreur sont obligatoires.');
    }

    const cleanPhone = dto.phone.startsWith('+') ? dto.phone.trim() : `+237${dto.phone.replace(/^0+/, '').trim()}`;

    // Trouver le point de vente du distributeur
    const store = await this.prisma.store.findFirst({
      where: { ownerId: distributorUserId },
    });

    const courierRole = await this.prisma.role.findUnique({
      where: { name: 'COURIER' },
    });

    let courierUser = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!courierUser) {
      courierUser = await this.prisma.user.create({
        data: {
          phone: cleanPhone,
          isPhoneVerified: true,
          roles: courierRole ? { create: [{ roleId: courierRole.id }] } : undefined,
        },
      });
    }

    const existingCourier = await this.prisma.courier.findUnique({
      where: { userId: courierUser.id },
    });

    if (existingCourier) {
      return {
        message: 'Ce livreur est déjà enregistré sur la plateforme.',
        courier: existingCourier,
      };
    }

    const courier = await this.prisma.courier.create({
      data: {
        userId: courierUser.id,
        vehicleType: dto.vehicleType || 'MOTO',
        status: 'APPROVED',
        cashBalance: 0,
        availability: {
          create: {
            isOnline: true,
            lastSeenAt: new Date(),
          },
        },
        zones: {
          create: [
            {
              city: store?.city || 'Douala',
              areaName: dto.areaName || store?.neighborhood || 'Secteur Local',
            },
          ],
        },
      },
      include: { user: true, zones: true, availability: true },
    });

    await this.audit.log({
      userId: distributorUserId,
      action: 'DISTRIBUTOR_REGISTERED_COURIER',
      entity: 'Courier',
      entityId: courier.id,
      details: {
        courierName: dto.name,
        phone: cleanPhone,
        storeId: store?.id,
      },
    });

    return {
      message: `Le livreur ${dto.name} a été enregistré avec succès pour votre point de vente.`,
      courier,
    };
  }

  /**
   * Consultation des livreurs rattachés au secteur d'un distributeur
   */
  async getDistributorCouriers(distributorUserId: string) {
    const store = await this.prisma.store.findFirst({
      where: { ownerId: distributorUserId },
    });

    const city = store?.city || 'Douala';

    return this.prisma.courier.findMany({
      where: {
        zones: {
          some: { city },
        },
      },
      include: {
        user: { select: { id: true, phone: true } },
        zones: true,
        availability: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Création d'un livreur pour la flotte officielle du Siège Central PLEINGAZ (Admin Control Center)
   */
  async createCentralFleetCourier(
    adminId: string,
    dto: { name: string; phone: string; vehicleType?: any; city?: string; areaName?: string },
  ) {
    if (!dto.phone || !dto.name) {
      throw new BadRequestException('Le nom et le numéro de téléphone sont obligatoires pour la flotte du siège.');
    }

    const cleanPhone = dto.phone.startsWith('+') ? dto.phone.trim() : `+237${dto.phone.replace(/^0+/, '').trim()}`;

    const courierRole = await this.prisma.role.findUnique({
      where: { name: 'COURIER' },
    });

    let courierUser = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!courierUser) {
      courierUser = await this.prisma.user.create({
        data: {
          phone: cleanPhone,
          isPhoneVerified: true,
          roles: courierRole ? { create: [{ roleId: courierRole.id }] } : undefined,
        },
      });
    }

    const existingCourier = await this.prisma.courier.findUnique({
      where: { userId: courierUser.id },
    });

    if (existingCourier) {
      return {
        message: 'Ce livreur appartient déjà à la flotte active.',
        courier: existingCourier,
      };
    }

    const courier = await this.prisma.courier.create({
      data: {
        userId: courierUser.id,
        vehicleType: dto.vehicleType || 'MOTO',
        status: 'APPROVED',
        cashBalance: 0,
        availability: {
          create: {
            isOnline: true,
            lastSeenAt: new Date(),
          },
        },
        zones: {
          create: [
            {
              city: dto.city || 'Douala',
              areaName: dto.areaName || 'Flotte Centrale Siège PLEINGAZ',
            },
          ],
        },
      },
      include: { user: true, zones: true, availability: true },
    });

    await this.audit.log({
      userId: adminId,
      action: 'ADMIN_CREATED_CENTRAL_FLEET_COURIER',
      entity: 'Courier',
      entityId: courier.id,
      details: {
        name: dto.name,
        phone: cleanPhone,
        city: dto.city || 'Douala',
      },
    });

    return {
      message: `Livreur officiel ${dto.name} ajouté à la flotte centrale du Siège PLEINGAZ.`,
      courier,
    };
  }

  /**
   * Consultation de la flotte complète des livreurs (Siège & Réseau National)
   */
  async getCentralFleetCouriers() {
    return this.prisma.courier.findMany({
      include: {
        user: { select: { id: true, phone: true } },
        zones: true,
        availability: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
