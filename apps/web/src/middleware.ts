import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rôles autorisés pour l'espace administration / supervision
const ADMIN_ROLES = [
  'ADMIN',
  'SUPER_ADMIN',
  'ADMIN_FINANCE',
  'ADMIN_SUPPORT',
  'ADMIN_STOCK',
  'ACCOUNT_MANAGER',
  'AUDITOR',
];

const GESTIONNAIRE_ROLES = [
  'ACCOUNT_MANAGER',
  'DISTRIBUTOR_MANAGER',
  'ADMIN_SUPPORT',
  'SUPER_ADMIN',
  'CALL_CENTER_AGENT',
];

const DISTRIBUTOR_ROLES = [
  'DISTRIBUTOR',
  'DISTRIBUTOR_MANAGER',
  'DISTRIBUTOR_STAFF',
  'SUPER_ADMIN',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extraction de la session depuis le cookie
  const sessionCookie = request.cookies.get('pleingaz_session')?.value;

  let sessionData: any = null;
  if (sessionCookie) {
    try {
      sessionData = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      sessionData = null;
    }
  }

  const userRole = sessionData?.role || null;
  const isApproved =
    sessionData?.isApproved !== false &&
    sessionData?.status !== 'PENDING_APPROVAL' &&
    sessionData?.status !== 'PENDING';

  // 1. Protection de l'espace Administration (/admin/*)
  if (pathname.startsWith('/admin')) {
    // La page /admin/login reste accessible publiquement
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const isAuthorized = userRole && ADMIN_ROLES.includes(userRole);
    if (!isAuthorized) {
      const loginUrl = new URL('/login/personnel', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Protection de l'espace Gestionnaire de Compte (/gestionnaire)
  if (pathname.startsWith('/gestionnaire')) {
    if (!sessionData) {
      const loginUrl = new URL('/login/personnel', request.url);
      loginUrl.searchParams.set('role', 'GESTIONNAIRE');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAuthorized = userRole && GESTIONNAIRE_ROLES.includes(userRole);
    if (!isAuthorized) {
      const loginUrl = new URL('/login/personnel', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_role');
      return NextResponse.redirect(loginUrl);
    }

    // Contrôle approbation obligatoire par l'administrateur
    if (!isApproved) {
      const pendingUrl = new URL('/pending-approval', request.url);
      pendingUrl.searchParams.set('type', 'gestionnaire');
      return NextResponse.redirect(pendingUrl);
    }

    return NextResponse.next();
  }

  // 3. Protection de l'espace Distributeur (/distributor/*)
  // /distributor/apply et /distributor/onboarding restent accessibles pour s'inscrire
  if (
    pathname.startsWith('/distributor') &&
    !pathname.startsWith('/distributor/apply') &&
    !pathname.startsWith('/distributor/onboarding')
  ) {
    if (!sessionData) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'DISTRIBUTOR');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAuthorized = userRole && DISTRIBUTOR_ROLES.includes(userRole);
    if (!isAuthorized) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_role');
      return NextResponse.redirect(loginUrl);
    }

    // Contrôle approbation obligatoire par l'administrateur (Règle R5)
    if (!isApproved) {
      const pendingUrl = new URL('/pending-approval', request.url);
      pendingUrl.searchParams.set('type', 'distributor');
      return NextResponse.redirect(pendingUrl);
    }

    return NextResponse.next();
  }

  // 4. Protection de l'espace Livreur (/delivery/*)
  if (pathname.startsWith('/delivery')) {
    if (!sessionData) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'COURIER');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 5. Protection de l'espace Client (/account/* et /acheteur/*)
  if (pathname.startsWith('/account') || pathname.startsWith('/acheteur')) {
    if (!sessionData) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'CUSTOMER');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 6. Protection absolue du Tunnel de Commande & Paiement (/checkout)
  // Règle de traçabilité totale : aucun achat ni réservation sans compte authentifié
  if (pathname.startsWith('/checkout')) {
    if (!sessionData) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'CUSTOMER');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configuration du matcher : intercepte TOUS les espaces protégés et le checkout
export const config = {
  matcher: [
    '/admin/:path*',
    '/gestionnaire/:path*',
    '/distributor/:path*',
    '/delivery/:path*',
    '/account/:path*',
    '/acheteur/:path*',
    '/checkout/:path*',
  ],
};
