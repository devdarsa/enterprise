'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import MobileBottomNav from '@/components/MobileBottomNav';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import {
  LogOut,
  Plus,
  ClipboardList,
  BookOpen,
  User,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Settings,
  QrCode,
  Camera,
} from 'lucide-react';

interface SantriItem {
  id: string;
  nisp?: string;
  nisn: string;
  nama: string;
  kelas: string;
  status: string;
  hafalan: string;
  catatan: string;
}

interface SetoranItem {
  id: string;
  santri_nama: string;
  kelas: string;
  mapel: string;
  juz: number;
  surah: string;
  nilai: number;
  tanggal: string;
  ustadz: string;
}

export default function GuruMadrasahDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  const [activeTab, setActiveTab] = useState<'mustahiq' | 'munawwib'>('mustahiq');
  const [user, setUser] = useState({
    nama: 'Ustadz Mustahiq Diniyah',
    role: 'GURU_MADRASAH',
    instansi: 'MADRASAH',
    email: 'mustahiq@darsa.id',
  });
  const [loadingData, setLoadingData] = useState(true);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Mustahiq (Wali Kelas) Data State
  const [santriKelas, setSantriKelas] = useState<SantriItem[]>([]);
  // Munawwib (Guru Mapel) Form & Setoran State
  const [setoranList, setSetoranList] = useState<SetoranItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    santri_id: '',
    santri_nama: '',
    kelas: 'Kelas Diniyah',
    mapel: 'Tahfidz Al-Qur\'an',
    juz: '1',
    surah: 'Al-Baqarah',
    nilai: '90',
  });

  const handleTabChange = (tab: string) => {
    if (tab === 'qr' || tab === 'scan') {
      setIsScanModalOpen(true);
    } else if (tab === 'profil') {
      setIsSettingsOpen(true);
    } else if (tab === 'kelas') {
      setActiveTab('mustahiq');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'mapel' || tab === 'jadwal') {
      setActiveTab('munawwib');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('mustahiq');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h === '#profil') {
        setIsSettingsOpen(true);
      } else if (h === '#qr' || h === '#scan') {
        setIsScanModalOpen(true);
      } else if (h === '#mapel') {
        setActiveTab('munawwib');
      } else if (h === '#kelas') {
        setActiveTab('mustahiq');
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

  const loadRealData = async () => {
    try {
      setLoadingData(true);
      // Load session
      const sessRes = await fetch('/api/v1/auth/me');
      if (sessRes.ok) {
        const sess = await sessRes.json();
        if (sess?.user) {
          setUser({
            nama: sess.user.name || sess.user.nama_lengkap || 'Ustadz Mustahiq Diniyah',
            role: sess.user.role || 'GURU_MADRASAH',
            instansi: sess.user.instansi || 'MADRASAH',
            email: sess.user.email || 'mustahiq@darsa.id',
          });
        }
      }

      // Load live santri data from database
      const santriRes = await fetch('/api/v1/santri?limit=50&instansi=MADRASAH');
      if (santriRes.ok) {
        const santriJson = await santriRes.json();
        if (santriJson.success && Array.isArray(santriJson.data)) {
          const mappedSantri: SantriItem[] = santriJson.data.map((s: any) => ({
            id: s.id,
            nisp: s.nisp || '-',
            nisn: s.nisn || '-',
            nama: s.nama_lengkap || s.nama,
            kelas: s.kelas?.nama_kelas || s.kelas_madrasah || s.jenjang || 'Kelas Diniyah',
            status: s.status || 'AKTIF',
            hafalan: s.hafalan_juz ? `Juz ${s.hafalan_juz}` : 'Juz 1',
            catatan: 'Santri Aktif Diniyah',
          }));
          setSantriKelas(mappedSantri);
          if (mappedSantri.length > 0 && !form.santri_nama) {
            setForm((prev) => ({
              ...prev,
              santri_id: mappedSantri[0].id,
              santri_nama: mappedSantri[0].nama,
              kelas: mappedSantri[0].kelas,
            }));
          }
        }
      }

      // Load live nilai from database
      const nilaiRes = await fetch('/api/v1/nilai?limit=20');
      if (nilaiRes.ok) {
        const nilaiJson = await nilaiRes.json();
        if (nilaiJson.success && Array.isArray(nilaiJson.data)) {
          const mappedNilai: SetoranItem[] = nilaiJson.data.map((n: any) => ({
            id: n.id,
            santri_nama: n.santri?.nama_lengkap || 'Santri Diniyah',
            kelas: n.santri?.kelas?.nama_kelas || 'Kelas Diniyah',
            mapel: n.mata_pelajaran?.nama_mapel || 'Mapel Diniyah',
            juz: n.juz || 1,
            surah: n.surah || 'Al-Qur\'an',
            nilai: n.nilai || 0,
            tanggal: n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID') : 'Hari ini',
            ustadz: n.guru?.nama_lengkap || user.nama,
          }));
          setSetoranList(mappedNilai);
        }
      }
    } catch (e) {
      console.error('Gagal memuat data dashboard guru madrasah:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadRealData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputNilaiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const targetSantri = santriKelas.find((s) => s.id === form.santri_id || s.nama === form.santri_nama) || santriKelas[0];

      const res = await fetch('/api/v1/nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          santri_id: targetSantri?.id,
          mapel: form.mapel,
          nilai: parseInt(form.nilai) || 85,
          catatan: `Setoran ${form.surah} Juz ${form.juz}`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('success', 'Nilai & Setoran Tersimpan', `Data setoran untuk ${form.santri_nama} berhasil disimpan ke database.`);
        setIsModalOpen(false);
        await loadRealData();
      } else {
        showToast('error', 'Gagal Menyimpan', json.message || 'Terjadi kesalahan saat menyimpan nilai.');
      }
    } catch {
      showToast('error', 'Gangguan Server', 'Gagal menghubungkan ke database nilai.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScanPresensi = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/v1/absensi/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeToken: 'GURU-MADRASAH-PRESENSI-TOKEN',
          lat: -7.818,
          lng: 112.012,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Presensi Berhasil Terverifikasi', 'Kehadiran mengajar Guru Diniyah tercatat di database.');
        setIsScanModalOpen(false);
      } else {
        showToast('error', 'Presensi Gagal', json.message || 'Verifikasi kehadiran gagal.');
      }
    } catch {
      showToast('error', 'Koneksi Terputus', 'Gagal memproses presensi ke database.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 md:pb-12 font-sans antialiased">
      {/* Header Bar */}
      <header className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white px-3.5 py-3.5 sm:px-6 sm:py-5 shadow-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-md shrink-0 bg-white/10">
              <Image src="/logo-madrasah.png" alt="Logo Madrasah" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-black text-amber-300 uppercase tracking-wider block truncate">
                PORTAL MUSTAHIQ & MUNAWWIB
              </span>
              <h1 className="text-sm sm:text-base md:text-lg font-black leading-tight truncate">{user.nama}</h1>
              <p className="text-[10px] sm:text-xs text-emerald-200 font-medium truncate">Madrasah Diniyah Darussa'adah Lirboyo</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-1 active:scale-95 cursor-pointer touch-manipulation min-h-[38px]"
              aria-label="Buka Profil"
            >
              <User className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Profil</span>
            </button>
            <Link
              href="/login"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-600/85 hover:bg-rose-600 border border-rose-400 text-xs font-bold text-white transition-all flex items-center gap-1 active:scale-95 shrink-0 touch-manipulation min-h-[38px]"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
        {/* Tab Selector */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab('mustahiq')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 touch-manipulation min-h-[40px] cursor-pointer ${
              activeTab === 'mustahiq'
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mustahiq (Wali Kelas)</span>
          </button>
          <button
            onClick={() => setActiveTab('munawwib')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 touch-manipulation min-h-[40px] cursor-pointer ${
              activeTab === 'munawwib'
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Munawwib (Guru Mapel)</span>
          </button>
        </div>

        {/* Tab 1: Mustahiq View */}
        {activeTab === 'mustahiq' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm md:text-base font-black text-slate-900">Daftar Santri Kelas Diniyah</h2>
                <p className="text-xs text-slate-500 font-medium">Monitoring kehadiran & progres hafalan santri binaan</p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold self-start sm:self-auto">
                Total: {santriKelas.length} Santri
              </div>
            </div>

            {loadingData ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Mengambil data santri dari database...</p>
              </div>
            ) : santriKelas.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs font-medium text-slate-400">
                Belum ada data santri yang terdaftar di kelas Diniyah.
              </div>
            ) : (
              <>
                {/* Mobile View: Card Stack */}
                <div className="space-y-3 md:hidden">
                  {santriKelas.map((s) => (
                    <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">{s.nama}</h3>
                          <p className="text-[11px] text-slate-400 font-medium font-mono">No. Stambuk: {s.nisp}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                          {s.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Kelas</span>
                          <span className="font-semibold text-slate-700">{s.kelas}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9.5px] uppercase font-bold tracking-wider">Hafalan</span>
                          <span className="font-bold text-emerald-700">{s.hafalan}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Santri</th>
                        <th className="p-3.5">Kelas</th>
                        <th className="p-3.5">Hafalan Terakhir</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Catatan Mustahiq</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {santriKelas.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block text-sm">{s.nama}</span>
                            <span className="text-[11px] text-slate-400 font-mono">Stambuk: {s.nisp}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">{s.kelas}</td>
                          <td className="p-3.5 text-emerald-700 font-bold">{s.hafalan}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600 text-xs">{s.catatan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Munawwib View */}
        {activeTab === 'munawwib' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm md:text-base font-black text-slate-900">Input Setoran Hafalan & Nilai Mapel</h2>
                <p className="text-xs text-slate-500 font-medium">Rekapitulasi nilai harian pembelajaran Diniyah</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 shrink-0 active:scale-95 touch-manipulation min-h-[42px] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Input Setoran Baru</span>
              </button>
            </div>

            {setoranList.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs font-medium text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
                <p>Belum ada input setoran di database. Klik tombol di atas untuk menginput setoran baru.</p>
              </div>
            ) : (
              <>
                {/* Mobile View: Card Stack */}
                <div className="space-y-3 md:hidden">
                  {setoranList.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{item.santri_nama}</h3>
                          <p className="text-xs text-slate-500 font-medium">{item.mapel}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1 text-center">
                          <span className="text-[10px] text-emerald-600 block uppercase font-bold">Nilai</span>
                          <span className="font-black text-emerald-800 text-base leading-none">{item.nilai}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                        <span>Pemeriksa: {item.ustadz}</span>
                        <span>{item.tanggal}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Santri</th>
                        <th className="p-3.5">Mata Pelajaran</th>
                        <th className="p-3.5">Nilai</th>
                        <th className="p-3.5">Tanggal</th>
                        <th className="p-3.5">Ustadz Pemeriksa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {setoranList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{item.santri_nama}</td>
                          <td className="p-3.5 font-semibold text-slate-700">{item.mapel}</td>
                          <td className="p-3.5">
                            <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {item.nilai}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500 font-mono">{item.tanggal}</td>
                          <td className="p-3.5 text-slate-600">{item.ustadz}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Input Setoran Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Input Nilai & Setoran Santri">
        <form onSubmit={handleInputNilaiSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Santri</label>
            {santriKelas.length > 0 ? (
              <select
                value={form.santri_id}
                onChange={(e) => {
                  const sel = santriKelas.find((s) => s.id === e.target.value);
                  setForm({
                    ...form,
                    santri_id: e.target.value,
                    santri_nama: sel?.nama || '',
                    kelas: sel?.kelas || form.kelas,
                  });
                }}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs"
              >
                {santriKelas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.kelas})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="Ketik nama santri..."
                value={form.santri_nama}
                onChange={(e) => setForm({ ...form, santri_nama: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                required
                value={form.mapel}
                onChange={(e) => setForm({ ...form, mapel: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nilai (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={form.nilai}
                onChange={(e) => setForm({ ...form, nilai: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Juz</label>
              <input
                type="number"
                min="1"
                max="30"
                value={form.juz}
                onChange={(e) => setForm({ ...form, juz: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Surah / Kitab</label>
              <input
                type="text"
                value={form.surah}
                onChange={(e) => setForm({ ...form, surah: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 touch-manipulation min-h-[46px] cursor-pointer"
          >
            {submitting ? 'Menyimpan Nilai ke Database...' : 'Simpan Nilai ke Database'}
          </button>
        </form>
      </Modal>

      {/* Scan QR Modal */}
      <Modal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} title="Scan QR Code Presensi Diniyah">
        <div className="text-center space-y-4 py-2">
          <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-3 shadow-lg relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black mx-auto shadow-md">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-sm">Presensi Mandiri Guru Diniyah</h3>
              <p className="text-xs text-emerald-200">Ma'had Darussa'adah Lirboyo Kediri</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col items-center">
            <div className="w-44 h-44 bg-slate-900 rounded-2xl p-2 border-2 border-emerald-500/80 shadow-inner flex items-center justify-center relative overflow-hidden">
              {scanning ? (
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-amber-400 animate-pulse shadow-md shadow-amber-400"></div>
                  <Camera className="w-16 h-16 text-slate-500 animate-bounce" />
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleScanPresensi}
              disabled={scanning}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-xs shadow-md transition-all active:scale-95 min-h-[46px] touch-manipulation cursor-pointer"
            >
              {scanning ? 'Memverifikasi Presensi...' : 'Verifikasi Scan QR Presensi'}
            </button>
          </div>
        </div>
      </Modal>

      <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />
      <MobileBottomNav
        role={user.role === 'MUNAWWIB' ? 'MUNAWWIB' : 'GURU_MADRASAH'}
        activeTab={activeTab === 'mustahiq' ? 'kelas' : 'mapel'}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
