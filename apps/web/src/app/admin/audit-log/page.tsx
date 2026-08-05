'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable } from '@/components/Loading';
import { ImportExportToolbar } from '@/components/TableActions';

interface AuditItem {
  id: string;
  waktu: string;
  user: string;
  aktivitas: string;
  modul: string;
  ipAddress: string;
}

interface RecycleBinItem {
  id: string;
  waktuHapus: string;
  dihapusOleh: string;
  tipeData: string;
  detail: string;
}

export default function AuditLogRecycleBinPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'recycle'>('audit');
  const [auditList, setAuditList] = useState<AuditItem[]>([]);
  const [recycleList, setRecycleList] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'audit') {
        const res = await fetch('/api/v1/simulation/data?type=audit_log');
        const json = await res.json();
        if (json.success) setAuditList(json.data);
      } else {
        const res = await fetch('/api/v1/simulation/data?type=recycle_bin');
        const json = await res.json();
        if (json.success) setRecycleList(json.data);
      }
    } catch {
      showToast('error', 'Gagal Memuat Data', 'Tidak dapat mengambil data dari database API.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, detail: string) => {
    try {
      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore_recycle_bin', id }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
        showToast('success', 'Data Dipulihkan (Restore)', `${detail} berhasil dipulihkan dari Recycle Bin.`);
      }
    } catch {
      showToast('error', 'Gagal Dipulihkan', 'Terjadi kesalahan sistem.');
    }
  };

  const handlePermanentDelete = async (id: string, detail: string) => {
    try {
      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'permanent_delete_recycle_bin', id }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
        showToast('warning', 'Hapus Permanen', `${detail} telah dihapus permanen dari sistem.`);
      }
    } catch {
      showToast('error', 'Gagal Menghapus', 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS
          </span>
          <h1 className="text-xl font-black text-slate-900">Audit Log System & Recycle Bin</h1>
          <p className="text-xs text-slate-500 font-medium">
            Jejak Rekam Aktivitas Perubahan Data Real-Time (Immutable) & Pemulihan Berkas Terhapus
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ImportExportToolbar
            onExport={() => showToast('info', 'Export Audit Log', 'Mengeksport rekap audit log.')}
            onPrint={() => showToast('info', 'Cetak Audit Log', 'Mencetak laporan audit log.')}
            onRefresh={fetchData}
          />
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audit' ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-700'
              }`}
            >
              📋 Audit Log ({auditList.length})
            </button>
            <button
              onClick={() => setActiveTab('recycle')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'recycle' ? 'bg-rose-700 text-white shadow' : 'bg-slate-100 text-slate-700'
              }`}
            >
              🗑️ Recycle Bin ({recycleList.length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <SkeletonTable rows={4} cols={5} />
        </div>
      ) : activeTab === 'audit' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-3 bg-amber-50/80 border-b border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between">
            <span>🛡️ AUDIT LOG IMMUTABLE STANDARD: Audit log dicatat secara otomatis dari database & TIDAK DAPAT diubah maupun dihapus.</span>
          </div>
          <table className="table-premium">
            <thead>
              <tr>
                <th>Waktu Kejadian</th>
                <th>Pengguna (User)</th>
                <th>Aktivitas Perubahan Data</th>
                <th>Modul</th>
                <th>IP Address</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {auditList.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80">
                  <td className="font-mono text-xs text-slate-600 font-medium">{a.waktu}</td>
                  <td className="font-bold text-slate-900">{a.user}</td>
                  <td className="text-xs text-slate-800 font-semibold">{a.aktivitas}</td>
                  <td><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">{a.modul}</span></td>
                  <td className="font-mono text-xs text-slate-400">{a.ipAddress}</td>
                  <td className="text-right">
                    <button
                      onClick={() => showToast('info', 'Detail Aktivitas Audit Log', `Aktivitas oleh ${a.user}: ${a.aktivitas}`)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
                    >
                      🔍 Detail Aktivitas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {recycleList.length > 0 ? (
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Waktu Dihapus</th>
                  <th>Dihapus Oleh</th>
                  <th>Tipe Data</th>
                  <th>Detail Item Terhapus</th>
                  <th className="text-right">Aksi Recovery (RBAC)</th>
                </tr>
              </thead>
              <tbody>
                {recycleList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="font-mono text-xs text-slate-600">{item.waktuHapus}</td>
                    <td className="font-bold text-slate-900">{item.dihapusOleh}</td>
                    <td><span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">{item.tipeData}</span></td>
                    <td className="text-xs text-slate-800 font-semibold">{item.detail}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRestore(item.id, item.detail)}
                          className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm"
                        >
                          🔄 Pulihkan Data
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id, item.detail)}
                          className="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-sm"
                        >
                          💥 Hapus Permanen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="text-4xl">♻️</div>
              <h3 className="text-sm font-bold text-slate-900">Recycle Bin Kosong</h3>
              <p className="text-xs text-slate-500">Tidak ada data santri, pengurus, atau dokumen yang baru saja dihapus.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
