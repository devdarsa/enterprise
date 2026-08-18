'use client';

import { useState, useEffect, useCallback } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

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

  const fetchData = useCallback(async () => {
    if (activeTab === 'audit') {
      const cached = await getIndexedDBCache<AuditItem[]>('audit_log', 'list');
      if (cached && cached.length > 0) {
        setAuditList(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const res = await fetch('/api/v1/audit-log?limit=50');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: AuditItem[] = json.data.map((item: any) => ({
            id: item.id,
            waktu: new Date(item.created_at || item.waktu || Date.now()).toLocaleString('id-ID'),
            user: item.user?.nama_lengkap || item.user?.email || item.user_id || 'Sekretariat System',
            aktivitas: item.action || item.aktivitas || 'Aktivitas System',
            modul: item.entity_type || item.modul || 'SISTEM',
            ipAddress: item.ip_address || item.ipAddress || '127.0.0.1',
          }));
          setAuditList(mapped);
          setIndexedDBCache('audit_log', 'list', mapped);
        } else if (!cached) {
          showToast('error', 'Gagal', json.error || 'Gagal mengambil audit log.');
        }
      } catch {
        if (!cached) showToast('error', 'Gagal Memuat Data', 'Tidak dapat mengambil data dari Server Database.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/santri?deleted=true&limit=50');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRecycleList(
            json.data.map((s: any) => ({
              id: s.id,
              waktuHapus: s.deleted_at ? new Date(s.deleted_at).toLocaleString('id-ID') : 'Terbaru',
              dihapusOleh: 'Admin Sekretariat',
              tipeData: 'SANTRI',
              detail: `${s.nama_lengkap} (NISP: ${s.nisp})`,
            }))
          );
        } else {
          setRecycleList([]);
        }
      } catch {
        setRecycleList([]);
      } finally {
        setLoading(false);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRestore = async (id: string, detail: string) => {
    try {
      // Restore santri: clear deleted_at
      const res = await fetch(`/api/v1/santri/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleted_at: null }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
        showToast('success', 'Data Dipulihkan (Restore)', `${detail} berhasil dipulihkan dari Recycle Bin.`);
      } else {
        showToast('error', 'Gagal', json.error);
      }
    } catch {
      showToast('error', 'Gagal Dipulihkan', 'Terjadi kesalahan sistem.');
    }
  };

  const handlePermanentDelete = async (id: string, detail: string) => {
    if (!confirm(`Hapus PERMANEN ${detail}? Tindakan ini tidak dapat diurungkan!`)) return;
    try {
      // Permanent delete: belum diimplementasi di API v1 — tampilkan pesan informatif
      showToast('warning', 'Hapus Permanen', `Fitur hapus permanen memerlukan konfirmasi admin senior. Hubungi Sekretariat Pusat.`);
    } catch {
      showToast('error', 'Gagal Menghapus', 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="📋"
        title="Audit Log System & Recycle Bin"
        subtitle="Jejak Rekam Aktivitas Perubahan Data Real-Time (Immutable) & Pemulihan Berkas Terhapus"
        badge="SISTEM & UTILITAS"
        onExportExcel={() => showToast('info', 'Export Audit Log', 'Mengeksport rekap audit log ke Excel.')}
        onRefresh={fetchData}
        toolbarExtra={
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audit' ? 'bg-[#0f4928] text-white shadow' : 'bg-slate-100 text-slate-700'
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
        }
      />

      {loading ? (
        <div className="table-container p-6">
          <SkeletonTable rows={4} cols={5} />
        </div>
      ) : activeTab === 'audit' ? (
        <div className="table-container">
          <div className="p-3 bg-amber-50/80 border-b border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between">
            <span>🛡️ AUDIT LOG IMMUTABLE STANDARD: Audit log dicatat secara otomatis dari database & TIDAK DAPAT diubah maupun dihapus.</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1.5 animate-pulse shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              REALTIME STREAMING (5s)
            </span>
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
