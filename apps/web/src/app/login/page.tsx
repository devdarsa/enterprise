'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/Loading';

type InstansiKey = 'pondok' | 'madrasah' | 'mi';
type AuthMethod = 'email' | 'passkey';
type RoleKey = 'ADMIN_INSTANSI' | 'GURU' | 'SANTRI' | 'WALI_SANTRI' | 'BENDAHARA' | 'SUPER_ADMIN';

const DEMO_USERS: Record<string, { password: string; role: RoleKey; nama: string }> = {
  'super@darsa.id':     { password: 'super123',  role: 'SUPER_ADMIN',     nama: 'Super Admin Darsa' },
  'admin@darsa.id':     { password: 'admin123',  role: 'ADMIN_INSTANSI',  nama: 'Ahmad Al-Farisi' },
  'guru@darsa.id':      { password: 'guru123',   role: 'GURU',            nama: 'Dr. KH. Abdullah Ridwan' },
  'wali@darsa.id':      { password: 'wali123',   role: 'WALI_SANTRI',     nama: 'Bapak Hendra' },
  'santri@darsa.id':    { password: 'santri123', role: 'SANTRI',          nama: 'Muhammad Raihan' },
  'bendahara@darsa.id': { password: 'bendahara123', role: 'BENDAHARA',    nama: 'Ustadzah Siti Khadijah' },
};

const ROLE_REDIRECT: Record<RoleKey, string> = {
  SUPER_ADMIN:    '/super-admin/dashboard',
  ADMIN_INSTANSI: '/admin/dashboard',
  GURU:           '/guru/dashboard',
  WALI_SANTRI:    '/wali/dashboard',
  SANTRI:         '/santri/dashboard',
  BENDAHARA:      '/admin/keuangan',
};

