import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError } from '@/lib/api-auth';

const EMSIFA_BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

/**
 * Backend API Wilayah Indonesia (EMSIFA Kemendagri Standard API + Live PostgreSQL Cache)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'provinces';
  const provId = searchParams.get('provId') || searchParams.get('provCode') || '35';
  const regId = searchParams.get('regId') || searchParams.get('regCode') || '';
  const distId = searchParams.get('distId') || searchParams.get('distCode') || '';

  try {
    // 1. PROVINSI
    if (type === 'provinces') {
      try {
        const res = await fetch(`${EMSIFA_BASE_URL}/provinces.json`, { next: { revalidate: 86400 } } as any);
        if (res.ok) {
          const raw = await res.json();
          const data = raw.map((item: any) => ({
            id: String(item.id),
            name: String(item.name).toUpperCase(),
          }));

          // Async sync to Live DB in background
          Promise.resolve().then(async () => {
            for (const p of data.slice(0, 38)) {
              await prisma.masterProvinsi.upsert({
                where: { kode_provinsi: p.id },
                update: { nama_provinsi: p.name },
                create: { kode_provinsi: p.id, nama_provinsi: p.name },
              }).catch(() => {});
            }
          });

          return NextResponse.json({ success: true, source: 'API Kemendagri EMSIFA Live', data });
        }
      } catch {}

      // DB Cache Query
      const dbProvs = await prisma.masterProvinsi.findMany({ orderBy: { kode_provinsi: 'asc' } });
      const data = dbProvs.map((p: any) => ({ id: p.kode_provinsi, name: p.nama_provinsi }));

      return NextResponse.json({ success: true, source: 'Live PostgreSQL Cache', data });
    }

    // 2. KABUPATEN / KOTA
    if (type === 'regencies') {
      const cleanProvId = provId.replace(/[^0-9]/g, '');
      try {
        const res = await fetch(`${EMSIFA_BASE_URL}/regencies/${cleanProvId || '35'}.json`, { next: { revalidate: 86400 } } as any);
        if (res.ok) {
          const raw = await res.json();
          const data = raw.map((item: any) => ({
            id: String(item.id),
            province_id: String(item.province_id),
            name: String(item.name).toUpperCase(),
          }));

          return NextResponse.json({ success: true, source: 'API Kemendagri EMSIFA Live', data });
        }
      } catch {}

      // DB Cache Query
      const dbRegs = await prisma.masterKabupaten.findMany({
        where: cleanProvId ? { kode_provinsi: cleanProvId } : undefined,
        orderBy: { kode_kabupaten: 'asc' },
      });
      const data = dbRegs.map((r: any) => ({ id: r.kode_kabupaten, province_id: r.kode_provinsi, name: r.nama_kabupaten }));

      return NextResponse.json({ success: true, source: 'Live PostgreSQL Cache', data });
    }

    // 3. KECAMATAN
    if (type === 'districts') {
      const cleanRegId = regId.replace(/[^0-9]/g, '');
      try {
        const res = await fetch(`${EMSIFA_BASE_URL}/districts/${cleanRegId || '3571'}.json`, { next: { revalidate: 86400 } } as any);
        if (res.ok) {
          const raw = await res.json();
          const data = raw.map((item: any) => ({
            id: String(item.id),
            regency_id: String(item.regency_id),
            name: String(item.name).toUpperCase(),
          }));

          return NextResponse.json({ success: true, source: 'API Kemendagri EMSIFA Live', data });
        }
      } catch {}

      // DB Cache Query
      const dbDists = await prisma.masterKecamatan.findMany({
        where: cleanRegId ? { kode_kabupaten: cleanRegId } : undefined,
        orderBy: { kode_kecamatan: 'asc' },
      });
      const data = dbDists.map((d: any) => ({ id: d.kode_kecamatan, regency_id: d.kode_kabupaten, name: d.nama_kecamatan }));

      return NextResponse.json({ success: true, source: 'Live PostgreSQL Cache', data });
    }

    // 4. DESA / KELURAHAN
    if (type === 'villages') {
      const cleanDistId = distId.replace(/[^0-9]/g, '');
      try {
        const res = await fetch(`${EMSIFA_BASE_URL}/villages/${cleanDistId || '3571010'}.json`, { next: { revalidate: 86400 } } as any);
        if (res.ok) {
          const raw = await res.json();
          const data = raw.map((item: any) => ({
            id: String(item.id),
            district_id: String(item.district_id),
            name: String(item.name).toUpperCase(),
          }));

          return NextResponse.json({ success: true, source: 'API Kemendagri EMSIFA Live', data });
        }
      } catch {}

      // DB Cache Query
      const dbVills = await prisma.masterDesa.findMany({
        where: cleanDistId ? { kode_kecamatan: cleanDistId } : undefined,
        orderBy: { kode_desa: 'asc' },
      });
      const data = dbVills.map((v: any) => ({ id: v.kode_desa, district_id: v.kode_kecamatan, name: v.nama_desa }));

      return NextResponse.json({ success: true, source: 'Live PostgreSQL Cache', data });
    }

    // 5. STANDARISASI FORMAT DATA WILAYAH
    if (type === 'format_address') {
      const provName = searchParams.get('prov') || '';
      const regName = searchParams.get('reg') || '';
      const distName = searchParams.get('dist') || '';
      const villageName = searchParams.get('village') || '';

      return NextResponse.json({
        success: true,
        data: {
          provinsi: provName.toUpperCase(),
          kabupaten: regName.toUpperCase(),
          kecamatan: distName.toUpperCase(),
          desa: villageName.toUpperCase(),
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Tipe query wilayah tidak valid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghubungkan ke Server API Wilayah Indonesia.',
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(
  async (request: NextRequest, session) => {
    try {
      const body = await request.json();
      const { action, payload } = body;

      if (action === 'sync_wilayah' && Array.isArray(payload)) {
        let updatedCount = 0;
        for (const item of payload) {
          if (item.kode_provinsi && item.nama_provinsi) {
            await prisma.masterProvinsi.upsert({
              where: { kode_provinsi: item.kode_provinsi },
              update: { nama_provinsi: item.nama_provinsi.toUpperCase() },
              create: { kode_provinsi: item.kode_provinsi, nama_provinsi: item.nama_provinsi.toUpperCase() },
            });
            updatedCount++;
          }
        }
        return apiSuccess(
          { count: updatedCount },
          `Sinkronisasi Master Wilayah Indonesia Berhasil (${updatedCount} data tersimpan di Live PostgreSQL).`
        );
      }

      return apiError('Aksi sinkronisasi wilayah tidak valid.', 400);
    } catch {
      return apiError('Terjadi kesalahan pada server sinkronisasi.', 500);
    }
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
