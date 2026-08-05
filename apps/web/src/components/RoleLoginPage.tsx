'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/Loading';
import { signIn } from '@darsa/auth/client';

export type InstansiKey = 'pondok' | 'madrasah' | 'mi';
export type AuthMethod = 'email' | 'passkey';

const ROLE_REDIRECT: Record<string, string> = {
  SEKRETARIAT: '/admin/dashboard',
  ADMIN_INSTANSI: '/admin/dashboard',
  GURU_MADRASAH: '/guru_madrasah/dashboard',
  GURU_MI: '/guru_mi/dashboard',
  GURU: '/guru_madrasah/dashboard',
  WALI_SANTRI: '/wali_santri/dashboard',
  SANTRI: '/santri/dashboard',
};

export interface RoleLoginPageProps {
  defaultInstansi?: InstansiKey;
  roleBadge: string;
  roleTitle: string;
  roleSub: string;
  allowedRoles?: string[];
  accentGradient?: string;
  logoUrl?: string;
  portalType: 'pondok' | 'madrasah' | 'mi' | 'keamanan' | 'gurumi' | 'general' | 'wali';
  showInstansiTabs?: boolean;
}

export default function RoleLoginPage({
  defaultInstansi = 'pondok',
  roleBadge,
  roleTitle,
  roleSub,
  allowedRoles,
  accentGradient,
  logoUrl,
  portalType,
  showInstansiTabs = true,
}: RoleLoginPageProps) {
  const router = useRouter();
  const [instansi, setInstansi] = useState<InstansiKey>(defaultInstansi);
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
      accent: 'from-emerald-800 via-emerald-700 to-teal-800',
      badge: 'Instansi Pondok Pesantren',
    },
    madrasah: {
      nama: "Madrasah Diniyah Darussa'adah",
      sub: 'MADRASAH DINIYAH LIRBOYO KOTA KEDIRI',
      logo: '/logo-madrasah.png',
      accent: 'from-teal-800 via-emerald-800 to-emerald-700',
      badge: 'Instansi Madrasah Diniyah',
    },
    mi: {
      nama: "Madrasah Ibtida'iyyah Darussa'adah",
      sub: 'MI / FORMAL LIRBOYO KOTA KEDIRI',
      logo: '/logo-mi.png',
      accent: 'from-emerald-900 via-teal-800 to-emerald-800',
      badge: 'Instansi Formal / MI',
    },
  };

  const currentInstansi = instansiData[instansi];
  const activeAccent = accentGradient || currentInstansi.accent;
  const activeLogo = logoUrl || currentInstansi.logo;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep('verifying');

    try {
      const result = await signIn.email({
        email: email.toLowerCase().trim(),
        password,
        callbackURL: '/admin/dashboard',
      });

      if (result?.error) {
        setError(result.error.message || 'Email atau kata sandi salah.');
        setStep('idle');
        setLoading(false);
        return;
      }

      // Login kredensial sukses — Ambil session untuk verifikasi Role (BAB V & VI)
      setStep('redirecting');
      const sessionRes = await fetch('/api/auth/get-session');
      const sessionData = sessionRes.ok ? await sessionRes.json() : null;
      const userRole = sessionData?.user?.role || 'SEKRETARIAT';

      // BAB V: Validasi Hak Akses Role Terhadap Portal Halaman Login
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Sign out segera untuk membatalkan session tidak sah
        try {
          const { signOut } = await import('@darsa/auth/client');
          await signOut();
        } catch {}

        setError('Anda tidak memiliki hak akses pada halaman login ini. Silakan gunakan halaman login sesuai Role Anda.');
        setStep('idle');
        setLoading(false);
        return;
      }

      // Role sesuai — Pengalihan ke Dashboard Spesifik Role (BAB VI)
      const redirectTo = ROLE_REDIRECT[userRole] || '/admin/dashboard';
      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.');
      setStep('idle');
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setStep('verifying');
    setError(null);
    try {
      setError('Fitur Passkey belum dikonfigurasi. Gunakan Email & Kata Sandi.');
      setAuthMethod('email');
      setStep('idle');
    } catch {
      setError('Perangkat tidak mendukung Passkey atau belum terdaftar.');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStep('verifying');
    try {
      await signIn.social({ provider: 'google', callbackURL: '/admin/dashboard' });
    } catch {
      setError('Login Google gagal. Coba lagi.');
      setStep('idle');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 relative overflow-hidden font-sans">
      {/* Ambient Background Blur */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[350px] bg-amber-500/8 blur-[100px] rounded-full" />
        <div className="absolute top-1/3 -left-20 w-[350px] h-[350px] bg-teal-500/8 blur-[100px] rounded-full" />
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Navigation Back */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            ← Kembali ke Beranda Utama
          </Link>
        </div>

        {/* Card Main */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-200/80 overflow-hidden">
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" />

          {/* Header Gradient Section */}
          <div className={`relative p-6 bg-gradient-to-br ${activeAccent} text-white overflow-hidden`}>
            {/* Background Pattern Shapes */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute right-0 top-0 w-44 h-44 rounded-full border-2 border-white translate-x-16 -translate-y-12" />
              <div className="absolute right-8 bottom-0 w-28 h-28 rounded-full border border-white translate-y-12" />
            </div>

            {/* Optional Instansi Switcher Tabs */}
            {showInstansiTabs && (
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl mb-5 text-[11px] font-bold relative z-10 border border-white/15">
                {(['pondok', 'madrasah', 'mi'] as InstansiKey[]).map((key, idx) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInstansi(key)}
                    className={`py-2 rounded-xl transition-all duration-200 ${
                      instansi === key
                        ? 'bg-white text-emerald-900 shadow-md scale-[1.02]'
                        : 'text-white/80 hover:bg-white/15'
                    }`}
                  >
                    {idx + 1}. {key === 'pondok' ? 'Pondok' : key === 'madrasah' ? 'Diniyah' : 'MI / MA'}
                  </button>
                ))}
              </div>
            )}

            {/* Logo & Portal Branding */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative w-16 h-16 rounded-full border-[3px] border-amber-400/90 overflow-hidden shadow-xl shadow-black/20 shrink-0 bg-white/10 backdrop-blur-sm">
                <Image src={activeLogo} alt={`Logo ${roleTitle}`} fill className="object-cover" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                  {roleBadge}
                </span>
                <h1 className="text-base font-black text-white leading-tight">{roleTitle}</h1>
                <p className="text-[11px] text-emerald-100 font-medium tracking-wide">{roleSub}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 space-y-5">
            {/* Auth Method Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['email', 'passkey'] as AuthMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setAuthMethod(method);
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    authMethod === method
                      ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {method === 'email' ? (
                    <>
                      <span>📧</span> Email & Kata Sandi
                    </>
                  ) : (
                    <>
                      <span>🔐</span> Passkey / Biometrik
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                <span className="text-rose-500 text-sm shrink-0 mt-0.5">⚠️</span>
                <p className="text-xs text-rose-700 font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            {/* Redirecting State Indicator */}
            {step === 'redirecting' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <p className="text-xs text-emerald-800 font-bold">Mengalihkan ke Portal Dashboard...</p>
              </div>
            )}

            {/* Email Form */}
            {authMethod === 'email' && step !== 'redirecting' && (
              <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email / Username Portal
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@darsa.id"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-slate-700">Kata Sandi</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-emerald-700 font-semibold hover:underline"
                    >
                      {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && step === 'verifying' ? (
                    <>
                      <LoadingSpinner size="sm" variant="white" />
                      <span>Memverifikasi Akses...</span>
                    </>
                  ) : (
                    `Masuk ${roleTitle}`
                  )}
                </button>
              </form>
            )}

            {/* Passkey Form */}
            {authMethod === 'passkey' && step !== 'redirecting' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-4xl shadow-sm">
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
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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

            {/* Portal Wali Link (Explicit) */}
            {portalType === 'wali' || portalType === 'general' ? (
              <div className="pt-2 text-center border-t border-slate-200">
                <Link
                  href="/register/wali"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black shadow-sm transition-all duration-200"
                >
                  <span>👨‍👩‍👧</span>
                  <span>Belum Punya Akun Wali? Daftar NIK & OTP WA →</span>
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer Quick Links across Role Login Pages */}
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 text-[11px] text-center space-y-1.5">
          <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
            🌐 Pilihan Portal Login Darsa Enterprise:
          </span>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-semibold text-emerald-800">
            <Link href="/loginpondok" className="hover:underline">Pondok</Link>
            <span>•</span>
            <Link href="/loginmadrasah" className="hover:underline">Madrasah Diniyah</Link>
            <span>•</span>
            <Link href="/loginmi" className="hover:underline">MI</Link>
            <span>•</span>
            <Link href="/loginkeamanan" className="hover:underline">Keamanan</Link>
            <span>•</span>
            <Link href="/logingurumi" className="hover:underline">Guru MI</Link>
            <span>•</span>
            <Link href="/login" className="hover:underline">Mustahiq/Munawwib</Link>
            <span>•</span>
            <Link href="/loginwali" className="hover:underline">Wali Santri</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
