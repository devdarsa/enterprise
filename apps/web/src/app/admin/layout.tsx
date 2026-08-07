'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Toast, { ToastProps } from '@/components/Toast';
import DesktopOnlyGuard from '@/components/DesktopOnlyGuard';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import { clearAllLocalCache } from '@/lib/cache-storage';
import {
  Bell,
  Calendar,
  CheckCheck,
  Trash2,
  ShieldAlert,
  FileText,
  QrCode,
  LogOut,
  ChevronDown,
  Settings,
  User,
  Info
} from 'lucide-react';

interface SessionUser {
  email: string;
  nama: string;
  role: string;
  instansi: string;
  loginAt: string;
}

interface NotificationItem {
  id: string;
  type: 'PERIZINAN' | 'PRESENSI' | 'PELANGGARAN' | 'INFO';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  link: string;
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

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026 (Ganjil)');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [activeInstansi, setActiveInstansi] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');

  // Popover States
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live Interactive Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'PERIZINAN',
      title: 'Permohonan Izin Santri Baru',
      desc: 'Santri Ahmad Muzakki mengajukan izin pulang (28 Jul - 30 Jul)',
      time: '5 menit lalu',
      unread: true,
      link: '/admin/surat',
    },
    {
      id: 'notif-2',
      type: 'PRESENSI',
      title: 'Scan QR Presensi Guru MI',
      desc: '12 Ustadz/Ustadzah telah melakukan presensi lokasi',
      time: '35 menit lalu',
      unread: true,
      link: '/admin/santri',
    },
    {
      id: 'notif-3',
      type: 'PELANGGARAN',
      title: 'Pencatatan Takzir Keamanan',
      desc: 'Terlibat pelanggaran terlambat kembali komplek',
      time: '2 jam lalu',
      unread: false,
      link: '/admin/pelanggaran',
    },
  ]);

  const showToast = (type: ToastProps['type'], title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message });
  };

  // Fetch session, active Tahun Ajaran, and REALTIME Notifications from API
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const u = data.user;
            const role = u.role || 'SEKRETARIAT';

            const roleRedirects: Record<string, string> = {
              GURU_MADRASAH: '/guru_madrasah/dashboard',
              GURU_MI: '/guru_mi/dashboard',
              GURU: '/guru_madrasah/dashboard',
              MUSTAHIQ: '/guru_madrasah/dashboard',
              MUNAWWIB: '/guru_madrasah/dashboard',
              KEAMANAN: '/keamanan/dashboard',
              WALI_SANTRI: '/wali_santri/dashboard',
              SANTRI: '/wali_santri/dashboard',
            };

            if (roleRedirects[role]) {
              router.replace(roleRedirects[role]);
              return;
            }

            const detectedInstansi = (u.instansi || 'PONDOK').toLowerCase() as 'pondok' | 'madrasah' | 'mi';
            setActiveInstansi(detectedInstansi);

            setUser({
              email: u.email,
              nama: u.name || u.email,
              role: role,
              instansi: u.instansi || 'PONDOK',
              loginAt: new Date().toISOString(),
            });
          }
        }
      } catch {}
    };

    const fetchActiveTahunAjaran = async () => {
      try {
        const res = await fetch('/api/v1/tahun-ajaran');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const active = json.data.find((ta: any) => ta.is_aktif);
            if (active) {
              setTahunAjaran(`${active.nama} (${active.semester})`);
            }
          }
        }
      } catch {}
    };

    const fetchLiveNotifications = async () => {
      try {
        const res = await fetch('/api/v1/pengumuman?limit=10');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped: NotificationItem[] = json.data.map((p: any) => ({
              id: p.id,
              type: p.penting ? 'PELANGGARAN' : 'INFO',
              title: p.judul,
              desc: p.isi,
              time: new Date(p.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              unread: true,
              link: '/admin/pengumuman',
            }));
            setNotifications(mapped);
          }
        }
      } catch {}
    };

    fetchSession();
    fetchActiveTahunAjaran();
    fetchLiveNotifications();

    const notifInterval = setInterval(fetchLiveNotifications, 10000);
    return () => clearInterval(notifInterval);
  }, [router]);

  // Close popovers on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    clearAllLocalCache();
    try {
      const { signOut } = await import('@darsa/auth/client');
      await signOut();
    } catch {}
    showToast('info', 'Sesi Berakhir', 'Anda telah berhasil keluar dari sistem.');
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 1000);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('info', 'Notifikasi Diperbarui', 'Seluruh notifikasi telah ditandai sebagai dibaca.');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setNotifOpen(false);
    showToast('info', 'Notifikasi Bersih', 'Daftar notifikasi telah dibersihkan.');
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setNotifOpen(false);
    router.push(item.link);
  };

  const instansiConfig = {
    pondok: {
      nama: "Ma'had Darussa'adah Lirboyo",
      sub: 'PONDOK PESANTREN LIRBOYO KOTA KEDIRI',
      logo: '/logo-pondok.png',
      badge: 'Sekretariat Utama Pondok',
    },
    madrasah: {
      nama: "Madrasah Diniyah Darussa'adah",
      sub: 'MADRASAH DINIYAH LIRBOYO KOTA KEDIRI',
      logo: '/logo-madrasah.png',
      badge: 'Sekretariat Madrasah Diniyah',
    },
    mi: {
      nama: "MI Formal Darussa'adah",
      sub: 'MADRASAH IBTIDAIYAH FORMAL KEDIRI',
      logo: '/logo-mi.png',
      badge: 'Sekretariat Formal MI',
    },
  };

  const currentInstansi = instansiConfig[activeInstansi] || instansiConfig.pondok;

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
        { label: 'Kartu Santri Digital', path: '/admin/kartu-santri', icon: '🪪' },
      ],
    },
    {
      groupTitle: 'SISTEM & UTILITAS',
      items: [
        { label: 'Arsip Historis', path: '/admin/arsip', icon: '📦' },
        { label: 'Tahun Ajaran', path: '/admin/tahun-ajaran', icon: '📅' },
        { label: 'Manajemen Akun', path: '/admin/akun', icon: '🔐' },
        { label: 'Manajemen Role & RBAC', path: '/admin/roles', icon: '🔑' },
        { label: 'Audit Log & Recycle Bin', path: '/admin/audit-log', icon: '📋' },
        { label: 'Panduan & SOP', path: '/admin/sop', icon: '📖' },
        { label: 'Konfigurasi Sistem', path: '/admin/konfigurasi', icon: '⚙️' },
      ],
    },
  ];

  const userRole = user?.role || 'SEKRETARIAT';

  const visibleGroups = navigationGroups
    .map((group) => {
      if (userRole === 'KEAMANAN') {
        if (group.groupTitle === 'DATABASE PONDOK') return null;
        if (group.groupTitle === 'SISTEM & UTILITAS') {
          return {
            ...group,
            items: group.items.filter((item) => item.path === '/admin/sop'),
          };
        }
      }

      if (['MUSTAHIQ', 'MUNAWWIB', 'GURU_MADRASAH', 'GURU_MI', 'GURU'].includes(userRole)) {
        if (group.groupTitle === 'DATABASE PONDOK') return null;
        if (group.groupTitle === 'SISTEM & UTILITAS') {
          return {
            ...group,
            items: group.items.filter((item) => item.path === '/admin/sop'),
          };
        }
      }

      return group;
    })
    .filter(Boolean) as typeof navigationGroups;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const breadcrumb = (() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, i) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' '),
      href: '/' + parts.slice(0, i + 1).join('/'),
    }));
  })();

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'PERIZINAN':
        return <FileText className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'PRESENSI':
        return <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'PELANGGARAN':
        return <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <DesktopOnlyGuard>
      <div className="h-screen w-full bg-slate-50 text-slate-900 flex flex-col md:flex-row overflow-hidden relative font-sans">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
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
          {/* Header Card */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 mb-3">
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

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-0.5">
                PORTAL {currentInstansi.badge.toUpperCase()}
              </span>
              <p className="text-xs font-black text-emerald-950">{currentInstansi.nama}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
            {visibleGroups.map((group) => (
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
                            ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20 font-bold'
                            : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                          }
                        `}
                      >
                        <span className="text-sm shrink-0">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
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
        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-xs">
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

            {/* Right Top Actions Row: [Instansi Selector] -> [Tahun Ajaran] -> [Lonceng Notifikasi] -> [Profile & Logout Dropdown] */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* 0. Realtime Instansi Badge (Strictly based on User Account Session) */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs shadow-xs">
                <span className="text-xs">🏛️</span>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider hidden sm:inline">
                  INSTANSI:
                </span>
                <span className="text-xs font-black text-emerald-950 uppercase tracking-tight">
                  {currentInstansi.nama}
                </span>
              </div>

              {/* 1. Realtime System Active Tahun Ajaran Badge */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/90 text-xs shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  TAHUN AJARAN:
                </span>
                <span className="text-xs font-black text-slate-900">
                  {tahunAjaran}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300 shrink-0">
                  AKTIF
                </span>
              </div>

              {/* 2. Functional Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/90 transition-all relative active:scale-95"
                  title="Notifikasi Sistem"
                >
                  <Bell className="w-4 h-4 text-emerald-800" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-md animate-pulse px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Panel Notifikasi */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-scale-up space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-xs font-black text-slate-900">Notifikasi Sistem Enterprise</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black">
                        {unreadCount} Baru
                      </span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 rounded-2xl text-xs transition-all cursor-pointer border flex items-start gap-3 hover:shadow-sm ${
                              n.unread
                                ? 'bg-emerald-50/70 border-emerald-200/80'
                                : 'bg-slate-50 border-slate-200/60 opacity-80'
                            }`}
                          >
                            <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                              {getNotifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-900 text-xs truncate">{n.title}</span>
                                {n.unread && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />}
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{n.desc}</p>
                              <span className="text-[9px] font-mono text-slate-400 block pt-0.5">{n.time}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400 font-medium">
                          Tidak ada notifikasi baru.
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Controls */}
                    {notifications.length > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Tandai Semua Dibaca</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearNotifications}
                          className="text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Bersihkan</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Far Right User Profile & Account Settings / Logout Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-emerald-50 border border-slate-200/90 transition-all cursor-pointer active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-700 to-teal-800 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm">
                    {user ? getInitials(user.nama) : 'SP'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-extrabold text-slate-900 leading-tight truncate max-w-[120px]">
                      {user?.nama ?? 'Sekretariat Utama'}
                    </span>
                    <span className="block text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                      {user?.role?.replace('_', ' ') ?? 'SEKRETARIAT'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
                </button>

                {/* Dropdown User Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 z-50 animate-scale-up space-y-1">
                    <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-xl border border-emerald-200/80 mb-2">
                      <p className="text-xs font-black text-slate-900 truncate">{user?.nama ?? 'Sekretariat Utama'}</p>
                      <p className="text-[10px] text-emerald-800 font-mono font-medium truncate">{user?.email ?? 'sekretariat@darsa.id'}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[9px] font-black uppercase">
                        {user?.role ?? 'SEKRETARIAT'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-2.5 text-left"
                    >
                      <Settings className="w-4 h-4 text-emerald-700" />
                      <span>Pengaturan Akun & Keamanan</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-2.5 text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Keluar Sistem</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Toast */}
          <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

          {/* Account Settings Modal */}
          <AccountSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            user={{
              nama: user?.nama || 'Sekretariat Utama',
              role: user?.role || 'SEKRETARIAT',
              email: user?.email || 'sekretariat@darsa.id',
            }}
          />

          {/* Page Body */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </DesktopOnlyGuard>
  );
}
