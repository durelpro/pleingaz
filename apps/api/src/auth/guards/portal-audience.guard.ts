import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PORTAL_KEY } from '../decorators/portal.decorator';
import { PortalType } from '../auth.service';
import { PortalAudience } from '../constants/jwt.config';

/**
 * Gardien de cloisonnement étanche des portails (CR-003 D-11, C-05, C-06).
 * RÈGLE ABSOLUE : Si le jeton JWT ne correspond pas à l'audience du portail requis,
 * renvoie OBLIGATOIREMENT une réponse HTTP 404 (NotFoundException) et JAMAIS un code 403 Forbidden,
 * pour empêcher la reconnaissance cartographique de l'API.
 */
@Injectable()
export class PortalAudienceGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPortal = this.reflector.getAllAndOverride<PortalType>(PORTAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPortal) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Règle "Aucune Trace" : 404 systématique
    if (!user || !user.aud) {
      throw new NotFoundException('Page ou ressource introuvable');
    }

    const expectedAudience = this.resolveExpectedAudience(requiredPortal);
    if (user.aud !== expectedAudience) {
      // Rejet 404 systématique
      throw new NotFoundException('Page ou ressource introuvable');
    }

    return true;
  }

  private resolveExpectedAudience(portal: PortalType): string {
    switch (portal) {
      case 'CUSTOMER':
        return PortalAudience.CUSTOMER;
      case 'DISTRIBUTOR':
        return PortalAudience.DISTRIBUTOR;
      case 'COURIER':
        return PortalAudience.COURIER;
      case 'STAFF':
        return PortalAudience.STAFF;
      default:
        return PortalAudience.CUSTOMER;
    }
  }
}
