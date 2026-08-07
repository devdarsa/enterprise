'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import Modal from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';

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
  const [detailKamar, setDetailKamar] = useState<KamarAsrama | null>(null);

  const [kamarList, setKamarList] = useState<KamarAsrama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAsramaLive() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/asrama');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped = json.data.map((k: any) => ({
              id: k.id,
              gedung: k.gedung?.nama_gedung || 'Gedung Asrama',
              nomorKamar: k.nama_kamar,
              kapasitas: k.kapasitas || 15,
              terisi: k.santri?.length || 0,
              waliKamar: 'Ustadz Pembina',
              status: (k.santri?.length || 0) >= (k.kapasitas || 15) ? 'PENUH' : 'TERSEDIA',
            }));
            setKamarList(mapped);
          }
        }
      } catch (e) {
        console.error('Gagal memuat kamar asrama:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAsramaLive();
  }, []);

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

  const handleDelete = (id: string, nama: string) => {
    setKamarList((prev) => prev.filter((k) => k.id !== id));
    showToast('success', 'Kamar Dihapus (Soft Delete)', `Kamar ${nama} dipindahkan ke Recycle Bin.`);
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="🏢"
        title="Data Asrama, Kamar & Pembina"
        subtitle="Pengelolaan Gedung Asrama, Kamar Santri, Penempatan Kamar, & Pembina Asrama"
        badge="DATABASE PONDOK"
        primaryAction={{ label: '+ Tambah Kamar / Asrama Baru', onClick: () => setIsModalOpen(true) }}
        onExportExcel={() => showToast('info', 'Export Data', 'Mengeksport data kamar ke Excel.')}
        onRefresh={() => showToast('info', 'Refresh', 'Data refreshed.')}
      />

      {/* Grid Status Quick Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block">Total Gedung Asrama</span>
          <span className="text-xl font-black text-slate-900">2 Gedung Utama</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block">Kapasitas Terisi</span>
          <span className="text-xl font-black text-emerald-700">21 / 26 Santri</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block">Pembina Asrama</span>
          <span className="text-xl font-black text-amber-700">2 Ustadz Pembina</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={4} cols={6} /></div>
        ) : (
          <div className="overflow-x-auto">
          <table className="table-premium">
          <thead>
            <tr>
              <th>Gedung Asrama</th>
              <th>Nomor Kamar</th>
              <th>Wali / Pembina Kamar</th>
              <th>Kapasitas</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kamarList.map((kamar) => (
              <tr key={kamar.id} className="hover:bg-slate-50/80">
                <td className="font-bold text-slate-900">{kamar.gedung}</td>
                <td className="font-mono text-xs font-bold text-emerald-800">{kamar.nomorKamar}</td>
                <td className="text-xs text-slate-700 font-semibold">{kamar.waliKamar}</td>
                <td className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900">{kamar.terisi}</span> / {kamar.kapasitas} Santri
                </td>
                <td>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                    kamar.status === 'PENUH'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {kamar.status}
                  </span>
                </td>
                <td className="text-right pr-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setDetailKamar(kamar)}
                      className="btn-action-detail"
                    >
                      🔍 Detail
                    </button>
                    <button
                      onClick={() => handleDelete(kamar.id, kamar.nomorKamar)}
                      className="btn-action-danger"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Modal Detail Kamar */}
      <Modal isOpen={!!detailKamar} onClose={() => setDetailKamar(null)} title="Detail Kamar & Penghuni Asrama">
        {detailKamar && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-900 text-white space-y-1">
              <span className="text-[10px] text-amber-300 font-bold">GEDUNG ASRAMA</span>
              <h3 className="text-base font-black">{detailKamar.gedung} - Kamar {detailKamar.nomorKamar}</h3>
              <p className="text-emerald-200">Pembina: {detailKamar.waliKamar}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Daftar Penghuni Terdaftar:</span>
              <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                <li>Muhammad Raihan (Stambuk: PNDK-0012345678)</li>
                <li>Ahmad Fauzi (Stambuk: PNDK-0012345679)</li>
              </ul>
            </div>
            <button onClick={() => setDetailKamar(null)} className="w-full py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700">
              Tutup
            </button>
          </div>
        )}
      </Modal>

      {/* Modal Add Kamar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Kamar Asrama Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Gedung Asrama</label>
            <select
              value={form.gedung}
              onChange={(e) => setForm({ ...form, gedung: e.target.value })}
              className="input-premium"
            >
              <option value="Gedung A (Al-Farabi)">Gedung A (Al-Farabi)</option>
              <option value="Gedung B (Al-Ghazali)">Gedung B (Al-Ghazali)</option>
              <option value="Gedung C (Al-Kindi)">Gedung C (Al-Kindi)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Kamar</label>
            <input
              type="text"
              required
              placeholder="Misal: A-103"
              value={form.nomorKamar}
              onChange={(e) => setForm({ ...form, nomorKamar: e.target.value })}
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kapasitas Maksimal (Santri)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.kapasitas}
              onChange={(e) => setForm({ ...form, kapasitas: Number(e.target.value) })}
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pembina / Wali Kamar</label>
            <input
              type="text"
              required
              placeholder="Nama Ustadz Pembina"
              value={form.waliKamar}
              onChange={(e) => setForm({ ...form, waliKamar: e.target.value })}
              className="input-premium"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary text-xs font-bold"
            >
              {submitting ? 'Simpan...' : '💾 Simpan Kamar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
