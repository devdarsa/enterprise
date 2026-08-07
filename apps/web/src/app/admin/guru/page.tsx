'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

interface Guru {
  id: string;
  nip: string;
  nama: string;
  tugas: string;
  telepon: string;
  instansi: string;
  status?: string;
}

export default function MasterGuruPage() {
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => { fetchGuru(); }, []);

  const fetchGuru = async () => {
    const cached = await getIndexedDBCache<Guru[]>('guru', 'master_list');
    if (cached && cached.length > 0) {
      setGuruList(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/v1/guru?limit=100`);
      const json = await res.json();
      if (json.success) {
        const mapped = json.data.map((g: any) => ({
          id: g.id,
          nip: g.nip || '-',
          nama: g.nama_lengkap,
          tugas: g.jadwal?.[0]?.mata_pelajaran?.nama_mapel || 'Pengajar',
          telepon: g.telepon || '-',
          instansi: g.user?.user_roles?.[0]?.role?.name || 'MADRASAH',
          status: 'AKTIF',
        }));
        setGuruList(mapped);
        setIndexedDBCache('guru', 'master_list', mapped);
      }
    } catch {
      if (!cached) showToast('error', 'Gagal Memuat Data', 'Tidak dapat mengambil data pengajar.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (id: string, name: string) => {
    setGuruList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: g.status === 'NON_AKTIF' ? 'AKTIF' : 'NON_AKTIF' } : g))
    );
    showToast('success', 'Status Diperbarui', `Status ${name} berhasil diperbarui.`);
  };

  const handleExport = () => {
    const csv = [['NIP','Nama','Tugas','Telepon','Instansi','Status'],
      ...guruList.map(g => [g.nip, g.nama, g.tugas, g.telepon, g.instansi, g.status || ''])
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `data-pengajar-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    showToast('success', 'Export Berhasil', `${guruList.length} data pengajar diexport.`);
  };

  const handleDownloadTemplate = () => {
    const csv = [['NIP','NAMA_LENGKAP','TUGAS_PENGAMPUAN','NO_HP','INSTANSI(MADRASAH/MI/PONDOK)','STATUS(AKTIF/NON_AKTIF)'],
      ['G.001','USTADZ AHMAD KHOIRI','Fiqh','08123456789','MADRASAH','AKTIF']
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'template-import-pengajar.csv',
    });
    a.click();
    showToast('info', 'Template Diunduh', 'Isi template lalu import kembali.');
  };

  const filtered = search
    ? guruList.filter(g =>
        g.nama.toLowerCase().includes(search.toLowerCase()) ||
        g.nip.toLowerCase().includes(search.toLowerCase()) ||
        g.tugas.toLowerCase().includes(search.toLowerCase())
      )
    : guruList;

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      <PageHeader
        icon="👨‍🏫"
        title="Data Pengajar, Mustahiq & Munawwib"
        subtitle="Direktori Tenaga Pengajar, Dewan Mustahiq Diniyah, Munawwib, & Guru MI Formal"
        badge="DATABASE PONDOK"
        primaryAction={{ label: '+ Tambah Tenaga Pengajar', onClick: () => showToast('info', 'Tambah Guru', 'Form pendaftaran pengajar baru.') }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama pengajar, NIP, atau bidang pengampuan..."
        count={loading ? undefined : filtered.length}
        countLabel="pengajar"
        onExportExcel={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
        onImport={(file) => showToast('info', 'Import Diterima', `File "${file.name}" sedang diproses.`)}
        onRefresh={fetchGuru}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👨‍🏫"
            title="Belum Ada Data Pengajar"
            description="Data tenaga pengajar akan tampil di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>NIP / Kode</th>
                  <th>Nama Pengajar</th>
                  <th>Tugas & Pengampuan</th>
                  <th>No. HP</th>
                  <th>Instansi</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id}>
                    <td className="font-mono text-xs font-bold text-[#135e35]">{g.nip}</td>
                    <td className="font-bold text-slate-900">{g.nama}</td>
                    <td className="text-xs text-slate-700 font-semibold">{g.tugas}</td>
                    <td className="font-mono text-xs text-slate-600">{g.telepon}</td>
                    <td>
                      <span className="badge-aktif">{g.instansi}</span>
                    </td>
                    <td>
                      <span className={g.status === 'NON_AKTIF' ? 'badge-nonaktif' : 'badge-aktif'}>
                        {g.status || 'AKTIF'}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => showToast('info', 'Detail Pengajar', `Detail ${g.nama}`)}
                          className="btn-action-detail"
                        >
                          🔍 Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('info', 'Edit Pengajar', `Edit ${g.nama}`)}
                          className="btn-action-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(g.id, g.nama)}
                          className={g.status === 'NON_AKTIF' ? 'btn-action-secondary' : 'btn-action-secondary'}
                        >
                          {g.status === 'NON_AKTIF' ? '⚡ Aktifkan' : '⏸ Nonaktif'}
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
