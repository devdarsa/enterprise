'use client';

import { useState, useMemo } from 'react';
import Modal, { ConfirmDialog } from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { EmptyState, SearchBar } from '@/components/Loading';

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
}

const INITIAL_DATA: InventarisItem[] = [
  { id: '1', kode: 'INV-PC-001', nama: 'Komputer Desktop Core i7', kategori: 'Elektronik & TI', jumlah: 25, kondisi: 'BAIK', lokasi: 'Lab Komputer 1', tahun_pengadaan: '2023', nilai_satuan: 8500000 },
  { id: '2', kode: 'INV-PJ-002', nama: 'Proyektor Epson EB-X500', kategori: 'Elektronik', jumlah: 8, kondisi: 'BAIK', lokasi: 'Ruang Kelas 10 & 11', tahun_pengadaan: '2024', nilai_satuan: 5200000 },
  { id: '3', kode: 'INV-AC-003', nama: 'AC Split Daikin 2 PK', kategori: 'Pendingin Ruang', jumlah: 12, kondisi: 'PERBAIKAN', lokasi: 'Masjid Utama & Aula', tahun_pengadaan: '2022', nilai_satuan: 4800000 },
  { id: '4', kode: 'INV-MJ-004', nama: 'Meja & Kursi Belajar Santri Kayu Jati', kategori: 'Mebel', jumlah: 450, kondisi: 'BAIK', lokasi: 'Seluruh Kelas', tahun_pengadaan: '2021', nilai_satuan: 850000 },
  { id: '5', kode: 'INV-BK-005', nama: 'Rak Buku Perpustakaan', kategori: 'Mebel', jumlah: 40, kondisi: 'BAIK', lokasi: 'Perpustakaan', tahun_pengadaan: '2023', nilai_satuan: 1200000 },
  { id: '6', kode: 'INV-CCTV-006', nama: 'Kamera CCTV Hikvision 4MP', kategori: 'Keamanan', jumlah: 16, kondisi: 'BAIK', lokasi: 'Seluruh Gedung', tahun_pengadaan: '2025', nilai_satuan: 750000 },
];

