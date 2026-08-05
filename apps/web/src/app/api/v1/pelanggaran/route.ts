import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/pelanggaran
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const tingkat = searchParams.get('tingkat') || '';
    const santri_id = searchParams.get('santri_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = { deleted_at: null };
    if (tingkat) where.tingkat = tingkat;
    if (santri_id) where.santri_id = santri_id;
    if (search) {
      where.santri = {
        nama_lengkap: { contains: search, mode: 'insensitive' },
      };
    }

    const [total, data] = await Promise.all([
      prisma.pelanggaran.count({ where }),
      prisma.pelanggaran.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal: 'desc' },
        include: {
          santri: { select: { nisp: true, nama_lengkap: true, kelas: { select: { nama_kelas: true } } } },
          petugas: { select: { nama_lengkap: true } },
        },
      }),
    ]);

    return apiSuccess(data, undefined, { total, page, limit, totalPages: Math.ceil(total / limit) });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI']
);

// POST /api/v1/pelanggaran
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { santri_id, jenis, tingkat, tindakan, keterangan, tanggal } = body;

    if (!santri_id || !jenis) {
      return apiError('santri_id dan jenis pelanggaran wajib diisi.');
    }

    const santri = await prisma.santri.findFirst({ where: { id: santri_id, deleted_at: null } });
    if (!santri) return apiError('Santri tidak ditemukan.', 404);

    const pelanggaran = await prisma.pelanggaran.create({
      data: {
        santri_id,
        jenis,
        tingkat: tingkat || 'RINGAN',
        tindakan,
        keterangan,
        petugas_id: session.user.id,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_PELANGGARAN',
      entityType: 'Pelanggaran',
      entityId: pelanggaran.id,
      metadata: { santri_id, jenis, tingkat },
    });

    return apiSuccess(pelanggaran, 'Pelanggaran berhasil dicatat.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH']
);
