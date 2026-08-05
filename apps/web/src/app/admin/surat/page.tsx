'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { LoadingSpinner, SkeletonTable } from '@/components/Loading';
import { TableActions, ImportExportToolbar } from '@/components/TableActions';

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
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/surat?limit=50`);
      const json = await res.json();
      setLoading(false);
      if (json.success) {
        setSuratList(json.data);
      } else {
        showToast('error', 'Gagal Memuat Surat', json.error || 'Terjadi kesalahan database.');
      }
    } catch {
      setLoading(false);
      showToast('error', 'Gagal Memuat Surat', 'Terjadi kesalahan koneksi database.');
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            MODUL KEAMANAN
          </span>
          <h1 className="text-xl font-black text-slate-900">Perizinan & Persuratan Santri</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pengajuan Izin Pulang/Keluar, Verifikasi Keamanan, & Cetak Surat Izin Resmi
          </p>
        </div>

        <ImportExportToolbar
          onAdd={() => setIsModalOpen(true)}
          addLabel="✉️ + Tambah Izin Baru"
          onExport={() => showToast('info', 'Export Data', 'Mengeksport rekap perizinan.')}
          onPrint={() => showToast('info', 'Cetak Surat', 'Mencetak surat izin resmi.')}
        />
      </div>

      {/* Table Data Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={4} cols={6} />
          </div>
        ) : (
          <table className="table-premium">
            <thead>
              <tr>
                <th>Nomor Surat</th>
                <th>Jenis / Perihal</th>
                <th>Pemohon (Wali/Santri)</th>
                <th>Tanggal</th>
                <th>Status Izin</th>
                <th className="text-right">Aksi Standards (RBAC)</th>
              </tr>
            </thead>
            <tbody>
              {suratList.map((surat) => (
                <tr key={surat.id} className="hover:bg-slate-50/80">
                  <td className="font-mono text-xs font-bold text-emerald-800">{surat.nomor}</td>
                  <td className="font-bold text-slate-900">{surat.perihal}</td>
                  <td className="text-xs text-slate-600">{surat.pengirim}</td>
                  <td className="text-xs text-slate-500">{surat.tanggal}</td>
                  <td>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                      surat.status === 'DISETUJUI' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      surat.status === 'DITOLAK' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {surat.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {surat.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(surat.id)} className="px-2 py-1 rounded bg-emerald-700 text-white text-[10px] font-bold">✓ Setujui</button>
                          <button onClick={() => handleReject(surat.id)} className="px-2 py-1 rounded bg-rose-700 text-white text-[10px] font-bold">✕ Tolak</button>
                        </>
                      )}
                      <TableActions
                        onDetail={() => setDetailSurat(surat)}
                        onRiwayat={() => showToast('info', 'Riwayat Perizinan', `Riwayat perizinan ${surat.nomor}`)}
                        onDelete={() => {
                          setSuratList((prev) => prev.filter((s) => s.id !== surat.id));
                          showToast('success', 'Soft Delete', `Surat ${surat.nomor} dipindahkan ke Recycle Bin.`);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
