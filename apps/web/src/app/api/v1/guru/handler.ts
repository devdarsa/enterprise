import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/guru — List guru/pengajar
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const instansi = searchParams.get('instansi') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { nama_lengkap: { contains: search, mode: 'insensitive' } },
        { nip: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, guru] = await Promise.all([
      prisma.guru.count({ where }),
      prisma.guru.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nama_lengkap: 'asc' },
        include: {
          user: { select: { email: true, user_roles: { include: { role: true } } } },
          jadwal: {
            include: { mata_pelajaran: true, kelas: true },
          },
        },
      }),
    ]);

    return apiSuccess(guru, undefined, { total, page, limit, totalPages: Math.ceil(total / limit) });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI']
);

// POST /api/v1/guru — Tambah guru baru
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { nama_lengkap, nip, telepon, user_id } = body;

    if (!nama_lengkap || !user_id) {
      return apiError('nama_lengkap dan user_id wajib diisi.');
    }

    const existing = await prisma.guru.findFirst({ where: { user_id } });
    if (existing) return apiError('User ini sudah memiliki profil guru.', 409);

    const guru = await prisma.guru.create({
      data: { user_id, nama_lengkap, nip, telepon },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_GURU',
      entityType: 'Guru',
      entityId: guru.id,
      metadata: { nama: nama_lengkap, nip },
    });

    return apiSuccess(guru, `Data guru ${nama_lengkap} berhasil disimpan.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
