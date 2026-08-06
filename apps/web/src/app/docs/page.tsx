import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-lg text-emerald-800 flex items-center gap-2">
              <span>🏛️</span> DARSA ENTERPRISE DOCS
            </Link>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-all"
          >
            Portal Login →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            Dokumentasi Resm i & Architectural Decision Records (ADR)
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Ma'had Darussa'adah Lirboyo Kota Kediri
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto font-medium">
            Spesifikasi Arsitektur Sistem Informasi Terpadu Enterprise Pendidikan Islam
          </p>
        </div>

        {/* System Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-2xl">🔐</div>
            <h3 className="font-bold text-lg text-slate-900">Autentikasi & Keamanan (Better Auth)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menggunakan Better Auth dengan basis data PostgreSQL (Neon.tech). Mendukung Passkeys / WebAuthn Biometrik, Google OAuth 2.1 PKCE, dan Single Sign-On (SSO) terpadu di 7 Portal Role.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-2xl">📍</div>
            <h3 className="font-bold text-lg text-slate-900">Presensi Dynamic QR & GPS Geofencing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Validasi koordinat GPS presisi tinggi menggunakan rumus Haversine (max radius 200 meter dari Pos Utama Ma'had) dipadu dengan Dynamic TOTP QR Code untuk keamanan presensi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-2xl">📱</div>
            <h3 className="font-bold text-lg text-slate-900">Pendaftaran Self-Registration Wali Santri</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verifikasi NIK Wali Santri langsung terhadap Single Source of Truth (SSOT) database santri, dilengkapi pengiriman kode OTP 6-digit WhatsApp via Fonnte Gateway.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-2xl">🗺️</div>
            <h3 className="font-bold text-lg text-slate-900">API Master Wilayah Indonesia (EMSIFA)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standarisasi data alamat kependudukan Kemendagri (Provinsi, Kabupaten, Kecamatan, Desa) yang tersinkronisasi dan tersimpan di cache PostgreSQL.
            </p>
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Portal Role & Hak Akses (RBAC)</h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Portal URL</th>
                  <th className="py-2 px-3">Kredensial Default</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-800">Sekretariat Utama</td>
                  <td className="py-2.5 px-3"><code>/loginpondok</code></td>
                  <td className="py-2.5 px-3">sekretariat.pondok@darsa.my.id</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-800">Admin Instansi (Madrasah/MI)</td>
                  <td className="py-2.5 px-3"><code>/loginmadrasah</code> / <code>/loginmi</code></td>
                  <td className="py-2.5 px-3">sekretariat.madrasah@darsa.my.id</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-800">Mustahiq / Munawwib</td>
                  <td className="py-2.5 px-3"><code>/login</code></td>
                  <td className="py-2.5 px-3">mustahiq@darsa.my.id</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-800">Tim Keamanan & Perizinan</td>
                  <td className="py-2.5 px-3"><code>/loginkeamanan</code></td>
                  <td className="py-2.5 px-3">keamanan@darsa.my.id</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-800">Wali Santri</td>
                  <td className="py-2.5 px-3"><code>/loginwali</code></td>
                  <td className="py-2.5 px-3">wali@darsa.my.id</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Ma'had Darussa'adah Lirboyo Kota Kediri. All rights reserved.</p>
      </footer>
    </div>
  );
}