export default function LoginPage() {
  const [instansi, setInstansi] = useState<InstansiKey>('pondok');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'verifying' | 'redirecting'>('idle');

  const instansiData = {
    pondok: {
      nama: "Ma'had Darussa'adah Lirboyo",
      sub: 'PONDOK PESANTREN LIRBOYO KOTA KEDIRI',
      logo: '/logo-pondok.png',
      accent: 'from-emerald-700 via-emerald-600 to-teal-700',
      badge: 'Instansi Pondok Pesantren',
    },
    madrasah: {
      nama: "Madrasah Diniyah Darussa'adah",
      sub: 'MADRASAH DINIYAH LIRBOYO KOTA KEDIRI',
      logo: '/logo-madrasah.png',
      accent: 'from-teal-700 via-emerald-700 to-emerald-700',
      badge: 'Instansi Madrasah Diniyah',
    },
    mi: {
      nama: "Madrasah Ibtida'iyyah Darussa'adah",
      sub: 'MI / FORMAL LIRBOYO KOTA KEDIRI',
      logo: '/logo-mi.png',
      accent: 'from-emerald-800 via-teal-700 to-emerald-700',
      badge: 'Instansi Formal / MI',
    },
  };

  const current = instansiData[instansi];

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep('verifying');

    await new Promise((res) => setTimeout(res, 1000));

    const user = DEMO_USERS[email.toLowerCase()];
    if (!user || user.password !== password) {
      setLoading(false);
      setStep('idle');
      setError('Email atau kata sandi salah. Periksa kembali kredensial Anda.');
      return;
    }

    // Set session cookie
    const sessionData = {
      email,
      nama: user.nama,
      role: user.role,
      instansi: instansi.toUpperCase(),
      loginAt: new Date().toISOString(),
    };
    document.cookie = `darsa_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;

    setStep('redirecting');
    await new Promise((res) => setTimeout(res, 600));

    if (user.role === 'SUPER_ADMIN') {
      window.location.href = ROLE_REDIRECT.SUPER_ADMIN;
    } else {
      window.location.href = ROLE_REDIRECT[user.role];
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setStep('verifying');
    await new Promise((res) => setTimeout(res, 1600));

    const sessionData = {
      email: 'admin@darsa.id',
      nama: 'Ahmad Al-Farisi (Passkey)',
      role: 'ADMIN_INSTANSI',
      instansi: instansi.toUpperCase(),
      loginAt: new Date().toISOString(),
    };
    document.cookie = `darsa_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;

    setStep('redirecting');
    await new Promise((res) => setTimeout(res, 500));
    window.location.href = '/admin/dashboard';
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStep('verifying');
    await new Promise((res) => setTimeout(res, 1400));

    const sessionData = {
      email: 'admin.google@darsa.id',
      nama: 'Ahmad (Google OAuth)',
      role: 'ADMIN_INSTANSI',
      instansi: instansi.toUpperCase(),
      loginAt: new Date().toISOString(),
    };
    document.cookie = `darsa_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;

    setStep('redirecting');
    await new Promise((res) => setTimeout(res, 500));
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/8 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-amber-500/6 blur-[80px] rounded-full" />
        <div className="absolute top-1/3 -left-20 w-[300px] h-[300px] bg-teal-500/5 blur-[80px] rounded-full" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Top Brand Bar */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden">
          {/* Top Accent Line */}
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" />

          {/* Header gradient */}
          <div className={`relative p-6 bg-gradient-to-br ${current.accent} overflow-hidden`}>
            <div className="absolute inset-0 opacity-[0.06]">
              <div className="absolute right-0 top-0 w-40 h-40 rounded-full border-2 border-white translate-x-16 -translate-y-12" />
              <div className="absolute right-6 bottom-0 w-28 h-28 rounded-full border border-white translate-y-12" />
            </div>

            {/* Instansi Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-white/10 backdrop-blur-sm rounded-2xl mb-5 text-[11px] font-bold relative z-10">
              {(['pondok', 'madrasah', 'mi'] as InstansiKey[]).map((key, idx) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setInstansi(key)}
                  className={`py-2 rounded-xl transition-all duration-200 ${
                    instansi === key
                      ? 'bg-white text-emerald-900 shadow-md'
                      : 'text-white/80 hover:bg-white/15'
                  }`}
                >
                  {idx + 1}. {key === 'pondok' ? 'Pondok' : key === 'madrasah' ? 'Diniyah' : 'MI / MA'}
                </button>
              ))}
            </div>

            {/* Logo + Name */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative w-16 h-16 rounded-full border-[3px] border-amber-400/80 overflow-hidden shadow-xl shadow-black/20 shrink-0 animate-float">
                <Image src={current.logo} alt={`Logo ${current.nama}`} fill className="object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
                  {current.badge}
                </span>
                <h1 className="text-base font-black text-white leading-tight">{current.nama}</h1>
                <p className="text-[10px] text-white/70 mt-0.5 font-medium uppercase tracking-wider">{current.sub}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Auth Method Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['email', 'passkey'] as AuthMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => { setAuthMethod(method); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    authMethod === method
                      ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {method === 'email' ? (
                    <><span>📧</span> Email & Kata Sandi</>
                  ) : (
                    <><span>🔐</span> Passkey / Biometrik</>
                  )}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 animate-fade-slide-up">
                <span className="text-rose-500 text-sm shrink-0 mt-0.5">⚠</span>
                <p className="text-xs text-rose-700 font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            {/* Redirecting state */}
            {step === 'redirecting' && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-fade-slide-up">
                <LoadingSpinner size="sm" />
                <p className="text-xs text-emerald-800 font-bold">Mengalihkan ke Dashboard...</p>
              </div>
            )}

            {/* Email Form */}
            {authMethod === 'email' && step !== 'redirecting' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@darsa.id"
                    className="input-premium"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
                    <button type="button" className="text-[11px] text-emerald-700 font-semibold hover:underline">
                      Lupa Kata Sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-premium pr-10"
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading && step === 'verifying' ? (
                    <>
                      <LoadingSpinner size="sm" variant="white" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    `Masuk ${instansi === 'pondok' ? 'Pondok' : instansi === 'madrasah' ? 'Diniyah' : 'MI/MA'}`
                  )}
                </button>
              </form>
            )}

            {/* Passkey Form */}
            {authMethod === 'passkey' && step !== 'redirecting' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-4xl shadow-sm animate-float">
                  {loading ? <LoadingSpinner size="md" /> : '👆'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Autentikasi Biometrik</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Gunakan Touch ID, Face ID, atau Windows Hello untuk masuk tanpa kata sandi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <LoadingSpinner size="sm" variant="white" /> : '🔐'}
                  {loading ? 'Menghubungkan WebAuthn...' : 'Otentikasi dengan Passkey'}
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">atau</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-3 transition-all duration-200 shadow-sm disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.7-1.4-1.7-1.8-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              Masuk dengan Google OAuth
            </button>

            {/* Demo Hint */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-[10px] font-bold text-amber-700 mb-1.5 uppercase tracking-wider">💡 Akun Demo Tersedia:</p>
              <div className="space-y-0.5 text-[10px] text-amber-800 font-mono">
                <p>admin@darsa.id / admin123</p>
                <p>guru@darsa.id / guru123</p>
                <p>wali@darsa.id / wali123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
