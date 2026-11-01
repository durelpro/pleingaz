import { Test, TestingModule } from '@nestjs/testing';
import { PortalAudienceGuard } from './portal-audience.guard';
import { Reflector } from '@nestjs/core';
import { NotFoundException } from '@nestjs/common';
import { PORTAL_KEY } from '../decorators/portal.decorator';

describe('PortalAudienceGuard (CR-003 D-11, C-06 Règle "Aucune Trace")', () => {
  let guard: PortalAudienceGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalAudienceGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PortalAudienceGuard>(PortalAudienceGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (user?: any): any => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  });

  it('devrait autoriser l\'accès si aucune exigence de portail n\'est définie sur la route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('devrait rejeter avec HTTP 404 (NotFoundException) si l\'utilisateur n\'est pas connecté ou sans aud', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('CUSTOMER');
    const context = createMockContext(null);

    expect(() => guard.canActivate(context)).toThrow(NotFoundException);
    expect(() => guard.canActivate(context)).toThrow('Page ou ressource introuvable');
  });

  it('devrait rejeter avec HTTP 404 (jamais 403) si un acheteur tente d\'accéder à une route distributeur', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('DISTRIBUTOR');
    const context = createMockContext({
      id: 'user-client-1',
      aud: 'pleingaz:portal:customer', // Audience Acheteur
    });

    // RÈGLE ABSOLUE C-06 : Rejet 404 strict, ZERO fuite, JAMAIS 403
    expect(() => guard.canActivate(context)).toThrow(NotFoundException);
  });

  it('devrait rejeter avec HTTP 404 si un distributeur tente d\'accéder à une route livreur', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('COURIER');
    const context = createMockContext({
      id: 'distributor-user-1',
      aud: 'pleingaz:portal:distributor',
    });

    expect(() => guard.canActivate(context)).toThrow(NotFoundException);
  });

  it('devrait autoriser l\'accès si le jeton correspond exactement à l\'audience portail requise', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('CUSTOMER');
    const context = createMockContext({
      id: 'user-client-1',
      aud: 'pleingaz:portal:customer',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('devrait autoriser l\'accès pour le personnel staff sur le portail STAFF', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('STAFF');
    const context = createMockContext({
      id: 'admin-user-1',
      aud: 'pleingaz:portal:staff',
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
