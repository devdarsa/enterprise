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
    try {
      const body = await req.json();
      const { nomor_surat, jenis_surat, perihal, pengirim, penerima, tanggal, file_url, keterangan } = body;

      if (!nomor_surat || !perihal) {
        return apiError('Nomor surat dan perihal wajib diisi.', 400);
      }

      let defaultPondok = await prisma.pondok.findFirst();
      if (!defaultPondok) {
        defaultPondok = await prisma.pondok.create({
          data: { nama: "Pondok Pesantren Darussa'adah Lirboyo" },
        });
      }

      // Cek duplikasi nomor surat
      const existing = await prisma.surat.findFirst({ where: { nomor_surat } });
      if (existing) return apiError(`Nomor surat ${nomor_surat} sudah terdaftar.`, 409);

      const validJenisList = Object.values(JenisSurat);
      const normalizedJenis: JenisSurat = validJenisList.includes(jenis_surat as any)
        ? (jenis_surat as JenisSurat)
        : JenisSurat.SURAT_IZIN_SANTRI;

      const surat = await prisma.surat.create({
        data: {
          pondok_id: defaultPondok.id,
          nomor_surat,
          jenis_surat: normalizedJenis,
          perihal,
          pengirim: pengirim || session.user.name || session.user.email,
          penerima: penerima || 'Sekretariat Utama',
          tanggal: tanggal ? new Date(tanggal) : new Date(),
          file_url: file_url || null,
          keterangan: keterangan || null,
        },
      });

      await logAudit({
        userId: session.user.id,
        action: 'CREATE_SURAT',
        entityType: 'Surat',
        entityId: surat.id,
        metadata: { nomor_surat, jenis_surat: normalizedJenis, perihal },
      });

      return apiSuccess(surat, `Surat ${nomor_surat} berhasil diterbitkan.`);
    } catch (err: any) {
      console.error('[POST /api/v1/surat Error]:', err);
      return apiError(err?.message || 'Gagal menerbitkan surat.', 500);
    }
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'GURU']
);
