'use client';

import RoleLoginPage from '@/components/RoleLoginPage';

export default function LoginKeamananPage() {
  return (
    <RoleLoginPage
      portalType="keamanan"
      defaultInstansi="pondok"
      roleBadge="PORTAL KEAMANAN & KETERTIBAN"
      roleTitle="Kamtib & Perizinan Pondok"
      roleSub="PENGAWASAN DISIPLIN SANTRI LIRBOYO KOTA KEDIRI"
      allowedRoles={['KEAMANAN', 'SEKRETARIAT', 'ADMIN_INSTANSI']}
      defaultEmail="keamanan@darsa.my.id"
      accentGradient="from-slate-900 via-emerald-900 to-rose-950"
      logoUrl="/logo-pondok.png"
      showInstansiTabs={false}
    />
  );
}
