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

// POST /api/v1/tahun-ajaran — Tambah Baru
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { nama, semester, tanggal_mulai, tanggal_akhir, is_aktif } = body;

    if (!nama || !semester || !tanggal_mulai || !tanggal_akhir) {
      return apiError('Field wajib: nama, semester, tanggal_mulai, tanggal_akhir');
    }

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

// PATCH /api/v1/tahun-ajaran — Set Aktif
export const PATCH = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { id } = body;
    if (!id) return apiError('id wajib diisi.');

    await prisma.tahunAjaran.updateMany({ data: { is_aktif: false } });
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

// PUT /api/v1/tahun-ajaran — Edit
export const PUT = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { id, nama, semester, tanggal_mulai, tanggal_akhir, is_aktif } = body;
    if (!id) return apiError('id wajib diisi.');

    if (is_aktif) {
      await prisma.tahunAjaran.updateMany({ data: { is_aktif: false } });
    }

    const updated = await prisma.tahunAjaran.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(semester && { semester }),
        ...(tanggal_mulai && { tanggal_mulai: new Date(tanggal_mulai) }),
        ...(tanggal_akhir && { tanggal_akhir: new Date(tanggal_akhir) }),
        ...(typeof is_aktif === 'boolean' && { is_aktif }),
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE_TAHUN_AJARAN',
      entityType: 'TahunAjaran',
      entityId: id,
      metadata: { nama: updated.nama },
    });

    return apiSuccess(updated, `Tahun Ajaran ${updated.nama} berhasil diperbarui.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// DELETE /api/v1/tahun-ajaran — Hapus
export const DELETE = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return apiError('Parameter id wajib diisi.');

    await prisma.tahunAjaran.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: 'DELETE_TAHUN_AJARAN',
      entityType: 'TahunAjaran',
      entityId: id,
    });

    return apiSuccess(null, 'Tahun Ajaran berhasil dihapus.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