const KATEGORI_LIST = ['Elektronik & TI', 'Elektronik', 'Pendingin Ruang', 'Mebel', 'Keamanan', 'Kendaraan', 'Peralatan Olahraga', 'Lainnya'];
const KONDISI_CONFIG = {
  BAIK:       { label: 'Baik', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PERBAIKAN:  { label: 'Perlu Perbaikan', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  RUSAK:      { label: 'Rusak', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function generateKode(nama: string, idx: number) {
  const prefix = nama.toUpperCase().slice(0, 3).replace(/\s/g, '');
  return `INV-${prefix}-${String(idx + 1).padStart(3, '0')}`;
}

export default function InventarisBarangPage() {
  const [items, setItems] = useState<InventarisItem[]>(INITIAL_DATA);
  const [search, setSearch] = useState('');
  const [filterKondisi, setFilterKondisi] = useState<string>('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventarisItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventarisItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) =>
    setToast({ isOpen: true, type, title, message: msg });

  // Form state
  const [form, setForm] = useState({ nama: '', kategori: KATEGORI_LIST[0], jumlah: '1', kondisi: 'BAIK' as 'BAIK' | 'PERBAIKAN' | 'RUSAK', lokasi: '', tahun_pengadaan: '2025', nilai_satuan: '0' });

  const resetForm = () => setForm({ nama: '', kategori: KATEGORI_LIST[0], jumlah: '1', kondisi: 'BAIK', lokasi: '', tahun_pengadaan: '2025', nilai_satuan: '0' });

  const openAdd = () => { setEditTarget(null); resetForm(); setIsModalOpen(true); };
  const openEdit = (item: InventarisItem) => {
    setEditTarget(item);
    setForm({ nama: item.nama, kategori: item.kategori, jumlah: String(item.jumlah), kondisi: item.kondisi, lokasi: item.lokasi, tahun_pengadaan: item.tahun_pengadaan, nilai_satuan: String(item.nilai_satuan) });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.lokasi) { showToast('warning', 'Data Tidak Lengkap', 'Nama barang dan lokasi wajib diisi.'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    if (editTarget) {
      setItems(prev => prev.map(it => it.id === editTarget.id
        ? { ...it, ...form, jumlah: Number(form.jumlah), nilai_satuan: Number(form.nilai_satuan) }
        : it
      ));
      showToast('success', 'Data Diperbarui', `${form.nama} berhasil diperbarui.`);
    } else {
      const newItem: InventarisItem = {
        id: Date.now().toString(),
        kode: generateKode(form.nama, items.length),
        ...form,
        jumlah: Number(form.jumlah),
        nilai_satuan: Number(form.nilai_satuan),
      };
      setItems(prev => [newItem, ...prev]);
      showToast('success', 'Aset Ditambahkan', `${form.nama} berhasil ditambahkan.`);
    }

    setSubmitting(false);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await new Promise(r => setTimeout(r, 600));
    setItems(prev => prev.filter(it => it.id !== deleteTarget.id));
    showToast('info', 'Aset Dihapus', `${deleteTarget.nama} dihapus dari inventaris.`);
    setDeleteTarget(null);
    setDeleting(false);
  };

  const filtered = useMemo(() => {
    let list = items;
    if (filterKondisi !== 'SEMUA') list = list.filter(it => it.kondisi === filterKondisi);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(it => it.nama.toLowerCase().includes(q) || it.kode.toLowerCase().includes(q) || it.kategori.toLowerCase().includes(q) || it.lokasi.toLowerCase().includes(q));
    }
    return list;
  }, [items, search, filterKondisi]);

  const totalNilai = items.reduce((sum, it) => sum + it.jumlah * it.nilai_satuan, 0);
  const totalUnit = items.reduce((sum, it) => sum + it.jumlah, 0);
  const perbaikanCount = items.filter(it => it.kondisi === 'PERBAIKAN').length;
  const rusakCount = items.filter(it => it.kondisi === 'RUSAK').length;

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Manajemen Inventaris & Aset</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Pencatatan aset barang, lokasi, dan pemantauan status kondisi</p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary inline-flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Aset Baru
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Jenis Aset', value: `${items.length} Item`, icon: '📦', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Total Unit Aset', value: `${totalUnit.toLocaleString()}`, icon: '🔢', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Perlu Perbaikan', value: `${perbaikanCount} Aset`, icon: '🔧', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Total Nilai Aset', value: formatRupiah(totalNilai), icon: '💰', bg: 'bg-teal-50 border-teal-200' },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${card.bg} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="text-base font-black text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          {['SEMUA', 'BAIK', 'PERBAIKAN', 'RUSAK'].map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setFilterKondisi(k)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${filterKondisi === k ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'}`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex-1 w-full">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama, kode, kategori, lokasi..." />
        </div>
        <span className="shrink-0 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">{filtered.length} item</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon="📦" title="Tidak Ada Aset" description={search ? `Tidak ada aset yang cocok dengan "${search}"` : 'Belum ada inventaris tercatat.'} action={!search ? { label: '+ Tambah Aset Baru', onClick: openAdd } : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Kode Aset</th>
                  <th>Nama Barang</th>
                  <th>Kategori</th>
                  <th>Jumlah</th>
                  <th>Lokasi</th>
                  <th>Nilai/Unit</th>
                  <th>Kondisi</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const kondisiConf = KONDISI_CONFIG[item.kondisi];
                  return (
                    <tr key={item.id || i}>
                      <td className="font-mono font-bold text-emerald-700 text-[11px]">{item.kode}</td>
                      <td className="font-bold text-slate-900">{item.nama}</td>
                      <td className="text-slate-500 text-[11px]">{item.kategori}</td>
                      <td className="font-mono font-bold text-slate-700">{item.jumlah.toLocaleString()} Unit</td>
                      <td className="text-slate-500 text-[11px]">{item.lokasi}</td>
                      <td className="font-mono text-[11px] text-slate-600">{formatRupiah(item.nilai_satuan)}</td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${kondisiConf.color}`}>{kondisiConf.label}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(item)} className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors">Edit</button>
                          <button onClick={() => setDeleteTarget(item)} className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editTarget ? 'Edit Data Aset' : 'Tambah Aset Baru'} subtitle="Sistem Inventaris Darsa Enterprise" icon="📦">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Barang / Aset <span className="text-rose-500">*</span></label>
              <input type="text" required value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama lengkap barang..." className="input-premium" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori</label>
                <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} className="input-premium cursor-pointer">
                  {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kondisi</label>
                <select value={form.kondisi} onChange={e => setForm(f => ({ ...f, kondisi: e.target.value as any }))} className="input-premium cursor-pointer">
                  <option value="BAIK">Baik</option>
                  <option value="PERBAIKAN">Perlu Perbaikan</option>
                  <option value="RUSAK">Rusak</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Unit</label>
                <input type="number" min="1" value={form.jumlah} onChange={e => setForm(f => ({ ...f, jumlah: e.target.value }))} className="input-premium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tahun Pengadaan</label>
                <input type="number" min="2000" max="2030" value={form.tahun_pengadaan} onChange={e => setForm(f => ({ ...f, tahun_pengadaan: e.target.value }))} className="input-premium" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Lokasi Penempatan <span className="text-rose-500">*</span></label>
              <input type="text" required value={form.lokasi} onChange={e => setForm(f => ({ ...f, lokasi: e.target.value }))} placeholder="Ruang / Gedung / Area..." className="input-premium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nilai Per Unit (Rp)</label>
              <input type="number" min="0" value={form.nilai_satuan} onChange={e => setForm(f => ({ ...f, nilai_satuan: e.target.value }))} className="input-premium" />
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2 text-xs disabled:opacity-60">
              {submitting ? '⏳ Menyimpan...' : editTarget ? '💾 Perbarui Aset' : '💾 Simpan Aset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus Aset: ${deleteTarget?.nama ?? ''}`}
        message={`Aset ${deleteTarget?.nama ?? ''} (${deleteTarget?.kode ?? ''}) akan dihapus permanen dari sistem inventaris.`}
        confirmLabel="Ya, Hapus Aset"
        loading={deleting}
      />
    </div>
  );
}
