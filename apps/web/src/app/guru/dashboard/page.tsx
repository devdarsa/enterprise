'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import { LoadingSpinner, SearchBar } from '@/components/Loading';

interface SantriSetoran {
  id: string;
  nama: string;
  kelas: string;
  juz: number;
  surah: string;
  nilai: number;
  tanggal: string;
}

export default function GuruDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [setoranList, setSetoranList] = useState<SantriSetoran[]>([
    { id: '1', nama: 'Muhammad Raihan', kelas: '10-A (Tahfidz)', juz: 15, surah: 'Al-Isra', nilai: 95, tanggal: 'Hari Ini' },
    { id: '2', nama: 'Ahmad Fauzi', kelas: '10-A (Tahfidz)', juz: 12, surah: 'Yusuf', nilai: 88, tanggal: 'Hari Ini' },
    { id: '3', nama: 'Siti Aminah', kelas: '11-B (Sains)', juz: 18, surah: 'Al-Kahfi', nilai: 92, tanggal: 'Kemarin' },
  ]);

  const [isInputOpen, setIsInputOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState('Muhammad Raihan — 10-A');
  const [juz, setJuz] = useState('');
  const [surah, setSurah] = useState('');
  const [nilai, setNilai] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<{ nama: string; role: string }>({ nama: 'Dr. KH. Abdullah Ridwan', role: 'GURU' });

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setUser({ nama: s.nama, role: s.role });
      }
    } catch {}
  }, []);

  const handleInputTahfidz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!juz || !surah || !nilai) { showToast('warning', 'Data Tidak Lengkap', 'Isi semua field sebelum menyimpan.'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));
    const newSetoran: SantriSetoran = {
      id: Date.now().toString(),
      nama: selectedSantri.split(' — ')[0],
      kelas: selectedSantri.split(' — ')[1] ?? '10-A',
      juz: Number(juz),
      surah,
      nilai: Number(nilai),
      tanggal: 'Baru Saja',
    };
    setSetoranList(prev => [newSetoran, ...prev]);
    showToast('success', 'Setoran Tahfidz Tersimpan', `Mutaba'ah ${newSetoran.nama} berhasil disinkronkan ke Portal Wali.`);
    setIsInputOpen(false);
    setJuz(''); setSurah(''); setNilai('');
    setSubmitting(false);
  };

  const filtered = useMemo(() => {
    if (!search) return setoranList;
    const q = search.toLowerCase();
    return setoranList.filter(s => s.nama.toLowerCase().includes(q) || s.surah.toLowerCase().includes(q));
  }, [setoranList, search]);

  const jadwalHariIni = [
    { mapel: "Tahfidz Al-Qur'an (Juz 11-15)", kelas: 'Kelas 10-A', ruang: 'Ruang 10-A', jam: '07:30 - 09:00' },
    { mapel: "Hadits & Mustalah Hadits", kelas: 'Kelas 12-C', ruang: 'Masjid Utama', jam: '09:30 - 11:00' },
    { mapel: "Fiqih Ibadah", kelas: 'Kelas 11-B', ruang: 'Ruang 11-B', jam: '13:00 - 14:30' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header Banner */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border border-emerald-600 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-[3px] border-amber-400 overflow-hidden shadow-xl shadow-black/20 shrink-0">
              <Image src="/logo-madrasah.png" alt="Logo Madrasah" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">PORTAL USTADZ / DEWAN GURU LIRBOYO</span>
              <h1 className="text-xl font-black text-white">{user.nama}</h1>
              <p className="text-xs text-emerald-100 font-medium">Pengampu Tahfidz Al-Qur'an & Hadits • Madrasah Diniyah Darussa'adah</p>
            </div>
          </div>
          <Link href="/login" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shrink-0">
            🚪 Keluar
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Setoran', value: `${setoranList.length}`, icon: '📖', color: 'bg-emerald-50 border-emerald-200' },
          { label: 'Rata-rata Nilai', value: `${Math.round(setoranList.reduce((a, s) => a + s.nilai, 0) / (setoranList.length || 1))}`, icon: '⭐', color: 'bg-amber-50 border-amber-200' },
          { label: 'Jam Mengajar Hari Ini', value: '3 Sesi', icon: '📅', color: 'bg-teal-50 border-teal-200' },
          { label: 'Santri Bimbingan', value: '45', icon: '🎓', color: 'bg-slate-100 border-slate-200' },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${card.color} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Setoran Tahfidz */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Riwayat Setoran Tahfidz</h2>
              <p className="text-xs text-slate-500 mt-0.5">Mutaba'ah hafalan santri bimbingan</p>
            </div>
            <button type="button" onClick={() => setIsInputOpen(true)} className="btn-primary text-xs flex items-center gap-1.5">
              + Input Setoran
            </button>
          </div>

          <div className="p-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Cari nama santri atau surah..." />
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {filtered.map((s, i) => (
              <div key={s.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-sm font-black text-emerald-700 shrink-0">
                  {s.juz}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{s.nama}</p>
                  <p className="text-[11px] text-slate-500">{s.surah} • {s.kelas}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-sm font-black ${s.nilai >= 90 ? 'text-emerald-700' : s.nilai >= 75 ? 'text-amber-700' : 'text-rose-700'}`}>
                    {s.nilai}
                  </span>
                  <p className="text-[10px] text-slate-400">{s.tanggal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jadwal Mengajar */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Jadwal Mengajar Hari Ini</h2>
              <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <span className="text-2xl">📅</span>
          </div>

          <div className="p-4 space-y-3">
            {jadwalHariIni.map((j, i) => (
              <div key={i} className={`p-4 rounded-xl border ${i === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'} flex items-center justify-between`}>
                <div>
                  <span className="block font-bold text-slate-900 text-sm">{j.mapel}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{j.kelas} • {j.ruang}</span>
                </div>
                <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg border ${i === 0 ? 'bg-white text-emerald-800 border-emerald-300' : 'bg-white text-slate-600 border-slate-200'}`}>
                  {j.jam}
                </span>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <Link href="/admin/jadwal" className="w-full py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
              📅 Lihat Jadwal Lengkap
            </Link>
          </div>
        </div>
      </div>

      {/* Input Setoran Modal */}
      <Modal isOpen={isInputOpen} onClose={() => setIsInputOpen(false)} title="Input Setoran Tahfidz" subtitle="Mutaba'ah Hafalan Santri" icon="📖">
        <form onSubmit={handleInputTahfidz} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Santri</label>
            <select value={selectedSantri} onChange={e => setSelectedSantri(e.target.value)} className="input-premium cursor-pointer">
              <option value="Muhammad Raihan — 10-A">Muhammad Raihan — 10-A (Tahfidz)</option>
              <option value="Ahmad Fauzi — 10-A">Ahmad Fauzi — 10-A (Tahfidz)</option>
              <option value="Siti Aminah — 11-B">Siti Aminah — 11-B (Sains)</option>
              <option value="Fajar Hidayat — 12-C">Fajar Hidayat — 12-C (IPS)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Capaian Juz <span className="text-rose-500">*</span></label>
              <input type="number" required min="1" max="30" value={juz} onChange={e => setJuz(e.target.value)} placeholder="Juz ke..." className="input-premium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Surah <span className="text-rose-500">*</span></label>
              <input type="text" required value={surah} onChange={e => setSurah(e.target.value)} placeholder="Al-Baqarah..." className="input-premium" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nilai Kelancaran & Tajwid (0-100) <span className="text-rose-500">*</span></label>
            <input type="number" required min="0" max="100" value={nilai} onChange={e => setNilai(e.target.value)} placeholder="95" className="input-premium" />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsInputOpen(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2 text-xs disabled:opacity-60">
              {submitting ? <><LoadingSpinner size="sm" variant="white" /> Menyimpan...</> : '💾 Simpan Setoran'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
