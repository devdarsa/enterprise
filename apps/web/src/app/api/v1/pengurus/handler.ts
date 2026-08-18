import { NextRequest } from 'next/server';
import { prisma, Prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/pengurus
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const unit = searchParams.get('unit') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: Prisma.PengurusWhereInput = { deleted_at: null };
    if (unit) where.unit = unit;
    if (search) {
      where.OR = [
        { nama_lengkap: { contains: search, mode: 'insensitive' } },
        { jabatan: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.pengurus.count({ where }),
      prisma.pengurus.findMany({ where, skip, take: limit, orderBy: { nama_lengkap: 'asc' } }),
    ]);

    return apiSuccess(data, undefined, { total, page, limit, totalPages: Math.ceil(total / limit) }, 5);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// POST /api/v1/pengurus
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { nik, nama_lengkap, jabatan, unit, telepon, alamat } = body;

    if (!nama_lengkap || !jabatan) {
      return apiError('nama_lengkap dan jabatan wajib diisi.');
    }

    if (nik) {
      const existing = await prisma.pengurus.findFirst({ where: { nik, deleted_at: null } });
      if (existing) return apiError(`NIK ${nik} sudah terdaftar.`, 409);
    }

    let resolvedPhotoUrl = body.avatar_url || body.foto_url || null;
    if (resolvedPhotoUrl && resolvedPhotoUrl.startsWith('data:image/')) {
      try {
        const { uploadToCloudinary } = await import('@/lib/cloudinary');
        const uploaded = await uploadToCloudinary(resolvedPhotoUrl, 'darsa_pengurus');
        resolvedPhotoUrl = uploaded.url;
      } catch (err) {
        console.error('Gagal upload foto pengurus ke Cloudinary:', err);
      }
    }

    if (nik && resolvedPhotoUrl) {
      await prisma.user.updateMany({
        where: { OR: [{ email: { startsWith: `pengurus.` } }, { nama_lengkap }] },
        data: { foto_url: resolvedPhotoUrl },
      }).catch(() => {});
    }

    const pengurus = await prisma.pengurus.create({
      data: { nik, nama_lengkap, jabatan, unit: unit || 'PONDOK', telepon, alamat },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_PENGURUS',
      entityType: 'Pengurus',
      entityId: pengurus.id,
      metadata: { nama: nama_lengkap, jabatan, unit },
    });

    return apiSuccess({ ...pengurus, avatar_url: resolvedPhotoUrl }, 'Data pengurus berhasil disimpan.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// PUT /api/v1/pengurus — Update pengurus
export const PUT = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { id, nik, nama_lengkap, jabatan, unit, telepon, alamat, status, avatar_url, foto_url } = body;

    if (!id) {
      return apiError('ID pengurus wajib diisi.', 400);
    }

    const existing = await prisma.pengurus.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Data pengurus tidak ditemukan.', 404);
    }

    let resolvedEditPhotoUrl = avatar_url || foto_url;
    if (resolvedEditPhotoUrl && resolvedEditPhotoUrl.startsWith('data:image/')) {
      try {
        const { uploadToCloudinary } = await import('@/lib/cloudinary');
        const uploaded = await uploadToCloudinary(resolvedEditPhotoUrl, 'darsa_pengurus');
        resolvedEditPhotoUrl = uploaded.url;
      } catch (err) {
        console.error('Gagal upload foto pengurus ke Cloudinary:', err);
      }
    }

    if (resolvedEditPhotoUrl && existing.nik) {
      await prisma.user.updateMany({
        where: { OR: [{ email: { startsWith: `pengurus.` } }, { nama_lengkap: existing.nama_lengkap }] },
        data: { foto_url: resolvedEditPhotoUrl },
      }).catch(() => {});
    }

    const updated = await prisma.pengurus.update({
      where: { id },
      data: {
        nama_lengkap: nama_lengkap !== undefined ? nama_lengkap : existing.nama_lengkap,
        nik: nik !== undefined ? nik : existing.nik,
        jabatan: jabatan !== undefined ? jabatan : existing.jabatan,
        unit: unit !== undefined ? unit : existing.unit,
        telepon: telepon !== undefined ? telepon : existing.telepon,
        alamat: alamat !== undefined ? alamat : existing.alamat,
        status: status !== undefined ? status : existing.status,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE_PENGURUS',
      entityType: 'Pengurus',
      entityId: id,
      metadata: { perubahan: body },
    });

    return apiSuccess(updated, 'Data pengurus berhasil diperbarui.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
