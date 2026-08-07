import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit, RouteContext } from '@/lib/api-auth';

/**
 * POST /api/v1/santri/[id]/mutasi
 * Body: { tipe, alasan, tanggal_efektif }
 *
 * tipe:
 *  PONDOK:   BOYONG | CUTI
 *  MADRASAH: PINDAH | LULUS
 *  PURGE:    hapus permanen (disimpan di audit log)
 */
export const POST = withAuth(
  async (req: NextRequest, session, context?: RouteContext) => {
    const paramsResolved = (context && typeof context === 'object' && 'params' in context && context.params)
      ? await (context.params as Promise<{ id: string }>)
      : undefined;
    const id = paramsResolved?.id || req.url.split('/').slice(-2)[0];

    const existing = await prisma.santri.findFirst({ where: { id, deleted_at: null } });
    if (!existing) return apiError('Data santri tidak ditemukan.', 404);

    const body = await req.json();
    const { tipe, alasan, tanggal_efektif } = body;

    const validTypes = ['BOYONG', 'CUTI', 'PINDAH', 'LULUS', 'PURGE'];
    if (!validTypes.includes(tipe)) {
      return apiError(`Tipe mutasi tidak valid. Pilihan: ${validTypes.join(', ')}`);
    }

    // Map tipe → status santri baru
    const statusMap: Record<string, string> = {
      BOYONG: 'BOYONG',
      CUTI:   'CUTI',
      PINDAH: 'PINDAH',
      LULUS:  'LULUS',
      PURGE:  'BOYONG', // akan di-delete setelah log
    };

    const tanggal = tanggal_efektif ? new Date(tanggal_efektif) : new Date();

    if (tipe === 'PURGE') {
      // Hard delete (masuk ke Recycle Bin via soft-delete)
      await prisma.santri.update({
        where: { id },
        data: { deleted_at: tanggal },
      });

      await logAudit({
        userId: session.user.id,
        action: 'PURGE_SANTRI',
        entityType: 'Santri',
        entityId: id,
        metadata: {
          nisp: existing.nisp,
          nama: existing.nama_lengkap,
          alasan: alasan || 'Tidak disebutkan',
          tanggal_efektif: tanggal.toISOString(),
        },
      });

      return apiSuccess(null, `Data ${existing.nama_lengkap} dipindahkan ke Recycle Bin.`);
    }

    // Update status santri
    const updated = await prisma.santri.update({
      where: { id },
      data: { status: statusMap[tipe] as any },
    });

    await logAudit({
      userId: session.user.id,
      action: `MUTASI_${tipe}`,
      entityType: 'Santri',
      entityId: id,
      metadata: {
        nisp: existing.nisp,
        nama: existing.nama_lengkap,
        tipe,
        alasan: alasan || 'Tidak disebutkan',
        tanggal_efektif: tanggal.toISOString(),
        status_lama: existing.status,
        status_baru: statusMap[tipe],
      },
    });

    const labels: Record<string, string> = {
      BOYONG: 'Boyong (keluar permanen dari pondok)',
      CUTI:   'Cuti sementara dari pondok',
      PINDAH: 'Pindah ke unit/madrasah lain',
      LULUS:  'Lulus / tamat dari madrasah',
    };

    return apiSuccess(updated, `Mutasi ${labels[tipe]} untuk ${existing.nama_lengkap} berhasil dicatat.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
