'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';

interface KamarAsrama {
  id: string;
  gedung: string;
  nomorKamar: string;
  kapasitas: number;
  terisi: number;
  waliKamar: string;
  status: 'TERSEDIA' | 'PENUH' | 'PERBAIKAN';
}

export default function ManajemenAsramaPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [kamarList, setKamarList] = useState<KamarAsrama[]>([
    {
      id: '1',
      gedung: 'Gedung A (Al-Farabi)',
      nomorKamar: 'A-101',
      kapasitas: 8,
      terisi: 8,
      waliKamar: 'Ustadz Ahmad Fauzan',
      status: 'PENUH',
    },
    {
      id: '2',
      gedung: 'Gedung A (Al-Farabi)',
      nomorKamar: 'A-102',
      kapasitas: 8,
      terisi: 6,
      waliKamar: 'Ustadz Ahmad Fauzan',
      status: 'TERSEDIA',
    },
    {
      id: '3',
      gedung: 'Gedung B (Al-Ghazali)',
      nomorKamar: 'B-201',
      kapasitas: 10,
      terisi: 7,
      waliKamar: 'Ustadz Ridwan Syah',
      status: 'TERSEDIA',
    },
  ]);

  const [form, setForm] = useState({
    gedung: 'Gedung A (Al-Farabi)',
    nomorKamar: '',
    kapasitas: 8,
    waliKamar: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomorKamar.trim() || !form.waliKamar.trim()) {
      showToast('warning', 'Form Belum Lengkap', 'Nomor kamar dan wali kamar wajib diisi.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsModalOpen(false);
      const newKamar: KamarAsrama = {
        id: Date.now().toString(),
        gedung: form.gedung,
        nomorKamar: form.nomorKamar.trim(),
        kapasitas: Number(form.kapasitas),
        terisi: 0,
        waliKamar: form.waliKamar.trim(),
        status: 'TERSEDIA',
      };
      setKamarList([newKamar, ...kamarList]);
      setForm({ gedung: 'Gedung A (Al-Farabi)', nomorKamar: '', kapasitas: 8, waliKamar: '' });
      showToast('success', 'Kamar Berhasil Ditambahkan', `Kamar ${newKamar.nomorKamar} (${newKamar.gedung}) tersimpan di Master Asrama.`);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Asrama & Kamar Santri</h1>
          <p className="text-xs text-slate-500">
            Kelola alokasi kamar, gedung asrama, kapasitas santri, dan pengasuh/wali kamar Pondok Pesantren.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition-all flex items-center gap-2"
        >
          <span>🏠</span> + Tambah Kamar Asrama Baru
        </button>
      </div>

      {/* Grid Status Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Kamar Asrama</span>
          <div className="text-2xl font-black text-slate-900">{kamarList.length} Kamar</div>
          <span className="text-[10px] text-emerald-700 font-bold block">Tersebar di 2 Gedung Kompleks</span>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Kapasitas Terisi</span>
          <div className="text-2xl font-black text-emerald-800">
            {kamarList.reduce((acc, k) => acc + k.terisi, 0)} / {kamarList.reduce((acc, k) => acc + k.kapasitas, 0)} Santri
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block">Hunian 85.5% Terisi</span>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sisa Slot Kosong</span>
          <div className="text-2xl font-black text-amber-700">
            {kamarList.reduce((acc, k) => acc + (k.kapasitas - k.terisi), 0)} Tempat Tidur
          </div>
          <span className="text-[10px] text-amber-800 font-bold block">Tersedia untuk Santri Baru</span>
        </div>
      </div>

      {/* Tabel Daftar Kamar */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Daftar Kamar & Gedung Asrama</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Gedung Asrama</th>
                <th>No. Kamar</th>
                <th>Kapasitas</th>
                <th>Terisi</th>
                <th>Wali / Pengasuh Kamar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {kamarList.map((k) => (
                <tr key={k.id}>
                  <td className="font-bold text-slate-900">{k.gedung}</td>
                  <td className="font-mono font-black text-emerald-700">{k.nomorKamar}</td>
                  <td className="font-semibold text-slate-600">{k.kapasitas} Santri</td>
                  <td className="font-bold text-slate-800">{k.terisi} Santri</td>
                  <td className="text-xs text-slate-700 font-medium">{k.waliKamar}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      k.status === 'PENUH'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {k.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah Kamar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Kamar Asrama Baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Gedung Kompleks Asrama</label>
            <select
              value={form.gedung}
              onChange={(e) => setForm({ ...form, gedung: e.target.value })}
              className="input-premium"
            >
              <option value="Gedung A (Al-Farabi)">Gedung A (Al-Farabi)</option>
              <option value="Gedung B (Al-Ghazali)">Gedung B (Al-Ghazali)</option>
              <option value="Kompleks Putri Al-Kautsar">Kompleks Putri Al-Kautsar</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor / Kode Kamar</label>
              <input
                type="text"
                required
                placeholder="Contoh: A-103"
                value={form.nomorKamar}
                onChange={(e) => setForm({ ...form, nomorKamar: e.target.value })}
                className="input-premium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kapasitas Maksimal</label>
              <input
                type="number"
                required
                min={1}
                max={20}
                value={form.kapasitas}
                onChange={(e) => setForm({ ...form, kapasitas: Number(e.target.value) })}
                className="input-premium"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Penanggung Jawab / Wali Kamar</label>
            <input
              type="text"
              required
              placeholder="Contoh: Ustadz Ahmad Fauzan"
              value={form.waliKamar}
              onChange={(e) => setForm({ ...form, waliKamar: e.target.value })}
              className="input-premium"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
          >
            {submitting ? 'Menyimpan Kamar...' : 'Simpan Kamar Asrama Baru'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
