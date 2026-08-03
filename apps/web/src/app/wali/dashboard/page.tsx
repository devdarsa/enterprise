'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';

export default function WaliDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [user, setUser] = useState({ nama: 'Bapak Hendra', role: 'WALI_SANTRI' });

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setUser({ nama: s.nama, role: s.role });
      }
    } catch {}
  }, []);

  const childData = {
    nama: 'Muhammad Raihan',
    nisn: '0012345678',
    kelas: '10-A (Tahfidz & Sains)',
    pondok: "Ma'had Darussa'adah Lirboyo Kota Kediri",
    presensi: { status: 'HADIR', waktu: '06:45 WIB', jarak: '28m' },
    hafalan: { juz: 15, surah: 'Al-Isra', predikat: 'MUMTAZ', nilai: 95 },
    spp: { status: 'LUNAS', bulan: 'Agustus 2026', nominal: 350000 },
  };

  const riwayatPresensi = [
    { tanggal: 'Senin, 4 Agt 2026', status: 'HADIR', waktu: '06:45 WIB', jarak: '28m' },
    { tanggal: 'Selasa, 5 Agt 2026', status: 'HADIR', waktu: '06:52 WIB', jarak: '35m' },
    { tanggal: 'Rabu, 6 Agt 2026', status: 'TERLAMBAT', waktu: '07:18 WIB', jarak: '62m' },
    { tanggal: 'Kamis, 7 Agt 2026', status: 'HADIR', waktu: '06:48 WIB', jarak: '30m' },
    { tanggal: "Jum'at, 8 Agt 2026", status: 'HADIR', waktu: '07:00 WIB', jarak: '41m' },
  ];

  const riwayatHafalan = [
    { tanggal: '3 Agt 2026', juz: 15, surah: 'Al-Isra', nilai: 95, ustadz: 'Ust. Fatimah' },
    { tanggal: '1 Agt 2026', juz: 14, surah: "An-Nahl", nilai: 92, ustadz: 'Ust. Fatimah' },
    { tanggal: '30 Jul 2026', juz: 13, surah: 'Ar-Ra\'d', nilai: 88, ustadz: 'Ust. Fatimah' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border border-emerald-600 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-[3px] border-amber-400 overflow-hidden shadow-xl shadow-black/20 shrink-0">
              <Image src="/logo-lirboyo.png" alt="Logo" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">PORTAL WALI SANTRI LIRBOYO</span>
              <h1 className="text-xl font-black text-white">{user.nama}</h1>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Orang Tua / Wali dari: <strong>{childData.nama}</strong> • Kelas {childData.kelas}
              </p>
            </div>
          </div>
          <Link href="/login" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shrink-0">
            🚪 Keluar
          </Link>
        </div>
      </div>

      {/* Child Profile Card */}
      <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
            {childData.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">{childData.nama}</h2>
            <p className="text-xs text-slate-500 font-medium">NISN: {childData.nisn} • {childData.kelas}</p>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">{childData.pondok}</p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              ✅ Santri Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Presensi */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Presensi Hari Ini</span>
            <span className="text-xl">📍</span>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              childData.presensi.status === 'HADIR'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${childData.presensi.status === 'HADIR' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              {childData.presensi.status}
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-1 font-medium">
            <p>⏰ {childData.presensi.waktu}</p>
            <p>📡 Radius GPS: {childData.presensi.jarak}</p>
          </div>
        </div>

        {/* Hafalan */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Capaian Hafalan</span>
            <span className="text-xl">📖</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{childData.hafalan.juz} Juz</div>
            <div className="text-xs text-slate-500 font-medium">Surah: {childData.hafalan.surah}</div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              ⭐ {childData.hafalan.predikat}
            </span>
            <span className="text-lg font-black text-emerald-700">{childData.hafalan.nilai}/100</span>
          </div>
        </div>

        {/* SPP */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pembayaran SPP</span>
            <span className="text-xl">💳</span>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              ✅ {childData.spp.status}
            </span>
            <p className="text-xs text-slate-500 font-medium mt-2">Bulan: {childData.spp.bulan}</p>
          </div>
          <button
            onClick={() => showToast('info', 'Payment Gateway', 'Fitur pembayaran online segera hadir.')}
            className="w-full py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm"
          >
            💳 Bayar Online
          </button>
        </div>
      </div>

      {/* Tabs: Riwayat Presensi & Hafalan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Riwayat Presensi */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Riwayat Presensi Mingguan</h3>
            <p className="text-xs text-slate-500 mt-0.5">5 hari terakhir via GPS Geofencing</p>
          </div>
          <div className="divide-y divide-slate-100">
            {riwayatPresensi.map((p, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{p.tanggal}</p>
                  <p className="text-[11px] text-slate-400 font-medium">⏰ {p.waktu} • 📡 {p.jarak}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  p.status === 'HADIR'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Riwayat Hafalan */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Riwayat Setoran Tahfidz</h3>
            <p className="text-xs text-slate-500 mt-0.5">Mutaba'ah hafalan terbaru</p>
          </div>
          <div className="divide-y divide-slate-100">
            {riwayatHafalan.map((h, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-black text-emerald-700 text-sm shrink-0">{h.juz}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">{h.surah}</p>
                  <p className="text-[11px] text-slate-400">👤 {h.ustadz} • {h.tanggal}</p>
                </div>
                <span className={`font-black text-base ${h.nilai >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>{h.nilai}</span>
              </div>
            ))}
          </div>
          <div className="p-4">
            <Link href="/admin/akademik/rapor" className="w-full py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
              📜 Lihat & Cetak Rapor Digital
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
