import Link from 'next/link';

export default function SuperAdminDashboardPage() {
  const tenants = [
    { subdomain: 'darsa-islamiyah', nama: 'Pondok Pesantren Darsa Islamiyah', santri: 450, madrasah: 2, status: 'AKTIF (Enterprise)' },
    { subdomain: 'al-falah', nama: 'Pondok Pesantren Al-Falah Modern', santri: 820, madrasah: 4, status: 'AKTIF (Enterprise)' },
    { subdomain: 'nurus-sunnah', nama: 'Madrasah Nurus Sunnah', santri: 310, madrasah: 1, status: 'TRIAL (14 Hari)' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Super Admin Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 border border-teal-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-mono font-bold mb-2 inline-block">
            SAAS MULTI-TENANT ARCHITECTURE (v3.0)
          </span>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Super Admin Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manajemen Lisensi Instansi, Subdomain Router (`tenant.darsa.id`), & Analitik Global Platform
          </p>
        </div>
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 hover:opacity-90 transition-all"
        >
          + Registrasi Instansi Baru
        </button>
      </div>

      {/* Cross-Tenant Analytics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Instansi / Tenant</span>
          <span className="text-3xl font-black text-teal-400">18 Pondok</span>
          <span className="text-[11px] text-slate-500 block mt-1">15 Active Enterprise, 3 Trial</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Santri Lintas Instansi</span>
          <span className="text-3xl font-black text-emerald-400">12.450</span>
          <span className="text-[11px] text-slate-500 block mt-1">Layanan Terhubung</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Dynamic QR Presensi</span>
          <span className="text-3xl font-black text-cyan-400">48.200 / Hari</span>
          <span className="text-[11px] text-slate-500 block mt-1">Upstash Redis Cluster Active</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Database Sharding / Neon</span>
          <span className="text-3xl font-black text-blue-400">99.98%</span>
          <span className="text-[11px] text-slate-500 block mt-1">PgBouncer Connection Pool</span>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold text-slate-100">Daftar Tenant Subdomain Instansi Active</h2>
          <span className="text-xs text-slate-400 font-mono">Domain Root: *.darsa.id</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3">Subdomain Tenant</th>
                <th className="pb-3">Nama Instansi / Pondok</th>
                <th className="pb-3">Jumlah Santri</th>
                <th className="pb-3">Jumlah Unit Madrasah</th>
                <th className="pb-3">Status Langganan</th>
                <th className="pb-3 text-right">Aksi Tenant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tenants.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 font-mono text-teal-400 font-bold">{row.subdomain}.darsa.id</td>
                  <td className="py-3.5 font-medium text-slate-200">{row.nama}</td>
                  <td className="py-3.5 font-mono text-slate-300 font-bold">{row.santri} Santri</td>
                  <td className="py-3.5 text-slate-400">{row.madrasah} Madrasah/MI</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        row.status.includes('AKTIF')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <Link href="/admin/dashboard" className="text-slate-400 hover:text-teal-400">
                      Kelola Tenant
                    </Link>
                    <span className="text-slate-700">|</span>
                    <button className="text-slate-400 hover:text-rose-400">Suspended</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
