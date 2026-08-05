'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';

interface Pengurus {
  id: string;
  nama: string;
  jabatan: string;
  unit: 'PONDOK' | 'MADRASAH' | 'MI';
  telepon: string;
  status: 'AKTIF' | 'NON_AKTIF';
}

const INITIAL_PENGURUS: Pengurus[] = [
  { id: '1', nama: 'Ust. H. Ahmad Dahlan', jabatan: 'Ketua Pengurus Utama', unit: 'PONDOK', telepon: '081234567890', status: 'AKTIF' },
  { id: '2', nama: 'Ust. Moh. Syafi\'i', jabatan: 'Sekretariat Diniyah', unit: 'MADRASAH', telepon: '081399887766', status: 'AKTIF' },
  { id: '3', nama: 'Ustadzah Fatimah, S.Pd', jabatan: 'Kepala MI Formal', unit: 'MI', telepon: '085711223344', status: 'AKTIF' },
  { id: '4', nama: 'Ust. Ridwan Bakri', jabatan: 'Kepala Keamanan & Ketertiban', unit: 'PONDOK', telepon: '081299887711', status: 'AKTIF' },
];

export default function DataPengurusPage() {
  const [pengurusList, setPengurusList] = useState<Pengurus[]>(INITIAL_PENGURUS);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState<'ALL' | 'PONDOK' | 'MADRASAH' | 'MI'>('ALL');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const filtered = pengurusList.filter((p) => {
    const matchUnit = unitFilter === 'ALL' || p.unit === unitFilter;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || p.jabatan.toLowerCase().includes(search.toLowerCase());
    return matchUnit && matchSearch;
  });

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            DATABASE PONDOK
          </span>
          <h1 className="text-xl font-black text-slate-900">Data Pengurus Lirboyo</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pengelolaan Data Struktur Pengurus Pondok, Madrasah Diniyah, dan MI Formal
          </p>
        </div>
        <button
          onClick={() => showToast('info', 'Tambah Pengurus', 'Fitur pendaftaran pengurus baru dibuka.')}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <span>👤</span> + Tambah Pengurus Baru
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex-1 w-full">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama pengurus atau jabatan..." />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['ALL', 'PONDOK', 'MADRASAH', 'MI'] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnitFilter(u)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                unitFilter === u ? 'bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {u === 'ALL' ? 'Semua Unit' : u}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Nama Pengurus</th>
              <th>Jabatan</th>
              <th>Unit Lembaga</th>
              <th>No. Telepon / WA</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80">
                <td className="font-bold text-slate-900">{p.nama}</td>
                <td className="text-slate-700 text-xs font-medium">{p.jabatan}</td>
                <td>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    {p.unit}
                  </span>
                </td>
                <td className="font-mono text-xs text-slate-600">{p.telepon}</td>
                <td>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {p.status}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => showToast('info', 'Edit Pengurus', `Mengedit data ${p.nama}`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Edit
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
