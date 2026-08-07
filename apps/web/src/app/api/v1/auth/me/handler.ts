import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@darsa/auth';
import { prisma } from '@darsa/database';

/**
 * GET /api/v1/auth/me
 * Mengembalikan data sesi pengguna yang sedang login beserta role-nya dari database.
 * Diperlukan karena Better Auth GET /api/auth/get-session tidak menyertakan field `role`
 * (role disimpan di tabel user_roles terpisah, bukan di tabel users).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Ambil role dari tabel user_roles → roles
    const userRoleRecord = await prisma.userRole.findFirst({
      where: { user_id: userId },
      include: { role: true },
      orderBy: { created_at: 'asc' },
    });

    const role = userRoleRecord?.role?.name ?? null;

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: session.user.email,
        name: (session.user as any).nama_lengkap || session.user.name || session.user.email,
        role,
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
