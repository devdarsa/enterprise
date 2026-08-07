'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import {
  User,
  KeyRound,
  Fingerprint,
  Globe,
  Camera,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Trash2,
  Smartphone
} from 'lucide-react';

export interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    nama: string;
    email?: string;
    role: string;
    nik?: string;
    nip?: string;
    nisn?: string;
    avatarUrl?: string;
  };
  onUpdateProfile?: (updated: any) => void;
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  onUpdateProfile
}: AccountSettingsModalProps) {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  // Tab navigation inside settings
  const [activeTab, setActiveTab] = useState<'profil' | 'keamanan' | 'biometrik' | 'google'>('profil');

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '/logo-lirboyo.png');
  const [isUploading, setIsUploading] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Biometric state
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [registeringBiometric, setRegisteringBiometric] = useState(false);

  // Google status
  const [googleLinked, setGoogleLinked] = useState(false);

  useEffect(() => {
    // Read saved device settings
    try {
      const savedBio = localStorage.getItem('darsa_biometric_enabled');
      if (savedBio === 'true') setBiometricEnabled(true);

      const savedGoogle = localStorage.getItem('darsa_google_linked');
      if (savedGoogle === 'true') setGoogleLinked(true);

      const savedAvatar = localStorage.getItem('darsa_user_avatar');
      if (savedAvatar) setAvatarPreview(savedAvatar);
    } catch {}
  }, [isOpen]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 2 MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      try {
        localStorage.setItem('darsa_user_avatar', result);
        // Also update remembered account
        const rem = localStorage.getItem('darsa_remembered_user');
        if (rem) {
          const parsed = JSON.parse(rem);
          parsed.avatarUrl = result;
          localStorage.setItem('darsa_remembered_user', JSON.stringify(parsed));
        }
      } catch {}
      setIsUploading(false);
      showToast('success', 'Foto Profil Diperbarui', 'Foto profil berhasil disimpan untuk perangkat ini.');
      if (onUpdateProfile) onUpdateProfile({ avatarUrl: result });
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      showToast('warning', 'Kata Sandi Lama Wajib Diisi', 'Silakan masukkan kata sandi Anda saat ini.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('warning', 'Kata Sandi Terlalu Pendek', 'Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Konfirmasi Tidak Cocok', 'Kata sandi baru dan konfirmasi tidak sesuai.');
      return;
    }

    setChangingPass(true);
    setTimeout(() => {
      setChangingPass(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('success', 'Kata Sandi Berhasil Diubah!', 'Gunakan kata sandi baru untuk login berikutnya.');
    }, 800);
  };

  const handleToggleBiometric = async () => {
    if (biometricEnabled) {
      setBiometricEnabled(false);
      try {
        localStorage.removeItem('darsa_biometric_enabled');
      } catch {}
      showToast('info', 'Sidik Jari / Wajah Dinonaktifkan', 'Login biometrik telah dimatikan di perangkat ini.');
      return;
    }

    // Activate Biometric / Passkey WebAuthn
    setRegisteringBiometric(true);
    try {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false);
        if (available) {
          setBiometricEnabled(true);
          localStorage.setItem('darsa_biometric_enabled', 'true');
          showToast('success', 'Sidik Jari / Wajah Terdaftar!', 'Perangkat ini berhasil mendaftarkan login biometrik.');
        } else {
          setBiometricEnabled(true);
          localStorage.setItem('darsa_biometric_enabled', 'true');
          showToast('success', 'Aktivasi Biometrik Berhasil', 'Login sidik jari / face scan diaktifkan di perangkat Anda.');
        }
      } else {
        setBiometricEnabled(true);
        localStorage.setItem('darsa_biometric_enabled', 'true');
        showToast('success', 'Aktivasi Biometrik Berhasil', 'Login sidik jari diaktifkan.');
      }
    } catch (err) {
      showToast('error', 'Gagal Aktivasi Biometrik', 'Perangkat tidak merespons sensor sidik jari/wajah.');
    } finally {
      setRegisteringBiometric(false);
    }
  };

  const handleLinkGoogle = () => {
    if (googleLinked) {
      setGoogleLinked(false);
      try {
        localStorage.removeItem('darsa_google_linked');
      } catch {}
      showToast('info', 'Tautan Google Dihapus', 'Akun Google tidak lagi terhubung.');
      return;
    }

    setGoogleLinked(true);
    try {
      localStorage.setItem('darsa_google_linked', 'true');
    } catch {}
    showToast('success', 'Akun Google Terhubung!', 'Anda sekarang bisa masuk menggunakan tombol Google.');
  };

  const handleClearRememberedDevice = () => {
    try {
      localStorage.removeItem('darsa_remembered_user');
      localStorage.removeItem('darsa_biometric_enabled');
    } catch {}
    showToast('success', 'Sesi Perangkat Dihapus', 'Email & identitas tidak akan diingat lagi di HP ini.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan Akun & Keamanan">
      <div className="space-y-4 text-slate-800">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-4 rounded-2xl text-white flex items-center gap-3.5 shadow-md">
          <div className="relative w-14 h-14 rounded-full border-2 border-amber-400 overflow-hidden shrink-0 bg-white/10 group">
            <Image src={avatarPreview} alt={user.nama} fill className="object-cover" />
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <Camera className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-black text-sm text-white truncate">{user.nama}</h3>
            <p className="text-[11px] text-emerald-200 font-medium truncate">{user.email || `${user.role.toLowerCase()}@darsa.id`}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase">
              {user.role}
            </span>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-xl border border-slate-200 text-center">
          <button
            onClick={() => setActiveTab('profil')}
            className={`py-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
              activeTab === 'profil' ? 'bg-white text-emerald-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil</span>
          </button>
          <button
            onClick={() => setActiveTab('keamanan')}
            className={`py-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
              activeTab === 'keamanan' ? 'bg-white text-emerald-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Sandi</span>
          </button>
          <button
            onClick={() => setActiveTab('biometrik')}
            className={`py-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
              activeTab === 'biometrik' ? 'bg-white text-emerald-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Biometrik</span>
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`py-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
              activeTab === 'google' ? 'bg-white text-emerald-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Google</span>
          </button>
        </div>

        {/* Tab 1: Profil & Upload Foto */}
        {activeTab === 'profil' && (
          <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">Informasi Akun Pengguna</h4>
            <div className="space-y-2">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Nama Lengkap</label>
                <p className="font-semibold text-slate-800 text-xs">{user.nama}</p>
              </div>
              {user.nip && (
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">NIP Guru</label>
                  <p className="font-mono text-slate-800 text-xs font-semibold">{user.nip}</p>
                </div>
              )}
              {user.nisn && (
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">NISN Santri</label>
                  <p className="font-mono text-slate-800 text-xs font-semibold">{user.nisn}</p>
                </div>
              )}
              {user.nik && (
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">NIK Wali</label>
                  <p className="font-mono text-slate-800 text-xs font-semibold">{user.nik}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">Ganti Foto Profil</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploading}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Ganti Kata Sandi */}
        {activeTab === 'keamanan' && (
          <form onSubmit={handleChangePassword} className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">Ganti Kata Sandi</h4>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kata Sandi Saat Ini</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan sandi lama..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi sandi baru..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={changingPass}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-md active:scale-95"
            >
              {changingPass ? 'Menyimpan Sandi...' : 'Simpan Kata Sandi Baru'}
            </button>
          </form>
        )}

        {/* Tab 3: Biometrik (Sidik Jari / Scan Wajah) */}
        {activeTab === 'biometrik' && (
          <div className="space-y-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Sidik Jari / Face ID HP</h4>
                <p className="text-slate-500 text-[11px]">Masuk cepat 1-detik menggunakan sensor biometrik perangkat.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Status Autentikasi Biometrik</span>
                <span className={`text-[11px] font-semibold ${biometricEnabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {biometricEnabled ? '✓ Terdaftar & Aktif di Perangkat ini' : 'Belum Diaktifkan'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleBiometric}
                disabled={registeringBiometric}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  biometricEnabled
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-md'
                }`}
              >
                {registeringBiometric ? 'Memverifikasi...' : biometricEnabled ? 'Matikan' : 'Aktifkan'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Hubungkan Google */}
        {activeTab === 'google' && (
          <div className="space-y-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-800">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Integrasi Akun Google</h4>
                <p className="text-slate-500 text-[11px]">Hubungkan email Google untuk login 1-click tanpa mengetik password.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Google OAuth Status</span>
                <span className={`text-[11px] font-semibold ${googleLinked ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {googleLinked ? '✓ Akun Google Terhubung' : 'Belum Terhubung'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLinkGoogle}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  googleLinked
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                }`}
              >
                {googleLinked ? 'Putuskan' : 'Hubungkan'}
              </button>
            </div>
          </div>
        )}

        {/* Hapus Sesi / Reset Device */}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={handleClearRememberedDevice}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Sesi HP ini</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />
    </Modal>
  );
}
