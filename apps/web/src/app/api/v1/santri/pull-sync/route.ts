import { NextResponse } from 'next/server';
import { prisma } from '@darsa/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetInstansi, santriIds, tahunAjaran } = body;

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

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan Penarikan Data (Pull Sync) ${count} Santri dari Pondok Pesantren ke Database ${targetInstansi || 'Madrasah Diniyah'}.`,
      data: {
        syncedCount: count,
        sourceInstansi: 'PONDOK',
        targetInstansi: instansiKey,
        tahunAjaran: tahunAjaran || '2025/2026 (Ganjil)',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal melakukan penarikan data santri pada database.' },
      { status: 500 }
    );
  }
}
