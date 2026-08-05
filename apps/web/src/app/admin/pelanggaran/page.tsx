'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';
import { TableActions, ImportExportToolbar } from '@/components/TableActions';

interface Pelanggaran {
  id: string;
  tanggal: string;
  santri: { nisp: string; nama_lengkap: string; kelas: { nama_kelas: string } | null } | null;
  jenis: string;
  tingkat: 'RINGAN' | 'SEDANG' | 'BERAT';
  tindakan: string | null;
  petugas: { nama_lengkap: string } | null;
  keterangan: string | null;
}

interface FormState {
  santri_id: string;
  santri_nama: string;
  jenis: string;
  tingkat: 'RINGAN' | 'SEDANG' | 'BERAT';
  tindakan: string;
  keterangan: string;
}

const TINGKAT_COLOR = {
  RINGAN: 'bg-amber-100 text-amber-800 border-amber-200',
  SEDANG: 'bg-orange-100 text-orange-800 border-orange-200',
  BERAT: 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function PelanggaranPage() {
  const [list, setList] = useState<Pelanggaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tingkatFilter, setTingkatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const [form, setForm] = useState<FormState>({
    santri_id: '',
    santri_nama: '',
    jenis: '',
    tingkat: 'RINGAN',
    tindakan: '',
    keterangan: '',
  });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    fetchPelanggaran();
  }, [page, tingkatFilter]);

  const fetchPelanggaran = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search && { search }),
        ...(tingkatFilter && { tingkat: tingkatFilter }),
      });
      const res = await fetch(`/api/v1/pelanggaran?${params}`);
      const json = await res.json();
      if (json.success) {
        setList(json.data);
        setTotal(json.meta?.total || 0);
        setTotalPages(json.meta?.totalPages || 1);
      } else {
        showToast('error', 'Gagal Memuat', json.error || 'Tidak dapat mengambil data pelanggaran.');
      }
    } catch {
      showToast('error', 'Koneksi Error', 'Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPelanggaran();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.santri_id || !form.jenis) {
      showToast('error', 'Validasi Error', 'Santri dan jenis pelanggaran wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/pelanggaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          santri_id: form.santri_id,
          jenis: form.jenis,
          tingkat: form.tingkat,
          tindakan: form.tindakan || null,
          keterangan: form.keterangan || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Pelanggaran Dicatat', json.message);
        setIsModalOpen(false);
        setForm({ santri_id: '', santri_nama: '', jenis: '', tingkat: 'RINGAN', tindakan: '', keterangan: '' });
        fetchPelanggaran();
      } else {
        showToast('error', 'Gagal Menyimpan', json.error);
      }
    } catch {
      showToast('error', 'Koneksi Error', 'Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!confirm('Hapus catatan pelanggaran ini?')) return;
    try {
      const res = await fetch(`/api/v1/pelanggaran/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Dihapus', 'Catatan pelanggaran dipindahkan ke Recycle Bin.');
        fetchPelanggaran();
      } else {
        showToast('error', 'Gagal', json.error);
      }
    } catch {
      showToast('error', 'Error', 'Gagal terhubung ke server.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-widest block mb-1">
            MODUL KEAMANAN & KETERTIBAN
          </span>
          <h1 className="text-xl font-black text-slate-900">Kedisiplinan & Pelanggaran Santri</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pencatatan Jenis Pelanggaran, Tingkat Hukuman, & Riwayat Tindakan Takzir
            <span className="ml-2 text-emerald-700 font-bold">({total} catatan)</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={tingkatFilter}
            onChange={(e) => { setTingkatFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold text-slate-700"
          >
            <option value="">Semua Tingkat</option>
            <option value="RINGAN">🟡 Ringan</option>
            <option value="SEDANG">🟠 Sedang</option>
            <option value="BERAT">🔴 Berat</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>⚠️</span> + Catat Pelanggaran
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama santri atau jenis pelanggaran..." />
          <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs">Cari</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Santri</th>
              <th>Jenis Pelanggaran</th>
              <th>Tingkat</th>
              <th>Tindakan / Takzir</th>
              <th>Petugas</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <p className="text-sm font-medium">Tidak ada catatan pelanggaran.</p>
                </td>
              </tr>
            ) : (
              list.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="font-mono text-xs text-slate-600">
                    {new Date(p.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="font-bold text-slate-900 text-xs">{p.santri?.nama_lengkap || '-'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.santri?.nisp || ''}</div>
                  </td>
                  <td className="text-xs font-semibold text-slate-700">{p.jenis}</td>
                  <td>
                    <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold ${TINGKAT_COLOR[p.tingkat]}`}>
                      {p.tingkat}
                    </span>
                  </td>
                  <td className="text-xs text-slate-600">{p.tindakan || '-'}</td>
                  <td className="text-xs text-slate-600">{p.petugas?.nama_lengkap || '-'}</td>
                  <td className="text-right">
                    <button
                      onClick={() => handleSoftDelete(p.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
          >
            ← Sebelumnya
          </button>
          <span>Halaman {page} dari {totalPages} • {total} catatan</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Modal Catat Pelanggaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900">⚠️ Catat Pelanggaran Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Santri ID — idealnya dengan autocomplete dari /api/v1/santri */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ID Santri *</label>
                <input
                  type="text"
                  required
                  value={form.santri_id}
                  onChange={(e) => setForm({ ...form, santri_id: e.target.value })}
                  placeholder="UUID santri dari database"
                  className="input-premium font-mono"
                />
                <p className="text-slate-400 mt-0.5">Masukkan ID santri yang pelanggaran.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Pelanggaran *</label>
                <input
                  type="text"
                  required
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                  placeholder="Terlambat Berjamaah, Membawa HP, dll."
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tingkat Pelanggaran *</label>
                <select
                  value={form.tingkat}
                  onChange={(e) => setForm({ ...form, tingkat: e.target.value as any })}
                  className="input-premium"
                >
                  <option value="RINGAN">🟡 RINGAN — Tazir Membaca / Hafalan</option>
                  <option value="SEDANG">🟠 SEDANG — Penyitaan / Pengawasan</option>
                  <option value="BERAT">🔴 BERAT — Panggilan Wali / Skorsing</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tindakan / Takzir</label>
                <input
                  type="text"
                  value={form.tindakan}
                  onChange={(e) => setForm({ ...form, tindakan: e.target.value })}
                  placeholder="Tazir membaca Al-Qur'an 1 Juz..."
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  placeholder="Catatan tambahan..."
                  className="input-premium h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-bold shadow-md disabled:opacity-60"
                >
                  {submitting ? 'Menyimpan...' : '💾 Simpan & Audit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
