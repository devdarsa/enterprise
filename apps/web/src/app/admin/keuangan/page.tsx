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

interface SantriOption {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  instansi: string;
}

export default function KeuanganPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [santriOptions, setSantriOptions] = useState<SantriOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Flexible Payment Configuration
  const [selectedSantriNisn, setSelectedSantriNisn] = useState('');
  const [customNama, setCustomNama] = useState('');
  const [jenisPembayaran, setJenisPembayaran] = useState('SPP_BULANAN');
  const [periodeBulan, setPeriodeBulan] = useState('Agustus 2026');
  const [nominal, setNominal] = useState<number>(350000);
  const [metode, setMetode] = useState<'bca' | 'mandiri' | 'bri' | 'qris' | 'tunai'>('bca');
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
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        if (s.instansi) {
          const inst = s.instansi.toLowerCase() as 'pondok' | 'madrasah' | 'mi';
          if (['pondok', 'madrasah', 'mi'].includes(inst)) {
            setInstansiFilter(inst);
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchTransaksi();
    fetchSantriOptions();
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

  const fetchSantriOptions = async () => {
    try {
      const res = await fetch(`/api/v1/simulation/data?type=santri&instansi=${instansiFilter.toUpperCase()}`);
      const json = await res.json();
      if (json.success) {
        setSantriOptions(json.data);
        if (json.data.length > 0) {
          setSelectedSantriNisn(json.data[0].nisn);
          setCustomNama(json.data[0].nama);
        }
      }
    } catch {}
  };

  const handleSantriChange = (nisn: string) => {
    setSelectedSantriNisn(nisn);
    const found = santriOptions.find(s => s.nisn === nisn);
    if (found) {
      setCustomNama(found.nama);
    }
  };

  const handlePresetNominal = (amount: number) => {
    setNominal(amount);
  };

  const handleProcessPayment = async () => {
    if (!customNama.trim()) {
      showToast('warning', 'Data Kurang Lengkap', 'Pilih atau isi nama santri terlebih dahulu.');
      return;
    }
    if (nominal <= 0) {
      showToast('warning', 'Nominal Tidak Valid', 'Nominal pembayaran harus lebih besar dari Rp 0.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/keuangan/payment-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          santriId: selectedSantriNisn || '0012345678',
          santriNama: customNama,
          bulan: `${jenisPembayaran.replace(/_/g, ' ')} - ${periodeBulan}`,
          nominal: Number(nominal),
          metode: metode.toUpperCase(),
          instansi: instansiFilter.toUpperCase(),
          tahunAjaran: '2025/2026 (Ganjil)',
        }),
      });

      const json = await res.json();
      setSubmitting(false);
      if (json.success) {
        showToast('success', 'Pembayaran Lunas!', `Invoice ${json.data.invoiceId} berhasil diterbitkan.`);
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
          <h1 className="text-xl font-bold text-slate-900">Manajemen Keuangan & Setting Pembayaran</h1>
          <p className="text-xs text-slate-500">
            Pengaturan nominal tagihan per kelas/santri & rekapitulasi arus kas Database
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setInvoice(null);
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 shrink-0"
        >
          <span>💳</span> Buat & Atur Pembayaran Baru
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-slate-500 font-bold block mb-1">Total Kas Terkumpul ({instansiFilter.toUpperCase()})</span>
          <span className="text-2xl font-black text-emerald-800 font-mono">Rp {totalNominal.toLocaleString('id-ID')}</span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-2">Terhubung ke Database Neon PostgreSQL</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-slate-500 font-bold block mb-1">Transaksi Lunas ({instansiFilter.toUpperCase()})</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{transaksiList.length} Transaksi</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-2">Terverifikasi Otomatis</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-slate-500 font-bold block mb-1">Status Gateway</span>
          <span className="text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl w-fit">
            ● Virtual Account & QRIS Active
          </span>
          <span className="text-[10px] text-slate-400 font-semibold mt-2">Realtime Webhook Enabled</span>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-8">
            <LoadingSpinner label="Mengunduh Transaksi dari Database..." />
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

      {/* Flexible Payment Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pengaturan & Transaksi Pembayaran"
        subtitle={`Instansi ${instansiFilter.toUpperCase()} • Kustomisasi Nominal per Santri/Kelas`}
        icon="💳"
      >
        <div className="space-y-4 text-xs">
          {/* Santri Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Santri Terdaftar:</label>
            {santriOptions.length > 0 ? (
              <select
                value={selectedSantriNisn}
                onChange={(e) => handleSantriChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                {santriOptions.map((s) => (
                  <option key={s.id} value={s.nisn}>
                    {s.nama} — NISN: {s.nisn} ({s.kelas})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Masukkan Nama Santri..."
                value={customNama}
                onChange={(e) => setCustomNama(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            )}
          </div>

          {/* Jenis Pembayaran */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Pembayaran:</label>
              <select
                value={jenisPembayaran}
                onChange={(e) => setJenisPembayaran(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
              >
                <option value="SPP_BULANAN">SPP Bulanan</option>
                <option value="SYAHRIAH_MAKAN">Syahriah & Uang Makan</option>
                <option value="UANG_GEDUNG">Uang Gedung & Bangunan</option>
                <option value="KITAB_SERAGAM">Uang Kitab & Seragam</option>
                <option value="KEGIATAN_EKSKUL">Kegiatan & Ekstrakulikuler</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Periode / Bulan:</label>
              <select
                value={periodeBulan}
                onChange={(e) => setPeriodeBulan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
              >
                <option value="Agustus 2026">Agustus 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="Oktober 2026">Oktober 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="Desember 2026">Desember 2026</option>
              </select>
            </div>
          </div>

          {/* Custom Nominal Setting */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold text-slate-700">Nominal Pembayaran (Rp):</label>
              <span className="text-[10px] text-slate-500 font-medium">Bisa Diatur Kustom</span>
            </div>
            <input
              type="number"
              value={nominal}
              onChange={(e) => setNominal(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black text-base focus:outline-none focus:border-emerald-600"
            />
            {/* Quick Preset Badges */}
            <div className="flex gap-1.5 mt-2">
              {[
                { label: 'Rp 200rb (Beasiswa)', val: 200000 },
                { label: 'Rp 350rb (Reguler)', val: 350000 },
                { label: 'Rp 450rb (Tahfidz)', val: 450000 },
                { label: 'Rp 600rb (Full Boarding)', val: 600000 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => handlePresetNominal(p.val)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    nominal === p.val
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {!invoice ? (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-700">Metode Pembayaran:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'bca', label: 'BCA VA' },
                  { key: 'mandiri', label: 'Mandiri VA' },
                  { key: 'bri', label: 'BRI VA' },
                  { key: 'qris', label: 'QRIS Instan' },
                  { key: 'tunai', label: '💵 Tunai / Kasir' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMetode(m.key as any)}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      metode === m.key
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 flex gap-3">
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
                  {submitting ? <LoadingSpinner size="sm" /> : 'Proses & Terbitkan Tagihan'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
              <div className="text-3xl">✅</div>
              <h4 className="font-bold text-emerald-900 text-sm">Invoice Pembayaran Berhasil Diterbitkan!</h4>
              <p className="text-xs text-slate-600 font-mono">Invoice ID: {invoice.invoiceId}</p>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 font-mono font-black text-emerald-800 text-base">
                {invoice.vaNumber}
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-all"
              >
                Tutup Modal
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
