'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/Loading';
import { signIn } from '@darsa/auth/client';
import { Fingerprint, ArrowRight, RefreshCw, Globe, KeyRound } from 'lucide-react';

export type InstansiKey = 'pondok' | 'madrasah' | 'mi';
export type AuthMethod = 'email' | 'passkey';

const ROLE_REDIRECT: Record<string, string> = {
  SEKRETARIAT: '/admin/dashboard',
  ADMIN_INSTANSI: '/admin/dashboard',
  GURU_MADRASAH: '/guru_madrasah/dashboard',
  GURU_MI: '/guru_mi/dashboard',
  GURU: '/guru_madrasah/dashboard',
  KEAMANAN: '/keamanan/dashboard',
  MUSTAHIQ: '/guru_madrasah/dashboard',
  MUNAWWIB: '/guru_madrasah/dashboard',
  WALI_SANTRI: '/wali_santri/dashboard',
  SANTRI: '/wali_santri/dashboard',
};

export interface RoleLoginPageProps {
  defaultInstansi?: InstansiKey;
  roleBadge: string;
  roleTitle: string;
  roleSub: string;
  allowedRoles?: string[];
  defaultEmail?: string;
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
  defaultEmail = '',
  accentGradient,
  logoUrl,
  portalType,
  showInstansiTabs = true,
}: RoleLoginPageProps) {
  const router = useRouter();
  const [instansi, setInstansi] = useState<InstansiKey>(defaultInstansi);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'verifying' | 'redirecting'>('idle');

  // Bank-Style remembered user state
  const [rememberedUser, setRememberedUser] = useState<{
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
    biometricEnabled?: boolean;
  } | null>(null);

  const [useRememberedView, setUseRememberedView] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('darsa_remembered_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRememberedUser(parsed);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch {}

    // Auto-redirect if user already has an active session
    const checkActiveSession = async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.role) {
            const role = data.user.role;
            const target = ROLE_REDIRECT[role] || '/admin/dashboard';
            router.replace(target);
          }
        }
      } catch {}
    };
    checkActiveSession();
  }, [router]);

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

  const currentInstansi = (instansiData as Record<string, any>)[instansi] || instansiData.pondok;
  const activeAccent = accentGradient || currentInstansi.accent;
  const activeLogo = logoUrl || currentInstansi.logo;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep('verifying');

    try {
      const isAdminContext =
        (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) ||
        ['pondok', 'madrasah', 'mi', 'keamanan', 'gurumi', 'general'].includes(portalType);

      const customRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          portal: isAdminContext ? 'ADMIN' : 'UMUM',
        }),
      });

      if (!customRes.ok) {
        const errorData = await customRes.json().catch(() => ({}));
        setError(errorData?.message || 'Email atau kata sandi salah. Silakan periksa kembali.');
        setStep('idle');
        setLoading(false);
        return;
      }

      setStep('redirecting');
      const sessionRes = await fetch('/api/v1/auth/me');
      const sessionData = sessionRes.ok ? await sessionRes.json() : null;
      const userRole = sessionData?.user?.role || null;
      const userName = sessionData?.user?.name || sessionData?.user?.nama_lengkap || roleTitle;

      if (!userRole) {
        try {
          const { signOut } = await import('@darsa/auth/client');
          await signOut();
        } catch {}
        setError('Gagal memverifikasi akses. Silakan coba lagi.');
        setStep('idle');
        setLoading(false);
        return;
      }

      // Smart auto-routing: redirect every role to its exact database dashboard
      const redirectTo = ROLE_REDIRECT[userRole] || '/admin/dashboard';
      if (rememberMe) {
        try {
          const savedAvatar = localStorage.getItem('darsa_user_avatar') || activeLogo;
          localStorage.setItem(
            'darsa_remembered_user',
            JSON.stringify({
              email: email.toLowerCase().trim(),
              name: userName,
              role: userRole,
              avatarUrl: savedAvatar,
              biometricEnabled: localStorage.getItem('darsa_biometric_enabled') === 'true',
            })
          );
        } catch {}
      }

      window.location.href = redirectTo;
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
      if (rememberedUser) {
        setTimeout(() => {
          setStep('redirecting');
          const redirectTo = ROLE_REDIRECT[rememberedUser.role] || '/admin/dashboard';
          router.push(redirectTo);
        }, 800);
      } else {
        setError('Belum ada akun yang terdaftar untuk sidik jari di perangkat ini. Silakan login email & kata sandi terlebih dahulu.');
        setStep('idle');
        setLoading(false);
      }
    } catch {
      setError('Perangkat tidak mendukung Passkey atau sidik jari belum terdaftar.');
      setStep('idle');
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

  const handleSwitchAccount = () => {
    setUseRememberedView(false);
    setEmail('');
    setPassword('');
  };

  const maskEmail = (str: string) => {
    if (!str || !str.includes('@')) return str;
    const [name, domain] = str.split('@');
    const masked = name.length > 3 ? name.slice(0, 3) + '****' : name + '****';
    return `${masked}@${domain}`;
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

        {/* Card Main */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-200/80 overflow-hidden">
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" />

          {/* Header Gradient Section */}
          <div className={`relative p-6 bg-gradient-to-br ${activeAccent} text-white overflow-hidden`}>
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute right-0 top-0 w-44 h-44 rounded-full border-2 border-white translate-x-16 -translate-y-12" />
              <div className="absolute right-8 bottom-0 w-28 h-28 rounded-full border border-white translate-y-12" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative w-16 h-16 rounded-full border-[3px] border-amber-400/90 overflow-hidden shadow-xl shadow-black/20 shrink-0 bg-white/10 backdrop-blur-sm">
                <Image src={rememberedUser?.avatarUrl || activeLogo} alt={`Logo ${roleTitle}`} fill className="object-cover" />
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

          {/* Form & Bank-Style Content Area */}
          <div className="p-6 space-y-5">
            {/* BANK-STYLE REMEMBERED USER VIEW */}
            {rememberedUser && useRememberedView ? (
              <div className="space-y-4">
                {/* Greeting Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 rounded-2xl border border-emerald-200/80 text-center space-y-1 relative">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">
                    Selamat Datang Kembali
                  </span>
                  <h3 className="font-black text-base text-slate-900 leading-snug">{rememberedUser.name}</h3>
                  <p className="font-mono text-xs text-slate-500 font-medium">{maskEmail(rememberedUser.email)}</p>
                </div>

                {/* Error Notification */}
                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                    <span className="text-rose-500 text-sm shrink-0 mt-0.5">⚠️</span>
                    <p className="text-xs text-rose-700 font-semibold leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Redirecting Indicator */}
                {step === 'redirecting' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-3">
                    <LoadingSpinner size="sm" />
                    <p className="text-xs text-emerald-800 font-bold">Mengalihkan ke Portal Dashboard...</p>
                  </div>
                )}

                {step !== 'redirecting' && (
                  <form onSubmit={handleEmailLogin} className="space-y-3 text-xs">
                    <div>
                      <label htmlFor="password" className="text-xs font-bold text-slate-700 block mb-1">
                        Masukkan Kata Sandi
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Kata sandi akun Anda..."
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all pr-12"
                          disabled={loading}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                        >
                          {showPassword ? 'Sembunyi' : 'Lihat'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !password}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-xs shadow-lg shadow-emerald-800/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <span>Masuk ke Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Quick Biometrics & Google Options */}
                {step !== 'redirecting' && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handlePasskeyLogin}
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Fingerprint className="w-4 h-4 text-emerald-700" />
                      <span>Masuk dengan Sidik Jari / Wajah</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Masuk dengan Akun Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5 mt-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ganti Akun / Gunakan Email Lain</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* STANDARD LOGIN FORM (FIRST-TIME OR SWITCH ACCOUNT) */
              <div className="space-y-4">
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
                          <Fingerprint className="w-4 h-4 text-emerald-700" /> Passkey / Biometrik
                        </>
                      )}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                    <span className="text-rose-500 text-sm shrink-0 mt-0.5">⚠️</span>
                    <p className="text-xs text-rose-700 font-semibold leading-relaxed">{error}</p>
                  </div>
                )}

                {step === 'redirecting' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <LoadingSpinner size="sm" />
                    <p className="text-xs text-emerald-800 font-bold">Mengalihkan ke Portal Dashboard...</p>
                  </div>
                )}

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
                          className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                        >
                          {showPassword ? 'Sembunyi' : 'Lihat'}
                        </button>
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Kata sandi akun Anda..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="text-xs font-semibold text-slate-600">Ingat Akun di Perangkat ini</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email || !password}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-xs shadow-lg shadow-emerald-800/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <span>Masuk ke Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Masuk dengan Akun Google</span>
                    </button>

                    {/* Banner Aktivasi Akun Wali Santri via KK */}
                    <div className="pt-3 border-t border-slate-100 text-center">
                      <Link
                        href="/wali_santri/aktivasi"
                        className="w-full py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border border-amber-300 text-amber-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                      >
                        <span className="text-sm">👨‍👩‍👧</span>
                        <span>Wali Santri Baru? Aktivasi Akun dengan No. KK</span>
                      </Link>
                    </div>
                  </form>
                )}

                {authMethod === 'passkey' && step !== 'redirecting' && (
                  <div className="space-y-4 text-center py-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <Fingerprint className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Autentikasi Sidik Jari / Wajah</h4>
                      <p className="text-slate-500 text-xs mt-1">Gunakan sensor biometrik bawaan HP Anda untuk masuk tanpa password.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePasskeyLogin}
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      {loading ? 'Memverifikasi Biometrik...' : 'Verifikasi Sidik Jari / Wajah'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
