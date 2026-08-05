'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';

export default function KonfigurasiSistemPage() {
  const [namaPondok, setNamaPondok] = useState("Ma'had Darussa'adah Lirboyo");
  const [alamatPondok, setAlamatPondok] = useState('Jl. KH. Abdul Karim No. 12, Lirboyo, Kota Kediri');
  const [radiusQr, setRadiusQr] = useState(200);
  const [notifWa, setNotifWa] = useState(true);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Konfigurasi Tersimpan', 'Pengaturan utama Darsa Enterprise berhasil diperbarui.');
  };

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS
          </span>
          <h1 className="text-xl font-black text-slate-900">Konfigurasi & Parameter Sistem</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pengaturan Identitas Lembaga, Preferensi QR Code Presensi, & Parameter Utama SaaS
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveConfig} className="space-y-6 max-w-3xl">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">🏛️ 1. Identitas Utama Pondok Pesantren</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Resmi Lembaga</label>
              <input type="text" value={namaPondok} onChange={(e) => setNamaPondok(e.target.value)} className="input-premium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lembaga</label>
              <input type="text" value={alamatPondok} onChange={(e) => setAlamatPondok(e.target.value)} className="input-premium" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">📱 2. Konfigurasi QR Code & Presensi</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Radius Geolocation Validasi Presensi (Meter)</label>
              <input type="number" value={radiusQr} onChange={(e) => setRadiusQr(parseInt(e.target.value) || 200)} className="input-premium" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="waNotif" checked={notifWa} onChange={(e) => setNotifWa(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <label htmlFor="waNotif" className="text-xs font-bold text-slate-700">Aktifkan Notifikasi WhatsApp Otomatis ke Wali Santri Saat Presensi</label>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-lg shadow-emerald-700/20 transition-all">
          💾 Simpan Konfigurasi Sistem
        </button>
      </form>
    </div>
  );
}
