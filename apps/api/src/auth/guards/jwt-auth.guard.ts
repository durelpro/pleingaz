import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Garde JWT stricte : seul un jeton Bearer valide (ou ?token= pour les fichiers) authentifie.
 * Aucun mode démo / en-tête d'usurpation n'est accepté, quel que soit l'environnement.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentification requise.');
    }
    return user;
  }
}
