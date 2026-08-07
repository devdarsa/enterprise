'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/Loading';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';

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
  anak_ke?: number;
  jumlah_saudara?: number;
  alamat?: string;
  telepon?: string;
  jenjang?: string;
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
        fetchDetail();
        showToast('success', 'Berhasil Disimpan', 'Data santri berhasil diperbarui.');
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

  const genderLabel = santri.jenis_kelamin === 'LAKI_LAKI' || santri.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
  const genderBadge = (santri.jenis_kelamin === 'LAKI_LAKI' || santri.jenis_kelamin === 'L')
    ? 'bg-blue-50 text-blue-700 border border-blue-200'
    : 'bg-pink-50 text-pink-700 border border-pink-200';

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Breadcrumb & Back */}
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
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>✏️</span> Edit Profil Santri
          </button>
      </div>

      {/* Hero Card */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden shadow-xl border border-emerald-700/50">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-amber-400/60 flex items-center justify-center text-3xl font-black shrink-0">
            {santri.nama_lengkap.slice(0, 2).toUpperCase()}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest block">SINGLE SOURCE OF TRUTH PONDOK</span>
                <h1 className="text-2xl font-black text-white leading-tight">{santri.nama_lengkap}</h1>
                {santri.nama_panggilan && (
                  <p className="text-sm text-emerald-200 font-medium">"{santri.nama_panggilan}"</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`px-3 py-1 rounded-lg font-black text-xs ${
                  santri.status === 'AKTIF' ? 'bg-emerald-400 text-emerald-950' :
                  santri.status === 'BOYONG' ? 'bg-slate-400 text-white' :
                  santri.status === 'LULUS' ? 'bg-amber-400 text-amber-950' :
                  'bg-rose-400 text-white'
                }`}>
                  {santri.status}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${genderBadge}`}>
                  {genderLabel}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <div className="px-3 py-1.5 bg-white/10 rounded-xl">
                <span className="text-emerald-300 block text-[9px] font-bold uppercase">No. Stambuk</span>
                <span className="font-mono font-black">{santri.nisp || '-'}</span>
              </div>
              <div className="px-3 py-1.5 bg-white/10 rounded-xl">
                <span className="text-emerald-300 block text-[9px] font-bold uppercase">NISN</span>
                <span className="font-mono font-black">{santri.nisn || '-'}</span>
              </div>
              <div className="px-3 py-1.5 bg-white/10 rounded-xl">
                <span className="text-emerald-300 block text-[9px] font-bold uppercase">Kelas</span>
                <span className="font-bold">{santri.kelas?.nama_kelas || '-'}</span>
              </div>
              <div className="px-3 py-1.5 bg-white/10 rounded-xl">
                <span className="text-emerald-300 block text-[9px] font-bold uppercase">Kamar</span>
                <span className="font-bold">{santri.kamar || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* BAB II — Identitas Dasar */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <span>👤</span> Identitas Dasar (BAB II)
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div><span className="text-slate-400 block">NIK Santri</span><span className="font-mono font-bold text-slate-800">{santri.nik || '-'}</span></div>
            <div><span className="text-slate-400 block">Tempat Lahir</span><span className="font-bold text-slate-800">{santri.tempat_lahir || '-'}</span></div>
            <div><span className="text-slate-400 block">Tanggal Lahir</span><span className="font-bold text-slate-800">{santri.tanggal_lahir ? new Date(santri.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span></div>
            <div><span className="text-slate-400 block">Anak Ke / Saudara</span><span className="font-bold text-slate-800">{santri.anak_ke || '-'} dari {santri.jumlah_saudara || '-'}</span></div>
            <div><span className="text-slate-400 block">Jenjang</span><span className="font-bold text-slate-800">{santri.jenjang || '-'}</span></div>
            <div><span className="text-slate-400 block">Hafalan</span><span className="font-bold text-emerald-700">{santri.hafalan_juz || 0} Juz</span></div>
          </div>
          <div className="pt-1">
            <span className="text-slate-400 text-xs block mb-1">Alamat Kependudukan</span>
            <p className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl leading-relaxed">
              {santri.alamat || '-'}
            </p>
          </div>
        </div>

        {/* BAB III — Data Wali */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <span>👨‍👩‍👧</span> Data Orang Tua / Wali (BAB III)
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div><span className="text-slate-400 block">Nama Wali</span><span className="font-bold text-slate-800">{santri.nama_wali || '-'}</span></div>
            <div><span className="text-slate-400 block">Hubungan</span><span className="font-bold text-slate-800">{santri.hubungan_wali || '-'}</span></div>
            <div><span className="text-slate-400 block">NIK Wali</span><span className="font-mono font-bold text-amber-800">{santri.nik_wali || '-'}</span></div>
            <div><span className="text-slate-400 block">No. HP Wali</span><span className="font-bold text-slate-800">{santri.telepon_wali || '-'}</span></div>
            <div className="col-span-2"><span className="text-slate-400 block">No. KK</span><span className="font-mono font-bold text-slate-800">{santri.no_kk || '-'}</span></div>
          </div>
        </div>

        {/* BAB VI — Penempatan Pendidikan */}
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-emerald-900 text-sm flex items-center gap-2">
              <span>📚</span> Penempatan Pendidikan (BAB VI) — Dual Enrollment
            </h3>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg">
              {santri.penempatan?.length || 0} Unit
            </span>
          </div>
          {santri.penempatan && santri.penempatan.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {santri.penempatan.map((p: any) => (
                <div key={p.id} className="p-3 rounded-xl bg-white border border-emerald-200 text-xs space-y-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-extrabold text-[10px]">Unit: {p.unit}</span>
                  <div className="pt-1 space-y-0.5">
                    <div className="text-slate-600">Tingkat: <strong className="text-slate-900">{p.tingkat}</strong></div>
                    <div className="text-slate-600">Kelas: <strong className="text-slate-900">{p.kelas}</strong></div>
                    <div className="text-slate-600">Tahun Ajaran: <strong className="text-slate-900">{p.tahun_ajaran}</strong></div>
                    <div className="text-slate-600">Status: <strong className={p.status === 'AKTIF' ? 'text-emerald-700' : 'text-slate-700'}>{p.status}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white border border-emerald-100 text-xs text-slate-500 font-medium text-center">
              Belum ada data penempatan pendidikan.
            </div>
          )}
        </div>

        {/* Riwayat Pelanggaran */}
        {santri.pelanggaran && santri.pelanggaran.length > 0 && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm space-y-3">
            <h3 className="font-black text-rose-900 text-sm flex items-center gap-2">
              <span>⚠️</span> Riwayat Pelanggaran
            </h3>
            <div className="space-y-2">
              {santri.pelanggaran.slice(0, 5).map((p: any) => (
                <div key={p.id} className="text-xs p-2.5 bg-white rounded-xl border border-rose-100 text-slate-700">
                  <div className="font-bold text-rose-800">{p.jenis_pelanggaran}</div>
                  <div className="text-slate-500">{p.keterangan}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Riwayat Perizinan */}
        {santri.perizinan && santri.perizinan.length > 0 && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm space-y-3">
            <h3 className="font-black text-amber-900 text-sm flex items-center gap-2">
              <span>✉️</span> Riwayat Perizinan
            </h3>
            <div className="space-y-2">
              {santri.perizinan.slice(0, 5).map((p: any) => (
                <div key={p.id} className="text-xs p-2.5 bg-white rounded-xl border border-amber-100 text-slate-700">
                  <div className="font-bold text-amber-800">{p.jenis_izin}</div>
                  <div className="text-slate-500">{p.keterangan}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Edit */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={`✏️ Edit Data Santri — ${santri.nama_lengkap}`}>
        <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
              <input
                required
                value={editForm.nama_lengkap || ''}
                onChange={e => setEditForm(f => ({ ...f, nama_lengkap: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Panggilan</label>
              <input
                value={editForm.nama_panggilan || ''}
                onChange={e => setEditForm(f => ({ ...f, nama_panggilan: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
              <input
                value={editForm.tempat_lahir || ''}
                onChange={e => setEditForm(f => ({ ...f, tempat_lahir: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={editForm.tanggal_lahir ? editForm.tanggal_lahir.slice(0, 10) : ''}
                onChange={e => setEditForm(f => ({ ...f, tanggal_lahir: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={editForm.jenis_kelamin === 'L' ? 'LAKI_LAKI' : editForm.jenis_kelamin === 'P' ? 'PEREMPUAN' : (editForm.jenis_kelamin || 'LAKI_LAKI')}
                onChange={e => setEditForm(f => ({ ...f, jenis_kelamin: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="LAKI_LAKI">Laki-laki (L)</option>
                <option value="PEREMPUAN">Perempuan (P)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hafalan (Juz)</label>
              <input
                type="number" min={0} max={30}
                value={editForm.hafalan_juz || 0}
                onChange={e => setEditForm(f => ({ ...f, hafalan_juz: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Wali</label>
              <input
                value={editForm.nama_wali || ''}
                onChange={e => setEditForm(f => ({ ...f, nama_wali: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. HP Wali</label>
              <input
                value={editForm.telepon_wali || ''}
                onChange={e => setEditForm(f => ({ ...f, telepon_wali: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
            <textarea
              rows={3}
              value={editForm.alamat || ''}
              onChange={e => setEditForm(f => ({ ...f, alamat: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Menyimpan...</> : '💾 Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
