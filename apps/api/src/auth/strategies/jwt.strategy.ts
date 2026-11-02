import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { getRequiredJwtSecret } from '../constants/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getRequiredJwtSecret(),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable ou session révoquée');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Ce compte est temporairement verrouillé');
    }

    // Extract flat array of permissions and roles for RBAC
    const permissions = user.roles.flatMap(ur => ur.role.permissions.map(rp => rp.permission.action));
    const roles = user.roles.map(ur => ur.role.name);
    
    return {
      id: user.id,
      userId: payload.sub,
      phone: user.phone,
      callPhone: user.callPhone,
      email: user.email,
      roles,
      permissions,
      aud: payload.aud,
      portal: payload.portal,
    };
  }
}
