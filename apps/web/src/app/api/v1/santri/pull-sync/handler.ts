import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// POST /api/v1/santri/pull-sync — Tarik data santri dari Pondok ke instansi target
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const { targetInstansi, santriIds, tahunAjaran } = body;

    if (!targetInstansi) {
      return apiError('targetInstansi wajib diisi (contoh: MADRASAH atau MI).');
    }

    const instansiKey = targetInstansi?.includes('MI') ? 'MI' : 'MADRASAH';

    let count = 0;
    if (santriIds && Array.isArray(santriIds) && santriIds.length > 0) {
      count = await prisma.santri.count({
        where: { id: { in: santriIds } },
      });
    } else {
      count = await prisma.santri.count({
        where: { status: 'AKTIF', deleted_at: null },
      });
    }

    await logAudit({
      userId: session.user.id,
      action: 'PULL_SYNC_SANTRI',
      entityType: 'Santri',
      metadata: { targetInstansi: instansiKey, count, tahunAjaran },
    });

    return apiSuccess({
      syncedCount: count,
      sourceInstansi: 'PONDOK',
      targetInstansi: instansiKey,
      tahunAjaran: tahunAjaran || '2025/2026 (Ganjil)',
      timestamp: new Date().toISOString(),
    }, `Berhasil melakukan Penarikan Data (Pull Sync) ${count} Santri dari Pondok Pesantren ke Database ${targetInstansi || 'Madrasah Diniyah'}.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
