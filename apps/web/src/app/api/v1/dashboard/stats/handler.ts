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

    const userInstansi = session.user.instansi || 'PONDOK';

    // Buat filter jenjang berdasarkan instansi user — cegah cross-instansi data leak
    const jenjangFilter =
      userInstansi === 'MADRASAH' ? { jenjang: 'MADRASAH_DINIYAH' as const } :
      userInstansi === 'MI' ? { jenjang: 'MI' as const } :
      {}; // PONDOK — semua santri pondok (tanpa filter jenjang)

    const santriBaseWhere = { deleted_at: null, ...jenjangFilter };

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
      prisma.santri.count({ where: santriBaseWhere }),
      prisma.santri.count({ where: { ...santriBaseWhere, status: 'AKTIF' } }),
      prisma.guru.count(),
      userInstansi === 'PONDOK'
        ? prisma.pengurus.count({ where: { deleted_at: null, status: 'AKTIF' } })
        : Promise.resolve(0),
      userInstansi === 'PONDOK'
        ? prisma.perizinan.count({ where: { deleted_at: null, created_at: { gte: today, lt: tomorrow } } })
        : Promise.resolve(0),
      userInstansi === 'PONDOK'
        ? prisma.pelanggaran.count({ where: { deleted_at: null, tanggal: { gte: today, lt: tomorrow } } })
        : Promise.resolve(0),
      prisma.pengumuman.findMany({
        where:
          userInstansi === 'MADRASAH' ? { instansi: { in: ['MADRASAH', 'SEMUA'] } } :
          userInstansi === 'MI' ? { instansi: { in: ['FORMAL_MI', 'MI', 'SEMUA'] } } :
          { instansi: { in: ['PONDOK', 'SEMUA'] } },
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

    // Grafik: statistik kehadiran santri (per jenjang — sudah di-scope)
    const santriPerJenjang = await prisma.santri.groupBy({
      by: ['jenjang'],
      where: { deleted_at: null, status: 'AKTIF', ...jenjangFilter },
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
          jumlah: g._count.id || 0,
        })),
      },
      pengumuman: pengumumanTerbaru,
      aktivitasTerbaru: auditLogTerbaru,
    }, undefined, undefined, 10);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
