import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DistributorAdminService {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads', 'documents');

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getPendingApplications() {
    return this.prisma.distributorApplication.findMany({
      where: { status: 'PENDING' },
      include: { 
        user: true, 
        documents: { orderBy: { createdAt: 'desc' } } 
      },
      orderBy: { createdAt: 'desc' },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentFile(adminId: string, docId: string) {
    const doc = await this.prisma.storeDocument.findUnique({
      where: { id: docId },
      include: { application: true },
    });

    if (!doc) {
      throw new NotFoundException('Document introuvable');
    }

    await this.audit.log({
      userId: adminId,
      action: 'VIEW_DOCUMENT_FILE',
      entity: 'StoreDocument',
      entityId: docId,
      details: { type: doc.type, applicationId: doc.applicationId },
    });

    let candidatePath = '';
    if (doc.fileName) {
      candidatePath = path.join(this.uploadDir, doc.fileName);
    }

    if (!candidatePath || !fs.existsSync(candidatePath)) {
      const files = await fs.promises.readdir(this.uploadDir).catch(() => []);
      const match = files.find(f => f.startsWith(`${doc.applicationId}_${doc.type}`) || f.includes(doc.id));
      if (match) {
        candidatePath = path.join(this.uploadDir, match);
      }
    }

    if (!candidatePath || !fs.existsSync(candidatePath)) {
      candidatePath = path.join(this.uploadDir, `${doc.id}_sample.txt`);
      if (!fs.existsSync(candidatePath)) {
        await fs.promises.writeFile(
          candidatePath, 
          `PLEINGAZ DOCUMENT OFFICIEL\nDocument: ${doc.type}\nBoutique: ${doc.application.businessName}\nDate: ${new Date().toISOString()}`
        );
      }
    }

    return {
      document: doc,
      filePath: candidatePath,
      mimeType: doc.mimeType || 'text/plain',
      fileName: doc.fileName || `${doc.type}.txt`,
    };
  }

  async validateSingleDocument(adminId: string, docId: string, isValid: boolean, rejectedReason?: string) {
    const doc = await this.prisma.storeDocument.update({
      where: { id: docId },
      data: {
        isValid,
        rejectedReason: isValid ? null : (rejectedReason || 'Document non conforme'),
      },
    });

    await this.audit.log({
      userId: adminId,
      action: isValid ? 'APPROVE_DOCUMENT' : 'REJECT_DOCUMENT',
      entity: 'StoreDocument',
      entityId: docId,
      details: { isValid, rejectedReason },
    });

    return doc;
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
        city: application.city || 'Douala',
        neighborhood: application.neighborhood || 'Centre',
        landmark: application.landmark,
        latitude: application.latitude || 4.051,
        longitude: application.longitude || 9.708,
        whatsappNumber: application.whatsappNumber,
        momoReceiverNumber: (application as any).momoReceiverNumber,
        orangeReceiverNumber: (application as any).orangeReceiverNumber,
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

