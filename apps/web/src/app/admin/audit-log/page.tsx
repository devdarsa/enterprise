'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';

interface AuditItem {
  id: string;
  waktu: string;
  user: string;
  aktivitas: string;
  modul: string;
  ipAddress: string;
}

const INITIAL_AUDIT: AuditItem[] = [
  { id: '1', waktu: '05 Agt 2026 17:05', user: 'admin@darsa.id', aktivitas: 'Registrasi Santri Baru: Muhammad Raihan', modul: 'SANTRI', ipAddress: '182.253.12.9' },
  { id: '2', waktu: '05 Agt 2026 16:30', user: 'guru.madrasah@darsa.id', aktivitas: 'Input Nilai Ujian Syafahi Kitab Kuning', modul: 'AKADEMIK', ipAddress: '182.253.12.15' },
  { id: '3', waktu: '05 Agt 2026 15:10', user: 'admin@darsa.id', aktivitas: 'Perubahan Instansi Aktif ke PONDOK', modul: 'SYSTEM', ipAddress: '182.253.12.9' },
];

export default function AuditLogRecycleBinPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'recycle'>('audit');
  const [auditList] = useState<AuditItem[]>(INITIAL_AUDIT);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS
          </span>
          <h1 className="text-xl font-black text-slate-900">Audit Log System & Recycle Bin</h1>
          <p className="text-xs text-slate-500 font-medium">
            Jejak Rekam Aktivitas Pengguna, Perubahan Data, dan Pemulihan Berkas Terhapus
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit' ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-700'
            }`}
          >
            📋 Audit Log Aktivitas
          </button>
          <button
            onClick={() => setActiveTab('recycle')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recycle' ? 'bg-rose-700 text-white shadow' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🗑️ Recycle Bin (Trash)
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Waktu Kejadian</th>
                <th>Pengguna</th>
                <th>Aktivitas Perubahan</th>
                <th>Modul</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditList.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80">
                  <td className="font-mono text-xs text-slate-600 font-medium">{a.waktu}</td>
                  <td className="font-bold text-slate-900">{a.user}</td>
                  <td className="text-xs text-slate-800 font-semibold">{a.aktivitas}</td>
                  <td><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">{a.modul}</span></td>
                  <td className="font-mono text-xs text-slate-400">{a.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="text-4xl">♻️</div>
          <h3 className="text-sm font-bold text-slate-900">Recycle Bin Kosong</h3>
          <p className="text-xs text-slate-500">Tidak ada data santri, guru, atau berkas yang baru saja dihapus.</p>
        </div>
      )}
    </div>
  );
}
