'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';

interface ArsipItem {
  id: string;
  kodeArsip: string;
  kategori: string;
  judul: string;
  tahunAjaran: string;
  tanggalArsip: string;
  fileSize: string;
}

export default function ArsipHistorisPage() {
  const [list, setList] = useState<ArsipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    async function fetchArsipLive() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/surat');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped = json.data.map((s: any) => ({
              id: s.id,
              kodeArsip: s.nomor_surat || `ARSIP-${s.id.substring(0, 8)}`,
              kategori: s.jenis_surat || 'Dokumen Resmi',
              judul: s.perihal || 'Dokumen Pesantren',
              tahunAjaran: '2025/2026',
              tanggalArsip: s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID') : '01 Jan 2026',
              fileSize: '1.2 MB',
            }));
            setList(mapped);
          }
        }
      } catch (e) {
        console.error('Gagal memuat arsip:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchArsipLive();
  }, []);

  const filtered = list.filter((a) => a.judul.toLowerCase().includes(search.toLowerCase()) || a.kodeArsip.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS
          </span>
          <h1 className="text-xl font-black text-slate-900">Arsip Historis Pesantren</h1>
          <p className="text-xs text-slate-500 font-medium">
            Penyimpanan Dokumen & Data Akademik Historis Non-Aktif
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari judul dokumen atau kode arsip..." />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">Memuat arsip dari database...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400">Belum ada arsip historis tercatat di database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Kode Arsip</th>
                  <th className="p-3.5">Judul Dokumen</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Tahun Ajaran</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono text-slate-600">{item.kodeArsip}</td>
                    <td className="p-3.5 font-bold text-slate-900">{item.judul}</td>
                    <td className="p-3.5 text-slate-600">{item.kategori}</td>
                    <td className="p-3.5 text-slate-600">{item.tahunAjaran}</td>
                    <td className="p-3.5 text-slate-600">{item.tanggalArsip}</td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => showToast('info', 'Unduh Arsip', item.judul)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200 transition-all"
                      >
                        📥 Unduh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
