'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import {
  Users,
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Copy,
  Check,
  Lock,
  Search,
} from 'lucide-react';

interface ConnectedChild {
  id: string;
  nama_lengkap: string;
  nisp: string;
  nik: string;
  kelas: string;
  status: string;
  hafalan_juz?: number;
  kamar?: string;
}

interface ActivatedAccount {
  email: string;
  nama_ayah: string;
  no_kk: string;
  role: string;
  kata_sandi: string;
  total_anak: number;
  anak: Array<{ nama: string; nisp: string; nik: string; kelas: string }>;
}

export default function AktivasiWaliSantriPage() {
  const router = useRouter();

  // Toast
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  // Wizard Steps: 1: KK & Ayah, 2: Preview Anak & Email, 3: OTP, 4: Selesai / Modal
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Form Inputs
  const [noKK, setNoKK] = useState('');
  const [namaAyah, setNamaAyah] = useState('');
  const [children, setChildren] = useState<ConnectedChild[]>([]);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);

  // Modal Detail Akun (Harus Diingat)
  const [accountDetailModal, setAccountDetailModal] = useState<ActivatedAccount | null>(null);
  const [copied, setCopied] = useState(false);

  // 1. Cek KK & Nama Ayah
  const handleCheckKK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noKK.trim() || noKK.trim().length < 10) {
      showToast('warning', 'Format KK Kurang', 'Masukkan Nomor Kartu Keluarga (KK) 16 digit.');
      return;
    }
    if (!namaAyah.trim()) {
      showToast('warning', 'Nama Ayah Kosong', 'Masukkan Nama Ayah sesuai pada Kartu Keluarga.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/wali/aktivasi/check-kk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ no_kk: noKK.trim(), nama_ayah: namaAyah.trim() }),
      });
      const data = await res.json();

      if (data.success && data.santri_list && data.santri_list.length > 0) {
        setChildren(data.santri_list);
        setNamaAyah(data.nama_ayah || namaAyah);
        setStep(2);
        showToast('success', 'Data Ditemukan!', `Ditemukan ${data.santri_list.length} santri yang terdaftar dalam KK.`);
      } else {
        showToast('error', 'Data Tidak Ditemukan', data.error || 'Nomor KK atau Nama Ayah tidak cocok dengan data santri di pondok.');
      }
    } catch {
      showToast('error', 'Gagal Terhubung', 'Terjadi kesalahan saat memeriksa database pondok.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Kirim Kode Verifikasi ke Email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('warning', 'Email Tidak Valid', 'Masukkan alamat email aktif yang benar.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/wali/aktivasi/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ no_kk: noKK.trim(), nama_ayah: namaAyah.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(3);
        setOtpSentNotice(data.message);
        if (data.otp_preview) {
          setOtp(data.otp_preview);
        }
        showToast('success', 'Kode Terkirim', `Kode verifikasi 6 digit telah dikirimkan ke ${email}.`);
      } else {
        showToast('error', 'Gagal Kirim OTP', data.error || 'Tidak dapat mengirimkan kode verifikasi.');
      }
    } catch {
      showToast('error', 'Gagal', 'Terjadi kesalahan sistem saat mengirim kode.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verifikasi OTP & Aktivasi Akun
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      showToast('warning', 'Kode Belum Lengkap', 'Masukkan 6 digit kode verifikasi.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/wali/aktivasi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          no_kk: noKK.trim(),
          nama_ayah: namaAyah.trim(),
          email: email.trim(),
          otp: otp.trim(),
        }),
      });
      const data = await res.json();

      if (data.success && data.account) {
        setAccountDetailModal(data.account);
        showToast('success', 'Aktivasi Berhasil!', 'Akun Wali Santri Anda telah siap digunakan.');
      } else {
        showToast('error', 'Verifikasi Gagal', data.error || 'Kode verifikasi salah atau kedaluwarsa.');
      }
    } catch {
      showToast('error', 'Gagal', 'Terjadi kesalahan saat memverifikasi akun.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!accountDetailModal) return;
    const text = `KREDENSIAL PORTAL WALI SANTRI DARSA LIRBOYO\nEmail: ${accountDetailModal.email}\nKata Sandi: ${accountDetailModal.kata_sandi}\nNomor KK: ${accountDetailModal.no_kk}\nNama Ayah: ${accountDetailModal.nama_ayah}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToDashboard = () => {
    router.replace('/wali_santri/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Decorative Background */}
      <div className="absolute inset-0 bg-radial from-emerald-950/60 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 p-6 flex items-center justify-between max-w-4xl mx-auto w-full">
        <Link href="/login" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-full border-2 border-amber-400 overflow-hidden shadow-lg shrink-0 bg-white/10">
            <Image src="/logo-lirboyo.png" alt="Logo Lirboyo" fill className="object-cover" />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
              PORTAL WALI SANTRI
            </span>
            <span className="text-sm font-black text-white group-hover:text-amber-200 transition-colors">
              Ma'had Darussa'adah Lirboyo
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs font-bold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 transition"
        >
          ← Kembali ke Login
        </Link>
      </header>

      {/* Main Content Box */}
      <main className="relative z-10 max-w-xl mx-auto w-full px-4 py-6">
        <div className="bg-slate-800/90 border border-emerald-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Aktivasi Akun Otomatis Wali Santri</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pencarian Data Keluarga & Anak
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Akun wali santri terbuat otomatis setelah data anak diinput. Cukup masukkan Nomor KK dan Nama Ayah untuk mengaktifkan akun Anda.
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between max-w-xs mx-auto text-[11px] font-bold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-amber-300' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-700 text-slate-400'}`}>
                1
              </span>
              <span>Data KK</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-700" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-amber-300' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-700 text-slate-400'}`}>
                2
              </span>
              <span>Data Anak</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-700" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-amber-300' : 'text-slate-500'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 3 ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-700 text-slate-400'}`}>
                3
              </span>
              <span>OTP Email</span>
            </div>
          </div>

          {/* STEP 1: INPUT NO KK & NAMA AYAH */}
          {step === 1 && (
            <form onSubmit={handleCheckKK} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-200">
                  Nomor Kartu Keluarga (KK) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={noKK}
                    onChange={(e) => setNoKK(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 3571012304850001 (16 digit)"
                    className="w-full pl-4 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Nomor KK digunakan untuk memfilter seluruh anak Anda yang berada di dalam pondok.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-200">
                  Nama Ayah (Sesuai pada KK) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaAyah}
                  onChange={(e) => setNamaAyah(e.target.value)}
                  placeholder="Contoh: H. Hendra Gunawan"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-bold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span>Mencari Data Santri di Pondok...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Cari Data Santri Terdaftar</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: TAMPILKAN DATA ANAK & INPUT EMAIL AKTIF */}
          {step === 2 && (
            <div className="space-y-5 pt-2">
              {/* Children List Card */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    Data Anak Terdaftar di Pondok ({children.length} Santri):
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Ganti KK
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {children.map((child, idx) => (
                    <div
                      key={child.id || idx}
                      className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-inner">
                          {child.nama_lengkap.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-white truncate">{child.nama_lengkap}</h4>
                          <p className="text-[10px] text-emerald-300 font-mono">
                            No. Stambuk: <strong>{child.nisp}</strong> • NIK: {child.nik}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        {child.kelas}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Input Email Aktif */}
              <form onSubmit={handleSendOTP} className="space-y-4 pt-2 border-t border-slate-700/80">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-200">
                    Input Email Aktif Orang Tua / Wali <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh: ayah.hendra@gmail.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-bold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Email ini akan digunakan untuk menerima kode verifikasi OTP dan menjadi email login utama Anda.
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3 px-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Mengirimkan Kode...</span>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Kirim Kode Verifikasi ke Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: INPUT OTP VERIFIKASI */}
          {step === 3 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 pt-2">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Kode verifikasi 6 digit telah dikirimkan ke <strong>{email}</strong>.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-200 text-center">
                  Masukkan 6-Digit Kode Verifikasi (OTP)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3.5 text-center tracking-[0.5em] text-xl font-mono font-black rounded-2xl bg-slate-900 border-2 border-emerald-500/60 text-emerald-300 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-3 px-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  ← Ganti Email
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Memverifikasi Akun...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verifikasi & Aktifkan Akun</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* MODAL POP-UP DETAIL AKUN (HARUS DIINGAT) */}
      <Modal
        isOpen={!!accountDetailModal}
        onClose={() => {}}
        title="🎉 Akun Wali Santri Berhasil Diaktifkan!"
      >
        {accountDetailModal && (
          <div className="space-y-5 text-xs text-slate-800">
            {/* Alert Harus Diingat */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400/80 text-amber-950 space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>KETERANGAN PENTING (HARUS DIINGAT):</span>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">
                Simpan dan catat informasi akun ini dengan baik. Gunakan email dan kata sandi di bawah untuk masuk ke <strong>Portal Wali Santri</strong> di perangkat mana saja kapan pun Anda ingin memantau ananda.
              </p>
            </div>

            {/* Credential Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-slate-500 uppercase tracking-widest text-[10px]">
                  Detail Akun Akses Wali Santri
                </span>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-emerald-700" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Akun'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Email Login:</span>
                  <strong className="font-mono text-emerald-900">{accountDetailModal.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Kata Sandi Default:</span>
                  <strong className="font-mono text-amber-800">{accountDetailModal.kata_sandi}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Nama Kepala Keluarga:</span>
                  <strong className="text-slate-900">{accountDetailModal.nama_ayah}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Nomor Kartu Keluarga:</span>
                  <strong className="font-mono text-slate-900">{accountDetailModal.no_kk}</strong>
                </div>
              </div>
            </div>

            {/* Connected Children Card */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Santri Binaan Terhubung ({accountDetailModal.anak.length} Anak):
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {accountDetailModal.anak.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{c.nama}</span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      No. Stambuk: {c.nisp} • {c.kelas}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button: Lanjutkan */}
            <button
              type="button"
              onClick={handleProceedToDashboard}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Lanjutkan ke Beranda Wali Santri</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </Modal>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-xs text-slate-500 border-t border-white/5 max-w-4xl mx-auto w-full">
        © 2025 Ma'had Darussa'adah Lirboyo Kota Kediri — Sistem Terpadu Wali Santri
      </footer>
    </div>
  );
}
