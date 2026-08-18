'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import Modal from '@/components/Modal';

interface ArsipItem {
  id: string;
  kodeArsip: string;
  kategori: string;
  judul: string;
  tahunAjaran: string;
  tanggalArsip: string;
  fileSize: string;
  fileUrl?: string | null;
  sumber?: string;
}

export default function ArsipHistorisPage() {
  const [list, setList] = useState<ArsipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nomor_surat: '',
    perihal: '',
    jenis: 'SURAT_MASUK',
    pengirim: '',
    penerima: '',
    keterangan: '',
    file_url: '',
  });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const fetchArsipLive = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/arsip');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setList(json.data);
        }
      }
    } catch (e) {
      console.error('Gagal memuat arsip:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArsipLive();
  }, []);

  const handleCreateArsip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomor_surat.trim() || !form.perihal.trim()) {
      showToast('warning', 'Form Belum Lengkap', 'Nomor surat dan perihal wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/arsip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          nomor_surat: '',
          perihal: '',
          jenis: 'SURAT_MASUK',
          pengirim: '',
          penerima: '',
          keterangan: '',
          file_url: '',
        });
        showToast('success', 'Arsip Berhasil Disimpan', json.message || 'Dokumen berhasil diarsipkan.');
        fetchArsipLive();
      } else {
        showToast('error', 'Gagal Mengarsipkan', json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Mengarsipkan', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArsip = async (id: string, judul: string) => {
    try {
      const res = await fetch(`/api/v1/arsip?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setList((prev) => prev.filter((a) => a.id !== id));
        showToast('success', 'Arsip Dihapus', `Dokumen '${judul}' berhasil dihapus.`);
      } else {
        showToast('error', 'Gagal Menghapus', json.error);
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus', err.message);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Kode Arsip', 'Judul Dokumen', 'Kategori', 'Tahun Ajaran', 'Tanggal'],
      ...filtered.map((a) => [a.kodeArsip, a.judul, a.kategori, a.tahunAjaran, a.tanggalArsip]),
    ]
      .map((r) => r.map((c) => `"${c}"`).join(','))
      .join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `arsip-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    showToast('success', 'Export Berhasil', `${filtered.length} data arsip diexport.`);
  };

  const filtered = list.filter(
    (a) =>
      a.judul.toLowerCase().includes(search.toLowerCase()) ||
      a.kodeArsip.toLowerCase().includes(search.toLowerCase()) ||
      a.kategori.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <PageHeader
        icon="📦"
        title="Arsip Dokumen Historis & Persuratan"
        subtitle="Repositori Dokumen Resmi, SK Pengurus, MoU Lembaga, & Berkas Persuratan Pesantren"
        badge="SISTEM & UTILITAS"
        primaryAction={{
          label: '+ Unggah Arsip Dokumen',
          onClick: () => setIsAddOpen(true),
        }}
      />

      {/* Filter & Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="🔍 Cari nomor arsip, perihal dokumen, atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#157340]/20 focus:border-[#157340]"
        />
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            📥 Ekspor CSV
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📂"
            title="Tidak Ada Dokumen Arsip"
            description="Belum ada dokumen yang diarsipkan di database."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nomor / Kode Arsip</th>
                  <th className="px-4 py-3">Perihal / Judul Dokumen</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Tanggal Dokumen</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.kodeArsip}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.judul}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.tanggalArsip}</td>
                    <td className="px-4 py-3 text-right">
                      {item.sumber === 'ARSIP_DIGITAL' && (
                        <button
                          onClick={() => handleDeleteArsip(item.id, item.judul)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Arsip */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Unggah & Catat Arsip Dokumen Baru"
      >
        <form onSubmit={handleCreateArsip} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Surat / Kode Berkas *</label>
            <input
              type="text"
              required
              placeholder="Contoh: SK/001/DARSA/2026"
              value={form.nomor_surat}
              onChange={(e) => setForm({ ...form, nomor_surat: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#157340]/20 focus:border-[#157340]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Perihal / Judul Dokumen *</label>
            <input
              type="text"
              required
              placeholder="Contoh: SK Pengangkatan Dewan Mustahiq"
              value={form.perihal}
              onChange={(e) => setForm({ ...form, perihal: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#157340]/20 focus:border-[#157340]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Arsip</label>
              <select
                value={form.jenis}
                onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="SURAT_MASUK">Surat Masuk</option>
                <option value="SURAT_KELUAR">Surat Keluar</option>
                <option value="SURAT_KEPUTUSAN">Surat Keputusan (SK)</option>
                <option value="SURAT_KETERANGAN">Surat Keterangan</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pihak Pengirim / Penerima</label>
              <input
                type="text"
                placeholder="Nama instansi / pengirim"
                value={form.pengirim}
                onChange={(e) => setForm({ ...form, pengirim: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
            <textarea
              rows={2}
              placeholder="Catatan ringkas isi dokumen..."
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-white bg-[#0f4928] hover:bg-[#157340] rounded-xl font-bold transition disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : '💾 Simpan Arsip'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
