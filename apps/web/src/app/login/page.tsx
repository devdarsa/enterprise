'use client';

import RoleLoginPage from '@/components/RoleLoginPage';

export default function LoginPage() {
  return (
    <RoleLoginPage
      portalType="general"
      defaultInstansi="pondok"
      roleBadge="PORTAL UTAMA MUSTAHIQ / MUNAWWIB"
      roleTitle="Darsa Enterprise Integrated"
      roleSub="PONDOK PESANTREN & MADRASAH DARUSSA'ADAH LIRBOYO"
      allowedRoles={['MUSTAHIQ', 'MUNAWWIB', 'GURU_MADRASAH', 'GURU', 'SEKRETARIAT', 'ADMIN_INSTANSI']}
      defaultEmail="mustahiq@darsa.my.id"
      accentGradient="from-emerald-900 via-emerald-800 to-teal-900"
      logoUrl="/logo-pondok.png"
      showInstansiTabs={true}
    />
  );
}
