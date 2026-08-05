import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Darsa Enterprise — Auth Middleware Guard (Production)
 * Menggunakan Better Auth session cookie verification (Edge-compatible).
 * Better Auth menyimpan session di cookie 'better-auth.session_token'.
 * Role diverifikasi di level API route menggunakan server-side session check.
 * Middleware hanya melakukan redirect jika tidak ada session token sama sekali.
 */

const PUBLIC_PREFIXES = ['/_next', '/favicon', '/login', '/api/auth', '/docs'];
const PUBLIC_EXACT = ['/'];

// Route → Role yang diizinkan (enforced di API level, middleware hanya cek presence)
const PROTECTED_PREFIXES = [
  '/admin',
  '/sekretariat',
  '/guru_madrasah',
  '/guru_mi',
  '/guru',
  '/wali_santri',
  '/wali',
  '/santri',
];

// Nama cookie yang digunakan Better Auth (default)
const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Izinkan static assets & Next.js internals
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Izinkan exact public routes
  if (PUBLIC_EXACT.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Izinkan file extension assets
  if (/\.(png|jpg|jpeg|svg|ico|webp|gif|css|js|woff|woff2)$/.test(pathname)) {
    return NextResponse.next();
  }

  // 4. Izinkan API routes non-auth (mereka punya withAuth() guard sendiri)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 5. Cek apakah route perlu proteksi
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // 6. Cek keberadaan session cookie Better Auth (Edge-compatible)
  const cookies = request.cookies;
  const hasSession = SESSION_COOKIE_NAMES.some((name) => {
    const cookie = cookies.get(name);
    return cookie && cookie.value && cookie.value.length > 10;
  });

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    return response;
  }

  // 7. Session ada — izinkan akses (role check dilakukan di API & layout level)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
