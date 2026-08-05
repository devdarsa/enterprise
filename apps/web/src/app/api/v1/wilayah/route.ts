import { NextResponse } from 'next/server';
import { prisma } from '@darsa/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'provinces';
  const provId = searchParams.get('provId') || searchParams.get('provCode') || '';
  const regId = searchParams.get('regId') || searchParams.get('regCode') || '';
  const distId = searchParams.get('distId') || searchParams.get('distCode') || '';

  try {
    if (type === 'provinces') {
      const provinces = await prisma.masterProvinsi.findMany({
        orderBy: { kode_provinsi: 'asc' },
      });

      const data = provinces.length > 0
        ? provinces.map((p) => ({ id: p.kode_provinsi, name: p.nama_provinsi }))
        : [
            { id: '35', name: 'JAWA TIMUR' },
            { id: '31', name: 'DKI JAKARTA' },
            { id: '32', name: 'JAWA BARAT' },
            { id: '33', name: 'JAWA TENGAH' },
          ];

      return NextResponse.json({ success: true, data });
    }

    if (type === 'regencies') {
      const regencies = await prisma.masterKabupaten.findMany({
        where: provId ? { kode_provinsi: provId } : undefined,
        orderBy: { kode_kabupaten: 'asc' },
      });

      const data = regencies.length > 0
        ? regencies.map((r) => ({ id: r.kode_kabupaten, province_id: r.kode_provinsi, name: r.nama_kabupaten }))
        : [
            { id: '35.71', province_id: '35', name: 'KOTA KEDIRI' },
            { id: '35.06', province_id: '35', name: 'KABUPATEN KEDIRI' },
          ];

      return NextResponse.json({ success: true, data });
    }

    if (type === 'districts') {
      const districts = await prisma.masterKecamatan.findMany({
        where: regId ? { kode_kabupaten: regId } : undefined,
        orderBy: { kode_kecamatan: 'asc' },
      });

      const data = districts.length > 0
        ? districts.map((d) => ({ id: d.kode_kecamatan, regency_id: d.kode_kabupaten, name: d.nama_kecamatan }))
        : [
            { id: '35.71.01', regency_id: '35.71', name: 'MOJOROTO' },
            { id: '35.71.02', regency_id: '35.71', name: 'KOTA' },
          ];

      return NextResponse.json({ success: true, data });
    }

    if (type === 'villages') {
      const villages = await prisma.masterDesa.findMany({
        where: distId ? { kode_kecamatan: distId } : undefined,
        orderBy: { kode_desa: 'asc' },
      });

      const data = villages.length > 0
        ? villages.map((v) => ({ id: v.kode_desa, district_id: v.kode_kecamatan, name: v.nama_desa }))
        : [
            { id: '35.71.01.1001', district_id: '35.71.01', name: 'LIRBOYO' },
            { id: '35.71.01.1002', district_id: '35.71.01', name: 'BANDAR LOR' },
          ];

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Tipe query wilayah tidak dikenali' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data wilayah dari database.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'sync_wilayah' && Array.isArray(payload)) {
      let updatedCount = 0;
      for (const item of payload) {
        if (item.kode_provinsi && item.nama_provinsi) {
          await prisma.masterProvinsi.upsert({
            where: { kode_provinsi: item.kode_provinsi },
            update: { nama_provinsi: item.nama_provinsi },
            create: { kode_provinsi: item.kode_provinsi, nama_provinsi: item.nama_provinsi },
          });
          updatedCount++;
        }
      }
      return NextResponse.json({
        success: true,
        message: `Sinkronisasi Master Wilayah Indonesia Berhasil (${updatedCount} data tersimpan di PostgreSQL).`,
        count: updatedCount,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi sinkronisasi wilayah tidak valid' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server sinkronisasi' }, { status: 500 });
  }
}
