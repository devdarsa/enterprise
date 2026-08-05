import { NextResponse } from 'next/server';
import { simulationDb } from '@darsa/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'santri';
  const instansi = searchParams.get('instansi') || undefined;
  const tahunAjaran = searchParams.get('tahunAjaran') || undefined;
  const nik = searchParams.get('nik') || undefined;

  if (type === 'santri') {
    const data = simulationDb.getSantri(instansi, tahunAjaran);
    return NextResponse.json({ success: true, data });
  }

  if (type === 'wali_santri') {
    const data = simulationDb.getSantriByNikWali(nik || '3571012304850001');
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

  if (type === 'asrama') {
    const data = simulationDb.getAsrama();
    return NextResponse.json({ success: true, data });
  }

  if (type === 'pengurus') {
    const data = simulationDb.getPengurus();
    return NextResponse.json({ success: true, data });
  }

  if (type === 'alumni') {
    const data = simulationDb.getAlumni();
    return NextResponse.json({ success: true, data });
  }

  if (type === 'pelanggaran') {
    const data = simulationDb.getPelanggaran();
    return NextResponse.json({ success: true, data });
  }

  if (type === 'tahun_ajaran') {
    const data = simulationDb.getTahunAjaran();
    return NextResponse.json({ success: true, data });
  }

  if (type === 'audit_log') {
    const data = simulationDb.getAuditLog();
    return NextResponse.json({ success: true, data });
  }

  if (type === 'recycle_bin') {
    const data = simulationDb.getRecycleBin();
    return NextResponse.json({ success: true, data });
  }

  if (type === 'konfigurasi') {
    const data = simulationDb.getKonfigurasi();
    return NextResponse.json({ success: true, data });
  }

  if (type === 'pengumuman') {
    const target = searchParams.get('target') || undefined;
    const data = simulationDb.getPengumuman(instansi, target);
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
      return NextResponse.json({ success: true, message: 'Data Santri Berhasil Disimpan ke Database', data: record });
    }

    if (action === 'update_santri') {
      const record = simulationDb.updateSantri(id, payload);
      return NextResponse.json({ success: true, message: 'Data Santri Berhasil Diperbarui', data: record });
    }

    if (action === 'delete_santri') {
      simulationDb.deleteSantri(id);
      return NextResponse.json({ success: true, message: 'Data Santri Berhasil Dipindahkan ke Recycle Bin (Soft Delete)' });
    }

    if (action === 'add_guru') {
      const record = simulationDb.addGuru(payload);
      return NextResponse.json({ success: true, message: 'Data Guru Berhasil Disimpan ke Database', data: record });
    }

    if (action === 'delete_guru') {
      simulationDb.deleteGuru(id);
      return NextResponse.json({ success: true, message: 'Data Guru Berhasil Dipindahkan ke Recycle Bin (Soft Delete)' });
    }

    if (action === 'add_surat') {
      const record = simulationDb.addSurat(payload);
      return NextResponse.json({ success: true, message: 'Surat Berhasil Diterbitkan', data: record });
    }

    if (action === 'delete_surat') {
      simulationDb.deleteSurat(id);
      return NextResponse.json({ success: true, message: 'Surat Berhasil Dipindahkan ke Recycle Bin (Soft Delete)' });
    }

    if (action === 'add_asrama') {
      const record = simulationDb.addAsrama(payload);
      return NextResponse.json({ success: true, message: 'Data Kamar Asrama Berhasil Disimpan', data: record });
    }

    if (action === 'add_pengurus') {
      const record = simulationDb.addPengurus(payload);
      return NextResponse.json({ success: true, message: 'Data Pengurus Berhasil Disimpan', data: record });
    }

    if (action === 'add_alumni') {
      const record = simulationDb.addAlumni(payload);
      return NextResponse.json({ success: true, message: 'Data Alumni Berhasil Disimpan', data: record });
    }

    if (action === 'add_pelanggaran') {
      const record = simulationDb.addPelanggaran(payload);
      return NextResponse.json({ success: true, message: 'Pencatatan Pelanggaran Berhasil Disimpan', data: record });
    }

    if (action === 'restore_recycle_bin') {
      simulationDb.restoreRecycleBin(id);
      return NextResponse.json({ success: true, message: 'Data Berhasil Dipulihkan dari Recycle Bin' });
    }

    if (action === 'permanent_delete_recycle_bin') {
      simulationDb.permanentDeleteRecycleBin(id);
      return NextResponse.json({ success: true, message: 'Data Berhasil Dihapus Permanen' });
    }

    if (action === 'update_konfigurasi') {
      const record = simulationDb.updateKonfigurasi(payload);
      return NextResponse.json({ success: true, message: 'Konfigurasi Sistem Berhasil Diperbarui', data: record });
    }

    return NextResponse.json({ success: false, error: 'Aksi simulasi tidak dikenali' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal Server Error pada API Simulasi' }, { status: 500 });
  }
}
