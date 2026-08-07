'use client';

import { use } from 'react';
import RoleLoginPage, { RoleLoginPageProps } from '@/components/RoleLoginPage';

type PortalConfig = Omit<RoleLoginPageProps, 'portalType'> & { portalType: RoleLoginPageProps['portalType'] };

const PORTAL_CONFIGS: Record<string, PortalConfig> = {
  pondok: {
    portalType: 'pondok',
    defaultInstansi: 'pondok',
    roleBadge: 'PORTAL PENGASUH & SEKRETARIAT',
    roleTitle: "Ma'had Darussa'adah Lirboyo",
    roleSub: 'PONDOK PESANTREN LIRBOYO KOTA KEDIRI',
    allowedRoles: ['SEKRETARIAT', 'ADMIN_INSTANSI'],
    defaultEmail: 'sekretariat.pondok@darsa.my.id',
    accentGradient: 'from-emerald-900 via-emerald-800 to-teal-900',
    logoUrl: '/logo-pondok.png',
    showInstansiTabs: false,
  },
  madrasah: {
    portalType: 'madrasah',
    defaultInstansi: 'madrasah',
    roleBadge: 'PORTAL MADRASAH DINIYAH',
    roleTitle: "Madrasah Diniyah Darussa'adah",
    roleSub: 'MADRASAH DINIYAH LIRBOYO KOTA KEDIRI',
    allowedRoles: ['ADMIN_INSTANSI', 'SEKRETARIAT'],
    defaultEmail: 'sekretariat.madrasah@darsa.my.id',
    accentGradient: 'from-teal-900 via-emerald-800 to-emerald-900',
    logoUrl: '/logo-madrasah.png',
    showInstansiTabs: false,
  },
  mi: {
    portalType: 'mi',
    defaultInstansi: 'mi',
    roleBadge: 'PORTAL FORMAL MI DARUSSAADAAH',
    roleTitle: "Madrasah Ibtida'iyyah Darussa'adah",
    roleSub: 'MI / FORMAL LIRBOYO KOTA KEDIRI',
    allowedRoles: ['ADMIN_INSTANSI', 'SEKRETARIAT'],
    defaultEmail: 'sekretariat.mi@darsa.my.id',
    accentGradient: 'from-emerald-950 via-teal-900 to-emerald-800',
    logoUrl: '/logo-mi.png',
    showInstansiTabs: false,
  },
  keamanan: {
    portalType: 'keamanan',
    defaultInstansi: 'pondok',
    roleBadge: 'PORTAL KEAMANAN & PERIZINAN',
    roleTitle: 'Tim Keamanan & Ketertiban',
    roleSub: 'PONDOK PESANTREN LIRBOYO KOTA KEDIRI',
    allowedRoles: ['KEAMANAN', 'SEKRETARIAT'],
    defaultEmail: 'keamanan@darsa.my.id',
    accentGradient: 'from-slate-900 via-emerald-950 to-teal-950',
    logoUrl: '/logo-pondok.png',
    showInstansiTabs: false,
  },
  gurumi: {
    portalType: 'gurumi',
    defaultInstansi: 'mi',
    roleBadge: 'PORTAL USTADZ / GURU MI',
    roleTitle: 'Dewan Asatidz & Guru Formal MI',
    roleSub: 'MI DARUSSAADAAH LIRBOYO KOTA KEDIRI',
    allowedRoles: ['GURU_MI', 'GURU', 'SEKRETARIAT'],
    defaultEmail: 'guru.mi@darsa.my.id',
    accentGradient: 'from-teal-900 via-emerald-900 to-teal-800',
    logoUrl: '/logo-mi.png',
    showInstansiTabs: false,
  },
  wali: {
    portalType: 'wali',
    defaultInstansi: 'pondok',
    roleBadge: 'PORTAL WALI SANTRI LIRBOYO',
    roleTitle: 'Orang Tua / Wali Santri',
    roleSub: "MA'HAD DARUSSA'ADAH LIRBOYO KOTA KEDIRI",
    allowedRoles: ['WALI_SANTRI', 'SEKRETARIAT'],
    defaultEmail: 'wali@darsa.my.id',
    accentGradient: 'from-emerald-900 via-teal-900 to-slate-900',
    logoUrl: '/logo-pondok.png',
    showInstansiTabs: true,
  },
  general: {
    portalType: 'general',
    defaultInstansi: 'pondok',
    roleBadge: 'PORTAL UTAMA DARSA ENTERPRISE',
    roleTitle: 'Mustahiq, Munawwib & Asatidz',
    roleSub: 'DARSA ENTERPRISE ECOSYSTEM',
    allowedRoles: ['MUSTAHIQ', 'MUNAWWIB', 'GURU', 'GURU_MADRASAH', 'SEKRETARIAT', 'ADMIN_INSTANSI'],
    defaultEmail: 'mustahiq@darsa.my.id',
    accentGradient: 'from-emerald-800 via-teal-800 to-emerald-900',
    logoUrl: '/logo-pondok.png',
    showInstansiTabs: true,
  },
};

export default function DynamicPortalLoginPage({ params }: { params: Promise<{ portal: string }> }) {
  const resolvedParams = use(params);
  const portalKey = resolvedParams?.portal?.toLowerCase() || 'general';
  const config = PORTAL_CONFIGS[portalKey] || PORTAL_CONFIGS.general;

  return <RoleLoginPage {...config} />;
}
