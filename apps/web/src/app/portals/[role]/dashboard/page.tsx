'use client';

import { use } from 'react';
import GuruMadrasahDashboardPage from '@/app/guru_madrasah/dashboard/page';
import GuruMIDashboardPage from '@/app/guru_mi/dashboard/page';
import WaliSantriDashboardPage from '@/app/wali_santri/dashboard/page';
import KeamananDashboardPage from '@/app/keamanan/dashboard/page';
import AdminDashboardPage from '@/app/admin/dashboard/page';

export default function DynamicRoleDashboardPage({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = use(params);
  const roleKey = resolvedParams?.role?.toLowerCase() || 'admin';

  switch (roleKey) {
    case 'guru_madrasah':
    case 'mustahiq':
    case 'munawwib':
      return <GuruMadrasahDashboardPage />;
    case 'guru_mi':
    case 'guru':
      return <GuruMIDashboardPage />;
    case 'wali_santri':
    case 'wali':
      return <WaliSantriDashboardPage />;
    case 'keamanan':
      return <KeamananDashboardPage />;
    case 'admin':
    case 'sekretariat':
    default:
      return <AdminDashboardPage />;
  }
}
