'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';
import {
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Smartphone,
  Lock,
  Mail,
  KeyRound,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Check
} from 'lucide-react';

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
  const [expirySeconds, setExpirySeconds] = useState(60);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);
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

  const stepTitles = [
    'Validasi NIK',
    'Data Akun',
    'Verifikasi OTP',
    'Selesai',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8 relative overflow-hidden font-sans">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Ambient Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[350px] bg-amber-500/8 blur-[100px] rounded-full" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-xl relative z-10 space-y-4">
        {/* Navigation Back */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            ← Kembali ke Halaman Login
          </Link>
        </div>

        {/* Card Main */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-200/80 overflow-hidden">
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" />

          {/* Header Branding */}
          <div className="p-6 bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute right-0 top-0 w-44 h-44 rounded-full border-2 border-white translate-x-12 -translate-y-10" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative w-14 h-14 rounded-full border-2 border-amber-400 overflow-hidden shadow-lg shrink-0 bg-white/10">
                <Image src="/logo-lirboyo.png" alt="Logo Lirboyo" fill className="object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                  REGISTRASI ONLINE WALI SANTRI
                </span>
                <h1 className="text-lg md:text-xl font-black text-white leading-tight">Pendaftaran Akun Wali</h1>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  Verifikasi NIK Kependudukan & Kode OTP WhatsApp
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80">
            <div className="flex items-center justify-between relative max-w-sm mx-auto">
              <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="relative z-10 flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all border-2 ${
                      step === s
                        ? 'bg-emerald-700 text-white border-emerald-500 shadow-md shadow-emerald-800/20 scale-105'
                        : step > s
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-600'
                        : 'bg-white text-slate-400 border-slate-300'
                    }`}
                  >
                    {step > s ? <Check className="w-4 h-4 text-emerald-700" /> : s}
                  </div>
                  <span className={`text-[10px] font-extrabold ${step === s ? 'text-emerald-800' : 'text-slate-400'}`}>
                    {stepTitles[s - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content Area */}
          <div className="p-6 md:p-8 space-y-5">
            {/* Error Alert Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{error}</span>
              </div>
            )}

            {/* STEP 1: VALIDASI NIK */}
            {step === 1 && (
              <form onSubmit={handleCheckNik} className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-emerald-900 text-xs">Ketentuan Validasi NIK (SSOT)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    Pendaftaran akun wali santri memvalidasi NIK Kependudukan Anda ke Database Pondok Pesantren Lirboyo. Data santri binaan Anda akan terhubung secara otomatis.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="nik-input" className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
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
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || nik.length !== 16}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-xs shadow-lg shadow-emerald-800/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Memeriksa Database Pondok...</span>
                  ) : (
                    <>
                      <span>Cek NIK Kependudukan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: KREDENSIAL AKUN */}
            {step === 2 && (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                {/* Confirmed NIK & Children Linked Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200/90 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> NIK Terverifikasi: {nik}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[10px]">
                      {santriList.length} Santri Terhubung
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-900">Wali: {namaWali}</p>
                  <div className="pt-1 space-y-1">
                    {santriList.map((s) => (
                      <div key={s.id} className="text-[11px] text-slate-700 flex justify-between border-t border-emerald-200/60 pt-1.5">
                        <span className="font-semibold flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-700" /> {s.nama} ({s.nisp})
                        </span>
                        <span className="font-mono text-emerald-800 font-bold">{s.kelas}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone-input" className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                    Nomor WhatsApp Aktif (Untuk Kirim Kode OTP) *
                  </label>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email-input" className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                    Alamat Email Akun *
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: wali.santri@gmail.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="pass-input" className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                      Kata Sandi *
                    </label>
                    <input
                      id="pass-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="conf-pass-input" className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                      Konfirmasi Kata Sandi *
                    </label>
                    <input
                      id="conf-pass-input"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold">Tampilkan Sandi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ← Kembali ke Step 1
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-xs shadow-lg shadow-emerald-800/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Mengirim OTP WhatsApp...</span>
                  ) : (
                    <>
                      <span>Kirim Kode OTP WhatsApp</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: VERIFIKASI OTP WHATSAPP */}
            {step === 3 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <p className="text-slate-600 font-medium">
                    Kode OTP 6-digit dikirim via WhatsApp ke:
                  </p>
                  <p className="text-base font-black text-emerald-900 font-mono tracking-wider">{phone}</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-teal-200 text-[11px]">
                    <span className="text-slate-500">Masa berlaku OTP:</span>
                    <span className={`font-mono font-bold ${expirySeconds < 30 ? 'text-rose-600 animate-pulse' : 'text-amber-700'}`}>
                      {formatTimer(expirySeconds)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <label htmlFor="otp-input" className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
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
                    className="w-full max-w-xs mx-auto px-4 py-3 rounded-2xl bg-slate-50 border-2 border-emerald-600 text-slate-900 font-mono text-2xl tracking-[0.4em] text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600/30 transition-all shadow-inner"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                    className="text-emerald-700 hover:text-emerald-800 font-bold text-xs disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {canResend ? 'Kirim Ulang Kode OTP' : `Kirim Ulang OTP (${cooldownSeconds}s)`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                  >
                    ← Ubah Data Kredensial
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || expirySeconds === 0}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-xs shadow-lg shadow-emerald-800/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Memverifikasi OTP...</span>
                  ) : (
                    <>
                      <span>Verifikasi & Aktifkan Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: SELESAI */}
            {step === 4 && (
              <div className="text-center space-y-5 py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner border-2 border-emerald-300">
                  <CheckCircle2 className="w-10 h-10 text-emerald-700" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900">Akun Wali Santri Aktif!</h2>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                    Pendaftaran akun berhasil. Seluruh data santri terhubung secara otomatis dengan Database Pondok.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                    <span className="text-slate-500 font-semibold">Nama Wali:</span>
                    <span className="font-bold text-slate-900">{namaWali}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                    <span className="text-slate-500 font-semibold">Email / Username:</span>
                    <span className="font-mono text-emerald-800 font-bold">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Santri Terhubung:</span>
                    <span className="font-bold text-amber-800">{santriList.length} Santri</span>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="block w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-900 text-white font-black text-xs shadow-lg shadow-emerald-800/20 active:scale-95 transition-all text-center"
                >
                  Masuk ke Portal Wali Santri →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <p className="text-xs font-medium text-slate-500">
            Sudah memiliki akun Wali Santri?{' '}
            <Link href="/login" className="font-bold text-emerald-700 hover:underline">
              Masuk di Sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
