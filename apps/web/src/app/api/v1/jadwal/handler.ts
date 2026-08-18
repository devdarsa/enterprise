import { NextRequest } from 'next/server';
import { prisma, Prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/jadwal
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const hari = searchParams.get('hari') || '';
    const kelas_id = searchParams.get('kelas_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: Prisma.JadwalPelajaranWhereInput = {};
    if (hari) where.hari = hari;
    if (kelas_id) where.kelas_id = kelas_id;

    const [total, data] = await Promise.all([
      prisma.jadwalPelajaran.count({ where }),
      prisma.jadwalPelajaran.findMany({
        where,
        skip,
        take: limit,
        include: {
          mata_pelajaran: { select: { nama_mapel: true } },
          kelas: { select: { nama_kelas: true } },
          guru: { select: { nama_lengkap: true } },
        },
        orderBy: [{ hari: 'asc' }, { jam_mulai: 'asc' }],
      }),
    ]);

    return apiSuccess(data, undefined, { total, page, limit });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'GURU']
);

// POST /api/v1/jadwal
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { hari, jam_mulai, jam_selesai, nama_mapel, nama_guru, ruang, nama_kelas, jenis } = body;

    if (!hari || !jam_mulai || !nama_mapel) {
      return apiError('hari, jam_mulai, dan nama_mapel wajib diisi.', 400);
    }

    // Cari atau buat mata_pelajaran
    let mapel = await prisma.mataPelajaran.findFirst({ where: { nama_mapel } });
    if (!mapel) {
      mapel = await prisma.mataPelajaran.create({ data: { nama_mapel, kode_mapel: nama_mapel.toUpperCase().slice(0, 10), kategori: 'AGAMA' } });
    }

    // Cari guru berdasarkan nama — required field
    if (!nama_guru) {
      return apiError('nama_guru wajib diisi untuk membuat jadwal.', 400);
    }
    const guru = await prisma.guru.findFirst({ where: { nama_lengkap: { contains: nama_guru } } });
    if (!guru) {
      return apiError(`Guru "${nama_guru}" tidak ditemukan di database. Daftarkan guru terlebih dahulu.`, 404);
    }

    // Cari kelas berdasarkan nama
    if (!nama_kelas) {
      return apiError('nama_kelas wajib diisi untuk membuat jadwal.', 400);
    }
    const kelas = await prisma.kelas.findFirst({ where: { nama_kelas: { contains: nama_kelas } } });
    if (!kelas) {
      return apiError('Kelas tidak ditemukan. Pastikan kelas sudah terdaftar di database.', 404);
    }

    const jadwal = await prisma.jadwalPelajaran.create({
      data: {
        hari,
        jam_mulai,
        jam_selesai: jam_selesai || jam_mulai,
        mata_pelajaran_id: mapel.id,
        kelas_id: kelas.id,
        guru_id: guru.id,
        ruangan: ruang || body.ruangan || '-',
        tahun_ajaran: body.tahun_ajaran || '2025/2026',
        semester: body.semester || 'GANJIL',
      },
      include: {
        mata_pelajaran: { select: { nama_mapel: true } },
        kelas: { select: { nama_kelas: true } },
        guru: { select: { nama_lengkap: true } },
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_JADWAL',
      entityType: 'JadwalPelajaran',
      entityId: jadwal.id,
      metadata: { hari, jam_mulai, nama_mapel },
    });

    return apiSuccess(jadwal, `Jadwal ${nama_mapel} (${hari} ${jam_mulai}) berhasil disimpan.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH']
);
