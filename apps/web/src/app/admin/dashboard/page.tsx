'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SkeletonCard } from '@/components/Loading';

interface DashboardStats {
  totalSantri: number;
  totalGuru: number;
  totalSurat: number;
  totalKeuangan: number;
  santriAktif: number;
}

interface RecentLog {
  nama: string;
  kelas: string;
  waktu: string;
  status: string;
  jarak: string;
}

const recentLogs: RecentLog[] = [
  { nama: 'Muhammad Raihan', kelas: '10-A (Tahfidz)', waktu: '06:45:12 WIB', status: 'HADIR', jarak: '28m' },
  { nama: 'Ahmad Fauzi', kelas: '10-A (Tahfidz)', waktu: '06:50:44 WIB', status: 'HADIR', jarak: '45m' },
  { nama: 'Siti Aminah', kelas: '11-B (Sains)', waktu: '07:15:02 WIB', status: 'TERLAMBAT', jarak: '62m' },
  { nama: 'Fajar Hidayat', kelas: '12-C (IPS)', waktu: '07:18:30 WIB', status: 'TERLAMBAT', jarak: '110m' },
  { nama: 'Nurul Hidayah', kelas: '10-B (Sains)', waktu: '07:05:20 WIB', status: 'HADIR', jarak: '35m' },
];

