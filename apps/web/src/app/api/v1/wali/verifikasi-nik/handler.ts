import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';

// GET /api/v1/wali/verifikasi-nik?nik=xxx
// Digunakan saat self-registration Wali Santri untuk verifikasi NIK ke database
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nik = searchParams.get('nik');

  if (!nik || nik.length < 16) {
    return NextResponse.json({
      success: false,
      error: 'NIK tidak valid. Harus 16 digit.',
    }, { status: 400 });
  }

  try {
    // Cari santri yang NIK walinya cocok
    const santriList = await prisma.santri.findMany({
      where: { nik_wali: nik, deleted_at: null },
      select: {
        id: true,
        nisp: true,
        nama_lengkap: true,
        jenjang: true,
        kelas: { select: { nama_kelas: true } },
      },
    });

    if (santriList.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'NIK tidak terdaftar pada Database Pondok.',
        data: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: santriList,
      message: `NIK ditemukan. Terhubung dengan ${santriList.length} santri.`,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan server.',
    }, { status: 500 });
  }
}
