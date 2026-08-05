'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/Loading';
import Toast, { ToastProps } from '@/components/Toast';
import DesktopOnlyGuard from '@/components/DesktopOnlyGuard';

interface SessionUser {
  email: string;
  nama: string;
  role: string;
  instansi: string;
  loginAt: string;
}

function getInitials(nama: string) {
  return nama
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026 (Ganjil)');
  const [instansiActive, setInstansiActive] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const notifRef = useRef<HTMLDivElement>(null);

  const showToast = (type: ToastProps['type'], title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message });
  };

  // Read session cookie
  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const parsed = JSON.parse(decodeURIComponent(match[1])) as SessionUser;
        setUser(parsed);
        // Set instansi based on session
        const inst = parsed.instansi?.toLowerCase() as 'pondok' | 'madrasah' | 'mi';
        if (['pondok', 'madrasah', 'mi'].includes(inst)) {
          setInstansiActive(inst);
        }
      }
    } catch {
      // No valid session
    }
  }, []);

  // Close notif on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    document.cookie = 'darsa_session=; path=/; max-age=0';
    showToast('info', 'Sesi Berakhir', 'Anda telah berhasil keluar dari sistem.');
    setTimeout(() => router.push('/login'), 1200);
  };

  const instansiConfig = {
    pondok: {
      nama: "Pondok Pesantren Ma'had Darussa'adah",
      sub: 'LIRBOYO KOTA KEDIRI',
      logo: '/logo-pondok.png',
      badge: 'Modul Instansi Pondok Pesantren',
      menus: [
        { label: 'Overview Pesantren', path: '/admin/dashboard', icon: '📊' },
        { label: 'Master Santri Pondok', path: '/admin/santri', icon: '🎓' },
        { label: 'Asrama & Kamar Santri', path: '/admin/asrama', icon: '🏠' },
        { label: 'Dewan Pengasuh & Ustadz', path: '/admin/guru', icon: '👨‍🏫' },
        { label: 'Persuratan & Izin', path: '/admin/surat', icon: '✉️' },
        { label: 'Pusat Pengumuman', path: '/admin/pengumuman', icon: '📢' },
        { label: 'Jadwal KBM & Pengajian', path: '/admin/jadwal', icon: '📅' },
        { label: 'Dynamic QR Display', path: '/admin/absensi/qr-display', icon: '📱' },
      ],
    },
    madrasah: {
      nama: "Madrasah Diniyah Darussa'adah",
      sub: 'LIRBOYO KOTA KEDIRI',
      logo: '/logo-madrasah.png',
      badge: 'Sekretariat Madrasah Diniyah',
      menus: [
        { label: 'Overview Diniyah', path: '/admin/dashboard', icon: '📊' },
        { label: 'Santri Diniyah', path: '/admin/santri', icon: '🎓' },
        { label: 'Mustahiq & Pengajar', path: '/admin/guru', icon: '👨‍🏫' },
        { label: 'Jadwal & Kitab Kuning', path: '/admin/jadwal', icon: '📅' },
        { label: 'Persuratan & Izin', path: '/admin/surat', icon: '✉️' },
        { label: 'Pusat Pengumuman', path: '/admin/pengumuman', icon: '📢' },
        { label: 'Rapor Diniyah PDF', path: '/admin/akademik/rapor', icon: '📜' },
      ],
    },
    mi: {
      nama: "Madrasah Ibtida'iyyah Darussa'adah",
      sub: 'LIRBOYO KOTA KEDIRI',
      logo: '/logo-mi.png',
      badge: 'Sekretariat Formal / MI',
      menus: [
        { label: 'Overview MI Formal', path: '/admin/dashboard', icon: '📊' },
        { label: 'Santri MI', path: '/admin/santri', icon: '🎓' },
        { label: 'Guru & Pegawai MI', path: '/admin/guru', icon: '👨‍🏫' },
        { label: 'Jadwal & Kurikulum MI', path: '/admin/jadwal', icon: '📅' },
        { label: 'Persuratan & Izin', path: '/admin/surat', icon: '✉️' },
        { label: 'Pusat Pengumuman', path: '/admin/pengumuman', icon: '📢' },
        { label: 'Rapor Formal MI', path: '/admin/akademik/rapor', icon: '📜' },
      ],
    },
  };

  const currentInstansi = instansiConfig[instansiActive];

  const notifications = [
    { icon: '📱', text: 'QR Absensi baru: 12 santri scan pagi ini', time: '2m lalu', unread: true },
    { icon: '✉️', text: 'Surat izin baru dari Ahmad Fauzi', time: '3j lalu', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Breadcrumb builder
  const breadcrumb = (() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, i) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1),
      href: '/' + parts.slice(0, i + 1).join('/'),
    }));
  })();

  return (
    <DesktopOnlyGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============================================================
          SIDEBAR
          ============================================================ */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-72 md:w-64 bg-white border-r border-slate-200/80
          flex flex-col shadow-xl md:shadow-none
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shrink-0
        `}
      >
        {/* Header card: Tahun Ajaran + Instansi switcher */}
        <div className="p-4 border-b border-slate-100">
          {/* Brand Row */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="relative w-9 h-9 rounded-full border-2 border-amber-400 overflow-hidden shadow-sm shrink-0">
              <Image src={currentInstansi.logo} alt={`Logo ${currentInstansi.nama}`} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-xs tracking-tight text-emerald-900 block truncate">DARSA ENTERPRISE</span>
              <span className="text-[9px] text-amber-700 font-bold tracking-wider block truncate">{currentInstansi.sub}</span>
            </div>
            <button
              type="button"
              className="ml-auto md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Tahun Ajaran */}
          <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tahun Ajaran</span>
              <select
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 rounded-lg px-2 py-0.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="2025/2026 (Ganjil)">2025/2026 (Ganjil)</option>
                <option value="2025/2026 (Genap)">2025/2026 (Genap)</option>
                <option value="2026/2027 (Ganjil)">2026/2027 (Ganjil)</option>
              </select>
            </div>
          </div>

          {/* Active Instansi Display */}
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
              {instansiActive === 'pondok' ? '🏛️ Instansi Pondok Pesantren' : instansiActive === 'madrasah' ? '📚 Instansi Madrasah Diniyah' : '🏫 Instansi Formal / MI'}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {/* Section Label */}
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">
            {currentInstansi.badge}
          </p>

          <nav className="space-y-0.5">
            {currentInstansi.menus.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/admin/dashboard' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150
                    ${isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                    }
                  `}
                >
                  <span className="text-base shrink-0 leading-none">{item.icon}</span>
                  <span className="truncate leading-tight">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm">
              {user ? getInitials(user.nama) : 'UA'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-slate-900 truncate">
                {user?.nama ?? 'Ustadz Ahmad'}
              </span>
              <span className="block text-[9px] text-emerald-700 font-bold truncate uppercase tracking-wide">
                {user?.role?.replace('_', ' ') ?? 'Admin Instansi'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>🚪</span> Keluar Session
          </button>
        </div>
      </aside>

      {/* ============================================================
          MAIN CONTENT
          ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          {/* Left: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold border border-slate-200">{tahunAjaran}</span>
              <span className="text-slate-400">→</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">{currentInstansi.nama}</span>
              {breadcrumb.length > 1 && (
                <>
                  <span className="text-slate-400">→</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 font-semibold border border-slate-200">
                    {breadcrumb[breadcrumb.length - 1].label}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: GPS badge + Notifications + User mini */}
          <div className="flex items-center gap-3">
            {/* GPS Badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              GPS Geofencing Active
            </span>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-11 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 z-50 overflow-hidden animate-scale-up">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Notifikasi Sistem</span>
                    <span className="text-[10px] text-emerald-700 font-bold cursor-pointer hover:underline">Tandai Dibaca</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div key={i} className={`px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${n.unread ? 'bg-emerald-50/50' : ''}`}>
                        <span className="text-xl shrink-0">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-800 font-semibold leading-tight">{n.text}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                        {n.unread && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-[10px] shadow-sm">
                {user ? getInitials(user.nama) : 'UA'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 md:p-7 bg-slate-50 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Toast */}
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />
    </div>
    </DesktopOnlyGuard>
  );
}
