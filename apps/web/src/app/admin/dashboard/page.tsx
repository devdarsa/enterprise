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
}

interface GrafikData {
  santriPerJenjang: { jenjang: string; jumlah: number }[];
}

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  user?: { nama_lengkap: string; email: string } | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [grafik, setGrafik] = useState<GrafikData | null>(null);
  const [aktivitas, setAktivitas] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tahunAjaran, setTahunAjaran] = useState<string>('');

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, taRes] = await Promise.all([
        fetch('/api/v1/dashboard/stats'),
        fetch('/api/v1/tahun-ajaran'),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        window.location.href = '/auth/login/pondok';
        return;
      }

      if (!statsRes.ok) {
        throw new Error('Gagal memuat statistik dashboard.');
      }

      const statsJson = await statsRes.json();
      const taJson = taRes.ok ? await taRes.json() : null;

      if (statsJson.success) {
        setStats(statsJson.data.stats);
        setGrafik(statsJson.data.grafik);
        setAktivitas(statsJson.data.aktivitasTerbaru || []);
      }

      if (taJson?.success && taJson.data?.length) {
        const aktif = taJson.data.find((ta: any) => ta.is_aktif);
        if (aktif) setTahunAjaran(`${aktif.nama} (${aktif.semester})`);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          title: 'Total Santri Aktif',
          value: stats.santriAktif,
          sub: `${stats.totalSantri} santri terdaftar`,
          icon: '🎓',
          color: 'emerald',
        },
        {
          title: 'Total Guru & Pengajar',
          value: stats.totalGuru,
          sub: 'Mustahiq, Munawwib, & Guru MI',
          icon: '👨‍🏫',
          color: 'blue',
        },
        {
          title: 'Total Pengurus',
          value: stats.totalPengurus,
          sub: 'Pondok, Diniyah, & MI Formal',
          icon: '👥',
          color: 'indigo',
        },
        {
          title: 'Perizinan Hari Ini',
          value: stats.perizinanHariIni,
          sub: 'Permohonan izin masuk hari ini',
          icon: '✉️',
          color: 'amber',
        },
        {
          title: 'Pelanggaran Hari Ini',
          value: stats.pelanggaranHariIni,
          sub: 'Pencatatan takzir & kedisiplinan',
          icon: '⚠️',
          color: 'rose',
        },
        {
          title: 'Santri Non-Aktif',
          value: stats.totalSantri - stats.santriAktif,
          sub: 'Alumni, cuti, atau mutasi',
          icon: '📋',
          color: 'teal',
        },
      ]
    : [];

  const totalSantriGrafik = grafik?.santriPerJenjang.reduce((a, b) => a + b.jumlah, 0) || 1;

  function getAktivitasBadge(action: string) {
    if (action.includes('SANTRI')) return 'bg-emerald-100 text-emerald-800';
    if (action.includes('GURU')) return 'bg-blue-100 text-blue-800';
    if (action.includes('PELANGGARAN')) return 'bg-rose-100 text-rose-800';
    if (action.includes('PERIZINAN')) return 'bg-amber-100 text-amber-800';
    return 'bg-slate-100 text-slate-700';
  }

  function formatWaktu(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}j lalu`;
    return `${Math.floor(h / 24)}h lalu`;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block mb-1">
            DASHBOARD SISTEM — DATABASE REAL-TIME
          </span>
          <h1 className="text-xl font-black">Dashboard Sekretariat Darsa Enterprise</h1>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            {tahunAjaran ? (
              <>Tahun Ajaran Aktif: <strong className="text-white">{tahunAjaran}</strong> • Single Source of Truth PostgreSQL</>
            ) : (
              'Terhubung ke PostgreSQL — Data Akurat Real-Time'
            )}
          </p>
        </div>
        <div className="text-right shrink-0 font-mono text-xs text-emerald-200 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
          <span className="block font-bold text-white text-sm">
            {currentTime.toLocaleTimeString('id-ID')} WIB
          </span>
          <span>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <span className="text-rose-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-bold text-rose-900">{error}</p>
            <button onClick={fetchDashboard} className="text-xs text-rose-700 font-semibold hover:underline mt-0.5">
              Coba lagi →
            </button>
          </div>
        </div>
      )}

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-emerald-500 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{card.title}</span>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{card.value.toLocaleString('id-ID')}</div>
                <span className="text-[10px] text-slate-400 font-semibold block">{card.sub}</span>
              </div>
            ))}
      </div>

      {/* Grafik & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Santri per Jenjang */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>📊</span> Distribusi Santri per Jenjang
            </h3>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Data Realtime PostgreSQL
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-slate-100 rounded-full animate-pulse" />
              ))}
            </div>
          ) : grafik?.santriPerJenjang.length ? (
            <div className="space-y-4">
              {grafik.santriPerJenjang.map((item) => {
                const pct = Math.round((item.jumlah / totalSantriGrafik) * 100);
                return (
                  <div key={item.jenjang}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700">{item.jenjang}</span>
                      <span className="text-emerald-800 font-mono">{pct}% ({item.jumlah} santri)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm font-medium">Belum ada data santri.</p>
              <Link href="/admin/santri/baru" className="text-xs text-emerald-700 font-bold hover:underline mt-1 block">
                + Tambah santri pertama →
              </Link>
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru (Audit Log Real) */}
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
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
              ))
            ) : aktivitas.length > 0 ? (
              aktivitas.slice(0, 6).map((act) => (
                <div key={act.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${getAktivitasBadge(act.action)}`}>
                      {act.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{formatWaktu(act.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-snug">
                    {act.user?.nama_lengkap || 'Sistem'} • {act.entity_type}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada aktivitas tercatat.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/santri', label: 'Master Santri', icon: '🎓' },
          { href: '/admin/guru', label: 'Data Pengajar', icon: '👨‍🏫' },
          { href: '/admin/pelanggaran', label: 'Pelanggaran', icon: '⚠️' },
          { href: '/admin/pengumuman', label: 'Pengumuman', icon: '📣' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
