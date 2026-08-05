'use client';

import RoleLoginPage from '@/components/RoleLoginPage';

export default function LoginPondokPage() {
  return (
    <RoleLoginPage
      portalType="pondok"
      defaultInstansi="pondok"
      roleBadge="PORTAL PENGASUH & SEKRETARIAT"
      roleTitle="Ma'had Darussa'adah Lirboyo"
      roleSub="PONDOK PESANTREN LIRBOYO KOTA KEDIRI"
      allowedRoles={['SEKRETARIAT', 'ADMIN_INSTANSI']}
      accentGradient="from-emerald-900 via-emerald-800 to-teal-900"
      logoUrl="/logo-pondok.png"
      showInstansiTabs={false}
    />
  );
}
