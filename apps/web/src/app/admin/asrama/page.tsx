'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import Modal from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';

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
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editKamar, setEditKamar] = useState<KamarAsrama | null>(null);
  const [detailKamar, setDetailKamar] = useState<KamarAsrama | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [kamarList, setKamarList] = useState<KamarAsrama[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

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
              gedung: k.nama_gedung || k.gedung?.nama_gedung || '-',
              nomorKamar: k.nama_kamar,
              kapasitas: Number(k.kapasitas) || 0,
              terisi: Number(k.terisi) || 0,
              waliKamar: k.wali_kamar || '-',
              status: k.status || 'TERSEDIA',
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomorKamar.trim() || !form.waliKamar.trim()) {
      showToast('warning', 'Form Belum Lengkap', 'Nomor kamar dan wali kamar wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/asrama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_kamar: form.nomorKamar.trim(),
          nama_gedung: form.gedung,
          kapasitas: Number(form.kapasitas),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setForm({ gedung: 'Gedung A (Al-Farabi)', nomorKamar: '', kapasitas: 8, waliKamar: '' });
        showToast('success', 'Kamar Berhasil Ditambahkan', json.message || `Kamar berhasil disimpan.`);
        // Reload list
        const reloadRes = await fetch('/api/v1/asrama');
        const reloadJson = await reloadRes.json();
        if (reloadJson.success) setKamarList(reloadJson.data);
      } else {
        showToast('error', 'Gagal Menambah Kamar', json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menambah Kamar', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editKamar) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/asrama', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editKamar.id,
          nama_kamar: editKamar.nomorKamar,
          kapasitas: Number(editKamar.kapasitas),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setKamarList((prev) => prev.map((k) => (k.id === editKamar.id ? editKamar : k)));
        setEditKamar(null);
        showToast('success', 'Kamar Diperbarui', `Data kamar ${editKamar.nomorKamar} berhasil disimpan.`);
      } else {
        showToast('error', 'Gagal Memperbarui Kamar', json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Memperbarui Kamar', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    try {
      const res = await fetch(`/api/v1/asrama?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setKamarList((prev) => prev.filter((k) => k.id !== id));
        showToast('success', 'Kamar Dihapus', `Kamar ${nama} berhasil dihapus.`);
      } else {
        showToast('error', 'Gagal Menghapus Kamar', json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus Kamar', err.message);
    }
  };

  const handleExportExcel = async () => {
    const { exportToExcel } = await import('@/lib/excel-helper');
    const dataToExport = kamarList.map((k) => ({
      'Pilih Gedung Asrama': k.gedung,
      'Nomor Kamar': k.nomorKamar,
      'Kapasitas Maksimal (Santri)': k.kapasitas,
      'Jumlah Santri Terisi': k.terisi,
      'Pembina / Wali Kamar': k.waliKamar,
      'Status Kamar': k.status,
    }));

    exportToExcel(dataToExport, `data-asrama-${new Date().toISOString().slice(0, 10)}`, 'Data Asrama');
    showToast('success', 'Export Excel Berhasil', `${kamarList.length} data kamar diexport ke file .xlsx.`);
  };

  const handleDownloadTemplate = async () => {
    const { downloadExcelTemplate } = await import('@/lib/excel-helper');
    const templateData = [
      {
        'Pilih Gedung Asrama': 'Gedung A (Al-Farabi)',
        'Nomor Kamar': 'A-103',
        'Kapasitas Maksimal (Santri)': 8,
        'Pembina / Wali Kamar': 'Ustadz Pembina',
      },
    ];

    downloadExcelTemplate(templateData, 'template-import-asrama', 'Template Asrama');
    showToast('info', 'Template Excel Diunduh', 'Isi template .xlsx lalu gunakan tombol Import Excel.');
  };

  const handleImport = async (file: File) => {
    showToast('info', 'Membaca File Excel', `Membaca data dari ${file.name}...`);
    try {
      const { parseExcelFile } = await import('@/lib/excel-helper');
      const rows = await parseExcelFile(file);
      showToast('success', 'Import Berhasil', `${rows.length} data kamar dibaca dari file Excel.`);
    } catch {
      showToast('error', 'Import Gagal', 'Format file Excel tidak dapat dibaca.');
    }
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="🏢"
        title="Data Asrama, Kamar & Pembina"
        subtitle="Pengelolaan Gedung Asrama, Kamar Santri, Penempatan Kamar, & Pembina Asrama"
        badge="DATABASE PONDOK"
        primaryAction={{ label: '+ Tambah Kamar / Asrama Baru', onClick: () => setIsModalOpen(true) }}
        onExportExcel={handleExportExcel}
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImport}
        onRefresh={() => showToast('info', 'Refresh', 'Data refreshed.')}
      />

      {/* Grid Status Quick Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block">Total Gedung Asrama</span>
          <span className="text-xl font-black text-slate-900">
            {new Set(kamarList.map((k) => k.gedung)).size} Gedung
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block">Kapasitas Terisi</span>
          <span className="text-xl font-black text-emerald-700">
            {kamarList.reduce((acc, k) => acc + (k.terisi || 0), 0)} /{' '}
            {kamarList.reduce((acc, k) => acc + (k.kapasitas || 0), 0)} Santri
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block">Pembina Asrama</span>
          <span className="text-xl font-black text-amber-700">
            {new Set(kamarList.map((k) => k.waliKamar).filter((w) => w && w !== '-')).size} Pembina
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={4} cols={6} />
          </div>
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
                {(itemsPerPage >= kamarList.length
                  ? kamarList
                  : kamarList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                ).map((kamar) => (
                  <tr key={kamar.id} className="hover:bg-slate-50/80">
                    <td className="font-bold text-slate-900">{kamar.gedung}</td>
                    <td className="font-mono text-xs font-bold text-emerald-800">{kamar.nomorKamar}</td>
                    <td className="text-xs text-slate-700 font-semibold">{kamar.waliKamar}</td>
                    <td className="text-xs text-slate-600">
                      <span className="font-bold text-slate-900">{kamar.terisi}</span> / {kamar.kapasitas} Santri
                    </td>
                    <td>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          kamar.status === 'PENUH'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {kamar.status}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailKamar(kamar)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => setEditKamar(kamar)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(kamar.id, kamar.nomorKamar)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                        >
                          Hapus
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

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalItems={kamarList.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Modal Detail Kamar — IDENTICAL FIELDS */}
      <Modal isOpen={!!detailKamar} onClose={() => setDetailKamar(null)} title="🔍 Detail Kamar & Penghuni Asrama">
        {detailKamar && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-900 text-white space-y-1">
              <span className="text-[10px] text-amber-300 font-bold">GEDUNG ASRAMA</span>
              <h3 className="text-base font-black">
                {detailKamar.gedung} - Kamar {detailKamar.nomorKamar}
              </h3>
              <p className="text-emerald-200">Pembina: {detailKamar.waliKamar}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Gedung Asrama</span>
                <span className="font-bold text-slate-900">{detailKamar.gedung}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Nomor Kamar</span>
                <span className="font-mono font-bold text-emerald-800">{detailKamar.nomorKamar}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Pembina / Wali Kamar</span>
                <span className="font-bold text-slate-900">{detailKamar.waliKamar}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Kapasitas Maksimal</span>
                <span className="font-bold text-slate-900">{detailKamar.terisi} / {detailKamar.kapasitas} Santri</span>
              </div>
            </div>

            <button
              onClick={() => setDetailKamar(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
            >
              Tutup Detail
            </button>
          </div>
        )}
      </Modal>

      {/* Modal Add / Edit Kamar — IDENTICAL FORM FIELDS TO MANUAL INPUT FORM */}
      {(isModalOpen || editKamar) && (
        <Modal
          size="lg"
          isOpen={isModalOpen || !!editKamar}
          onClose={() => {
            setIsModalOpen(false);
            setEditKamar(null);
          }}
          title={isModalOpen ? '➕ Tambah Kamar Asrama Baru' : `✏️ Edit Kamar Asrama — ${editKamar?.nomorKamar}`}
        >
          <form onSubmit={isModalOpen ? handleCreate : handleSaveEdit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                <span>🏢</span> Informasi Gedung & Kamar Asrama
              </h4>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Pilih Gedung Asrama <span className="text-rose-500">*</span>
                </label>
                <select
                  value={isModalOpen ? form.gedung : editKamar?.gedung || ''}
                  onChange={(e) =>
                    isModalOpen
                      ? setForm({ ...form, gedung: e.target.value })
                      : setEditKamar(editKamar ? { ...editKamar, gedung: e.target.value } : null)
                  }
                  className="input-premium font-bold"
                >
                  <option value="Gedung A (Al-Farabi)">Gedung A (Al-Farabi)</option>
                  <option value="Gedung B (Al-Ghazali)">Gedung B (Al-Ghazali)</option>
                  <option value="Gedung C (Al-Kindi)">Gedung C (Al-Kindi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Nomor Kamar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: A-103"
                  value={isModalOpen ? form.nomorKamar : editKamar?.nomorKamar || ''}
                  onChange={(e) =>
                    isModalOpen
                      ? setForm({ ...form, nomorKamar: e.target.value })
                      : setEditKamar(editKamar ? { ...editKamar, nomorKamar: e.target.value } : null)
                  }
                  className="input-premium font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Kapasitas Maksimal (Santri) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={isModalOpen ? form.kapasitas : editKamar?.kapasitas || 8}
                  onChange={(e) =>
                    isModalOpen
                      ? setForm({ ...form, kapasitas: Number(e.target.value) })
                      : setEditKamar(editKamar ? { ...editKamar, kapasitas: Number(e.target.value) } : null)
                  }
                  className="input-premium font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Pembina / Wali Kamar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Ustadz Pembina"
                  value={isModalOpen ? form.waliKamar : editKamar?.waliKamar || ''}
                  onChange={(e) =>
                    isModalOpen
                      ? setForm({ ...form, waliKamar: e.target.value })
                      : setEditKamar(editKamar ? { ...editKamar, waliKamar: e.target.value } : null)
                  }
                  className="input-premium font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditKamar(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary text-xs font-bold cursor-pointer"
              >
                {submitting ? 'Simpan...' : '💾 Simpan Data Kamar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
