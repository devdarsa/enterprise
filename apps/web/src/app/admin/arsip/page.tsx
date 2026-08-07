'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';

interface ArsipItem {
  id: string;
  kodeArsip: string;
  kategori: string;
  judul: string;
  tahunAjaran: string;
  tanggalArsip: string;
  fileSize: string;
}

export default function ArsipHistorisPage() {
  const [list, setList] = useState<ArsipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    async function fetchArsipLive() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/surat');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped = json.data.map((s: any) => ({
              id: s.id,
              kodeArsip: s.nomor_surat || `ARSIP-${s.id.substring(0, 8)}`,
              kategori: s.jenis_surat || 'Dokumen Resmi',
              judul: s.perihal || 'Dokumen Pesantren',
              tahunAjaran: '2025/2026',
              tanggalArsip: s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID') : '01 Jan 2026',
              fileSize: '1.2 MB',
            }));
            setList(mapped);
          }
        }
      } catch (e) {
        console.error('Gagal memuat arsip:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchArsipLive();
  }, []);

  const handleExport = () => {
    const csv = [['Kode Arsip','Judul Dokumen','Kategori','Tahun Ajaran','Tanggal'],
      ...filtered.map(a => [a.kodeArsip, a.judul, a.kategori, a.tahunAjaran, a.tanggalArsip])
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `arsip-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    showToast('success', 'Export Berhasil', `${filtered.length} data arsip diexport.`);
  };

  const filtered = list.filter((a) => a.judul.toLowerCase().includes(search.toLowerCase()) || a.kodeArsip.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="📦"
        title="Arsip Historis Pesantren"
        subtitle="Penyimpanan Dokumen & Data Akademik Historis Non-Aktif"
        badge="SISTEM & UTILITAS"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari judul dokumen atau kode arsip..."
        count={loading ? undefined : filtered.length}
        countLabel="dokumen"
        onExportExcel={handleExport}
        onRefresh={() => setSearch('')}
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Belum Ada Arsip Historis"
            description="Belum ada arsip historis yang tercatat di database."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Kode Arsip</th>
                  <th>Judul Dokumen</th>
                  <th>Kategori</th>
                  <th>Tahun Ajaran</th>
                  <th>Tanggal</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs font-bold text-[#135e35]">{item.kodeArsip}</td>
                    <td className="font-bold text-slate-900">{item.judul}</td>
                    <td className="text-slate-600">{item.kategori}</td>
                    <td className="text-slate-600">{item.tahunAjaran}</td>
                    <td className="text-slate-600">{item.tanggalArsip}</td>
                    <td className="text-right pr-4">
                      <button
                        type="button"
                        onClick={() => showToast('info', 'Unduh Arsip', item.judul)}
                        className="btn-action-detail"
                      >
                        📥 Unduh
                      </button>
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
