'use client';

import RoleLoginPage from '@/components/RoleLoginPage';

export default function LoginMadrasahPage() {
  return (
    <RoleLoginPage
      portalType="madrasah"
      defaultInstansi="madrasah"
      roleBadge="PORTAL MADRASAH DINIYAH"
      roleTitle="Madrasah Diniyah Darussa'adah"
      roleSub="TSANAWIYYAH & ALIYAH LIRBOYO KOTA KEDIRI"
      accentGradient="from-teal-900 via-emerald-800 to-emerald-900"
      logoUrl="/logo-madrasah.png"
      showInstansiTabs={false}
    />
  );
}
