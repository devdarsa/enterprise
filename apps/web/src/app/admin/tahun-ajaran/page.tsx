'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';

interface TahunAjaran {
  id: string;
  nama: string;
  semester: 'Ganjil' | 'Genap';
  status: 'AKTIF' | 'NON_AKTIF';
  tglMulai: string;
  tglSelesai: string;
}

const INITIAL_TAHUN: TahunAjaran[] = [
  { id: '1', nama: '2025/2026', semester: 'Ganjil', status: 'AKTIF', tglMulai: '15 Jul 2025', tglSelesai: '20 Des 2025' },
  { id: '2', nama: '2025/2026', semester: 'Genap', status: 'NON_AKTIF', tglMulai: '05 Jan 2026', tglSelesai: '20 Jun 2026' },
  { id: '3', nama: '2024/2025', semester: 'Genap', status: 'NON_AKTIF', tglMulai: '05 Jan 2025', tglSelesai: '20 Jun 2025' },
];

export default function TahunAjaranPage() {
  const [list, setList] = useState<TahunAjaran[]>(INITIAL_TAHUN);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const handleSetAktif = (id: string) => {
    setList((prev) =>
      prev.map((item) => ({
        ...item,
        status: item.id === id ? 'AKTIF' : 'NON_AKTIF',
      }))
    );
    showToast('success', 'Tahun Ajaran Diperbarui', 'Tahun ajaran aktif sistem telah diubah.');
  };

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS
          </span>
          <h1 className="text-xl font-black text-slate-900">Manajemen Tahun Ajaran & Semester</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pengaturan Periode Akademik Aktif dan Riwayat Tahun Ajaran
          </p>
        </div>
        <button
          onClick={() => showToast('info', 'Tambah Tahun Ajaran', 'Membuka form tahun ajaran baru.')}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <span>📅</span> + Tambah Tahun Ajaran Baru
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Tahun Ajaran</th>
              <th>Semester</th>
              <th>Periode Pelaksanaan</th>
              <th>Status Aktif</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80">
                <td className="font-bold text-slate-900">{item.nama}</td>
                <td><span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-200">{item.semester}</span></td>
                <td className="text-xs text-slate-600 font-medium">{item.tglMulai} s/d {item.tglSelesai}</td>
                <td>
                  {item.status === 'AKTIF' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">
                      ✓ AKTIF UTAMA
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 font-medium">Non-Aktif</span>
                  )}
                </td>
                <td className="text-right">
                  {item.status !== 'AKTIF' && (
                    <button
                      onClick={() => handleSetAktif(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
                    >
                      Set Aktif
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
