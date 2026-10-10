import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ApplicationStatus, DocumentType } from '@pleingaz/database'; // Wait, enums might need to be imported from Prisma Client

@Injectable()
export class DistributorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Étape 1 : Récupérer ou créer un brouillon
  async getOrCreateDraft(userId: string) {
    let application = await this.prisma.distributorApplication.findUnique({
      where: { userId },
      include: { documents: true }
    });

    if (!application) {
      application = await this.prisma.distributorApplication.create({
        data: { userId, status: 'DRAFT', currentStep: 1 },
        include: { documents: true }
      });
    }

    return application;
  }

  // Sauvegarde des étapes intermédiaires du Wizard
  async updateDraft(userId: string, data: any) {
    const application = await this.getOrCreateDraft(userId);
    
    if (application.status !== 'DRAFT' && application.status !== 'REJECTED') {
      throw new BadRequestException("Impossible de modifier une demande en cours de validation");
    }

    const updated = await this.prisma.distributorApplication.update({
      where: { id: application.id },
      data: {
        ...data,
      },
    });

    return updated;
  }

  // Upload sécurisé de document
  async uploadDocument(userId: string, type: string, fileBuffer: Buffer, mimeType: string, fileSize: number) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('Format de fichier non supporté (JPEG, PNG, PDF uniquement)');
    }
    
    if (fileSize > 5 * 1024 * 1024) { // 5MB limit
      throw new BadRequestException('Le fichier dépasse la taille limite de 5 Mo');
    }

    const application = await this.getOrCreateDraft(userId);

    // TODO: Implémenter l'upload vers S3 / Google Cloud Storage ici (Règle métier: stockage privé)
    // Pour l'instant on simule une URL privée générée
    const fileUrl = `private://documents/${application.id}/${type}-${Date.now()}`;

    const doc = await this.prisma.storeDocument.create({
      data: {
        applicationId: application.id,
        type: type as any, // mapping to DocumentType enum
        fileUrl,
      },
    });

    await this.audit.log({
      userId,
      action: 'UPLOAD_DOCUMENT',
      entity: 'StoreDocument',
      entityId: doc.id,
      details: { type },
    });

    return doc;
  }

  // Soumission finale du dossier pour validation admin
  async submitApplication(userId: string) {
    const application = await this.getOrCreateDraft(userId);

    // Vérifications de complétude
    if (!application.businessName || !application.latitude || !application.longitude) {
      throw new BadRequestException("Le dossier est incomplet (nom ou localisation manquante).");
    }
    
    // Vérifier les documents requis (CNI_FRONT, etc.)
    const docs = await this.prisma.storeDocument.findMany({ where: { applicationId: application.id } });
    if (docs.length === 0) {
      throw new BadRequestException("Veuillez fournir les pièces justificatives obligatoires.");
    }

    const submitted = await this.prisma.distributorApplication.update({
      where: { id: application.id },
      data: { status: 'PENDING' },
    });

    await this.audit.log({
      userId,
      action: 'SUBMIT_APPLICATION',
      entity: 'DistributorApplication',
      entityId: submitted.id,
    });

    return submitted;
  }
}
