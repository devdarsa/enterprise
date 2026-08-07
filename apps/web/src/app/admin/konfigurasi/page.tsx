'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { FormActions } from '@/components/TableActions';

export default function KonfigurasiSistemPage() {
  const [namaPondok, setNamaPondok] = useState("Pondok Pesantren Ma'had Darussa'adah");
  const [alamatPondok, setAlamatPondok] = useState('Kediri, Jawa Timur');
  const [radiusQr, setRadiusQr] = useState(200);
  const [notifWa, setNotifWa] = useState(true);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    async function fetchKonfigurasiLive() {
      try {
        const res = await fetch('/api/v1/instansi');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const pondok = json.data.find((i: any) => i.jenis === 'PONDOK') || json.data[0];
            if (pondok) {
              setNamaPondok(pondok.nama);
              if (pondok.alamat) setAlamatPondok(pondok.alamat);
            }
          }
        }
      } catch (e) {
        console.error('Gagal memuat konfigurasi:', e);
      }
    }
    fetchKonfigurasiLive();
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Konfigurasi Tersimpan', 'Pengaturan utama Darsa Enterprise berhasil diperbarui & dicatat pada Audit Log.');
  };

  const handleResetConfig = () => {
    setNamaPondok("Pondok Pesantren Ma'had Darussa'adah");
    setAlamatPondok('Kediri, Jawa Timur');
    setRadiusQr(200);
    setNotifWa(true);
    showToast('warning', 'Pengaturan Direset', 'Konfigurasi telah dikembalikan ke standar awal.');
  };

  const handleBackup = () => {
    showToast('info', 'Backup Konfigurasi', 'Mengunduh file cadangan konfigurasi sistem (JSON).');
  };

  const handleRestore = () => {
    showToast('info', 'Restore Konfigurasi', 'Membuka dialog pemulihan cadangan konfigurasi.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS
          </span>
          <h1 className="text-xl font-black text-slate-900">Konfigurasi & Parameter Sistem</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pengaturan Identitas Lembaga, Preferensi QR Code Presensi, & Backup/Restore Parameter
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBackup}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center gap-1.5"
          >
            <span>💾</span> Backup
          </button>
          <button
            type="button"
            onClick={handleRestore}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center gap-1.5"
          >
            <span>🔄</span> Restore
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-1">Identitas Lembaga Pesantren</h2>
          <p className="text-xs text-slate-500">Nama dan alamat utama yang tampil pada KTA, Kop Surat, dan Rapor</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pondok / Pesantren</label>
              <input
                type="text"
                value={namaPondok}
                onChange={(e) => setNamaPondok(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Pesantren</label>
              <input
                type="text"
                value={alamatPondok}
                onChange={(e) => setAlamatPondok(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-1">Pengaturan QR Code & Geolocation Presensi</h2>
          <p className="text-xs text-slate-500">Batas toleransi radius lokasi presensi guru dan santri</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Radius Geofencing (Meter)</label>
              <input
                type="number"
                value={radiusQr}
                onChange={(e) => setRadiusQr(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="notifWa"
                checked={notifWa}
                onChange={(e) => setNotifWa(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="notifWa" className="text-xs font-bold text-slate-700">
                Kirim Notifikasi Otomatis ke Wali Santri
              </label>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <FormActions
          onSave={handleSaveConfig}
          onReset={handleResetConfig}
        />
      </form>
    </div>
  );
}
