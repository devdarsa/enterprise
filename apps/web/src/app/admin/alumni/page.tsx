'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar, SkeletonTable } from '@/components/Loading';
import { TableActions, ImportExportToolbar } from '@/components/TableActions';

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

  const filtered = alumniList.filter(
    (a) => a.nama.toLowerCase().includes(search.toLowerCase()) || a.nisp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Pendataan Alumni & Kelulusan</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Direktori Alumni Lulusan Pondok Pesantren & Khidmah</p>
        </div>
        <ImportExportToolbar addLabel="Tambah Alumni" />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama alumni atau NISP..." />
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border">
          {filtered.length} Alumni
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonTable label="Memuat data alumni dari database..." />
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400">Belum ada alumni lulusan tercatat di database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Nama Alumni</th>
                  <th className="p-3.5">NISP Stambuk</th>
                  <th className="p-3.5">Tahun Lulus</th>
                  <th className="p-3.5">Jenjang Terakhir</th>
                  <th className="p-3.5">Status Alumni</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{item.nama}</td>
                    <td className="p-3.5 font-mono text-slate-600">{item.nisp}</td>
                    <td className="p-3.5 font-bold text-slate-700">{item.tahunLulus}</td>
                    <td className="p-3.5 text-slate-600">{item.jenjangTerakhir}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        {item.statusAlumni}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <TableActions
                        onDetail={() => showToast('info', 'Detail Alumni', item.nama)}
                        onEdit={() => showToast('info', 'Edit Alumni', item.nama)}
                        onDelete={() => showToast('info', 'Soft Delete', item.nama)}
                      />
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
