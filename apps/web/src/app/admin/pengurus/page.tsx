'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import Modal from '@/components/Modal';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

interface Pengurus {
  id: string;
  nik: string;
  nama: string;
  jabatan: string;
  unit: 'PONDOK' | 'MADRASAH' | 'MI';
  telepon: string;
  status: 'AKTIF' | 'NON_AKTIF';
  avatar_url?: string;
}

export default function DataPengurusPage() {
  const [list, setList] = useState<Pengurus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailPengurus, setDetailPengurus] = useState<Pengurus | null>(null);
  const [editPengurus, setEditPengurus] = useState<Pengurus | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    jabatan: '',
    unit: 'PONDOK' as 'PONDOK' | 'MADRASAH' | 'MI',
    telepon: '',
    status: 'AKTIF' as 'AKTIF' | 'NON_AKTIF',
    avatar_url: '',
  });

  const [saving, setSaving] = useState(false);

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_instansi=([^;]+)/) || document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const val = decodeURIComponent(match[1]).toLowerCase();
        if (val.includes('madrasah')) setInstansiFilter('madrasah');
        else if (val.includes('mi')) setInstansiFilter('mi');
        else setInstansiFilter('pondok');
      }
    } catch {}
    fetchPengurus();
  }, []);

  const fetchPengurus = async () => {
    const cached = await getIndexedDBCache<Pengurus[]>('general', 'pengurus_list');
    if (cached && cached.length > 0) {
      setList(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/v1/pengurus');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((p: any) => ({
            id: p.id,
            nik: p.nik || '-',
            nama: p.nama_lengkap,
            jabatan: p.jabatan,
            unit: (p.unit as any) || 'PONDOK',
            telepon: p.telepon || '-',
            status: (p.status as any) || 'AKTIF',
            avatar_url: p.avatar_url,
          }));
          setList(mapped);
          setIndexedDBCache('general', 'pengurus_list', mapped);
        }
      }
    } catch {
      if (!cached) showToast('error', 'Gagal Memuat', 'Tidak dapat mengambil data pengurus.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = list.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.jabatan.toLowerCase().includes(search.toLowerCase()) ||
      p.nik.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (id: string, name: string) => {
    setList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === 'NON_AKTIF' ? 'AKTIF' : 'NON_AKTIF' } : p))
    );
    showToast('success', 'Status Diperbarui', `Status ${name} berhasil diperbarui.`);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      showToast('warning', 'Form Belum Lengkap', 'Nama Pengurus wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const newPengurus: Pengurus = {
        id: `PGR-${Date.now()}`,
        nik: formData.nik.trim() || '3571000000000000',
        nama: formData.nama.trim(),
        jabatan: formData.jabatan.trim() || 'Sekretariat Utama',
        unit: formData.unit,
        telepon: formData.telepon.trim() || '-',
        status: formData.status,
        avatar_url: formData.avatar_url,
      };

      setList((prev) => [newPengurus, ...prev]);
      setShowAddModal(false);
      showToast('success', 'Pengurus Didaftarkan', `Data ${formData.nama} berhasil disimpan.`);
    } catch {
      showToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan pengurus.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPengurus) return;
    setSaving(true);
    try {
      setList((prev) => prev.map((p) => (p.id === editPengurus.id ? editPengurus : p)));
      showToast('success', 'Berhasil Disimpan', `Data pengurus ${editPengurus.nama} berhasil diperbarui.`);
      setEditPengurus(null);
    } catch {
      showToast('error', 'Gagal', 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const { exportToExcel } = await import('@/lib/excel-helper');
    const dataToExport = filtered.map((p) => ({
      'NIK Pengurus (16 Digit)': p.nik,
      'Nama Lengkap Pengurus': p.nama,
      'Jabatan / Divisi Kepengurusan': p.jabatan,
      'Unit Instansi Kepengurusan': p.unit,
      'Nomor Telepon / WhatsApp Aktif': p.telepon,
      'Status Keaktifan': p.status || 'AKTIF',
    }));

    exportToExcel(dataToExport, `pengurus-${new Date().toISOString().slice(0, 10)}`, 'Data Pengurus');
    showToast('success', 'Export Excel Berhasil', `${filtered.length} data pengurus diexport ke file .xlsx.`);
  };

  const handleDownloadTemplate = async () => {
    const { downloadExcelTemplate } = await import('@/lib/excel-helper');
    const templateData = [
      {
        'NIK Pengurus (16 Digit)': '3571011508080001',
        'Nama Lengkap Pengurus': 'Ustadz Mochammad Fauzi',
        'Jabatan / Divisi Kepengurusan': 'Kepala Sekretariat Utama',
        'Unit Instansi Kepengurusan (PONDOK/MADRASAH/MI)': 'PONDOK',
        'Nomor Telepon / WhatsApp Aktif': '081234567890',
        'Status Keaktifan (AKTIF/NON_AKTIF)': 'AKTIF',
      },
    ];

    downloadExcelTemplate(templateData, 'template-import-pengurus', 'Template Pengurus');
    showToast('info', 'Template Excel Diunduh', 'Isi template .xlsx lalu gunakan tombol Import Excel.');
  };

  const handleImport = async (file: File) => {
    showToast('info', 'Membaca File Excel', `Membaca data dari ${file.name}...`);
    try {
      const { parseExcelFile } = await import('@/lib/excel-helper');
      const rows = await parseExcelFile(file);
      showToast('success', 'Import Berhasil', `${rows.length} data pengurus dibaca dari file Excel.`);
    } catch {
      showToast('error', 'Import Gagal', 'Format file Excel tidak dapat dibaca.');
    }
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="👥"
        title="Data Pengurus & Pengelola Pesantren"
        subtitle="Direktori Pengurus Pondok Pesantren, Sekretariat, & Pengurus Komplek"
        badge="DATABASE PONDOK"
        primaryAction={
          instansiFilter === 'pondok'
            ? {
                label: '+ Tambah Pengurus Baru',
                onClick: () => {
                  setFormData({
                    nik: '',
                    nama: '',
                    jabatan: '',
                    unit: 'PONDOK',
                    telepon: '',
                    status: 'AKTIF',
                    avatar_url: '',
                  });
                  setShowAddModal(true);
                },
              }
            : {
                label: '📥 Tarik Data Pengurus Pondok',
                onClick: () => showToast('info', 'Tarik Data Pengurus', 'Sinkronisasi pengurus dari Pondok Pesantren SSoT.'),
                gold: true,
              }
        }
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama pengurus atau jabatan..."
        count={loading ? undefined : filtered.length}
        countLabel="pengurus"
        onExportExcel={handleExport}
        onDownloadTemplate={instansiFilter === 'pondok' ? handleDownloadTemplate : undefined}
        onImport={instansiFilter === 'pondok' ? handleImport : undefined}
        onRefresh={fetchPengurus}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Belum Ada Data Pengurus"
            description="Daftar pengurus pesantren akan tampil di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>NIK Pengurus</th>
                  <th>Nama Lengkap</th>
                  <th>Jabatan / Divisi</th>
                  <th>Unit Instansi</th>
                  <th>No. HP</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs font-bold text-[#135e35]">{item.nik}</td>
                    <td className="font-bold text-slate-900">{item.nama}</td>
                    <td className="font-semibold text-slate-700">{item.jabatan}</td>
                    <td>
                      <span className="badge-aktif">{item.unit}</span>
                    </td>
                    <td className="font-mono text-xs text-slate-600">{item.telepon}</td>
                    <td>
                      <span className={item.status === 'NON_AKTIF' ? 'badge-danger' : 'badge-aktif'}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailPengurus(item)}
                          className="btn-action-detail cursor-pointer"
                        >
                          🔍 Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditPengurus(item)}
                          className="btn-action-edit cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id, item.nama)}
                          className={item.status === 'NON_AKTIF' ? 'btn-action-detail cursor-pointer' : 'btn-action-danger cursor-pointer'}
                        >
                          {item.status === 'NON_AKTIF' ? '⚡ Aktifkan' : '⏸ Nonaktif'}
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

      {/* DETAIL MODAL — IDENTICAL FORM FIELDS */}
      {detailPengurus && (
        <Modal
          isOpen={!!detailPengurus}
          onClose={() => setDetailPengurus(null)}
          title={`🔍 Detail Pengurus — ${detailPengurus.nama}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-300 flex items-center justify-center font-black text-emerald-900 text-xl overflow-hidden shrink-0 shadow-sm">
                {detailPengurus.avatar_url ? (
                  <img src={detailPengurus.avatar_url} alt={detailPengurus.nama} className="w-full h-full object-cover" />
                ) : (
                  '👥'
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">
                  REGISTRASI TERPADU PENGURUS
                </span>
                <h3 className="font-black text-base text-slate-900">{detailPengurus.nama}</h3>
                <p className="font-mono text-slate-600">NIK: {detailPengurus.nik}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div>
                <span className="text-slate-400 block font-medium">NIK Pengurus (16 Digit)</span>
                <span className="font-mono font-bold text-slate-900">{detailPengurus.nik}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Nama Lengkap Pengurus</span>
                <span className="font-bold text-slate-900">{detailPengurus.nama}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Jabatan / Divisi</span>
                <span className="font-bold text-slate-900">{detailPengurus.jabatan}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Unit Instansi</span>
                <span className="font-bold text-emerald-800">{detailPengurus.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Nomor Telepon / WhatsApp</span>
                <span className="font-mono font-bold text-emerald-800">{detailPengurus.telepon}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Status Keaktifan</span>
                <span className="font-bold text-slate-900">{detailPengurus.status}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailPengurus(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT MODAL — IDENTICAL FORM FIELDS */}
      {(showAddModal || editPengurus) && (
        <Modal
          size="lg"
          isOpen={showAddModal || !!editPengurus}
          onClose={() => {
            setShowAddModal(false);
            setEditPengurus(null);
          }}
          title={showAddModal ? '➕ Registrasi Pengurus Baru' : `✏️ Edit Pengurus — ${editPengurus?.nama}`}
        >
          <form onSubmit={showAddModal ? handleSaveAdd : handleSaveEdit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                <span>👤</span> Data Identitas & Kepengurusan
              </h4>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  NIK Pengurus (16-Digit KTP/KK) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={showAddModal ? formData.nik : editPengurus?.nik || ''}
                  onChange={(e) =>
                    showAddModal
                      ? setFormData({ ...formData, nik: e.target.value })
                      : setEditPengurus(editPengurus ? { ...editPengurus, nik: e.target.value } : null)
                  }
                  placeholder="3571011508080001"
                  className="input-premium font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Nama Lengkap Pengurus <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={showAddModal ? formData.nama : editPengurus?.nama || ''}
                  onChange={(e) =>
                    showAddModal
                      ? setFormData({ ...formData, nama: e.target.value })
                      : setEditPengurus(editPengurus ? { ...editPengurus, nama: e.target.value } : null)
                  }
                  placeholder="Ustadz Mochammad Fauzi"
                  className="input-premium font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Jabatan / Divisi Kepengurusan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={showAddModal ? formData.jabatan : editPengurus?.jabatan || ''}
                  onChange={(e) =>
                    showAddModal
                      ? setFormData({ ...formData, jabatan: e.target.value })
                      : setEditPengurus(editPengurus ? { ...editPengurus, jabatan: e.target.value } : null)
                  }
                  placeholder="Kepala Sekretariat Utama"
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Unit Instansi Kepengurusan</label>
                <select
                  value={showAddModal ? formData.unit : editPengurus?.unit || 'PONDOK'}
                  onChange={(e) =>
                    showAddModal
                      ? setFormData({ ...formData, unit: e.target.value as any })
                      : setEditPengurus(editPengurus ? { ...editPengurus, unit: e.target.value as any } : null)
                  }
                  className="input-premium font-bold"
                >
                  <option value="PONDOK">PONDOK PESANTREN</option>
                  <option value="MADRASAH">MADRASAH DINIYAH</option>
                  <option value="MI">FORMAL / MI</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Nomor Telepon / WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={showAddModal ? formData.telepon : editPengurus?.telepon || ''}
                  onChange={(e) =>
                    showAddModal
                      ? setFormData({ ...formData, telepon: e.target.value })
                      : setEditPengurus(editPengurus ? { ...editPengurus, telepon: e.target.value } : null)
                  }
                  placeholder="081234567890"
                  className="input-premium font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
              <select
                value={showAddModal ? formData.status : editPengurus?.status || 'AKTIF'}
                onChange={(e) =>
                  showAddModal
                    ? setFormData({ ...formData, status: e.target.value as any })
                    : setEditPengurus(editPengurus ? { ...editPengurus, status: e.target.value as any } : null)
                }
                className="input-premium font-bold"
              >
                <option value="AKTIF">AKTIF</option>
                <option value="NON_AKTIF">NON_AKTIF</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditPengurus(null);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Data Pengurus'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
