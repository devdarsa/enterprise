'use client';

import Image from 'next/image';

export default function KuitansiDigitalPage() {
  const kuitansiData = {
    nomor: 'KWT/2026/08/00192',
    tanggal: '03 Agustus 2026',
    diterima_dari: 'Hendra (Wali dari Muhammad Raihan)',
    terbilang: 'Tiga Ratus Lima Puluh Ribu Rupiah',
    untuk_pembayaran: 'SPP Bulan Agustus 2026 - Ma\'had Darussa\'adah Lirboyo Kota Kediri',
    nominal: 'Rp 350.000',
    petugas: 'Ustadz Ahmad Al-Farisi (Bendahara)',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kuitansi Digital Pembayaran</h1>
          <p className="text-xs text-slate-500">Bukti pembayaran sah SPP & Administrasi Pondok/Madrasah/MI</p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <span>🖨️</span> Cetak / Simpan Kuitansi
        </button>
      </div>

      {/* Printable Receipt Card */}
      <div className="p-8 rounded-3xl bg-white border-2 border-emerald-800 shadow-xl space-y-6 text-slate-900 text-xs print:shadow-none print:border-emerald-800">
        
        {/* Receipt Header */}
        <div className="border-b-2 border-emerald-800 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-full border-2 border-gold-500 overflow-hidden shadow-sm shrink-0">
              <Image
                src="/logo-pondok.png"
                alt="Logo Lirboyo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-base font-black text-emerald-900 uppercase">
                MA'HAD DARUSSA'ADAH LIRBOYO KOTA KEDIRI
              </h2>
              <p className="text-[10px] font-bold text-amber-700 uppercase">
                BUKTI PEMBAYARAN SPP RESMI & KUITANSI DIGITAL
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-emerald-900 font-bold block">{kuitansiData.nomor}</span>
            <span className="text-[10px] text-slate-500">{kuitansiData.tanggal}</span>
          </div>
        </div>

        {/* Receipt Body Table */}
        <div className="space-y-3 pt-2">
          <div className="flex border-b border-slate-200 pb-2">
            <span className="w-36 text-slate-500 font-semibold">Telah Diterima Dari:</span>
            <span className="font-bold text-slate-900 flex-1">{kuitansiData.diterima_dari}</span>
          </div>

          <div className="flex border-b border-slate-200 pb-2">
            <span className="w-36 text-slate-500 font-semibold">Uang Sejumlah:</span>
            <span className="font-bold text-emerald-800 italic bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex-1">
              "{kuitansiData.terbilang}"
            </span>
          </div>

          <div className="flex border-b border-slate-200 pb-2">
            <span className="w-36 text-slate-500 font-semibold">Untuk Pembayaran:</span>
            <span className="font-medium text-slate-800 flex-1">{kuitansiData.untuk_pembayaran}</span>
          </div>
        </div>

        {/* Receipt Footer & Total */}
        <div className="flex justify-between items-end pt-6">
          <div className="p-4 rounded-2xl bg-emerald-800 text-white font-mono text-xl font-black shadow-md">
            {kuitansiData.nominal}
          </div>

          <div className="text-center text-[11px]">
            <p className="text-slate-500 mb-12">Kediri, {kuitansiData.tanggal}<br />Bendahara / Kasir</p>
            <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">{kuitansiData.petugas}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
