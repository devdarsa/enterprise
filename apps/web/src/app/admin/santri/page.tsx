'use client';

import { useState, useEffect, useMemo } from 'react';
import Modal, { ConfirmDialog } from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { LoadingSpinner, SkeletonTable, EmptyState, SearchBar } from '@/components/Loading';

interface Santri {
  id: string;
  nisn: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  kelas: string;
  instansi: string;
  status: string;
  hafalan_juz?: number;
}

export default function MasterSantriPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [userRole, setUserRole] = useState<string>('ADMIN_INSTANSI');
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Santri | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [kelas, setKelas] = useState('10-A (Tahfidz & Sains)');
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  // Read session cookie to lock instansi
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

  useEffect(() => { fetchSantri(); }, [instansiFilter]);

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=santri&instansi=${instansiFilter.toUpperCase()}`);
      const json = await res.json();
      setSantriList(json.success ? json.data : []);
    } catch {
      showToast('error', 'Gagal Memuat Data', 'Terjadi kesalahan koneksi database lokal.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim() || !nama.trim()) {
      showToast('warning', 'Data Tidak Lengkap', 'NISN dan Nama wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_santri',
          payload: { nisn, nama, jenis_kelamin: jenisKelamin, kelas, instansi: instansiFilter.toUpperCase(), tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 0 },
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Santri Berhasil Ditambahkan', `${nama} telah tersimpan di Database Lokal.`);
        fetchSantri();
        setIsModalOpen(false);
        setNisn(''); setNama('');
      } else {
        showToast('error', 'Gagal Simpan', json.message || 'Coba lagi.');
      }
    } catch {
      showToast('error', 'Kesalahan Sistem', 'Tidak dapat terhubung ke database lokal.');
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
        body: JSON.stringify({ action: 'delete_santri', id: deleteTarget.id }),
      });
      const json = await res.json();
      if (json.success) {
        setSantriList(prev => prev.filter(s => s.id !== deleteTarget.id));
        showToast('info', 'Data Dihapus', `${deleteTarget.nama} telah dihapus dari Database.`);
      }
    } catch {
      showToast('error', 'Gagal Hapus', 'Tidak dapat terhubung ke database.');
    } finally {
      setDeleteTarget(null);
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return santriList;
    const q = search.toLowerCase();
    return santriList.filter(s =>
      s.nama.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.kelas.toLowerCase().includes(q)
    );
  }, [santriList, search]);

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Master Data Santri</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Kelola data santri terisolasi per instansi dari Database Lokal
          </p>
        </div>
        {instansiFilter === 'pondok' ? (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary inline-flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Santri Baru
          </button>
        ) : (
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs hover:bg-amber-100 transition-all inline-flex items-center gap-2 shrink-0"
          >
            <span>📥</span> Tarik Data dari Pondok
          </button>
        )}
      </div>

      {/* Search Bar & Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="flex-1 w-full">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama, NISN, atau kelas..." />
        </div>

        {/* Count badge */}
        {!loading && (
          <span className="shrink-0 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            {filtered.length} santri
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎓"
            title={search ? 'Santri Tidak Ditemukan' : 'Belum Ada Data Santri'}
            description={search
              ? `Tidak ada santri yang cocok dengan pencarian "${search}".`
              : `Belum ada santri terdaftar di instansi ${instansiFilter}. Klik tombol "Tambah Santri Baru" untuk mulai.`
            }
            action={!search && instansiFilter === 'pondok' ? { label: '+ Tambah Santri Baru', onClick: () => setIsModalOpen(true) } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>NISN</th>
                  <th>Nama Lengkap Santri</th>
                  <th>Gender</th>
                  <th>Kelas & Rombel</th>
                  <th>Hafalan</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((santri, i) => (
                  <tr key={santri.id || i}>
                    <td className="font-mono font-bold text-emerald-700">{santri.nisn}</td>
                    <td className="font-bold text-slate-900">{santri.nama}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        santri.jenis_kelamin === 'L'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-pink-50 text-pink-700 border-pink-200'
                      }`}>
                        {santri.jenis_kelamin === 'L' ? '♂ Laki-laki' : '♀ Perempuan'}
                      </span>
                    </td>
                    <td className="text-slate-600">{santri.kelas}</td>
                    <td className="font-mono font-bold text-amber-700">
                      {santri.hafalan_juz !== undefined ? `${santri.hafalan_juz} Juz` : '-'}
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        santri.status === 'AKTIF'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {santri.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors">
                          Detail
                        </button>
                        <button
                          onClick={() => setDeleteTarget(santri)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
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

      {/* Add Santri Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrasi Santri Baru" subtitle="Pondok Pesantren Ma'had Darussa'adah Lirboyo" icon="🎓">
        <form onSubmit={handleAddSantri} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Induk Santri Nasional (NISN) <span className="text-rose-500">*</span></label>
            <input type="text" required value={nisn} onChange={e => setNisn(e.target.value)} placeholder="0012345678" className="input-premium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap Santri <span className="text-rose-500">*</span></label>
            <input type="text" required value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama Lengkap Santri..." className="input-premium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Kelamin</label>
              <select value={jenisKelamin} onChange={e => setJenisKelamin(e.target.value as 'L' | 'P')} className="input-premium cursor-pointer">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kelas & Rombel</label>
              <select value={kelas} onChange={e => setKelas(e.target.value)} className="input-premium cursor-pointer">
                <option value="10-A (Tahfidz & Sains)">10-A (Tahfidz)</option>
                <option value="11-B (Sains)">11-B (Sains)</option>
                <option value="12-C (IPS)">12-C (IPS)</option>
                <option value="10-B (Sains)">10-B (Sains)</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-y-0 text-xs">
              {submitting ? <><LoadingSpinner size="sm" variant="white" /> Menyimpan...</> : '💾 Simpan Santri'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus Santri: ${deleteTarget?.nama ?? ''}`}
        message={`Data santri ${deleteTarget?.nama ?? ''} (NISN: ${deleteTarget?.nisn ?? ''}) akan dihapus permanen dari Database Lokal. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Santri"
        loading={deleting}
      />
    </div>
  );
}
