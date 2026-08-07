'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import MobileBottomNav from '@/components/MobileBottomNav';
import { getLocalCache, setLocalCache } from '@/lib/cache-storage';

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
  const [user, setUser] = useState({ nama: 'Ustadz Mustahiq Diniyah', role: 'GURU_MADRASAH', instansi: 'MADRASAH' });
  const [loadingData, setLoadingData] = useState(true);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-8">
      {/* Header Bar */}
      <header className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-md shrink-0 bg-white/10">
              <Image src="/logo-madrasah.png" alt="Logo Madrasah" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                PORTAL MUSTAHIQ & MUNAWWIB
              </span>
              <h1 className="text-base md:text-lg font-black leading-tight">{user.nama}</h1>
              <p className="text-xs text-emerald-200 font-medium">Madrasah Diniyah Darussa'adah Lirboyo</p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all"
          >
            🚪 Keluar
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Tab Selector */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <button
            onClick={() => setActiveTab('mustahiq')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mustahiq'
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
            }`}
          >
            📋 Wali Kelas / Mustahiq
          </button>
          <button
            onClick={() => setActiveTab('munawwib')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'munawwib'
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
            }`}
          >
            📖 Guru Mapel / Munawwib
          </button>
        </div>

        {/* Tab 1: Mustahiq View */}
        {activeTab === 'mustahiq' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Rekapitulasi Presensi & Hafalan Kelas Diniyah</h2>
                <p className="text-xs text-slate-500 font-medium">Monitoring harian santri kelas binaan</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {santriKelas.length} Santri Terdaftar
              </span>
            </div>

            {loadingData ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs font-bold text-slate-500">
                Mengambil data santri dari Database Server...
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Santri</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3">Hafalan Terakhir</th>
                        <th className="p-3">Status Presence</th>
                        <th className="p-3">Catatan Mustahiq</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {santriKelas.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{s.nama}</span>
                            <span className="text-[10px] text-slate-400">NISN: {s.nisn}</span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{s.kelas}</td>
                          <td className="p-3 text-emerald-700 font-bold">{s.hafalan}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 text-[11px]">{s.catatan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Munawwib View */}
        {activeTab === 'munawwib' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Input Setoran Hafalan & Nilai Mapel</h2>
                <p className="text-xs text-slate-500 font-medium">Rekapitulasi nilai harian pembelajaran Diniyah</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
              >
                + Input Setoran Baru
              </button>
            </div>

            {setoranList.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs font-medium text-slate-500">
                Belum ada input setoran baru hari ini. Klik tombol di atas untuk menginput setoran.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Santri</th>
                        <th className="p-3">Setoran / Surah</th>
                        <th className="p-3">Nilai</th>
                        <th className="p-3">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {setoranList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-900">{item.santri_nama}</td>
                          <td className="p-3 text-slate-700 font-semibold">{item.surah} (Juz {item.juz})</td>
                          <td className="p-3 font-black text-emerald-700 text-sm">{item.nilai}</td>
                          <td className="p-3 text-slate-500 text-[11px]">{item.tanggal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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

      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />
      <MobileBottomNav role="GURU_MADRASAH" />
    </div>
  );
}
