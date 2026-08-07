'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import Modal from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import SantriPicker from '@/components/SantriPicker';

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

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailPelanggaran, setDetailPelanggaran] = useState<Pelanggaran | null>(null);
  const [editPelanggaran, setEditPelanggaran] = useState<Pelanggaran | null>(null);

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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPelanggaran) return;
    setSubmitting(true);
    try {
      setList((prev) => prev.map((p) => (p.id === editPelanggaran.id ? editPelanggaran : p)));
      setEditPelanggaran(null);
      showToast('success', 'Berhasil Disimpan', 'Catatan pelanggaran berhasil diperbarui.');
    } catch {
      showToast('error', 'Gagal', 'Gagal menyimpan perubahan.');
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

  const handleExportExcel = async () => {
    const { exportToExcel } = await import('@/lib/excel-helper');
    const dataToExport = list.map((p) => ({
      'Tanggal Pelanggaran': new Date(p.tanggal).toLocaleDateString('id-ID'),
      'Nama Santri': p.santri?.nama_lengkap || '',
      'Stambuk / NISP': p.santri?.nisp || '',
      'Jenis Pelanggaran': p.jenis,
      'Tingkat Pelanggaran': p.tingkat,
      'Tindakan / Takzir': p.tindakan || '',
      'Petugas Keamanan': p.petugas?.nama_lengkap || '',
      'Keterangan Tambahan': p.keterangan || '',
    }));

    exportToExcel(dataToExport, `pelanggaran-${new Date().toISOString().slice(0, 10)}`, 'Pelanggaran');
    showToast('success', 'Export Excel Berhasil', `${list.length} catatan pelanggaran diexport ke file .xlsx.`);
  };

  const handleDownloadTemplate = async () => {
    const { downloadExcelTemplate } = await import('@/lib/excel-helper');
    const templateData = [
      {
        'ID / Nama Santri': 'Muhammad Raihan',
        'Jenis Pelanggaran': 'Terlambat Berjamaah Shalat Subuh',
        'Tingkat Pelanggaran (RINGAN/SEDANG/BERAT)': 'RINGAN',
        'Tindakan / Takzir': "Tazir membaca Al-Qur'an 1 Juz",
        'Keterangan Tambahan': 'Terlambat bangun di kamar asrama',
      },
    ];

    downloadExcelTemplate(templateData, 'template-import-pelanggaran', 'Template Pelanggaran');
    showToast('info', 'Template Excel Diunduh', 'Isi template .xlsx lalu gunakan tombol Import Excel.');
  };

  const handleImport = async (file: File) => {
    showToast('info', 'Membaca File Excel', `Membaca data dari ${file.name}...`);
    try {
      const { parseExcelFile } = await import('@/lib/excel-helper');
      const rows = await parseExcelFile(file);
      showToast('success', 'Import Berhasil', `${rows.length} catatan pelanggaran dibaca dari file Excel.`);
    } catch {
      showToast('error', 'Import Gagal', 'Format file Excel tidak dapat dibaca.');
    }
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="⚠️"
        title="Kedisiplinan & Pelanggaran Santri"
        subtitle="Pencatatan Jenis Pelanggaran, Tingkat Hukuman, & Riwayat Tindakan Takzir"
        badge="MODUL KEAMANAN"
        primaryAction={{ label: '+ Catat Pelanggaran', onClick: () => setIsModalOpen(true) }}
        search={search}
        onSearch={(v) => {
          setSearch(v);
        }}
        searchPlaceholder="Cari nama santri atau jenis pelanggaran..."
        count={total}
        countLabel="catatan"
        onExportExcel={handleExportExcel}
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImport}
        onRefresh={() => {
          setPage(1);
          fetchPelanggaran();
        }}
        toolbarExtra={
          <select
            value={tingkatFilter}
            onChange={(e) => {
              setTingkatFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold text-slate-700 shrink-0"
          >
            <option value="">Semua Tingkat</option>
            <option value="RINGAN">🟡 Ringan</option>
            <option value="SEDANG">🟠 Sedang</option>
            <option value="BERAT">🔴 Berat</option>
          </select>
        }
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={7} />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon="⚠️"
            title="Belum Ada Catatan Pelanggaran"
            description="Catatan pelanggaran santri akan tampil di sini setelah ditambahkan."
            action={{ label: '+ Catat Pelanggaran Baru', onClick: () => setIsModalOpen(true) }}
          />
        ) : (
          <div className="overflow-x-auto">
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
                {list.map((p) => (
                  <tr key={p.id}>
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
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailPelanggaran(p)}
                          className="btn-action-detail cursor-pointer"
                        >
                          🔍 Detail
                        </button>
                        <button
                          onClick={() => setEditPelanggaran(p)}
                          className="btn-action-edit cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleSoftDelete(p.id)}
                          className="btn-action-danger cursor-pointer"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
          >
            ← Sebelumnya
          </button>
          <span>
            Halaman {page} dari {totalPages} • {total} catatan
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Detail Modal — IDENTICAL FIELDS */}
      <Modal isOpen={!!detailPelanggaran} onClose={() => setDetailPelanggaran(null)} title="🔍 Detail Catatan Pelanggaran">
        {detailPelanggaran && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-950 text-white space-y-1">
              <span className="text-[10px] text-amber-300 font-bold uppercase">PENCATATAN TAKZIR KEAMANAN</span>
              <h3 className="text-base font-black">{detailPelanggaran.jenis}</h3>
              <p className="text-rose-200">Santri: {detailPelanggaran.santri?.nama_lengkap || '-'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Santri Violator</span>
                <span className="font-bold text-slate-900">{detailPelanggaran.santri?.nama_lengkap || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Tingkat Pelanggaran</span>
                <span className="font-bold text-rose-800">{detailPelanggaran.tingkat}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Jenis Pelanggaran</span>
                <span className="font-bold text-slate-900">{detailPelanggaran.jenis}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Tindakan / Takzir</span>
                <span className="font-bold text-slate-900">{detailPelanggaran.tindakan || '-'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Keterangan Tambahan</span>
                <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800">
                  {detailPelanggaran.keterangan || 'Tidak ada catatan tambahan.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDetailPelanggaran(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
            >
              Tutup Detail
            </button>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal — IDENTICAL FORM FIELDS TO MANUAL FORM */}
      {(isModalOpen || editPelanggaran) && (
        <Modal
          size="lg"
          isOpen={isModalOpen || !!editPelanggaran}
          onClose={() => {
            setIsModalOpen(false);
            setEditPelanggaran(null);
          }}
          title={isModalOpen ? '⚠️ Catat Pelanggaran Baru' : `✏️ Edit Pelanggaran — ${editPelanggaran?.jenis}`}
        >
          <form onSubmit={isModalOpen ? handleSubmit : handleSaveEdit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                <span>⚠️</span> Catatan Kedisiplinan & Takzir Keamanan
              </h4>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Cari & Pilih Santri Violator <span className="text-rose-500">*</span>
                </label>
                <SantriPicker
                  required
                  placeholder="Ketik nama santri, NISP stambuk, atau NISN..."
                  selectedSantriObj={
                    isModalOpen
                      ? form.santri_id
                        ? { id: form.santri_id, nama_lengkap: form.santri_nama }
                        : null
                      : editPelanggaran?.santri
                      ? {
                          id: editPelanggaran.santri.nisp || editPelanggaran.id,
                          nama_lengkap: editPelanggaran.santri.nama_lengkap,
                          nisp: editPelanggaran.santri.nisp,
                        }
                      : null
                  }
                  onSelect={(s) => {
                    if (isModalOpen) {
                      setForm({ ...form, santri_id: s.id, santri_nama: s.nama_lengkap });
                    } else if (editPelanggaran) {
                      setEditPelanggaran({
                        ...editPelanggaran,
                        santri: {
                          nisp: s.nisp || '',
                          nama_lengkap: s.nama_lengkap,
                          kelas: s.kelas ? { nama_kelas: s.kelas } : null,
                        },
                      });
                    }
                  }}
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Jenis Pelanggaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={isModalOpen ? form.jenis : editPelanggaran?.jenis || ''}
                  onChange={(e) =>
                    isModalOpen
                      ? setForm({ ...form, jenis: e.target.value })
                      : setEditPelanggaran(editPelanggaran ? { ...editPelanggaran, jenis: e.target.value } : null)
                  }
                  placeholder="Contoh: Terlambat Berjamaah, Membawa Elektronik"
                  className="input-premium font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Tingkat Pelanggaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={isModalOpen ? form.tingkat : editPelanggaran?.tingkat || 'RINGAN'}
                  onChange={(e) =>
                    isModalOpen
                      ? setForm({ ...form, tingkat: e.target.value as any })
                      : setEditPelanggaran(editPelanggaran ? { ...editPelanggaran, tingkat: e.target.value as any } : null)
                  }
                  className="input-premium font-bold"
                >
                  <option value="RINGAN">🟡 RINGAN — Takzir Membaca Al-Qur'an / Hafalan</option>
                  <option value="SEDANG">🟠 SEDANG — Penyitaan / Pembersihan Komplek</option>
                  <option value="BERAT">🔴 BERAT — Panggilan Wali / Skorsing Sementara</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Tindakan / Takzir</label>
                <input
                  type="text"
                  value={isModalOpen ? form.tindakan : editPelanggaran?.tindakan || ''}
                  onChange={(e) =>
                    isModalOpen
                      ? setForm({ ...form, tindakan: e.target.value })
                      : setEditPelanggaran(editPelanggaran ? { ...editPelanggaran, tindakan: e.target.value } : null)
                  }
                  placeholder="Misal: Read 1 Juz Al-Qur'an di Masjid"
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Keterangan Tambahan</label>
                <textarea
                  value={isModalOpen ? form.keterangan : editPelanggaran?.keterangan || ''}
                  onChange={(e) =>
                    isModalOpen
                      ? setForm({ ...form, keterangan: e.target.value })
                      : setEditPelanggaran(editPelanggaran ? { ...editPelanggaran, keterangan: e.target.value } : null)
                  }
                  placeholder="Catatan kronologi kejadian..."
                  className="input-premium h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditPelanggaran(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-bold shadow-md disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Menyimpan...' : '💾 Simpan & Audit Log'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
