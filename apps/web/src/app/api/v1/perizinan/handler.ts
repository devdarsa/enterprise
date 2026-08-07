import { NextRequest } from 'next/server';
import { prisma, Prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/perizinan
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const santri_id = searchParams.get('santri_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Prisma.PerizinanWhereInput = { deleted_at: null };
    if (status) where.status = status as Prisma.EnumStatusPerizinanFilter['equals'];
    if (santri_id) where.santri_id = santri_id;

    // Wali santri hanya bisa lihat izin anaknya sendiri
    const userRole = session.user.role;
    if (userRole === 'WALI_SANTRI') {
      const wali = await prisma.waliSantri.findFirst({ where: { user_id: session.user.id } });
      if (wali) {
        const santriIds = await prisma.hubunganWali.findMany({
          where: { wali_santri_id: wali.id },
          select: { santri_id: true },
        });
        where.santri_id = { in: santriIds.map((h) => h.santri_id) };
      }
    }

    const [total, data] = await Promise.all([
      prisma.perizinan.count({ where }),
      prisma.perizinan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          santri: { select: { nisp: true, nama_lengkap: true, kelas: { select: { nama_kelas: true } } } },
          approver: { select: { nama_lengkap: true } },
        },
      }),
    ]);

    return apiSuccess(data, undefined, { total, page, limit, totalPages: Math.ceil(total / limit) });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'WALI_SANTRI', 'KEAMANAN']
);

// POST /api/v1/perizinan
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { santri_id, jenis, alasan, tanggal_mulai, tanggal_kembali, keterangan } = body;

    if (!santri_id || !jenis || !alasan || !tanggal_mulai || !tanggal_kembali) {
      return apiError('Field wajib: santri_id, jenis, alasan, tanggal_mulai, tanggal_kembali');
    }

    const perizinan = await prisma.perizinan.create({
      data: {
        santri_id,
        jenis,
        alasan,
        tanggal_mulai: new Date(tanggal_mulai),
        tanggal_kembali: new Date(tanggal_kembali),
        keterangan,
        status: 'PENDING',
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_PERIZINAN',
      entityType: 'Perizinan',
      entityId: perizinan.id,
      metadata: { santri_id, jenis, alasan },
    });

    return apiSuccess(perizinan, 'Permohonan izin berhasil diajukan.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'WALI_SANTRI']
);

// PATCH /api/v1/perizinan — Update status (approve/reject)
export const PATCH = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { id, status, keterangan } = body;

    if (!id || !status) return apiError('id dan status wajib diisi.');
    if (!['DISETUJUI', 'DITOLAK', 'SELESAI'].includes(status)) {
      return apiError('Status tidak valid. Gunakan: DISETUJUI, DITOLAK, SELESAI');
    }

    const existing = await prisma.perizinan.findFirst({ where: { id, deleted_at: null } });
    if (!existing) return apiError('Data perizinan tidak ditemukan.', 404);

    const updated = await prisma.perizinan.update({
      where: { id },
      data: { status, keterangan, disetujui_oleh: session.user.id },
    });

    await logAudit({
      userId: session.user.id,
      action: `${status}_PERIZINAN`,
      entityType: 'Perizinan',
      entityId: id,
      metadata: { status, keterangan },
    });

    return apiSuccess(updated, `Perizinan berhasil ${status === 'DISETUJUI' ? 'disetujui' : 'ditolak'}.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH']
);
