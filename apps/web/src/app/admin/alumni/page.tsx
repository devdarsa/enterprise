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

  const handleExport = async () => {
    const { exportToExcel } = await import('@/lib/excel-helper');
    const dataToExport = filtered.map((a) => ({
      'NISP Stambuk': a.nisp,
      'Nama Alumni': a.nama,
      'Tahun Lulus': a.tahunLulus,
      'Jenjang Terakhir': a.jenjangTerakhir,
      'Status Alumni': a.statusAlumni,
      'Lokasi Khidmah / Aktivitas': a.lokasiKhidmah || '-',
      'Nomor Telepon / WhatsApp': a.telepon,
    }));

    exportToExcel(dataToExport, `alumni-${new Date().toISOString().slice(0, 10)}`, 'Data Alumni');
    showToast('success', 'Export Excel Berhasil', `${filtered.length} data alumni diexport ke file .xlsx.`);
  };

  const handleDownloadTemplate = async () => {
    const { downloadExcelTemplate } = await import('@/lib/excel-helper');
    const templateData = [
      {
        'NISP Stambuk': 'PNDK-0012345678',
        'Nama Alumni': 'Muhammad Raihan',
        'Tahun Lulus': 2025,
        'Jenjang Terakhir': 'Aliyah Diniyah',
        'Status Alumni (KULIAH/KHIDMAH/BEKERJA/WIRAUSAHA)': 'KHIDMAH',
        'Lokasi Khidmah / Aktivitas': 'Pondok Pesantren Ma\'had Darussa\'adah',
        'Nomor Telepon / WhatsApp': '081234567890',
      },
    ];

    downloadExcelTemplate(templateData, 'template-import-alumni', 'Template Alumni');
    showToast('info', 'Template Excel Diunduh', 'Isi template .xlsx lalu gunakan tombol Import Excel.');
  };

  const handleImport = async (file: File) => {
    showToast('info', 'Membaca File Excel', `Membaca data dari ${file.name}...`);
    try {
      const { parseExcelFile } = await import('@/lib/excel-helper');
      const rows = await parseExcelFile(file);
      showToast('success', 'Import Berhasil', `${rows.length} data alumni dibaca dari file Excel.`);
    } catch {
      showToast('error', 'Import Gagal', 'Format file Excel tidak dapat dibaca.');
    }
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
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImport}
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
