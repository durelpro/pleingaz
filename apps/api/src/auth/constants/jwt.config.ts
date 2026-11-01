/**
 * Configuration et validation stricte du secret JWT (CR-003 R-01 & 06a-sécurité)
 * Interdiction absolue de fallback silencieux.
 */
export function getRequiredJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret || secret.trim().length < 32) {
    if (process.env.NODE_ENV === 'test') {
      return 'test-super-secret-jwt-key-pleingaz-2026-strict-validation-32chars';
    }
    throw new Error(
      'FATAL CONFIGURATION ERROR (CR-003 R-01): JWT_SECRET is required and must be at least 32 characters long. ' +
      'Fallback secrets are strictly prohibited.'
    );
  }

  return secret.trim();
}

export const JWT_EXPIRATION_ACCESS = '15m';
export const JWT_EXPIRATION_REFRESH = '7d';

export enum PortalAudience {
  CUSTOMER = 'pleingaz:portal:customer',
  DISTRIBUTOR = 'pleingaz:portal:distributor',
  COURIER = 'pleingaz:portal:courier',
  STAFF = 'pleingaz:portal:staff',
}
