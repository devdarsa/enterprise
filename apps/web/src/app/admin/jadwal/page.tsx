'use client';

import { useState, useEffect, useMemo } from 'react';
import Modal, { ConfirmDialog } from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState, SearchBar } from '@/components/Loading';

interface SlotJadwal {
  id: string;
  hari: string;
  jam: string;
  mapel: string;
  guru: string;
  ruang: string;
  kelas: string;
  jenis: 'WAJIB' | 'SUNNAH' | 'EKSTRAKURIKULER';
  instansi?: string;
}

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu', 'Ahad'];
const KELAS_LIST = ['10-A (Tahfidz)', '10-B (Tahfidz)', '11-A (Sains)', '11-B (Sains)', '12-A (IPS)', '7-A Diniyah', 'MI Kelas 4'];
const JENIS_CONFIG = {
  WAJIB:            { label: 'Wajib KBM', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  SUNNAH:           { label: 'Kajian Sunnah', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  EKSTRAKURIKULER:  { label: 'Ekstrakurikuler', color: 'bg-teal-50 text-teal-800 border-teal-200' },
};

export default function JadwalKBMPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [userRole, setUserRole] = useState<string>('ADMIN_INSTANSI');
  const [jadwalList, setJadwalList] = useState<SlotJadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedHari, setSelectedHari] = useState<string>('Semua');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SlotJadwal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  // Form state
  const [form, setForm] = useState({
    hari: 'Senin',
    jam: '07:30 - 09:00',
    mapel: '',
    guru: '',
    ruang: '',
    kelas: KELAS_LIST[0],
    jenis: 'WAJIB' as 'WAJIB' | 'SUNNAH' | 'EKSTRAKURIKULER',
  });

  // Read session cookie
  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        if (s.role) setUserRole(s.role);
        if (s.instansi) {
          const inst = s.instansi.toLowerCase() as 'pondok' | 'madrasah' | 'mi';
          if (['pondok', 'madrasah', 'mi'].includes(inst)) {
            setInstansiFilter(inst);
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => { fetchJadwal(); }, [instansiFilter]);

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=jadwal&instansi=${instansiFilter.toUpperCase()}`);
      const json = await res.json();
      if (json.success) setJadwalList(json.data);
    } catch {
      showToast('error', 'Gagal Memuat', 'Tidak dapat terhubung ke database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mapel.trim() || !form.guru.trim() || !form.ruang.trim()) {
      showToast('warning', 'Form Tidak Lengkap', 'Nama mata pelajaran, guru, dan ruangan wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        hari: form.hari,
        jam: form.jam,
        mapel: form.mapel.trim(),
        guru: form.guru.trim(),
        ruang: form.ruang.trim(),
        kelas: form.kelas,
        jenis: form.jenis,
        instansi: instansiFilter.toUpperCase(),
      };

      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_jadwal', payload }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Jadwal Disimpan', `Jadwal ${form.mapel} telah tersimpan di Database.`);
        fetchJadwal();
        setIsModalOpen(false);
        setForm({ hari: 'Senin', jam: '07:30 - 09:00', mapel: '', guru: '', ruang: '', kelas: KELAS_LIST[0], jenis: 'WAJIB' });
      } else {
        showToast('error', 'Gagal Simpan', json.message || 'Coba lagi.');
      }
    } catch {
      showToast('error', 'Kesalahan Sistem', 'Tidak dapat terhubung ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_jadwal', id: deleteTarget.id }),
      });
      const json = await res.json();
      if (json.success) {
        setJadwalList(prev => prev.filter(j => j.id !== deleteTarget.id));
        showToast('info', 'Jadwal Dihapus', `Slot jadwal ${deleteTarget.mapel} telah dihapus dari Database.`);
      }
    } catch {
      showToast('error', 'Gagal Hapus', 'Tidak dapat terhubung ke database.');
    } finally {
      setDeleteTarget(null);
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return jadwalList.filter(j => {
      const matchHari = selectedHari === 'Semua' || j.hari === selectedHari;
      const q = search.toLowerCase();
      const matchQuery = !q ||
        j.mapel.toLowerCase().includes(q) ||
        j.guru.toLowerCase().includes(q) ||
        j.ruang.toLowerCase().includes(q) ||
        j.kelas.toLowerCase().includes(q);
      return matchHari && matchQuery;
    });
  }, [jadwalList, selectedHari, search]);

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Jadwal KBM & Pelajaran</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Pengaturan jadwal kegiatan belajar mengajar per instansi dari Database Lokal
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-primary inline-flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Slot Jadwal
        </button>
      </div>

      {/* Filter + Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Instansi Display / Filter */}
        {userRole === 'SUPER_ADMIN' ? (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            {(['pondok', 'madrasah', 'mi'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => { setInstansiFilter(key); setSearch(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  instansiFilter === key ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                {key === 'pondok' ? '🏛 Pondok' : key === 'madrasah' ? '📚 Diniyah' : '🏫 MI'}
              </button>
            ))}
          </div>
        ) : (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 shrink-0">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
              {instansiFilter === 'pondok' ? '🏛️ Jadwal Pondok Pesantren' : instansiFilter === 'madrasah' ? '📚 Jadwal Madrasah Diniyah' : '🏫 Jadwal Formal / MI'}
            </span>
          </div>
        )}

        <div className="flex-1 w-full">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari mapel, guru, ruang, kelas..." />
        </div>

        {/* Hari Selector */}
        <select
          value={selectedHari}
          onChange={e => setSelectedHari(e.target.value)}
          className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer shrink-0"
        >
          <option value="Semua">Semua Hari</option>
          {HARI_LIST.map(h => <option key={h} value={h}>{h}</option>)}
        </select>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}
          >
            📋 Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}
          >
            ☰ Tabel
          </button>
        </div>
      </div>

      {/* Main Display */}
      {loading ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <SkeletonTable rows={4} cols={5} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Belum Ada Jadwal"
          description={search ? 'Coba kata kunci pencarian lain.' : 'Klik "Tambah Slot Jadwal" untuk mendaftarkan jam pelajaran baru.'}
          action={{ label: "Tambah Slot Jadwal", onClick: () => setIsModalOpen(true) }}
        />
      ) : viewMode === 'grid' ? (
        /* Grid View grouped by Hari */
        <div className="space-y-6">
          {HARI_LIST.map((hari) => {
            const dayItems = filtered.filter(j => j.hari === hari);
            if (dayItems.length === 0 && selectedHari !== 'Semua') return null;
            return (
              <div key={hari} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-sm font-black text-slate-900">{hari}</h2>
                    <span className="text-[11px] font-bold text-slate-400">({dayItems.length} kelas)</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Lirboyo Academic Grid</span>
                </div>

                {dayItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Tidak ada jadwal KBM pada hari {hari}.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayItems.map((j) => {
                      const jConfig = JENIS_CONFIG[j.jenis] || JENIS_CONFIG.WAJIB;
                      return (
                        <div key={j.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-2 group relative">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded-lg shadow-2xs">
                              ⏰ {j.jam}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${jConfig.color}`}>
                              {jConfig.label}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-black text-slate-900 text-sm">{j.mapel}</h3>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">👤 {j.guru}</p>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                            <span>📍 {j.ruang}</span>
                            <span className="font-bold text-slate-700">Kelas {j.kelas}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(j)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Hapus Jadwal"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">HARI & JAM</th>
                  <th className="py-3.5 px-4">MATA PELAJARAN / KITAB</th>
                  <th className="py-3.5 px-4">GURU / USTADZ</th>
                  <th className="py-3.5 px-4">KELAS & RUANG</th>
                  <th className="py-3.5 px-4">JENIS</th>
                  <th className="py-3.5 px-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filtered.map((j) => {
                  const jConfig = JENIS_CONFIG[j.jenis] || JENIS_CONFIG.WAJIB;
                  return (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{j.hari}</span>
                        <span className="font-mono text-[11px] text-emerald-800">{j.jam}</span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">{j.mapel}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">👤 {j.guru}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">Kelas {j.kelas}</span>
                        <span className="text-[11px] text-slate-400">📍 {j.ruang}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${jConfig.color}`}>
                          {jConfig.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(j)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Slot Jadwal KBM"
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hari *</label>
              <select
                value={form.hari}
                onChange={e => setForm({ ...form, hari: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
              >
                {HARI_LIST.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jam Pelajaran *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 07:30 - 09:00"
                value={form.jam}
                onChange={e => setForm({ ...form, jam: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran / Kitab Kuning *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Fiqih Fathul Qorib / Nahwu Saraf"
              value={form.mapel}
              onChange={e => setForm({ ...form, mapel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pengajar / Ustadz *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Ust. Ahmad Al-Farisi"
                value={form.guru}
                onChange={e => setForm({ ...form, guru: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ruangan / Kelas *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Ruang 10-A / Masjid"
                value={form.ruang}
                onChange={e => setForm({ ...form, ruang: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Kelas</label>
              <select
                value={form.kelas}
                onChange={e => setForm({ ...form, kelas: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
              >
                {KELAS_LIST.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kegiatan</label>
              <select
                value={form.jenis}
                onChange={e => setForm({ ...form, jenis: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="WAJIB">Wajib KBM</option>
                <option value="SUNNAH">Kajian Sunnah</option>
                <option value="EKSTRAKURIKULER">Ekstrakurikuler</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Slot Jadwal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Slot Jadwal?"
        message={`Apakah Anda yakin ingin menghapus jadwal "${deleteTarget?.mapel}" hari ${deleteTarget?.hari}?`}
        confirmLabel="Ya, Hapus Jadwal"
        loading={deleting}
      />
    </div>
  );
}
