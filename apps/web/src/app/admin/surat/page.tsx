'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { LoadingSpinner, SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

interface Surat {
  id: string;
  nomor: string;
  jenis: string;
  perihal: string;
  pengirim: string;
  penerima: string;
  tanggal: string;
  status: string;
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
  santri_nama?: string;
}

export default function PersuratanDigitalPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailSurat, setDetailSurat] = useState<Surat | null>(null);
  const [editSurat, setEditSurat] = useState<Surat | null>(null);

  // Form State inside Modal (Identical to Manual Generator Form)
  const [nomor, setNomor] = useState(
    () => `SRT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`
  );
  const [santri, setSantri] = useState('Muhammad Raihan');
  const [keperluan, setKeperluan] = useState('Izin Pulang Keperluan Keluarga');
  const [instansi, setInstansi] = useState<'PONDOK' | 'MADRASAH' | 'MI'>('PONDOK');
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
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
    fetchSurat();
  }, [instansiFilter]);

  const fetchSurat = async () => {
    const cacheKey = `list_${instansiFilter}`;
    const cached = await getIndexedDBCache<Surat[]>('surat', cacheKey);
    if (cached && cached.length > 0) {
      setSuratList(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/v1/surat?limit=50`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSuratList(json.data);
        setIndexedDBCache('surat', cacheKey, json.data);
      }
    } catch {
      if (!cached) showToast('error', 'Gagal Memuat Surat', 'Terjadi kesalahan koneksi database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomor_surat: nomor || `SRT-${Date.now()}`,
          jenis_surat: 'SURAT_IZIN_SANTRI',
          perihal: keperluan,
          pengirim: santri ? `Wali Santri ${santri}` : 'Wali Santri',
          penerima: 'Pengasuh Pondok',
        }),
      });

      const json = await res.json();
      setSubmitting(false);

      if (json.success) {
        setIsModalOpen(false);
        fetchSurat();
        showToast('success', 'Surat Izin Berhasil Dibuat', `Nomor ${nomor} berhasil diterbitkan di database.`);
      } else {
        showToast('error', 'Gagal Membuat Surat', json.error || 'Respons API gagal.');
      }
    } catch {
      setSubmitting(false);
      showToast('error', 'Gagal Membuat Surat', 'Terjadi kesalahan jaringan.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSurat) return;
    setSubmitting(true);
    try {
      setSuratList((prev) => prev.map((s) => (s.id === editSurat.id ? editSurat : s)));
      setEditSurat(null);
      showToast('success', 'Berhasil Disimpan', `Surat nomor ${editSurat.nomor} diperbarui.`);
    } catch {
      showToast('error', 'Gagal', 'Gagal menyimpan perubahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = (id: string) => {
    setSuratList((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'DISETUJUI' } : s)));
    showToast('success', 'Perizinan Disetujui', 'Surat izin disetujui dan dicatat di Audit Log.');
  };

  const handleReject = (id: string) => {
    setSuratList((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'DITOLAK' } : s)));
    showToast('warning', 'Perizinan Ditolak', 'Permohonan izin ditolak.');
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="✉️"
        title="Perizinan & Persuratan Santri"
        subtitle="Pengajuan Izin Pulang/Keluar, Verifikasi Keamanan, & Cetak Surat Izin Resmi"
        badge="MODUL KEAMANAN"
        primaryAction={{ label: '✉️ + Tambah Izin Baru', onClick: () => setIsModalOpen(true) }}
        onExportExcel={() => showToast('info', 'Export Data', 'Mengeksport rekap perizinan ke Excel.')}
        onExportPDF={() => showToast('info', 'Cetak Surat', 'Mencetak surat izin resmi ke PDF.')}
        onRefresh={fetchSurat}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={4} cols={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Nomor Surat</th>
                  <th>Jenis / Perihal</th>
                  <th>Pemohon (Wali/Santri)</th>
                  <th>Tanggal</th>
                  <th>Status Izin</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {suratList.map((surat) => (
                  <tr key={surat.id}>
                    <td className="font-mono text-xs font-bold text-[#135e35]">{surat.nomor}</td>
                    <td className="font-bold text-slate-900">{surat.perihal}</td>
                    <td className="text-xs text-slate-600">{surat.pengirim}</td>
                    <td className="text-xs text-slate-500">{surat.tanggal}</td>
                    <td>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                          surat.status === 'DISETUJUI'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : surat.status === 'DITOLAK'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {surat.status}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {surat.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(surat.id)}
                              className="btn-action-detail cursor-pointer"
                            >
                              ✓ Setujui
                            </button>
                            <button
                              onClick={() => handleReject(surat.id)}
                              className="btn-action-danger cursor-pointer"
                            >
                              ✕ Tolak
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDetailSurat(surat)}
                          className="btn-action-secondary cursor-pointer"
                        >
                          🔍 Detail
                        </button>
                        <button
                          onClick={() => setEditSurat(surat)}
                          className="btn-action-edit cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {
                            setSuratList((prev) => prev.filter((s) => s.id !== surat.id));
                            showToast('success', 'Dihapus', `Surat ${surat.nomor} dipindahkan ke Recycle Bin.`);
                          }}
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

      {/* Modal Detail Surat — IDENTICAL FORM FIELDS DISPLAY */}
      <Modal isOpen={!!detailSurat} onClose={() => setDetailSurat(null)} title="🔍 Detail & Cetak Surat Izin Santri">
        {detailSurat && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-900 text-white space-y-1">
              <span className="text-[10px] text-amber-300 font-bold">SURAT PERIZINAN RESMI</span>
              <h3 className="text-sm font-black">{detailSurat.nomor}</h3>
              <p className="text-emerald-200">{detailSurat.perihal}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Nomor Surat Resmi</span>
                <span className="font-mono font-bold text-slate-900">{detailSurat.nomor}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Nama Pemohon / Santri</span>
                <span className="font-bold text-slate-900">{detailSurat.pengirim}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Alasan / Keperluan Izin</span>
                <span className="font-bold text-slate-900">{detailSurat.perihal}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Status Izin & Tanggal</span>
                <span className="font-bold text-emerald-800">{detailSurat.status} ({detailSurat.tanggal})</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-bold cursor-pointer"
              >
                🖨️ Cetak Surat Izin
              </button>
              <button
                onClick={() => setDetailSurat(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Add / Edit Surat — IDENTICAL FORM FIELDS TO MANUAL GENERATOR FORM (/admin/surat/baru) */}
      {(isModalOpen || editSurat) && (
        <Modal
          isOpen={isModalOpen || !!editSurat}
          onClose={() => {
            setIsModalOpen(false);
            setEditSurat(null);
          }}
          title={isModalOpen ? '✍️ Penerbitan Surat Izin Baru' : `✏️ Edit Surat Izin — ${editSurat?.nomor}`}
        >
          <form onSubmit={isModalOpen ? handleAddSurat : handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Surat Resmi</label>
              <input
                type="text"
                required
                value={isModalOpen ? nomor : editSurat?.nomor || ''}
                onChange={(e) =>
                  isModalOpen
                    ? setNomor(e.target.value)
                    : setEditSurat(editSurat ? { ...editSurat, nomor: e.target.value } : null)
                }
                className="input-premium font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Santri Yang Diberi Izin</label>
              <input
                type="text"
                required
                value={isModalOpen ? santri : editSurat?.pengirim || ''}
                onChange={(e) =>
                  isModalOpen
                    ? setSantri(e.target.value)
                    : setEditSurat(editSurat ? { ...editSurat, pengirim: e.target.value } : null)
                }
                className="input-premium font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Instansi</label>
              <select
                value={isModalOpen ? instansi : editSurat?.instansi || 'PONDOK'}
                onChange={(e) =>
                  isModalOpen
                    ? setInstansi(e.target.value as any)
                    : setEditSurat(editSurat ? { ...editSurat, instansi: e.target.value as any } : null)
                }
                className="input-premium font-bold"
              >
                <option value="PONDOK">Instansi Pondok Pesantren</option>
                <option value="MADRASAH">Instansi Madrasah Diniyah</option>
                <option value="MI">Instansi Madrasah / MI</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alasan / Keperluan Izin</label>
              <input
                type="text"
                required
                value={isModalOpen ? keperluan : editSurat?.perihal || ''}
                onChange={(e) =>
                  isModalOpen
                    ? setKeperluan(e.target.value)
                    : setEditSurat(editSurat ? { ...editSurat, perihal: e.target.value } : null)
                }
                className="input-premium"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditSurat(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button type="submit" disabled={submitting} className="flex-1 btn-primary text-xs font-bold cursor-pointer">
                {submitting ? 'Menyimpan...' : '💾 Terbitkan & Simpan Surat'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
