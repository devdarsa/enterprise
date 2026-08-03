import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@darsa/utils';

export async function GET() {
  const sampleTagihan = [
    {
      id: 'TAG-2026-08-01',
      santri_id: 'c7b3a9e0-8f12-4e56-9a2b-3c4d5e6f7a8b',
      nama_santri: 'Muhammad Raihan',
      kelas: '10-A (Tahfidz)',
      judul: 'SPP Bulan Agustus 2026',
      jumlah: 750000,
      status: 'LUNAS',
      jatuh_tempo: '2026-08-10',
      metode_pembayaran: 'QRIS / Midtrans',
    },
    {
      id: 'TAG-2026-08-02',
      santri_id: 'c7b3a9e0-8f12-4e56-9a2b-3c4d5e6f7a8c',
      nama_santri: 'Ahmad Fauzi',
      kelas: '10-A (Tahfidz)',
      judul: 'SPP Bulan Agustus 2026',
      jumlah: 750000,
      status: 'BELUM_BAYAR',
      jatuh_tempo: '2026-08-10',
      metode_pembayaran: null,
    },
    {
      id: 'TAG-2026-08-03',
      santri_id: 'c7b3a9e0-8f12-4e56-9a2b-3c4d5e6f7a8d',
      nama_santri: 'Siti Aminah',
      kelas: '11-B (Sains)',
      judul: 'Biaya Seragam & Kegiatan Tahfidz',
      jumlah: 1250000,
      status: 'MENUNGGU_VERIFIKASI',
      jatuh_tempo: '2026-08-15',
      metode_pembayaran: 'Transfer Bank Mandiri',
    },
  ];

  return NextResponse.json(
    createSuccessResponse(sampleTagihan, 'Daftar tagihan & pembayaran berhasil diambil')
  );
}
