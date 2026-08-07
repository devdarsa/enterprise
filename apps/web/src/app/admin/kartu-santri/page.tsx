'use client';

import { useState, useEffect, useRef } from 'react';
import { SkeletonTable } from '@/components/Loading';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';

interface Santri {
  id: string;
  nisp?: string;
  nisn: string;
  nama: string;
  jenis_kelamin: string;
  kelas: string;
  kamar?: string;
  status: string;
  nik_wali?: string;
  nama_wali?: string;
}

export default function KartuSantriPage() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cardTarget, setCardTarget] = useState<Santri | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  useEffect(() => {
    const fetchSantri = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: '1', limit: '50', ...(search && { search }) });
        const res = await fetch(`/api/v1/santri?${params}`);
        const json = await res.json();
        if (json.success) {
          setSantriList(
            json.data.map((s: any) => ({
              id: s.id,
              nisp: s.nisp,
              nisn: s.nisn,
              nama: s.nama_lengkap,
              jenis_kelamin: s.jenis_kelamin,
              kelas: s.kelas?.nama_kelas || '-',
              kamar: s.kamar,
              status: s.status,
              nik_wali: s.nik_wali,
              nama_wali: s.nama_wali,
            }))
          );
        }
      } catch {
        showToast('error', 'Gagal Memuat', 'Tidak dapat terhubung ke database.');
      } finally {
        setLoading(false);
      }
    };
    fetchSantri();
  }, [search]);

  const handlePrint = () => {
    if (!printRef.current || !cardTarget) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=420,height=680');
    if (!win) return;
    win.document.write(`
      <html><head>
        <title>Kartu Digital - ${cardTarget.nama}</title>
        <style>
          body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #fff; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const filtered = search
    ? santriList.filter(s =>
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        s.nisn.includes(search) ||
        (s.nisp && s.nisp.toLowerCase().includes(search.toLowerCase()))
      )
    : santriList;

  const handlePrintMassal = () => {
    if (filtered.length === 0) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const cardsHtml = filtered
      .map(
        (santri) => `
      <div style="page-break-inside: avoid; margin-bottom: 15px; padding: 16px; border: 2px solid #ca8a04; border-radius: 16px; background: linear-gradient(135deg, #064e3b 0%, #042f2e 100%); color: white; width: 320px; font-family: sans-serif; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
        <div style="border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px; margin-bottom: 10px;">
          <span style="font-size: 8px; color: #fde047; font-weight: bold; letter-spacing: 1px;">KARTU PRESENSI DIGITAL</span>
          <h4 style="margin: 2px 0 0 0; color: white; font-size: 13px;">MA'HAD DARUSSA'ADAH LIRBOYO</h4>
        </div>
        <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 900;">${santri.nama}</h3>
        <p style="margin: 2px 0; font-size: 11px; font-family: monospace; color: #a7f3d0;">NISN: ${santri.nisn} | NISP: ${santri.nisp || '-'}</p>
        <p style="margin: 2px 0; font-size: 11px; color: #fde047;">${santri.kelas} • ${santri.kamar || 'Asrama Utama'}</p>
      </div>
    `
      )
      .join('');
    win.document.write(
      `<html><head><title>Cetak Massal Kartu Santri</title><style>@media print { body { -webkit-print-color-adjust: exact; } }</style></head><body style="margin:0; padding:20px; background:#fff;"><div style="display:flex; flex-wrap:wrap; gap:16px;">${cardsHtml}</div></body></html>`
    );
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 400);
    showToast('success', 'Cetak Massal', `${filtered.length} kartu santri diproses untuk dicetak.`);
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="🪪"
        title="Kartu Santri Digital"
        subtitle="Kartu presensi digital dengan QR TOTP dinamis — cetak kartu identitas santri per individu atau massal."
        badge="MODUL KEAMANAN"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama, NISN, atau NISP stambuk..."
        count={loading ? undefined : filtered.length}
        countLabel="santri"
        onExportPDF={handlePrintMassal}
        onRefresh={() => setSearch('')}
      />

      {/* Grid Kartu Preview */}
      {loading ? (
        <div className="p-6"><SkeletonTable rows={4} cols={4} /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(santri => (
            <div
              key={santri.id}
              className="group relative p-4 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white border-2 border-emerald-700/50 shadow-lg hover:shadow-xl hover:border-amber-400/60 transition-all duration-200 cursor-pointer overflow-hidden"
              onClick={() => setCardTarget(santri)}
            >
              {/* Pattern */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

              <div className="relative space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-amber-300 uppercase tracking-widest">KARTU DIGITAL</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    santri.status === 'AKTIF' ? 'bg-emerald-400 text-emerald-950' : 'bg-slate-400 text-white'
                  }`}>{santri.status}</span>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-amber-400/50 flex items-center justify-center font-black text-sm shrink-0">
                    {santri.nama.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white leading-tight truncate">{santri.nama}</p>
                    <p className="text-[9px] text-emerald-300 font-mono">NISP: {santri.nisp || '-'}</p>
                  </div>
                </div>

                {/* QR Placeholder */}
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-900 font-black text-[10px] shadow-inner shrink-0">
                    QR
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-emerald-200">{santri.kelas}</p>
                    <p className="text-[9px] text-emerald-300">{santri.kamar || 'Asrama Utama'}</p>
                  </div>
                </div>

                {/* CTA overlay */}
                <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/20 transition-all rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-xs font-black bg-amber-400 text-emerald-950 px-3 py-1.5 rounded-xl shadow-lg">
                    🖨️ Cetak Kartu
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail & Cetak Kartu */}
      <Modal
        isOpen={!!cardTarget}
        onClose={() => setCardTarget(null)}
        title="🪪 Kartu Digital Santri — Preview & Cetak"
      >
        {cardTarget && (
          <div className="space-y-5">
            {/* Print Preview */}
            <div ref={printRef}>
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white border-2 border-amber-400 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {/* Header Instansi */}
                <div className="relative flex items-center gap-3 border-b border-emerald-700/80 pb-3">
                  <div className="w-11 h-11 rounded-full border-2 border-amber-400 bg-white/10 flex items-center justify-center text-xl shrink-0">🕌</div>
                  <div>
                    <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest block">KARTU PRESENSI DIGITAL</span>
                    <h4 className="text-sm font-black">MA'HAD DARUSSA'ADAH LIRBOYO</h4>
                    <p className="text-[9px] text-emerald-300">Kota Kediri, Jawa Timur</p>
                  </div>
                  <span className="ml-auto text-[10px] font-mono bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-black">
                    {cardTarget.status}
                  </span>
                </div>

                {/* Identitas Santri */}
                <div className="relative flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-black text-white shrink-0">
                    {cardTarget.nama.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-base font-black text-white leading-tight">{cardTarget.nama}</h3>
                    <p className="text-xs text-emerald-200 font-mono">NISN: {cardTarget.nisn}</p>
                    <p className="text-xs text-emerald-200 font-mono">Stambuk: {cardTarget.nisp || '-'}</p>
                    <p className="text-[11px] text-amber-300 font-semibold">{cardTarget.kelas}</p>
                    <p className="text-[11px] text-emerald-300">{cardTarget.kamar || 'Asrama Utama'}</p>
                  </div>
                </div>

                {/* QR Section */}
                <div className="relative p-4 bg-white rounded-2xl flex items-center justify-between gap-3 text-slate-900">
                  <div className="w-20 h-20 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-inner shrink-0">
                    QR
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-600 space-y-0.5">
                    <span className="block font-black text-emerald-800 text-xs">TOTP DYNAMIC QR</span>
                    <span className="block">Geolocation Radius: 200m</span>
                    <span className="block">NISN: {cardTarget.nisn}</span>
                    <span className="block text-amber-700 font-bold">Wali: {cardTarget.nama_wali || '-'}</span>
                    <span className="block text-[9px] text-slate-400">NIK Wali: {cardTarget.nik_wali || '-'}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="relative flex items-center justify-between text-[9px] text-emerald-400 font-mono border-t border-emerald-700/50 pt-2">
                  <span>© DARSA ENTERPRISE — SISTEM DIGITAL PONDOK</span>
                  <span>v2025</span>
                </div>
              </div>
            </div>

            {/* Aksi */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCardTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                🖨️ Cetak Kartu Santri
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
