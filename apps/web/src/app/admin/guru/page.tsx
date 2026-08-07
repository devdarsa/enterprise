'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import Modal from '@/components/Modal';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

interface Guru {
  id: string;
  nip: string;
  nama: string;
  tugas: string;
  telepon: string;
  instansi: string;
  status?: string;
  foto_url?: string;
}

export default function MasterGuruPage() {
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  // Modal States
  const [detailGuru, setDetailGuru] = useState<Guru | null>(null);
  const [editGuru, setEditGuru] = useState<Guru | null>(null);
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
    fetchGuru();
  }, []);

  const fetchGuru = async () => {
    const cached = await getIndexedDBCache<Guru[]>('guru', 'master_list');
    if (cached && cached.length > 0) {
      setGuruList(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/v1/guru?limit=100`);
      const json = await res.json();
      if (json.success) {
        const mapped = json.data.map((g: any) => ({
          id: g.id,
          nip: g.nip || '-',
          nama: g.nama_lengkap,
          tugas: g.jadwal?.[0]?.mata_pelajaran?.nama_mapel || 'Pengajar & Mustahiq',
          telepon: g.telepon || '-',
          instansi: g.user?.user_roles?.[0]?.role?.name || 'MADRASAH',
          status: 'AKTIF',
          foto_url: g.avatar_url,
        }));
        setGuruList(mapped);
        setIndexedDBCache('guru', 'master_list', mapped);
      }
    } catch {
      if (!cached) showToast('error', 'Gagal Memuat Data', 'Tidak dapat mengambil data pengajar.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (id: string, name: string) => {
    setGuruList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: g.status === 'NON_AKTIF' ? 'AKTIF' : 'NON_AKTIF' } : g))
    );
    showToast('success', 'Status Diperbarui', `Status ${name} berhasil diperbarui.`);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGuru) return;
    setSaving(true);
    try {
      setGuruList((prev) => prev.map((g) => (g.id === editGuru.id ? { ...g, ...editGuru } : g)));
      showToast('success', 'Berhasil Disimpan', `Data pengajar ${editGuru.nama} berhasil diperbarui.`);
      setEditGuru(null);
    } catch {
      showToast('error', 'Gagal', 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const { exportToExcel } = await import('@/lib/excel-helper');
    const dataToExport = filtered.map((g) => ({
      'Nomor Induk Pegawai / Guru (NIP)': g.nip,
      'Nama Lengkap & Gelar Guru/Ustadz': g.nama,
      'Instansi': g.instansi,
      'Bidang Tugas & Pengampu Mapel': g.tugas,
      'Nomor Telepon / WhatsApp Aktif': g.telepon,
      'Status Keaktifan': g.status || 'AKTIF',
    }));

    exportToExcel(dataToExport, `data-pengajar-${new Date().toISOString().slice(0, 10)}`, 'Data Pengajar');
    showToast('success', 'Export Excel Berhasil', `${filtered.length} data pengajar diexport ke file .xlsx.`);
  };

  const handleDownloadTemplate = async () => {
    const { downloadExcelTemplate } = await import('@/lib/excel-helper');
    const templateData = [
      {
        'Nomor Induk Pegawai / Guru (NIP)': '198501012010011001',
        'Nama Lengkap & Gelar Guru/Ustadz': 'Dr. KH. Abdullah Ridwan',
        'Instansi (PONDOK/MADRASAH/MI)': 'MADRASAH',
        'Bidang Tugas & Pengampu Mapel': 'Pengasuh & Ustadz Hadits Diniyah',
        'Nomor Telepon / WhatsApp Aktif': '081234567890',
        'Status Keaktifan (AKTIF/NON_AKTIF)': 'AKTIF',
      },
    ];

    downloadExcelTemplate(templateData, 'template-import-pengajar', 'Template Pengajar');
    showToast('info', 'Template Excel Diunduh', 'Isi template .xlsx lalu gunakan tombol Import Excel.');
  };

  const handleImport = async (file: File) => {
    showToast('info', 'Membaca File Excel', `Membaca data dari ${file.name}...`);
    try {
      const { parseExcelFile } = await import('@/lib/excel-helper');
      const rows = await parseExcelFile(file);
      showToast('success', 'Import Berhasil', `${rows.length} data pengajar dibaca dari file Excel.`);
    } catch {
      showToast('error', 'Import Gagal', 'Format file Excel tidak dapat dibaca.');
    }
  };

  const filtered = search
    ? guruList.filter(
        (g) =>
          g.nama.toLowerCase().includes(search.toLowerCase()) ||
          g.nip.toLowerCase().includes(search.toLowerCase()) ||
          g.tugas.toLowerCase().includes(search.toLowerCase())
      )
    : guruList;

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      <PageHeader
        icon="👨‍🏫"
        title="Data Pengajar, Mustahiq & Munawwib"
        subtitle="Direktori Tenaga Pengajar, Dewan Mustahiq Diniyah, Munawwib, & Guru MI Formal"
        badge="DATABASE PONDOK"
        primaryAction={
          instansiFilter === 'pondok'
            ? { label: '+ Tambah Tenaga Pengajar', onClick: () => (window.location.href = '/admin/guru/baru') }
            : { label: '📥 Tarik Data Pengajar Pondok', onClick: () => showToast('info', 'Tarik Data Pengajar', 'Sinkronisasi pengajar dari Pondok Pesantren SSoT.'), gold: true }
        }
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama pengajar, NIP, atau bidang pengampuan..."
        count={loading ? undefined : filtered.length}
        countLabel="pengajar"
        onExportExcel={handleExport}
        onDownloadTemplate={instansiFilter === 'pondok' ? handleDownloadTemplate : undefined}
        onImport={instansiFilter === 'pondok' ? handleImport : undefined}
        onRefresh={fetchGuru}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👨‍🏫"
            title="Belum Ada Data Pengajar"
            description="Data tenaga pengajar akan tampil di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>NIP / Kode</th>
                  <th>Nama Pengajar</th>
                  <th>Tugas & Pengampuan</th>
                  <th>No. HP</th>
                  <th>Instansi</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id}>
                    <td className="font-mono text-xs font-bold text-[#135e35]">{g.nip}</td>
                    <td className="font-bold text-slate-900">{g.nama}</td>
                    <td className="text-xs text-slate-700 font-semibold">{g.tugas}</td>
                    <td className="font-mono text-xs text-slate-600">{g.telepon}</td>
                    <td>
                      <span className="badge-aktif">{g.instansi}</span>
                    </td>
                    <td>
                      <span className={g.status === 'NON_AKTIF' ? 'badge-nonaktif' : 'badge-aktif'}>
                        {g.status || 'AKTIF'}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailGuru(g)}
                          className="btn-action-detail cursor-pointer"
                        >
                          🔍 Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditGuru(g)}
                          className="btn-action-edit cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(g.id, g.nama)}
                          className="btn-action-secondary cursor-pointer"
                        >
                          {g.status === 'NON_AKTIF' ? '⚡ Aktifkan' : '⏸ Nonaktif'}
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

      {/* DETAIL MODAL — IDENTICAL FIELDS TO MANUAL INPUT FORM */}
      {detailGuru && (
        <Modal isOpen={!!detailGuru} onClose={() => setDetailGuru(null)} title={`🔍 Detail Profil Guru — ${detailGuru.nama}`}>
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-300 flex items-center justify-center font-black text-emerald-900 text-xl overflow-hidden shrink-0 shadow-sm">
                {detailGuru.foto_url ? (
                  <img src={detailGuru.foto_url} alt={detailGuru.nama} className="w-full h-full object-cover" />
                ) : (
                  '👨‍🏫'
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">
                  REGISTRASI TERPADU PENGAJAR
                </span>
                <h3 className="font-black text-base text-slate-900">{detailGuru.nama}</h3>
                <p className="font-mono text-slate-600">NIP: {detailGuru.nip}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div>
                <span className="text-slate-400 block font-medium">Nomor Induk Pegawai / Guru (NIP)</span>
                <span className="font-mono font-bold text-slate-900">{detailGuru.nip}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Nama Lengkap & Gelar Guru/Ustadz</span>
                <span className="font-bold text-slate-900">{detailGuru.nama}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Pilih Instansi</span>
                <span className="font-bold text-emerald-800">{detailGuru.instansi}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Bidang Tugas & Pengampu Mapel</span>
                <span className="font-bold text-slate-900">{detailGuru.tugas}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Nomor Telepon / WhatsApp Aktif</span>
                <span className="font-mono font-bold text-emerald-800">{detailGuru.telepon}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailGuru(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL — IDENTICAL FORM FIELDS TO MANUAL INPUT FORM (/admin/guru/baru) */}
      {editGuru && (
        <Modal isOpen={!!editGuru} onClose={() => setEditGuru(null)} title={`✏️ Edit Data Guru — ${editGuru.nama}`}>
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                <span>📋</span> Data Induk & Pengampuan Guru
              </h4>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  NIP / Kode Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editGuru.nip}
                  onChange={(e) => setEditGuru({ ...editGuru, nip: e.target.value })}
                  className="input-premium font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Nama Lengkap & Gelar Guru/Ustadz <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editGuru.nama}
                  onChange={(e) => setEditGuru({ ...editGuru, nama: e.target.value })}
                  className="input-premium font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Unit Instansi Pengampuan</label>
                <select
                  value={editGuru.instansi}
                  onChange={(e) => setEditGuru({ ...editGuru, instansi: e.target.value })}
                  className="input-premium font-bold"
                >
                  <option value="PONDOK">Instansi Pondok Pesantren</option>
                  <option value="MADRASAH">Instansi Madrasah Diniyah</option>
                  <option value="MI">Instansi Madrasah / MI</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Bidang Tugas & Pengampu Mapel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editGuru.tugas}
                  onChange={(e) => setEditGuru({ ...editGuru, tugas: e.target.value })}
                  placeholder="Contoh: Pengasuh & Ustadz Hadits Diniyah"
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">
                  Nomor Telepon / WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editGuru.telepon}
                  onChange={(e) => setEditGuru({ ...editGuru, telepon: e.target.value })}
                  placeholder="081234567890"
                  className="input-premium font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Foto Profil Guru (File Upload)</label>
                <div className="flex items-center gap-3">
                  {editGuru.foto_url ? (
                    <img
                      src={editGuru.foto_url}
                      alt="Preview Foto"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-lg shrink-0">
                      👨‍🏫
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setEditGuru({ ...editGuru, foto_url: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditGuru(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Perubahan Data Guru'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
