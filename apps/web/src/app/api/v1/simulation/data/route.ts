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

  if (type === 'inventaris') {
    const data = simulationDb.getInventaris(instansi);
    return NextResponse.json({ success: true, data });
  }

  if (type === 'jadwal') {
    const data = simulationDb.getJadwal(instansi);
    return NextResponse.json({ success: true, data });
  }

  if (type === 'setoran') {
    const data = simulationDb.getSetoran(instansi);
    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({ success: false, error: 'Tipe data simulasi tidak valid' }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload, id } = body;

    if (action === 'add_santri') {
      const record = simulationDb.addSantri(payload);
      return NextResponse.json({ success: true, message: 'Data Santri Berhasil Disimpan ke Database Lokal', data: record });
    }

    if (action === 'delete_santri') {
      simulationDb.deleteSantri(id);
      return NextResponse.json({ success: true, message: 'Data Santri Berhasil Dihapus' });
    }

    if (action === 'add_guru') {
      const record = simulationDb.addGuru(payload);
      return NextResponse.json({ success: true, message: 'Data Guru Berhasil Disimpan ke Database Lokal', data: record });
    }

    if (action === 'delete_guru') {
      simulationDb.deleteGuru(id);
      return NextResponse.json({ success: true, message: 'Data Guru Berhasil Dihapus' });
    }

    if (action === 'add_surat') {
      const record = simulationDb.addSurat(payload);
      return NextResponse.json({ success: true, message: 'Surat Berhasil Diterbitkan', data: record });
    }

    if (action === 'delete_surat') {
      simulationDb.deleteSurat(id);
      return NextResponse.json({ success: true, message: 'Surat Berhasil Dihapus' });
    }

    if (action === 'add_transaksi') {
      const record = simulationDb.addTransaksi(payload);
      return NextResponse.json({ success: true, message: 'Transaksi SPP Berhasil Disimpan', data: record });
    }

    if (action === 'add_inventaris') {
      const record = simulationDb.addInventaris(payload);
      return NextResponse.json({ success: true, message: 'Data Inventaris Berhasil Disimpan', data: record });
    }

    if (action === 'delete_inventaris') {
      simulationDb.deleteInventaris(id);
      return NextResponse.json({ success: true, message: 'Data Inventaris Berhasil Dihapus' });
    }

    if (action === 'add_jadwal') {
      const record = simulationDb.addJadwal(payload);
      return NextResponse.json({ success: true, message: 'Slot Jadwal Berhasil Disimpan', data: record });
    }

    if (action === 'delete_jadwal') {
      simulationDb.deleteJadwal(id);
      return NextResponse.json({ success: true, message: 'Slot Jadwal Berhasil Dihapus' });
    }

    if (action === 'add_setoran') {
      const record = simulationDb.addSetoran(payload);
      return NextResponse.json({ success: true, message: 'Setoran Tahfidz Berhasil Disimpan', data: record });
    }

    return NextResponse.json({ success: false, error: 'Aksi mutasi simulasi tidak dikenali' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal memproses data simulasi' }, { status: 500 });
  }
}
