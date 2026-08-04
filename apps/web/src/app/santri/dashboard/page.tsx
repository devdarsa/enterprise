'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SantriDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl mb-2">
        🔒
      </div>
      <h1 className="text-xl font-bold">Akses Santri Dibatasi</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        Santri / Murid tidak memiliki akun portal pengguna mandiri. Pengelolaan data santri sepenuhnya dilakukan oleh Pengurus Instansi, Ustadz, dan Wali Santri.
      </p>
    </div>
  );
}
