'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';

interface SantriSummary {
  id: string;
  nama: string;
  nisp: string;
  kelas: string;
  status: string;
}

export default function RegisterWaliPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [nik, setNik] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [santriList, setSantriList] = useState<SantriSummary[]>([]);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  // Timer & Cooldown State
  const [expirySeconds, setExpirySeconds] = useState(60); // 1 menit (60s)
  const [cooldownSeconds, setCooldownSeconds] = useState(60); // 60s resend cooldown
  const [canResend, setCanResend] = useState(false);

  const showToast = (type: ToastProps['type'], title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message });
  };

  // Expiry & Cooldown Timers
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3 && expirySeconds > 0) {
      timer = setInterval(() => {
        setExpirySeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, expirySeconds]);

  useEffect(() => {
    let cooldownTimer: NodeJS.Timeout;
    if (step === 3 && cooldownSeconds > 0) {
      setCanResend(false);
      cooldownTimer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (step === 3 && cooldownSeconds === 0) {
      setCanResend(true);
    }
    return () => clearInterval(cooldownTimer);
  }, [step, cooldownSeconds]);

  // Step 1: Validasi NIK ke Database Pondok
  const handleCheckNik = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNik = nik.trim();
    if (!/^\d{16}$/.test(cleanNik)) {
      setError('NIK harus terdiri dari 16 digit angka kependudukan.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register-wali/check-nik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: cleanNik }),
      });

      const json = await res.json();
      setLoading(false);

      if (json.success) {
        setNamaWali(json.data.nama_wali);
        setSantriList(json.data.santri_list);
        setStep(2);
        showToast('success', 'NIK Valid!', `Ditemukan ${json.data.santri_count} santri terhubung pada Database Pondok.`);
      } else {
        setError(json.error || 'NIK tidak ditemukan di Database Pondok.');
      }
    } catch {
      setLoading(false);
      setError('Terjadi kesalahan koneksi saat memverifikasi NIK.');
    }
  };

  // Step 2: Kirim OTP WhatsApp via Fonnte
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Nomor WhatsApp wajib diisi dengan format angka aktif (contoh: 08123456789).');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Format Email / Username tidak valid.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register-wali/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, phone: cleanPhone, email: cleanEmail }),
      });

      const json = await res.json();
      setLoading(false);

      if (json.success) {
        setExpirySeconds(json.data.expires_in || 60);
        setCooldownSeconds(json.data.cooldown || 60);
        setCanResend(false);
        setStep(3);
        showToast('info', 'OTP Terkirim!', 'Kode verifikasi WhatsApp 6-digit (berlaku 1 menit / 60 detik) telah dikirimkan ke nomor WhatsApp Anda.');
      } else {
        setError(json.error || 'Gagal mengirimkan OTP WhatsApp.');
      }
    } catch {
      setLoading(false);
      setError('Gagal terhubung ke server pengiriman OTP.');
    }
  };

  // Resend OTP Trigger
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register-wali/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, phone, email }),
      });

      const json = await res.json();
      setLoading(false);

      if (json.success) {
        setOtp('');
        setExpirySeconds(json.data.expires_in || 180);
        setCooldownSeconds(json.data.cooldown || 60);
        setCanResend(false);
        showToast('success', 'OTP Baru Terkirim', 'Kode OTP baru telah dikirimkan via WhatsApp.');
      } else {
        setError(json.error || 'Gagal mengirim ulang OTP.');
      }
    } catch {
      setLoading(false);
      setError('Terjadi kesalahan saat meminta pengiriman ulang OTP.');
    }
  };

  // Step 3: Verifikasi OTP WhatsApp & Buat Akun
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('Kode OTP harus terdiri dari 6 digit angka.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register-wali/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik,
          phone,
          email,
          password,
          otp: cleanOtp,
        }),
      });

      const json = await res.json();
      setLoading(false);

      if (json.success) {
        setStep(4);
        showToast('success', 'Pendaftaran Berhasil!', 'Akun Wali Santri telah aktif dan terhubung otomatis dengan data anak.');
      } else {
        setError(json.error || 'Verifikasi OTP gagal.');
      }
    } catch {
      setLoading(false);
      setError('Terjadi kesalahan server saat memverifikasi OTP.');
    }
  };

  // Format Helper: Seconds to MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Decorative Gradient Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-900/40 mb-2 border border-emerald-400/30">
            <Image src="/logo-lirboyo.png" alt="Darsa Logo" width={44} height={44} className="object-contain" />
          </div>
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block">
            DARSA ENTERPRISE • PORTAL REGISTRASI WALI
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Pendaftaran Akun Wali Santri</h1>
          <p className="text-xs text-slate-400 font-medium">
            Verifikasi NIK Kependudukan & Kode OTP WhatsApp Fonnte API
          </p>
        </div>

        {/* Wizard Stepper Indicator */}
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700 -z-10" />
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all border-2 ${
                step === s
                  ? 'bg-emerald-600 text-white border-emerald-400 scale-110 shadow-lg shadow-emerald-900/50'
                  : step > s
                  ? 'bg-emerald-800 text-emerald-200 border-emerald-600'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2 animate-fadeIn">
            <span className="text-rose-400 font-bold shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: VALIDASI NIK */}
        {step === 1 && (
          <form onSubmit={handleCheckNik} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 space-y-1">
              <span className="font-bold text-emerald-400 block text-xs">ℹ️ Ketentuan Validasi NIK (SSOT):</span>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                Pendaftaran hanya dapat dilakukan apabila NIK Kependudukan Anda telah terdaftar sebagai Wali Santri pada Database Pondok. Data anak akan dihubungkan secara otomatis.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="nik-input" className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                Nomor Induk Kependudukan (NIK Wali 16 Digit) *
              </label>
              <input
                id="nik-input"
                type="text"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 3571012304850001"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || nik.length !== 16}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memeriksa Database Pondok...
                </>
              ) : (
                'Cek NIK Kependudukan →'
              )}
            </button>
          </form>
        )}

        {/* STEP 2: KREDENSIAL AKUN */}
        {step === 2 && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            {/* Confirmed NIK & Children Linked Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  ✅ NIK Terverifikasi: {nik}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {santriList.length} Anak Terhubung
                </span>
              </div>
              <p className="text-xs font-bold text-white">Nama Wali: {namaWali}</p>
              <div className="pt-1 space-y-1">
                {santriList.map((s) => (
                  <div key={s.id} className="text-[11px] text-emerald-200/90 flex justify-between border-t border-emerald-800/40 pt-1">
                    <span>🎓 {s.nama} ({s.nisp})</span>
                    <span className="font-mono text-emerald-400">{s.kelas}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone-input" className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                Nomor WhatsApp Aktif (Untuk OTP Fonnte API) *
              </label>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email-input" className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                Email / Username Akun *
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: wali.santri@gmail.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="pass-input" className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="pass-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="conf-pass-input" className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                  Konfirmasi Password *
                </label>
                <input
                  id="conf-pass-input"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Tampilkan Password</span>
              </label>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-white font-medium"
              >
                ← Kembali ke Step 1
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengirim OTP WhatsApp...
                </>
              ) : (
                'Kirim Kode OTP WhatsApp →'
              )}
            </button>
          </form>
        )}

        {/* STEP 3: VERIFIKASI OTP WHATSAPP */}
        {step === 3 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                📱
              </div>
              <p className="text-slate-300 font-medium">
                Kode OTP 6-digit dikirim via WhatsApp Fonnte ke:
              </p>
              <p className="text-base font-black text-emerald-400 font-mono tracking-wider">{phone}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px]">
                <span className="text-slate-400">Masa berlaku OTP:</span>
                <span className={`font-mono font-bold ${expirySeconds < 30 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                  {formatTimer(expirySeconds)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-center">
              <label htmlFor="otp-input" className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                Masukkan 6-Digit Kode OTP WhatsApp *
              </label>
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="482913"
                autoFocus
                required
                className="w-full max-w-xs mx-auto px-4 py-3.5 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 text-white font-mono text-2xl tracking-[0.5em] text-center focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className="text-emerald-400 hover:text-emerald-300 font-bold text-xs disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                {canResend
                  ? '🔄 Kirim Ulang Kode OTP'
                  : `🔄 Kirim Ulang OTP (${cooldownSeconds}s)`}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-slate-400 hover:text-white font-medium"
              >
                ← Ubah Kredensial
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || expirySeconds === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memverifikasi OTP & Membuat Akun...
                </>
              ) : (
                'Verifikasi OTP & Aktifkan Akun →'
              )}
            </button>
          </form>
        )}

        {/* STEP 4: SELESAI */}
        {step === 4 && (
          <div className="text-center space-y-6 py-4 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-900/40">
              ✓
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Akun Wali Santri Aktif!</h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Pendaftaran berhasil diselesaikan. Seluruh data anak Anda telah dihubungkan secara otomatis dari Database Pondok.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-left text-xs space-y-1.5">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Nama Wali:</span>
                <span className="font-bold text-white">{namaWali}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Email / Username:</span>
                <span className="font-mono text-emerald-400">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jumlah Anak Terhubung:</span>
                <span className="font-bold text-amber-300">{santriList.length} Santri</span>
              </div>
            </div>

            <Link
              href="/login"
              className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all"
            >
              Masuk ke Portal Wali Santri →
            </Link>
          </div>
        )}

        {/* Footer Navigation Back to Login */}
        <div className="pt-4 border-t border-slate-700/60 text-center">
          <p className="text-xs text-slate-400">
            Sudah memiliki akun Wali Santri?{' '}
            <Link href="/login" className="font-bold text-emerald-400 hover:underline">
              Masuk di Sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
