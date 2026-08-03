import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Navigation */}
      <header className="relative z-10 border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full border-2 border-gold-500 overflow-hidden shadow-md">
              <Image
                src="/logo-lirboyo.png"
                alt="Logo Ma'had Darussa'adah Lirboyo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-emerald-800 block">
                DARSA ENTERPRISE
              </span>
              <span className="block text-[11px] text-amber-700 font-semibold tracking-wider uppercase">
                MA'HAD DARUSSA'ADAH LIRBOYO KOTA KEDIRI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Dokumentasi ADR
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center gap-2"
            >
              Masuk Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center items-center text-center">
        {/* Emblem Hero Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-gold-500/40 bg-gold-50 text-emerald-900 text-xs font-bold mb-8 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse" />
          Sistem Terpadu Ma'had Darussa'adah Lirboyo Kota Kediri
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl text-slate-900 leading-tight mb-6">
          Sistem Informasi Terpadu{' '}
          <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-amber-600 bg-clip-text text-transparent">
            Enterprise Pendidikan Islam
          </span>
        </h1>

        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-medium">
          Platform enterprise terintegrasi untuk Pondok Pesantren, Madrasah Aliyah, dan Diniyah dengan presensi GPS Geofencing, Better Auth Passkeys, dan dukungan multi-platform.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-xl shadow-slate-200/50 hover:border-gold-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4 text-xl group-hover:scale-110 transition-transform">
              🔐
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Better Auth + Passkeys</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Google OAuth 2.1 PKCE, Email/Password Argon2id, serta WebAuthn Passkeys (Biometrik Touch ID & Face ID).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-xl shadow-slate-200/50 hover:border-gold-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-amber-700 mb-4 text-xl group-hover:scale-110 transition-transform">
              📍
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dynamic QR + GPS Geofencing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Presensi presisi tinggi dengan TOTP QR Code (Upstash Redis) dan Haversine radius validation Google Maps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-xl shadow-slate-200/50 hover:border-gold-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4 text-xl group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Platform Ecosystem</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Next.js 16 Web Apps (Vercel), Cross-Platform Mobile (Capacitor), dan Native Desktop Windows (Wails v3).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-emerald-100 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Ma'had Darussa'adah Lirboyo Kota Kediri. All rights reserved.</p>
          <p className="font-mono text-emerald-700 font-semibold">Darsa Enterprise Engine v3.0</p>
        </div>
      </footer>
    </div>
  );
}
