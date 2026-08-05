import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/tahun-ajaran
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const data = await prisma.tahunAjaran.findMany({ orderBy: { created_at: 'desc' } });
    return apiSuccess(data);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI']
);

// POST /api/v1/tahun-ajaran
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { nama, semester, tanggal_mulai, tanggal_akhir, is_aktif } = body;

    if (!nama || !semester || !tanggal_mulai || !tanggal_akhir) {
      return apiError('Field wajib: nama, semester, tanggal_mulai, tanggal_akhir');
    }

    // Jika is_aktif = true, nonaktifkan yang lain dulu
    if (is_aktif) {
      await prisma.tahunAjaran.updateMany({ data: { is_aktif: false } });
    }

    const ta = await prisma.tahunAjaran.create({
      data: {
        nama,
        semester,
        tanggal_mulai: new Date(tanggal_mulai),
        tanggal_akhir: new Date(tanggal_akhir),
        is_aktif: is_aktif || false,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_TAHUN_AJARAN',
      entityType: 'TahunAjaran',
      entityId: ta.id,
      metadata: { nama, semester },
    });

    return apiSuccess(ta, `Tahun Ajaran ${nama} ${semester} berhasil dibuat.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// PATCH /api/v1/tahun-ajaran — Set aktif
export const PATCH = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { id } = body;
    if (!id) return apiError('id wajib diisi.');

    // Set semua jadi non-aktif
    await prisma.tahunAjaran.updateMany({ data: { is_aktif: false } });
    // Set yang dipilih jadi aktif
    const updated = await prisma.tahunAjaran.update({ where: { id }, data: { is_aktif: true } });

    await logAudit({
      userId: session.user.id,
      action: 'SET_TAHUN_AJARAN_AKTIF',
      entityType: 'TahunAjaran',
      entityId: id,
      metadata: { nama: updated.nama },
    });

    return apiSuccess(updated, `Tahun Ajaran ${updated.nama} ${updated.semester} diset sebagai aktif.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
