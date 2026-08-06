import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError } from '@/lib/api-auth';

// GET /api/v1/wali/anak — Data anak dari wali santri yang login
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const wali = await prisma.waliSantri.findFirst({
      where: { user_id: session.user.id },
    });

    if (!wali) {
      return apiError('Profil wali santri tidak ditemukan untuk akun ini.', 404);
    }

    const links = await prisma.hubunganWali.findMany({
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

    const anak = links.map((l: any) => ({
      hubungan: l.hubungan,
      santri: l.santri,
    }));

    return apiSuccess(anak);
  },
  ['WALI_SANTRI', 'SEKRETARIAT', 'ADMIN_INSTANSI']
);
