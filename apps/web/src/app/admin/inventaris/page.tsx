'use client';

import { useState, useEffect, useMemo } from 'react';
import Modal, { ConfirmDialog } from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState, SearchBar } from '@/components/Loading';

interface InventarisItem {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  jumlah: number;
  kondisi: 'BAIK' | 'PERBAIKAN' | 'RUSAK';
  lokasi: string;
  tahun_pengadaan: string;
  nilai_satuan: number;
  instansi?: string;
}

const KATEGORI_LIST = ['Elektronik & TI', 'Elektronik', 'Pendingin Ruang', 'Mebel', 'Keamanan', 'Kendaraan', 'Peralatan Olahraga', 'Lainnya'];
const KONDISI_CONFIG = {
  BAIK:       { label: 'Baik', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PERBAIKAN:  { label: 'Perlu Perbaikan', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  RUSAK:      { label: 'Rusak', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

export default function InventarisBarangPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [userRole, setUserRole] = useState<string>('ADMIN_INSTANSI');
  const [items, setItems] = useState<InventarisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKondisi, setFilterKondisi] = useState<string>('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InventarisItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  // Form state
  const [form, setForm] = useState({
    nama: '',
    kategori: KATEGORI_LIST[0],
    jumlah: '1',
    kondisi: 'BAIK' as 'BAIK' | 'PERBAIKAN' | 'RUSAK',
    lokasi: '',
    tahun_pengadaan: '2025',
    nilai_satuan: '0',
  });

  // Read session cookie
  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        if (s.role) setUserRole(s.role);
        if (s.instansi) {
          const inst = s.instansi.toLowerCase() as 'pondok' | 'madrasah' | 'mi';
          if (['pondok', 'madrasah', 'mi'].includes(inst)) {
            setInstansiFilter(inst);
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => { fetchInventaris(); }, [instansiFilter]);

  const fetchInventaris = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=inventaris&instansi=${instansiFilter.toUpperCase()}`);
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      showToast('error', 'Gagal Memuat', 'Tidak dapat terhubung ke database.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setForm({ nama: '', kategori: KATEGORI_LIST[0], jumlah: '1', kondisi: 'BAIK', lokasi: '', tahun_pengadaan: '2025', nilai_satuan: '0' });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.lokasi.trim()) {
      showToast('warning', 'Form Tidak Lengkap', 'Nama barang dan lokasi wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        kode: `INV-${form.nama.toUpperCase().slice(0, 3)}-${String(items.length + 1).padStart(3, '0')}`,
        nama: form.nama.trim(),
        kategori: form.kategori,
        jumlah: parseInt(form.jumlah) || 1,
        kondisi: form.kondisi,
        lokasi: form.lokasi.trim(),
        tahun_pengadaan: form.tahun_pengadaan,
        nilai_satuan: parseInt(form.nilai_satuan) || 0,
        instansi: instansiFilter.toUpperCase(),
      };

      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_inventaris', payload }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Inventaris Disimpan', `${form.nama} telah tersimpan di Database.`);
        fetchInventaris();
        setIsModalOpen(false);
      } else {
        showToast('error', 'Gagal Simpan', json.message || 'Coba lagi.');
      }
    } catch {
      showToast('error', 'Kesalahan Sistem', 'Tidak dapat terhubung ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_inventaris', id: deleteTarget.id }),
      });
      const json = await res.json();
      if (json.success) {
        setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
        showToast('info', 'Item Dihapus', `${deleteTarget.nama} telah dihapus dari Database.`);
      }
    } catch {
      showToast('error', 'Gagal Hapus', 'Tidak dapat terhubung ke database.');
    } finally {
      setDeleteTarget(null);
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchQuery = search === '' ||
        i.nama.toLowerCase().includes(search.toLowerCase()) ||
        i.kode.toLowerCase().includes(search.toLowerCase()) ||
        i.lokasi.toLowerCase().includes(search.toLowerCase()) ||
        i.kategori.toLowerCase().includes(search.toLowerCase());
      const matchKondisi = filterKondisi === 'SEMUA' || i.kondisi === filterKondisi;
      return matchQuery && matchKondisi;
    });
  }, [items, search, filterKondisi]);

  const totalNilaiAset = useMemo(() => {
    return filtered.reduce((acc, curr) => acc + (curr.jumlah * curr.nilai_satuan), 0);
  }, [filtered]);

  const totalUnit = useMemo(() => {
    return filtered.reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Inventaris & Aset Instansi</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Pencatatan & pemantauan kondisi barang/aset terisolasi per instansi dari Database
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="btn-primary inline-flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Barang Aset
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl text-emerald-700 shrink-0">
            📦
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Jenis Barang</p>
            <p className="text-xl font-black text-slate-900">{filtered.length} <span className="text-xs font-medium text-slate-500">item</span></p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl text-amber-700 shrink-0">
            🔢
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Kuantitas Unit</p>
            <p className="text-xl font-black text-slate-900">{totalUnit} <span className="text-xs font-medium text-slate-500">unit</span></p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl text-teal-700 shrink-0">
            💰
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimasi Nilai Aset</p>
            <p className="text-lg font-black text-emerald-800">{formatRupiah(totalNilaiAset)}</p>
          </div>
        </div>
      </div>

      {/* Filter + Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex-1 w-full">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama barang, kode, lokasi, kategori..." />
        </div>

        {/* Kondisi Filter */}
        <select
          value={filterKondisi}
          onChange={e => setFilterKondisi(e.target.value)}
          className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer shrink-0"
        >
          <option value="SEMUA">Semua Kondisi</option>
          <option value="BAIK">Kondisi Baik</option>
          <option value="PERBAIKAN">Perlu Perbaikan</option>
          <option value="RUSAK">Kondisi Rusak</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={5} cols={7} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📦"
            title={search || filterKondisi !== 'SEMUA' ? 'Barang Tidak Ditemukan' : 'Belum Ada Data Inventaris'}
            description={search ? 'Coba kata kunci pencarian lain.' : 'Klik tombol "Tambah Barang Aset" untuk mendaftarkan barang baru.'}
            action={{ label: "Tambah Barang Baru", onClick: handleOpenModal }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">KODE & BARANG</th>
                  <th className="py-3.5 px-4">KATEGORI</th>
                  <th className="py-3.5 px-4">JUMLAH</th>
                  <th className="py-3.5 px-4">KONDISI</th>
                  <th className="py-3.5 px-4">LOKASI</th>
                  <th className="py-3.5 px-4">ESTIMASI NILAI</th>
                  <th className="py-3.5 px-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filtered.map((item) => {
                  const kConfig = KONDISI_CONFIG[item.kondisi] || KONDISI_CONFIG.BAIK;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block w-fit mb-1">
                          {item.kode}
                        </span>
                        <span className="font-bold text-slate-900 text-sm block">{item.nama}</span>
                        <span className="text-[10px] text-slate-400">Pengadaan Th: {item.tahun_pengadaan}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-600">{item.kategori}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">{item.jumlah} unit</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${kConfig.color}`}>
                          {kConfig.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">📍 {item.lokasi}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{formatRupiah(item.jumlah * item.nilai_satuan)}</span>
                        <span className="text-[10px] text-slate-400">@{formatRupiah(item.nilai_satuan)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Barang Aset Inventaris"
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Barang Aset *</label>
            <input
              type="text"
              required
              placeholder="Contoh: AC Split Daikin 2 PK"
              value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
              <select
                value={form.kategori}
                onChange={e => setForm({ ...form, kategori: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
              >
                {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Unit *</label>
              <input
                type="number"
                min="1"
                required
                value={form.jumlah}
                onChange={e => setForm({ ...form, jumlah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi</label>
              <select
                value={form.kondisi}
                onChange={e => setForm({ ...form, kondisi: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="BAIK">Baik</option>
                <option value="PERBAIKAN">Perlu Perbaikan</option>
                <option value="RUSAK">Rusak</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Pengadaan</label>
              <input
                type="text"
                value={form.tahun_pengadaan}
                onChange={e => setForm({ ...form, tahun_pengadaan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Penempatan *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Lab Komputer 1"
                value={form.lokasi}
                onChange={e => setForm({ ...form, lokasi: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Satuan (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.nilai_satuan}
                onChange={e => setForm({ ...form, nilai_satuan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Barang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Barang Inventaris?"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.nama}"? Data yang dihapus tidak dapat dikembalikan.`}
        confirmLabel="Ya, Hapus Barang"
        loading={deleting}
      />
    </div>
  );
}
