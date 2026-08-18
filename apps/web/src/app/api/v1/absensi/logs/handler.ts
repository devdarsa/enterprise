import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@darsa/database';
import { withAuth, apiSuccess } from '@/lib/api-auth';

// GET /api/v1/absensi/logs — Daftar log presensi dari database dengan pagination
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const santri_id = searchParams.get('santri_id') || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const where: Prisma.AbsensiLogWhereInput = {};
    if (santri_id) where.santri_id = santri_id;
    if (status) where.status = status as Prisma.EnumStatusAbsensiFilter['equals'];

    const userRole = session.user.role;
    const userInstansi = session.user.instansi || 'PONDOK';

    if (userRole === 'GURU_MI') {
      where.santri = { jenjang: 'MI' };
    } else if (userRole === 'GURU_MADRASAH' || userRole === 'MUSTAHIQ' || userRole === 'MUNAWWIB') {
      where.santri = { jenjang: 'MADRASAH_DINIYAH' };
    } else if (userRole === 'ADMIN_INSTANSI' || userRole === 'SEKRETARIAT') {
      if (userInstansi === 'MI') {
        where.santri = { jenjang: 'MI' };
      } else if (userInstansi === 'MADRASAH') {
        where.santri = { jenjang: 'MADRASAH_DINIYAH' };
      }
      // PONDOK — lihat semua (tidak difilter lebih lanjut)
    }

    const [total, logs] = await Promise.all([
      prisma.absensiLog.count({ where }),
      prisma.absensiLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal: 'desc' },
        include: {
          santri: {
            select: {
              nama_lengkap: true,
              nisp: true,
              kelas: { select: { nama_kelas: true } },
            },
          },
        },
      }),
    ]);

    return apiSuccess(logs, 'Daftar riwayat presensi berhasil diambil.', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'GURU']
);
