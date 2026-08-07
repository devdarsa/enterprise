'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';

interface SOPItem {
  id: string;
  title: string;
  category: string;
  desc: string;
  content: string;
}

export default function SOPGuidePage() {
  const [search, setSearch] = useState('');
  const [selectedSop, setSelectedSop] = useState<SOPItem | null>(null);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const sopItems: SOPItem[] = [
    {
      id: 'SOP-001',
      title: 'SOP Pendaftaran & Registrasi Santri Baru',
      category: 'ADMINISTRASI',
      desc: 'Tata cara input identitas pribadi, penarikan data dari Pondok, dan integrasi NIK Wali Santri.',
      content:
        '1. Identitas santri hanya dibuat 1 kali pada Database Pondok (Single Source of Truth).\n2. Pendaftaran di unit Madrasah & MI wajib menggunakan fitur Tarik Data dari Pondok.\n3. NIK Wali Santri (16 digit) wajib diisi untuk verifikasi akun Wali Santri.',
    },
    {
      id: 'SOP-002',
      title: 'SOP Pengajuan Izin Pulang & Keluar Pesantren',
      category: 'PERIZINAN',
      desc: 'Alur persetujuan perizinan oleh sekretariat dan verifikasi pos keamanan.',
      content:
        '1. Permohonan izin diinput melalui portal Keamanan / Sekretariat.\n2. Verifikasi status izin oleh pengurus piket.\n3. Santri wajib membawa Surat Izin Resmi tercetak saat melewati pos keamanan utama.',
    },
    {
      id: 'SOP-003',
      title: 'SOP Presensi Dynamic QR Code Guru & Ustadz',
      category: 'PRESENSI',
      desc: 'Penggunaan display QR dinamis dengan perlindungan TOTP geolocation 200 meter.',
      content:
        '1. Display QR Code diperbarui setiap 30 detik pada layar presensi instansi.\n2. Pengajar melakukan scan QR menggunakan kamera smartphone.\n3. Geolocation pengguna divalidasi maksimum 200 meter dari titik lokasi komplek.',
    },
    {
      id: 'SOP-004',
      title: 'SOP Penginputan Nilai Kitab Kuning & Rapor PDF',
      category: 'AKADEMIK',
      desc: 'Pedoman pengisian nilai syafahi/tahriri dan pencetakan rapor resmi.',
      content:
        '1. Nilai ujian Syafahi (Lisan) dan Tahriri (Tulis) diinput oleh Dewan Mustahiq.\n2. Pembobotan nilai otomatis dihitung oleh sistem.\n3. Cetak Rapor Digital dalam format PDF resmi dengan stempel digital.',
    },
  ];

  const handleDownloadPdf = (sop: SOPItem) => {
    const textContent = `DOKUMEN RESMI DARSA ENTERPRISE\n${sop.title.toUpperCase()}\nKategori: ${sop.category}\n\n${sop.desc}\n\nPETUNJUK OPERASIONAL:\n${sop.content}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sop.id}-${sop.category.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Dokumen Diunduh', `File dokumen ${sop.title} berhasil diunduh.`);
  };

  const handlePrintSop = (sop: SOPItem) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${sop.title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #0f4928; border-bottom: 2px solid #f5c518; padding-bottom: 10px; }
              .badge { background: #f0faf4; color: #0f4928; padding: 4px 12px; border-radius: 8px; font-weight: bold; }
              pre { background: #f8fafc; padding: 20px; border-radius: 12px; font-size: 14px; }
            </style>
          </head>
          <body>
            <span class="badge">${sop.category}</span>
            <h1>${sop.title}</h1>
            <p><strong>Deskripsi:</strong> ${sop.desc}</p>
            <hr />
            <h3>Petunjuk Prosedur:</h3>
            <pre>${sop.content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const filtered = sopItems.filter(
    (s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase())
  );

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
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-emerald-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 font-bold">{item.id}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>

            {/* Buttons: Lihat, Download, Cetak */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setSelectedSop(item)}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>📖</span> Lihat SOP
              </button>
              <button
                onClick={() => handleDownloadPdf(item)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <span>📥</span> Download
              </button>
              <button
                onClick={() => handlePrintSop(item)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <span>🖨️</span> Cetak
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail SOP */}
      <Modal isOpen={!!selectedSop} onClose={() => setSelectedSop(null)} title={selectedSop?.title || 'Dokumentasi SOP'}>
        {selectedSop && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-1">
              <span className="text-[10px] text-amber-300 font-bold uppercase">{selectedSop.category}</span>
              <h3 className="text-base font-black">{selectedSop.title}</h3>
              <p className="text-emerald-200">{selectedSop.desc}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 whitespace-pre-line text-slate-800 leading-relaxed font-mono">
              {selectedSop.content}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handlePrintSop(selectedSop)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                🖨️ Cetak Dokumen
              </button>
              <button
                onClick={() => setSelectedSop(null)}
                className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
