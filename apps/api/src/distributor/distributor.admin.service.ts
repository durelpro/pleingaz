import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ApplicationStatus } from '@pleingaz/database';
import { ReviewApplicationDto } from './dto/distributor.dto';

@Injectable()
export class DistributorAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Consultation de la liste des dossiers de candidature distributeur
   */
  async getApplications(filters?: { status?: string; city?: string }) {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status as ApplicationStatus;
    }
    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    return this.prisma.distributorApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
        documents: true,
        store: {
          select: {
            id: true,
            name: true,
            isVerifiedBadge: true,
            isVisible: true,
          },
        },
      },
    });
  }

  /**
   * Consultation détaillée d'un dossier KYC avec traçabilité d'audit
   */
  async getApplicationById(adminId: string, applicationId: string): Promise<any> {
    const application = await this.prisma.distributorApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
        documents: true,
        store: true,
      },
    });

    if (!application) {
      throw new NotFoundException(`Dossier distributeur introuvable (ID: ${applicationId})`);
    }

    await this.audit.log({
      userId: adminId,
      action: 'VIEW_KYC_DOSSIER',
      entity: 'DistributorApplication',
      entityId: applicationId,
    });

    return application;
  }

  /**
   * Décision administrative sur le dossier KYC (Approbation ou Rejet)
   * En cas d'approbation :
   * 1. Attribution automatique du rôle DISTRIBUTOR à l'utilisateur
   * 2. Création de la boutique (Store) avec isVerifiedBadge = true
   * 3. Initialisation de l'inventaire des 5 produits officiels PLEINGAZ
   */
  async reviewApplication(
    adminId: string,
    applicationId: string,
    dto: ReviewApplicationDto,
  ): Promise<any> {
    const application = await this.prisma.distributorApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException(`Dossier distributeur introuvable (ID: ${applicationId})`);
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException(
        `Ce dossier ne peut être traité car son statut actuel est ${application.status}.`
      );
    }

    if (dto.decision === 'APPROVE') {
      const now = new Date();

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Valider la candidature
        const updatedApp = await tx.distributorApplication.update({
          where: { id: applicationId },
          data: {
            status: 'APPROVED',
            verifiedAt: now,
          },
        });

        // 2. Créer ou activer la boutique
        const store = await tx.store.create({
          data: {
            applicationId: application.id,
            ownerId: application.userId,
            name: application.businessName || 'Boutique PLEINGAZ',
            city: application.city || 'Douala',
            neighborhood: application.neighborhood || 'Quartier',
            landmark: application.landmark,
            latitude: application.latitude,
            longitude: application.longitude,
            whatsappNumber: application.whatsappNumber || application.user.phone,
            isVerifiedBadge: true,
            isVisible: true,
            deliveryAvailable: false,
          },
        });

        // 3. Attribuer le rôle officiel DISTRIBUTOR à l'utilisateur
        const distributorRole = await tx.role.findUnique({
          where: { name: 'DISTRIBUTOR' },
        });

        if (distributorRole) {
          const existingUserRole = await tx.userRole.findFirst({
            where: {
              userId: application.userId,
              roleId: distributorRole.id,
            },
          });

          if (!existingUserRole) {
            await tx.userRole.create({
              data: {
                userId: application.userId,
                roleId: distributorRole.id,
              },
            });
          }
        }

        // 4. Initialiser le stock des produits officiels PLEINGAZ pour ce Store
        const products = await tx.product.findMany({
          where: { isActive: true },
          select: { id: true },
        });

        for (const prod of products) {
          await tx.inventory.upsert({
            where: {
              storeId_productId: {
                storeId: store.id,
                productId: prod.id,
              },
            },
            create: {
              storeId: store.id,
              productId: prod.id,
              level: 'BON',
              lastConfirmedAt: now,
            },
            update: {},
          });
        }

        return { application: updatedApp, store };
      });

      await this.audit.log({
        userId: adminId,
        action: 'APPROVE_DISTRIBUTOR_KYC',
        entity: 'DistributorApplication',
        entityId: applicationId,
        details: { storeId: result.store.id, ownerId: application.userId },
      });

      return result;
    } else {
      // Rejet de la candidature
      if (!dto.reason || dto.reason.trim().length === 0) {
        throw new BadRequestException('Un motif de rejet explicite est obligatoire pour l\'audit et l\'information du candidat.');
      }

      const rejectedApp = await this.prisma.distributorApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          rejectionReason: dto.reason,
        },
      });

      await this.audit.log({
        userId: adminId,
        action: 'REJECT_DISTRIBUTOR_KYC',
        entity: 'DistributorApplication',
        entityId: applicationId,
        details: { reason: dto.reason },
      });

      return rejectedApp;
    }
  }

  /**
   * Activation ou désactivation de la visibilité publique d'un point de vente par l'administrateur
   */
  async toggleStoreVisibility(adminId: string, storeId: string, isVisible: boolean): Promise<any> {
    const store = await this.prisma.store.update({
      where: { id: storeId },
      data: {
        isVisible,
        isVerifiedBadge: isVisible,
      },
    });

    await this.audit.log({
      userId: adminId,
      action: isVisible ? 'ENABLE_STORE_PUBLIC_VISIBILITY' : 'DISABLE_STORE_PUBLIC_VISIBILITY',
      entity: 'Store',
      entityId: storeId,
      details: { isVisible },
    });

    return store;
  }
}
