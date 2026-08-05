'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileBottomNavProps {
  role: 'WALI_SANTRI' | 'GURU_MADRASAH' | 'GURU_MI' | 'PENGASUH';
}

export default function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    if (role === 'WALI_SANTRI') {
      return [
        { label: 'Beranda', href: '/wali_santri/dashboard', icon: '🏠' },
        { label: 'Akademik', href: '/wali_santri/dashboard#akademik', icon: '📜' },
        { label: 'Presensi', href: '/wali_santri/dashboard#absensi', icon: '📊' },
        { label: 'Informasi', href: '/wali_santri/dashboard#pengumuman', icon: '📢' },
        { label: 'Keluar', href: '/login', icon: '👤' },
      ];
    }

    if (role === 'GURU_MI') {
      return [
        { label: 'Beranda', href: '/guru_mi/dashboard', icon: '🏠' },
        { label: 'Scan QR', href: '/guru_mi/dashboard#scan', icon: '📱' },
        { label: 'Jadwal', href: '/guru_mi/dashboard#jadwal', icon: '📅' },
        { label: 'Riwayat', href: '/guru_mi/dashboard#riwayat', icon: '📊' },
        { label: 'Keluar', href: '/login', icon: '👤' },
      ];
    }

    // Default Guru Madrasah / Pengasuh
    return [
      { label: 'Beranda', href: '/guru_madrasah/dashboard', icon: '🏠' },
      { label: 'Scan QR', href: '/guru_madrasah/dashboard#scan', icon: '📱' },
      { label: 'Jadwal KBM', href: '/guru_madrasah/dashboard#jadwal', icon: '📅' },
      { label: 'Input Nilai', href: '/guru_madrasah/dashboard#nilai', icon: '📝' },
      { label: 'Keluar', href: '/login', icon: '👤' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-2 px-4 md:hidden">
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
