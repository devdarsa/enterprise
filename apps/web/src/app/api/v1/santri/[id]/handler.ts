import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/santri/[id]
export const GET = withAuth(
  async (req: NextRequest, session, context?: any) => {
    const id = context?.params ? (await context.params).id : req.url.split('/').slice(-1)[0];

    const santri = await prisma.santri.findFirst({
      where: { id, deleted_at: null },
      include: {
        kelas: true,
        penempatan: { orderBy: { created_at: 'desc' } },
        wali_links: { include: { wali_santri: true } },
        nilai: { include: { mata_pelajaran: true } },
        pelanggaran: { where: { deleted_at: null }, orderBy: { tanggal: 'desc' } },
        perizinan: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
      },
    });

    if (!santri) return apiError('Data santri tidak ditemukan.', 404);
    return apiSuccess(santri);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'WALI_SANTRI']
);

// PUT /api/v1/santri/[id]
export const PUT = withAuth(
  async (req: NextRequest, session, context?: any) => {
    const id = context?.params ? (await context.params).id : req.url.split('/').slice(-1)[0];
    const body = await req.json();

    const existing = await prisma.santri.findFirst({ where: { id, deleted_at: null } });
    if (!existing) return apiError('Data santri tidak ditemukan.', 404);

    const updated = await prisma.santri.update({
      where: { id },
      data: {
        nama_lengkap: body.nama_lengkap,
        nama_panggilan: body.nama_panggilan,
        jenis_kelamin: body.jenis_kelamin,
        tempat_lahir: body.tempat_lahir,
        tanggal_lahir: body.tanggal_lahir,
        anak_ke: body.anak_ke,
        jumlah_saudara: body.jumlah_saudara,
        alamat: body.alamat,
        telepon: body.telepon,
        jenjang: body.jenjang,
        kelas_id: body.kelas_id,
        kamar: body.kamar,
        status_tempat_tinggal: body.status_tempat_tinggal,
        hafalan_juz: body.hafalan_juz,
        nik_wali: body.nik_wali,
        nama_wali: body.nama_wali,
        telepon_wali: body.telepon_wali,
        hubungan_wali: body.hubungan_wali,
        no_kk: body.no_kk,
        status: body.status,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE_SANTRI',
      entityType: 'Santri',
      entityId: id,
      metadata: { perubahan: body },
    });

    return apiSuccess(updated, 'Data santri berhasil diperbarui.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// DELETE /api/v1/santri/[id] — Soft delete
export const DELETE = withAuth(
  async (req: NextRequest, session, context?: any) => {
    const id = context?.params ? (await context.params).id : req.url.split('/').slice(-1)[0];

    const existing = await prisma.santri.findFirst({ where: { id, deleted_at: null } });
    if (!existing) return apiError('Data santri tidak ditemukan.', 404);

    await prisma.santri.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    await logAudit({
      userId: session.user.id,
      action: 'DELETE_SANTRI',
      entityType: 'Santri',
      entityId: id,
      metadata: { nisp: existing.nisp, nama: existing.nama_lengkap },
    });

    return apiSuccess(null, 'Data santri dipindahkan ke Recycle Bin (Soft Delete).');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
