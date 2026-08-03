'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState, SearchBar } from '@/components/Loading';

interface SetoranItem {
  id: string;
  santri_nama: string;
  kelas: string;
  juz: number;
  surah: string;
  nilai: number;
  tanggal: string;
  ustadz: string;
  instansi?: string;
}

interface JadwalItem {
  id: string;
  hari: string;
  jam: string;
  mapel: string;
  guru: string;
  ruang: string;
  kelas: string;
}

export default function GuruDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [user, setUser] = useState({ nama: 'Ustadz Ahmad Al-Farisi', role: 'GURU', instansi: 'PONDOK' });
  const [setoranList, setSetoranList] = useState<SetoranItem[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    santri_nama: '',
    kelas: '10-A (Tahfidz)',
    juz: '15',
    surah: '',
    nilai: '90',
  });

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setUser({ nama: s.nama, role: s.role, instansi: s.instansi || 'PONDOK' });
      }
    } catch {}
  }, []);

  useEffect(() => { fetchGuruData(); }, [user.instansi]);

  const fetchGuruData = async () => {
    setLoading(true);
    try {
      const [resSetoran, resJadwal] = await Promise.all([
        fetch(`/api/v1/simulation/data?type=setoran&instansi=${user.instansi}`),
        fetch(`/api/v1/simulation/data?type=jadwal&instansi=${user.instansi}`),
      ]);
      const jsonSetoran = await resSetoran.json();
      const jsonJadwal = await resJadwal.json();

      if (jsonSetoran.success) setSetoranList(jsonSetoran.data);
      if (jsonJadwal.success) setJadwalList(jsonJadwal.data);
    } catch {
      showToast('error', 'Gagal Memuat', 'Tidak dapat terhubung ke database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetoran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.santri_nama.trim() || !form.surah.trim()) {
      showToast('warning', 'Form Tidak Lengkap', 'Nama santri dan surah wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        santri_nama: form.santri_nama.trim(),
        kelas: form.kelas,
        juz: parseInt(form.juz) || 1,
        surah: form.surah.trim(),
        nilai: parseInt(form.nilai) || 85,
        tanggal: 'Hari Ini',
        ustadz: user.nama,
        instansi: user.instansi,
      };

      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_setoran', payload }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Setoran Disimpan', `Setoran hafalan ${form.santri_nama} telah dicatat ke Database.`);
        fetchGuruData();
        setIsModalOpen(false);
        setForm({ santri_nama: '', kelas: '10-A (Tahfidz)', juz: '15', surah: '', nilai: '90' });
      } else {
        showToast('error', 'Gagal Simpan', json.message || 'Coba lagi.');
      }
    } catch {
      showToast('error', 'Kesalahan Sistem', 'Tidak dapat terhubung ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSetoran = setoranList.filter(s =>
    !search ||
    s.santri_nama.toLowerCase().includes(search.toLowerCase()) ||
    s.surah.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header Banner */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border border-emerald-600 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-[3px] border-amber-400 overflow-hidden shadow-xl shrink-0">
              <Image src="/logo-madrasah.png" alt="Logo" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">
                PORTAL GURU & USTADZ • {user.instansi}
              </span>
              <h1 className="text-xl font-black text-white">{user.nama}</h1>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Pengajar Mustahiq KBM & Mutaba'ah Tahfidz
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 text-emerald-950 font-black text-xs hover:bg-amber-300 transition-all shadow-md shrink-0"
            >
              📖 Input Setoran Hafalan
            </button>
            <Link href="/login" className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shrink-0">
              Keluar
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Setoran Recent */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Riwayat Mutaba'ah & Setoran</h2>
                <p className="text-xs text-slate-500 mt-0.5">Catatan setoran hafalan santri dari Database</p>
              </div>
              <div className="w-full sm:w-48">
                <SearchBar value={search} onChange={setSearch} placeholder="Cari santri/surah..." />
              </div>
            </div>

            {loading ? (
              <SkeletonTable rows={4} cols={4} />
            ) : filteredSetoran.length === 0 ? (
              <EmptyState
                icon="📖"
                title="Belum Ada Setoran"
                description="Klik 'Input Setoran Hafalan' untuk mencatat hafalan santri baru."
                action={{ label: "Input Setoran Baru", onClick: () => setIsModalOpen(true) }}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredSetoran.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-emerald-800 text-sm shrink-0">
                        {s.juz}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{s.santri_nama}</p>
                        <p className="text-[11px] text-slate-400">Surah {s.surah} • Kelas {s.kelas}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-sm font-black ${s.nilai >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        Nilai {s.nilai}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{s.tanggal}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Today's Jadwal */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Jadwal Mengajar</h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                {jadwalList.length} Slot
              </span>
            </div>

            {loading ? (
              <SkeletonTable rows={3} cols={2} />
            ) : jadwalList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Tidak ada jadwal mengajar terdaftar.</p>
            ) : (
              <div className="space-y-3">
                {jadwalList.map((j) => (
                  <div key={j.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 px-1.5 py-0.5 rounded">
                        {j.jam}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{j.hari}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">{j.mapel}</p>
                    <p className="text-[10px] text-slate-500">📍 {j.ruang} • Kelas {j.kelas}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Setoran Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Mutaba'ah & Setoran Tahfidz"
        size="md"
      >
        <form onSubmit={handleSaveSetoran} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Santri *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Muhammad Raihan"
              value={form.santri_nama}
              onChange={e => setForm({ ...form, santri_nama: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Capaian Juz (1-30)</label>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={form.juz}
                onChange={e => setForm({ ...form, juz: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Surah Terakhir *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Al-Isra / Yasin"
                value={form.surah}
                onChange={e => setForm({ ...form, surah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Tajwid & Kelancaran (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={form.nilai}
              onChange={e => setForm({ ...form, nilai: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Menyimpan...' : 'Simpan Setoran'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
