'use client';

import RoleLoginPage from '@/components/RoleLoginPage';

export default function LoginGuruMIPage() {
  return (
    <RoleLoginPage
      portalType="gurumi"
      defaultInstansi="mi"
      roleBadge="PORTAL USTADZ & GURU MI"
      roleTitle="Portal Guru MI Darussa'adah"
      roleSub="INPUT NILAI & REKAPITULASI PEMBELAJARAN MI"
      allowedRoles={['GURU_MI']}
      accentGradient="from-teal-900 via-emerald-900 to-cyan-950"
      logoUrl="/logo-mi.png"
      showInstansiTabs={false}
    />
  );
}
