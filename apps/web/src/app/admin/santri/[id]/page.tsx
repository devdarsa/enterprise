'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/Loading';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import RegionSelector from '@/components/RegionSelector';

import { setLocalCache, removeIndexedDBCache } from '@/lib/cache-storage';

interface SantriDetail {
  id: string;
  nisp?: string;
  nisn: string;
  nis?: string;
  nik?: string;
  nama_lengkap: string;
  nama_panggilan?: string;
  jenis_kelamin: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
  telepon?: string;
  avatar_url?: string;
  jenjang?: string;
  kelas_id?: string;
  kamar?: string;
  status_tempat_tinggal?: string;
  status: string;
  hafalan_juz?: number;
  nik_wali?: string;
  nama_wali?: string;
  telepon_wali?: string;
  hubungan_wali?: string;
  no_kk?: string;
  kelas?: { nama_kelas: string; tingkat: number } | null;
  penempatan?: any[];
  pelanggaran?: any[];
  perizinan?: any[];
  created_at?: string;
}

export default function DetailSantriPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [santri, setSantri] = useState<SantriDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SantriDetail>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/santri/${id}`);
      const json = await res.json();
      if (json.success) {
        setSantri(json.data);
        setEditForm(json.data);
      } else {
        showToast('error', 'Gagal Memuat', json.error || 'Data tidak ditemukan');
      }
    } catch {
      showToast('error', 'Error', 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/santri/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        setEditOpen(false);
        setSantri((prev) => ({ ...prev, ...json.data }));
        // Invalidate list cache so master list displays updated photo and fields immediately
        try {
          setLocalCache('santri_list', null);
          removeIndexedDBCache('santri', 'list_pondok');
          removeIndexedDBCache('santri', 'list_madrasah');
          removeIndexedDBCache('santri', 'list_mi');
        } catch {}
        fetchDetail();
        showToast('success', 'Berhasil Disimpan', 'Data santri dan pas foto berhasil diperbarui.');
      } else {
        showToast('error', 'Gagal Menyimpan', json.error);
      }
    } catch {
      showToast('error', 'Error', 'Gagal terhubung ke server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" label="Memuat profil santri..." />
      </div>
    );
  }

  if (!santri) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-medium">Data santri tidak ditemukan.</p>
        <Link href="/admin/santri" className="mt-4 inline-block text-emerald-700 font-bold text-sm underline">
          ← Kembali ke Daftar Santri
        </Link>
      </div>
    );
  }

  const isLaki = santri.jenis_kelamin === 'LAKI_LAKI' || santri.jenis_kelamin === 'L';
  const genderLabel = isLaki ? 'Laki-laki (L)' : 'Perempuan (P)';
  const genderBadge = isLaki
    ? 'bg-blue-50 text-blue-700 border border-blue-200'
    : 'bg-pink-50 text-pink-700 border border-pink-200';

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/admin/santri" className="hover:text-emerald-700 font-semibold transition-colors">
            ← Data Santri
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{santri.nama_lengkap}</span>
        </div>
        <button
          onClick={() => {
            if (santri) setEditForm({ ...santri });
            setEditOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>✏️</span> Edit Profil Santri (Form Terpadu)
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden shadow-xl border border-emerald-700/50">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative flex items-start gap-6">
          {/* Avatar */}
          {santri.avatar_url ? (
            <Image
              src={santri.avatar_url}
              alt={santri.nama_lengkap}
              width={80}
              height={80}
              unoptimized
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400/90 shadow-lg shrink-0 bg-white/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-amber-400/60 flex items-center justify-center text-3xl font-black shrink-0">
              {santri.nama_lengkap.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* Core Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest block">
                  FORMULIR REGISTRASI TERPADU MPHM / DARSA
                </span>
                <h1 className="text-2xl font-black text-white leading-tight">{santri.nama_lengkap}</h1>
                {santri.nama_panggilan && (
                  <p className="text-sm text-emerald-200 font-medium">"{santri.nama_panggilan}"</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span
                  className={`px-3 py-1 rounded-lg font-black text-xs ${
                    santri.status === 'AKTIF'
                      ? 'bg-emerald-400 text-emerald-950'
                      : santri.status === 'BOYONG'
                      ? 'bg-slate-400 text-white'
                      : santri.status === 'LULUS'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-rose-400 text-white'
                  }`}
                >
                  {santri.status}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${genderBadge}`}>
                  {genderLabel}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <div className="px-3 py-1.5 bg-white/10 rounded-xl">
                <span className="text-emerald-300 block text-[9px] font-bold uppercase">Stambuk / NISP</span>
                <span className="font-mono font-black">{santri.nisp || '-'}</span>
              </div>
              <div className="px-3 py-1.5 bg-white/10 rounded-xl">
                <span className="text-emerald-300 block text-[9px] font-bold uppercase">NISN</span>
                <span className="font-mono font-black">{santri.nisn || '-'}</span>
              </div>
              <div className="px-3 py-1.5 bg-white/10 rounded-xl">
                <span className="text-emerald-300 block text-[9px] font-bold uppercase">Jenjang & Kelas</span>
                <span className="font-bold">
                  {santri.jenjang || '-'} {santri.kelas?.nama_kelas ? `(${santri.kelas.nama_kelas})` : ''}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-white/10 rounded-xl">
                <span className="text-emerald-300 block text-[9px] font-bold uppercase">Kamar Asrama</span>
                <span className="font-bold">{santri.kamar || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS — MATCHES 4 SECTIONS OF INPUT MANUAL FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* I. Identitas Pribadi Santri */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
            <span>👤</span> I. Identitas Pribadi Santri
          </h2>
          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Nama Lengkap Santri</span>
              <span className="font-bold text-slate-900">{santri.nama_lengkap}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">NIK Santri (16 Digit)</span>
              <span className="font-mono font-bold text-slate-800">{santri.nik || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Jenis Kelamin</span>
              <span className="font-bold text-slate-800">{genderLabel}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Tempat, Tanggal Lahir</span>
              <span className="font-bold text-slate-800">
                {santri.tempat_lahir || '-'}, {santri.tanggal_lahir ? new Date(santri.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block font-medium">No. HP / WhatsApp Santri</span>
              <span className="font-mono font-bold text-emerald-800">{santri.telepon || '-'}</span>
            </div>
          </div>
        </div>

        {/* II. Data Akademis & Keasramaan */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
            <span>🎓</span> II. Data Akademis & Keasramaan
          </h2>
          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Stambuk / NISP</span>
              <span className="font-mono font-bold text-emerald-900">{santri.nisp || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">NISN</span>
              <span className="font-mono font-bold text-slate-800">{santri.nisn || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">NIS Lokal</span>
              <span className="font-mono font-bold text-slate-800">{santri.nis || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Jenjang Pendidikan</span>
              <span className="font-bold text-slate-800">{santri.jenjang || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Kelas & Rombel</span>
              <span className="font-bold text-slate-800">{santri.kelas?.nama_kelas || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Gedung / Kamar Asrama</span>
              <span className="font-bold text-slate-800">{santri.kamar || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Status Keasramaan</span>
              <span className="font-bold text-slate-800">
                {santri.status_tempat_tinggal === 'UNIT_LAIN' ? 'Kalong / Unit Lain' : 'Mukim / Asrama Pesantren'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Target Hafalan</span>
              <span className="font-bold text-emerald-700">{santri.hafalan_juz || 0} Juz</span>
            </div>
          </div>
        </div>

        {/* III. Alamat Kependudukan */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
            <span>📍</span> III. Alamat Kependudukan
          </h2>
          <div className="text-xs space-y-1">
            <span className="text-slate-400 block font-medium">Alamat Lengkap (Wilayah Indonesia)</span>
            <p className="font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-3 rounded-2xl leading-relaxed">
              {santri.alamat || 'Alamat kependudukan belum diisi.'}
            </p>
          </div>
        </div>

        {/* IV. Data Orang Tua / Wali (Smart KK Mapping) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
            <span>👨‍👩‍👧</span> IV. Data Orang Tua / Wali (Portal Wali)
          </h2>
          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Nomor Kartu Keluarga (KK)</span>
              <span className="font-mono font-bold text-slate-800">{santri.no_kk || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">NIK Kependudukan Wali</span>
              <span className="font-mono font-bold text-amber-800">{santri.nik_wali || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Nama Lengkap Wali</span>
              <span className="font-bold text-slate-800">{santri.nama_wali || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">No. HP & Hubungan</span>
              <span className="font-bold text-slate-800">
                {santri.telepon_wali || '-'} ({santri.hubungan_wali || 'AYAH'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL — IDENTICAL STRUCTURE TO MANUAL INPUT FORM */}
      <Modal size="2xl" isOpen={editOpen} onClose={() => setEditOpen(false)} title={`✏️ Edit Data Santri — ${santri.nama_lengkap}`}>
        <form onSubmit={handleSaveEdit} className="space-y-6 max-h-[82vh] overflow-y-auto pr-2">
          {/* I. Identitas Pribadi */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span>👤</span> I. Identitas Pribadi Santri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Santri *</label>
                <input
                  type="text"
                  required
                  value={editForm.nama_lengkap || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, nama_lengkap: e.target.value }))}
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">NIK Santri (16 Digit KTP/KK)</label>
                <input
                  type="text"
                  maxLength={16}
                  value={editForm.nik || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, nik: e.target.value }))}
                  className="input-premium font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  value={editForm.jenis_kelamin === 'L' || editForm.jenis_kelamin === 'LAKI_LAKI' ? 'L' : 'P'}
                  onChange={(e) => setEditForm((f) => ({ ...f, jenis_kelamin: e.target.value }))}
                  className="input-premium"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={editForm.tempat_lahir || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, tempat_lahir: e.target.value }))}
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={editForm.tanggal_lahir ? editForm.tanggal_lahir.slice(0, 10) : ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, tanggal_lahir: e.target.value }))}
                    className="input-premium"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">No. HP / WhatsApp Santri</label>
                <input
                  type="text"
                  value={editForm.telepon || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, telepon: e.target.value }))}
                  className="input-premium font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Upload Pas Foto Santri (File)</label>
                <div className="flex items-center gap-3">
                  {editForm.avatar_url ? (
                    <Image
                      src={editForm.avatar_url}
                      alt="Preview Foto"
                      width={48}
                      height={48}
                      unoptimized
                      className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-lg shrink-0">
                      📷
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
                          setEditForm((f) => ({ ...f, avatar_url: event.target?.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* II. Data Akademis & Keasramaan */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span>🎓</span> II. Data Akademis & Keasramaan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stambuk / NISP</label>
                <input
                  type="text"
                  value={editForm.nisp || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, nisp: e.target.value }))}
                  className="input-premium font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">NISN *</label>
                <input
                  type="text"
                  required
                  value={editForm.nisn || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, nisn: e.target.value }))}
                  className="input-premium font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">NIS Lokal</label>
                <input
                  type="text"
                  value={editForm.nis || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, nis: e.target.value }))}
                  className="input-premium font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenjang Pendidikan</label>
                <select
                  value={editForm.jenjang || 'Tsanawiyyah'}
                  onChange={(e) => setEditForm((f) => ({ ...f, jenjang: e.target.value }))}
                  className="input-premium"
                >
                  <option value="Tsanawiyyah">Tsanawiyyah</option>
                  <option value="Aliyah">Aliyah</option>
                  <option value="Diniyah Ula">Diniyah Ula</option>
                  <option value="Diniyah Wustho">Diniyah Wustho</option>
                  <option value="MI Formal">MI Formal</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gedung / Kamar Asrama</label>
                <input
                  type="text"
                  value={editForm.kamar || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, kamar: e.target.value }))}
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Keasramaan</label>
                <select
                  value={editForm.status_tempat_tinggal || 'PONDOK_PESANTREN'}
                  onChange={(e) => setEditForm((f) => ({ ...f, status_tempat_tinggal: e.target.value }))}
                  className="input-premium"
                >
                  <option value="PONDOK_PESANTREN">Mukim / Asrama Pesantren</option>
                  <option value="UNIT_LAIN">Kalong / Unit Lain</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Hafalan (Juz)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={editForm.hafalan_juz || 0}
                  onChange={(e) => setEditForm((f) => ({ ...f, hafalan_juz: parseInt(e.target.value) || 0 }))}
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                <select
                  value={editForm.status || 'AKTIF'}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  className="input-premium font-bold"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="BOYONG">BOYONG</option>
                  <option value="LULUS">LULUS</option>
                  <option value="NON_AKTIF">NON_AKTIF</option>
                </select>
              </div>
            </div>
          </div>

          {/* III. Alamat Kependudukan */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span>📍</span> III. Alamat Kependudukan
            </h3>
            <RegionSelector
              onChange={(fullAddress) => setEditForm((f) => ({ ...f, alamat: fullAddress }))}
            />
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-xs">Detail Alamat Lengkap Kependudukan</label>
              <textarea
                rows={3}
                value={editForm.alamat || ''}
                onChange={(e) => setEditForm((f) => ({ ...f, alamat: e.target.value }))}
                className="input-premium resize-none"
              />
            </div>
          </div>

          {/* IV. Data Orang Tua / Wali */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span>👨‍👩‍👧</span> IV. Data Orang Tua / Wali (Integrasi NIK Portal Wali)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (KK)</label>
                <input
                  type="text"
                  maxLength={16}
                  value={editForm.no_kk || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, no_kk: e.target.value }))}
                  className="input-premium font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">NIK Kependudukan Wali (16 Digit)</label>
                <input
                  type="text"
                  maxLength={16}
                  value={editForm.nik_wali || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, nik_wali: e.target.value }))}
                  className="input-premium font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Wali</label>
                <input
                  type="text"
                  value={editForm.nama_wali || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, nama_wali: e.target.value }))}
                  className="input-premium"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. HP Wali</label>
                  <input
                    type="text"
                    value={editForm.telepon_wali || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, telepon_wali: e.target.value }))}
                    className="input-premium font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hubungan</label>
                  <select
                    value={editForm.hubungan_wali || 'AYAH'}
                    onChange={(e) => setEditForm((f) => ({ ...f, hubungan_wali: e.target.value }))}
                    className="input-premium"
                  >
                    <option value="AYAH">Ayah Kandung</option>
                    <option value="IBU">Ibu Kandung</option>
                    <option value="WALI">Wali / Kerabat</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? 'Menyimpan Perubahan...' : '💾 Simpan Perubahan Santri'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
