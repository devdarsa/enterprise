import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Darsa Enterprise — Auth Middleware Guard (Production)
 * Menggunakan Better Auth session cookie verification (Edge-compatible).
 * Better Auth menyimpan session di cookie 'better-auth.session_token'.
 * Role diverifikasi di level API route menggunakan server-side session check.
 * Middleware hanya melakukan redirect jika tidak ada session token sama sekali.
 */

const PUBLIC_PREFIXES = ['/_next', '/favicon', '/login', '/admin/login', '/api/auth', '/docs', '/register'];
const PUBLIC_EXACT = ['/'];

// Route → Role yang diizinkan (enforced di API level, middleware hanya cek presence)
const PROTECTED_PREFIXES = [
  '/admin',
  '/guru_madrasah',
  '/guru_mi',
  '/keamanan',
  '/wali_santri',
];

// Nama cookie yang digunakan Better Auth (default)
const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
];

// Deteksi klien CLI / Terminal / non-browser
function isCliClient(request: NextRequest): boolean {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const accept = (request.headers.get('accept') || '').toLowerCase();

  const cliAgents = ['curl', 'wget', 'httpie', 'postman', 'python', 'axios', 'node-fetch', 'go-http-client'];
  const isCliUserAgent = cliAgents.some((agent) => userAgent.includes(agent));
  const isJsonRequest = accept.includes('application/json') || request.nextUrl.pathname.startsWith('/api/');

  return isCliUserAgent || (isJsonRequest && !accept.includes('text/html'));
}

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

  // 4. Izinkan API routes public auth (seperti /api/auth/* dan /api/v1/auth/login, register, dll)
  if (pathname.startsWith('/api/auth') || (pathname.startsWith('/api/v1/auth/') && !pathname.startsWith('/api/v1/auth/me'))) {
    return NextResponse.next();
  }

  // 5. Cek apakah route perlu proteksi
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) || pathname.startsWith('/api/v1/');
  if (!isProtected) {
    return NextResponse.next();
  }

  // 6. Cek keberadaan session cookie Better Auth
  const cookies = request.cookies;
  const hasSession = SESSION_COOKIE_NAMES.some((name) => {
    const cookie = cookies.get(name);
    return cookie && cookie.value && cookie.value.length > 10;
  });

  const isCli = isCliClient(request);

  if (!hasSession) {
    if (isCli || pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses Ditolak: Autentikasi Diperlukan (401 Unauthorized)',
          message: 'Endpoint ini terlindungi. Silakan sertakan token/cookie sesi yang valid.',
        },
        { status: 401 }
      );
    }

    const targetLoginPath = pathname.startsWith('/admin') ? '/admin/login' : '/login';
    const loginUrl = new URL(targetLoginPath, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 7. Sesi ada — izinkan akses (RBAC lengkap diproses oleh layout & API route withAuth)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
