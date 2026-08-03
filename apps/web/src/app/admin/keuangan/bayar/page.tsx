'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BayarSPPPage() {
  const [metode, setMetode] = useState<'bca' | 'mandiri' | 'qris'>('bca');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<{
    invoiceId: string;
    vaNumber: string;
    qrisPayload: string;
  } | null>(null);

  const handleGenerateInvoice = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/keuangan/payment-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          santriId: '0012345678',
          bulan: 'Agustus 2026',
          nominal: 350000,
          metode: metode.toUpperCase(),
        }),
      });

      const json = await res.json();
      setLoading(false);
      if (json.success) {
        setInvoice(json.data);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">💳 Pembayaran SPP Online</h1>
          <p className="text-xs text-slate-500">Transaksi SPP via Virtual Account & QRIS Instan</p>
        </div>
        <Link
          href="/admin/keuangan"
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
        >
          ← Kembali ke Keuangan
        </Link>
      </div>

      {/* Invoice Detail Card */}
      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm space-y-6">
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex justify-between items-center text-xs">
          <div>
            <span className="block text-slate-500 font-semibold">Santri:</span>
            <span className="font-bold text-slate-900 text-sm">Muhammad Raihan (NISN: 0012345678)</span>
            <span className="block text-slate-500 mt-0.5 font-medium">Tagihan SPP: Agustus 2026</span>
          </div>
          <div className="text-right">
            <span className="block text-slate-500 font-semibold">Total Tagihan:</span>
            <span className="text-lg font-black text-emerald-800">Rp 350.000</span>
          </div>
        </div>

        {/* Method Selector */}
        {!invoice ? (
          <div className="space-y-4 text-xs">
            <label className="block font-bold text-slate-700">Pilih Metode Pembayaran:</label>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMetode('bca')}
                className={`p-4 rounded-xl border text-center font-bold transition-all ${
                  metode === 'bca'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                BCA Virtual Account
              </button>
              <button
                type="button"
                onClick={() => setMetode('mandiri')}
                className={`p-4 rounded-xl border text-center font-bold transition-all ${
                  metode === 'mandiri'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Mandiri VA
              </button>
              <button
                type="button"
                onClick={() => setMetode('qris')}
                className={`p-4 rounded-xl border text-center font-bold transition-all ${
                  metode === 'qris'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                QRIS (BCA/GoPay/OVO)
              </button>
            </div>

            <button
              type="button"
              onClick={handleGenerateInvoice}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all mt-4"
            >
              {loading ? 'Menerbitkan Kode Kode Bayar...' : 'Proses Pembayaran Sekarang'}
            </button>
          </div>
        ) : (
          /* Invoice Code Display */
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
              {invoice.invoiceId}
            </span>

            {metode !== 'qris' ? (
              <div>
                <span className="block text-slate-500 font-semibold mb-1">Nomor Virtual Account ({metode.toUpperCase()}):</span>
                <span className="text-2xl font-mono font-black text-emerald-800 tracking-wider block bg-white py-3 px-6 rounded-xl border border-emerald-200 w-max mx-auto shadow-inner">
                  {invoice.vaNumber}
                </span>
                <p className="text-slate-500 mt-2">Transfer tepat Rp 350.000 sebelum 24 jam</p>
              </div>
            ) : (
              <div>
                <span className="block text-slate-500 font-semibold mb-2">Scan Kode QRIS Pembayaran:</span>
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-emerald-600 shadow-md flex items-center justify-center font-mono font-bold text-[10px] text-slate-800">
                  [ QRIS CODE GENERATED ]
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-center gap-3">
              <Link
                href="/admin/keuangan/kuitansi"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
              >
                Cetak Kuitansi Digital 📜
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