const auditLogs = [
  { event: 'LOGIN_SUCCESS', user: 'admin@darsa.id via Passkey', time: '06:40 WIB', color: 'emerald' },
  { event: 'SCAN_ABSENSI_VALID', user: 'Muhammad Raihan (Radius 28m)', time: '06:45 WIB', color: 'emerald' },
  { event: 'QR_SESSION_REFRESH', user: 'TOTP Token Refreshed (gerbang-01)', time: '06:50 WIB', color: 'blue' },
  { event: 'SURAT_DIBUAT', user: 'Admin membuat surat izin sakit', time: '07:10 WIB', color: 'amber' },
  { event: 'SPP_LUNAS', user: 'Ahmad Fauzi — Agustus 2026', time: '07:30 WIB', color: 'emerald' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [instansi, setInstansi] = useState('pondok');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Read instansi from session
  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setInstansi(s.instansi?.toLowerCase() ?? 'pondok');
      }
    } catch {}
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch dashboard stats dynamically from simulationDB
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const inst = instansi.toUpperCase();
        const [santriRes, guruRes, suratRes, keuRes] = await Promise.all([
          fetch(`/api/v1/simulation/data?type=santri&instansi=${inst}`),
          fetch(`/api/v1/simulation/data?type=guru&instansi=${inst}`),
          fetch(`/api/v1/simulation/data?type=surat&instansi=${inst}`),
          fetch(`/api/v1/simulation/data?type=transaksi&instansi=${inst}`),
        ]);

        const [santriJson, guruJson, suratJson, keuJson] = await Promise.all([
          santriRes.json(),
          guruRes.json(),
          suratRes.json(),
          keuRes.json(),
        ]);

        const santriList = santriJson.success ? santriJson.data : [];
        const guruList = guruJson.success ? guruJson.data : [];
        const suratList = suratJson.success ? suratJson.data : [];
        const keuList = keuJson.success ? keuJson.data : [];

        setStats({
          totalSantri: santriList.length,
          santriAktif: santriList.filter((s: any) => s.status === 'AKTIF').length,
          totalGuru: guruList.length,
          totalSurat: suratList.length,
          totalKeuangan: keuList.filter((k: any) => k.status === 'LUNAS').length,
        });
      } catch {
        setStats({ totalSantri: 0, santriAktif: 0, totalGuru: 0, totalSurat: 0, totalKeuangan: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [instansi]);

  const statCards = [
    {
      label: 'Total Santri Aktif',
      value: stats ? `${stats.santriAktif}` : '-',
      sub: stats ? `${stats.totalSantri} total terdaftar` : '-',
      icon: '🎓',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
      trend: '+3%',
    },
    {
      label: 'Guru & Ustadz',
      value: stats ? `${stats.totalGuru}` : '-',
      sub: '100% Terverifikasi',
      icon: '👨‍🏫',
      color: 'from-teal-500 to-teal-600',
      bg: 'bg-teal-50 border-teal-200',
      trend: 'stabil',
    },
    {
      label: 'Surat & Izin',
      value: stats ? `${stats.totalSurat}` : '-',
      sub: 'Total surat aktif',
      icon: '✉️',
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50 border-amber-200',
      trend: '+2',
    },
    {
      label: 'Batas Geofencing',
      value: '200m',
      sub: 'Haversine GPS Presisi',
      icon: '🌐',
      color: 'from-slate-500 to-slate-600',
      bg: 'bg-slate-100 border-slate-200',
      trend: 'aktif',
    },
  ];

  const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-7">
      {/* Welcome Hero Banner */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border border-emerald-600 overflow-hidden shadow-xl shadow-emerald-900/20">
        {/* Background orbs */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute right-16 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-12" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <span className="text-[10px] font-bold text-amber-300 tracking-widest uppercase block mb-1">
              MA'HAD DARUSSA'ADAH LIRBOYO KOTA KEDIRI
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
              Selamat Datang, Sistem Berjalan ✨
            </h1>
            <p className="text-xs text-emerald-100 mt-1.5 font-medium">
              Dashboard Darsa Enterprise — Terpadu {instansi.charAt(0).toUpperCase() + instansi.slice(1)} Lirboyo
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="text-right">
              <div className="text-2xl font-black text-white font-mono tracking-tight">{timeStr}</div>
              <div className="text-[10px] text-emerald-200 font-medium">{dateStr}</div>
            </div>

            <Link
              href="/admin/absensi/qr-display"
              className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 hover:bg-amber-300 transition-all duration-200 flex items-center gap-2 shrink-0"
            >
              <span>📱</span> QR Display
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border ${card.bg} shadow-sm hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold text-slate-600">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  {card.icon}
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight text-slate-900 mb-1">{card.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">{card.sub}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  {card.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Attendance + Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attendance Feed */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live Presensi Real-Time</h2>
              <p className="text-xs text-slate-500 mt-0.5">Presensi via Dynamic QR & GPS Geofencing Gerbang</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Santri</th>
                  <th>Kelas</th>
                  <th>Waktu Scan</th>
                  <th>Status</th>
                  <th className="text-right">Jarak GPS</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, i) => (
                  <tr key={i}>
                    <td className="font-bold text-slate-900">{log.nama}</td>
                    <td className="text-slate-600">{log.kelas}</td>
                    <td className="font-mono text-slate-500 text-[11px]">{log.waktu}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.status === 'HADIR'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="text-right font-mono font-bold text-slate-600 text-[11px]">{log.jarak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Menampilkan {recentLogs.length} presensi terbaru
            </span>
            <Link href="/admin/absensi/qr-display" className="text-xs font-bold text-emerald-700 hover:underline">
              Lihat Semua →
            </Link>
          </div>
        </div>

        {/* Audit Log */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Aktivitas Audit Log</h2>
          <p className="text-xs text-slate-500 mb-5">Pencatatan Keamanan & Sistem Realtime</p>

          <div className="space-y-2.5">
            {auditLogs.map((log, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-200 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-black font-mono text-${log.color}-700 bg-${log.color}-50 border border-${log.color}-200 px-1.5 py-0.5 rounded`}>
                    {log.event}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">{log.time}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{log.user}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <span className="text-[10px] text-emerald-700 font-bold font-mono">
              PostgreSQL Neon Connected • Redis Active
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tambah Santri', icon: '🎓', href: '/admin/santri', color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-800' },
            { label: 'Buat Surat', icon: '✉️', href: '/admin/surat', color: 'bg-amber-50 border-amber-200 hover:border-amber-400 text-amber-800' },
            { label: 'Tagihan SPP', icon: '💳', href: '/admin/keuangan', color: 'bg-teal-50 border-teal-200 hover:border-teal-400 text-teal-800' },
            { label: 'Jadwal KBM', icon: '📅', href: '/admin/jadwal', color: 'bg-slate-100 border-slate-200 hover:border-slate-400 text-slate-700' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 p-4 rounded-2xl bg-white border ${item.color} transition-all duration-200 shadow-sm hover:shadow-md group`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
