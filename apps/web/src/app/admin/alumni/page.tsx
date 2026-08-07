'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';

interface Alumni {
  id: string;
  nisp: string;
  nama: string;
  tahunLulus: number;
  jenjangTerakhir: string;
  statusAlumni: 'KULIAH' | 'KHIDMAH' | 'BEKERJA' | 'WIRAUSAHA';
  lokasiKhidmah?: string;
  telepon: string;
}

export default function DataAlumniPage() {
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    async function fetchAlumniLive() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/santri?status=LULUS');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped = json.data.map((a: any) => ({
              id: a.id,
              nisp: a.nisp,
              nama: a.nama_lengkap,
              tahunLulus: a.updated_at ? new Date(a.updated_at).getFullYear() : 2025,
              jenjangTerakhir: a.kelas?.nama_kelas || 'Aliyah Diniyah',
              statusAlumni: 'KHIDMAH' as const,
              lokasiKhidmah: a.alamat || 'Pondok Pesantren Ma\'had Darussa\'adah',
              telepon: a.telepon || '-',
            }));
            setAlumniList(mapped);
          }
        }
      } catch (e) {
        console.error('Gagal memuat alumni live:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAlumniLive();
  }, []);

  const handleExport = () => {
    const csv = [['NISP Stambuk','Nama Alumni','Tahun Lulus','Jenjang Terakhir','Status Alumni','Telepon'],
      ...filtered.map(a => [a.nisp, a.nama, String(a.tahunLulus), a.jenjangTerakhir, a.statusAlumni, a.telepon])
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `alumni-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    showToast('success', 'Export Berhasil', `${filtered.length} data alumni diexport.`);
  };

  const filtered = alumniList.filter(
    (a) => a.nama.toLowerCase().includes(search.toLowerCase()) || a.nisp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="🎓"
        title="Pendataan Alumni & Kelulusan"
        subtitle="Direktori Alumni Lulusan Pondok Pesantren & Khidmah"
        badge="DATABASE PONDOK"
        primaryAction={{ label: '+ Tambah Data Alumni', onClick: () => showToast('info', 'Tambah Alumni', 'Form alumni baru.') }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama alumni atau NISP..."
        count={loading ? undefined : filtered.length}
        countLabel="alumni"
        onExportExcel={handleExport}
        onRefresh={() => setSearch('')}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="Belum Ada Alumni Lulusan"
            description="Belum ada alumni lulusan yang tercatat di database."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Nama Alumni</th>
                  <th>NISP Stambuk</th>
                  <th>Tahun Lulus</th>
                  <th>Jenjang Terakhir</th>
                  <th>Status Alumni</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-slate-900">{item.nama}</td>
                    <td className="font-mono text-xs font-bold text-[#135e35]">{item.nisp}</td>
                    <td className="font-bold text-slate-700">{item.tahunLulus}</td>
                    <td className="text-slate-600">{item.jenjangTerakhir}</td>
                    <td>
                      <span className="badge-aktif">
                        {item.statusAlumni}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => showToast('info', 'Detail Alumni', item.nama)}
                          className="btn-action-detail"
                        >
                          🔍 Detail
                        </button>
                        <button
                          onClick={() => showToast('info', 'Edit Alumni', item.nama)}
                          className="btn-action-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => showToast('info', 'Soft Delete', item.nama)}
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
    </div>
  );
}
