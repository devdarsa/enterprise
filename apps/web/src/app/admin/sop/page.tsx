'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';

export default function SOPGuidePage() {
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const sopItems = [
    { title: 'SOP Pendaftaran & Registrasi Santri Baru', category: 'ADMINISTRASI', desc: 'Tata cara input identitas pribadi, penarikan data dari Pondok, dan integrasi NIK Wali Santri.' },
    { title: 'SOP Pengajuan Izin Pulang & Keluar Pesantren', category: 'PERIZINAN', desc: 'Alur persetujuan perizinan oleh sekretariat dan verifikasi pos keamanan.' },
    { title: 'SOP Presensi Dynamic QR Code Guru & Ustadz', category: 'PRESENSI', desc: 'Penggunaan display QR dinamis dengan perlindungan TOTP geolocation 200 meter.' },
    { title: 'SOP Penginputan Nilai Kitab Kuning & Rapor PDF', category: 'AKADEMIK', desc: 'Pedoman pengisian nilai syafahi/tahriri dan pencetakan rapor resmi.' },
  ];

  const filtered = sopItems.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS
          </span>
          <h1 className="text-xl font-black text-slate-900">Panduan & Standar Operasional Prosedur (SOP)</h1>
          <p className="text-xs text-slate-500 font-medium">
            Dokumentasi Resmi Penggunaan Sistem Darsa Enterprise, Petunjuk Operasional, & FAQ
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>🖨️</span> Cetak Seluruh SOP
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari judul SOP atau kata kunci..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 font-bold">DOC-{idx + 1}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>

            {/* Standard SOP Buttons: Lihat, Download, Cetak */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => showToast('info', 'Membuka Dokumentasi', `Membaca ${item.title}`)}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
              >
                <span>📖</span> Lihat SOP
              </button>
              <button
                onClick={() => showToast('info', 'Unduh PDF', `Mengunduh PDF ${item.title}`)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1"
              >
                <span>📥</span> Download
              </button>
              <button
                onClick={() => showToast('info', 'Cetak SOP', `Mencetak ${item.title}`)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1"
              >
                <span>🖨️</span> Cetak
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
