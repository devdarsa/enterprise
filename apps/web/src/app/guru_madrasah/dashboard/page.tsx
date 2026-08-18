'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import MobileBottomNav from '@/components/MobileBottomNav';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import { getLocalCache, setLocalCache } from '@/lib/cache-storage';
import { LogOut, Plus, ClipboardList, BookOpen, User, Calendar, CheckCircle2, MessageSquare, Sparkles, Settings, QrCode, Camera } from 'lucide-react';

interface SantriItem {
  id: string;
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
  juz: number;
  surah: string;
  nilai: number;
  tanggal: string;
  ustadz: string;
}

export default function GuruMadrasahDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [activeTab, setActiveTab] = useState<'mustahiq' | 'munawwib'>('mustahiq');
  const [user, setUser] = useState({ nama: 'Ustadz Mustahiq Diniyah', role: 'GURU_MADRASAH', instansi: 'MADRASAH', email: 'mustahiq@darsa.id' });
  const [loadingData, setLoadingData] = useState(true);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

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

  // Mustahiq (Wali Kelas) Data State
  const [santriKelas, setSantriKelas] = useState<SantriItem[]>([]);
  // Munawwib (Guru Mapel) Form & Setoran State
  const [setoranList, setSetoranList] = useState<SetoranItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    santri_nama: '',
    kelas: '10-A (Tahfidz & Diniyah)',
    mapel: 'Fiqih Fathul Qarib',
    juz: '15',
    surah: 'Al-Baqarah 1-50',
    nilai: '90',
  });

  useEffect(() => {
    const cached = getLocalCache<any>('guru_madrasah_data');
    if (cached) {
      if (cached.user) setUser(cached.user);
      if (cached.santriKelas) setSantriKelas(cached.santriKelas);
      setLoadingData(false);
    }

    async function loadRealData() {
      try {
        if (!cached) setLoadingData(true);
        let newUser = user;
        // Load session
        const sessRes = await fetch('/api/auth/get-session');
        if (sessRes.ok) {
          const sess = await sessRes.json();
          if (sess?.user) {
            newUser = {
              nama: sess.user.name || sess.user.nama_lengkap || 'Ustadz Mustahiq Diniyah',
              role: sess.user.role || 'GURU_MADRASAH',
              instansi: sess.user.instansi || 'MADRASAH',
              email: sess.user.email || 'mustahiq@darsa.id',
            };
            setUser(newUser);
          }
        }

        // Load real santri data
        let mappedSantri: SantriItem[] = [];
        const santriRes = await fetch('/api/v1/santri?limit=10&instansi=MADRASAH');
        if (santriRes.ok) {
          const santriJson = await santriRes.json();
          if (santriJson.success && Array.isArray(santriJson.data)) {
            mappedSantri = santriJson.data.map((s: any, idx: number) => ({
              id: s.id || String(idx + 1),
              nisn: s.nisn || `001234567${idx}`,
              nama: s.nama_lengkap || s.nama,
              kelas: s.kelas_madrasah || s.kelas || '10-A Diniyah',
              status: s.status || 'AKTIF',
              hafalan: s.hafalan_terakhir || 'Juz 15',
              catatan: 'Aktif & Rajin',
            }));
            setSantriKelas(mappedSantri);
            if (mappedSantri.length > 0 && !form.santri_nama) {
              setForm(prev => ({ ...prev, santri_nama: mappedSantri[0].nama }));
            }
          }
        }

        setLocalCache('guru_madrasah_data', { user: newUser, santriKelas: mappedSantri });
      } catch (e) {
        console.error('Gagal memuat data dashboard guru madrasah:', e);
      } finally {
        setLoadingData(false);
      }
    }
    loadRealData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputNilaiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const newItem: SetoranItem = {
        id: Date.now().toString(),
        santri_nama: form.santri_nama || 'Santri Diniyah',
        kelas: form.kelas,
        juz: parseInt(form.juz) || 15,
        surah: form.surah,
        nilai: parseInt(form.nilai) || 90,
        tanggal: new Date().toISOString().split('T')[0],
        ustadz: user.nama,
      };
      setSetoranList([newItem, ...setoranList]);
      setSubmitting(false);
      setIsModalOpen(false);
      showToast('success', 'Nilai & Setoran Tersimpan', `Data setoran untuk ${newItem.santri_nama} berhasil dicatat.`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-8">
      {/* Header Bar */}
      <header className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-md shrink-0 bg-white/10">
              <Image src="/logo-madrasah.png" alt="Logo Madrasah" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] md:text-[10px] font-black text-amber-300 uppercase tracking-wider block truncate">
                PORTAL MUSTAHIQ & MUNAWWIB
              </span>
              <h1 className="text-sm md:text-lg font-black leading-tight truncate">{user.nama}</h1>
              <p className="text-[11px] md:text-xs text-emerald-200 font-medium truncate">Madrasah Diniyah Darussa'adah Lirboyo</p>
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

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Tab Selector */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab('mustahiq')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'mustahiq'
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Wali Kelas</span>
          </button>
          <button
            onClick={() => setActiveTab('munawwib')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'munawwib'
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Guru Mapel</span>
          </button>
        </div>

        {/* Tab 1: Mustahiq View */}
        {activeTab === 'mustahiq' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm md:text-base font-black text-slate-900">Rekapitulasi Presensi & Hafalan Kelas Diniyah</h2>
                <p className="text-xs text-slate-500 font-medium">Monitoring harian santri kelas binaan</p>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {santriKelas.length} Santri Terdaftar
              </span>
            </div>

            {loadingData ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs font-bold text-slate-500">
                Mengambil data santri dari Database Server...
              </div>
            ) : (
              <>
                {/* Mobile View: Card Stack */}
                <div className="space-y-3 md:hidden">
                  {santriKelas.map((s) => (
                    <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">{s.nama}</h3>
                          <p className="text-[11px] text-slate-400 font-medium">NISN: {s.nisn}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          {s.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Kelas</span>
                          <span className="font-semibold text-slate-700">{s.kelas}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Hafalan Terakhir</span>
                          <span className="font-bold text-emerald-700">{s.hafalan}</span>
                        </div>
                      </div>

                      {s.catatan && (
                        <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="italic">{s.catatan}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Santri</th>
                        <th className="p-3.5">Kelas</th>
                        <th className="p-3.5">Hafalan Terakhir</th>
                        <th className="p-3.5">Status Presence</th>
                        <th className="p-3.5">Catatan Mustahiq</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {santriKelas.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block text-sm">{s.nama}</span>
                            <span className="text-[11px] text-slate-400">NISN: {s.nisn}</span>
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm md:text-base font-black text-slate-900">Input Setoran Hafalan & Nilai Mapel</h2>
                <p className="text-xs text-slate-500 font-medium">Rekapitulasi nilai harian pembelajaran Diniyah</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Input Setoran Baru</span>
              </button>
            </div>

            {setoranList.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs font-medium text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
                <p>Belum ada input setoran baru hari ini. Klik tombol di atas untuk menginput setoran.</p>
              </div>
            ) : (
              <>
                {/* Mobile View: Card Stack */}
                <div className="space-y-3 md:hidden">
                  {setoranList.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{item.santri_nama}</h3>
                          <p className="text-xs text-slate-500 font-medium">{item.surah} (Juz {item.juz})</p>
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
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Santri</th>
                        <th className="p-3.5">Setoran / Surah</th>
                        <th className="p-3.5">Nilai</th>
                        <th className="p-3.5">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {setoranList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="p-3.5 font-bold text-slate-900 text-sm">{item.santri_nama}</td>
                          <td className="p-3.5 text-slate-700 font-semibold">{item.surah} (Juz {item.juz})</td>
                          <td className="p-3.5 font-black text-emerald-700 text-base">{item.nilai}</td>
                          <td className="p-3.5 text-slate-500 text-xs">{item.tanggal}</td>
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


      {/* Input Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Input Setoran Hafalan & Nilai">
        <form onSubmit={handleInputNilaiSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Santri</label>
            <select
              value={form.santri_nama}
              onChange={(e) => setForm({ ...form, santri_nama: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              {santriKelas.map((s) => (
                <option key={s.id} value={s.nama}>
                  {s.nama} ({s.kelas})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Juz</label>
              <input
                type="number"
                value={form.juz}
                onChange={(e) => setForm({ ...form, juz: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nilai (0-100)</label>
              <input
                type="number"
                value={form.nilai}
                onChange={(e) => setForm({ ...form, nilai: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold text-emerald-800"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Surah / Ayat</label>
            <input
              type="text"
              value={form.surah}
              onChange={(e) => setForm({ ...form, surah: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-md hover:bg-emerald-800 transition-all"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Nilai & Setoran'}
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
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-amber-400 animate-pulse shadow-md shadow-amber-400"></div>
              <Camera className="w-16 h-16 text-slate-500 animate-bounce" />
            </div>
            <button
              type="button"
              onClick={async () => {
                showToast('success', 'Presensi Berhasil', 'Presensi kehadiran Guru Diniyah telah berhasil dicatat.');
                setIsScanModalOpen(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-xs shadow-md transition-all active:scale-95 min-h-[46px] touch-manipulation cursor-pointer"
            >
              Simulasi Scan QR Presensi
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

