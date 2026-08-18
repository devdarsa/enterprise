import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { no_kk, nama_ayah } = body;

    const cleanKK = String(no_kk || '').trim();
    const cleanNamaAyah = String(nama_ayah || '').trim();

    if (!cleanKK || cleanKK.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Nomor Kartu Keluarga (KK) wajib diisi dengan benar (16 digit).' },
        { status: 400 }
      );
    }

    if (!cleanNamaAyah || cleanNamaAyah.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Nama Ayah sesuai pada Kartu Keluarga (KK) wajib diisi.' },
        { status: 400 }
      );
    }

    // Cari santri yang memiliki Nomor KK ini di Database Pondok
    let santriList = await prisma.santri.findMany({
      where: {
        OR: [
          { no_kk: cleanKK },
          { nik_wali: cleanKK },
        ],
        deleted_at: null,
      },
      include: {
        kelas: { select: { nama_kelas: true } },
      },
      orderBy: { nama_lengkap: 'asc' },
    });

    // Jika belum ditemukan dengan no_kk langsung, coba cari berdasarkan nik_wali atau nama wali
    if (santriList.length === 0) {
      santriList = await prisma.santri.findMany({
        where: {
          nama_wali: { contains: cleanNamaAyah, mode: 'insensitive' },
          deleted_at: null,
        },
        include: {
          kelas: { select: { nama_kelas: true } },
        },
      });
    }

    if (santriList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Data santri dengan Nomor KK "${cleanKK}" atau Nama Ayah "${cleanNamaAyah}" tidak ditemukan pada Database Pondok. Pastikan santri telah terdaftar di Sekretariat Pondok.`,
        },
        { status: 404 }
      );
    }

    // Filter atau cocokkan nama wali jika santri banyak
    const matchedFatherName = santriList[0].nama_wali || cleanNamaAyah;
    const resolvedKK = santriList[0].no_kk || cleanKK;

    const mappedChildren = santriList.map((s) => ({
      id: s.id,
      nama_lengkap: s.nama_lengkap,
      nisp: s.nisp,
      nik: s.nik || '-',
      kelas: s.kelas?.nama_kelas || s.jenjang || 'Pondok Pesantren',
      status: s.status,
      hafalan_juz: s.hafalan_juz || 0,
      kamar: s.kamar || 'Asrama Utama',
    }));

    return NextResponse.json({
      success: true,
      no_kk: resolvedKK,
      nama_ayah: matchedFatherName,
      total_anak: mappedChildren.length,
      santri_list: mappedChildren,
      message: `Ditemukan ${mappedChildren.length} santri yang terdaftar dalam KK ini.`,
    });
  } catch (error: any) {
    console.error('Check KK error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat memeriksa data KK.' },
      { status: 500 }
    );
  }
}
