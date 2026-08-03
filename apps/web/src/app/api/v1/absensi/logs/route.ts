import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@darsa/utils';

export async function GET() {
  const sampleLogs = [
    {
      id: 'ABS-1001',
      nama_santri: 'Muhammad Raihan',
      kelas: '10-A (Tahfidz)',
      status: 'HADIR',
      waktu: '06:45:12 WIB',
      distance_meters: 28,
      lokasi: 'Gerbang Utama',
    },
    {
      id: 'ABS-1002',
      nama_santri: 'Ahmad Fauzi',
      kelas: '10-A (Tahfidz)',
      status: 'HADIR',
      waktu: '06:50:44 WIB',
      distance_meters: 45,
      lokasi: 'Gerbang Utama',
    },
    {
      id: 'ABS-1003',
      nama_santri: 'Siti Aminah',
      kelas: '11-B (Sains)',
      status: 'TERLAMBAT',
      waktu: '07:15:02 WIB',
      distance_meters: 62,
      lokasi: 'Gerbang Utama',
    },
  ];

  return NextResponse.json(
    createSuccessResponse(sampleLogs, 'Daftar riwayat presensi berhasil diambil', {
      page: 1,
      limit: 20,
      total: 3,
      total_pages: 1,
    })
  );
}
