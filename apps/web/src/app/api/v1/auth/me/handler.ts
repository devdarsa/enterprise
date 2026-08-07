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

    // 2. Fallback: Cek cookie `better-auth.session_token` atau `__Secure-better-auth.session_token` di DB Session
    const sessionToken =
      request.cookies.get('better-auth.session_token')?.value ||
      request.cookies.get('__Secure-better-auth.session_token')?.value;
    if (!userId && sessionToken) {
      const dbSession = await prisma.session.findFirst({
        where: { token: sessionToken, expires_at: { gt: new Date() } },
        include: { user: true },
      });
      if (dbSession?.user) {
        userId = dbSession.user.id;
        email = dbSession.user.email;
        userName = dbSession.user.nama_lengkap;
      }
    }

    // 3. Fallback: Cek cookie `darsa_session`
    const darsaSessionRaw = request.cookies.get('darsa_session')?.value;
    if (!userId && darsaSessionRaw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(darsaSessionRaw));
        if (parsed?.id) {
          userId = parsed.id;
          email = parsed.email;
          userName = parsed.name;
        }
      } catch {}
    }

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi.' },
        { status: 401 }
      );
    }

    // Deteksi instansi dari cookie atau email
    let instansi = request.cookies.get('darsa_instansi')?.value || 'PONDOK';
    const cleanEmail = email.toLowerCase();
    if (cleanEmail.includes('madrasah')) {
      instansi = 'MADRASAH';
    } else if (cleanEmail.includes('.mi') || cleanEmail.includes('mi@')) {
      instansi = 'MI';
    }

    // Ambil role dari DB
    const userRoleRecord = await prisma.userRole.findFirst({
      where: { user_id: userId },
      include: { role: true },
      orderBy: { created_at: 'asc' },
    });

    const role = userRoleRecord?.role?.name || (cleanEmail.includes('sekretariat') ? 'SEKRETARIAT' : 'WALI_SANTRI');

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
