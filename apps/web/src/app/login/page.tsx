'use client';

import RoleLoginPage from '@/components/RoleLoginPage';

export default function UnifiedAppLoginPage() {
  return (
    <RoleLoginPage
      portalType="general"
      defaultInstansi="pondok"
      roleBadge="PORTAL UTAMA DARSA ENTERPRISE"
      roleTitle="Ma'had Darussa'adah Lirboyo"
      roleSub="Pintu Masuk Terpadu - Auto Routing Dashboard"
      accentGradient="from-emerald-950 via-teal-900 to-emerald-900"
      logoUrl="/logo-lirboyo.png"
      showInstansiTabs={false}
    />
  );
}
