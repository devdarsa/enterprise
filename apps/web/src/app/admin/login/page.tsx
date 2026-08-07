'use client';

import RoleLoginPage from '@/components/RoleLoginPage';

export default function SekretariatAdminLoginPage() {
  return (
    <RoleLoginPage
      portalType="pondok"
      defaultInstansi="pondok"
      roleBadge="PORTAL SEKRETARIAT ENTERPRISE"
      roleTitle="Sekretariat & Pengurus Utama"
      roleSub="Pondok Pesantren Ma'had Darussa'adah Lirboyo"
      accentGradient="from-emerald-950 via-emerald-900 to-teal-950"
      logoUrl="/logo-pondok.png"
      showInstansiTabs={false}
    />
  );
}
