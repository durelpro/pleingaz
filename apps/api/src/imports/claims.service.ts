import * as crypto from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PhoneNormalizer } from './phone-normalizer';

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Génère et envoie un code OTP pour revendiquer un point de vente
   */
  async requestOtp(storeId: string, applicantPhone: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Point de vente introuvable.');
    }

    if (store.claimStatus === 'CLAIMED') {
      throw new BadRequestException(
        'Ce point de vente est déjà revendiqué et attribué à un distributeur officiel.',
      );
    }

    const phoneResult = PhoneNormalizer.normalize(applicantPhone);
    if (!phoneResult.isValid || !phoneResult.normalized) {
      throw new BadRequestException(
        'Numéro de téléphone camerounais invalide. Format attendu : +237 6XX XX XX XX ou 6XX XX XX XX.',
      );
    }

    const normalizedPhone = phoneResult.normalized;

    // Génération d'un code OTP à 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // S'assurer qu'un utilisateur existe pour ce numéro ou le créer (rôle DISTRIBUTOR par défaut)
    let user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: normalizedPhone,
          isPhoneVerified: false,
        },
      });
    }

    // Création ou mise à jour de la demande de revendication
    let claim = await this.prisma.storeClaim.findFirst({
      where: {
        storeId,
        status: { in: ['SUBMITTED', 'PHONE_OTP_PENDING'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (claim) {
      claim = await this.prisma.storeClaim.update({
        where: { id: claim.id },
        data: {
          applicantPhone: normalizedPhone,
          userId: user.id,
          otpHash,
          otpExpiresAt,
          status: 'PHONE_OTP_PENDING',
        },
      });
    } else {
      claim = await this.prisma.storeClaim.create({
        data: {
          storeId,
          userId: user.id,
          applicantPhone: normalizedPhone,
          otpHash,
          otpExpiresAt,
          status: 'PHONE_OTP_PENDING',
        },
      });
    }

    // Masquage du numéro pour l'affichage de confirmation
    const maskedPhone = `${normalizedPhone.substring(0, 7)} XXX ${normalizedPhone.substring(normalizedPhone.length - 2)}`;

    // Log simulé pour environnement de développement / test
    console.log(
      `[SMS OTP CLAIM] Code envoyé à ${normalizedPhone} pour boutique "${store.name}" : ${otpCode}`,
    );

    return {
      claimId: claim.id,
      storeId: store.id,
      storeName: store.name,
      maskedPhone,
      expiresAt: otpExpiresAt,
      // debugOtpCode exposé pour faciliter les tests et la démo
      debugOtpCode: otpCode,
    };
  }

  /**
   * Vérifie le code OTP et soumet la revendication pour revue administrative
   */
  async verifyOtp(storeId: string, applicantPhone: string, otpCode: string) {
    const phoneResult = PhoneNormalizer.normalize(applicantPhone);
    if (!phoneResult.isValid || !phoneResult.normalized) {
      throw new BadRequestException('Numéro de téléphone invalide.');
    }

    const claim = await this.prisma.storeClaim.findFirst({
      where: {
        storeId,
        applicantPhone: phoneResult.normalized,
        status: 'PHONE_OTP_PENDING',
      },
      include: { store: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!claim) {
      throw new NotFoundException(
        "Aucune demande d'OTP en attente trouvée pour ce point de vente et ce numéro.",
      );
    }

    if (!claim.otpExpiresAt || claim.otpExpiresAt < new Date()) {
      throw new BadRequestException(
        'Le code OTP a expiré. Veuillez demander un nouveau code.',
      );
    }

    const providedHash = crypto
      .createHash('sha256')
      .update(otpCode.trim())
      .digest('hex');

    if (providedHash !== claim.otpHash) {
      throw new BadRequestException('Code OTP incorrect. Veuillez réessayer.');
    }

    // Validation de l'OTP réussie : transition de la demande vers UNDER_ADMIN_REVIEW
    const updatedClaim = await this.prisma.storeClaim.update({
      where: { id: claim.id },
      data: {
        status: 'UNDER_ADMIN_REVIEW',
        otpVerifiedAt: new Date(),
      },
    });

    // Mise à jour de la boutique en statut PENDING_VERIFICATION
    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        claimStatus: 'PENDING_VERIFICATION',
        verificationLevel: 'CLAIMED_PENDING',
      },
    });

    // Marquer le numéro de l'utilisateur comme vérifié
    await this.prisma.user.update({
      where: { id: claim.userId },
      data: { isPhoneVerified: true },
    });

    return {
      claimId: updatedClaim.id,
      status: 'UNDER_ADMIN_REVIEW',
      storeName: claim.store.name,
      message:
        "Code vérifié avec succès. Votre demande de revendication a été transmise à l'administrateur PLEINGAZ pour instruction finale (Anti-SIM swap).",
    };
  }

  /**
   * Liste les demandes de revendications pour le Control Center admin
   */
  async listClaims(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.storeClaim.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            city: true,
            neighborhood: true,
            landmark: true,
            whatsappNumber: true,
            verificationLevel: true,
            claimStatus: true,
          },
        },
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Arbitrage d'une demande de revendication par l'administrateur
   */
  async reviewClaim(
    claimId: string,
    decision: 'APPROVE' | 'REJECT',
    notes?: string,
    reviewerUserId?: string,
  ): Promise<any> {
    const claim = await this.prisma.storeClaim.findUnique({
      where: { id: claimId },
      include: { store: true },
    });

    if (!claim) {
      throw new NotFoundException('Demande de revendication introuvable.');
    }

    if (decision === 'APPROVE') {
      // 1. Mise à jour de la demande
      const updatedClaim = await this.prisma.storeClaim.update({
        where: { id: claimId },
        data: {
          status: 'APPROVED',
          reviewedById: reviewerUserId,
          reviewedAt: new Date(),
          reviewNotes: notes || 'Approuvé après contrôle anti-SIM swap',
        },
      });

      // 2. Promotion de la boutique en BASIC_VERIFIED et rattachement de l'ownerId
      const existingLocks = (claim.store.fieldLocks as string[]) || [];
      const updatedLocks = Array.from(
        new Set([...existingLocks, 'name', 'whatsappNumber', 'ownerId']),
      );

      const updatedStore = await this.prisma.store.update({
        where: { id: claim.storeId },
        data: {
          ownerId: claim.userId,
          claimStatus: 'CLAIMED',
          verificationLevel: 'BASIC_VERIFIED',
          onlineOrderingEnabled: true,
          whatsappNumber: claim.applicantPhone,
          fieldLocks: updatedLocks,
        },
      });

      return {
        claim: updatedClaim,
        store: updatedStore,
        message: `Point de vente "${updatedStore.name}" attribué avec succès au distributeur (${claim.applicantPhone}). Statut passé à BASIC_VERIFIED.`,
      };
    } else {
      // Rejet de la demande
      const updatedClaim = await this.prisma.storeClaim.update({
        where: { id: claimId },
        data: {
          status: 'REJECTED',
          reviewedById: reviewerUserId,
          reviewedAt: new Date(),
          reviewNotes: notes || 'Revendication rejetée par décision administrative',
        },
      });

      // Rétablissement de la boutique en UNCLAIMED
      const updatedStore = await this.prisma.store.update({
        where: { id: claim.storeId },
        data: {
          claimStatus: 'UNCLAIMED',
          verificationLevel: 'LISTED',
        },
      });

      return {
        claim: updatedClaim,
        store: updatedStore,
        message: `Demande de revendication rejetée pour "${updatedStore.name}".`,
      };
    }
  }

  /**
   * Liste tous les lots d'importation
   */
  async listBatches(): Promise<any> {
    return this.prisma.importBatch.findMany({
      include: {
        _count: {
          select: {
            stores: true,
            records: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Détails d'un lot d'importation avec enregistrements en quarantaine
   */
  async getBatchDetails(batchId: string): Promise<any> {
    const batch = await this.prisma.importBatch.findUnique({
      where: { id: batchId },
      include: {
        records: {
          where: {
            status: {
              in: [
                'QUARANTINE_INDIVIDUAL',
                'QUARANTINE_DUPLICATE',
                'QUARANTINE_INVALID_GEO',
                'QUARANTINE_INVALID_DATA',
              ],
            },
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException("Lot d'importation introuvable.");
    }

    return batch;
  }
}
