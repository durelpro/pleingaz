export interface RawPlacemark {
  id?: string;
  name: string;
  description?: string;
  coordinates: {
    longitude: number;
    latitude: number;
    altitude?: number;
  };
  folderName?: string;
  extendedData?: Record<string, string>;
}

export type StoreClassification =
  | 'POINT_DE_VENTE_CONFORME'
  | 'GROSSISTE_OU_DEPOT'
  | 'PARTICULIER_OU_MENAGE'
  | 'INVALIDE_OU_INCOMPLET';

export interface ProcessedPlacemark {
  sourceRef: string;
  name: string;
  rawDescription: string;
  cleanDescription: string;
  rawPhone?: string;
  normalizedPhone?: string;
  isPhoneValid: boolean;
  latitude: number;
  longitude: number;
  isWithinCameroon: boolean;
  classification: StoreClassification;
  isQuarantined: boolean;
  quarantineReason?: string;
  isDuplicate: boolean;
  duplicateOfSourceRef?: string;
}

export interface DryRunReport {
  fileHashSha256: string;
  totalPlacemarks: number;
  validForImport: number;
  breakdown: {
    pointDeVenteConforme: number;
    grossisteOuDepot: number;
    particulierOuMenage: number;
    invalideOuIncomplet: number;
  };
  quarantines: {
    total: number;
    individual: number;
    outOfBoundsGeo: number;
    duplicates: number;
    invalidData: number;
  };
  phoneStats: {
    validE164: number;
    invalidOrMissing: number;
  };
  geoStats: {
    withinCameroon: number;
    outOfBounds: number;
  };
  processedItems: ProcessedPlacemark[];
}
