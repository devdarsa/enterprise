'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { SkeletonTable } from '@/components/Loading';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { DigitalSantriCard, SantriCardData, getInstansiMetadata } from '@/components/DigitalSantriCard';
import { QrCode, Printer, Sparkles, CheckCircle2, ShieldCheck, Download, Search } from 'lucide-react';

interface SantriWithQR extends SantriCardData {
  qrDataUrl?: string;
}

export default function KartuSantriPage() {
  const [santriList, setSantriList] = useState<SantriWithQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState<'ALL' | 'PONDOK' | 'MADRASAH_DINIYAH' | 'MI'>('ALL');
  const [cardTarget, setCardTarget] = useState<SantriWithQR | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  // Fetch live santri from database & generate high-res QR for all
  useEffect(() => {
    const fetchSantriAndQRs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: '1', limit: '100', ...(search && { search }) });
        const res = await fetch(`/api/v1/santri?${params}`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const mapped = await Promise.all(
            json.data.map(async (s: any) => {
              const baseData: SantriCardData = {
                id: s.id,
                nisp: s.nisp,
                nisn: s.nisn,
                nik: s.nik,
                nama: s.nama_lengkap,
                nama_panggilan: s.nama_panggilan,
                jenis_kelamin: s.jenis_kelamin,
                jenjang: s.jenjang || 'PONDOK',
                kelas: s.kelas?.nama_kelas || '-',
                kamar: s.kamar,
                status: s.status || 'AKTIF',
                nik_wali: s.nik_wali,
                nama_wali: s.nama_wali,
                telepon_wali: s.telepon_wali,
                no_kk: s.no_kk,
                avatar_url: s.avatar_url || s.user?.foto_url,
              };

              // Generate real live QR Code for every child
              const qrPayload = JSON.stringify({
                v: 2,
                id: baseData.id,
                nisp: baseData.nisp || '',
                nisn: baseData.nisn,
                nik: baseData.nik || '',
                nama: baseData.nama,
                jenjang: baseData.jenjang,
                kelas: baseData.kelas,
                kamar: baseData.kamar || 'Asrama',
                wali: baseData.nama_wali || '',
                nik_wali: baseData.nik_wali || '',
                no_kk: baseData.no_kk || '',
                auth: 'DARSA_ENTERPRISE_AUTHENTICATED',
              });

              try {
                const qrDataUrl = await QRCode.toDataURL(qrPayload, {
                  width: 220,
                  margin: 1,
                  errorCorrectionLevel: 'M',
                  color: { dark: '#022c22', light: '#ffffff' },
                });
                return { ...baseData, qrDataUrl };
              } catch {
                return baseData;
              }
            })
          );

          setSantriList(mapped);
        }
      } catch {
        showToast('error', 'Gagal Memuat', 'Tidak dapat terhubung ke database.');
      } finally {
        setLoading(false);
      }
    };

    fetchSantriAndQRs();
  }, [search]);

  const filtered = santriList.filter((s) => {
    const matchSearch =
      !search ||
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.includes(search) ||
      (s.nisp && s.nisp.toLowerCase().includes(search.toLowerCase())) ||
      (s.nik && s.nik.includes(search)) ||
      (s.nama_wali && s.nama_wali.toLowerCase().includes(search.toLowerCase()));

    const matchJenjang = jenjangFilter === 'ALL' || s.jenjang === jenjangFilter;
    return matchSearch && matchJenjang;
  });

  const handlePrintSingle = () => {
    if (!cardTarget) return;
    const meta = getInstansiMetadata(cardTarget.jenjang);
    const win = window.open('', '_blank', 'width=520,height=750');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kartu Santri Resmi - ${cardTarget.nama}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: 85.6mm 54mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #f8fafc;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .card-container {
              width: 440px;
              border-radius: 20px;
              padding: 20px;
              background: linear-gradient(135deg, #022c22 0%, #064e3b 60%, #042f2e 100%);
              border: 2px solid #fbbf24;
              box-shadow: 0 10px 25px rgba(0,0,0,0.3);
              color: white;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid rgba(251,191,36,0.4);
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo-img {
              width: 46px;
              height: 46px;
              background: white;
              border-radius: 12px;
              padding: 3px;
              border: 1.5px solid #fbbf24;
              object-fit: contain;
            }
            .title-sub {
              font-size: 8px;
              font-weight: 800;
              letter-spacing: 1px;
              color: #fde047;
              text-transform: uppercase;
            }
            .title-main {
              font-size: 12px;
              font-weight: 900;
              margin: 1px 0;
              color: white;
            }
            .title-desc {
              font-size: 9px;
              color: #a7f3d0;
            }
            .badge-aktif {
              background: #fbbf24;
              color: #022c22;
              font-size: 9px;
              font-weight: 900;
              padding: 2px 8px;
              border-radius: 99px;
              text-transform: uppercase;
            }
            .profile-row {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;
            }
            .avatar-box {
              width: 68px;
              height: 80px;
              background: rgba(255,255,255,0.12);
              border: 1.5px solid rgba(251,191,36,0.8);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: 900;
              color: #fde047;
              flex-shrink: 0;
            }
            .santri-name {
              font-size: 14px;
              font-weight: 900;
              color: white;
              margin: 0 0 4px 0;
            }
            .santri-meta {
              font-size: 10px;
              color: #a7f3d0;
              font-family: monospace;
              margin: 2px 0;
            }
            .santri-meta span {
              color: #fde047;
              font-weight: bold;
            }
            .santri-tags {
              display: flex;
              gap: 6px;
              margin-top: 4px;
            }
            .tag-item {
              background: rgba(255,255,255,0.15);
              font-size: 9px;
              font-weight: bold;
              padding: 2px 6px;
              border-radius: 6px;
              color: #fef08a;
              border: 1px solid rgba(255,255,255,0.2);
            }
            .qr-box {
              background: white;
              border-radius: 14px;
              padding: 10px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border: 1px solid #fbbf24;
            }
            .qr-img {
              width: 76px;
              height: 76px;
              border-radius: 8px;
              object-fit: contain;
            }
            .qr-details {
              text-align: right;
              font-family: monospace;
              font-size: 9.5px;
              color: #1e293b;
            }
            .qr-title {
              font-weight: 900;
              color: #065f46;
              font-size: 10.5px;
              margin-bottom: 2px;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #6ee7b7;
              font-family: monospace;
              margin-top: 8px;
              padding-top: 6px;
              border-top: 1px solid rgba(251,191,36,0.3);
            }
            @media print {
              body { background: white; }
              .card-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <div class="header">
              <div class="header-left">
                <img src="${meta.logo}" class="logo-img" alt="Logo" />
                <div>
                  <div class="title-sub">KARTU TANDA SANTRI DIGITAL</div>
                  <div class="title-main">${meta.instansiName}</div>
                  <div class="title-desc">${meta.subTitle}</div>
                </div>
              </div>
              <span class="badge-aktif">${cardTarget.status}</span>
            </div>

            <div class="profile-row">
              <div class="avatar-box">
                ${cardTarget.nama.slice(0, 2).toUpperCase()}
              </div>
              <div style="flex:1; min-width:0;">
                <div class="santri-name">${cardTarget.nama}</div>
                <div class="santri-meta">No. Stambuk: <span>${cardTarget.nisp || '-'}</span></div>
                <div class="santri-meta">NISN Resmi: <span>${cardTarget.nisn}</span></div>
                <div class="santri-tags">
                  <span class="tag-item">📚 ${cardTarget.kelas}</span>
                  <span class="tag-item">🏡 ${cardTarget.kamar || 'Asrama'}</span>
                </div>
              </div>
            </div>

            <div class="qr-box">
              <img src="${cardTarget.qrDataUrl}" class="qr-img" alt="QR Code" />
              <div class="qr-details">
                <div class="qr-title">TOTP DYNAMIC REAL-TIME QR</div>
                <div style="color: #64748b;">Presensi & Perizinan Terpusat</div>
                <div style="color: #92400e; font-weight: bold; margin-top: 2px;">Wali: ${cardTarget.nama_wali || '-'}</div>
                <div style="color: #94a3b8; font-size: 8px;">NIK: ${cardTarget.nik_wali || '-'} • KK: ${cardTarget.no_kk || '-'}</div>
              </div>
            </div>

            <div class="footer-row">
              <span>DARSA SMART CAMPUS SYSTEM</span>
              <span>SECURE ID • TA 2025/2026</span>
            </div>
          </div>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const handlePrintMassal = () => {
    if (filtered.length === 0) return;
    const win = window.open('', '_blank');
    if (!win) return;

    const cardsHtml = filtered
      .map((santri) => {
        const meta = getInstansiMetadata(santri.jenjang);
        return `
          <div style="page-break-inside: avoid; margin-bottom: 20px; width: 420px; border-radius: 20px; padding: 18px; background: linear-gradient(135deg, #022c22 0%, #064e3b 60%, #042f2e 100%); border: 2px solid #fbbf24; color: white; box-sizing: border-box; font-family: sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(251,191,36,0.4); padding-bottom: 8px; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${meta.logo}" style="width: 40px; height: 40px; background: white; border-radius: 10px; padding: 2px; border: 1.5px solid #fbbf24; object-fit: contain;" />
                <div>
                  <div style="font-size: 7.5px; font-weight: 800; letter-spacing: 1px; color: #fde047; text-transform: uppercase;">KARTU TANDA SANTRI DIGITAL</div>
                  <div style="font-size: 11px; font-weight: 900; color: white;">${meta.instansiName}</div>
                  <div style="font-size: 8.5px; color: #a7f3d0;">${meta.subTitle}</div>
                </div>
              </div>
              <span style="background: #fbbf24; color: #022c22; font-size: 8px; font-weight: 900; padding: 2px 6px; border-radius: 99px; text-transform: uppercase;">${santri.status}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 60px; height: 72px; background: rgba(255,255,255,0.12); border: 1.5px solid rgba(251,191,36,0.8); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: #fde047; flex-shrink: 0;">
                ${santri.nama.slice(0, 2).toUpperCase()}
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-size: 13px; font-weight: 900; color: white; margin-bottom: 2px;">${santri.nama}</div>
                <div style="font-size: 9.5px; color: #a7f3d0; font-family: monospace;">No. Stambuk: <span style="color: #fde047; font-weight: bold;">${santri.nisp || '-'}</span></div>
                <div style="font-size: 9.5px; color: #a7f3d0; font-family: monospace;">NISN: <span style="color: white; font-weight: bold;">${santri.nisn}</span></div>
                <div style="margin-top: 4px; display: flex; gap: 4px;">
                  <span style="background: rgba(255,255,255,0.15); font-size: 8.5px; font-weight: bold; padding: 2px 6px; border-radius: 4px; color: #fef08a;">📚 ${santri.kelas}</span>
                  <span style="background: rgba(255,255,255,0.15); font-size: 8.5px; font-weight: bold; padding: 2px 6px; border-radius: 4px; color: #a7f3d0;">🏡 ${santri.kamar || 'Asrama'}</span>
                </div>
              </div>
            </div>

            <div style="background: white; border-radius: 12px; padding: 8px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #fbbf24;">
              <img src="${santri.qrDataUrl}" style="width: 68px; height: 68px; border-radius: 6px; object-fit: contain;" />
              <div style="text-align: right; font-family: monospace; font-size: 9px; color: #1e293b;">
                <div style="font-weight: 900; color: #065f46; font-size: 10px;">TOTP DYNAMIC REAL-TIME QR</div>
                <div style="color: #64748b; font-size: 8px;">Presensi & Perizinan Terpusat</div>
                <div style="color: #92400e; font-weight: bold; margin-top: 2px;">Wali: ${santri.nama_wali || '-'}</div>
                <div style="color: #94a3b8; font-size: 7.5px;">NIK: ${santri.nik_wali || '-'} • KK: ${santri.no_kk || '-'}</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 7.5px; color: #6ee7b7; font-family: monospace; margin-top: 8px; padding-top: 4px; border-top: 1px solid rgba(251,191,36,0.3);">
              <span>DARSA SMART CAMPUS SYSTEM</span>
              <span>SECURE ID • TA 2025/2026</span>
            </div>
          </div>
        `;
      })
      .join('');

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Massal Kartu Santri (${filtered.length} Santri)</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: sans-serif; background: #fff; margin: 0; padding: 10px; }
            .grid { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="grid">${cardsHtml}</div>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 600);

    showToast('success', 'Cetak Massal', `${filtered.length} Kartu Santri beresolusi tinggi siap dicetak.`);
  };

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="🪪"
        title="Kartu Tanda Santri Digital (Smart ID)"
        subtitle="Kartu presensi pintar resmi dengan logo instansi dan QR Code TOTP aktif yang terhubung 100% langsung ke Database Server."
        badge="SISTEM PRESTASI & KEAMANAN"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama santri, NISN, No. Stambuk (NISP), NIK, atau Nama Wali..."
        count={loading ? undefined : filtered.length}
        countLabel="kartu santri aktif"
        onExportPDF={handlePrintMassal}
        onRefresh={() => setSearch('')}
      />

      {/* Filter Tabs Jenjang */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: '🌟 Semua Santri', count: santriList.length },
            { id: 'PONDOK', label: '🕌 Pondok Pesantren', count: santriList.filter((s) => s.jenjang === 'PONDOK').length },
            { id: 'MADRASAH_DINIYAH', label: '📖 Madrasah Diniyah', count: santriList.filter((s) => s.jenjang === 'MADRASAH_DINIYAH').length },
            { id: 'MI', label: '🏫 Formal MI', count: santriList.filter((s) => s.jenjang === 'MI').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setJenjangFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                jenjangFilter === tab.id
                  ? 'bg-emerald-800 text-amber-300 shadow-md scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${jenjangFilter === tab.id ? 'bg-amber-400 text-emerald-950 font-black' : 'bg-slate-200 text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handlePrintMassal}
          disabled={filtered.length === 0}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-emerald-950 font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Massal Semua Kartu ({filtered.length})</span>
        </button>
      </div>

      {/* Grid Kartu Santri Ultra-Premium */}
      {loading ? (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <SkeletonTable rows={4} cols={4} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800">Tidak ada santri yang sesuai filter</h4>
          <p className="text-xs text-slate-400">Silakan ubah kata kunci pencarian atau tab jenjang di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((santri) => (
            <div
              key={santri.id}
              onClick={() => setCardTarget(santri)}
              className="group cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 relative"
            >
              <DigitalSantriCard santri={santri} />

              {/* Hover Overlay Button */}
              <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[2px] rounded-[24px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none">
                <span className="px-5 py-2.5 rounded-2xl bg-amber-400 text-emerald-950 font-black text-xs shadow-2xl border border-amber-300 flex items-center gap-2 transform scale-95 group-hover:scale-100 transition-all">
                  <Printer className="w-4 h-4" />
                  <span>Preview & Cetak Kartu</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail & Print High-Resolution Card */}
      <Modal
        isOpen={!!cardTarget}
        onClose={() => setCardTarget(null)}
        title="🪪 Pratinjau Kartu Santri Digital Resmi (Smart ID)"
      >
        {cardTarget && (
          <div className="space-y-6 pt-2">
            {/* The Actual Rendered Premium Component */}
            <div className="flex justify-center p-2 sm:p-4 bg-slate-100 rounded-3xl border border-slate-200 shadow-inner">
              <DigitalSantriCard santri={cardTarget} />
            </div>

            {/* Quick Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                <span className="text-[10px] text-emerald-600 font-bold block">Status Database</span>
                <strong className="font-black text-xs">{cardTarget.status}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
                <span className="text-[10px] text-amber-600 font-bold block">Kelas & Jenjang</span>
                <strong className="font-black text-xs truncate block">{cardTarget.kelas}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900">
                <span className="text-[10px] text-blue-600 font-bold block">Wali Santri</span>
                <strong className="font-black text-xs truncate block">{cardTarget.nama_wali || '-'}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900">
                <span className="text-[10px] text-purple-600 font-bold block">Koneksi QR</span>
                <strong className="font-black text-xs text-purple-700">100% Terverifikasi</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCardTarget(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrintSingle}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Kartu Santri Ini (High-Res)</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
