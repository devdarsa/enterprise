import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/akun — List semua user beserta roles
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = { deleted_at: null };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { nama_lengkap: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user_roles: { include: { role: true } },
          guru: { select: { id: true, nama_lengkap: true } },
          wali_santri: { select: { id: true, nama_lengkap: true } },
        },
      }),
    ]);

    const mapped = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      nama: u.nama_lengkap,
      roles: u.user_roles.map((r: any) => r.role.name),
      primaryRole: u.user_roles[0]?.role.name || 'TANPA_ROLE',
      email_verified: u.email_verified,
      created_at: u.created_at,
      profil: u.guru ? 'GURU' : u.wali_santri ? 'WALI_SANTRI' : 'USER',
    }));

    return apiSuccess(mapped, undefined, { total, page, limit, totalPages: Math.ceil(total / limit) });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// POST /api/v1/akun — Buat akun baru (dengan credential login via Better Auth)
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { email, nama_lengkap, role, password } = body;

    if (!email || !nama_lengkap || !role) {
      return apiError('email, nama_lengkap, dan role wajib diisi.');
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) return apiError(`Email ${email} sudah terdaftar.`, 409);

    // Cari role di database
    const roleRecord = await prisma.role.findFirst({ where: { name: role } });
    if (!roleRecord) return apiError(`Role ${role} tidak ditemukan di database.`, 404);

    // Buat user beserta credential login via Better Auth (creates User + Account with hashed password)
    const finalPassword = password || 'DarsaTemp2026!';
    const { auth } = await import('@darsa/auth');
    let newUser: any = null;

    try {
      const authResult = await auth.api.signUpEmail({
        body: {
          email,
          password: finalPassword,
          name: nama_lengkap,
        },
      });
      if (authResult?.user) {
        newUser = authResult.user;
      }
    } catch (authErr: any) {
      console.warn('⚠️ Better Auth signUpEmail warning:', authErr?.message || authErr);
    }

    // Fallback: ambil user dari DB jika Better Auth sudah buatkan
    if (!newUser) {
      newUser = await prisma.user.findFirst({ where: { email } });
    }

    // Last resort: buat user langsung via Prisma (tanpa Account credential)
    if (!newUser) {
      newUser = await prisma.user.create({
        data: {
          email,
          nama_lengkap,
          email_verified: false,
        },
      });
    }

    // Pastikan nama_lengkap tersimpan (Better Auth simpan sebagai `name`)
    await prisma.user.update({
      where: { id: newUser.id },
      data: { nama_lengkap },
    });

    // Attach role
    const existingRole = await prisma.userRole.findFirst({
      where: { user_id: newUser.id, role_id: roleRecord.id },
    });
    if (!existingRole) {
      await prisma.userRole.create({
        data: { user_id: newUser.id, role_id: roleRecord.id },
      });
    }

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_AKUN',
      entityType: 'User',
      entityId: newUser.id,
      metadata: { email, role, dibuat_oleh: session.user.email },
    });

    return apiSuccess(
      { id: newUser.id, email: newUser.email, role },
      `Akun ${nama_lengkap} berhasil dibuat dengan role ${role}.`
    );
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// PATCH /api/v1/akun — Toggle status akun (aktif/suspend) atau reset password
export const PATCH = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { user_id, action } = body;
    if (!user_id || !action) return apiError('user_id dan action wajib diisi.');

    const user = await prisma.user.findFirst({ where: { id: user_id, deleted_at: null } });
    if (!user) return apiError('User tidak ditemukan.', 404);

    if (action === 'TOGGLE_STATUS') {
      const currentlyActive = !user.deleted_at;
      await prisma.user.update({
        where: { id: user_id },
        data: { deleted_at: currentlyActive ? new Date() : null },
      });

      await logAudit({
        userId: session.user.id,
        action: currentlyActive ? 'SUSPEND_AKUN' : 'AKTIFKAN_AKUN',
        entityType: 'User',
        entityId: user_id,
        metadata: { email: user.email },
      });

      return apiSuccess(null, `Akun ${user.email} berhasil ${currentlyActive ? 'dinonaktifkan' : 'diaktifkan'}.`);
    }

    return apiError('Action tidak dikenal.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
