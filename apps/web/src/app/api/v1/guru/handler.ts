import { NextRequest } from 'next/server';
import { prisma, Prisma } from '@darsa/database';
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

    const where: Prisma.GuruWhereInput = {};
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
          user: { select: { email: true, foto_url: true } },
          jadwal: {
            take: 1,
            include: { mata_pelajaran: true },
          },
        },
      }),
    ]);

    const mapped = guru.map((g) => ({
      ...g,
      foto_url: g.user?.foto_url || undefined,
    }));

    return apiSuccess(mapped, undefined, { total, page, limit, totalPages: Math.ceil(total / limit) }, 5);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI']
);

// POST /api/v1/guru — Tambah guru baru
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { nama_lengkap, nip, telepon, user_id, foto_url } = body;

    if (!nama_lengkap) {
      return apiError('Nama lengkap wajib diisi.');
    }

    let resolvedPhotoUrl = foto_url || null;
    if (resolvedPhotoUrl && resolvedPhotoUrl.startsWith('data:image/')) {
      try {
        const { uploadToCloudinary } = await import('@/lib/cloudinary');
        const uploaded = await uploadToCloudinary(resolvedPhotoUrl, 'darsa_guru');
        resolvedPhotoUrl = uploaded.url;
      } catch (err) {
        console.error('Gagal upload foto guru ke Cloudinary:', err);
      }
    }

    let finalUserId = user_id;
    if (!finalUserId) {
      const newUser = await prisma.user.create({
        data: {
          email: `guru.${(nip || Date.now()).toString().toLowerCase()}@darsa.my.id`,
          nama_lengkap,
          foto_url: resolvedPhotoUrl,
          email_verified: true,
        },
      });
      finalUserId = newUser.id;
    } else if (resolvedPhotoUrl) {
      await prisma.user.update({
        where: { id: finalUserId },
        data: { foto_url: resolvedPhotoUrl },
      }).catch(() => {});
    }

    const guru = await prisma.guru.create({
      data: {
        user_id: finalUserId,
        nama_lengkap,
        nip: nip || `NIP-${Date.now().toString().slice(-8)}`,
        telepon,
      },
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

// PUT /api/v1/guru — Update profil guru & foto
export const PUT = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { id, nama_lengkap, nip, telepon, status_pegawai, foto_url } = body;

    if (!id) {
      return apiError('ID guru wajib disertakan.', 400);
    }

    const existing = await prisma.guru.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Data guru tidak ditemukan.', 404);
    }

    let oldGuruPhotoUrl: string | null = null;
    if (existing.user_id) {
      const existingUser = await prisma.user.findUnique({ where: { id: existing.user_id }, select: { foto_url: true } });
      oldGuruPhotoUrl = existingUser?.foto_url || null;
    }

    let resolvedEditPhotoUrl = foto_url;
    if (resolvedEditPhotoUrl && resolvedEditPhotoUrl.startsWith('data:image/')) {
      try {
        const { uploadToCloudinary, deleteFromCloudinary } = await import('@/lib/cloudinary');
        const uploaded = await uploadToCloudinary(resolvedEditPhotoUrl, 'darsa_guru');
        resolvedEditPhotoUrl = uploaded.url;

        if (oldGuruPhotoUrl && oldGuruPhotoUrl !== resolvedEditPhotoUrl && oldGuruPhotoUrl.includes('cloudinary.com')) {
          deleteFromCloudinary(oldGuruPhotoUrl).catch((e) => console.error('Gagal hapus foto lama guru di Cloudinary:', e));
        }
      } catch (err) {
        console.error('Gagal upload foto guru ke Cloudinary:', err);
      }
    }

    if (resolvedEditPhotoUrl && existing.user_id) {
      await prisma.user.update({
        where: { id: existing.user_id },
        data: { foto_url: resolvedEditPhotoUrl, nama_lengkap: nama_lengkap || existing.nama_lengkap },
      }).catch(() => {});
    } else if (resolvedEditPhotoUrl && !existing.user_id) {
      const newUser = await prisma.user.create({
        data: {
          email: `guru.${(existing.nip || existing.id).toLowerCase()}@darsa.my.id`,
          nama_lengkap: nama_lengkap || existing.nama_lengkap,
          foto_url: resolvedEditPhotoUrl,
          email_verified: true,
        },
      }).catch(() => null);
      if (newUser) {
        await prisma.guru.update({
          where: { id },
          data: { user_id: newUser.id },
        });
      }
    }

    const updated = await prisma.guru.update({
      where: { id },
      data: {
        nama_lengkap: nama_lengkap !== undefined ? nama_lengkap : existing.nama_lengkap,
        nip: nip !== undefined ? nip : existing.nip,
        telepon: telepon !== undefined ? telepon : existing.telepon,
        status_pegawai: status_pegawai !== undefined ? status_pegawai : existing.status_pegawai,
      },
      include: {
        user: { select: { email: true, foto_url: true } },
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE_GURU',
      entityType: 'Guru',
      entityId: id,
      metadata: { perubahan: body },
    });

    return apiSuccess({
      ...updated,
      foto_url: foto_url || updated.user?.foto_url,
    }, 'Profil guru berhasil diperbarui.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
