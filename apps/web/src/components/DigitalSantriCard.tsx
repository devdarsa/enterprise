'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';

export interface SantriCardData {
  id: string;
  nisp?: string;
  nisn: string;
  nik?: string;
  nama: string;
  nama_panggilan?: string;
  jenis_kelamin?: string;
  jenjang?: string;
  kelas: string;
  kamar?: string;
  status: string;
  nik_wali?: string;
  nama_wali?: string;
  telepon_wali?: string;
  no_kk?: string;
  avatar_url?: string;
}

interface DigitalSantriCardProps {
  santri: SantriCardData;
  className?: string;
  showActions?: boolean;
  onPrint?: () => void;
}

export function getInstansiMetadata(jenjang?: string) {
  const j = (jenjang || 'PONDOK').toUpperCase();
  if (j === 'MI' || j.includes('FORMAL')) {
    return {
      instansiName: "MADRASAH IBTIDAIYAH DARUSSA'ADAH",
      subTitle: 'Formal MI Lirboyo Kediri',
      logo: '/logo-mi.png',
      badge: 'FORMAL MI',
      badgeColor: 'bg-amber-400 text-emerald-950',
      gradient: 'from-[#064e3b] via-[#043d34] to-[#022c22]',
      borderGold: 'border-amber-400',
    };
  }
  if (j === 'MADRASAH_DINIYAH' || j.includes('DINIYAH') || j.includes('MADRASAH')) {
    return {
      instansiName: "MADRASAH DINIYAH DARUSSA'ADAH",
      subTitle: "Kulliyyatul Mu'allimin Lirboyo Kediri",
      logo: '/logo-madrasah.png',
      badge: 'DINIYAH ULA',
      badgeColor: 'bg-emerald-400 text-emerald-950',
      gradient: 'from-[#064e3b] via-[#065f46] to-[#022c22]',
      borderGold: 'border-amber-400',
    };
  }
  return {
    instansiName: "PONDOK PESANTREN DARUSSA'ADAH",
    subTitle: 'Lirboyo, Kota Kediri, Jawa Timur',
    logo: '/logo-pondok.png',
    badge: 'TAHFIDZ & MUKIM',
    badgeColor: 'bg-amber-400 text-emerald-950',
    gradient: 'from-[#022c22] via-[#064e3b] to-[#042f2e]',
    borderGold: 'border-amber-400',
  };
}

