'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

interface TahunAjaran {
  id: string;
  nama: string;
  semester: 'Ganjil' | 'Genap';
  status: 'AKTIF' | 'NON_AKTIF';
  tglMulai: string;
  tglSelesai: string;
}

export default function TahunAjaranPage() {
  const [list, setList] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const fetchTahunAjaran = async () => {
    const cached = await getIndexedDBCache<TahunAjaran[]>('general', 'tahun_ajaran_list');
    if (cached && cached.length > 0) {
      setList(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/v1/tahun-ajaran');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((t: any) => ({
            id: t.id,
            nama: t.nama,
            semester: t.semester as 'Ganjil' | 'Genap',
            status: t.is_aktif ? 'AKTIF' : 'NON_AKTIF',
            tglMulai: t.tanggal_mulai ? new Date(t.tanggal_mulai).toLocaleDateString('id-ID') : '-',
            tglSelesai: t.tanggal_akhir ? new Date(t.tanggal_akhir).toLocaleDateString('id-ID') : '-',
          }));
          setList(mapped);
          setIndexedDBCache('general', 'tahun_ajaran_list', mapped);
        }
      }
    } catch (e) {
      if (!cached) showToast('error', 'Gagal Memuat', 'Tidak dapat memuat data tahun ajaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAktif = async (id: string) => {
    try {
      const res = await fetch('/api/v1/tahun-ajaran', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        setList((prev) =>
          prev.map((t) => ({ ...t, status: t.id === id ? 'AKTIF' : 'NON_AKTIF' }))
        );
        showToast('success', 'Tahun Ajaran Aktif', 'Tahun ajaran aktif berhasil diperbarui & dicatat pada Audit Log.');
      }
    } catch {
      showToast('error', 'Gagal', 'Terjadi kesalahan sistem.');
    }
  };

  const handleExport = () => {
    const csv = [['Nama Tahun Ajaran','Semester','Status','Tanggal Mulai','Tanggal Selesai'],
      ...list.map(t => [t.nama, t.semester, t.status, t.tglMulai, t.tglSelesai])
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `tahun-ajaran-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    showToast('success', 'Export Berhasil', `${list.length} data tahun ajaran diexport.`);
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="📅"
        title="Manajemen Tahun Ajaran & Kalender Akademik"
        subtitle="Pengaturan Periode Aktif Tahun Ajaran & Kalender Pendidikan Pesantren"
        badge="SISTEM & UTILITAS"
        primaryAction={{ label: '+ Tambah Tahun Ajaran Baru', onClick: () => showToast('info', 'Tambah Periode', 'Form pendaftaran tahun ajaran baru.') }}
        count={loading ? undefined : list.length}
        countLabel="periode"
        onExportExcel={handleExport}
        onRefresh={fetchTahunAjaran}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={4} cols={5} /></div>
        ) : list.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Belum Ada Tahun Ajaran"
            description="Periode akademik akan tampil di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Tahun Ajaran</th>
                  <th>Semester</th>
                  <th>Status Periode</th>
                  <th>Tanggal Mulai</th>
                  <th>Tanggal Selesai</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-slate-900">{item.nama}</td>
                    <td className="font-semibold text-slate-700">{item.semester}</td>
                    <td>
                      <span className={item.status === 'AKTIF' ? 'badge-aktif' : 'badge-danger'}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-slate-600 font-mono text-xs">{item.tglMulai}</td>
                    <td className="text-slate-600 font-mono text-xs">{item.tglSelesai}</td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== 'AKTIF' && (
                          <button
                            type="button"
                            onClick={() => handleSetAktif(item.id)}
                            className="btn-action-detail"
                          >
                            ⚡ Set Aktif
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => showToast('info', 'Edit Periode', item.nama)}
                          className="btn-action-edit"
                        >
                          ✏️ Edit
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
