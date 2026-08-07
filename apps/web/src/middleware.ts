import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Darsa Enterprise — Auth Middleware Guard (Production)
 * Memisahkan secara ketat Portal Admin (/admin/login) dan Portal Umum (/login).
 */

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/admin/login',
  '/register',
  '/docs',
  '/favicon.ico',
];

const PUBLIC_PREFIXES = [
  '/_next',
  '/api/auth',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/public',
];

const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
  'darsa_session',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Dilarang keras mem-filter atau redirect halaman LOGIN publik (/admin/login dan /login)
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    pathname === '/login' ||
    pathname.startsWith('/login/')
  ) {
    return NextResponse.next();
  }

  // 2. Izinkan static assets, public routes & Next.js internals
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (/\.(png|jpg|jpeg|svg|ico|webp|gif|css|js|woff|woff2|ttf)$/.test(pathname)) {
    return NextResponse.next();
  }

  // 3. Cek keberadaan session cookie
  const cookies = request.cookies;
  const hasSession = SESSION_COOKIE_NAMES.some((name) => {
    const cookie = cookies.get(name);
    return cookie && cookie.value && cookie.value.length > 5;
  });

  // 4. Deteksi Klien CLI / API Request
  const accept = (request.headers.get('accept') || '').toLowerCase();
  const isApiOrJson = pathname.startsWith('/api/') || accept.includes('application/json');

  // 5. Proteksi Portal Admin (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      if (isApiOrJson) {
        return NextResponse.json(
          { success: false, message: 'Autentikasi Sekretariat Diperlukan (401 Unauthorized)' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 6. Proteksi Portal User / Umum (/guru_madrasah, /guru_mi, /keamanan, /wali_santri, dll)
  const isProtectedUserRoute = [
    '/guru_madrasah',
    '/guru_mi',
    '/keamanan',
    '/wali_santri',
  ].some((prefix) => pathname.startsWith(prefix));

  if (isProtectedUserRoute) {
    if (!hasSession) {
      if (isApiOrJson) {
        return NextResponse.json(
          { success: false, message: 'Autentikasi Diperlukan (401 Unauthorized)' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 7. API Routes Proteksi (/api/v1/* kecuali /api/v1/auth/login)
  if (pathname.startsWith('/api/v1/') && !pathname.startsWith('/api/v1/auth/login')) {
    if (!hasSession) {
      return NextResponse.json(
        { success: false, message: 'Sesi tidak ditemukan (401 Unauthorized)' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
