'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';

export default function SantriDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const [user, setUser] = useState({ nama: 'Muhammad Raihan', role: 'SANTRI', instansi: 'PONDOK' });
  const [santriData, setSantriData] = useState<any>(null);
  const [jadwalHariIni, setJadwalHariIni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setUser({ nama: s.nama, role: s.role, instansi: s.instansi || 'PONDOK' });
      }
    } catch {}
  }, []);

  useEffect(() => { fetchSantriSelfData(); }, [user.instansi]);

  const fetchSantriSelfData = async () => {
    setLoading(true);
    try {
      const [resSantri, resJadwal] = await Promise.all([
        fetch(`/api/v1/simulation/data?type=santri&instansi=${user.instansi}`),
        fetch(`/api/v1/simulation/data?type=jadwal&instansi=${user.instansi}`),
      ]);
      const jsonSantri = await resSantri.json();
      const jsonJadwal = await resJadwal.json();

      if (jsonSantri.success && jsonSantri.data.length > 0) {
        setSantriData(jsonSantri.data[0]);
      }
      if (jsonJadwal.success) {
        setJadwalHariIni(jsonJadwal.data);
      }
    } catch {
      setToast({ isOpen: true, type: 'error', title: 'Gagal Memuat', message: 'Tidak dapat terhubung ke database.' });
    } finally {
      setLoading(false);
    }
  };

  const santriName = santriData ? santriData.nama : user.nama;
  const santriClass = santriData ? santriData.kelas : '10-A (Tahfidz)';
  const santriNisn = santriData ? santriData.nisn : '0012345678';
  const santriJuz = santriData ? santriData.hafalan_juz || 12 : 12;

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
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">
                PORTAL SANTRI MANDIRI • {user.instansi}
              </span>
              <h1 className="text-xl font-black text-white">{santriName}</h1>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">NISN: {santriNisn} &bull; Kelas {santriClass}</p>
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
          { label: 'Hafalan', value: `${santriJuz} Juz`, sub: 'Surah Al-Isra', icon: '📖', color: 'bg-emerald-50 border-emerald-200' },
          { label: 'Nilai Tajwid', value: '95', sub: 'MUMTAZ', icon: '⭐', color: 'bg-amber-50 border-amber-200' },
          { label: 'Presensi', value: '96%', sub: 'Hadir Bulan Ini', icon: '📍', color: 'bg-teal-50 border-teal-200' },
          { label: 'Status SPP', value: 'LUNAS', sub: 'Agustus 2026', icon: '💳', color: 'bg-emerald-50 border-emerald-200' },
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

      {/* Jadwal Pelajaran */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Jadwal Pelajaran & KBM</h2>
            <p className="text-xs text-slate-500 mt-0.5">Jadwal terintegrasi dari Database lokal</p>
          </div>
          <span className="text-2xl">📅</span>
        </div>
        {jadwalHariIni.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">Belum ada jadwal KBM terdaftar.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jadwalHariIni.map((j, i) => (
              <div key={i} className={`px-5 py-4 flex items-center gap-4 ${i === 0 ? 'bg-emerald-50/40' : ''}`}>
                <div className="w-1.5 h-10 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">{j.mapel}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Ust. {j.guru} &bull; {j.ruang}</p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">{j.jam}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
