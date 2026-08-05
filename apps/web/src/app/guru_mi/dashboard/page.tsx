'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import MobileBottomNav from '@/components/MobileBottomNav';

interface PresensiLog {
  id: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN';
  jarak: string;
}

export default function GuruMIDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [user, setUser] = useState({ nama: 'Ustadzah Fatimah, S.Pd', role: 'GURU_MI', nip: '199208152018022003' });
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [riwayat, setRiwayat] = useState<PresensiLog[]>([
    { id: '1', tanggal: 'Rabu, 5 Agt 2026', waktu: '06:42 WIB', lokasi: 'Pos Utama MI Darussa’adah', status: 'HADIR', jarak: '18m' },
    { id: '2', tanggal: 'Selasa, 4 Agt 2026', waktu: '06:48 WIB', lokasi: 'Pos Utama MI Darussa’adah', status: 'HADIR', jarak: '24m' },
    { id: '3', tanggal: 'Senin, 3 Agt 2026', waktu: '07:12 WIB', lokasi: 'Pos Utama MI Darussa’adah', status: 'TERLAMBAT', jarak: '45m' },
    { id: '4', tanggal: 'Jumat, 31 Jul 2026', waktu: '06:40 WIB', lokasi: 'Pos Utama MI Darussa’adah', status: 'HADIR', jarak: '15m' },
  ]);

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setUser(prev => ({ ...prev, nama: s.nama || prev.nama }));
      }
    } catch {}
  }, []);

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setIsScanModalOpen(false);
      const newLog: PresensiLog = {
        id: Date.now().toString(),
        tanggal: 'Hari Ini (5 Agt 2026)',
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        lokasi: 'Gerbang Formal MI Lirboyo',
        status: 'HADIR',
        jarak: '12m',
      };
      setRiwayat([newLog, ...riwayat]);
      showToast('success', 'Presensi Berhasil!', 'Scan QR Code kehadiran Guru MI terverifikasi dalam radius Geofencing.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header Profile Card */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border border-emerald-600 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-[3px] border-amber-400 overflow-hidden shadow-xl shrink-0">
              <Image src="/logo-mi.png" alt="Logo MI" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">
                PORTAL KHUSUS GURU MI • AKADEMIK VIA APPS EKSTERNAL
              </span>
              <h1 className="text-xl font-black text-white">{user.nama}</h1>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                NIP: {user.nip} • Madrasah Ibtida’iyyah Darussa’adah Lirboyo
              </p>
            </div>
          </div>
          <Link href="/login" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shrink-0">
            Keluar
          </Link>
        </div>
      </div>

      {/* Primary Action Card: Scan QR Code */}
      <div id="scan" className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xl shadow-slate-200/50 text-center space-y-4 scroll-mt-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl text-emerald-700 shadow-sm animate-bounce">
          📱
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Presensi Mandiri Guru MI</h2>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mt-1">
            Lakukan scan QR Code TOTP pada display pos keamanan / kantor MI untuk mencatat kehadiran harian Anda.
          </p>
        </div>
        <button
          onClick={() => setIsScanModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
        >
          📷 Buka Pemindai QR Code
        </button>
      </div>

      {/* Info Restriction Alert */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-3">
        <span className="text-base shrink-0">ℹ️</span>
        <div>
          <strong className="block font-bold mb-0.5">Catatan Hak Akses Guru MI:</strong>
          Sistem Darsa Enterprise untuk Guru MI dikhususkan untuk **Presensi & Scan QR Code**. Pengelolaan nilai dan akademik siswa MI menggunakan aplikasi khusus terpisah.
        </div>
      </div>

      {/* Jadwal Mengajar Guru MI */}
      <div id="jadwal" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 scroll-mt-6">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <span>📅</span> Jadwal Mengajar Formal MI
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">Senin & Rabu • 07:00 - 08:30</span>
            <h3 className="text-xs font-black text-slate-900 mt-2">Bahasa Arab & Al-Qur'an Hadits</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Kelas 4-A MI Darussa'adah • Gedung Formal Lt. 2</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded uppercase">Selasa & Kamis • 08:30 - 10:00</span>
            <h3 className="text-xs font-black text-slate-900 mt-2">Akidah Akhlak & Fiqih Formal</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Kelas 5-B MI Darussa'adah • Gedung Formal Lt. 2</p>
          </div>
        </div>
      </div>

      {/* Riwayat Absensi Pribadi */}
      <div id="riwayat" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span>📊</span> Riwayat Kehadiran Pribadi
          </h2>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Total Hadir: {riwayat.filter(r => r.status === 'HADIR').length} Hari
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {riwayat.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">{log.tanggal}</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {log.lokasi} • Jarak Geofencing: {log.jarak}
                </span>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                  log.status === 'HADIR' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {log.status} ({log.waktu})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Scanner QR Code */}
      <Modal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Pemindai QR Code Presensi Guru MI"
      >
        <div className="text-center py-6 space-y-4">
          <div className="w-48 h-48 mx-auto border-4 border-dashed border-emerald-500 rounded-3xl flex items-center justify-center bg-slate-900/5 relative overflow-hidden">
            {scanning ? (
              <div className="animate-spin text-4xl">⏳</div>
            ) : (
              <div className="space-y-2">
                <span className="text-5xl block animate-pulse">📷</span>
                <span className="text-[11px] text-slate-500 font-bold block">Arahkan ke Kamera</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Memverifikasi lokasi GPS dan TOTP token dari Display QR Code MI Lirboyo Kediri.
          </p>
          <button
            onClick={handleSimulateScan}
            disabled={scanning}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
          >
            {scanning ? 'Memverifikasi Presensi...' : 'Simulasi Scan QR Presensi'}
          </button>
        </div>
      </Modal>

      <MobileBottomNav role="GURU_MI" />
    </div>
  );
}
