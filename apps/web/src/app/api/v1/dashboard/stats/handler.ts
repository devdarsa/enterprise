import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/dashboard/stats — Real aggregated stats from database
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalSantri,
      santriAktif,
      totalGuru,
      totalPengurus,
      perizinanHariIni,
      pelanggaranHariIni,
      pengumumanTerbaru,
      auditLogTerbaru,
    ] = await Promise.all([
      prisma.santri.count({ where: { deleted_at: null } }),
      prisma.santri.count({ where: { deleted_at: null, status: 'AKTIF' } }),
      prisma.guru.count(),
      prisma.pengurus.count({ where: { deleted_at: null, status: 'AKTIF' } }),
      prisma.perizinan.count({
        where: {
          deleted_at: null,
          created_at: { gte: today, lt: tomorrow },
        },
      }),
      prisma.pelanggaran.count({
        where: {
          deleted_at: null,
          tanggal: { gte: today, lt: tomorrow },
        },
      }),
      prisma.pengumuman.findMany({
        orderBy: { created_at: 'desc' },
        take: 3,
        select: { id: true, judul: true, target: true, penting: true, created_at: true },
      }),
      prisma.auditLog.findMany({
        orderBy: { created_at: 'desc' },
        take: 8,
        include: { user: { select: { nama_lengkap: true, email: true } } },
      }),
    ]);

    // Grafik: statistik kehadiran santri (per jenjang)
    const santriPerJenjang = await prisma.santri.groupBy({
      by: ['jenjang'],
      where: { deleted_at: null, status: 'AKTIF' },
      _count: { id: true },
    });

    return apiSuccess({
      stats: {
        totalSantri,
        santriAktif,
        totalGuru,
        totalPengurus,
        perizinanHariIni,
        pelanggaranHariIni,
      },
      grafik: {
        santriPerJenjang: santriPerJenjang.map((g) => ({
          jenjang: g.jenjang || 'Tidak Diketahui',
          jumlah: (g._count as any).id || 0,
        })),
      },
      pengumuman: pengumumanTerbaru,
      aktivitasTerbaru: auditLogTerbaru,
    });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
