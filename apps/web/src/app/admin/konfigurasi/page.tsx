'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { PageHeader } from '@/components/PageHeader';
import { FormActions } from '@/components/TableActions';
import Modal, { ConfirmDialog } from '@/components/Modal';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { Tag, Building2, SlidersHorizontal, Plus, Save } from 'lucide-react';

interface MasterJabatan {
  id: string;
  nama: string;
  unit: string;
  deskripsi?: string;
  created_at?: string;
}

export default function KonfigurasiSistemPage() {
  const [activeTab, setActiveTab] = useState<'jabatan' | 'identitas' | 'parameter'>('jabatan');

  // Identitas & Parameter state
  const [namaPondok, setNamaPondok] = useState("Pondok Pesantren Ma'had Darussa'adah");
  const [alamatPondok, setAlamatPondok] = useState('Kediri, Jawa Timur');
  const [radiusQr, setRadiusQr] = useState(200);
  const [notifWa, setNotifWa] = useState(true);

  // Master Jabatan state
  const [jabatanList, setJabatanList] = useState<MasterJabatan[]>([]);
  const [loadingJabatan, setLoadingJabatan] = useState(true);
  const [showAddJabatanModal, setShowAddJabatanModal] = useState(false);
  const [newNamaJabatan, setNewNamaJabatan] = useState('');
  const [newUnitJabatan, setNewUnitJabatan] = useState('PONDOK');
  const [newDeskripsiJabatan, setNewDeskripsiJabatan] = useState('');
  const [submittingJabatan, setSubmittingJabatan] = useState(false);

  // Delete Confirm State
  const [deleteJabatanTarget, setDeleteJabatanTarget] = useState<MasterJabatan | null>(null);
  const [deletingJabatan, setDeletingJabatan] = useState(false);

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    fetchKonfigurasiLive();
    fetchJabatanLive();
  }, []);

  const fetchKonfigurasiLive = async () => {
    try {
      const res = await fetch('/api/v1/instansi');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const pondok = json.data.find((i: any) => i.jenis === 'PONDOK') || json.data[0];
          if (pondok) {
            setNamaPondok(pondok.nama);
            if (pondok.alamat) setAlamatPondok(pondok.alamat);
          }
        }
      }
    } catch (e) {
      console.error('Gagal memuat konfigurasi:', e);
    }
  };

  const fetchJabatanLive = async () => {
    setLoadingJabatan(true);
    try {
      const res = await fetch('/api/v1/konfigurasi/jabatan');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setJabatanList(json.data);
        }
      }
    } catch (e) {
      console.error('Gagal memuat master jabatan:', e);
    } finally {
      setLoadingJabatan(false);
    }
  };

  const handleAddJabatanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNamaJabatan.trim()) {
      showToast('warning', 'Nama Jabatan Kosong', 'Nama Jabatan wajib diisi.');
      return;
    }

    setSubmittingJabatan(true);
    try {
      const res = await fetch('/api/v1/konfigurasi/jabatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: newNamaJabatan.trim(),
          unit: newUnitJabatan,
          deskripsi: newDeskripsiJabatan.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('success', 'Master Jabatan Ditambahkan', `Jabatan '${newNamaJabatan}' berhasil disimpan.`);
        setNewNamaJabatan('');
        setNewDeskripsiJabatan('');
        setShowAddJabatanModal(false);
        fetchJabatanLive();
      } else {
        showToast('error', 'Gagal Menambah Jabatan', json.error || 'Terjadi kesalahan.');
      }
    } catch {
      showToast('error', 'Gagal', 'Terjadi kesalahan server.');
    } finally {
      setSubmittingJabatan(false);
    }
  };

  const handleDeleteJabatanSubmit = async () => {
    if (!deleteJabatanTarget) return;
    setDeletingJabatan(true);
    try {
      const res = await fetch(`/api/v1/konfigurasi/jabatan?id=${deleteJabatanTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Master Jabatan Dihapus', `Jabatan '${deleteJabatanTarget.nama}' berhasil dihapus.`);
        setDeleteJabatanTarget(null);
        fetchJabatanLive();
      } else {
        showToast('error', 'Gagal Menghapus', json.error);
      }
    } catch {
      showToast('error', 'Gagal', 'Terjadi kesalahan sistem.');
    } finally {
      setDeletingJabatan(false);
    }
  };

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/v1/instansi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: namaPondok,
          alamat: alamatPondok,
          radius_meter: Number(radiusQr),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Konfigurasi Tersimpan', 'Pengaturan identitas lembaga & parameter berhasil diperbarui.');
      } else {
        showToast('error', 'Gagal Menyimpan', json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan', err.message);
    }
  };

  const handleResetConfig = () => {
    setNamaPondok("Pondok Pesantren Ma'had Darussa'adah");
    setAlamatPondok('Kediri, Jawa Timur');
    setRadiusQr(200);
    setNotifWa(true);
    showToast('warning', 'Pengaturan Direset', 'Konfigurasi telah dikembalikan ke standar awal.');
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="⚙️"
        title="Konfigurasi & Master Reference Sistem"
        subtitle="Pengaturan Master Jabatan Pengurus, Identitas Lembaga, Geofencing Presensi, & Parameter Enterprise"
        badge="SISTEM & UTILITAS"
        primaryAction={
          activeTab === 'jabatan'
            ? { label: '+ Tambah Master Jabatan', onClick: () => setShowAddJabatanModal(true) }
            : { label: '💾 Simpan Konfigurasi', onClick: () => handleSaveConfig() }
        }
        toolbarExtra={
          <div className="flex gap-1.5 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('jabatan')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'jabatan'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Master Jabatan ({jabatanList.length})
            </button>
            <button
              onClick={() => setActiveTab('identitas')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'identitas'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Identitas Lembaga
            </button>
            <button
              onClick={() => setActiveTab('parameter')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'parameter'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Parameter Presensi
            </button>
          </div>
        }
      />

      {/* TAB 1: MASTER JABATAN PENGURUS */}
      {activeTab === 'jabatan' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-emerald-900 block">🏷️ SINGLE SOURCE OF TRUTH MASTER JABATAN</span>
              <p className="text-emerald-700 font-medium">
                Daftar jabatan ini digunakan sebagai rujukan dropdown resmi pada Form Pengurus & Impor File Excel.
              </p>
            </div>
            <button
              onClick={() => setShowAddJabatanModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm shrink-0"
            >
              + Tambah Jabatan Baru
            </button>
          </div>

          <div className="table-container">
            {loadingJabatan ? (
              <div className="p-6">
                <SkeletonTable rows={5} cols={4} />
              </div>
            ) : jabatanList.length === 0 ? (
              <EmptyState
                icon="🏷️"
                title="Belum Ada Master Jabatan"
                description="Klik tombol '+ Tambah Master Jabatan' untuk mendaftarkan posisi pengurus baru."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="table-premium">
                  <thead>
                    <tr>
                      <th>Nama Jabatan Pengurus</th>
                      <th>Unit Instansi</th>
                      <th>Deskripsi Tugas</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jabatanList.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/80">
                        <td className="font-bold text-slate-900">{j.nama}</td>
                        <td>
                          <span className="badge-aktif">{j.unit}</span>
                        </td>
                        <td className="text-xs text-slate-600">{j.deskripsi || '-'}</td>
                        <td className="text-right pr-4">
                          <button
                            onClick={() => setDeleteJabatanTarget(j)}
                            className="btn-action-danger cursor-pointer"
                          >
                            🗑️ Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IDENTITAS LEMBAGA */}
      {activeTab === 'identitas' && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Identitas Lembaga Pesantren</h2>
            <p className="text-xs text-slate-500">Nama dan alamat utama yang tampil pada KTA, Kop Surat, dan Rapor</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pondok / Pesantren</label>
                <input
                  type="text"
                  value={namaPondok}
                  onChange={(e) => setNamaPondok(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Pesantren</label>
                <input
                  type="text"
                  value={alamatPondok}
                  onChange={(e) => setAlamatPondok(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <FormActions onSave={handleSaveConfig} onReset={handleResetConfig} />
        </form>
      )}

      {/* TAB 3: PARAMETER PRESENSI & WA */}
      {activeTab === 'parameter' && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Pengaturan QR Code & Geolocation Presensi</h2>
            <p className="text-xs text-slate-500">Batas toleransi radius lokasi presensi guru dan santri</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Radius Geofencing (Meter)</label>
                <input
                  type="number"
                  value={radiusQr}
                  onChange={(e) => setRadiusQr(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="notifWa"
                  checked={notifWa}
                  onChange={(e) => setNotifWa(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="notifWa" className="text-xs font-bold text-slate-700">
                  Kirim Notifikasi WA Otomatis ke Wali Santri
                </label>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <FormActions onSave={handleSaveConfig} onReset={handleResetConfig} />
        </form>
      )}

      {/* MODAL TAMBAH MASTER JABATAN BARU */}
      <Modal
        isOpen={showAddJabatanModal}
        onClose={() => setShowAddJabatanModal(false)}
        title="➕ Tambah Master Jabatan Pengurus Baru"
      >
        <form onSubmit={handleAddJabatanSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Jabatan Pengurus <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kabid Keamanan / Lurah Pondok / Sie Dapur"
              value={newNamaJabatan}
              onChange={(e) => setNewNamaJabatan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Unit Instansi</label>
            <select
              value={newUnitJabatan}
              onChange={(e) => setNewUnitJabatan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="PONDOK">PONDOK PESANTREN</option>
              <option value="MADRASAH">MADRASAH DINIYAH</option>
              <option value="MI">MI FORMAL</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi Ringkas Tugas</label>
            <textarea
              rows={3}
              placeholder="Jelaskan uraian wewenang atau tugas jabatan ini (opsional)..."
              value={newDeskripsiJabatan}
              onChange={(e) => setNewDeskripsiJabatan(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddJabatanModal(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingJabatan}
              className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black shadow-sm disabled:opacity-50"
            >
              {submittingJabatan ? '⏳ Menyimpan...' : '💾 Simpan Jabatan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE JABATAN */}
      <ConfirmDialog
        isOpen={!!deleteJabatanTarget}
        onClose={() => setDeleteJabatanTarget(null)}
        onConfirm={handleDeleteJabatanSubmit}
        title={`Hapus Master Jabatan — ${deleteJabatanTarget?.nama ?? ''}`}
        message={`Apakah Anda yakin ingin menghapus master jabatan '${deleteJabatanTarget?.nama}'? Pengurus yang telah memilih jabatan ini akan tetap tercatat.`}
        confirmLabel="Ya, Hapus Jabatan"
        loading={deletingJabatan}
      />
    </div>
  );
}
