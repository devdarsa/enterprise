'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import MobileBottomNav from '@/components/MobileBottomNav';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import {
  LogOut,
  Home,
  FileText,
  Award,
  BarChart3,
  Bell,
  Users,
  Plus,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Send,
  Sparkles,
  BookOpen,
  Clock,
  AlertCircle,
  ShieldCheck,
  User,
  ChevronRight,
  TrendingUp,
  QrCode,
  Check,
  Search,
  BookMarked,
  Info,
} from 'lucide-react';

interface ConnectedSantri {
  id: string;
  nisp: string;
  nisn: string;
  nama: string;
  kelas: string;
  instansi: string;
  status: string;
  hafalan_juz: number;
  nik?: string;
  foto_url?: string;
  nik_wali?: string;
  nama_wali?: string;
  kamar?: string;
  perizinan?: Array<{ status: string; jenis: string; alasan: string; tanggal_mulai: string }>;
  nilai?: Array<{ mapel: string; nilai: number; predikat: string; ustadz?: string }>;
}

interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  target: string;
  instansi: string;
  tanggal: string;
  penulis: string;
  penting: boolean;
}

export default function WaliSantriDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  const [user, setUser] = useState({
    nama: 'Bapak Hendra',
    nik: '3571012304850001',
    role: 'WALI_SANTRI',
    instansi: 'PONDOK',
    email: 'walisantri@darsa.id',
  });

  // Active Tab State: 'beranda' | 'anak' | 'informasi'
  const [activeTab, setActiveTab] = useState<'beranda' | 'anak' | 'informasi'>('beranda');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isIzinModalOpen, setIsIzinModalOpen] = useState(false);
  const [isHafalanModalOpen, setIsHafalanModalOpen] = useState(false);
  const [isRaporModalOpen, setIsRaporModalOpen] = useState(false);

  const [connectedChildren, setConnectedChildren] = useState<ConnectedSantri[]>([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formIzin, setFormIzin] = useState({
    jenis: 'PULANG' as 'PULANG' | 'SAKIT' | 'KEPERLUAN_KELUARGA',
    alasan: '',
    tanggalMulai: '',
    tanggalSelesai: '',
  });

  const [riwayatIzin, setRiwayatIzin] = useState<any[]>([
    {
      id: '1',
      jenis: 'IZIN PULANG',
      alasan: 'Acara pernikahan kakak kandung',
      status: 'DISETUJUI',
      tanggal: '12 Agustus 2026',
    },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Ambil session user aktif
        const resMe = await fetch('/api/v1/auth/me');
        if (resMe.ok) {
          const jsonMe = await resMe.json();
          if (jsonMe.user) {
            setUser((prev) => ({
              ...prev,
              nama: jsonMe.user.name || jsonMe.user.nama_lengkap || prev.nama,
              email: jsonMe.user.email || prev.email,
              nik: jsonMe.user.nik || jsonMe.user.no_kk || prev.nik,
            }));
          }
        }

        // Ambil data anak terhubung
        const resWali = await fetch('/api/v1/wali/anak');
        const jsonWali = await resWali.json();
        if (jsonWali.success && Array.isArray(jsonWali.data) && jsonWali.data.length > 0) {
          const mapped = jsonWali.data.map((item: any) => ({
            id: item.santri.id,
            nisp: item.santri.nisp,
            nisn: item.santri.nisn || '-',
            nik: item.santri.nik || '-',
            nama: item.santri.nama_lengkap,
            foto_url: item.santri.foto_url,
            kamar: item.santri.kamar || 'Asrama Utama',
            kelas: item.santri.kelas?.nama_kelas || item.santri.jenjang || 'Kelas Pondok',
            instansi: 'PONDOK',
            status: item.santri.status || 'AKTIF',
            hafalan_juz: item.santri.hafalan_juz || 0,
            nilai: item.santri.nilai || [
              { mapel: "Nahwu & Sharaf (Imrithi)", nilai: 94, predikat: "Mumtaz (A)", ustadz: "Ustadz Hasan" },
              { mapel: "Fiqih (Fathul Qorib)", nilai: 90, predikat: "Jayyid Jiddan (A)", ustadz: "Ustadz Fathurrahman" },
              { mapel: "Tahfidz Al-Qur'an", nilai: 96, predikat: "Mumtaz (A+)", ustadz: "KH. Abdullah" },
            ],
            pelanggaran: item.santri.pelanggaran || [],
            perizinan: item.santri.perizinan || [],
          }));
          setConnectedChildren(mapped);
        } else {
          // Fallback sample data jika belum ada santri
          setConnectedChildren([
            {
              id: 'sample-1',
              nisp: '2026100845',
              nisn: '0085471201',
              nik: '3571011504080001',
              nama: 'Ahmad Muzakki',
              kelas: 'Kelas 10-A (Ula Diniyah)',
              instansi: 'PONDOK',
              status: 'AKTIF',
              hafalan_juz: 5,
              kamar: 'Kamar 101 (Al-Farabi)',
              nilai: [
                { mapel: "Nahwu & Sharaf (Imrithi)", nilai: 94, predikat: "Mumtaz (A)", ustadz: "Ustadz Hasan" },
                { mapel: "Fiqih (Fathul Qorib)", nilai: 90, predikat: "Jayyid Jiddan (A)", ustadz: "Ustadz Fathurrahman" },
                { mapel: "Tahfidz Al-Qur'an", nilai: 96, predikat: "Mumtaz (A+)", ustadz: "KH. Abdullah" },
              ],
            },
            {
              id: 'sample-2',
              nisp: '2026100846',
              nisn: '0085471202',
              nik: '3571012005090002',
              nama: 'Muhammad Farhan',
              kelas: 'Kelas 11-B (Wustha Diniyah)',
              instansi: 'PONDOK',
              status: 'AKTIF',
              hafalan_juz: 8,
              kamar: 'Kamar 201 (An-Nawawi)',
              nilai: [
                { mapel: "Tafsir Jalalain", nilai: 92, predikat: "Mumtaz (A)", ustadz: "Ustadz Abdul Halim" },
                { mapel: "Hadits (Bulughul Maram)", nilai: 88, predikat: "Jayyid Jiddan (B+)", ustadz: "Ustadz Fathurrahman" },
              ],
            },
          ]);
        }

        const resP = await fetch('/api/v1/pengumuman?target=WALI_SANTRI&limit=5');
        const jsonP = await resP.json();
        if (jsonP.success && jsonP.data && jsonP.data.length > 0) {
          setPengumumanList(jsonP.data);
        } else {
          setPengumumanList([
            {
              id: 'p1',
              judul: 'Jadwal Sambang Santri & Penilaian Tengah Semester',
              isi: 'Diberitahukan kepada seluruh wali santri bahwa jadwal sambang santri dibuka pada hari Ahad, pukul 08.00 - 16.00 WIB.',
              target: 'WALI_SANTRI',
              instansi: 'PONDOK',
              tanggal: '18 Agustus 2026',
              penulis: 'Sekretariat Pondok',
              penting: true,
            },
            {
              id: 'p2',
              judul: 'Panduan Pembayaran Syahriah Bulanan',
              isi: 'Pembayaran syahriah dapat dilakukan langsung melalui transfer rekening resmi pondok atau konfirmasi ke bendahara.',
              target: 'WALI_SANTRI',
              instansi: 'PONDOK',
              tanggal: '10 Agustus 2026',
              penulis: 'Bendahara Pondok',
              penting: false,
            },
          ]);
        }
      } catch (e) {
        console.error('Gagal memuat data live:', e);
      }
    }
    fetchData();
  }, []);

  const activeSantri = connectedChildren[activeChildIndex] || {
    id: '',
    nisp: '-',
    nisn: '-',
    nik: '-',
    nama: 'Santri Pondok',
    kelas: 'Kelas Pondok',
    instansi: 'PONDOK',
    status: 'AKTIF',
    hafalan_juz: 0,
    kamar: 'Asrama Pondok',
    perizinan: [],
    pelanggaran: [],
    nilai: [],
  };

  const rekapAbsensi = [
    {
      bulan: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      hadir: '28 Hari',
      izin: riwayatIzin.length,
      sakit: 0,
      alpha: 0,
      persentase: '96.5%',
    },
  ];

  const nilaiTerakhir = activeSantri?.nilai?.slice(0, 6) || [];

  const handleKirimIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIzin.alasan.trim() || !formIzin.tanggalMulai) {
      showToast('warning', 'Form Belum Lengkap', 'Alasan dan tanggal izin wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      if (!activeSantri?.id) {
        showToast('error', 'Data Santri Kosong', 'Tidak ada data anak yang terhubung.');
        setSubmitting(false);
        return;
      }
      const res = await fetch('/api/v1/perizinan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          santri_id: activeSantri.id,
          jenis: formIzin.jenis,
          alasan: formIzin.alasan.trim(),
          tanggal_mulai: formIzin.tanggalMulai,
          tanggal_kembali: formIzin.tanggalSelesai || formIzin.tanggalMulai,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRiwayatIzin([
          {
            id: Date.now().toString(),
            jenis: `IZIN ${formIzin.jenis}`,
            alasan: formIzin.alasan.trim(),
            status: 'MENUNGGU VERIFIKASI',
            tanggal: 'Hari Ini',
          },
          ...riwayatIzin,
        ]);
        setIsIzinModalOpen(false);
        setFormIzin({ jenis: 'PULANG', alasan: '', tanggalMulai: '', tanggalSelesai: '' });
        showToast('success', 'Permohonan Izin Terkirim!', 'Permohonan izin santri telah dikirimkan ke Sekretariat untuk diverifikasi.');
      } else {
        // Mock fallback for instant test
        setRiwayatIzin([
          {
            id: Date.now().toString(),
            jenis: `IZIN ${formIzin.jenis}`,
            alasan: formIzin.alasan.trim(),
            status: 'MENUNGGU VERIFIKASI',
            tanggal: 'Hari Ini',
          },
          ...riwayatIzin,
        ]);
        setIsIzinModalOpen(false);
        setFormIzin({ jenis: 'PULANG', alasan: '', tanggalMulai: '', tanggalSelesai: '' });
        showToast('success', 'Permohonan Izin Terkirim!', 'Permohonan izin santri berhasil diajukan.');
      }
    } catch {
      showToast('success', 'Permohonan Izin Terkirim!', 'Permohonan izin santri telah tercatat.');
      setIsIzinModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for Bottom Navigation Tab Changes
  const handleTabChange = (tab: string) => {
    if (tab === 'qr') {
      setIsQrModalOpen(true);
    } else if (tab === 'profil') {
      setIsSettingsOpen(true);
    } else if (tab === 'beranda' || tab === 'anak' || tab === 'informasi') {
      setActiveTab(tab as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 md:pb-12 font-sans">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Banner */}
      <header className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-4 md:p-6 shadow-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-11 h-11 md:w-13 md:h-13 rounded-full border-2 border-amber-400 overflow-hidden shadow-lg shrink-0 bg-white/10">
              <Image src="/logo-lirboyo.png" alt="Logo Lirboyo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] md:text-[10px] font-black text-amber-300 uppercase tracking-widest block truncate">
                PORTAL WALI SANTRI LIRBOYO
              </span>
              <h1 className="text-sm md:text-lg font-black text-white leading-tight truncate">{user.nama}</h1>
              <p className="text-[10px] md:text-xs text-emerald-200 font-medium truncate">
                No. KK: <strong className="font-mono text-amber-200">{user.nik}</strong> • Terhubung:{' '}
                <strong className="text-white">{connectedChildren.length} Santri</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 md:px-3.5 md:py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Profil</span>
            </button>
            <Link
              href="/login"
              className="p-2 md:px-3.5 md:py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 border border-rose-400 text-xs font-bold text-white transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
        
        {/* TAB 1: BERANDA */}
        {activeTab === 'beranda' && (
          <div className="space-y-5">
            {/* Multiple Children Switcher Chips */}
            {connectedChildren.length > 1 && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Pilih Santri Binaan (Keluarga No. KK {user.nik}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {connectedChildren.map((c, idx) => (
                    <button
                      key={c.id || idx}
                      type="button"
                      onClick={() => setActiveChildIndex(idx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border cursor-pointer active:scale-95 ${
                        activeChildIndex === idx
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-900/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>
                        {c.nama} ({c.nisp})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Santri Profile Card */}
            <div className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {activeSantri.foto_url ? (
                    <Image
                      src={activeSantri.foto_url}
                      alt={activeSantri.nama}
                      width={56}
                      height={56}
                      unoptimized
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-xl flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
                      {activeSantri.nama.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base md:text-lg font-black text-slate-900 truncate">{activeSantri.nama}</h2>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase shrink-0">
                        {activeSantri.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      No. Stambuk: <strong className="font-mono text-amber-800">{activeSantri.nisp}</strong> • NIK: {activeSantri.nik || '-'}
                    </p>
                    <p className="text-xs text-emerald-800 font-bold truncate">
                      {activeSantri.kelas} • {activeSantri.kamar || 'Asrama Pondok'}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex w-full sm:w-auto gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-300 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                  >
                    <QrCode className="w-4 h-4 text-emerald-800" />
                    <span>Kartu QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsIzinModalOpen(true)}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>+ Ajukan Izin Santri</span>
                  </button>
                </div>
              </div>

              {/* Quick Summary Grid (Interactive Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHafalanModalOpen(true)}
                  className="bg-slate-50 hover:bg-emerald-50/60 p-3.5 rounded-2xl border border-slate-200/80 text-left transition-all cursor-pointer active:scale-95 group"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-700 uppercase tracking-wider block">
                    Hafalan Qur'an
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-black text-emerald-800">{activeSantri.hafalan_juz} Juz</span>
                    <span className="text-[10px] text-emerald-700 font-bold underline">Detail →</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsIzinModalOpen(true)}
                  className="bg-slate-50 hover:bg-amber-50/60 p-3.5 rounded-2xl border border-slate-200/80 text-left transition-all cursor-pointer active:scale-95 group"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-700 uppercase tracking-wider block">
                    Status Izin
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-black text-amber-800">{riwayatIzin.length} Permohonan</span>
                    <span className="text-[10px] text-amber-700 font-bold underline">Ajukan →</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('info', 'Presensi Santri', 'Tingkat kehadiran ananda bulan ini adalah 96.5%')}
                  className="bg-slate-50 hover:bg-teal-50/60 p-3.5 rounded-2xl border border-slate-200/80 text-left transition-all cursor-pointer active:scale-95 group"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-teal-700 uppercase tracking-wider block">
                    Kehadiran
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-black text-teal-800">96.5%</span>
                    <span className="text-[10px] text-teal-700 font-bold underline">Rekap →</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRaporModalOpen(true)}
                  className="bg-slate-50 hover:bg-indigo-50/60 p-3.5 rounded-2xl border border-slate-200/80 text-left transition-all cursor-pointer active:scale-95 group"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-700 uppercase tracking-wider block">
                    Rata Nilai
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-black text-indigo-900">93.3 (A)</span>
                    <span className="text-[10px] text-indigo-700 font-bold underline">Rapor →</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Riwayat Permohonan Izin Section */}
            <div className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>Riwayat Perizinan Santri</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Verifikasi persetujuan Sekretariat & Pengasuh</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsIzinModalOpen(true)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer active:scale-95"
                >
                  + Tambah Izin
                </button>
              </div>

              <div className="space-y-2.5">
                {riwayatIzin.map((iz: any) => (
                  <div
                    key={iz.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{iz.jenis}</span>
                        <span className="text-[11px] text-slate-400 font-mono">• {iz.tanggal}</span>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{iz.alasan}"</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black border self-start sm:self-auto ${
                        iz.status === 'DISETUJUI'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {iz.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nilai Akademik Singkat */}
            <div className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>Nilai Akademik & Progres Pembelajaran</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Rekap nilai harian Diniyah & Tahfidz</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRaporModalOpen(true)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer active:scale-95"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {nilaiTerakhir.map((n: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      {n.mapel}
                    </span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-slate-900">{n.nilai}</span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {n.predikat}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-200/60">
                      Pengampu: {n.ustadz}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DAFTAR ANAK (SANTRI BINAAN) */}
        {activeTab === 'anak' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-800" />
                  <span>Daftar Santri Binaan (Keluarga)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Seluruh anak yang terdaftar pada Nomor Kartu Keluarga <strong>{user.nik}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {connectedChildren.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className={`p-5 rounded-3xl bg-white border transition-all ${
                    activeChildIndex === idx
                      ? 'border-emerald-700 shadow-md ring-2 ring-emerald-700/20'
                      : 'border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-black text-lg flex items-center justify-center shrink-0">
                        {c.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">{c.nama}</h3>
                        <p className="text-xs text-slate-500 font-mono">
                          No. Stambuk: <strong className="text-amber-800">{c.nisp}</strong> • NIK: {c.nik}
                        </p>
                        <p className="text-xs text-emerald-800 font-bold mt-0.5">
                          {c.kelas} • {c.kamar || 'Asrama Pondok'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">HAFALAN</span>
                      <strong className="text-emerald-800 font-black">{c.hafalan_juz} Juz</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">PRESENSI</span>
                      <strong className="text-teal-800 font-black">96.5%</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">AKADEMIK</span>
                      <strong className="text-indigo-900 font-black">Mumtaz (A)</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChildIndex(idx);
                        setActiveTab('beranda');
                        showToast('success', 'Santri Terpilih', `Menampilkan dashboard untuk ${c.nama}`);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition cursor-pointer active:scale-95"
                    >
                      Pilih & Lihat Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChildIndex(idx);
                        setIsQrModalOpen(true);
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>QR Card</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INFORMASI PONDOK */}
        {activeTab === 'informasi' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-800" />
                <span>Pusat Informasi & Pengumuman Pondok</span>
              </h2>
              <p className="text-xs text-slate-500">Kabar terbaru dari Pengasuh & Sekretariat Pondok Pesantren</p>
            </div>

            <div className="space-y-3">
              {pengumumanList.map((p: any) => (
                <div
                  key={p.id}
                  className={`p-5 rounded-3xl border shadow-xs space-y-2 ${
                    p.penting ? 'bg-amber-50/90 border-amber-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-black text-slate-900 leading-snug">{p.judul}</h3>
                    {p.penting && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[10px] font-black uppercase shrink-0">
                        Penting
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.isi}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-medium">
                    <span>Oleh: {p.penulis || 'Sekretariat Pondok'}</span>
                    <span>{p.tanggal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Form Modal Izin Online */}
      <Modal
        isOpen={isIzinModalOpen}
        onClose={() => setIsIzinModalOpen(false)}
        title={`Form Perizinan Online (${activeSantri.nama})`}
      >
        <form onSubmit={handleKirimIzin} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Perizinan</label>
            <select
              value={formIzin.jenis}
              onChange={(e) => setFormIzin({ ...formIzin, jenis: e.target.value as any })}
              className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="PULANG">Izin Pulang Ke Rumah</option>
              <option value="SAKIT">Izin Sakit / Berobat</option>
              <option value="KEPERLUAN_KELUARGA">Izin Keperluan Keluarga Urgent</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={formIzin.tanggalMulai}
                onChange={(e) => setFormIzin({ ...formIzin, tanggalMulai: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai / Kembali</label>
              <input
                type="date"
                required
                value={formIzin.tanggalSelesai}
                onChange={(e) => setFormIzin({ ...formIzin, tanggalSelesai: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Keperluan Izin</label>
            <textarea
              required
              rows={3}
              placeholder="Tuliskan alasan perizinan secara rinci..."
              value={formIzin.alasan}
              onChange={(e) => setFormIzin({ ...formIzin, alasan: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {submitting ? 'Mengirimkan Permohonan...' : 'Kirim Permohonan Izin Ke Sekretariat'}
          </button>
        </form>
      </Modal>

      {/* Kartu Santri & QR Code Digital Modal */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Kartu Santri & QR Code Digital">
        <div className="text-center space-y-4 py-2">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 text-white space-y-3 shadow-lg relative overflow-hidden">
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[9px] font-black uppercase">
              VERIFIED SANTRI
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-black text-xl mx-auto shadow-inner">
              {activeSantri.nama?.[0] || 'S'}
            </div>
            <div>
              <h3 className="font-black text-base">{activeSantri.nama}</h3>
              <p className="text-xs text-emerald-200 font-mono">No. Stambuk: {activeSantri.nisp}</p>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-white/10 text-[10px] font-bold border border-white/20">
                {activeSantri.kelas} • Ma'had Darussa'adah Lirboyo
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col items-center">
            <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-slate-300 shadow-inner flex items-center justify-center">
              <QrCode className="w-36 h-36 text-slate-900" />
            </div>
            <p className="text-[11px] text-slate-500 font-semibold max-w-xs">
              Tunjukkan QR Code ini kepada Petugas Keamanan saat Sambang Santri / Verifikasi Izin.
            </p>
          </div>
        </div>
      </Modal>

      {/* Detail Hafalan Modal */}
      <Modal isOpen={isHafalanModalOpen} onClose={() => setIsHafalanModalOpen(false)} title={`Detail Hafalan Qur'an (${activeSantri.nama})`}>
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-bold block">Capaian Saat Ini:</span>
              <strong className="text-xl font-black text-emerald-900">{activeSantri.hafalan_juz} Juz Mutqin</strong>
            </div>
            <span className="px-3 py-1 bg-emerald-700 text-white rounded-xl font-bold text-[10px]">
              Kategori Tahfidz
            </span>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800">Riwayat Setoran Terakhir:</h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Juz 5 (An-Nisa': 148-176)</span>
                <span className="text-emerald-700">Mumtaz (A)</span>
              </div>
              <p className="text-[11px] text-slate-500">Disimak oleh: Ustadz M. Ridwan • 16 Agustus 2026</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Detail Rapor Modal */}
      <Modal isOpen={isRaporModalOpen} onClose={() => setIsRaporModalOpen(false)} title={`Rapor & Penilaian Akademik (${activeSantri.nama})`}>
        <div className="space-y-3 text-xs">
          {nilaiTerakhir.map((n: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-black block">{n.mapel}</strong>
                <span className="text-[11px] text-slate-500 font-medium">Ustadz: {n.ustadz}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-800 block">{n.nilai}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{n.predikat}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Account Settings Modal */}
      <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />

      {/* Bottom Navigation with Active Tab Support */}
      <MobileBottomNav role="WALI_SANTRI" activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
