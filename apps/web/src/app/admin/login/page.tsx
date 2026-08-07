'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, KeyRound, Eye, EyeOff, ArrowRight, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/Loading';

export default function SekretariatAdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDateStr(formatted);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username dan kata sandi Sekretariat wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const email = username.includes('@') ? username.trim() : `${username.toLowerCase().trim()}@darsa.my.id`;

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          portal: 'ADMIN',
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        setError(json.message || json.error || 'Autentikasi Sekretariat gagal. Periksa username dan password.');
        setLoading(false);
        return;
      }

      // Login sukses — cookie otomatis diset oleh server via Set-Cookie headers.
      // Lakukan full redirect ke Dashboard Admin untuk memuat sesi baru
      window.location.href = '/admin/dashboard';
    } catch {
      setError('Terjadi kesalahan koneksi ke server database.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between p-6 sm:p-10 font-sans text-white bg-slate-950 overflow-hidden select-none">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-mahad.jpg"
          alt="Ma'had Darussa'adah Background"
          fill
          priority
          className="object-cover object-center filter brightness-[0.45] contrast-[1.1] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50" />
        <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[2px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full border border-amber-400/80 overflow-hidden shadow-lg shadow-black/50 bg-white/10 p-0.5">
            <Image src="/logo-lirboyo.png" alt="Logo Ma'had Darussa'adah" fill className="object-cover" />
          </div>
          <div>
            <span className="text-sm font-black tracking-wide text-white group-hover:text-emerald-300 transition-colors block">
              DARSA ENTERPRISE
            </span>
            <span className="text-[10px] font-bold text-amber-300/90 tracking-wider block uppercase">
              Ma'had Darussa'adah Lirboyo
            </span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-lg text-xs font-semibold text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span>{currentDateStr || "Jum'at, 7 Agustus 2026"}</span>
        </div>
      </header>

      {/* Main Grid Content Area */}
      <main className="relative z-10 my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full">
        {/* Left Column: Glassmorphism Login Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-slate-900/85 border border-slate-700/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

            {/* Title & Badge */}
            <div className="flex items-start gap-4">
              <div className="relative w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 p-1 shrink-0 flex items-center justify-center shadow-inner">
                <Image src="/logo-lirboyo.png" alt="Logo Portal" fill className="object-cover p-1" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  SOFTWARE CLIENT
                </span>
                <h1 className="text-2xl font-black tracking-tight text-white">Portal Sekretariat</h1>
                <p className="text-xs text-slate-400 font-medium">Sekretariat Pondok • Madrasah Diniyah • MI Formal</p>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs font-semibold flex items-start gap-2.5">
                <span className="text-rose-400 text-sm shrink-0">⚠️</span>
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  USERNAME / EMAIL SEKRETARIAT
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan email / username..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-slate-800 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  KATA SANDI
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-slate-800 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <LoadingSpinner size="sm" variant="white" />
                ) : (
                  <>
                    <span>Masuk Aplikasi Sekretariat</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Hero Information Banner */}
        <div className="lg:col-span-7 space-y-6 text-left hidden lg:block pl-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs tracking-wider uppercase backdrop-blur-md">
              🏛️ SEKRETARIAT DARUSSA'ADAH
            </span>
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              Sistem Informasi & Layanan Terpadu
            </h2>
            <p className="text-sm text-slate-300 max-w-xl font-medium leading-relaxed drop-shadow">
              Ma'had Darussa'adah Lirboyo Kediri — Software Operasional Sekretariat Administrator Terintegrasi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xl pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-1.5 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                <Lock className="w-4 h-4" />
                <span>Encrypted 256-bit</span>
              </div>
              <p className="text-xs font-bold text-white">Keamanan Data Santri (SSOT)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-1.5 shadow-xl">
              <div className="flex items-center gap-2 text-teal-400 font-extrabold text-xs">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Realtime Sync v2.0</span>
              </div>
              <p className="text-xs font-bold text-white">Akademik, Presensi & Rapor</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 border-t border-slate-800/80 pt-4">
        <p>© 2026 Pondok Pesantren Ma'had Darussa'adah Lirboyo Kediri. All rights reserved.</p>
        <p className="font-mono text-slate-500">Dev: DEVELZY Indonesia 2026</p>
      </footer>
    </div>
  );
}
