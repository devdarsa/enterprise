'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import Modal, { ConfirmDialog } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import SantriPicker from '@/components/SantriPicker';

interface Alumni {
  id: string;
  nisp: string;
  nama: string;
  tahunLulus: number;
  jenjangTerakhir: string;
  statusAlumni: 'KULIAH' | 'KHIDMAH' | 'BEKERJA' | 'WIRAUSAHA';
  lokasiKhidmah?: string;
  telepon: string;
}

interface FormState {
  nisp: string;
  nama: string;
  tahunLulus: number;
  jenjangTerakhir: string;
  statusAlumni: 'KULIAH' | 'KHIDMAH' | 'BEKERJA' | 'WIRAUSAHA';
  lokasiKhidmah: string;
  telepon: string;
}

export default function DataAlumniPage() {
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Alumni | null>(null);
  const [editItem, setEditItem] = useState<Alumni | null>(null);
  const [deleteItem, setDeleteItem] = useState<Alumni | null>(null);

  const [form, setForm] = useState<FormState>({
    nisp: '',
    nama: '',
    tahunLulus: new Date().getFullYear(),
    jenjangTerakhir: 'Aliyah Diniyah',
    statusAlumni: 'KHIDMAH',
    lokasiKhidmah: "Pondok Pesantren Ma'had Darussa'adah",
    telepon: '081234567890',
  });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    fetchAlumniLive();
  }, []);

  const fetchAlumniLive = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/santri?status=LULUS');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((a: any) => ({
            id: a.id,
            nisp: a.nisp || 'ALM-' + a.id.slice(0, 6),
            nama: a.nama_lengkap,
            tahunLulus: a.updated_at ? new Date(a.updated_at).getFullYear() : 2025,
            jenjangTerakhir: a.kelas?.nama_kelas || 'Aliyah Diniyah',
            statusAlumni: 'KHIDMAH' as const,
            lokasiKhidmah: a.alamat || "Pondok Pesantren Ma'had Darussa'adah",
            telepon: a.telepon || '081234567890',
          }));
          setAlumniList(mapped);
        }
      }
    } catch (e) {
      console.error('Gagal memuat alumni live:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama) {
      showToast('error', 'Validasi Error', 'Nama alumni wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/santri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_lengkap: form.nama,
          nisp: form.nisp || 'ALM-' + Date.now().toString().slice(-6),
          status: 'LULUS',
          alamat: form.lokasiKhidmah,
          telepon: form.telepon,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        showToast('success', 'Alumni Ditambahkan', `Data alumni ${form.nama} berhasil dicatat di database.`);
        fetchAlumniLive();
      } else {
        showToast('error', 'Gagal Menambah Alumni', json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menambah Alumni', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/santri/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_lengkap: form.nama,
          nisp: form.nisp,
          alamat: form.lokasiKhidmah,
          telepon: form.telepon,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditItem(null);
        showToast('success', 'Berhasil Disimpan', `Data alumni ${form.nama} diperbarui.`);
        fetchAlumniLive();
      } else {
        showToast('error', 'Gagal Memperbarui', json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Memperbarui', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await fetch(`/api/v1/santri/${deleteItem.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setAlumniList((prev) => prev.filter((a) => a.id !== deleteItem.id));
        setDeleteItem(null);
        showToast('success', 'Dihapus', `Data alumni ${deleteItem.nama} berhasil dihapus.`);
      } else {
        showToast('error', 'Gagal Menghapus', json.error);
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus', err.message);
    }
  };

  const handleExport = async () => {
    const { exportToExcel } = await import('@/lib/excel-helper');
    const dataToExport = filtered.map((a) => ({
      'No. Stambuk': a.nisp,
      'Nama Alumni': a.nama,
      'Tahun Lulus': a.tahunLulus,
      'Jenjang Terakhir': a.jenjangTerakhir,
      'Status Alumni': a.statusAlumni,
      'Lokasi Khidmah / Aktivitas': a.lokasiKhidmah || '-',
      'Nomor Telepon / WhatsApp': a.telepon,
    }));

    exportToExcel(dataToExport, `alumni-${new Date().toISOString().slice(0, 10)}`, 'Data Alumni');
    showToast('success', 'Export Excel Berhasil', `${filtered.length} data alumni diexport ke file .xlsx.`);
  };

  const handleDownloadTemplate = async () => {
    const { downloadExcelTemplate } = await import('@/lib/excel-helper');
    const templateData = [
      {
        'NISP Stambuk': 'PNDK-0012345678',
        'Nama Alumni': 'Muhammad Raihan',
        'Tahun Lulus': 2025,
        'Jenjang Terakhir': 'Aliyah Diniyah',
        'Status Alumni (KULIAH/KHIDMAH/BEKERJA/WIRAUSAHA)': 'KHIDMAH',
        'Lokasi Khidmah / Aktivitas': "Pondok Pesantren Ma'had Darussa'adah",
        'Nomor Telepon / WhatsApp': '081234567890',
      },
    ];

    downloadExcelTemplate(templateData, 'template-import-alumni', 'Template Alumni');
    showToast('info', 'Template Excel Diunduh', 'Isi template .xlsx lalu gunakan tombol Import Excel.');
  };

  const handleImport = async (file: File) => {
    showToast('info', 'Membaca File Excel', `Membaca data dari ${file.name}...`);
    try {
      const { parseExcelFile } = await import('@/lib/excel-helper');
      const rows = await parseExcelFile(file);
      showToast('success', 'Import Berhasil', `${rows.length} data alumni dibaca dari file Excel.`);
    } catch {
      showToast('error', 'Import Gagal', 'Format file Excel tidak dapat dibaca.');
    }
  };

  const openEdit = (a: Alumni) => {
    setEditItem(a);
    setForm({
      nisp: a.nisp,
      nama: a.nama,
      tahunLulus: a.tahunLulus,
      jenjangTerakhir: a.jenjangTerakhir,
      statusAlumni: a.statusAlumni,
      lokasiKhidmah: a.lokasiKhidmah || '',
      telepon: a.telepon,
    });
  };

  const filtered = alumniList.filter(
    (a) => a.nama.toLowerCase().includes(search.toLowerCase()) || a.nisp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="🎓"
        title="Pendataan Alumni & Kelulusan"
        subtitle="Direktori Alumni Lulusan Pondok Pesantren & Khidmah"
        badge="DATABASE PONDOK"
        primaryAction={{
          label: '+ Tambah Data Alumni',
          onClick: () => {
            setForm({
              nisp: '',
              nama: '',
              tahunLulus: new Date().getFullYear(),
              jenjangTerakhir: 'Aliyah Diniyah',
              statusAlumni: 'KHIDMAH',
              lokasiKhidmah: "Pondok Pesantren Ma'had Darussa'adah",
              telepon: '081234567890',
            });
            setIsAddOpen(true);
          },
        }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama alumni atau No. Stambuk..."
        count={loading ? undefined : filtered.length}
        countLabel="alumni"
        onExportExcel={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImport}
        onRefresh={fetchAlumniLive}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="Belum Ada Alumni Lulusan"
            description="Belum ada alumni lulusan yang tercatat di database."
            action={{
              label: '+ Tambah Alumni Baru',
              onClick: () => setIsAddOpen(true),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Nama Alumni</th>
                  <th>No. Stambuk</th>
                  <th>Tahun Lulus</th>
                  <th>Jenjang Terakhir</th>
                  <th>Status Alumni</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-slate-900">{item.nama}</td>
                    <td className="font-mono text-xs font-bold text-[#135e35]">{item.nisp}</td>
                    <td className="font-bold text-slate-700">{item.tahunLulus}</td>
                    <td className="text-slate-600">{item.jenjangTerakhir}</td>
                    <td>
                      <span className="badge-aktif">{item.statusAlumni}</span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailItem(item)}
                          className="btn-action-detail cursor-pointer"
                        >
                          🔍 Detail
                        </button>
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

      {/* Detail Modal */}
      <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title="🔍 Detail Profil Alumni">
        {detailItem && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-900 text-white space-y-1">
              <span className="text-[10px] text-amber-300 font-bold uppercase">ALUMNI TERDAFTAR</span>
              <h3 className="text-base font-black">{detailItem.nama}</h3>
              <p className="text-emerald-200">Stambuk NISP: {detailItem.nisp}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Tahun Lulus</span>
                <span className="font-bold text-slate-900">{detailItem.tahunLulus}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Jenjang Terakhir</span>
                <span className="font-bold text-slate-900">{detailItem.jenjangTerakhir}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Status Aktivitas</span>
                <span className="font-bold text-emerald-800">{detailItem.statusAlumni}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">No. Telepon / WA</span>
                <span className="font-bold text-slate-900">{detailItem.telepon}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Lokasi Khidmah / Instansi</span>
                <span className="font-bold text-slate-900">{detailItem.lokasiKhidmah || '-'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDetailItem(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
            >
              Tutup Detail
            </button>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      {(isAddOpen || editItem) && (
        <Modal
          isOpen={isAddOpen || !!editItem}
          onClose={() => {
            setIsAddOpen(false);
            setEditItem(null);
          }}
          title={isAddOpen ? '🎓 Tambah Data Alumni Baru' : `✏️ Edit Data Alumni — ${editItem?.nama}`}
        >
          <form onSubmit={isAddOpen ? handleCreate : handleUpdate} className="space-y-4 text-xs">
            {isAddOpen ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cari & Pilih Santri Lulusan *</label>
                <SantriPicker
                  required
                  placeholder="Cari nama santri atau stambuk..."
                  onSelect={(s) => setForm({ ...form, nama: s.nama_lengkap, nisp: s.nisp || '' })}
                />
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Alumni *</label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="input-premium font-bold"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">No. Stambuk Alumni</label>
              <input
                type="text"
                value={form.nisp}
                onChange={(e) => setForm({ ...form, nisp: e.target.value })}
                placeholder="PNDK-0012345678"
                className="input-premium font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Lulus *</label>
                <input
                  type="number"
                  required
                  value={form.tahunLulus}
                  onChange={(e) => setForm({ ...form, tahunLulus: Number(e.target.value) })}
                  className="input-premium font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenjang Terakhir *</label>
                <input
                  type="text"
                  required
                  value={form.jenjangTerakhir}
                  onChange={(e) => setForm({ ...form, jenjangTerakhir: e.target.value })}
                  placeholder="Aliyah Diniyah, MI, dll."
                  className="input-premium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Aktivitas Alumni *</label>
              <select
                value={form.statusAlumni}
                onChange={(e) => setForm({ ...form, statusAlumni: e.target.value as any })}
                className="input-premium font-bold"
              >
                <option value="KHIDMAH">KHIDMAH — Mengabdi di Pesantren / Unit</option>
                <option value="KULIAH">KULIAH — Studi Lanjut Perguruan Tinggi</option>
                <option value="BEKERJA">BEKERJA — Bekerja di Instansi / Perusahaan</option>
                <option value="WIRAUSAHA">WIRAUSAHA — Usaha Mandiri</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lokasi Khidmah / Instansi</label>
              <input
                type="text"
                value={form.lokasiKhidmah}
                onChange={(e) => setForm({ ...form, lokasiKhidmah: e.target.value })}
                placeholder="Pondok Pesantren Ma'had Darussa'adah"
                className="input-premium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">No. Telepon / WhatsApp Aktif</label>
              <input
                type="text"
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                placeholder="081234567890"
                className="input-premium font-mono"
              />
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
                {submitting ? 'Menyimpan...' : '💾 Simpan Data Alumni'}
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
        title={`Hapus Data Alumni — ${deleteItem?.nama ?? ''}`}
        message={`Apakah Anda yakin ingin menghapus alumni ${deleteItem?.nama}? Data akan dipindahkan ke Recycle Bin.`}
        confirmLabel="Ya, Hapus Data"
        loading={submitting}
      />
    </div>
  );
}
