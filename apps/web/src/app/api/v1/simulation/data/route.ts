import { NextResponse } from 'next/server';
import { simulationDb } from '@darsa/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'santri';
  const instansi = searchParams.get('instansi') || undefined;
  const tahunAjaran = searchParams.get('tahunAjaran') || undefined;

  if (type === 'santri') {
    const data = simulationDb.getSantri(instansi, tahunAjaran);
    return NextResponse.json({ success: true, data });
  }

  if (type === 'guru') {
    const data = simulationDb.getGuru(instansi, tahunAjaran);
    return NextResponse.json({ success: true, data });
  }

  if (type === 'surat') {
    const data = simulationDb.getSurat(instansi, tahunAjaran);
    return NextResponse.json({ success: true, data });
  }

  if (type === 'transaksi') {
    const data = simulationDb.getTransaksi(instansi, tahunAjaran);
    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({ success: false, error: 'Tipe data simulasi tidak valid' }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'add_santri') {
      const record = simulationDb.addSantri(payload);
      return NextResponse.json({ success: true, message: 'Data Santri Berhasil Disimpan ke Database Lokal', data: record });
    }

    if (action === 'add_guru') {
      const record = simulationDb.addGuru(payload);
      return NextResponse.json({ success: true, message: 'Data Guru Berhasil Disimpan ke Database Lokal', data: record });
    }

    if (action === 'add_surat') {
      const record = simulationDb.addSurat(payload);
      return NextResponse.json({ success: true, message: 'Surat Berhasil Diterbitkan dan Disimpan ke Database Lokal', data: record });
    }

    if (action === 'add_transaksi') {
      const record = simulationDb.addTransaksi(payload);
      return NextResponse.json({ success: true, message: 'Transaksi SPP Berhasil Disimpan ke Database Lokal', data: record });
    }

    return NextResponse.json({ success: false, error: 'Aksi mutasi simulasi tidak dikenali' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal memproses data simulasi' }, { status: 500 });
  }
}
