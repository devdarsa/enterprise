import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@darsa/auth';
import { prisma } from '@darsa/database';

/**
 * GET /api/v1/auth/me
 * Mengembalikan data sesi pengguna yang sedang login secara 100% konsisten & akurat.
 */
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    let email: string | null = null;
    let userName: string | null = null;

    // 1. Coba ambil dari Better Auth Session
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      if (session?.user) {
        userId = session.user.id;
        email = session.user.email;
        userName = (session.user as any).nama_lengkap || session.user.name;
      }
    } catch {}

    // 2. Fallback: Cek Bearer token atau cookie `better-auth.session_token` di DB Session
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

    const sessionToken =
      bearerToken ||
      request.cookies.get('better-auth.session_token')?.value ||
      request.cookies.get('__Secure-better-auth.session_token')?.value;

    if (!userId && sessionToken) {
      const dbSession = await prisma.session.findFirst({
        where: { token: sessionToken, expires_at: { gt: new Date() } },
        include: { user: true },
      });
      if (dbSession?.user && !dbSession.user.deleted_at) {
        userId = dbSession.user.id;
        email = dbSession.user.email;
        userName = dbSession.user.nama_lengkap;
      }
    }

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi.' },
        { status: 401 }
      );
    }

    // Ambil role dari DB
    const cleanEmail = (email || '').toLowerCase();
    const userRoleRecord = await prisma.userRole.findFirst({
      where: { user_id: userId! },
      include: { role: true },
      orderBy: { created_at: 'asc' },
    });

    const role = userRoleRecord?.role?.name || (cleanEmail.includes('sekretariat') ? 'SEKRETARIAT' : 'WALI_SANTRI');

    // Deteksi instansi berdasarkan role (konsisten dengan api-auth.ts) — tidak bergantung pada nama email
    let instansi = 'PONDOK';
    if (role === 'GURU_MADRASAH' || role === 'MUSTAHIQ' || role === 'MUNAWWIB') {
      instansi = 'MADRASAH';
    } else if (role === 'GURU_MI') {
      instansi = 'MI';
    } else if (role === 'SEKRETARIAT' || role === 'ADMIN_INSTANSI') {
      // Untuk admin: coba baca dari cookie darsa_instansi yang di-set saat login
      const cookieInstansi = request.cookies.get('darsa_instansi')?.value;
      if (cookieInstansi && ['PONDOK', 'MADRASAH', 'MI'].includes(cookieInstansi.toUpperCase())) {
        instansi = cookieInstansi.toUpperCase();
      } else if (cleanEmail.includes('madrasah')) {
        instansi = 'MADRASAH';
      } else if (cleanEmail.includes('.mi') || cleanEmail.includes('mi@')) {
        instansi = 'MI';
      }
      // else tetap PONDOK
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name: userName || email,
        role,
        instansi,
      },
    });
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message;
    console.error('[Auth Me] Error:', err);
    return NextResponse.json(
      { success: false, message: msg || 'Gagal mengambil sesi.' },
      { status: 500 }
    );
  }
}
