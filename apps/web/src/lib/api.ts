/**
 * Utilitaire unique d'appel à l'API PLEINGAZ.
 * - Envoie uniquement le jeton JWT réel de l'utilisateur connecté (aucun mode démo / usurpation).
 * - Centralise l'URL de l'API.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function authHeaders(json = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** fetch authentifié : préfixe l'URL de l'API si un chemin relatif est fourni. */
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  return fetch(url, {
    ...init,
    headers: { ...authHeaders(!isFormData), ...(init.headers as Record<string, string> | undefined) },
  });
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('pleingaz_user_data');
  localStorage.removeItem('pleingaz_admin_auth');
}
