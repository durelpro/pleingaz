import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Si l'utilisateur est présent et valide, on le renvoie. Sinon, on continue sans bloquer (accès invité).
    return user || null;
  }
}
