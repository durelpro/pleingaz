/**
 * Utilitaire de résolution de l'URL API
 * Résout automatiquement entre l'API externe (si configurée en production)
 * et les routes API internes Next.js (/api) pour éviter les blocages "Load failed"
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('localhost')) {
      return envUrl;
    }
    // Sur Vercel ou en HTTPS, si aucune API distante n'est définie, utiliser les routes API Next.js internes
    if (window.location.protocol === 'https:' || !envUrl || envUrl.includes('localhost')) {
      return '/api';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}
