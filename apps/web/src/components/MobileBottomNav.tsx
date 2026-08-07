'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileBottomNavProps {
  role: 'MUSTAHIQ' | 'MUNAWWIB' | 'GURU_MADRASAH' | 'GURU_MI' | 'WALI_SANTRI' | 'PENGASUH' | 'KEAMANAN';
}

export default function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    if (role === 'KEAMANAN') {
      return [
        { label: 'Beranda', href: '/keamanan/dashboard', icon: '🛡️' },
        { label: 'Scan QR', href: '/keamanan/dashboard#scan', icon: '📷' },
        { label: 'Perizinan', href: '/keamanan/dashboard#perizinan', icon: '📝' },
        { label: 'Profil', href: '/keamanan/dashboard#profil', icon: '👤' },
      ];
    }
    // BAB X - Wali Santri Mobile Bottom Navigation
    if (role === 'WALI_SANTRI') {
      return [
        { label: 'Beranda', href: '/wali_santri/dashboard', icon: '🏠' },
        { label: 'Anak', href: '/wali_santri/dashboard#anak', icon: '👨‍🎓' },
        { label: 'Informasi', href: '/wali_santri/dashboard#informasi', icon: '📢' },
        { label: 'Notifikasi', href: '/wali_santri/dashboard#notifikasi', icon: '🔔' },
        { label: 'Profil', href: '/wali_santri/dashboard#profil', icon: '👤' },
      ];
    }

    // BAB IX - Guru MI Mobile Bottom Navigation (TIDAK ADA MENU NILAI)
    if (role === 'GURU_MI') {
      return [
        { label: 'Beranda', href: '/guru_mi/dashboard', icon: '🏠' },
        { label: 'QR Code', href: '/guru_mi/dashboard#qr', icon: '📷' },
        { label: 'Jadwal', href: '/guru_mi/dashboard#jadwal', icon: '📅' },
        { label: 'Absensi', href: '/guru_mi/dashboard#absensi', icon: '📋' },
        { label: 'Profil', href: '/guru_mi/dashboard#profil', icon: '👤' },
      ];
    }

    // BAB VIII - Munawwib Mobile Bottom Navigation
    if (role === 'MUNAWWIB') {
      return [
        { label: 'Beranda', href: '/guru_madrasah/dashboard', icon: '🏠' },
        { label: 'Mapel', href: '/guru_madrasah/dashboard#mapel', icon: '📚' },
        { label: 'QR', href: '/guru_madrasah/dashboard#qr', icon: '📷' },
        { label: 'Jadwal', href: '/guru_madrasah/dashboard#jadwal', icon: '📅' },
        { label: 'Profil', href: '/guru_madrasah/dashboard#profil', icon: '👤' },
      ];
    }

    // BAB VII - Mustahiq (Wali Kelas) & Default Guru Madrasah
    return [
      { label: 'Beranda', href: '/guru_madrasah/dashboard', icon: '🏠' },
      { label: 'Jadwal', href: '/guru_madrasah/dashboard#jadwal', icon: '📅' },
      { label: 'Kelas', href: '/guru_madrasah/dashboard#kelas', icon: '📖' },
      { label: 'QR Absensi', href: '/guru_madrasah/dashboard#qr', icon: '📷' },
      { label: 'Profil', href: '/guru_madrasah/dashboard#profil', icon: '👤' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-2 px-3 md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href || (item.href.includes('#') && pathname.startsWith(item.href.split('#')[0]));
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition-all text-[10px] font-bold ${
                isActive ? 'text-emerald-800 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
