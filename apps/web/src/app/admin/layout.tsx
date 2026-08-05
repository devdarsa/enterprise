'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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

  const handleSwitchInstansi = (inst: 'pondok' | 'madrasah' | 'mi') => {
    setInstansiActive(inst);
    if (user) {
      const updatedUser = { ...user, instansi: inst.toUpperCase() };
      setUser(updatedUser);
      document.cookie = `darsa_session=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
    } else {
      const defaultUser = { email: 'admin@darsa.id', nama: 'Sekretariat Utama Darsa', role: 'ADMIN_INSTANSI', instansi: inst.toUpperCase(), loginAt: new Date().toISOString() };
      document.cookie = `darsa_session=${encodeURIComponent(JSON.stringify(defaultUser))}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
    }
  };

  const instansiConfig = {
    pondok: {
      nama: "Pondok Pesantren Ma'had Darussa'adah",
      sub: 'LIRBOYO KOTA KEDIRI',
      logo: '/logo-pondok.png',
      badge: 'Instansi Pondok Pesantren',
    },
    madrasah: {
      nama: "Madrasah Diniyah Darussa'adah",
      sub: 'LIRBOYO KOTA KEDIRI',
      logo: '/logo-madrasah.png',
      badge: 'Sekretariat Madrasah Diniyah',
    },
    mi: {
      nama: "Madrasah Ibtida'iyyah Darussa'adah",
      sub: 'LIRBOYO KOTA KEDIRI',
      logo: '/logo-mi.png',
      badge: 'Sekretariat Formal / MI',
    },
  };

  const currentInstansi = instansiConfig[instansiActive];

  // Struktur Menu Darsa Enterprise Sesuai Dokumen Spesifikasi Resmi
  const navigationGroups = [
    {
      groupTitle: 'DASHBOARD',
      items: [
        { label: 'Overview Dashboard', path: '/admin/dashboard', icon: '📊' },
      ],
    },
    {
      groupTitle: 'DATABASE PONDOK',
      items: [
        { label: 'Data Santri & Wali', path: '/admin/santri', icon: '🎓' },
        { label: 'Data Asrama & Pembina', path: '/admin/asrama', icon: '🏠' },
        { label: 'Data Pengurus', path: '/admin/pengurus', icon: '👥' },
        { label: 'Data Pengajar', path: '/admin/guru', icon: '👨‍🏫' },
        { label: 'Alumni & Kelulusan', path: '/admin/alumni', icon: '📜' },
      ],
    },
    {
      groupTitle: 'KEAMANAN',
      items: [
        { label: 'Perizinan Santri', path: '/admin/surat', icon: '✉️' },
        { label: 'Pelanggaran & Takzir', path: '/admin/pelanggaran', icon: '⚠️' },
      ],
    },
    {
      groupTitle: 'SISTEM & UTILITAS',
      items: [
        { label: 'Arsip Historis', path: '/admin/arsip', icon: '📦' },
        { label: 'Tahun Ajaran', path: '/admin/tahun-ajaran', icon: '📅' },
        { label: 'Manajemen Akun', path: '/admin/akun', icon: '🔐' },
        { label: 'Audit Log & Recycle Bin', path: '/admin/audit-log', icon: '📋' },
        { label: 'Panduan & SOP', path: '/admin/sop', icon: '📖' },
        { label: 'Konfigurasi Sistem', path: '/admin/konfigurasi', icon: '⚙️' },
      ],
    },
  ];

  const notifications = [
    { icon: '📱', text: 'QR Absensi baru: 12 santri scan pagi ini', time: '2m lalu', unread: true },
    { icon: '✉️', text: 'Surat izin baru dari Ahmad Fauzi', time: '3j lalu', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const breadcrumb = (() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, i) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' '),
      href: '/' + parts.slice(0, i + 1).join('/'),
    }));
  })();

  return (
    <DesktopOnlyGuard>
      <div className="h-screen w-full bg-slate-50 text-slate-900 flex flex-col md:flex-row overflow-hidden relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR (Sticky on Desktop) */}
        <aside
          className={`
            fixed md:sticky top-0 h-screen z-40 md:z-30
            w-72 md:w-64 bg-white border-r border-slate-200/80
            flex flex-col shadow-xl md:shadow-none
            transform transition-transform duration-300 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            shrink-0 overflow-y-auto
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

            {/* Active Instansi Dropdown Switcher */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <label className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">
                Instansi Aktif
              </label>
              <select
                value={instansiActive}
                onChange={(e) => handleSwitchInstansi(e.target.value as 'pondok' | 'madrasah' | 'mi')}
                className="w-full text-xs font-bold text-emerald-950 bg-white border border-emerald-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="pondok">🏛️ Pondok Pesantren</option>
                <option value="madrasah">📚 Madrasah Diniyah</option>
                <option value="mi">🏫 MI / Formal</option>
              </select>
            </div>
          </div>

          {/* Navigation Menu (Grouped by Spesifikasi Struktur Menu Darsa Enterprise) */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
            {navigationGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">
                  # {group.groupTitle}
                </p>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/admin/dashboard' && pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150
                          ${isActive
                            ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 font-bold'
                            : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                          }
                        `}
                      >
                        <span className="text-sm shrink-0 leading-none">{item.icon}</span>
                        <span className="truncate leading-tight">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* User Footer */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm">
                {user ? getInitials(user.nama) : 'UA'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-slate-900 truncate">
                  {user?.nama ?? 'Sekretariat Utama'}
                </span>
                <span className="block text-[9px] text-emerald-700 font-bold truncate uppercase tracking-wide">
                  {user?.role?.replace('_', ' ') ?? 'Admin Instansi'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-rose-200"
            >
              <span>🚪</span> Keluar Sistem
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar">
                <Link href="/admin/dashboard" className="hover:text-emerald-700 font-semibold">
                  Dashboard
                </Link>
                {breadcrumb.slice(1).map((b, idx) => (
                  <div key={b.href} className="flex items-center gap-1.5 shrink-0">
                    <span>/</span>
                    <Link
                      href={b.href}
                      className={idx === breadcrumb.length - 2 ? 'text-slate-900 font-bold' : 'hover:text-emerald-700'}
                    >
                      {b.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            {/* Right Top Actions */}
            <div className="flex items-center gap-3">
              {/* Notification Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors relative"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 animate-scale-up space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900">Notifikasi System</span>
                      <span className="text-[10px] text-emerald-700 font-bold">{unreadCount} Baru</span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map((n, i) => (
                        <div key={i} className={`p-2 rounded-xl text-xs flex items-start gap-2 ${n.unread ? 'bg-emerald-50/80' : 'bg-slate-50'}`}>
                          <span className="text-base">{n.icon}</span>
                          <div>
                            <p className="text-slate-800 font-semibold">{n.text}</p>
                            <span className="text-[9px] text-slate-400">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Toast */}
          <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

          {/* Page Body */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </DesktopOnlyGuard>
  );
}