export function DigitalSantriCard({ santri, className = '', showActions = false, onPrint }: DigitalSantriCardProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const meta = getInstansiMetadata(santri.jenjang);

  useEffect(() => {
    let isMounted = true;
    const qrPayload = JSON.stringify({
      v: 2,
      id: santri.id,
      nisp: santri.nisp || '',
      nisn: santri.nisn || '',
      nik: santri.nik || '',
      nama: santri.nama,
      jenjang: santri.jenjang || 'PONDOK',
      kelas: santri.kelas,
      kamar: santri.kamar || 'Asrama',
      wali: santri.nama_wali || '',
      nik_wali: santri.nik_wali || '',
      no_kk: santri.no_kk || '',
      ts: Date.now(),
    });

    QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#022c22',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrUrl(url);
      })
      .catch(() => {
        if (isMounted) setQrUrl('');
      });

    return () => {
      isMounted = false;
    };
  }, [santri]);

  const initials = santri.nama
    ? santri.nama
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'DS';

  return (
    <div
      className={`relative w-full max-w-[480px] rounded-[24px] p-5 sm:p-6 bg-gradient-to-br ${meta.gradient} text-white border-2 border-amber-400/90 shadow-[0_15px_35px_rgba(0,0,0,0.35),0_0_20px_rgba(251,191,36,0.2)] overflow-hidden transition-all select-none ${className}`}
      style={{
        boxShadow: '0 20px 40px -15px rgba(2,44,34,0.7), 0 0 0 1px rgba(251,191,36,0.3)',
      }}
    >
      {/* Background Decorative Pattern & Watermark */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#fbbf24 1.5px, transparent 1.5px), radial-gradient(#34d399 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Holographic Security Shimmer Line */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-amber-300/15 via-emerald-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* ─── 1. HEADER INSTANSI & LOGO RESMI ─── */}
      <div className="relative flex items-center justify-between gap-3 border-b border-amber-400/30 pb-3.5 mb-4">
        <div className="flex items-center gap-3">
          {/* Official Logo Container */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 shadow-md border-2 border-amber-400 shrink-0 flex items-center justify-center">
            <Image
              src={meta.logo}
              alt="Logo Resmi Instansi"
              width={48}
              height={48}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] sm:text-[9px] font-black text-amber-300 uppercase tracking-widest font-mono">
                KARTU TANDA SANTRI DIGITAL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-white leading-tight tracking-wide font-sans">
              {meta.instansiName}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-emerald-200/90 font-medium">
              {meta.subTitle}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase shadow-sm tracking-wider ${meta.badgeColor}`}>
            {santri.status || 'AKTIF'}
          </span>
          <span className="text-[8px] font-mono text-amber-200/70">
            {meta.badge}
          </span>
        </div>
      </div>

      {/* ─── 2. SMART CHIP & IDENTITAS SANTRI ─── */}
      <div className="relative flex items-center gap-4 mb-4">
        {/* Foto / Avatar with Golden Ring Frame */}
        <div className="relative w-20 h-24 sm:w-22 sm:h-26 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border-2 border-amber-400/80 shadow-lg overflow-hidden shrink-0 flex flex-col items-center justify-center">
          {santri.avatar_url ? (
            <Image
              src={santri.avatar_url}
              alt={santri.nama}
              width={88}
              height={104}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow">
                {initials}
              </span>
              <span className="text-[8px] font-bold text-emerald-200 mt-0.5 uppercase tracking-wider">
                SANTRI
              </span>
            </div>
          )}

          {/* Micro Smart Chip Icon */}
          <div className="absolute bottom-1 right-1 w-5 h-4 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 border border-amber-200 shadow-sm flex items-center justify-center opacity-90">
            <div className="w-3 h-2 border-t border-b border-amber-800/40" />
          </div>
        </div>

        {/* Data Text */}
        <div className="space-y-1 min-w-0 flex-1">
          <h2 className="text-sm sm:text-base font-black text-white leading-snug tracking-tight truncate drop-shadow-sm">
            {santri.nama}
          </h2>

          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] font-mono">
            <div>
              <span className="text-emerald-300 text-[9px] block">No. Stambuk (NISP)</span>
              <span className="font-bold text-amber-300">{santri.nisp || '-'}</span>
            </div>
            <div>
              <span className="text-emerald-300 text-[9px] block">NISN Resmi</span>
              <span className="font-bold text-white">{santri.nisn}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="px-2 py-0.5 rounded-md bg-white/15 text-amber-200 text-[10px] font-bold border border-white/20 truncate">
              📚 {santri.kelas}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-800/80 text-emerald-200 text-[10px] font-medium border border-emerald-600/40 truncate">
              🏡 {santri.kamar || 'Asrama Utama'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. LIVE QR CODE CARD & TOTP SECURITY ─── */}
      <div className="relative p-3 sm:p-3.5 bg-white rounded-2xl flex items-center justify-between gap-3 shadow-inner text-slate-900 border border-amber-300">
        {/* Real Dynamic QR Code from Database */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 bg-white rounded-xl p-1 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
          {qrUrl ? (
            <Image
              src={qrUrl}
              alt={`QR Code Presensi ${santri.nama}`}
              width={88}
              height={88}
              unoptimized
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-xs font-black animate-pulse">
              QR
            </div>
          )}
          {/* Mini Verified Badge in Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-5 h-5 rounded-full bg-emerald-700 text-amber-300 text-[8px] font-black flex items-center justify-center border border-white shadow">
              ✓
            </div>
          </div>
        </div>

        {/* Security & Parent Details */}
        <div className="text-right text-[9.5px] sm:text-[10px] font-mono text-slate-600 space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center justify-end gap-1 text-emerald-900 font-black text-[10.5px] sm:text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>TOTP DYNAMIC REAL-TIME QR</span>
          </div>
          <p className="text-slate-500 text-[9px]">Presensi & Perizinan Terpusat</p>
          <p className="text-amber-800 font-bold truncate">
            Wali: {santri.nama_wali || 'Wali Terdaftar'}
          </p>
          <p className="text-slate-400 text-[8.5px] truncate">
            NIK Wali: {santri.nik_wali || '-'} • KK: {santri.no_kk || '-'}
          </p>
        </div>
      </div>

      {/* ─── 4. FOOTER & BARCODE ─── */}
      <div className="relative flex items-center justify-between text-[8px] sm:text-[9px] text-emerald-300 font-mono border-t border-amber-400/30 pt-2.5 mt-3">
        <span className="font-semibold tracking-wider text-amber-300/90">
          DARSA SMART CAMPUS SYSTEM
        </span>
        <span className="text-emerald-400">
          SECURE ID • TA 2025/2026
        </span>
      </div>

      {/* Print Button (Optional Overlay) */}
      {showActions && onPrint && (
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onPrint}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            🖨️ Cetak Kartu Santri Ini
          </button>
        </div>
      )}
    </div>
  );
}
