/**
 * Sanitizer de sécurité pour données brutes KML/KMZ (CR-002)
 * Protège contre les failles XSS (M23) et les injections de prompt indirectes (M24).
 */
export class ImportSanitizer {
  /**
   * Nettoie et sécurise un texte brut (nom, description, quartier)
   */
  static cleanText(input?: string): string {
    if (!input || typeof input !== 'string') return '';

    let text = input;

    // 1. Décodage d'entités HTML courantes
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');

    // 2. Suppression stricte des balises HTML et scripts (Anti-XSS M23)
    // Enlève <style>...</style>, <script>...</script>, <iframe>...</iframe>
    text = text.replace(/<(script|style|iframe)[^>]*>[\s\S]*?<\/\1>/gi, '');
    // Enlève toutes les autres balises HTML
    text = text.replace(/<\/?[a-z0-9_-]+(\s+[^>]*)?>/gi, ' ');

    // 3. Neutralisation des vecteurs d'injection de prompt (Anti-Prompt Injection M24)
    const promptInjectionPatterns = [
      /ignore\s+(all\s+)?previous\s+instructions/gi,
      /ignore\s+(les\s+)?instructions\s+pr[ée]c[ée]dentes/gi,
      /you\s+are\s+now\s+a/gi,
      /system\s*:\s*/gi,
      /assistant\s*:\s*/gi,
      /\[inst\][\s\S]*?\[\/inst\]/gi,
      /<<sys>>[\s\S]*?<<\/sys>>/gi,
    ];

    for (const pattern of promptInjectionPatterns) {
      text = text.replace(pattern, '[NEUTRALISÉ]');
    }

    // 4. Suppression des caractères de contrôle et normalisation des espaces
    text = text
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text;
  }
}
