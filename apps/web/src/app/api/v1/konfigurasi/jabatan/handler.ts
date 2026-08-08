import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/konfigurasi/jabatan
export const GET = withAuth(
  async (req: NextRequest) => {
    const data = await prisma.masterJabatan.findMany({
      orderBy: { nama: 'asc' },
    });

    return apiSuccess(data, 'Daftar master jabatan berhasil dimuat.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'KEAMANAN']
);

// POST /api/v1/konfigurasi/jabatan
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { nama, unit, deskripsi } = body;

    if (!nama || !nama.trim()) {
      return apiError('Nama jabatan wajib diisi.');
    }

    const cleanNama = nama.trim();

    const existing = await prisma.masterJabatan.findUnique({
      where: { nama: cleanNama },
    });

    if (existing) {
      return apiError(`Jabatan '${cleanNama}' sudah terdaftar dalam sistem.`, 409);
    }

    const jabatan = await prisma.masterJabatan.create({
      data: {
        nama: cleanNama,
        unit: unit || 'PONDOK',
        deskripsi: deskripsi || undefined,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_MASTER_JABATAN',
      entityType: 'MasterJabatan',
      entityId: jabatan.id,
      metadata: { nama: cleanNama, unit },
    });

    return apiSuccess(jabatan, `Master Jabatan '${cleanNama}' berhasil ditambahkan.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// DELETE /api/v1/konfigurasi/jabatan?id=xxx
export const DELETE = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return apiError('Parameter id wajib diisi.');

    const existing = await prisma.masterJabatan.findUnique({ where: { id } });
    if (!existing) return apiError('Master Jabatan tidak ditemukan.', 404);

    await prisma.masterJabatan.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: 'DELETE_MASTER_JABATAN',
      entityType: 'MasterJabatan',
      entityId: id,
      metadata: { nama: existing.nama },
    });

    return apiSuccess(null, `Master Jabatan '${existing.nama}' berhasil dihapus.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
