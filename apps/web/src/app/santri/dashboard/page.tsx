'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';

export default function SantriDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const [user, setUser] = useState({ nama: 'Muhammad Raihan', role: 'SANTRI' });

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setUser({ nama: s.nama, role: s.role });
      }
    } catch {}
  }, []);

  const data = {
    kelas: '10-A (Tahfidz & Sains)',
    nisn: '0012345678',
    hafalan: { juz: 15, surah: 'Al-Isra', nilai: 95, predikat: 'MUMTAZ' },
    presensi: { persen: '90%', hadir: 18, terlambat: 2, alpha: 0 },
    spp: 'LUNAS',
    jadwalHariIni: [
      { mapel: "Tahfidz Al-Qur'an", jam: '07:30 - 09:00', ruang: 'Ruang 10-A', ustadz: 'Ust. Fatimah' },
      { mapel: 'Bahasa Arab (Saraf)', jam: '09:30 - 11:00', ruang: 'Ruang 10-A', ustadz: 'Ust. Zulkarnain' },
      { mapel: 'Fiqih & Usul Fiqih', jam: '13:00 - 14:30', ruang: 'Ruang 10-A', ustadz: 'Ust. Ahmad Al-Farisi' },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 text-white border border-emerald-600 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-[3px] border-amber-400 overflow-hidden shadow-xl shrink-0">
              <Image src="/logo-pondok.png" alt="Logo" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">PORTAL SANTRI MANDIRI</span>
              <h1 className="text-xl font-black text-white">{user.nama}</h1>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">NISN: {data.nisn} &bull; Kelas {data.kelas}</p>
            </div>
          </div>
          <Link href="/login" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shrink-0">
            Keluar
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Hafalan', value: `${data.hafalan.juz} Juz`, sub: data.hafalan.surah, icon: '📖', color: 'bg-emerald-50 border-emerald-200' },
          { label: 'Nilai Tajwid', value: `${data.hafalan.nilai}`, sub: data.hafalan.predikat, icon: '⭐', color: 'bg-amber-50 border-amber-200' },
          { label: 'Presensi', value: data.presensi.persen, sub: `${data.presensi.hadir} hadir bulan ini`, icon: '📍', color: 'bg-teal-50 border-teal-200' },
          { label: 'Status SPP', value: data.spp, sub: 'Agustus 2026', icon: '💳', color: 'bg-emerald-50 border-emerald-200' },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${card.color} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="text-lg font-black text-slate-900">{card.value}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Jadwal Hari Ini */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Jadwal Hari Ini</h2>
            <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <span className="text-2xl">📅</span>
        </div>
        <div className="divide-y divide-slate-100">
          {data.jadwalHariIni.map((j, i) => (
            <div key={i} className={`px-5 py-4 flex items-center gap-4 ${i === 0 ? 'bg-emerald-50/40' : ''}`}>
              <div className="w-1.5 h-10 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">{j.mapel}</p>
                <p className="text-xs text-slate-500 mt-0.5">Ust. {j.ustadz} &bull; {j.ruang}</p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">{j.jam}</span>
            </div>
          ))}
        </div>
        <div className="p-4">
          <Link href="/admin/jadwal" className="w-full py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
            Lihat Jadwal Mingguan Lengkap
          </Link>
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Akses Cepat</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Rapor Digital', icon: '📜', href: '/admin/akademik/rapor', color: 'bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-400' },
            { label: 'Jadwal Pelajaran', icon: '📅', href: '/admin/jadwal', color: 'bg-teal-50 border-teal-200 text-teal-800 hover:border-teal-400' },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 p-4 rounded-2xl bg-white border ${item.color} transition-all duration-200 shadow-sm hover:shadow-md group`}>
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
