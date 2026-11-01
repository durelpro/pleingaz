import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware d'Étanchéité Souveraine R-01 (Invisibilité & Cloisonnement D-11)
 * Chaque espace possède son propre cookie d'audience cryptographique étanche :
 * - pleingaz_session_buyer (pleingaz:portal:customer)
 * - pleingaz_session_distributor (pleingaz:portal:distributor)
 * - pleingaz_session_courier (pleingaz:portal:courier)
 * - pleingaz_session_staff (pleingaz:portal:staff)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const buyerSession = request.cookies.get('pleingaz_session_buyer')?.value || request.cookies.get('pleingaz_session')?.value;
  const distributorSession = request.cookies.get('pleingaz_session_distributor')?.value;
  const courierSession = request.cookies.get('pleingaz_session_courier')?.value;
  const staffSession = request.cookies.get('pleingaz_session_staff')?.value || request.cookies.get('pleingaz_admin_auth')?.value;

  // 1. ESPACE ACHETEUR (/acheteur/* ou /account/*)
  if (pathname.startsWith('/acheteur') || pathname.startsWith('/account')) {
    const isPublicAuthRoute =
      pathname === '/acheteur/connexion' ||
      pathname === '/acheteur/inscription' ||
      pathname === '/acheteur/mot-de-passe-oublie' ||
      pathname === '/login' ||
      pathname === '/register';

    if (isPublicAuthRoute) {
      return NextResponse.next();
    }

    if (!buyerSession) {
      const loginUrl = new URL('/acheteur/connexion', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. ESPACE DISTRIBUTEUR (/distributeur/* ou /distributor/*)
  if (pathname.startsWith('/distributeur') || pathname.startsWith('/distributor')) {
    const isPublicProRoute =
      pathname === '/distributeur/connexion' ||
      pathname === '/distributeur/inscription' ||
      pathname === '/distributor/apply' ||
      pathname === '/distributor/onboarding';

    if (isPublicProRoute) {
      return NextResponse.next();
    }

    // R-01 Souverain : Si l'utilisateur est connecté en tant qu'acheteur, 404 strict
    if (buyerSession && !distributorSession) {
      return new NextResponse(null, { status: 404, statusText: 'Not Found' });
    }

    if (!distributorSession) {
      const loginUrl = new URL('/distributeur/connexion', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. ESPACE LIVREUR (/livreur/* ou /delivery/*)
  if (pathname.startsWith('/livreur') || pathname.startsWith('/delivery')) {
    const isPublicCourierRoute =
      pathname === '/livreur/connexion' ||
      pathname === '/livreur/inscription';

    if (isPublicCourierRoute) {
      return NextResponse.next();
    }

    // R-01 Souverain : Si l'utilisateur est connecté en acheteur ou distributeur, 404 strict
    if ((buyerSession || distributorSession) && !courierSession) {
      return new NextResponse(null, { status: 404, statusText: 'Not Found' });
    }

    if (!courierSession) {
      const loginUrl = new URL('/livreur/connexion', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 4. ESPACE PERSONNEL & SUPERVISION ADMIN (/staff/* ou /admin/*)
  if (pathname.startsWith('/staff') || pathname.startsWith('/admin')) {
    const isPublicStaffRoute =
      pathname === '/staff/login' ||
      pathname === '/admin/login' ||
      pathname === '/login/personnel';

    if (isPublicStaffRoute) {
      return NextResponse.next();
    }

    // R-01 Souverain : Si l'accès staff est tenté par un utilisateur non staff, 404 strict (invisibilité absolue)
    if (!staffSession) {
      return new NextResponse(null, { status: 404, statusText: 'Not Found' });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/acheteur/:path*',
    '/account/:path*',
    '/distributeur/:path*',
    '/distributor/:path*',
    '/livreur/:path*',
    '/delivery/:path*',
    '/staff/:path*',
    '/admin/:path*',
  ],
};
