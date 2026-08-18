'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';

export default function QRDisplayPage() {
  const [token, setToken] = useState<string>('MEMUAT...');
  const [countdown, setCountdown] = useState(10);
  const [qrSrc, setQrSrc] = useState<string>('');

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/v1/absensi/qr-session', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        const newToken = json?.data?.qr_token || json?.data?.token;
        if (newToken) {
          setToken(newToken);
          setCountdown(10);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil sesi QR presensi dari database:', err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (token && token !== 'MEMUAT...') {
      generateQRCode(token);
    }
  }, [token]);

  const generateQRCode = async (text: string) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#052e16',
          light: '#ffffff',
        },
      });
      setQrSrc(url);
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchSession();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-6 p-4">
      {/* Geofencing Status Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        Sistem Absensi Geofencing GPS Active: Gerbang Utama (Radius 200m)
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl max-w-md w-full relative overflow-hidden text-white">
        {/* Dynamic Glowing Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="relative w-10 h-10 rounded-full border-2 border-amber-400 overflow-hidden shadow-md">
              <Image src="/logo-pondok.png" alt="Logo Lirboyo" fill className="object-cover" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-black text-white leading-tight uppercase">Ma'had Darussa'adah Lirboyo</h2>
              <p className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase">DYNAMIC QR CODE PRESENSI</p>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            Arahkan kamera smartphone Ustadz / Pengajar & Pengurus untuk melakukan presensi kehadiran real-time.
          </p>

          {/* Real Scannable QR Code Canvas Box */}
          <div className="w-72 h-72 mx-auto bg-white border-4 border-emerald-500 rounded-3xl p-4 flex items-center justify-center relative shadow-2xl my-4">
            {qrSrc ? (
              <Image src={qrSrc} alt="QR Presensi" width={300} height={300} unoptimized className="w-full h-full object-contain rounded-xl" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                Generating QR...
              </div>
            )}
          </div>

          {/* Live Token & Countdown */}
          <div className="space-y-2">
            <div className="font-mono text-emerald-400 font-black text-sm tracking-widest bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 inline-block shadow-inner">
              {token}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800/80">
              <span>Refresh Otomatis:</span>
              <span className="text-emerald-400 font-bold text-sm animate-pulse">{countdown} Detik</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 max-w-md font-medium">
        *Menggunakan enkripsi TOTP dinamis terhubung ke Server Keamanan Terpadu untuk menjamin validitas presensi dewan pengajar & pengurus ma'had.
      </p>
    </div>
  );
}
