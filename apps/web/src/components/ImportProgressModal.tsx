'use client';

import { useEffect } from 'react';

interface ImportProgressModalProps {
  isOpen: boolean;
  title?: string;
  totalRows: number;
  currentRow: number;
  currentName?: string;
  successCount: number;
  errorCount: number;
}

export function ImportProgressModal({
  isOpen,
  title = 'Proses Impor Data Excel Selesai',
  totalRows,
  currentRow,
  currentName = '',
  successCount,
  errorCount,
}: ImportProgressModalProps) {
  // Prevent accidental page reload / navigation while importing
  useEffect(() => {
    if (!isOpen) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Proses impor data sedang berjalan di latar belakang. Yakin ingin keluar?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = totalRows > 0 ? Math.min(Math.round((currentRow / totalRows) * 100), 100) : 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-5 text-center relative overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-700 absolute top-0 left-0 right-0 animate-pulse" />

        {/* Icon & Title */}
        <div className="pt-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-2xl flex items-center justify-center mx-auto shadow-inner mb-3 animate-bounce">
            ⏳
          </div>
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Harap tunggu dan <span className="text-rose-600 font-bold underline">JANGAN REFRESH</span> halaman ini.
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-extrabold px-1">
            <span className="text-emerald-800">
              Baris Ke-{currentRow} dari {totalRows} Data
            </span>
            <span className="text-emerald-950 font-black text-sm">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-4 p-0.5 border border-slate-200 shadow-inner overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-200 shadow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Currently Processing Row Detail */}
        {currentName && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 truncate">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-extrabold mb-0.5">
              Sedang Memproses:
            </span>
            <span className="text-emerald-900 font-black truncate block">{currentName}</span>
          </div>
        )}

        {/* Live Counters Badge */}
        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-extrabold text-emerald-900 text-center">
            <span className="text-[10px] text-emerald-600 block">✅ Berhasil Masuk</span>
            <span className="text-lg font-black">{successCount} Data</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 font-extrabold text-amber-900 text-center">
            <span className="text-[10px] text-amber-600 block">⚠️ Duplikat / Gagal</span>
            <span className="text-lg font-black">{errorCount} Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
