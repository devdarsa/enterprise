'use client';

import { useState, useMemo } from 'react';
import Modal, { ConfirmDialog } from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';

interface JadwalSlot {
  id: string;
  hari: string;
  jam: string;
  mapel: string;
  guru: string;
  ruang: string;
  kelas: string;
  jenis: 'WAJIB' | 'SUNNAH' | 'EKSTRAKURIKULER';
}

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
const JAM_LIST = ['07:30 - 09:00', '09:30 - 11:00', '13:00 - 14:30', '15:30 - 17:00', '19:00 - 20:30'];

const INITIAL_JADWAL: JadwalSlot[] = [
  { id: '1',  hari: 'Senin',   jam: '07:30 - 09:00', mapel: "Tahfidz Al-Qur'an",       guru: 'Ust. Fatimah Azzahra',  ruang: 'Ruang 10-A',    kelas: '10-A', jenis: 'WAJIB' },
  { id: '2',  hari: 'Senin',   jam: '09:30 - 11:00', mapel: 'Bahasa Arab (Saraf)',     guru: 'Ust. M. Zulkarnain',    ruang: 'Ruang 10-A',    kelas: '10-A', jenis: 'WAJIB' },
  { id: '3',  hari: 'Selasa',  jam: '07:30 - 09:00', mapel: 'Fiqih & Usul Fiqih',      guru: 'Ust. Ahmad Al-Farisi',  ruang: 'Ruang 10-A',    kelas: '10-A', jenis: 'WAJIB' },
  { id: '4',  hari: 'Selasa',  jam: '09:30 - 11:00', mapel: "Tahfidz Al-Qur'an",       guru: 'Ust. Fatimah Azzahra',  ruang: 'Ruang 10-A',    kelas: '10-A', jenis: 'WAJIB' },
  { id: '5',  hari: 'Rabu',    jam: '07:30 - 09:00', mapel: 'Bahasa Arab (Nahu)',      guru: 'Ust. M. Zulkarnain',    ruang: 'Ruang Bahasa',  kelas: '10-A', jenis: 'WAJIB' },
  { id: '6',  hari: 'Rabu',    jam: '09:30 - 11:00', mapel: 'Tafsir Jalalain',         guru: 'Dr. KH. A. Ridwan',     ruang: 'Ruang 10-A',    kelas: '10-A', jenis: 'WAJIB' },
  { id: '7',  hari: 'Kamis',   jam: '07:30 - 09:00', mapel: "Hadits Arba'in",          guru: 'Dr. KH. A. Ridwan',     ruang: 'Masjid Utama',  kelas: '10-A', jenis: 'WAJIB' },
  { id: '8',  hari: 'Kamis',   jam: '09:30 - 11:00', mapel: 'Bahasa Inggris',          guru: 'Ust. Sarah, M.Pd',      ruang: 'Ruang 10-A',    kelas: '10-A', jenis: 'WAJIB' },
  { id: '9',  hari: "Jum'at",  jam: '07:30 - 09:00', mapel: 'Kajian Kitab Kuning',    guru: 'Dr. KH. A. Ridwan',     ruang: 'Masjid Utama',  kelas: '10-A', jenis: 'SUNNAH' },
  { id: '10', hari: "Jum'at",  jam: '13:00 - 14:30', mapel: 'Praktek Khutbah',        guru: 'Ust. Ahmad Al-Farisi',  ruang: 'Aula Pondok',   kelas: '10-A', jenis: 'SUNNAH' },
  { id: '11', hari: 'Sabtu',   jam: '07:30 - 09:00', mapel: 'Sains & Matematika',     guru: 'Ust. Hendra, S.Pd',     ruang: 'Lab Sains',     kelas: '10-A', jenis: 'WAJIB' },
  { id: '12', hari: 'Sabtu',   jam: '15:30 - 17:00', mapel: 'Ekstrakurikuler Memanah', guru: 'Pelatih Ridho',         ruang: 'Lapangan Utama', kelas: '10-A', jenis: 'EKSTRAKURIKULER' },
];

const JENIS_CONFIG = {
  WAJIB:           { color: 'bg-emerald-50 border-emerald-300 text-emerald-900', header: 'border-emerald-300 bg-emerald-600', pill: 'bg-emerald-100 text-emerald-700' },
  SUNNAH:          { color: 'bg-amber-50 border-amber-300 text-amber-900',       header: 'border-amber-300 bg-amber-500',     pill: 'bg-amber-100 text-amber-700' },
  EKSTRAKURIKULER: { color: 'bg-teal-50 border-teal-300 text-teal-900',          header: 'border-teal-300 bg-teal-600',       pill: 'bg-teal-100 text-teal-700' },
};

