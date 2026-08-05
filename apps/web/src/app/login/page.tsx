'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/Loading';
import { signIn } from '@darsa/auth/client';

type InstansiKey = 'pondok' | 'madrasah' | 'mi';
type AuthMethod = 'email' | 'passkey';

// Role → Dashboard redirect map (diisi setelah session diambil)
const ROLE_REDIRECT: Record<string, string> = {
  SEKRETARIAT: '/admin/dashboard',
  ADMIN_INSTANSI: '/admin/dashboard',
  GURU_MADRASAH: '/guru_madrasah/dashboard',
  GURU_MI: '/guru_mi/dashboard',
  GURU: '/guru_madrasah/dashboard',
  WALI_SANTRI: '/wali_santri/dashboard',
  SANTRI: '/santri/dashboard',
};

export default function LoginPage() {
  const router = useRouter();
  const [instansi, setInstansi] = useState<InstansiKey>('pondok');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'verifying' | 'redirecting'>('idle');

  // Wali Santri Self-Registration State
  const [isWaliRegisterModalOpen, setIsWaliRegisterModalOpen] = useState(false);
  const [regNik, setRegNik] = useState('');
  const [regHp, setRegHp] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNama, setRegNama] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

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

    try {
      const result = await signIn.email({
        email: email.toLowerCase().trim(),
        password,
        callbackURL: '/admin/dashboard', // fallback, middleware akan handle redirect
      });

      if (result.error) {
        setError(result.error.message || 'Email atau kata sandi salah.');
        setStep('idle');
        setLoading(false);
        return;
      }

      // Login berhasil — fetch session untuk ambil role
      setStep('redirecting');
      const sessionRes = await fetch('/api/auth/get-session');
      const sessionData = sessionRes.ok ? await sessionRes.json() : null;
      const role = sessionData?.user?.role || 'SEKRETARIAT';
      const redirectTo = ROLE_REDIRECT[role] || '/admin/dashboard';
      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan. Coba lagi.');
      setStep('idle');
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setStep('verifying');
    setError(null);
    try {
      // Note: Passkey requires better-auth passkey plugin to be configured
      // For now redirect to email login
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

  const handleWaliRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (regPassword !== regConfirmPassword) {
      setRegError('Password dan Konfirmasi Password tidak cocok!');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('Password minimal 8 karakter.');
      return;
    }
    if (!regEmail || !regNama || !regNik) {
      setRegError('Semua field wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      // Verifikasi NIK pada database santri
      const verifyRes = await fetch(`/api/v1/wali/verifikasi-nik?nik=${encodeURIComponent(regNik)}`);
      const verifyJson = await verifyRes.json();

      if (!verifyJson.success || !verifyJson.data?.length) {
        setRegError(`NIK ${regNik} tidak ditemukan di Database Pondok. Hubungi Sekretariat.`);
        setLoading(false);
        return;
      }

      // Buat akun via Better Auth
      const { authClient } = await import('@darsa/auth/client');
      const signUpResult = await authClient.signUp.email({
        email: regEmail,
        password: regPassword,
        name: regNama,
      });

      if (signUpResult?.error) {
        setRegError(signUpResult.error.message || 'Gagal membuat akun.');
        setLoading(false);
        return;
      }

      const anakNames = verifyJson.data.map((a: any) => a.nama_lengkap).join(', ');
      setRegSuccess(`Akun berhasil dibuat! NIK Anda terhubung dengan ${verifyJson.data.length} santri: ${anakNames}. Silakan login.`);
      setRegNik('');
      setRegEmail('');
      setRegNama('');
      setRegPassword('');
      setRegConfirmPassword('');
    } catch (err: any) {
      setRegError(err?.message || 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setLoading(false);
    }
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

            {/* BAB V - Self-Registration Button for Wali Santri */}
            <div className="pt-2 text-center border-t border-slate-200">
              <Link
                href="/register/wali"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black shadow-sm transition-all duration-200"
              >
                <span>👨‍👩‍👧</span>
                <span>Belum Punya Akun? Daftar Wali Santri (OTP WA & NIK) →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Pendaftaran Akun Wali Santri */}
      {isWaliRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>👨‍👩‍👧</span> Pendaftaran Akun Wali Santri
              </h3>
              <button onClick={() => setIsWaliRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            {regSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <p className="font-bold text-sm mb-1">✅ Pendaftaran Berhasil!</p>
                <p className="text-xs">{regSuccess}</p>
                <button
                  onClick={() => { setIsWaliRegisterModalOpen(false); setRegSuccess(null); }}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs"
                >
                  Tutup & Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleWaliRegisterSubmit} className="space-y-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900">
                  <p className="font-bold">ℹ️ Verifikasi Automatis NIK Master Pondok:</p>
                  <p className="mt-0.5">Sistem akan mencocokkan NIK Kependudukan dengan Database Pondok. Seluruh anak yang terhubung akan otomatis muncul di portal Anda.</p>
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    <p className="font-semibold">{regError}</p>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK Ayah / Ibu / Wali *</label>
                  <input
                    type="text"
                    required
                    placeholder="3571012304850001"
                    value={regNik}
                    onChange={(e) => setRegNik(e.target.value)}
                    className="input-premium font-mono"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bapak / Ibu Hendra"
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    className="input-premium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor HP *</label>
                    <input
                      type="tel"
                      required
                      placeholder="081399887766"
                      value={regHp}
                      onChange={(e) => setRegHp(e.target.value)}
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Akun *</label>
                    <input
                      type="email"
                      required
                      placeholder="wali@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="input-premium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 8 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Konfirmasi Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="input-premium"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsWaliRegisterModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md disabled:opacity-60"
                  >
                    {loading ? <LoadingSpinner size="sm" variant="white" /> : '🚀 Verifikasi NIK & Buat Akun'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
