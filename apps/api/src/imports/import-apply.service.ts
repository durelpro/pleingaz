import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImportDryRunService } from './dry-run.service';

export interface ApplyImportOptions {
  filePath: string;
  expectedSha256: string;
  pleingazAgreementRef: string;
  actorUserId?: string;
}

export interface ApplyImportResult {
  batchId: string;
  totalPlacemarks: number;
  importedCount: number;
  quarantinedCount: number;
  fileHashSha256: string;
  status: string;
}

@Injectable()
export class ImportApplyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dryRunService: ImportDryRunService,
  ) {}

  /**
   * Applique de manière transactionnelle l'importation d'un réseau validé (CR-002 Lot 4)
   */
  async applyImport(options: ApplyImportOptions): Promise<ApplyImportResult> {
    const { filePath, expectedSha256, pleingazAgreementRef, actorUserId } =
      options;

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(
        `Fichier source introuvable à l'emplacement : ${filePath}`,
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const computedHash = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    if (computedHash.toLowerCase() !== expectedSha256.toLowerCase()) {
      throw new BadRequestException(
        `Empreinte SHA-256 non concordante. Attendu: ${expectedSha256}, Calculé: ${computedHash}`,
      );
    }

    if (!pleingazAgreementRef || pleingazAgreementRef.trim().length < 3) {
      throw new BadRequestException(
        "L'approbation formelle de PLEINGAZ avec référence écrite est obligatoire.",
      );
    }

    // 1. Exécution de la simulation Dry-Run
    const report = this.dryRunService.executeDryRun(filePath);

    // 2. Écriture transactionnelle en base de données
    const result = await this.prisma.$transaction(
      async (tx) => {
        // A. Création ou mise à jour de l'ImportBatch
        const batch = await tx.importBatch.create({
          data: {
            fileName: path.basename(filePath),
            fileHashSha256: computedHash,
            status: 'APPLIED',
            totalPlacemarks: report.totalPlacemarks,
            importedCount: report.validForImport,
            quarantinedCount: report.quarantines.total,
            pleingazAgreementRef,
            createdById: actorUserId,
            approvedById: actorUserId,
            approvedAt: new Date(),
            appliedAt: new Date(),
            rawSummary: {
              breakdown: report.breakdown,
              quarantines: report.quarantines,
              phoneStats: report.phoneStats,
              geoStats: report.geoStats,
            },
          },
        });

        // B. Traitement de chaque élément
        for (const item of report.processedItems) {
          if (item.isQuarantined) {
            // Règle D-08 : Isolation stricte. ZÉRO insertion dans Store ni User.
            await tx.importRecord.create({
              data: {
                batchId: batch.id,
                sourceRef: item.sourceRef,
                rawName: item.name,
                rawDescription: item.rawDescription,
                rawCoordinates: `${item.longitude},${item.latitude}`,
                classifiedType: item.classification,
                status: item.quarantineReason || 'QUARANTINE_INDIVIDUAL',
                quarantineReason: item.quarantineReason,
                storeId: null,
              },
            });
            continue;
          }

          // C. Détermination de la ville et du quartier
          let city = 'Douala';
          if (item.folderName) {
            const fn = item.folderName.toUpperCase();
            if (fn.includes('YAOUNDE')) {
              city = 'Yaoundé';
            } else if (fn.includes('DOUALA')) {
              city = 'Douala';
            } else {
              city = 'Cameroun (Régions)';
            }
          }

          const neighborhood = item.cleanDescription
            ? item.cleanDescription.substring(0, 60)
            : city;

          // D. Idempotence : Vérification de point existant par (source, sourceRef)
          const existingStore = await tx.store.findUnique({
            where: {
              source_sourceRef: {
                source: 'MY_MAPS_IMPORT',
                sourceRef: item.sourceRef,
              },
            },
          });

          let storeId: string;

          if (existingStore) {
            storeId = existingStore.id;
            // Respect des fieldLocks : ne mettre à jour que ce qui n'est pas verrouillé
            const locks = (existingStore.fieldLocks as string[]) || [];

            const updateData: any = {
              importBatchId: batch.id,
            };

            if (!locks.includes('name')) updateData.name = item.name;
            if (!locks.includes('latitude')) updateData.latitude = item.latitude;
            if (!locks.includes('longitude'))
              updateData.longitude = item.longitude;
            if (!locks.includes('whatsappNumber') && item.normalizedPhone) {
              updateData.whatsappNumber = item.normalizedPhone;
            }

            await tx.store.update({
              where: { id: storeId },
              data: updateData,
            });
          } else {
            // Création d'une nouvelle boutique importée (LISTED)
            const createdStore = await tx.store.create({
              data: {
                name: item.name,
                city,
                neighborhood,
                landmark: item.cleanDescription || null,
                latitude: item.latitude,
                longitude: item.longitude,
                whatsappNumber: item.normalizedPhone || null,
                isVerifiedBadge: false, // Strictement réservé aux FULLY_VERIFIED
                isVisible: true,
                deliveryAvailable: false,
                verificationLevel: 'LISTED',
                claimStatus: 'UNCLAIMED',
                source: 'MY_MAPS_IMPORT',
                sourceRef: item.sourceRef,
                onlineOrderingEnabled: false, // Commande en ligne désactivée
                importBatchId: batch.id,
                ownerId: null, // Zéro compte User créé
              },
            });
            storeId = createdStore.id;
          }

          // E. Traçabilité dans ImportRecord
          await tx.importRecord.create({
            data: {
              batchId: batch.id,
              storeId,
              sourceRef: item.sourceRef,
              rawName: item.name,
              rawDescription: item.rawDescription,
              rawCoordinates: `${item.longitude},${item.latitude}`,
              classifiedType: item.classification,
              status: 'IMPORTED',
            },
          });
        }

        return {
          batchId: batch.id,
          totalPlacemarks: report.totalPlacemarks,
          importedCount: report.validForImport,
          quarantinedCount: report.quarantines.total,
          fileHashSha256: computedHash,
          status: batch.status,
        };
      },
      {
        timeout: 30000, // 30s timeout pour 70 fiches
      },
    );

    return result;
  }
}
