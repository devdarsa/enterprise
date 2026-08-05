'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';

export default function SOPGuidePage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const sopItems = [
    { title: 'SOP Pendaftaran & Registrasi Santri Baru', category: 'ADMINISTRASI', desc: 'Tata cara input identitas pribadi, penarikan data dari Pondok, dan integrasi NIK Wali Santri.' },
    { title: 'SOP Pengajuan Izin Pulang & Keluar Pesantren', category: 'PERIZINAN', desc: 'Alur persetujuan perizinan oleh sekretariat dan verifikasi pos keamanan.' },
    { title: 'SOP Presensi Dynamic QR Code Guru & Ustadz', category: 'PRESENSI', desc: 'Penggunaan display QR dinamis dengan perlindungan TOTP geolocation 200 meter.' },
    { title: 'SOP Penginputan Nilai Kitab Kuning & Rapor PDF', category: 'AKADEMIK', desc: 'Pedoman pengisian nilai syafahi/tahriri dan pencetakan rapor resmi.' },
  ];

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sopItems.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                {item.category}
              </span>
              <span className="text-xs text-slate-400 font-bold">DOC-{idx + 1}</span>
            </div>
            <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
            <p className="text-xs text-slate-500">{item.desc}</p>
            <button
              onClick={() => showToast('info', 'Membuka Dokumentasi', `Membaca ${item.title}`)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              <span>📖</span> Baca Dokumentasi Lengkap →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
