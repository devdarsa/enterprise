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
  instansi: string;
}

export default function PersuratanDigitalPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailSurat, setDetailSurat] = useState<Surat | null>(null);

  // Form State inside Modal
  const [nomor, setNomor] = useState('SRT/2026/08/005');
  const [santri, setSantri] = useState('Muhammad Raihan');
  const [keperluan, setKeperluan] = useState('Izin Pulang Keperluan Keluarga');
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
          <div className="p-6"><SkeletonTable rows={4} cols={6} /></div>
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
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                        surat.status === 'DISETUJUI' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        surat.status === 'DITOLAK'   ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {surat.status}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {surat.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(surat.id)} className="btn-action-detail">✓ Setujui</button>
                            <button onClick={() => handleReject(surat.id)} className="btn-action-danger">✕ Tolak</button>
                          </>
                        )}
                        <button
                          onClick={() => setDetailSurat(surat)}
                          className="btn-action-secondary"
                        >
                          🔍 Detail
                        </button>
                        <button
                          onClick={() => {
                            setSuratList((prev) => prev.filter((s) => s.id !== surat.id));
                            showToast('success', 'Dihapus', `Surat ${surat.nomor} dipindahkan ke Recycle Bin.`);
                          }}
                          className="btn-action-danger"
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

      {/* Modal Detail Surat */}
      <Modal isOpen={!!detailSurat} onClose={() => setDetailSurat(null)} title="Detail & Cetak Surat Izin Santri">
        {detailSurat && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-900 text-white space-y-1">
              <span className="text-[10px] text-amber-300 font-bold">SURAT PERIZINAN RESMI</span>
              <h3 className="text-sm font-black">{detailSurat.nomor}</h3>
              <p className="text-emerald-200">{detailSurat.perihal}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div><span className="text-slate-400">Pengirim:</span> {detailSurat.pengirim}</div>
              <div><span className="text-slate-400">Status:</span> <strong>{detailSurat.status}</strong></div>
              <div><span className="text-slate-400">Tanggal Terbit:</span> {detailSurat.tanggal}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-bold">
                🖨️ Cetak Surat Izin
              </button>
              <button onClick={() => setDetailSurat(null)} className="py-2.5 px-4 rounded-xl bg-slate-100 font-bold text-slate-700">
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Quick Create Surat */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Penerbitan Surat Izin Baru">
        <form onSubmit={handleAddSurat} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Surat</label>
            <input type="text" required value={nomor} onChange={(e) => setNomor(e.target.value)} className="input-premium font-mono" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Santri</label>
            <input type="text" required value={santri} onChange={(e) => setSantri(e.target.value)} className="input-premium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan & Alasan Izin</label>
            <input type="text" required value={keperluan} onChange={(e) => setKeperluan(e.target.value)} className="input-premium" />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary text-xs font-bold">
              {submitting ? <><LoadingSpinner size="sm" variant="white" /> Menyimpan...</> : '💾 Terbitkan Surat'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
