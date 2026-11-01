import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rôles autorisés pour l'espace administration / supervision
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ACCOUNT_MANAGER', 'AUDITOR'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extraction de la session depuis le cookie
  const sessionCookie = request.cookies.get('pleingaz_session')?.value;
  const legacyAdminAuth = request.cookies.get('pleingaz_admin_auth')?.value;

  let userRole: string | null = null;
  if (sessionCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie));
      userRole = parsed?.role || null;
    } catch {
      userRole = null;
    }
  }

  // 1. Protection de l'espace Administration (/admin/*)
  if (pathname.startsWith('/admin')) {
    // La page /admin/login reste accessible pour orienter vers le 2FA
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const isAuthorized = (userRole && ADMIN_ROLES.includes(userRole)) || legacyAdminAuth === 'true';
    if (!isAuthorized) {
      const loginUrl = new URL('/login/personnel', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Protection de l'espace Distributeur (/distributor/*)
  // Note: /distributor/apply et /distributor/onboarding restent publics pour l'enrôlement KYC (CR-001 D-04)
  if (pathname.startsWith('/distributor') && !pathname.startsWith('/distributor/apply') && !pathname.startsWith('/distributor/onboarding')) {
    const isDistributor = userRole === 'DISTRIBUTOR' || userRole === 'DISTRIBUTOR_MANAGER' || userRole === 'DISTRIBUTOR_STAFF';
    if (!isDistributor && !sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'DISTRIBUTOR');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Protection de l'espace Livreur (/delivery/*)
  if (pathname.startsWith('/delivery')) {
    // Si l'utilisateur n'est pas connecté du tout, redirection vers login
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'COURIER');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Protection de l'espace Client (/account/*)
  if (pathname.startsWith('/account')) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configuration du matcher : intercepte les espaces protégés, ignore les assets statiques
export const config = {
  matcher: [
    '/admin/:path*',
    '/distributor/:path*',
    '/delivery/:path*',
    '/account/:path*',
  ],
};
