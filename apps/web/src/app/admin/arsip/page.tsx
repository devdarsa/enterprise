'use client';

import { useState } from 'react';
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

const INITIAL_ARSIP: ArsipItem[] = [
  { id: '1', kodeArsip: 'ARSIP-2024-001', kategori: 'Kurikulum Diniyah', judul: 'Dokumen Silabus & Kurikulum Kitab Kuning Ganjil 2024', tahunAjaran: '2024/2025', tanggalArsip: '15 Jan 2025', fileSize: '2.4 MB' },
  { id: '2', kodeArsip: 'ARSIP-2024-002', kategori: 'Surat Keputusan', judul: 'SK Pengangkatan Mustahiq & Wali Kelas Semester Genap 2024', tahunAjaran: '2024/2025', tanggalArsip: '20 Feb 2025', fileSize: '1.8 MB' },
];

export default function ArsipHistorisPage() {
  const [list, setList] = useState<ArsipItem[]>(INITIAL_ARSIP);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

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
        <table className="table-premium">
          <thead>
            <tr>
              <th>Kode Arsip</th>
              <th>Kategori</th>
              <th>Judul Dokumen</th>
              <th>Tahun Ajaran</th>
              <th>Tanggal Disimpan</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/80">
                <td className="font-mono text-xs font-bold text-slate-700">{a.kodeArsip}</td>
                <td><span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">{a.kategori}</span></td>
                <td className="font-bold text-slate-900">{a.judul}</td>
                <td className="text-xs font-semibold text-slate-600">{a.tahunAjaran}</td>
                <td className="text-xs text-slate-500">{a.tanggalArsip}</td>
                <td className="text-right">
                  <button onClick={() => showToast('info', 'Unduh Arsip', `Mengunduh berkas ${a.kodeArsip}`)} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    📥 Unduh ({a.fileSize})
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
