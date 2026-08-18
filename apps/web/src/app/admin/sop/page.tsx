'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { getKopSuratHTML, formatTanggalFormal } from '@/lib/formal-document-print';

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
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (printWindow) {
      const kopHtml = getKopSuratHTML('PONDOK');
      const { masehi } = formatTanggalFormal(new Date());

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="utf-8" />
            <title>Dokumen SOP - ${sop.title}</title>
            <style>
              @page { size: A4 portrait; margin: 18mm 20mm 18mm 20mm; }
              body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 10px 20px; line-height: 1.5; font-size: 11pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .sop-title { text-align: center; font-size: 13pt; font-weight: 900; text-transform: uppercase; margin: 0 0 4px 0; text-decoration: underline; }
              .meta-box { border: 1px solid #000; padding: 10px 14px; margin: 16px 0; background: #f8fafc; font-size: 10.5pt; }
              .content-box { border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10pt; line-height: 1.6; white-space: pre-wrap; background: #fafafa; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            ${kopHtml}
            <div class="sop-title">STANDAR OPERASIONAL PROSEDUR (SOP) RESMI</div>
            <div style="text-align: center; font-size: 10.5pt; font-weight: bold; margin-bottom: 14px; color: #064e3b;">
              KODE: ${sop.id} • BIDANG: ${sop.category}
            </div>

            <div class="meta-box">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 140px; font-weight: bold;">Judul Prosedur</td>
                  <td style="width: 10px;">:</td>
                  <td style="font-weight: bold; font-size: 11.5pt;">${sop.title}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Tujuan & Deskripsi</td>
                  <td>:</td>
                  <td>${sop.desc}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Tanggal Ditetapkan</td>
                  <td>:</td>
                  <td>Kediri, ${masehi}</td>
                </tr>
              </table>
            </div>

            <h4 style="margin: 16px 0 8px 0; font-size: 11.5pt; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px;">
              INSTRUKSI & TATA CARA PELAKSANAAN:
            </h4>
            <div class="content-box">${sop.content}</div>

            <div style="display: flex; justify-content: flex-end; margin-top: 35px; page-break-inside: avoid;">
              <div style="text-align: center; width: 250px;">
                <p style="margin: 0; font-size: 10.5pt;">Kediri, ${masehi}</p>
                <p style="margin: 2px 0 0 0; font-weight: bold;">Sekretariat Utama Pesantren</p>
                <div style="height: 60px;"></div>
                <p style="margin: 0; font-weight: 900; text-decoration: underline;">KH. Agus Abdullah Kafabihi, M.Pd.I.</p>
                <p style="margin: 2px 0 0 0; font-size: 8.5pt; font-family: Arial, sans-serif;">NIY: 19820415.200501.1.001</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handlePrintAllSop = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (printWindow) {
      const kopHtml = getKopSuratHTML('PONDOK');
      const { masehi } = formatTanggalFormal(new Date());

      const itemsHtml = sopItems
        .map(
          (sop) => `
          <div style="page-break-after: always; margin-bottom: 30px;">
            ${kopHtml}
            <div style="text-align: center; font-size: 13pt; font-weight: 900; text-decoration: underline; margin-bottom: 4px;">
              STANDAR OPERASIONAL PROSEDUR (${sop.id})
            </div>
            <h3 style="text-align: center; font-size: 12pt; margin: 0 0 14px 0; color: #064e3b;">${sop.title}</h3>
            <div style="border: 1px solid #000; padding: 10px; margin-bottom: 12px; font-size: 10pt; background: #f8fafc;">
              <strong>Kategori:</strong> ${sop.category} | <strong>Deskripsi:</strong> ${sop.desc}
            </div>
            <div style="border: 1px solid #cbd5e1; padding: 14px; border-radius: 6px; font-family: sans-serif; font-size: 9.5pt; line-height: 1.5; white-space: pre-wrap;">${sop.content}</div>
          </div>
        `
        )
        .join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Buku Panduan SOP Resmi Darsa Enterprise</title>
            <style>
              @page { size: A4 portrait; margin: 15mm; }
              body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 10px; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            ${itemsHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
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
        primaryAction={{ label: '🖨️ Cetak Seluruh SOP Resmi (A4)', onClick: handlePrintAllSop }}
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
