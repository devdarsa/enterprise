'use client';

import RoleLoginPage from '@/components/RoleLoginPage';

export default function LoginMIPage() {
  return (
    <RoleLoginPage
      portalType="mi"
      defaultInstansi="mi"
      roleBadge="PORTAL FORMAL / MI"
      roleTitle="Madrasah Ibtida'iyyah Darussa'adah"
      roleSub="PENDIDIKAN FORMAL MI LIRBOYO KOTA KEDIRI"
      allowedRoles={['ADMIN_INSTANSI', 'GURU_MI', 'SEKRETARIAT']}
      accentGradient="from-emerald-950 via-teal-900 to-emerald-900"
      logoUrl="/logo-mi.png"
      showInstansiTabs={false}
    />
  );
}
