'use client';

import RoleLoginPage from '@/components/RoleLoginPage';

export default function LoginWaliPage() {
  return (
    <RoleLoginPage
      portalType="wali"
      defaultInstansi="pondok"
      roleBadge="PORTAL ORANG TUA / WALI SANTRI"
      roleTitle="Portal Wali Santri Lirboyo"
      roleSub="PEMANTAUAN AKADEMIK, ABSENSI & IZIN ONLINE"
      allowedRoles={['WALI_SANTRI']}
      defaultEmail="wali@darsa.my.id"
      accentGradient="from-emerald-900 via-teal-800 to-amber-900"
      logoUrl="/logo-pondok.png"
      showInstansiTabs={false}
    />
  );
}
