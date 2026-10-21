import { StoreClassification } from './types';

/**
 * Classificateur automatique selon la décision souveraine D-08 (Zéro Particulier)
 */
export class ImportClassifier {
  private static readonly INDIVIDUAL_KEYWORDS = [
    'menage',
    'ménage',
    'domicile',
    'residence',
    'résidence',
    'maison',
    'famille',
    'monsieur',
    'madame',
    'mme',
    'mr',
    'prive',
    'privé',
    'appartement',
  ];

  private static readonly COMMERCIAL_KEYWORDS = [
    'boutique',
    'depot',
    'dépôt',
    'magasin',
    'alimentation',
    'superette',
    'supérette',
    'ets',
    'éts',
    'sarl',
    'station',
    'quincaillerie',
    'market',
    'supermarche',
    'supermarché',
    'commerce',
    'gaz',
    'point de vente',
    'distributeur',
    'grossiste',
    'semi-grossiste',
    'service',
    'total',
    'tradex',
    'bocom',
    'ola',
    'mrs',
    'oilibya',
  ];

  private static readonly WHOLESALE_KEYWORDS = [
    'grossiste',
    'semi-grossiste',
    'depot central',
    'dépôt central',
    'magasin central',
    'hub',
    'depot regional',
    'dépôt régional',
    'station-service',
    'station service',
  ];

  /**
   * Détermine la classification d'une fiche Placemark brute
   */
  static classify(name: string, description?: string): StoreClassification {
    const cleanName = (name || '').trim();
    if (cleanName.length < 2) {
      return 'INVALIDE_OU_INCOMPLET';
    }

    const lowerName = cleanName.toLowerCase();
    const lowerDesc = (description || '').toLowerCase();
    const fullText = `${lowerName} ${lowerDesc}`;

    // 1. Détection des Grossistes et Dépôts
    const isWholesale = this.WHOLESALE_KEYWORDS.some((kw) =>
      fullText.includes(kw),
    );
    if (isWholesale) {
      return 'GROSSISTE_OU_DEPOT';
    }

    // 2. Vérification des indicateurs commerciaux explicites
    const hasCommercialIndicator = this.COMMERCIAL_KEYWORDS.some((kw) =>
      lowerName.includes(kw),
    );

    // 3. Détection des Particuliers et Ménages (D-08)
    const hasIndividualKeyword = this.INDIVIDUAL_KEYWORDS.some((kw) => {
      // Vérification mot entier ou au début
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lowerName) || regex.test(lowerDesc);
    });

    if (hasIndividualKeyword && !hasCommercialIndicator) {
      return 'PARTICULIER_OU_MENAGE';
    }

    // Si le nom ressemble à un nom de personne sans aucun mot commercial
    // Ex: "Chez Mama Marie" -> Particulier potentiel si pas d'enseigne
    if (
      lowerName.startsWith('chez ') &&
      !this.COMMERCIAL_KEYWORDS.some((kw) => lowerName.includes(kw))
    ) {
      return 'PARTICULIER_OU_MENAGE';
    }

    // 4. Par défaut : Point de vente standard
    return 'POINT_DE_VENTE_CONFORME';
  }
}
