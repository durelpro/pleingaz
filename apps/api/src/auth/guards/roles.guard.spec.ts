import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RoleName } from '../constants/roles.enum';

describe('RolesGuard (RBAC 9 Rôles CR-001)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(user?: { roles: string[] }): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('devrait autoriser l\'accès si aucun rôle n\'est exigé sur le endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockExecutionContext({ roles: [RoleName.CUSTOMER_B2C] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('devrait lever ForbiddenException si l\'utilisateur n\'a aucun rôle', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.SUPER_ADMIN]);
    const context = createMockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('devrait lever ForbiddenException si l\'utilisateur ne possède pas le rôle requis', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.ADMIN_FINANCE]);
    const context = createMockExecutionContext({ roles: [RoleName.DISTRIBUTOR] });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('devrait autoriser l\'accès si l\'utilisateur possède l\'un des rôles autorisés', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN_FINANCE,
    ]);
    const context = createMockExecutionContext({ roles: [RoleName.ADMIN_FINANCE] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('devrait supporter l\'ensemble des 9 rôles officiels de PLEINGAZ', () => {
    const allRoles: RoleName[] = [
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN_SUPPORT,
      RoleName.ADMIN_FINANCE,
      RoleName.ADMIN_STOCK,
      RoleName.DISTRIBUTOR,
      RoleName.COURIER,
      RoleName.CUSTOMER_B2C,
      RoleName.CUSTOMER_B2B,
      RoleName.CALL_CENTER_AGENT,
    ];

    for (const role of allRoles) {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([role]);
      const context = createMockExecutionContext({ roles: [role] });
      expect(guard.canActivate(context)).toBe(true);
    }
  });
});
