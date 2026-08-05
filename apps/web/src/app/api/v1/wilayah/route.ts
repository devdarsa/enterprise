import { NextResponse } from 'next/server';
import { simulationDb } from '@darsa/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'provinces';
  const provId = searchParams.get('provId') || searchParams.get('provCode') || '';
  const regId = searchParams.get('regId') || searchParams.get('regCode') || '';
  const distId = searchParams.get('distId') || searchParams.get('distCode') || '';

  try {
    if (type === 'provinces') {
      const data = simulationDb.getProvinces();
      return NextResponse.json({ success: true, data });
    }

    if (type === 'regencies') {
      const data = simulationDb.getRegencies(provId);
      return NextResponse.json({ success: true, data });
    }

    if (type === 'districts') {
      const data = simulationDb.getDistricts(regId);
      return NextResponse.json({ success: true, data });
    }

    if (type === 'villages') {
      const data = simulationDb.getVillages(distId);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Tipe query wilayah tidak dikenali' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data wilayah dari database server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'sync_wilayah') {
      const updatedCount = simulationDb.syncWilayahData(payload || []);
      return NextResponse.json({
        success: true,
        message: `Sinkronisasi Master Wilayah Indonesia Berhasil (${updatedCount} data baru tersimpan di database).`,
        count: updatedCount,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi sinkronisasi wilayah tidak valid' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server sinkronisasi' }, { status: 500 });
  }
}
