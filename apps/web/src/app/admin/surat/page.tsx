'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { LoadingSpinner, SkeletonTable } from '@/components/Loading';

interface Surat {
  id: string;
  nomor: string;
  jenis: string;
  perihal: string;
  pengirim: string;
  penerima: string;
  tanggal: string;
  status: string;
  instansi: string;
}

export default function PersuratanDigitalPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State inside Modal
  const [nomor, setNomor] = useState('SRT/2026/08/005');
  const [santri, setSantri] = useState('Muhammad Raihan');
  const [keperluan, setKeperluan] = useState('Izin Pulang Keperluan Keluarga');
  const [submitting, setSubmitting] = useState(false);

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
    fetchSurat();
  }, [instansiFilter]);

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=surat&instansi=${instansiFilter.toUpperCase()}`);
      const json = await res.json();
      setLoading(false);
      if (json.success) {
        setSuratList(json.data);
      }
    } catch (err) {
      setLoading(false);
      showToast('error', 'Gagal Memuat Surat', 'Terjadi kesalahan koneksi database lokal.');
    }
  };

  const handleAddSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_surat',
          payload: {
            nomor,
            jenis: 'SURAT_IZIN_SANTRI',
            perihal: keperluan,
            pengirim: `Wali Santri ${santri}`,
            penerima: 'Pengasuh Pondok',
            tanggal: '03 Ags 2026',
            status: 'DISETUJUI',
            instansi: instansiFilter.toUpperCase(),
            tahun_ajaran: '2025/2026 (Ganjil)',
          },
        }),
      });

      const json = await res.json();
      setSubmitting(false);
      if (json.success) {
        showToast('success', 'Surat Izin Diterbitkan', `Nomor ${nomor} untuk santri ${santri} berhasil terbit.`);
        fetchSurat();
        setIsModalOpen(false);
      }
    } catch (err) {
      setSubmitting(false);
      showToast('error', 'Gagal Menerbitkan Surat', 'Terjadi kesalahan sistem.');
    }
  };

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
          <h1 className="text-xl font-bold text-slate-900">Persuratan Digital & Perizinan</h1>
          <p className="text-xs text-slate-500">
            Arsip surat masuk, surat keluar, dan izin santri dari Database Lokal per Instansi
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all inline-block"
        >
          + Buat Surat Baru (Pop-Up Modal)
        </button>
      </div>



      {/* Letters Table */}
      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-8">
            <LoadingSpinner label="Mengunduh Data Surat dari Database Lokal..." />
            <SkeletonTable rows={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                  <th className="p-3">Nomor Surat</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Perihal / Subjek</th>
                  <th className="p-3">Pengirim</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suratList.map((surat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-emerald-800 font-bold">{surat.nomor}</td>
                    <td className="p-3 text-slate-800 font-bold">{surat.jenis.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-slate-900 font-medium">{surat.perihal}</td>
                    <td className="p-3 text-slate-600">{surat.pengirim}</td>
                    <td className="p-3 font-mono text-slate-600">{surat.tanggal}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {surat.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button className="text-slate-500 hover:text-emerald-700 font-bold">Unduh PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Premium Pop-Up Modal Form Input */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generator Surat Izin Santri"
        subtitle={`Instansi ${instansiFilter.toUpperCase()} • Lirboyo Kota Kediri`}
        icon="✉️"
      >
        <form onSubmit={handleAddSurat} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Surat Resmi</label>
            <input
              type="text"
              required
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Santri Yang Diberi Izin</label>
            <input
              type="text"
              required
              value={santri}
              onChange={(e) => setSantri(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alasan / Keperluan Izin</label>
            <input
              type="text"
              required
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
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
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Terbitkan Surat Izin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
