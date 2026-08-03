import { NextResponse } from 'next/server';
import { simulationDb } from '@darsa/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetInstansi, santriIds, tahunAjaran } = body;

    const instansiKey = targetInstansi?.includes('MI') ? 'MI' : 'MADRASAH';
    const syncedCount = simulationDb.pullSyncSantri(
      instansiKey,
      santriIds || ['0012345678', '0012345679'],
      tahunAjaran || '2025/2026 (Ganjil)'
    );

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan Penarikan Data (Pull Sync) ${syncedCount} Santri dari Pondok Pesantren ke Database Lokal ${targetInstansi || 'Madrasah Diniyah'}.`,
      data: {
        syncedCount,
        sourceInstansi: 'PONDOK',
        targetInstansi: instansiKey,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal melakukan penarikan data santri pada database lokal' },
      { status: 500 }
    );
  }
}
