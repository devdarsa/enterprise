'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import Modal, { ConfirmDialog } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

interface TahunAjaran {
  id: string;
  nama: string;
  semester: 'Ganjil' | 'Genap';
  status: 'AKTIF' | 'NON_AKTIF';
  tglMulai: string;
  tglSelesai: string;
  rawMulai?: string;
  rawSelesai?: string;
}

interface FormState {
  nama: string;
  semester: 'Ganjil' | 'Genap';
  tanggal_mulai: string;
  tanggal_akhir: string;
  is_aktif: boolean;
}

export default function TahunAjaranPage() {
  const [list, setList] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<TahunAjaran | null>(null);
  const [deleteItem, setDeleteItem] = useState<TahunAjaran | null>(null);

  const [form, setForm] = useState<FormState>({
    nama: '2025/2026',
    semester: 'Ganjil',
    tanggal_mulai: new Date().toISOString().slice(0, 10),
    tanggal_akhir: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    is_aktif: false,
  });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const fetchTahunAjaran = async () => {
    const cached = await getIndexedDBCache<TahunAjaran[]>('general', 'tahun_ajaran_list');
    if (cached && cached.length > 0) {
      setList(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/v1/tahun-ajaran');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: TahunAjaran[] = json.data.map((t: any) => ({
            id: t.id,
            nama: t.nama,
            semester: t.semester as 'Ganjil' | 'Genap',
            status: t.is_aktif ? 'AKTIF' : 'NON_AKTIF',
            tglMulai: t.tanggal_mulai ? new Date(t.tanggal_mulai).toLocaleDateString('id-ID') : '-',
            tglSelesai: t.tanggal_akhir ? new Date(t.tanggal_akhir).toLocaleDateString('id-ID') : '-',
            rawMulai: t.tanggal_mulai ? new Date(t.tanggal_mulai).toISOString().slice(0, 10) : '',
            rawSelesai: t.tanggal_akhir ? new Date(t.tanggal_akhir).toISOString().slice(0, 10) : '',
          }));
          setList(mapped);
          setIndexedDBCache('general', 'tahun_ajaran_list', mapped);
        }
      }
    } catch {
      if (!cached) showToast('error', 'Gagal Memuat', 'Tidak dapat memuat data tahun ajaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.tanggal_mulai || !form.tanggal_akhir) {
      showToast('error', 'Validasi Error', 'Seluruh bidang formulir wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/tahun-ajaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Berhasil Dibuat', json.message || 'Tahun ajaran baru berhasil dibuat.');
        setIsAddOpen(false);
        fetchTahunAjaran();
      } else {
        showToast('error', 'Gagal', json.error || 'Terjadi kesalahan sistem.');
      }
    } catch {
      showToast('error', 'Koneksi Error', 'Tidak dapat terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/tahun-ajaran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editItem.id,
          nama: form.nama,
          semester: form.semester,
          tanggal_mulai: form.tanggal_mulai,
          tanggal_akhir: form.tanggal_akhir,
          is_aktif: form.is_aktif,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Berhasil Diperbarui', json.message || 'Tahun ajaran berhasil diperbarui.');
        setEditItem(null);
        fetchTahunAjaran();
      } else {
        showToast('error', 'Gagal', json.error || 'Terjadi kesalahan sistem.');
      }
    } catch {
      showToast('error', 'Koneksi Error', 'Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/tahun-ajaran?id=${deleteItem.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Dihapus', `Tahun ajaran ${deleteItem.nama} berhasil dihapus.`);
        setDeleteItem(null);
        fetchTahunAjaran();
      } else {
        showToast('error', 'Gagal Hapus', json.error || 'Gagal menghapus tahun ajaran.');
      }
    } catch {
      showToast('error', 'Koneksi Error', 'Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetAktif = async (id: string) => {
    try {
      const res = await fetch('/api/v1/tahun-ajaran', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        fetchTahunAjaran();
        showToast('success', 'Tahun Ajaran Aktif', 'Tahun ajaran aktif berhasil diperbarui & dicatat pada Audit Log.');
      }
    } catch {
      showToast('error', 'Gagal', 'Terjadi kesalahan sistem.');
    }
  };

  const handleExport = async () => {
    const { exportToExcel } = await import('@/lib/excel-helper');
    const dataToExport = list.map((t) => ({
      'Nama Tahun Ajaran': t.nama,
      Semester: t.semester,
      'Status Periode': t.status,
      'Tanggal Mulai': t.tglMulai,
      'Tanggal Selesai': t.tglSelesai,
    }));

    exportToExcel(dataToExport, `tahun-ajaran-${new Date().toISOString().slice(0, 10)}`, 'Tahun Ajaran');
    showToast('success', 'Export Excel Berhasil', `${list.length} data tahun ajaran diexport ke file .xlsx.`);
  };

  const openEdit = (t: TahunAjaran) => {
    setEditItem(t);
    setForm({
      nama: t.nama,
      semester: t.semester,
      tanggal_mulai: t.rawMulai || new Date().toISOString().slice(0, 10),
      tanggal_akhir: t.rawSelesai || new Date().toISOString().slice(0, 10),
      is_aktif: t.status === 'AKTIF',
    });
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="📅"
        title="Manajemen Tahun Ajaran & Kalender Akademik"
        subtitle="Pengaturan Periode Aktif Tahun Ajaran & Kalender Pendidikan Pesantren"
        badge="SISTEM & UTILITAS"
        primaryAction={{
          label: '+ Tambah Tahun Ajaran Baru',
          onClick: () => {
            setForm({
              nama: '2026/2027',
              semester: 'Ganjil',
              tanggal_mulai: new Date().toISOString().slice(0, 10),
              tanggal_akhir: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              is_aktif: false,
            });
            setIsAddOpen(true);
          },
        }}
        count={loading ? undefined : list.length}
        countLabel="periode"
        onExportExcel={handleExport}
        onRefresh={fetchTahunAjaran}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={4} cols={6} />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Belum Ada Tahun Ajaran"
            description="Periode akademik akan tampil di sini setelah ditambahkan."
            action={{
              label: '+ Tambah Tahun Ajaran Baru',
              onClick: () => setIsAddOpen(true),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Tahun Ajaran</th>
                  <th>Semester</th>
                  <th>Status Periode</th>
                  <th>Tanggal Mulai</th>
                  <th>Tanggal Selesai</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-slate-900">{item.nama}</td>
                    <td className="font-semibold text-slate-700">{item.semester}</td>
                    <td>
                      <span className={item.status === 'AKTIF' ? 'badge-aktif' : 'badge-danger'}>
                        {item.status === 'AKTIF' ? '● AKTIF SYSTEM' : 'NON AKTIF'}
                      </span>
                    </td>
                    <td className="text-slate-600 font-mono text-xs">{item.tglMulai}</td>
                    <td className="text-slate-600 font-mono text-xs">{item.tglSelesai}</td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== 'AKTIF' && (
                          <button
                            type="button"
                            onClick={() => handleSetAktif(item.id)}
                            className="btn-action-detail cursor-pointer"
                            title="Aktifkan sebagai tahun ajaran sistem"
                          >
                            ⚡ Set Aktif
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="btn-action-edit cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteItem(item)}
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

      {/* Add / Edit Modal */}
      {(isAddOpen || editItem) && (
        <Modal
          isOpen={isAddOpen || !!editItem}
          onClose={() => {
            setIsAddOpen(false);
            setEditItem(null);
          }}
          title={isAddOpen ? '📅 Tambah Tahun Ajaran Baru' : `✏️ Edit Tahun Ajaran — ${editItem?.nama}`}
        >
          <form onSubmit={isAddOpen ? handleCreate : handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Tahun Ajaran *</label>
              <input
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: 2025/2026 atau 2026/2027"
                className="input-premium font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester *</label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value as 'Ganjil' | 'Genap' })}
                className="input-premium font-bold"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai *</label>
                <input
                  type="date"
                  required
                  value={form.tanggal_mulai}
                  onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })}
                  className="input-premium font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Selesai *</label>
                <input
                  type="date"
                  required
                  value={form.tanggal_akhir}
                  onChange={(e) => setForm({ ...form, tanggal_akhir: e.target.value })}
                  className="input-premium font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_aktif_checkbox"
                checked={form.is_aktif}
                onChange={(e) => setForm({ ...form, is_aktif: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300"
              />
              <label htmlFor="is_aktif_checkbox" className="font-bold text-slate-800 cursor-pointer">
                Jadikan sebagai Tahun Ajaran Aktif System saat ini
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Menyimpan...' : '💾 Simpan Periode'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title={`Hapus Tahun Ajaran — ${deleteItem?.nama ?? ''}`}
        message={`Apakah Anda yakin ingin menghapus periode Tahun Ajaran "${deleteItem?.nama} (${deleteItem?.semester})"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Periode"
        loading={submitting}
      />
    </div>
  );
}
