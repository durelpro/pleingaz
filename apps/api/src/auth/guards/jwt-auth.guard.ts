import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user) {
      return user;
    }

    const req = context.switchToHttp().getRequest();
    // Allow development fallback if no token provided
    if (process.env.NODE_ENV !== 'production') {
      const demoRole = req.headers['x-demo-role'];
      if (demoRole === 'ADMIN' || demoRole === 'admin_1') {
        return {
          userId: '409942e1-b4f9-4cc1-9d2c-072e6f330e70',
          phone: '+237600000000',
          permissions: ['applications:manage', 'stores:manage', 'catalog:manage'],
        };
      }
      if (demoRole === 'DISTRIBUTOR' || demoRole === 'distributor_1') {
        return {
          userId: '1bea3e9e-2779-46c0-ab9b-9d545785742c',
          phone: '+237611111111',
          permissions: ['store:manage', 'inventory:manage'],
        };
      }
      if (demoRole === 'distributor_2') {
        return {
          userId: 'distributor-demo-2',
          phone: '+237622222222',
          permissions: ['store:manage', 'inventory:manage'],
        };
      }
      if (demoRole === 'CUSTOMER' || demoRole === 'customer_1' || demoRole === 'buyer_1' || demoRole === 'buyer') {
        return {
          userId: 'customer-demo-1234',
          phone: '+237699999999',
          permissions: [],
        };
      }
      if (demoRole === 'LIVREUR' || demoRole === 'livreur_1' || demoRole === 'DRIVER') {
        return {
          userId: 'driver-demo-1234',
          phone: '+237655555555',
          permissions: ['deliveries:manage'],
        };
      }
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

