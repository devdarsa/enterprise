'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { LoadingSpinner, SkeletonTable } from '@/components/Loading';

interface Transaksi {
  id: string;
  santri_nisn: string;
  santri_nama: string;
  jenis: string;
  nominal: number;
  metode: string;
  status: string;
  tanggal: string;
  instansi: string;
}

export default function KeuanganPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form & Payment State inside Modal
  const [metode, setMetode] = useState<'bca' | 'mandiri' | 'qris'>('bca');
  const [submitting, setSubmitting] = useState(false);
  const [invoice, setInvoice] = useState<{
    invoiceId: string;
    vaNumber: string;
  } | null>(null);

  // Toast State
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    fetchTransaksi();
  }, [instansiFilter]);

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=transaksi&instansi=${instansiFilter.toUpperCase()}`);
      const json = await res.json();
      setLoading(false);
      if (json.success) {
        setTransaksiList(json.data);
      }
    } catch (err) {
      setLoading(false);
      showToast('error', 'Gagal Memuat Transaksi', 'Terjadi kesalahan koneksi database lokal.');
    }
  };

  const handleProcessPayment = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/keuangan/payment-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          santriId: '0012345678',
          santriNama: 'Muhammad Raihan',
          bulan: 'Agustus 2026',
          nominal: 350000,
          metode: metode.toUpperCase(),
          instansi: instansiFilter.toUpperCase(),
          tahunAjaran: '2025/2026 (Ganjil)',
        }),
      });

      const json = await res.json();
      setSubmitting(false);
      if (json.success) {
        showToast('success', 'Pembayaran SPP Lunas!', `Invoice ${json.data.invoiceId} berhasil diterbitkan.`);
        setInvoice(json.data);
        fetchTransaksi();
      }
    } catch (err) {
      setSubmitting(false);
      showToast('error', 'Gagal Memproses Pembayaran', 'Terjadi kesalahan sistem.');
    }
  };

  const totalNominal = transaksiList.reduce((acc, curr) => acc + (curr.nominal || 0), 0);

  return (
    <div className="space-y-6">
      <Toast
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Keuangan & SPP</h1>
          <p className="text-xs text-slate-500">
            Rekapitulasi arus kas dari Database Lokal per Instansi
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setInvoice(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all inline-flex items-center gap-1.5"
        >
          <span>💳</span> Bayar SPP Online (Pop-Up Modal)
        </button>
      </div>

      {/* Institution Filter Switcher Bar */}
      <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold">
          <span className="text-slate-500 font-semibold">Filter Instansi View:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setInstansiFilter('pondok')}
              className={`px-3 py-1 rounded-lg transition-all ${
                instansiFilter === 'pondok' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              Pondok Pesantren
            </button>
            <button
              type="button"
              onClick={() => setInstansiFilter('madrasah')}
              className={`px-3 py-1 rounded-lg transition-all ${
                instansiFilter === 'madrasah' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              Madrasah Diniyah
            </button>
            <button
              type="button"
              onClick={() => setInstansiFilter('mi')}
              className={`px-3 py-1 rounded-lg transition-all ${
                instansiFilter === 'mi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              MI / Formal
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm">
          <span className="text-slate-500 font-bold block mb-1">Total Kas Terkumpul ({instansiFilter.toUpperCase()})</span>
          <div className="text-2xl font-black text-emerald-800">
            Rp {totalNominal.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">Tercatat di Database Lokal</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm">
          <span className="text-slate-500 font-bold block mb-1">Transaksi Lunas ({instansiFilter.toUpperCase()})</span>
          <div className="text-2xl font-black text-slate-900">{transaksiList.length} Transaksi</div>
          <span className="text-[11px] text-slate-500">Virtual Account & QRIS</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm">
          <span className="text-slate-500 font-bold block mb-1">Status Database</span>
          <div className="text-2xl font-black text-emerald-700">AKTIF</div>
          <span className="text-[11px] text-emerald-800 font-bold">Persistensi Real-Time</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-8">
            <LoadingSpinner label="Mengunduh Transaksi dari Database Lokal..." />
            <SkeletonTable rows={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                  <th className="p-3">ID Transaksi</th>
                  <th className="p-3">Santri</th>
                  <th className="p-3">Jenis Pembayaran</th>
                  <th className="p-3">Nominal</th>
                  <th className="p-3">Metode</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaksiList.map((trx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-emerald-800 font-bold">{trx.id}</td>
                    <td className="p-3 font-bold text-slate-900">{trx.santri_nama}</td>
                    <td className="p-3 text-slate-600 font-medium">{trx.jenis.replace(/_/g, ' ')}</td>
                    <td className="p-3 font-mono font-bold text-emerald-800">Rp {trx.nominal.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-slate-600 font-medium">{trx.metode}</td>
                    <td className="p-3 font-mono text-slate-500">{trx.tanggal}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          trx.status === 'LUNAS'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {trx.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href="/admin/keuangan/kuitansi"
                        className="text-emerald-700 hover:text-emerald-900 font-bold"
                      >
                        Kuitansi 📜
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Premium Pop-Up Modal Payment Gateway Input */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pembayaran SPP Online"
        subtitle={`Instansi ${instansiFilter.toUpperCase()} • Virtual Account & QRIS`}
        icon="💳"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
            <div>
              <span className="block font-bold text-slate-900">Muhammad Raihan (0012345678)</span>
              <span className="block text-slate-500 text-[11px]">Tagihan SPP: Agustus 2026</span>
            </div>
            <span className="text-base font-black text-emerald-800">Rp 350.000</span>
          </div>

          {!invoice ? (
            <div className="space-y-3">
              <label className="block font-bold text-slate-700">Pilih Metode Pembayaran:</label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetode('bca')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    metode === 'bca'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  BCA VA
                </button>
                <button
                  type="button"
                  onClick={() => setMetode('mandiri')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    metode === 'mandiri'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  Mandiri VA
                </button>
                <button
                  type="button"
                  onClick={() => setMetode('qris')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    metode === 'qris'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  QRIS Instan
                </button>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <LoadingSpinner size="sm" /> : 'Proses Pembayaran'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                {invoice.invoiceId}
              </span>

              {metode !== 'qris' ? (
                <div>
                  <span className="block text-slate-500 font-semibold mb-1">Nomor Virtual Account ({metode.toUpperCase()}):</span>
                  <span className="text-xl font-mono font-black text-emerald-800 tracking-wider block bg-white py-2 px-4 rounded-xl border border-emerald-200 w-max mx-auto shadow-inner">
                    {invoice.vaNumber}
                  </span>
                </div>
              ) : (
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border-2 border-emerald-600 flex items-center justify-center font-mono font-bold text-[10px]">
                  [ QRIS GENERATED ]
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/admin/keuangan/kuitansi"
                  className="inline-block w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all"
                >
                  Cetak Kuitansi Digital 📜
                </Link>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
