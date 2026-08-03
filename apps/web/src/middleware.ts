import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Darsa Enterprise — Auth Middleware Guard
 * Protects all role-specific routes from unauthenticated access.
 *
 * In simulation mode: checks for 'darsa_session' cookie (set on login).
 * In production: this would integrate with Better Auth JWT session verification.
 */

const PROTECTED_ROUTES = [
  '/admin',
  '/guru',
  '/wali',
  '/santri',
  '/super-admin',
];

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/docs',
  '/api/auth',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public routes & API routes through
  const isPublic = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Allow Next.js static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check for simulation session cookie
  const sessionCookie = request.cookies.get('darsa_session');
  const sessionValue = sessionCookie?.value;

  if (!sessionValue) {
    // Redirect to login, preserving the target URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Parse session and check route permission
  try {
    const session = JSON.parse(decodeURIComponent(sessionValue));
    const userRole: string = session.role || '';
    const userInstansi: string = session.instansi || '';

    // Super Admin can access everything
    if (userRole === 'SUPER_ADMIN') return NextResponse.next();

    // Route-level role guards
    if (pathname.startsWith('/super-admin') && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    if (pathname.startsWith('/guru') && !['GURU', 'ADMIN_INSTANSI', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/wali') && !['WALI_SANTRI', 'ADMIN_INSTANSI', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/santri') && !['SANTRI', 'ADMIN_INSTANSI', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid session — clear and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('darsa_session');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
