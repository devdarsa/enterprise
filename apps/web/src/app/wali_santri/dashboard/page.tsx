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
  QrCode
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
  nik_wali?: string;
  nama_wali?: string;
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
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [user, setUser] = useState({
    nama: 'Bapak Hendra',
    nik: '3571012304850001',
    role: 'WALI_SANTRI',
    instansi: 'PONDOK',
    email: 'walisantri@darsa.id',
  });

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h === '#profil') {
        setIsSettingsOpen(true);
      } else if (h === '#qr') {
        setIsQrModalOpen(true);
      } else if (h === '#izin' || h === '#perizinan') {
        setIsIzinModalOpen(true);
      } else if (h) {
        const target = document.querySelector(h);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [connectedChildren, setConnectedChildren] = useState<ConnectedSantri[]>([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);

  const [isIzinModalOpen, setIsIzinModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formIzin, setFormIzin] = useState({
    jenis: 'PULANG' as 'PULANG' | 'SAKIT' | 'KEPERLUAN_KELUARGA',
    alasan: '',
    tanggalMulai: '',
    tanggalSelesai: '',
  });

  const [riwayatIzin, setRiwayatIzin] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const resWali = await fetch('/api/v1/wali/anak');
        const jsonWali = await resWali.json();
        if (jsonWali.success && Array.isArray(jsonWali.data)) {
          const mapped = jsonWali.data.map((item: any) => ({
            id: item.santri.id,
            nisp: item.santri.nisp,
            nisn: item.santri.nisn,
            nama: item.santri.nama_lengkap,
            kelas: item.santri.kelas?.nama_kelas || 'Kelas Pondok',
            instansi: 'PONDOK',
            status: item.santri.status || 'AKTIF',
            hafalan_juz: item.santri.hafalan_juz || 0,
            nilai: item.santri.nilai || [],
            pelanggaran: item.santri.pelanggaran || [],
            perizinan: item.santri.perizinan || [],
          }));
          setConnectedChildren(mapped);
        }

        const resP = await fetch('/api/v1/pengumuman?target=WALI_SANTRI&limit=5');
        const jsonP = await resP.json();
        if (jsonP.success && jsonP.data) {
          setPengumumanList(jsonP.data);
        }

        const resIzin = await fetch('/api/v1/perizinan');
        if (resIzin.ok) {
          const jsonIzin = await resIzin.json();
          if (jsonIzin.success && Array.isArray(jsonIzin.data)) {
            setRiwayatIzin(jsonIzin.data);
          }
        }
      } catch (e) {
        console.error('Gagal memuat data wali live:', e);
      }
    }
    fetchData();
  }, []);

  const activeSantri = connectedChildren[activeChildIndex] || {
    id: '',
    nisp: '-',
    nisn: '-',
    nama: 'Belum Ada Data Anak',
    kelas: '-',
    instansi: 'PONDOK',
    status: 'AKTIF',
    hafalan_juz: 0,
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
      }
    } catch {
      showToast('error', 'Gagal Mengirimkan', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-8 font-sans">
      <Toast {...toast} onClose={() => setToast((t: any) => ({ ...t, isOpen: false }))} />

      {/* Header Banner */}
      <header className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-4 md:p-6 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-amber-400 overflow-hidden shadow-lg shrink-0 bg-white/10">
              <Image src="/logo-lirboyo.png" alt="Logo Lirboyo" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] md:text-[10px] font-black text-amber-300 uppercase tracking-widest block truncate">
                PORTAL WALI SANTRI LIRBOYO
              </span>
              <h1 className="text-base md:text-xl font-black text-white leading-tight truncate">{user.nama}</h1>
              <p className="text-[11px] md:text-xs text-emerald-200 font-medium truncate">
                NIK Wali: <strong className="font-mono text-amber-200">{user.nik}</strong> | Connected: <strong className="text-white">{connectedChildren.length || 1} Santri</strong>
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all shrink-0 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
        {/* Desktop & Mobile Anchor Nav */}
        <nav id="beranda" className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto gap-1">
          <a href="#beranda" className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-800 text-white shadow-sm shrink-0 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" /> Beranda
          </a>
          <a href="#surat" className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Status Izin
          </a>
          <a href="#akademik" className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Rapor & Hafalan
          </a>
          <a href="#absensi" className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Presensi
          </a>
          <a href="#pengumuman" className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" /> Informasi
          </a>
        </nav>

        {/* Multiple Children Switcher */}
        {connectedChildren.length > 1 && (
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Pilih Santri Binaan (Terhubung NIK {user.nik}):
            </span>
            <div className="flex flex-wrap gap-2">
              {connectedChildren.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChildIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    activeChildIndex === idx
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{c.nama} ({c.nisp})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Santri Profile Banner & Quick Action */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-700/20 shrink-0">
                {activeSantri.nama.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-black text-slate-900">{activeSantri.nama}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                    {activeSantri.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Stambuk: <strong className="font-mono text-amber-800">{activeSantri.nisp}</strong> • NISN: {activeSantri.nisn}
                </p>
                <p className="text-xs text-emerald-700 font-bold">
                  Kelas: {activeSantri.kelas} • Ma'had Darussa'adah Lirboyo
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsIzinModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all shrink-0 flex items-center justify-center gap-2 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>+ Ajukan Izin Santri Online</span>
            </button>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hafalan Qur'an</span>
              <span className="text-base font-black text-emerald-800">{activeSantri.hafalan_juz} Juz</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Izin</span>
              <span className="text-base font-black text-amber-700">{riwayatIzin.length} Permohonan</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kehadiran</span>
              <span className="text-base font-black text-emerald-800">96.5%</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-rata Nilai</span>
              <span className="text-base font-black text-teal-700">91.6 (A)</span>
            </div>
          </div>
        </div>

        {/* Status Permohonan Izin Section */}
        <div id="surat" className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 scroll-mt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Status Permohonan Izin Santri</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Verifikasi persetujuan Sekretariat & Pengasuh</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {riwayatIzin.map((iz: any) => (
              <div key={iz.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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

        {/* Nilai Akademik & Rapor */}
        <div id="akademik" className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 scroll-mt-6">
          <div>
            <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Nilai Akademik & Progres Pembelajaran</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Rekap nilai harian Diniyah & Tahfidz</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {nilaiTerakhir.map((n: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">{n.mapel}</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-slate-900">{n.nilai}</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">{n.predikat}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-200/60">Pengampu: {n.ustadz}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rekap Presensi Kehadiran */}
        <div id="absensi" className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 scroll-mt-6">
          <div>
            <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <span>Rekap Presensi Kehadiran Bulanan</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Catatan absensi mengaji & kegiatan pondok</p>
          </div>

          <div className="space-y-2">
            {rekapAbsensi.map((r: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{r.bulan}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                    <span>Hadir: <strong className="text-emerald-700 font-bold">{r.hadir}</strong></span>
                    <span>Izin: {r.izin}</span>
                    <span>Sakit: {r.sakit}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 self-start sm:self-auto">
                  {r.persentase} Kehadiran
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pengumuman Informasi */}
        <div id="pengumuman" className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 scroll-mt-6">
          <div>
            <h3 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-700" />
              <span>Pengumuman Resmi Pondok Pesantren</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Informasi resmi dari Pengasuh & Sekretariat</p>
          </div>

          <div className="space-y-3">
            {pengumumanList.length > 0 ? (
              pengumumanList.map((p: any) => (
                <div key={p.id} className={`p-4 rounded-2xl ${p.penting ? 'bg-amber-50/80 border border-amber-200' : 'bg-slate-50 border border-slate-200/80'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-bold text-slate-900">{p.judul}</h4>
                    <span className="text-[10px] text-amber-800 font-semibold">{p.tanggal}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.isi}</p>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 p-6 text-center rounded-2xl border border-slate-200 text-xs font-medium text-slate-500">
                Belum ada pengumuman baru dari Sekretariat.
              </div>
            )}
          </div>
        </div>
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
              className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai / Kembali</label>
              <input
                type="date"
                required
                value={formIzin.tanggalSelesai}
                onChange={(e) => setFormIzin({ ...formIzin, tanggalSelesai: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
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
              {connectedChildren[activeChildIndex]?.nama?.[0] || 'S'}
            </div>
            <div>
              <h3 className="font-black text-base">{connectedChildren[activeChildIndex]?.nama || 'Ahmad Muzakki'}</h3>
              <p className="text-xs text-emerald-200 font-mono">NISP: {connectedChildren[activeChildIndex]?.nisp || '2026100845'}</p>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-white/10 text-[10px] font-bold border border-white/20">
                {connectedChildren[activeChildIndex]?.kelas || 'Kelas 10-A Diniyah'} • {connectedChildren[activeChildIndex]?.instansi || 'Pondok Pesantren'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col items-center">
            <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-slate-300 shadow-inner flex items-center justify-center">
              <QrCode className="w-36 h-36 text-slate-900" />
            </div>
            <p className="text-[11px] text-slate-500 font-semibold max-w-xs">
              Tunjukkan QR Code ini kepada Petugas Keamanan saat Sambang Santri / Perizinan.
            </p>
          </div>
        </div>
      </Modal>

      <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />
      <MobileBottomNav role="WALI_SANTRI" />
    </div>
  );
}
