'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';

interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  target: 'SEMUA' | 'WALI_SANTRI' | 'GURU';
  instansi: 'PONDOK' | 'MADRASAH' | 'MI' | 'SEMUA';
  tanggal: string;
  penulis: string;
  penting: boolean;
}

export default function PusatPengumumanPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);

  const [form, setForm] = useState({
    judul: '',
    isi: '',
    target: 'SEMUA' as const,
    instansi: 'PONDOK' as const,
    penting: false,
  });

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/pengumuman?limit=50');
      const json = await res.json();
      if (json.success) {
        setPengumumanList(json.data);
      } else {
        showToast('error', 'Gagal Memuat Data', json.error || 'Tidak dapat mengambil pengumuman dari database.');
      }
    } catch {
      showToast('error', 'Gagal Memuat Data', 'Tidak dapat mengambil pengumuman dari database.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.isi.trim()) {
      showToast('warning', 'Form Belum Lengkap', 'Judul dan isi pengumuman wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/pengumuman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: form.judul.trim(),
          isi: form.isi.trim(),
          target: form.target,
          instansi: form.instansi,
          penting: form.penting,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setForm({ judul: '', isi: '', target: 'SEMUA', instansi: 'PONDOK', penting: false });
        fetchPengumuman();
        showToast('success', 'Pengumuman Diterbitkan!', 'Pengumuman tersimpan di Database dan di-broadcast ke portal Wali/Guru.');
      } else {
        showToast('error', 'Gagal Menyiarkan', json.error || 'Terjadi kesalahan sistem.');
      }
    } catch {
      showToast('error', 'Gagal Menyiarkan', 'Kesalahan koneksi ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pusat Pengumuman & Broadcast Sekretariat</h1>
          <p className="text-xs text-slate-500">
            Terbitkan informasi resmi real-time dari Database ke Wali Santri, Guru, maupun seluruh civitas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition-all flex items-center gap-2"
        >
          <span>📢</span> + Terbitkan Pengumuman Baru
        </button>
      </div>

      {/* List Pengumuman */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 font-bold">Memuat pengumuman dari database...</div>
      ) : pengumumanList.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
          <span className="text-3xl block">📢</span>
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Pengumuman</h3>
          <p className="text-xs text-slate-500">Klik tombol "+ Terbitkan Pengumuman Baru" di atas untuk mulai membuat broadcast.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pengumumanList.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl bg-white border ${
                item.penting ? 'border-amber-300 shadow-md bg-gradient-to-r from-amber-50/30 to-white' : 'border-slate-200 shadow-sm'
              } space-y-3 relative overflow-hidden`}
            >
              {item.penting && (
                <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                  ⭐ Pengumuman Penting
                </div>
              )}
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                  {item.instansi}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  Target: {item.target}
                </span>
                <span className="text-slate-400 font-medium ml-auto">{item.tanggal} • Oleh {item.penulis}</span>
              </div>
              <h2 className="text-base font-black text-slate-900">{item.judul}</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.isi}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah Pengumuman */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Terbitkan Pengumuman & Broadcast Live"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Pengumuman</label>
            <input
              type="text"
              required
              placeholder="Contoh: Jadwal Libur Semester Ganjil"
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className="input-premium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Sasaran</label>
              <select
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value as any })}
                className="input-premium"
              >
                <option value="SEMUA">Semua Civitas</option>
                <option value="WALI_SANTRI">Wali Santri</option>
                <option value="GURU">Guru & Ustadz</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Instansi</label>
              <select
                value={form.instansi}
                onChange={(e) => setForm({ ...form, instansi: e.target.value as any })}
                className="input-premium"
              >
                <option value="SEMUA">Semua Instansi</option>
                <option value="PONDOK">Pondok Pesantren</option>
                <option value="MADRASAH">Madrasah Diniyah</option>
                <option value="MI">MI Formal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pengumuman</label>
            <textarea
              required
              rows={4}
              placeholder="Tuliskan isi pengumuman resmi..."
              value={form.isi}
              onChange={(e) => setForm({ ...form, isi: e.target.value })}
              className="input-premium"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="penting"
              checked={form.penting}
              onChange={(e) => setForm({ ...form, penting: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="penting" className="text-xs font-bold text-slate-700">
              Tandai sebagai Pengumuman Penting (Prioritas Atas)
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
          >
            {submitting ? 'Menerbitkan Broadcast...' : 'Terbitkan & Broadcast Live Ke Database'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
