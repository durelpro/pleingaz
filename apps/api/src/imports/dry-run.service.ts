import * as crypto from 'crypto';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { KmlParser } from './kml-parser';
import { ImportSanitizer } from './sanitizer';
import { PhoneNormalizer } from './phone-normalizer';
import { GeoUtils } from './geo-utils';
import { ImportClassifier } from './classifier';
import { DryRunReport, ProcessedPlacemark, RawPlacemark } from './types';

@Injectable()
export class ImportDryRunService {
  /**
   * Exécute un Dry-Run complet sans aucune écriture en base de données
   */
  executeDryRun(filePath: string): DryRunReport {
    const fileBuffer = fs.readFileSync(filePath);
    const fileHashSha256 = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    const rawPlacemarks = KmlParser.parse(fileBuffer);
    const processedItems: ProcessedPlacemark[] = [];

    let pointDeVenteConforme = 0;
    let grossisteOuDepot = 0;
    let particulierOuMenage = 0;
    let invalideOuIncomplet = 0;

    let quarantinedIndividual = 0;
    let quarantinedOutOfBoundsGeo = 0;
    let quarantinedDuplicates = 0;
    let quarantinedInvalidData = 0;

    let validPhoneCount = 0;
    let invalidOrMissingPhoneCount = 0;

    let withinCameroonCount = 0;
    let outOfBoundsCount = 0;

    for (let index = 0; index < rawPlacemarks.length; index++) {
      const pm = rawPlacemarks[index];
      const sourceRef =
        pm.id ||
        `kml_pm_${index + 1}_${crypto
          .createHash('md5')
          .update(`${pm.name}_${pm.coordinates.latitude}_${pm.coordinates.longitude}`)
          .digest('hex')
          .substring(0, 8)}`;

      // 1. Désinfection de sécurité
      const cleanName = ImportSanitizer.cleanText(pm.name);
      const cleanDescription = ImportSanitizer.cleanText(pm.description);

      // 2. Coordonnées et validation territoriale
      const lat = pm.coordinates.latitude;
      const lon = pm.coordinates.longitude;
      const isWithinCameroon = GeoUtils.isWithinCameroon(lat, lon);

      if (isWithinCameroon) {
        withinCameroonCount++;
      } else {
        outOfBoundsCount++;
      }

      // 3. Extraction et normalisation téléphonique
      // Recherche dans ExtendedData ou dans la description
      const phoneCandidates = [
        pm.extendedData?.phone,
        pm.extendedData?.tel,
        cleanDescription,
        cleanName,
      ].filter(Boolean) as string[];

      let normalizedPhone: string | undefined;
      let isPhoneValid = false;
      let rawPhoneFound: string | undefined;

      for (const candidate of phoneCandidates) {
        const phoneResult = PhoneNormalizer.extractFromText(candidate);
        if (phoneResult.isValid) {
          normalizedPhone = phoneResult.normalized;
          isPhoneValid = true;
          rawPhoneFound = phoneResult.raw;
          break;
        }
      }

      if (isPhoneValid) {
        validPhoneCount++;
      } else {
        invalidOrMissingPhoneCount++;
      }

      // 4. Classification D-08
      const classification = ImportClassifier.classify(
        cleanName,
        cleanDescription,
      );

      switch (classification) {
        case 'POINT_DE_VENTE_CONFORME':
          pointDeVenteConforme++;
          break;
        case 'GROSSISTE_OU_DEPOT':
          grossisteOuDepot++;
          break;
        case 'PARTICULIER_OU_MENAGE':
          particulierOuMenage++;
          break;
        case 'INVALIDE_OU_INCOMPLET':
          invalideOuIncomplet++;
          break;
      }

      // 5. Détection de quarantaine
      let isQuarantined = false;
      let quarantineReason: string | undefined;

      if (classification === 'PARTICULIER_OU_MENAGE') {
        isQuarantined = true;
        quarantineReason = 'QUARANTINE_INDIVIDUAL';
        quarantinedIndividual++;
      } else if (!isWithinCameroon) {
        isQuarantined = true;
        quarantineReason = 'QUARANTINE_INVALID_GEO';
        quarantinedOutOfBoundsGeo++;
      } else if (classification === 'INVALIDE_OU_INCOMPLET') {
        isQuarantined = true;
        quarantineReason = 'QUARANTINE_INVALID_DATA';
        quarantinedInvalidData++;
      }

      // 6. Détection des doublons
      let isDuplicate = false;
      let duplicateOfSourceRef: string | undefined;

      if (!isQuarantined) {
        for (const existing of processedItems) {
          if (existing.isQuarantined) continue;

          const distanceMeters = GeoUtils.calculateDistanceMeters(
            lat,
            lon,
            existing.latitude,
            existing.longitude,
          );

          const samePhone =
            isPhoneValid &&
            existing.isPhoneValid &&
            normalizedPhone === existing.normalizedPhone;

          const exactName =
            cleanName.toLowerCase() === existing.name.toLowerCase();

          if (distanceMeters < 50 && (samePhone || exactName)) {
            isDuplicate = true;
            duplicateOfSourceRef = existing.sourceRef;
            isQuarantined = true;
            quarantineReason = 'QUARANTINE_DUPLICATE';
            quarantinedDuplicates++;
            break;
          }
        }
      }

      processedItems.push({
        sourceRef,
        name: cleanName,
        rawDescription: pm.description || '',
        cleanDescription,
        rawPhone: rawPhoneFound,
        normalizedPhone,
        isPhoneValid,
        latitude: lat,
        longitude: lon,
        isWithinCameroon,
        classification,
        folderName: pm.folderName,
        isQuarantined,
        quarantineReason,
        isDuplicate,
        duplicateOfSourceRef,
      });
    }

    const totalQuarantined =
      quarantinedIndividual +
      quarantinedOutOfBoundsGeo +
      quarantinedDuplicates +
      quarantinedInvalidData;

    const validForImport = rawPlacemarks.length - totalQuarantined;

    return {
      fileHashSha256,
      totalPlacemarks: rawPlacemarks.length,
      validForImport,
      breakdown: {
        pointDeVenteConforme,
        grossisteOuDepot,
        particulierOuMenage,
        invalideOuIncomplet,
      },
      quarantines: {
        total: totalQuarantined,
        individual: quarantinedIndividual,
        outOfBoundsGeo: quarantinedOutOfBoundsGeo,
        duplicates: quarantinedDuplicates,
        invalidData: quarantinedInvalidData,
      },
      phoneStats: {
        validE164: validPhoneCount,
        invalidOrMissing: invalidOrMissingPhoneCount,
      },
      geoStats: {
        withinCameroon: withinCameroonCount,
        outOfBounds: outOfBoundsCount,
      },
      processedItems,
    };
  }
}
