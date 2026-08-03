'use client';

import { useState, useEffect } from 'react';

export default function QRDisplayPage() {
  const [token, setToken] = useState('DARSA-QR-9F8A2B3C');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Generate new token hex simulation
          const newHex = Math.random().toString(36).substring(2, 10).toUpperCase();
          setToken(`DARSA-QR-${newHex}`);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
      {/* Geofencing Status Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        Geofencing GPS Active: Gerbang Utama (Radius 200m)
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl max-w-sm w-full relative overflow-hidden">
        {/* Dynamic Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />

        <h2 className="text-lg font-bold text-slate-100 mb-1">Pondok Pesantren Darsa</h2>
        <p className="text-xs text-slate-400 mb-6">Scan QR Kode melalui Aplikasi Mobile Santri / Ustadz</p>

        {/* Dynamic Simulated QR Code Visual Box */}
        <div className="w-64 h-64 mx-auto bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner mb-6">
          {/* QR Grid Pattern Simulation */}
          <div className="w-full h-full border-2 border-dashed border-emerald-500/30 rounded-xl flex flex-col items-center justify-center p-2 bg-slate-900/50">
            <div className="w-16 h-16 bg-emerald-400 rounded-lg flex items-center justify-center text-slate-950 font-black text-2xl mb-3 shadow-lg shadow-emerald-500/30">
              QR
            </div>
            <div className="font-mono text-emerald-400 font-bold text-xs tracking-widest bg-slate-950 px-3 py-1 rounded-md border border-slate-800">
              {token}
            </div>
          </div>
        </div>

        {/* Countdown Indicator */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
          <span>Refresh Kode QR dalam:</span>
          <span className="text-emerald-400 font-bold text-sm animate-pulse">{countdown} detik</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 max-w-md">
        *Sistem menggunakan algoritma TOTP (Upstash Redis) dengan regenerasi otomatis untuk mencegah pemalsuan / kecurangan presensi jarak jauh.
      </p>
    </div>
  );
}
