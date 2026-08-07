'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { PageHeader } from '@/components/PageHeader';

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
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="📖"
        title="Panduan & Standar Operasional Prosedur (SOP)"
        subtitle="Dokumentasi Resmi Penggunaan Sistem Darsa Enterprise, Petunjuk Operasional, & FAQ"
        badge="SISTEM & UTILITAS"
        primaryAction={{ label: '🖨️ Cetak Seluruh SOP', onClick: () => window.print() }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari judul SOP atau kata kunci..."
        count={filtered.length}
        countLabel="dokumen"
      />

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
