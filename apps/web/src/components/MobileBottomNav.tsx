'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  QrCode,
  ClipboardList,
  User,
  Shield,
  FileText,
  Users,
  Bell,
  Calendar,
  BookOpen,
  BookMarked,
  Info
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  isCenter?: boolean;
}

interface MobileBottomNavProps {
  role: 'MUSTAHIQ' | 'MUNAWWIB' | 'GURU_MADRASAH' | 'GURU_MI' | 'WALI_SANTRI' | 'PENGASUH' | 'KEAMANAN';
}

export default function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();

  const getNavItems = (): NavItem[] => {
    if (role === 'KEAMANAN') {
      return [
        { label: 'Beranda', href: '/keamanan/dashboard', icon: Home },
        { label: 'Perizinan', href: '/keamanan/dashboard#perizinan', icon: FileText },
        { label: 'Scan QR', href: '/keamanan/dashboard#scan', icon: QrCode, isCenter: true },
        { label: 'Status', href: '/keamanan/dashboard#status', icon: Shield },
        { label: 'Profil', href: '/keamanan/dashboard#profil', icon: User },
      ];
    }

    if (role === 'WALI_SANTRI') {
      return [
        { label: 'Beranda', href: '/wali_santri/dashboard', icon: Home },
        { label: 'Anak', href: '/wali_santri/dashboard#anak', icon: Users },
        { label: 'QR Santri', href: '/wali_santri/dashboard#qr', icon: QrCode, isCenter: true },
        { label: 'Informasi', href: '/wali_santri/dashboard#informasi', icon: Info },
        { label: 'Profil', href: '/wali_santri/dashboard#profil', icon: User },
      ];
    }

    if (role === 'GURU_MI') {
      return [
        { label: 'Beranda', href: '/guru_mi/dashboard', icon: Home },
        { label: 'Jadwal', href: '/guru_mi/dashboard#jadwal', icon: Calendar },
        { label: 'Scan QR', href: '/guru_mi/dashboard#qr', icon: QrCode, isCenter: true },
        { label: 'Absensi', href: '/guru_mi/dashboard#absensi', icon: ClipboardList },
        { label: 'Profil', href: '/guru_mi/dashboard#profil', icon: User },
      ];
    }

    if (role === 'MUNAWWIB') {
      return [
        { label: 'Beranda', href: '/guru_madrasah/dashboard', icon: Home },
        { label: 'Mapel', href: '/guru_madrasah/dashboard#mapel', icon: BookMarked },
        { label: 'Scan QR', href: '/guru_madrasah/dashboard#qr', icon: QrCode, isCenter: true },
        { label: 'Jadwal', href: '/guru_madrasah/dashboard#jadwal', icon: Calendar },
        { label: 'Profil', href: '/guru_madrasah/dashboard#profil', icon: User },
      ];
    }

    // Mustahiq (Wali Kelas) & Default Guru Madrasah
    return [
      { label: 'Beranda', href: '/guru_madrasah/dashboard', icon: Home },
      { label: 'Kelas', href: '/guru_madrasah/dashboard#kelas', icon: BookOpen },
      { label: 'Scan QR', href: '/guru_madrasah/dashboard#qr', icon: QrCode, isCenter: true },
      { label: 'Jadwal', href: '/guru_madrasah/dashboard#jadwal', icon: Calendar },
      { label: 'Profil', href: '/guru_madrasah/dashboard#profil', icon: User },
    ];
  };

  const navItems = getNavItems();
  const isKeamanan = role === 'KEAMANAN';

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${
      isKeamanan
        ? 'bg-slate-950/95 border-t border-slate-800 text-slate-100 shadow-2xl backdrop-blur-lg'
        : 'bg-white/95 border-t border-slate-200/80 text-slate-800 shadow-2xl backdrop-blur-md'
    }`}>
      <div className="max-w-md mx-auto flex items-end justify-between px-3 pb-1.5 pt-1 relative">
        {navItems.map((item, idx) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href || (item.href.includes('#') && pathname.startsWith(item.href.split('#')[0]));

          if (item.isCenter) {
            return (
              <div key={idx} className="relative flex flex-col items-center -mt-6 z-10">
                <Link
                  href={item.href}
                  className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-lg shadow-emerald-700/40 ring-4 ring-white dark:ring-slate-900 transition-all duration-300 active:scale-90 hover:scale-105"
                >
                  <IconComponent className="w-6 h-6 stroke-[2.5px] group-hover:rotate-12 transition-transform" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border border-white"></span>
                  </span>
                </Link>
                <span className={`text-[10px] font-extrabold mt-1 tracking-tight ${
                  isActive 
                    ? 'text-emerald-600 dark:text-amber-400' 
                    : isKeamanan ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? isKeamanan
                    ? 'text-amber-400 bg-slate-800/80 font-bold scale-105'
                    : 'text-emerald-800 bg-emerald-50 font-bold scale-105'
                  : isKeamanan
                  ? 'text-slate-400 hover:text-slate-200 font-medium'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


