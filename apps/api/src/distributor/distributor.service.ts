import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DocumentType } from '@pleingaz/database';
import { ApplyDistributorDto } from './dto/distributor.dto';

import { JwtService } from '@nestjs/jwt';

const VALID_DOCUMENT_TYPES: DocumentType[] = [
  'ID_CARD_FRONT',
  'ID_CARD_BACK',
  'PORTRAIT_PHOTO',
  'SHOP_PHOTO',
];

@Injectable()
export class DistributorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Récupère ou initialise la candidature distributeur de l'utilisateur
   */
  async getOrCreateDraft(userId: string): Promise<any> {
    let application = await this.prisma.distributorApplication.findUnique({
      where: { userId },
      include: { documents: true, store: true },
    });

    if (!application) {
      application = await this.prisma.distributorApplication.create({
        data: { userId, status: 'DRAFT', currentStep: 1 },
        include: { documents: true, store: true },
      });
    }

    return application;
  }

  /**
   * D-04: Enregistrement ou mise à jour des coordonnées de la boutique
   */
  async applyOrUpdate(userId: string, dto: ApplyDistributorDto) {
    const application = await this.getOrCreateDraft(userId);

    if (application.status === 'PENDING') {
      throw new BadRequestException('Votre dossier est en cours d\'examen par l\'administration.');
    }

    if (application.status === 'APPROVED') {
      throw new BadRequestException('Votre compte distributeur est déjà validé et actif.');
    }

    if (!dto.businessName || !dto.city || !dto.neighborhood || !dto.whatsappNumber) {
      throw new BadRequestException('Le nom commercial, la ville, le quartier et le numéro WhatsApp sont obligatoires.');
    }

    const updated = await this.prisma.distributorApplication.update({
      where: { id: application.id },
      data: {
        businessName: dto.businessName,
        city: dto.city,
        neighborhood: dto.neighborhood,
        landmark: dto.landmark,
        whatsappNumber: dto.whatsappNumber,
        latitude: dto.latitude,
        longitude: dto.longitude,
        currentStep: 2,
      },
      include: { documents: true },
    });

    await this.audit.log({
      userId,
      action: 'UPDATE_DISTRIBUTOR_DRAFT',
      entity: 'DistributorApplication',
      entityId: updated.id,
      details: { businessName: dto.businessName, city: dto.city },
    });

    return updated;
  }

  /**
   * D-04: Upload d'une pièce justificative KYC
   * STRICTEMENT LIMITÉ AUX 3 TYPES LÉGAUX D-04 :
   * 1. CNI Recto/Verso (ID_CARD_FRONT, ID_CARD_BACK)
   * 2. Photo d'identité (PORTRAIT_PHOTO)
   * 3. Photo du point de vente (SHOP_PHOTO)
   */
  async uploadDocument(
    userId: string,
    type: string,
    fileBuffer: Buffer,
    mimeType: string,
    fileSize: number,
  ) {
    // 1. Validation stricte du type de document (D-04)
    if (!VALID_DOCUMENT_TYPES.includes(type as DocumentType)) {
      throw new BadRequestException(
        `Type de document invalide: "${type}". Règle D-04: seuls ID_CARD_FRONT, ID_CARD_BACK, PORTRAIT_PHOTO et SHOP_PHOTO sont autorisés.`
      );
    }

    // 2. Validation du type MIME
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimes.includes(mimeType)) {
      throw new BadRequestException('Format non supporté. Formats acceptés : JPEG, PNG, PDF.');
    }

    // 3. Validation de la taille limite via PlatformSettings (défaut 5 Mo)
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'singleton' },
      select: { maxUploadSizeBytes: true },
    });
    const maxSizeBytes = settings?.maxUploadSizeBytes || 5 * 1024 * 1024;

    if (fileSize > maxSizeBytes) {
      throw new BadRequestException(
        `Le fichier dépasse la taille maximale autorisée de ${Math.round(maxSizeBytes / (1024 * 1024))} Mo.`
      );
    }

    const application = await this.getOrCreateDraft(userId);

    if (application.status === 'PENDING') {
      throw new BadRequestException('Impossible de modifier les pièces d\'un dossier en cours d\'examen.');
    }

    // Stockage privé : URL de stockage sécurisé
    const fileUrl = `private://documents/kyc/${application.id}/${type}_${Date.now()}`;

    // Si le document de ce type existe déjà pour cette candidature, on le met à jour
    const existingDoc = await this.prisma.storeDocument.findFirst({
      where: { applicationId: application.id, type: type as DocumentType },
    });

    let doc;
    if (existingDoc) {
      doc = await this.prisma.storeDocument.update({
        where: { id: existingDoc.id },
        data: { fileUrl, isValid: null, rejectedReason: null },
      });
    } else {
      doc = await this.prisma.storeDocument.create({
        data: {
          applicationId: application.id,
          type: type as DocumentType,
          fileUrl,
        },
      });
    }

    await this.audit.log({
      userId,
      action: 'UPLOAD_KYC_DOCUMENT',
      entity: 'StoreDocument',
      entityId: doc.id,
      details: { documentType: type, fileSize },
    });

    return doc;
  }

  /**
   * D-04: Soumission finale du dossier pour instruction par l'équipe administrative
   * Vérifie que les 4 fichiers requis (CNI recto, CNI verso, portrait, photo boutique) sont téléversés.
   */
  async submitApplication(userId: string) {
    const application = await this.getOrCreateDraft(userId);

    if (!application.businessName || !application.city || !application.neighborhood) {
      throw new BadRequestException('Informations du point de vente incomplètes.');
    }

    // Contrôle strict des 4 documents obligatoires
    const uploadedDocs = await this.prisma.storeDocument.findMany({
      where: { applicationId: application.id },
      select: { type: true },
    });

    const uploadedTypes = new Set(uploadedDocs.map((d) => d.type));
    const missingTypes = VALID_DOCUMENT_TYPES.filter((t) => !uploadedTypes.has(t));

    if (missingTypes.length > 0) {
      throw new BadRequestException(
        `Dossier incomplet. Pièces manquantes obligatoires (D-04) : ${missingTypes.join(', ')}.`
      );
    }

    const submitted = await this.prisma.distributorApplication.update({
      where: { id: application.id },
      data: {
        status: 'PENDING',
        rejectionReason: null,
      },
      include: { documents: true },
    });

    await this.audit.log({
      userId,
      action: 'SUBMIT_DISTRIBUTOR_APPLICATION',
      entity: 'DistributorApplication',
      entityId: submitted.id,
    });

    return submitted;
  }

  /**
   * Consultation de l'état de sa candidature
   */
  async getMyApplication(userId: string) {
    const application = await this.prisma.distributorApplication.findUnique({
      where: { userId },
      include: {
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

    if (!application) {
      throw new NotFoundException('Aucune candidature distributeur trouvée pour ce compte.');
    }

    return application;
  }

  /**
   * D-04: Candidature publique directe avec upload simultané des 3 pièces KYC
   * Permet à un nouveau distributeur de soumettre son dossier sans être préalablement authentifié
   */
  async submitPublicApplication(
    dto: {
      businessName: string;
      city: string;
      neighborhood: string;
      landmark?: string;
      whatsappNumber: string;
      latitude?: number;
      longitude?: number;
    },
    files: {
      idCardFront?: Express.Multer.File[];
      idCardBack?: Express.Multer.File[];
      portraitPhoto?: Express.Multer.File[];
      shopPhoto?: Express.Multer.File[];
    },
  ) {
    if (!dto.businessName || !dto.city || !dto.neighborhood || !dto.whatsappNumber) {
      throw new BadRequestException('Le nom de la boutique, la ville, le quartier et le numéro WhatsApp sont obligatoires.');
    }

    const cleanPhone = dto.whatsappNumber.startsWith('+')
      ? dto.whatsappNumber.trim()
      : `+237${dto.whatsappNumber.replace(/^0+/, '').trim()}`;

    // 1. Recherche ou création du compte utilisateur distributeur
    const distRole = await this.prisma.role.findUnique({
      where: { name: 'DISTRIBUTOR' },
    });

    let user = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: cleanPhone,
          isPhoneVerified: true,
          roles: distRole ? { create: [{ roleId: distRole.id }] } : undefined,
        },
      });
    }

    // 2. Initialisation / mise à jour de la candidature
    let application = await this.prisma.distributorApplication.findUnique({
      where: { userId: user.id },
    });

    if (application && application.status === 'APPROVED') {
      throw new BadRequestException('Ce point de vente est déjà un distributeur officiel validé.');
    }

    if (!application) {
      application = await this.prisma.distributorApplication.create({
        data: {
          userId: user.id,
          businessName: dto.businessName,
          city: dto.city,
          neighborhood: dto.neighborhood,
          landmark: dto.landmark,
          whatsappNumber: cleanPhone,
          latitude: dto.latitude ? Number(dto.latitude) : undefined,
          longitude: dto.longitude ? Number(dto.longitude) : undefined,
          status: 'PENDING',
          currentStep: 3,
        },
      });
    } else {
      application = await this.prisma.distributorApplication.update({
        where: { id: application.id },
        data: {
          businessName: dto.businessName,
          city: dto.city,
          neighborhood: dto.neighborhood,
          landmark: dto.landmark,
          whatsappNumber: cleanPhone,
          latitude: dto.latitude ? Number(dto.latitude) : application.latitude,
          longitude: dto.longitude ? Number(dto.longitude) : application.longitude,
          status: 'PENDING',
          currentStep: 3,
        },
      });
    }

    // 3. Traitement et sauvegarde des éventuels documents KYC fournis
    const docMap: Array<{ key: keyof typeof files; type: DocumentType; label: string }> = [
      { key: 'idCardFront', type: 'ID_CARD_FRONT', label: 'CNI Recto' },
      { key: 'idCardBack', type: 'ID_CARD_BACK', label: 'CNI Verso' },
      { key: 'portraitPhoto', type: 'PORTRAIT_PHOTO', label: 'Photo Portrait' },
      { key: 'shopPhoto', type: 'SHOP_PHOTO', label: 'Photo Façade Boutique' },
    ];

    const savedDocs = [];
    for (const item of docMap) {
      const fileList = files[item.key];
      if (fileList && fileList.length > 0) {
        const file = fileList[0];
        const fileUrl = `uploads/kyc/${application.id}_${item.type}_${Date.now()}_${file.originalname || 'doc.jpg'}`;

        const doc = await this.prisma.storeDocument.create({
          data: {
            applicationId: application.id,
            type: item.type,
            fileUrl,
          },
        });
        savedDocs.push(doc);
      }
    }

    // 4. Création immédiate de la boutique (Store) pour donner un accès direct à l'espace distributeur
    // RÈGLE R5 : isVisible = false par défaut. L'administrateur conserve la décision souveraine d'activation publique.
    let store = await this.prisma.store.findFirst({
      where: { applicationId: application.id },
    });

    if (!store) {
      store = await this.prisma.store.create({
        data: {
          applicationId: application.id,
          ownerId: user.id,
          name: dto.businessName,
          city: dto.city,
          neighborhood: dto.neighborhood,
          landmark: dto.landmark,
          whatsappNumber: cleanPhone,
          latitude: dto.latitude ? Number(dto.latitude) : undefined,
          longitude: dto.longitude ? Number(dto.longitude) : undefined,
          isVisible: false, // Non visible publiquement tant que l'admin ne l'a pas validé
          isVerifiedBadge: false,
          deliveryAvailable: false,
        },
      });

      // Initialisation immédiate du stock qualitatif des produits officiels
      const products = await this.prisma.product.findMany({ where: { isActive: true }, select: { id: true } });
      for (const prod of products) {
        await this.prisma.inventory.upsert({
          where: { storeId_productId: { storeId: store.id, productId: prod.id } },
          create: { storeId: store.id, productId: prod.id, level: 'BON', lastConfirmedAt: new Date() },
          update: {},
        });
      }
    }

    // 5. Génération du token JWT pour connexion automatique directe
    const accessToken = this.jwtService.sign(
      { sub: user.id, role: 'DISTRIBUTOR', storeId: store.id },
      { expiresIn: '7d' },
    );

    await this.audit.log({
      userId: user.id,
      action: 'PUBLIC_DISTRIBUTOR_APPLICATION_SUBMITTED',
      entity: 'DistributorApplication',
      entityId: application.id,
      details: {
        businessName: dto.businessName,
        phone: cleanPhone,
        documentsUploaded: savedDocs.length,
        storeId: store.id,
      },
    });

    return {
      message: 'Compte distributeur créé avec succès ! Vous avez maintenant accès à votre espace pour gérer votre inventaire et vos livreurs. Votre visibilité publique sera activée par l\'administrateur.',
      applicationId: application.id,
      status: application.status,
      businessName: application.businessName,
      documentsCount: savedDocs.length,
      store: {
        id: store.id,
        name: store.name,
        city: store.city,
        neighborhood: store.neighborhood,
        isVisible: store.isVisible,
        isVerifiedBadge: store.isVerifiedBadge,
      },
      user: {
        id: user.id,
        phone: user.phone,
        role: 'DISTRIBUTOR',
      },
      accessToken,
    };
  }

  /**
   * Upload ultérieur des documents KYC depuis l'espace distributeur (à la demande de l'administrateur ou à son rythme)
   */
  async uploadLaterDocuments(
    userId: string,
    files: {
      idCardFront?: Express.Multer.File[];
      idCardBack?: Express.Multer.File[];
      portraitPhoto?: Express.Multer.File[];
      shopPhoto?: Express.Multer.File[];
    },
  ) {
    const application = await this.prisma.distributorApplication.findUnique({
      where: { userId },
    });

    if (!application) {
      throw new NotFoundException('Dossier distributeur introuvable pour ce compte.');
    }

    const docMap: Array<{ key: keyof typeof files; type: DocumentType; label: string }> = [
      { key: 'idCardFront', type: 'ID_CARD_FRONT', label: 'CNI Recto' },
      { key: 'idCardBack', type: 'ID_CARD_BACK', label: 'CNI Verso' },
      { key: 'portraitPhoto', type: 'PORTRAIT_PHOTO', label: 'Photo Portrait' },
      { key: 'shopPhoto', type: 'SHOP_PHOTO', label: 'Photo Façade Boutique' },
    ];

    const savedDocs = [];
    for (const item of docMap) {
      const fileList = files[item.key];
      if (fileList && fileList.length > 0) {
        const file = fileList[0];
        const fileUrl = `uploads/kyc/${application.id}_${item.type}_${Date.now()}_${file.originalname || 'doc.jpg'}`;

        const doc = await this.prisma.storeDocument.create({
          data: {
            applicationId: application.id,
            type: item.type,
            fileUrl,
          },
        });
        savedDocs.push(doc);
      }
    }

    await this.audit.log({
      userId,
      action: 'KYC_DOCUMENTS_ADDED_POST_REGISTRATION',
      entity: 'DistributorApplication',
      entityId: application.id,
      details: { addedCount: savedDocs.length },
    });

    return {
      message: `${savedDocs.length} pièce(s) justificative(s) téléversée(s) avec succès. Vos documents sont transmis à l'administrateur pour revue.`,
      addedCount: savedDocs.length,
    };
  }
}
