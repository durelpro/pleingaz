import { SetMetadata } from '@nestjs/common';
import { PortalType } from '../auth.service';

export const PORTAL_KEY = 'required_portal_audience';

/**
 * Décorateur de cloisonnement d'espace portail (CR-003 D-11, C-05, C-06).
 * Associe une route ou un contrôleur à un portail exclusif.
 */
export const RequirePortal = (portal: PortalType) => SetMetadata(PORTAL_KEY, portal);
