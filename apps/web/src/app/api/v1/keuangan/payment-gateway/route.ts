import { NextResponse } from 'next/server';
import { simulationDb } from '@darsa/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { santriId, santriNama, bulan, nominal, metode, instansi, tahunAjaran } = body;

    const invoiceId = `INV/SPP/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;
    const vaNumber = metode === 'BCA' ? `88308${santriId || '0012345678'}` : `89008${santriId || '0012345678'}`;

    // Persist new transaction record dynamically in Local Simulation DB
    const newTrx = simulationDb.addTransaksi({
      santri_nisn: santriId || '0012345678',
      santri_nama: santriNama || 'Muhammad Raihan',
      jenis: `SPP_${bulan ? bulan.toUpperCase().replace(/\s+/g, '_') : 'AGUSTUS_2026'}`,
      nominal: nominal || 350000,
      metode: (metode || 'BCA') + '_VA',
      status: 'LUNAS',
      tanggal: '03 Ags 2026',
      instansi: instansi || 'PONDOK',
      tahun_ajaran: tahunAjaran || '2025/2026 (Ganjil)',
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice Pembayaran SPP Berhasil Diterbitkan dan Tersimpan di Database Lokal',
      data: {
        invoiceId: newTrx.id,
        santriId: newTrx.santri_nisn,
        bulan: bulan || 'Agustus 2026',
        nominal: newTrx.nominal,
        metode: newTrx.metode,
        vaNumber,
        qrisPayload: '00020101021226680016ID.CO.MIDTRANS.WWW011893600914000000000002150000000000000003033605802ID5918LIRBOYO DARUSSAADAH6006KEDIRI62070703A01630405A1',
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal memproses payment gateway SPP' },
      { status: 500 }
    );
  }
}
