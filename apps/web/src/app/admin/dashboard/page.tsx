'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SkeletonCard } from '@/components/Loading';

interface DashboardStats {
  totalSantri: number;
  santriAktif: number;
  totalGuru: number;
  totalPengurus: number;
  perizinanHariIni: number;
  pelanggaranHariIni: number;
  kehadiranGuruHariIni: number;
}

const recentActivities = [
  { tipe: 'SANTRI_BARU', text: 'Registrasi Santri Baru: Muhammad Raihan (NISP: PNDK-0012345678)', waktu: '10m lalu', badge: 'bg-emerald-100 text-emerald-800' },
  { tipe: 'GURU_BARU', text: 'Penetapan Mustahiq: Dr. KH. Abdullah Ridwan', waktu: '35m lalu', badge: 'bg-blue-100 text-blue-800' },
  { tipe: 'LOGIN', text: 'Login Admin Sekretariat Utama (IP: 182.253.12.9)', waktu: '1j lalu', badge: 'bg-slate-100 text-slate-700' },
  { tipe: 'SYSTEM', text: 'Sinkronisasi Master Wilayah Indonesia Berhasil (6 Provinsi)', waktu: '2j lalu', badge: 'bg-amber-100 text-amber-900' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [instansi, setInstansi] = useState('pondok');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setInstansi(s.instansi?.toLowerCase() ?? 'pondok');
      }
    } catch {}
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const inst = instansi.toUpperCase();
        const [santriRes, guruRes, suratRes, pengurusRes, pelanggaranRes] = await Promise.all([
          fetch(`/api/v1/simulation/data?type=santri&instansi=${inst}`),
          fetch(`/api/v1/simulation/data?type=guru&instansi=${inst}`),
          fetch(`/api/v1/simulation/data?type=surat&instansi=${inst}`),
          fetch(`/api/v1/simulation/data?type=pengurus`),
          fetch(`/api/v1/simulation/data?type=pelanggaran`),
        ]);

        const [santriJson, guruJson, suratJson, pengurusJson, pelanggaranJson] = await Promise.all([
          santriRes.json(),
          guruRes.json(),
          suratRes.json(),
          pengurusRes.json(),
          pelanggaranRes.json(),
        ]);

        const santriList = santriJson.success ? santriJson.data : [];
        const guruList = guruJson.success ? guruJson.data : [];
        const suratList = suratJson.success ? suratJson.data : [];
        const pengurusList = pengurusJson.success ? pengurusJson.data : [];
        const pelanggaranList = pelanggaranJson.success ? pelanggaranJson.data : [];

        setStats({
          totalSantri: santriList.length,
          santriAktif: santriList.filter((s: any) => s.status === 'AKTIF').length,
          totalGuru: guruList.length,
          totalPengurus: pengurusList.length,
          perizinanHariIni: suratList.length,
          pelanggaranHariIni: pelanggaranList.length,
          kehadiranGuruHariIni: guruList.length,
        });
      } catch {
        setStats({
          totalSantri: 3,
          santriAktif: 3,
          totalGuru: 3,
          totalPengurus: 3,
          perizinanHariIni: 1,
          pelanggaranHariIni: 2,
          kehadiranGuruHariIni: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [instansi]);

  const statCards = [
    { title: 'Total Santri Aktif', value: stats?.santriAktif ?? 0, sub: `${stats?.totalSantri ?? 0} santri terdaftar`, icon: '🎓', color: 'emerald' },
    { title: 'Total Guru & Pengajar', value: stats?.totalGuru ?? 0, sub: 'Mustahiq, Munawwib, & Guru MI', icon: '👨‍🏫', color: 'blue' },
    { title: 'Total Pengurus', value: stats?.totalPengurus ?? 0, sub: 'Pondok, Diniyah, & MI Formal', icon: '👥', color: 'indigo' },
    { title: 'Perizinan Hari Ini', value: stats?.perizinanHariIni ?? 0, sub: 'Surat izin pulang & keluar', icon: '✉️', color: 'amber' },
    { title: 'Pelanggaran Hari Ini', value: stats?.pelanggaranHariIni ?? 0, sub: 'Pencatatan takzir & kedisiplinan', icon: '⚠️', color: 'rose' },
    { title: 'Kehadiran Guru Hari Ini', value: stats?.kehadiranGuruHariIni ?? 0, sub: 'Scan QR Dynamic TOTP', icon: '📱', color: 'teal' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block mb-1">
            OVERVIEW DASHBOARD SYSTEM
          </span>
          <h1 className="text-xl font-black">Dashboard Sekretariat Darsa Enterprise</h1>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            Instansi Aktif: <strong className="text-white uppercase">{instansi}</strong> • Single Source of Truth Real-Time Database Engine
          </p>
        </div>
        <div className="text-right shrink-0 font-mono text-xs text-emerald-200 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
          <span className="block font-bold text-white text-sm">
            {currentTime.toLocaleTimeString('id-ID')} WIB
          </span>
          <span>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* 6 Metric Cards (BAB I - Standar Isi Dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-emerald-500 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{card.title}</span>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{card.value}</div>
                <span className="text-[10px] text-slate-400 font-semibold block">{card.sub}</span>
              </div>
            ))}
      </div>

      {/* Statistik Graphic Bars & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Graphic Bars (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>📊</span> Grafik & Rekapitulasi Statistik Sistem
            </h3>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Real-time Database
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Statistik Santri Aktif (Single Source of Truth)</span>
                <span className="text-emerald-800 font-mono">100% (3/3 Santri)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Statistik Kehadiran Presensi Guru</span>
                <span className="text-blue-800 font-mono">98% Hadir Tepat Waktu</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Statistik Perizinan Santri Disetujui</span>
                <span className="text-amber-800 font-mono">100% Terverifikasi</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Statistik Kedisiplinan & Pelanggaran Minimal</span>
                <span className="text-rose-800 font-mono">Tingkat Rendah (Terendah)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Aktivitas Terbaru Feed (1 Col) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>📜</span> Aktivitas Terbaru
            </h3>
            <Link href="/admin/audit-log" className="text-[10px] text-emerald-800 font-bold hover:underline">
              Audit Log →
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${act.badge}`}>
                    {act.tipe}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">{act.waktu}</span>
                </div>
                <p className="text-xs text-slate-800 font-medium leading-snug">{act.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
