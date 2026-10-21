/**
 * Normaliseur de numéros de téléphone pour le Cameroun (E.164, indicatif +237)
 * Gère les numéros mobiles (6XXXXXXXX) et fixes (2XXXXXXXX).
 */
export class PhoneNormalizer {
  /**
   * Tente d'extraire et normaliser un numéro camerounais au format E.164
   */
  static normalize(rawPhone?: string): { normalized?: string; isValid: boolean; raw?: string } {
    if (!rawPhone || typeof rawPhone !== 'string') {
      return { isValid: false };
    }

    const cleanRaw = rawPhone.trim();
    if (!cleanRaw) {
      return { isValid: false };
    }

    // Retirer tous les caractères non numériques sauf le '+'
    let digits = cleanRaw.replace(/[^\d+]/g, '');

    // Gérer les préfixes internationaux
    if (digits.startsWith('00237')) {
      digits = '+237' + digits.substring(5);
    } else if (digits.startsWith('237') && digits.length > 9) {
      digits = '+237' + digits.substring(3);
    } else if (digits.startsWith('+237')) {
      // Déjà préfixé
    } else if (digits.length === 9 && (digits.startsWith('6') || digits.startsWith('2'))) {
      digits = '+237' + digits;
    }

    // Validation stricte Cameroun : +237 suivi de 9 chiffres commençant par 6 (mobile) ou 2 (fixe)
    const cmPhoneRegex = /^\+237[62][0-9]{8}$/;

    if (cmPhoneRegex.test(digits)) {
      return {
        normalized: digits,
        isValid: true,
        raw: cleanRaw,
      };
    }

    return {
      isValid: false,
      raw: cleanRaw,
    };
  }

  /**
   * Cherche et extrait un numéro de téléphone camerounais dans une chaîne de texte libre
   */
  static extractFromText(text?: string): { normalized?: string; isValid: boolean; raw?: string } {
    if (!text) return { isValid: false };

    // Recherche de motifs de numéros :
    // - "+237 6XX XX XX XX"
    // - "6XX-XX-XX-XX"
    // - "6XXXXXXXX"
    // - "2XXXXXXXX"
    const candidates = text.match(/(?:\+237|00237)?[\s.-]?[26](?:[\s.-]?\d){8}/g);

    if (candidates && candidates.length > 0) {
      for (const candidate of candidates) {
        const result = this.normalize(candidate);
        if (result.isValid) {
          return result;
        }
      }
    }

    return { isValid: false };
  }
}
