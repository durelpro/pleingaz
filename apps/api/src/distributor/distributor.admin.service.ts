import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ApplicationStatus } from '@pleingaz/database';

@Injectable()
export class DistributorAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getPendingApplications() {
    return this.prisma.distributorApplication.findMany({
      where: { status: 'PENDING' },
      include: { user: true, documents: true },
    });
  }

  async getApplicationDocuments(adminId: string, applicationId: string) {
    // Log l'accès aux documents sensibles
    await this.audit.log({
      userId: adminId,
      action: 'VIEW_DOCUMENTS',
      entity: 'DistributorApplication',
      entityId: applicationId,
    });

    return this.prisma.storeDocument.findMany({
      where: { applicationId },
    });
  }

  async approveApplication(adminId: string, applicationId: string) {
    const application = await this.prisma.distributorApplication.findUnique({ where: { id: applicationId } });
    if (!application || application.status !== 'PENDING') {
      throw new BadRequestException("Dossier invalide ou n'est pas en attente.");
    }

    const updated = await this.prisma.distributorApplication.update({
      where: { id: applicationId },
      data: { status: 'APPROVED', verifiedAt: new Date() },
    });

    // Règle 3.4 : Badge Vérifié
    // Création de la boutique (Store) publique
    const store = await this.prisma.store.create({
      data: {
        applicationId: application.id,
        ownerId: application.userId,
        name: application.businessName || 'Boutique Sans Nom',
        city: application.city!,
        neighborhood: application.neighborhood!,
        landmark: application.landmark,
        latitude: application.latitude,
        longitude: application.longitude,
        whatsappNumber: application.whatsappNumber,
        isVerifiedBadge: true,
        isVisible: true,
      },
    });

    await this.audit.log({
      userId: adminId,
      action: 'APPROVE_APPLICATION',
      entity: 'DistributorApplication',
      entityId: applicationId,
      details: { storeId: store.id },
    });

    return updated;
  }

  async rejectApplication(adminId: string, applicationId: string, reason: string) {
    const application = await this.prisma.distributorApplication.findUnique({ where: { id: applicationId } });
    if (!application || application.status !== 'PENDING') {
      throw new BadRequestException("Dossier invalide ou n'est pas en attente.");
    }

    const updated = await this.prisma.distributorApplication.update({
      where: { id: applicationId },
      data: { status: 'REJECTED', rejectionReason: reason },
    });

    await this.audit.log({
      userId: adminId,
      action: 'REJECT_APPLICATION',
      entity: 'DistributorApplication',
      entityId: applicationId,
      details: { reason },
    });

    return updated;
  }
}
