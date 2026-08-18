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
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  GraduationCap,
  Award,
  Mail,
  ShieldAlert,
  CreditCard,
  Archive,
  Calendar,
  UserCog,
  KeyRound,
  History,
  BookOpen,
  Settings,
  Bell,
  CheckCheck,
  Trash2,
  LogOut,
  ChevronDown,
  User,
  Sparkles,
  Menu,
  X,
  Building,
  FileText,
  QrCode,
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
      desc: 'Santri Ahmad Muzakki mengajukan izin pulang',
      time: '5 mnt lalu',
      unread: true,
      link: '/admin/surat',
    },
    {
      id: 'notif-2',
      type: 'PRESENSI',
      title: 'Scan QR Presensi Guru',
      desc: 'Presensi lokasi pengajar aktif tercatat',
      time: '35 mnt lalu',
      unread: true,
      link: '/admin/santri',
    },
  ]);

  const showToast = (type: ToastProps['type'], title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message });
  };

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

    const notifInterval = setInterval(fetchLiveNotifications, 15000);
    return () => clearInterval(notifInterval);
  }, [router]);

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

  const instansiConfig = {
    pondok: {
      nama: "Ma'had Darussa'adah",
      sub: 'Pondok Pesantren Lirboyo',
      logo: '/logo-pondok.png',
      badge: 'Sekretariat Pondok',
    },
    madrasah: {
      nama: "Madrasah Diniyah",
      sub: "Ma'had Darussa'adah",
      logo: '/logo-madrasah.png',
      badge: 'Madrasah Diniyah',
    },
    mi: {
      nama: "Madrasah Ibtidaiyah",
      sub: "Ma'had Darussa'adah",
      logo: '/logo-mi.png',
      badge: 'MI Darussa\'adah',
    },
  };

  const currentInstansi = instansiConfig[activeInstansi] || instansiConfig.pondok;

  const navigationGroups = [
    {
      groupTitle: 'DASHBOARD',
      items: [
        { label: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      groupTitle: 'DATABASE PONDOK',
      items: [
        { label: 'Data Santri & Wali', path: '/admin/santri', icon: GraduationCap },
        { label: 'Data Asrama & Kamar', path: '/admin/asrama', icon: Building2 },
        { label: 'Data Pengurus', path: '/admin/pengurus', icon: Users },
        { label: 'Data Pengajar / Guru', path: '/admin/guru', icon: UserCheck },
        { label: 'Alumni & Kelulusan', path: '/admin/alumni', icon: Award },
      ],
    },
    {
      groupTitle: 'KEAMANAN & DISIPLIN',
      items: [
        { label: 'Perizinan & Surat', path: '/admin/surat', icon: Mail },
        { label: 'Pelanggaran & Takzir', path: '/admin/pelanggaran', icon: ShieldAlert },
        { label: 'Kartu Santri Digital', path: '/admin/kartu-santri', icon: CreditCard },
      ],
    },
    {
      groupTitle: 'SISTEM & UTILITAS',
      items: [
        { label: 'Arsip Dokumen', path: '/admin/arsip', icon: Archive },
        { label: 'Tahun Ajaran', path: '/admin/tahun-ajaran', icon: Calendar },
        { label: 'Manajemen Akun', path: '/admin/akun', icon: UserCog },
        { label: 'Hak Akses & Roles', path: '/admin/roles', icon: KeyRound },
        { label: 'Audit Log & Recycle', path: '/admin/audit-log', icon: History },
        { label: 'Panduan & SOP', path: '/admin/sop', icon: BookOpen },
        { label: 'Konfigurasi Sistem', path: '/admin/konfigurasi', icon: Settings },
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

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <DesktopOnlyGuard>
      <div className="flex h-screen bg-[#f8faf9] text-slate-800 font-sans overflow-hidden">
        <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

        {/* Backdrop on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* PREMIUM EXECUTIVE SIDEBAR */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-50
            w-68 bg-[#0a2a18] text-slate-100 flex flex-col
            border-r border-emerald-950/60 shadow-xl
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Header Brand */}
          <div className="p-4 border-b border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-[#135e35] p-0.5 shadow-md flex items-center justify-center shrink-0">
                <Image
                  src={currentInstansi.logo}
                  alt="Logo"
                  width={36}
                  height={36}
                  className="rounded-lg object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black text-white tracking-tight truncate">DARSA ENTERPRISE</h1>
                  <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">PRO</span>
                </div>
                <p className="text-[11px] text-emerald-300/80 font-medium truncate">{currentInstansi.nama}</p>
              </div>
              <button
                type="button"
                className="ml-auto md:hidden p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/50 transition"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-900/40 border border-emerald-700/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider truncate">
                  {currentInstansi.badge}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 scrollbar-thin scrollbar-thumb-emerald-900">
            {visibleGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <p className="text-[10px] font-extrabold text-emerald-400/60 uppercase tracking-wider px-2.5 mb-1.5">
                  {group.groupTitle}
                </p>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.path ||
                      (item.path !== '/admin/dashboard' && pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150
                          ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/30 font-bold'
                              : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/40'
                          }
                        `}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-amber-300' : 'text-emerald-400 group-hover:text-emerald-200'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-300 shadow-xs shadow-amber-300 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Bottom User Pill */}
          <div className="p-3 border-t border-emerald-900/40 bg-[#082012]">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/30">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {user?.nama ? getInitials(user.nama) : 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.nama || 'Administrator'}</p>
                <span className="text-[10px] text-emerald-400 font-medium block truncate">
                  {user?.role || 'SEKRETARIAT'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0">
          {/* Top Navbar */}
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar">
                <Link href="/admin/dashboard" className="hover:text-emerald-700 font-semibold text-slate-600">
                  Dashboard
                </Link>
                {breadcrumb.slice(1).map((b, idx) => (
                  <div key={b.href} className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-300">/</span>
                    <Link
                      href={b.href}
                      className={
                        idx === breadcrumb.length - 2
                          ? 'text-emerald-900 font-bold'
                          : 'hover:text-emerald-700 text-slate-600'
                      }
                    >
                      {b.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            {/* Right Navbar Actions */}
            <div className="flex items-center gap-2.5">
              {/* Active Semester Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TA:</span>
                <span className="text-xs font-bold text-slate-800">{tahunAjaran}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-black bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                  LIVE
                </span>
              </div>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 transition relative active:scale-95"
                  title="Notifikasi Sistem"
                >
                  <Bell className="w-4 h-4 text-emerald-800" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Notifikasi</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
                            {unreadCount} baru
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-emerald-700 hover:underline"
                        >
                          Tandai Dibaca
                        </button>
                        <button
                          onClick={handleClearNotifications}
                          className="text-[11px] font-semibold text-slate-400 hover:text-rose-600"
                        >
                          Bersihkan
                        </button>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 space-y-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">Tidak ada notifikasi baru.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setNotifOpen(false);
                              router.push(n.link);
                            }}
                            className={`p-2.5 rounded-xl cursor-pointer transition ${
                              n.unread ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900">{n.title}</p>
                            <p className="text-[11px] text-slate-600 line-clamp-1">{n.desc}</p>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile & Settings Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition active:scale-95"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {user?.nama ? getInitials(user.nama) : 'AD'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-28 truncate">
                    {user?.nama || 'Akun'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.nama || 'Administrator'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                      <span className="mt-1 inline-block px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-100 text-emerald-800">
                        {user?.role || 'SEKRETARIAT'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      Pengaturan Akun
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Keluar (Sign Out)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* PAGE CONTENT BODY */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>

        {/* Modal Pengaturan Akun */}
        <AccountSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={
            user
              ? {
                  nama: user.nama,
                  email: user.email,
                  role: user.role,
                }
              : {
                  nama: 'Administrator',
                  email: 'admin@darsa.internal',
                  role: 'SEKRETARIAT',
                }
          }
          onUpdateProfile={(updated: any) => {
            setUser((prev) => (prev ? { ...prev, nama: updated.nama, email: updated.email } : null));
          }}
        />
      </div>
    </DesktopOnlyGuard>
  );
}
