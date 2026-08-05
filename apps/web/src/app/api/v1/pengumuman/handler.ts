import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
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

    const where: any = {};
    if (target) where.target = { in: [target, 'SEMUA'] };
    if (instansi) where.instansi = { in: [instansi, 'SEMUA'] };

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
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'WALI_SANTRI']
);

// POST /api/v1/pengumuman
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { judul, isi, target, instansi, penting } = body;

    if (!judul || !isi || !target || !instansi) {
      return apiError('Field wajib: judul, isi, target, instansi');
    }

    const pengumuman = await prisma.pengumuman.create({
      data: {
        judul,
        isi,
        target,
        instansi,
        penulis: session.user.name || session.user.email,
        penting: penting || false,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_PENGUMUMAN',
      entityType: 'Pengumuman',
      entityId: pengumuman.id,
      metadata: { judul, target, instansi },
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
