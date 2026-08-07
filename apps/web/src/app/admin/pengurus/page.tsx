'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

interface Pengurus {
  id: string;
  nik: string;
  nama: string;
  jabatan: string;
  unit: 'PONDOK' | 'MADRASAH' | 'MI';
  telepon: string;
  status: 'AKTIF' | 'NON_AKTIF';
}

export default function DataPengurusPage() {
  const [list, setList] = useState<Pengurus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    fetchPengurus();
  }, []);

  const fetchPengurus = async () => {
    const cached = await getIndexedDBCache<Pengurus[]>('general', 'pengurus_list');
    if (cached && cached.length > 0) {
      setList(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/v1/pengurus');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((p: any) => ({
            id: p.id,
            nik: p.nik || '-',
            nama: p.nama_lengkap,
            jabatan: p.jabatan,
            unit: (p.unit as any) || 'PONDOK',
            telepon: p.telepon || '-',
            status: (p.status as any) || 'AKTIF',
          }));
          setList(mapped);
          setIndexedDBCache('general', 'pengurus_list', mapped);
        }
      }
    } catch (e) {
      if (!cached) showToast('error', 'Gagal Memuat', 'Tidak dapat mengambil data pengurus.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = list.filter(
    (p) => p.nama.toLowerCase().includes(search.toLowerCase()) || p.jabatan.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (id: string, name: string) => {
    setList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === 'NON_AKTIF' ? 'AKTIF' : 'NON_AKTIF' } : p))
    );
    showToast('success', 'Status Diperbarui', `Status ${name} diperbarui.`);
  };

  const handleExport = () => {
    const csv = [['NIK','Nama Pengurus','Jabatan / Divisi','Unit Instansi','No. HP','Status'],
      ...filtered.map(p => [p.nik, p.nama, p.jabatan, p.unit, p.telepon, p.status])
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `pengurus-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    showToast('success', 'Export Berhasil', `${filtered.length} data pengurus diexport.`);
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="👥"
        title="Data Pengurus & Pengelola Pesantren"
        subtitle="Direktori Pengurus Pondok Pesantren, Sekretariat, & Pengurus Komplek"
        badge="DATABASE PONDOK"
        primaryAction={{ label: '+ Tambah Pengurus Baru', onClick: () => showToast('info', 'Tambah Pengurus', 'Form pendaftaran pengurus baru.') }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama pengurus atau jabatan..."
        count={loading ? undefined : filtered.length}
        countLabel="pengurus"
        onExportExcel={handleExport}
        onRefresh={fetchPengurus}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Belum Ada Data Pengurus"
            description="Daftar pengurus pesantren akan tampil di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>NIK Pengurus</th>
                  <th>Nama Lengkap</th>
                  <th>Jabatan / Divisi</th>
                  <th>Unit Instansi</th>
                  <th>No. HP</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs font-bold text-[#135e35]">{item.nik}</td>
                    <td className="font-bold text-slate-900">{item.nama}</td>
                    <td className="font-semibold text-slate-700">{item.jabatan}</td>
                    <td><span className="badge-aktif">{item.unit}</span></td>
                    <td className="font-mono text-xs text-slate-600">{item.telepon}</td>
                    <td>
                      <span className={item.status === 'NON_AKTIF' ? 'badge-danger' : 'badge-aktif'}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => showToast('info', 'Detail Pengurus', item.nama)}
                          className="btn-action-detail"
                        >
                          🔍 Detail
                        </button>
                        <button
                          onClick={() => showToast('info', 'Edit Pengurus', item.nama)}
                          className="btn-action-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item.id, item.nama)}
                          className={item.status === 'NON_AKTIF' ? 'btn-action-detail' : 'btn-action-danger'}
                        >
                          {item.status === 'NON_AKTIF' ? '⚡ Aktifkan' : '⏸ Nonaktif'}
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
    </div>
  );
}
