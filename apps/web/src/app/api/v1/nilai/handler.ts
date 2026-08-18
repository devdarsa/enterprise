import { NextRequest } from 'next/server';
import { prisma, Prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/nilai — Daftar nilai akademik & setoran
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const santri_id = searchParams.get('santri_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Prisma.NilaiAkademikWhereInput = {};
    if (santri_id) where.santri_id = santri_id;

    const userRole = session.user.role;
    if (userRole === 'GURU_MI') {
      where.santri = { jenjang: 'MI' };
    } else if (userRole === 'GURU_MADRASAH' || userRole === 'MUSTAHIQ' || userRole === 'MUNAWWIB') {
      where.santri = { jenjang: 'MADRASAH_DINIYAH' };
    } else if (userRole === 'WALI_SANTRI') {
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
      prisma.nilaiAkademik.count({ where }),
      prisma.nilaiAkademik.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          santri: {
            select: {
              id: true,
              nama_lengkap: true,
              nisp: true,
              jenjang: true,
              kelas: { select: { nama_kelas: true } },
            },
          },
          mata_pelajaran: {
            select: {
              id: true,
              nama_mapel: true,
              kode_mapel: true,
              jenjang: true,
            },
          },
        },
      }),
    ]);

    return apiSuccess(data, 'Data nilai berhasil diambil.', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'MUSTAHIQ', 'MUNAWWIB', 'WALI_SANTRI']
);

// POST /api/v1/nilai — Simpan nilai / setoran santri baru
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { santri_id, mapel, nilai, catatan, tahun_ajaran = '2025/2026', semester = 'GANJIL' } = body;

    if (!santri_id || !mapel) {
      return apiError('santri_id dan mapel wajib diisi.', 400);
    }

    const santri = await prisma.santri.findUnique({ where: { id: santri_id } });
    if (!santri) {
      return apiError('Santri tidak ditemukan.', 404);
    }

    // Role safety check
    const userRole = session.user.role;
    if (userRole === 'GURU_MI' && santri.jenjang !== 'MI') {
      return apiError('Anda hanya memiliki otorisasi menginput nilai santri MI.', 403);
    }
    if ((userRole === 'GURU_MADRASAH' || userRole === 'MUSTAHIQ' || userRole === 'MUNAWWIB') && santri.jenjang !== 'MADRASAH_DINIYAH') {
      return apiError('Anda hanya memiliki otorisasi menginput nilai santri Madrasah Diniyah.', 403);
    }

    // Cari atau buat mata pelajaran
    let mapelRecord = await prisma.mataPelajaran.findFirst({
      where: { nama_mapel: mapel },
    });

    if (!mapelRecord) {
      const cleanSlug = mapel.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'MAPEL';
      const kode = `MP-${santri.jenjang.slice(0, 3)}-${cleanSlug}`;
      mapelRecord = await prisma.mataPelajaran.create({
        data: {
          kode_mapel: kode,
          nama_mapel: mapel,
          jenjang: santri.jenjang,
        },
      });
    }

    const numericNilai = parseFloat(nilai) || 0;

    const savedNilai = await prisma.nilaiAkademik.upsert({
      where: {
        santri_id_mata_pelajaran_id_tahun_ajaran_semester: {
          santri_id,
          mata_pelajaran_id: mapelRecord.id,
          tahun_ajaran,
          semester,
        },
      },
      update: {
        nilai_harian: numericNilai,
        nilai_uas: numericNilai,
      },
      create: {
        santri_id,
        mata_pelajaran_id: mapelRecord.id,
        tahun_ajaran,
        semester,
        nilai_harian: numericNilai,
        nilai_uas: numericNilai,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'INPUT_NILAI',
      entityType: 'NilaiAkademik',
      entityId: savedNilai.id,
      metadata: { santri_id, mapel, nilai: numericNilai, catatan },
    });

    return apiSuccess(savedNilai, 'Nilai santri berhasil disimpan ke database.', undefined, 201);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'MUSTAHIQ', 'MUNAWWIB']
);
