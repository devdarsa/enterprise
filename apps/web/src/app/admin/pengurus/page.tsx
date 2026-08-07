'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar, SkeletonTable } from '@/components/Loading';
import { TableActions, ImportExportToolbar } from '@/components/TableActions';

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
    async function fetchPengurus() {
      setLoading(true);
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
          }
        }
      } catch (e) {
        console.error('Gagal memuat pengurus:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchPengurus();
  }, []);

  const filtered = list.filter(
    (p) => p.nama.toLowerCase().includes(search.toLowerCase()) || p.jabatan.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (id: string, name: string) => {
    setList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === 'AKTIF' ? 'NON_AKTIF' : 'AKTIF' } : p))
    );
    showToast('success', 'Status Pengurus Diperbarui', `Status ${name} berhasil diubah.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Data Pengurus Pesantren & Instansi</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Struktur Pengurus Pondok, Madrasah Diniyyah, & MI Formal</p>
        </div>
        <ImportExportToolbar addLabel="Tambah Pengurus" />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama pengurus atau jabatan..." />
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border">
          {filtered.length} Pengurus
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonTable label="Memuat data pengurus dari database..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Nama & Jabatan</th>
                  <th className="p-3.5">NIK</th>
                  <th className="p-3.5">Unit Instansi</th>
                  <th className="p-3.5">Telepon</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block text-sm">{item.nama}</span>
                      <span className="text-[11px] text-slate-500">{item.jabatan}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{item.nik}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        {item.unit}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{item.telepon}</td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id, item.nama)}
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                          item.status === 'AKTIF'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <TableActions
                        onDetail={() => showToast('info', 'Detail Pengurus', item.nama)}
                        onEdit={() => showToast('info', 'Edit Pengurus', item.nama)}
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
