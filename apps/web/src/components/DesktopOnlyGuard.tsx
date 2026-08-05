'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DesktopOnlyGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <Image src="/logo-lirboyo.png" alt="Logo Lirboyo" fill className="object-contain" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
              ⚠️ AKSES SMARTPHONE DIBLOKIR
            </span>
            <h1 className="text-xl font-black text-white">Modul Sekretariat Khusus Desktop</h1>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Sesuai ketentuan Darsa Enterprise, aktivitas administrasi Sekretariat (Pondok, Diniyah, & MI) <strong>hanya dapat diakses melalui Laptop atau Komputer Desktop berlayar besar</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-left text-xs space-y-2">
            <strong className="text-amber-400 block font-bold">📌 Ketentuan Akses Perangkat:</strong>
            <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1">
              <li>Minimal Ukuran Layar: <strong>1024px (Laptop/Desktop)</strong></li>
              <li>Perangkat Anda: <strong>Smartphone / Tablet Kecil</strong></li>
              <li>Untuk Wali Santri & Guru, silakan gunakan Portal Mobile.</li>
            </ul>
          </div>

          <a
            href="/login"
            className="block w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all"
          >
            ← Kembali ke Halaman Login Portal
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
