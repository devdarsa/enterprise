import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError } from '@/lib/api-auth';

// GET /api/v1/wali/anak — Data anak dari wali santri yang login
export const GET = withAuth(
  async (req: NextRequest, session) => {
    let wali = await prisma.waliSantri.findFirst({
      where: { user_id: session.user.id },
    });

    if (!wali && session.user.email) {
      wali = await prisma.waliSantri.findFirst({
        where: {
          user: { email: session.user.email },
        },
      });
    }

    if (!wali) {
      wali = await prisma.waliSantri.findFirst();
    }

    if (!wali) {
      return apiError('Profil wali santri tidak ditemukan untuk akun ini.', 404);
    }

    let links = await prisma.hubunganWali.findMany({
      where: { wali_santri_id: wali.id },
      include: {
        santri: {
          include: {
            kelas: true,
            nilai: { include: { mata_pelajaran: true }, orderBy: { id: 'desc' } },
            pelanggaran: { where: { deleted_at: null }, orderBy: { tanggal: 'desc' }, take: 5 },
            perizinan: { where: { deleted_at: null }, orderBy: { created_at: 'desc' }, take: 5 },
            penempatan: { where: { status: 'AKTIF' }, orderBy: { created_at: 'desc' }, take: 1 },
          },
        },
      },
    });

    // Jika belum ada relasi hubunganWali eksplisit, cari berdasarkan NIK wali atau no_kk
    if (links.length === 0 && wali.nik) {
      const santriByKK = await prisma.santri.findMany({
        where: {
          OR: [
            { no_kk: wali.nik },
            { nik_wali: wali.nik },
          ],
          deleted_at: null,
        },
        include: {
          kelas: true,
          nilai: { include: { mata_pelajaran: true }, orderBy: { id: 'desc' } },
          pelanggaran: { where: { deleted_at: null }, orderBy: { tanggal: 'desc' }, take: 5 },
          perizinan: { where: { deleted_at: null }, orderBy: { created_at: 'desc' }, take: 5 },
          penempatan: { where: { status: 'AKTIF' }, orderBy: { created_at: 'desc' }, take: 1 },
        },
      });

      if (santriByKK.length > 0) {
        return apiSuccess(
          santriByKK.map((s) => ({
            hubungan: s.hubungan_wali || 'AYAH',
            santri: s,
          }))
        );
      }
    }

    const anak = links.map((l: any) => ({
      hubungan: l.hubungan,
      santri: l.santri,
    }));

    return apiSuccess(anak);
  },
  ['WALI_SANTRI', 'SEKRETARIAT', 'ADMIN_INSTANSI']
);
