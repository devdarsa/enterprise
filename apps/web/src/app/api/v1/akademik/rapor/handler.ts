import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError } from '@/lib/api-auth';

// GET /api/v1/akademik/rapor?santri_id=xxx&semester=Ganjil&tahun_ajaran=2025/2026
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const santri_id = searchParams.get('santri_id') || '';
    const semester = searchParams.get('semester') || '';
    const tahun_ajaran = searchParams.get('tahun_ajaran') || '';

    if (!santri_id) {
      return apiError('Parameter santri_id wajib diisi.', 400);
    }

    // Cari santri beserta data lengkap
    const santri = await prisma.santri.findFirst({
      where: { id: santri_id, deleted_at: null },
      include: {
        kelas: true,
        nilai: {
          where: {
            ...(semester ? { semester } : {}),
            ...(tahun_ajaran ? { tahun_ajaran } : {}),
          },
          include: { mata_pelajaran: true },
        },
        rapor: {
          where: {
            ...(semester ? { semester } : {}),
            ...(tahun_ajaran ? { tahun_ajaran } : {}),
          },
          orderBy: { created_at: 'desc' },
          take: 1,
        },
        absensi: {
          orderBy: { created_at: 'desc' },
          take: 100,
        },
      },
    });

    if (!santri) return apiError('Data santri tidak ditemukan.', 404);

    // Hitung statistik kehadiran
    const totalAbsensi = santri.absensi.length;
    const hadir = santri.absensi.filter((a) => a.status === 'HADIR').length;
    const terlambat = santri.absensi.filter((a) => a.status === 'TERLAMBAT').length;
    const izin = santri.absensi.filter((a) => a.status === 'IZIN').length;
    const sakit = santri.absensi.filter((a) => a.status === 'SAKIT').length;
    const alpa = santri.absensi.filter((a) => a.status === 'ALPA').length;

    const raporData = santri.rapor[0] || null;

    return apiSuccess({
      santri: {
        id: santri.id,
        nisp: santri.nisp,
        nisn: santri.nisn,
        nama_lengkap: santri.nama_lengkap,
        kelas: santri.kelas.nama_kelas,
        jenjang: santri.jenjang,
        semester: semester || raporData?.semester || '-',
        tahun_ajaran: tahun_ajaran || raporData?.tahun_ajaran || '-',
      },
      tahfidz: {
        hafalan_juz: raporData?.hafalan_juz ?? santri.hafalan_juz ?? 0,
        predikat: raporData?.predikat_arab || 'BELUM_DINILAI',
      },
      akademik: santri.nilai.map((n) => ({
        mata_pelajaran: n.mata_pelajaran.nama_mapel,
        nilai_harian: n.nilai_harian,
        UTS: n.nilai_uts,
        UAS: n.nilai_uas,
        akhir: (n.nilai_harian + n.nilai_uts + n.nilai_uas) / 3,
      })),
      kehadiran: {
        total: totalAbsensi,
        hadir,
        terlambat,
        izin,
        sakit,
        alpa,
      },
      catatan_wali: raporData?.catatan || null,
    }, 'Data Rapor Santri berhasil diambil.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'WALI_SANTRI']
);
