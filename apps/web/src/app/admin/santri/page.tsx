'use client';

import { useState, useEffect, useMemo } from 'react';
import Modal, { ConfirmDialog } from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { LoadingSpinner, SkeletonTable, EmptyState, SearchBar } from '@/components/Loading';

interface Santri {
  id: string;
  nisp?: string;
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
  const [cardTarget, setCardTarget] = useState<Santri | null>(null);
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

  useEffect(() => {
    fetchSantri();
  }, [instansiFilter]);

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=santri&instansi=${instansiFilter}`);
      const json = await res.json();
      if (json.success) {
        setSantriList(json.data);
      } else {
        setSantriList([]);
      }
    } catch {
      showToast('error', 'Gagal Memuat', 'Tidak dapat terhubung ke database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim() || !nama.trim()) {
      showToast('warning', 'Form Belum Lengkap', 'NISN/NISP dan Nama wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const newSantri: Santri = {
        id: Date.now().toString(),
        nisp: `PNDK-${nisn.trim()}`,
        nisn: nisn.trim(),
        nama: nama.trim(),
        jenis_kelamin: jenisKelamin,
        kelas,
        instansi: instansiFilter.toUpperCase(),
        status: 'AKTIF',
        hafalan_juz: 0,
      };

      setSantriList(prev => [newSantri, ...prev]);
      setNisn('');
      setNama('');
      setIsModalOpen(false);
      showToast('success', 'Santri Berhasil Ditambahkan', `Master Data Santri ${newSantri.nama} tersimpan di Database Pondok (Single Source of Truth).`);
    } catch {
      showToast('error', 'Gagal Menyimpan', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      setSantriList(prev => prev.filter(s => s.id !== deleteTarget.id));
      showToast('success', 'Santri Dihapus', `Data santri ${deleteTarget.nama} dihapus.`);
    } catch {
      showToast('error', 'Gagal Menghapus', 'Tidak dapat menghapus data.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return santriList;
    const q = search.toLowerCase();
    return santriList.filter(s =>
      s.nama.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      (s.nisp && s.nisp.toLowerCase().includes(q)) ||
      s.kelas.toLowerCase().includes(q)
    );
  }, [santriList, search]);

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Single Source of Truth Banner for Madrasah & MI */}
      {instansiFilter !== 'pondok' && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-3">
          <span className="text-base shrink-0">🏛️</span>
          <div>
            <strong className="block font-bold mb-0.5">Database Pondok adalah Single Source of Truth:</strong>
            Pembuatan & perubahan biodata santri dikelola terpusat di Pondok. Unit {instansiFilter.toUpperCase()} hanya memanggil/mereferensikan data santri dari Pondok berbasis **NISP / Stambuk**.
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Master Data Santri ({instansiFilter.toUpperCase()})</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {instansiFilter === 'pondok'
              ? 'Pondok Pesantren - Master Single Source of Truth Seluruh Siswa/Siswi'
              : `Referensi Data Akademik & Absensi Unit ${instansiFilter.toUpperCase()}`
            }
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
            + Tambah Santri Baru (Master Pondok)
          </button>
        ) : (
          <a
            href="/admin/santri/tarik"
            className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-md transition-all inline-flex items-center gap-2 shrink-0"
          >
            <span>🔄</span> Tarik / Referensikan Data dari Pondok (Pull Sync NISP)
          </a>
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
                  <th>NISP / Stambuk</th>
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
                    <td className="font-mono font-black text-amber-800 bg-amber-50/60">{santri.nisp || `PNDK-${santri.nisn}`}</td>
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
                        <button
                          onClick={() => setCardTarget(santri)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
                        >
                          🪪 Kartu QR
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

      {/* Kartu Santri Digital Modal */}
      <Modal
        isOpen={!!cardTarget}
        onClose={() => setCardTarget(null)}
        title="Kartu Digital Santri (QR Presensi)"
      >
        {cardTarget && (
          <div className="space-y-6 text-center py-2">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white border-2 border-amber-400 shadow-2xl relative overflow-hidden text-left space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-700/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-amber-400 bg-white/10 flex items-center justify-center font-bold text-xs">
                    🕌
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest block">KARTU PRESENSI DIGITAL</span>
                    <h4 className="text-xs font-black">MA'HAD DARUSSA'ADAH LIRBOYO</h4>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-black">ACTIVE</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black shrink-0">
                  {cardTarget.nama.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-white">{cardTarget.nama}</h3>
                  <p className="text-xs text-emerald-200 font-mono">NISN: {cardTarget.nisn}</p>
                  <p className="text-[11px] text-amber-300 font-semibold">{cardTarget.kelas}</p>
                </div>
              </div>

              {/* QR Code Placeholder Box */}
              <div className="p-3 bg-white rounded-2xl flex items-center justify-between gap-3 text-slate-900">
                <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white text-3xl font-black font-mono shadow-inner shrink-0">
                  QR
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                  <span className="block font-bold text-emerald-800">TOTP DYNAMIC GEOLOCATION</span>
                  <span className="block">Radius: 200 Meter Pos Utama</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5">Scannable by Guru & Sekretariat</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              <span>🖨️</span> Cetak / Simpan Kartu Santri Digital
            </button>
          </div>
        )}
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
