'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SkeletonCard } from '@/components/Loading';
import { getLocalCache, setLocalCache } from '@/lib/cache-storage';
import {
  GraduationCap,
  UserCheck,
  Users,
  Mail,
  ShieldAlert,
  UserX,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  QrCode,
  FileText,
  Building2,
  Calendar,
  Activity,
  PlusCircle,
} from 'lucide-react';

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
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [tahunAjaran, setTahunAjaran] = useState<string>('');

  useEffect(() => {
    setCurrentTime(new Date());
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const cached = getLocalCache<any>('admin_dashboard_data');
    if (cached) {
      if (cached.stats) setStats(cached.stats);
      if (cached.grafik) setGrafik(cached.grafik);
      if (cached.aktivitas) setAktivitas(cached.aktivitas);
      if (cached.tahunAjaran) setTahunAjaran(cached.tahunAjaran);
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    if (!stats) setLoading(true);
    setError(null);
    try {
      const [statsRes, taRes] = await Promise.all([
        fetch('/api/v1/dashboard/stats'),
        fetch('/api/v1/tahun-ajaran'),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403 || taRes.status === 401 || taRes.status === 403) {
        window.location.href = '/admin/login';
        return;
      }

      if (!statsRes.ok) {
        throw new Error('Gagal memuat statistik dashboard.');
      }

      const statsJson = await statsRes.json();
      const taJson = taRes.ok ? await taRes.json() : null;

      let newTa = '';
      if (taJson?.success && taJson.data?.length) {
        const aktif = taJson.data.find((ta: any) => ta.is_aktif);
        if (aktif) newTa = `${aktif.nama} (${aktif.semester})`;
      }

      if (statsJson.success) {
        setStats(statsJson.data.stats);
        setGrafik(statsJson.data.grafik);
        setAktivitas(statsJson.data.aktivitasTerbaru || []);
        if (newTa) setTahunAjaran(newTa);

        setLocalCache('admin_dashboard_data', {
          stats: statsJson.data.stats,
          grafik: statsJson.data.grafik,
          aktivitas: statsJson.data.aktivitasTerbaru || [],
          tahunAjaran: newTa,
        });
      }
    } catch (err: any) {
      if (!stats) setError(err.message || 'Gagal memuat dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          title: 'Santri Aktif',
          value: stats.santriAktif,
          sub: `${stats.totalSantri} total santri terdaftar`,
          icon: GraduationCap,
          iconBg: 'bg-emerald-500/10 text-emerald-600',
          gradient: 'from-emerald-500/5 to-transparent',
          borderColor: 'hover:border-emerald-500/50',
          trend: '+100%',
        },
        {
          title: 'Guru & Pengajar',
          value: stats.totalGuru,
          sub: 'Mustahiq, Munawwib & Guru Formal',
          icon: UserCheck,
          iconBg: 'bg-blue-500/10 text-blue-600',
          gradient: 'from-blue-500/5 to-transparent',
          borderColor: 'hover:border-blue-500/50',
          trend: 'Aktif',
        },
        {
          title: 'Dewan Pengurus',
          value: stats.totalPengurus,
          sub: 'Pondok, Diniyah & MI Formal',
          icon: Users,
          iconBg: 'bg-indigo-500/10 text-indigo-600',
          gradient: 'from-indigo-500/5 to-transparent',
          borderColor: 'hover:border-indigo-500/50',
          trend: 'Lembaga',
        },
        {
          title: 'Perizinan Santri',
          value: stats.perizinanHariIni,
          sub: 'Permohonan izin aktif hari ini',
          icon: Mail,
          iconBg: 'bg-amber-500/10 text-amber-600',
          gradient: 'from-amber-500/5 to-transparent',
          borderColor: 'hover:border-amber-500/50',
          trend: 'Live',
        },
        {
          title: 'Catatan Kedisiplinan',
          value: stats.pelanggaranHariIni,
          sub: 'Poin takzir & keamanan pesantren',
          icon: ShieldAlert,
          iconBg: 'bg-rose-500/10 text-rose-600',
          gradient: 'from-rose-500/5 to-transparent',
          borderColor: 'hover:border-rose-500/50',
          trend: 'Disiplin',
        },
        {
          title: 'Santri Non-Aktif / Alumni',
          value: stats.totalSantri - stats.santriAktif,
          sub: 'Alumni lulus, mutasi & cuti',
          icon: UserX,
          iconBg: 'bg-teal-500/10 text-teal-600',
          gradient: 'from-teal-500/5 to-transparent',
          borderColor: 'hover:border-teal-500/50',
          trend: 'Arsip',
        },
      ]
    : [];

  const totalSantriGrafik = grafik?.santriPerJenjang.reduce((a, b) => a + b.jumlah, 0) || 1;

  function getAktivitasBadge(action: string) {
    if (action.includes('SANTRI')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('GURU')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (action.includes('PELANGGARAN')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (action.includes('PERIZINAN')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }

  function formatWaktu(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m} mnt lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    return `${Math.floor(h / 24)} hari lalu`;
  }

  return (
    <div className="space-y-6">
      {/* EXECUTIVE HERO BANNER */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0a2a18] via-[#0f4928] to-[#135e35] text-white shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-[11px] font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              SISTEM MASTER DATABASE PESANTREN
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sekretariat Utama Darsa Enterprise
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl font-medium">
              {tahunAjaran ? (
                <>Tahun Ajaran Aktif: <strong className="text-amber-300 font-bold">{tahunAjaran}</strong> • Single Source of Truth</>
              ) : (
                'Platform Manajemen Terpadu Pondok Pesantren & Lembaga Pendidikan Formal'
              )}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <div className="px-4 py-3 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 backdrop-blur-xs text-right">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-0.5 justify-end">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Waktu Real-Time</span>
              </div>
              <p className="font-mono text-base font-extrabold text-white">
                {currentTime ? currentTime.toLocaleTimeString('id-ID') : '--:--:--'} WIB
              </p>
              <p className="text-[11px] text-emerald-300/80">
                {currentTime ? currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/santri/baru"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/80 shadow-xs hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition truncate">Tambah Santri</p>
            <p className="text-[10px] text-slate-500 truncate">Input data baru</p>
          </div>
        </Link>

        <Link
          href="/admin/absensi/qr-display"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500/80 shadow-xs hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-800 transition truncate">Presensi QR</p>
            <p className="text-[10px] text-slate-500 truncate">Layar presensi</p>
          </div>
        </Link>

        <Link
          href="/admin/surat"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/80 shadow-xs hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition truncate">Perizinan</p>
            <p className="text-[10px] text-slate-500 truncate">Approval izin</p>
          </div>
        </Link>

        <Link
          href="/admin/akademik/rapor"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-500/80 shadow-xs hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-800 transition truncate">Cetak Rapor</p>
            <p className="text-[10px] text-slate-500 truncate">Nilai & PDF</p>
          </div>
        </Link>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 ${card.borderColor} relative overflow-hidden group`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        {card.title}
                      </span>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">
                        {card.value.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">{card.sub}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {card.trend}
                    </span>
                  </div>
                </div>
              );
            })}
      </div>

      {/* CHARTS & RECENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribusi Santri Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                Distribusi Santri per Unit Pendidikan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Komposisi jumlah santri aktif per jenjang</p>
            </div>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              PostgreSQL Live
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {grafik?.santriPerJenjang.map((g, i) => {
                const pct = Math.round((g.jumlah / totalSantriGrafik) * 100);
                const colors = [
                  'from-emerald-500 to-emerald-700',
                  'from-blue-500 to-blue-700',
                  'from-indigo-500 to-indigo-700',
                ];
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${colors[i % colors.length]}`} />
                        {g.jenjang}
                      </span>
                      <span className="font-mono text-slate-900 font-extrabold">
                        {g.jumlah.toLocaleString('id-ID')} Santri ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]} transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Aktivitas Terkini (Audit Log) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              Aktivitas Terkini
            </h3>
            <Link href="/admin/audit-log" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
              Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 space-y-3">
            {aktivitas.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Belum ada catatan aktivitas.</p>
            ) : (
              aktivitas.slice(0, 5).map((log) => (
                <div key={log.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${getAktivitasBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatWaktu(log.created_at)}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {log.user?.nama_lengkap || 'Administrator'} melakukan aksi pada {log.entity_type}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
