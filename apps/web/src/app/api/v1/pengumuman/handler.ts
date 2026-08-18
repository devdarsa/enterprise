import { NextRequest } from 'next/server';
import { prisma, Prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/pengumuman
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('target') || '';
    const instansi = searchParams.get('instansi') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Prisma.PengumumanWhereInput = {};
    const userRole = session.user.role;
    const userInstansi = session.user.instansi || 'PONDOK';

    if (userRole === 'WALI_SANTRI') {
      where.target = { in: ['WALI_SANTRI', 'SEMUA'] };
    } else if (userRole === 'GURU_MI') {
      where.target = { in: ['GURU_MI', 'GURU', 'SEMUA'] };
      where.instansi = { in: ['FORMAL_MI', 'MI', 'SEMUA'] };
    } else if (userRole === 'GURU_MADRASAH' || userRole === 'MUSTAHIQ' || userRole === 'MUNAWWIB') {
      where.target = { in: ['GURU_MADRASAH', 'GURU', 'SEMUA'] };
      where.instansi = { in: ['MADRASAH', 'SEMUA'] };
    } else if (userRole === 'KEAMANAN') {
      where.target = { in: ['KEAMANAN', 'SEMUA'] };
      where.instansi = { in: ['PONDOK', 'SEMUA'] };
    } else if (userRole === 'ADMIN_INSTANSI' || userRole === 'SEKRETARIAT') {
      // Scoped ke instansi user — tidak bisa melihat pengumuman instansi lain
      if (userInstansi === 'MADRASAH') {
        where.instansi = { in: ['MADRASAH', 'SEMUA'] };
      } else if (userInstansi === 'MI') {
        where.instansi = { in: ['FORMAL_MI', 'MI', 'SEMUA'] };
      } else {
        // PONDOK — bisa lihat pengumuman pondok dan semua
        where.instansi = { in: ['PONDOK', 'SEMUA'] };
        if (target) where.target = { in: [target, 'SEMUA'] };
      }
    } else {
      if (target) where.target = { in: [target, 'SEMUA'] };
      if (instansi) where.instansi = { in: [instansi, 'SEMUA'] };
    }

    const [total, data] = await Promise.all([
      prisma.pengumuman.count({ where }),
      prisma.pengumuman.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ penting: 'desc' }, { created_at: 'desc' }],
      }),
    ]);

    return apiSuccess(data, undefined, { total, page, limit, totalPages: Math.ceil(total / limit) });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'WALI_SANTRI', 'KEAMANAN', 'MUNAWWIB', 'MUSTAHIQ']
);

// POST /api/v1/pengumuman
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { judul, isi, target, instansi: bodyInstansi, penting } = body;

    if (!judul || !isi || !target) {
      return apiError('Field wajib: judul, isi, target');
    }

    // Pastikan instansi pengumuman sesuai instansi user — cegah cross-write
    const userRole = session.user.role;
    const userInstansi = session.user.instansi || 'PONDOK';
    let resolvedInstansi = bodyInstansi || userInstansi;
    if (userRole === 'ADMIN_INSTANSI' || userRole === 'SEKRETARIAT') {
      resolvedInstansi = userInstansi; // override: selalu pakai instansi session
    }

    const pengumuman = await prisma.pengumuman.create({
      data: {
        judul,
        isi,
        target,
        instansi: resolvedInstansi,
        penulis: session.user.name || session.user.email,
        penting: penting || false,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_PENGUMUMAN',
      entityType: 'Pengumuman',
      entityId: pengumuman.id,
      metadata: { judul, target, instansi: resolvedInstansi },
    });

    return apiSuccess(pengumuman, 'Pengumuman berhasil dipublikasikan.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// DELETE /api/v1/pengumuman?id=xxx
export const DELETE = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiError('Parameter id wajib diisi.');

    const existing = await prisma.pengumuman.findFirst({ where: { id } });
    if (!existing) return apiError('Pengumuman tidak ditemukan.', 404);

    await prisma.pengumuman.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: 'DELETE_PENGUMUMAN',
      entityType: 'Pengumuman',
      entityId: id,
      metadata: { judul: existing.judul },
    });

    return apiSuccess(null, 'Pengumuman berhasil dihapus.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
