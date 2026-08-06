import { NextRequest } from 'next/server';
import { prisma, Prisma, JenisSurat } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/surat
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const jenis = searchParams.get('jenis') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Prisma.SuratWhereInput = {};
    if (jenis) where.jenis_surat = jenis as JenisSurat;

    const [total, data] = await Promise.all([
      prisma.surat.count({ where }),
      prisma.surat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal: 'desc' },
      }),
    ]);

    return apiSuccess(data, undefined, { total, page, limit, totalPages: Math.ceil(total / limit) });
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH']
);

// POST /api/v1/surat
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { nomor_surat, jenis_surat, perihal, pengirim, penerima } = body;

    if (!nomor_surat || !jenis_surat || !perihal) {
      return apiError('nomor_surat, jenis_surat, dan perihal wajib diisi.');
    }

    // Dapatkan pondok_id dari user
    const user = await prisma.user.findFirst({ where: { id: session.user.id } });
    const pondok = await prisma.pondok.findFirst();
    if (!pondok) return apiError('Data pondok tidak ditemukan di database.', 404);

    // Cek duplikasi nomor surat
    const existing = await prisma.surat.findFirst({ where: { nomor_surat } });
    if (existing) return apiError(`Nomor surat ${nomor_surat} sudah terdaftar.`, 409);

    const surat = await prisma.surat.create({
      data: {
        pondok_id: pondok.id,
        nomor_surat,
        jenis_surat: jenis_surat as JenisSurat,
        perihal,
        pengirim: pengirim || session.user.name || session.user.email,
        penerima: penerima || 'Sekretariat Utama',
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_SURAT',
      entityType: 'Surat',
      entityId: surat.id,
      metadata: { nomor_surat, jenis_surat, perihal },
    });

    return apiSuccess(surat, `Surat ${nomor_surat} berhasil diterbitkan.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH']
);
