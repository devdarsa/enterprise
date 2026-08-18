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
  Info,
} from 'lucide-react';

export interface NavItem {
  id?: string;
  label: string;
  href: string;
  icon: any;
  isCenter?: boolean;
}

interface MobileBottomNavProps {
  role: 'MUSTAHIQ' | 'MUNAWWIB' | 'GURU_MADRASAH' | 'GURU_MI' | 'WALI_SANTRI' | 'PENGASUH' | 'KEAMANAN';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function MobileBottomNav({ role, activeTab, onTabChange }: MobileBottomNavProps) {
  const pathname = usePathname();

  const getNavItems = (): NavItem[] => {
    if (role === 'KEAMANAN') {
      return [
        { id: 'beranda', label: 'Beranda', href: '/keamanan/dashboard', icon: Home },
        { id: 'perizinan', label: 'Perizinan', href: '/keamanan/dashboard#perizinan', icon: FileText },
        { id: 'scan', label: 'Scan QR', href: '/keamanan/dashboard#scan', icon: QrCode, isCenter: true },
        { id: 'status', label: 'Status', href: '/keamanan/dashboard#status', icon: Shield },
        { id: 'profil', label: 'Profil', href: '/keamanan/dashboard#profil', icon: User },
      ];
    }

    if (role === 'WALI_SANTRI') {
      return [
        { id: 'beranda', label: 'Beranda', href: '/wali_santri/dashboard', icon: Home },
        { id: 'anak', label: 'Anak', href: '/wali_santri/dashboard#anak', icon: Users },
        { id: 'qr', label: 'QR Santri', href: '/wali_santri/dashboard#qr', icon: QrCode, isCenter: true },
        { id: 'informasi', label: 'Informasi', href: '/wali_santri/dashboard#informasi', icon: Info },
        { id: 'profil', label: 'Profil', href: '/wali_santri/dashboard#profil', icon: User },
      ];
    }

    if (role === 'GURU_MI') {
      return [
        { id: 'beranda', label: 'Beranda', href: '/guru_mi/dashboard', icon: Home },
        { id: 'jadwal', label: 'Jadwal', href: '/guru_mi/dashboard#jadwal', icon: Calendar },
        { id: 'qr', label: 'Scan QR', href: '/guru_mi/dashboard#qr', icon: QrCode, isCenter: true },
        { id: 'absensi', label: 'Absensi', href: '/guru_mi/dashboard#absensi', icon: ClipboardList },
        { id: 'profil', label: 'Profil', href: '/guru_mi/dashboard#profil', icon: User },
      ];
    }

    if (role === 'MUNAWWIB') {
      return [
        { id: 'beranda', label: 'Beranda', href: '/guru_madrasah/dashboard', icon: Home },
        { id: 'mapel', label: 'Mapel', href: '/guru_madrasah/dashboard#mapel', icon: BookMarked },
        { id: 'qr', label: 'Scan QR', href: '/guru_madrasah/dashboard#qr', icon: QrCode, isCenter: true },
        { id: 'jadwal', label: 'Jadwal', href: '/guru_madrasah/dashboard#jadwal', icon: Calendar },
        { id: 'profil', label: 'Profil', href: '/guru_madrasah/dashboard#profil', icon: User },
      ];
    }

    // Mustahiq (Wali Kelas) & Default Guru Madrasah
    return [
      { id: 'beranda', label: 'Beranda', href: '/guru_madrasah/dashboard', icon: Home },
      { id: 'kelas', label: 'Kelas', href: '/guru_madrasah/dashboard#kelas', icon: BookOpen },
      { id: 'qr', label: 'Scan QR', href: '/guru_madrasah/dashboard#qr', icon: QrCode, isCenter: true },
      { id: 'jadwal', label: 'Jadwal', href: '/guru_madrasah/dashboard#jadwal', icon: Calendar },
      { id: 'profil', label: 'Profil', href: '/guru_madrasah/dashboard#profil', icon: User },
    ];
  };

  const navItems = getNavItems();
  const isKeamanan = role === 'KEAMANAN';

  const handleClick = (e: React.MouseEvent, item: NavItem) => {
    if (onTabChange && item.id) {
      e.preventDefault();
      onTabChange(item.id);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${
        isKeamanan
          ? 'bg-slate-950/95 border-t border-slate-800 text-slate-100 shadow-2xl backdrop-blur-lg'
          : 'bg-white/95 border-t border-slate-200/80 text-slate-800 shadow-2xl backdrop-blur-md'
      }`}
    >
      <div className="max-w-md mx-auto flex items-end justify-between px-3 pb-1.5 pt-1 relative">
        {navItems.map((item, idx) => {
          const IconComponent = item.icon;
          const isActive = activeTab
            ? activeTab === item.id
            : pathname === item.href || (item.href.includes('#') && pathname.startsWith(item.href.split('#')[0]));

          if (item.isCenter) {
            return (
              <div key={idx} className="relative flex flex-col items-center -mt-6 z-10">
                <button
                  type="button"
                  onClick={(e) => handleClick(e, item)}
                  className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-lg shadow-emerald-700/40 ring-4 ring-white dark:ring-slate-900 transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer"
                >
                  <IconComponent className="w-6 h-6 stroke-[2.5px] group-hover:rotate-12 transition-transform" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border border-white"></span>
                  </span>
                </button>
                <span
                  className={`text-[10px] font-extrabold mt-1 tracking-tight ${
                    isActive
                      ? 'text-emerald-700 dark:text-amber-400 font-black'
                      : isKeamanan
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleClick(e, item)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