export default function JadwalPelajaranPage() {
  const [jadwal, setJadwal] = useState<JadwalSlot[]>(INITIAL_JADWAL);
  const [selectedKelas, setSelectedKelas] = useState('10-A');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<JadwalSlot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JadwalSlot | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  const [form, setForm] = useState({ hari: 'Senin', jam: JAM_LIST[0], mapel: '', guru: '', ruang: '', kelas: '10-A', jenis: 'WAJIB' as 'WAJIB' | 'SUNNAH' | 'EKSTRAKURIKULER' });
  const resetForm = () => setForm({ hari: 'Senin', jam: JAM_LIST[0], mapel: '', guru: '', ruang: '', kelas: '10-A', jenis: 'WAJIB' });

  const openAdd = () => { setEditTarget(null); resetForm(); setIsModalOpen(true); };
  const openEdit = (slot: JadwalSlot) => {
    setEditTarget(slot);
    setForm({ hari: slot.hari, jam: slot.jam, mapel: slot.mapel, guru: slot.guru, ruang: slot.ruang, kelas: slot.kelas, jenis: slot.jenis });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mapel || !form.guru || !form.ruang) { showToast('warning', 'Data Tidak Lengkap', 'Mapel, guru, dan ruang wajib diisi.'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));

    if (editTarget) {
      setJadwal(prev => prev.map(j => j.id === editTarget.id ? { ...j, ...form } : j));
      showToast('success', 'Jadwal Diperbarui', `${form.mapel} pada ${form.hari} berhasil diperbarui.`);
    } else {
      const newSlot: JadwalSlot = { id: Date.now().toString(), ...form };
      setJadwal(prev => [...prev, newSlot]);
      showToast('success', 'Jadwal Ditambahkan', `${form.mapel} pada ${form.hari} berhasil ditambahkan.`);
    }

    setSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await new Promise(r => setTimeout(r, 500));
    setJadwal(prev => prev.filter(j => j.id !== deleteTarget.id));
    showToast('info', 'Slot Jadwal Dihapus', `${deleteTarget.mapel} dihapus dari jadwal.`);
    setDeleteTarget(null);
    setDeleting(false);
  };

  const filteredByKelas = useMemo(() => jadwal.filter(j => j.kelas === selectedKelas), [jadwal, selectedKelas]);

  // Build grid: hari x jam
  const gridData = useMemo(() => {
    const map: Record<string, Record<string, JadwalSlot | undefined>> = {};
    JAM_LIST.forEach(jam => {
      map[jam] = {};
      HARI_LIST.forEach(hari => { map[jam][hari] = undefined; });
    });
    filteredByKelas.forEach(slot => {
      if (map[slot.jam]) map[slot.jam][slot.hari] = slot;
    });
    return map;
  }, [filteredByKelas]);

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Jadwal Pelajaran Mingguan</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Pengaturan jadwal kegiatan belajar mengajar per kelas dan guru pengampu</p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary inline-flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Slot Jadwal
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Kelas Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Kelas:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['10-A', '11-B', '12-C'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedKelas(k)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${selectedKelas === k ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'}`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* View mode */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto">
          {[{ mode: 'grid', icon: '⊞', label: 'Grid' }, { mode: 'list', icon: '☰', label: 'List' }].map(v => (
            <button
              key={v.mode}
              type="button"
              onClick={() => setViewMode(v.mode as any)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${viewMode === v.mode ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500'}`}
            >
              <span>{v.icon}</span> {v.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
          {filteredByKelas.length} slot
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] font-bold">
        <span className="text-slate-400 uppercase tracking-wider">Keterangan:</span>
        {Object.entries(JENIS_CONFIG).map(([key, conf]) => (
          <span key={key} className={`px-2.5 py-1 rounded-full border ${conf.pill}`}>{key}</span>
        ))}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px] text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-200 w-32">Waktu</th>
                  {HARI_LIST.map(h => (
                    <th key={h} className="p-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {JAM_LIST.map(jam => (
                  <tr key={jam} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 text-center border-r border-slate-200 bg-slate-50/80">
                      <span className="font-mono text-[10px] font-bold text-emerald-700 block">{jam.split(' - ')[0]}</span>
                      <span className="text-[9px] text-slate-400">s/d {jam.split(' - ')[1]}</span>
                    </td>
                    {HARI_LIST.map(hari => {
                      const slot = gridData[jam]?.[hari];
                      const conf = slot ? JENIS_CONFIG[slot.jenis] : null;
                      return (
                        <td key={hari} className="p-2 border-r border-slate-100 last:border-r-0 align-top">
                          {slot && conf ? (
                            <div
                              className={`p-2.5 rounded-xl border ${conf.color} cursor-pointer hover:shadow-sm transition-all group`}
                              onClick={() => openEdit(slot)}
                            >
                              <span className="block font-bold text-[11px] leading-tight mb-1 truncate">{slot.mapel}</span>
                              <span className="block text-[10px] opacity-70 truncate">👤 {slot.guru}</span>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[9px] font-mono opacity-60 bg-white/60 px-1.5 py-0.5 rounded">📍 {slot.ruang}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(slot); }}
                                  className="text-[9px] opacity-0 group-hover:opacity-60 hover:!opacity-100 text-rose-500 font-bold transition-all"
                                >✕</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={openAdd}
                              className="w-full h-16 rounded-xl border-2 border-dashed border-slate-200 text-slate-300 hover:border-emerald-300 hover:text-emerald-400 transition-all text-lg flex items-center justify-center"
                            >
                              +
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {filteredByKelas.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">Belum ada jadwal untuk kelas ini.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {HARI_LIST.map(hari => {
                const slots = filteredByKelas.filter(j => j.hari === hari);
                if (slots.length === 0) return null;
                return (
                  <div key={hari}>
                    <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{hari}</span>
                    </div>
                    {slots.map(slot => {
                      const conf = JENIS_CONFIG[slot.jenis];
                      return (
                        <div key={slot.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                          <div className="w-24 shrink-0">
                            <span className="font-mono text-[11px] font-bold text-emerald-700">{slot.jam.split(' - ')[0]}</span>
                            <span className="block text-[10px] text-slate-400">s/d {slot.jam.split(' - ')[1]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-sm text-slate-900 truncate">{slot.mapel}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${conf.pill}`}>{slot.jenis}</span>
                            </div>
                            <span className="text-xs text-slate-500">👤 {slot.guru} • 📍 {slot.ruang}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => openEdit(slot)} className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors">Edit</button>
                            <button onClick={() => setDeleteTarget(slot)} className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors">Hapus</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editTarget ? 'Edit Slot Jadwal' : 'Tambah Slot Jadwal'} subtitle="Sistem KBM Darsa Enterprise" icon="📅">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Hari</label>
              <select value={form.hari} onChange={e => setForm(f => ({ ...f, hari: e.target.value }))} className="input-premium cursor-pointer">
                {HARI_LIST.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jam Pelajaran</label>
              <select value={form.jam} onChange={e => setForm(f => ({ ...f, jam: e.target.value }))} className="input-premium cursor-pointer">
                {JAM_LIST.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mata Pelajaran / Kitab <span className="text-rose-500">*</span></label>
            <input type="text" required value={form.mapel} onChange={e => setForm(f => ({ ...f, mapel: e.target.value }))} placeholder="Nama mata pelajaran atau kitab..." className="input-premium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Guru / Ustadz Pengampu <span className="text-rose-500">*</span></label>
            <input type="text" required value={form.guru} onChange={e => setForm(f => ({ ...f, guru: e.target.value }))} placeholder="Nama guru atau ustadz..." className="input-premium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Ruang / Tempat <span className="text-rose-500">*</span></label>
              <input type="text" required value={form.ruang} onChange={e => setForm(f => ({ ...f, ruang: e.target.value }))} placeholder="Ruang kelas / masjid..." className="input-premium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Pelajaran</label>
              <select value={form.jenis} onChange={e => setForm(f => ({ ...f, jenis: e.target.value as any }))} className="input-premium cursor-pointer">
                <option value="WAJIB">Wajib</option>
                <option value="SUNNAH">Sunnah / Kajian</option>
                <option value="EKSTRAKURIKULER">Ekstrakurikuler</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2 text-xs disabled:opacity-60">
              {submitting ? '⏳ Menyimpan...' : editTarget ? '💾 Perbarui Jadwal' : '💾 Simpan Jadwal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus Slot: ${deleteTarget?.mapel ?? ''}`}
        message={`Slot jadwal ${deleteTarget?.mapel} pada ${deleteTarget?.hari} (${deleteTarget?.jam}) akan dihapus permanen.`}
        confirmLabel="Ya, Hapus Slot"
        loading={deleting}
      />
    </div>
  );
}
