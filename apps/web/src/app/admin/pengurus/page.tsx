'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';
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

const INITIAL_PENGURUS: Pengurus[] = [
  { id: '1', nik: '3571011205800001', nama: 'Ust. H. Abdul Hamid, M.Pd', jabatan: 'Ketua Umum Pengurus Pondok', unit: 'PONDOK', telepon: '081234567890', status: 'AKTIF' },
  { id: '2', nik: '3571011809850002', nama: 'Ust. Moh. Kholil', jabatan: 'Kepala Sekretariat Diniyyah', unit: 'MADRASAH', telepon: '085712345678', status: 'AKTIF' },
  { id: '3', nik: '3571012211880003', nama: 'Ahmad Subhan, S.T', jabatan: 'Kabid Sarpras MI Formal', unit: 'MI', telepon: '081900112233', status: 'AKTIF' },
];

export default function DataPengurusPage() {
  const [list, setList] = useState<Pengurus[]>(INITIAL_PENGURUS);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

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

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            DATABASE PONDOK
          </span>
          <h1 className="text-xl font-black text-slate-900">Data Pengurus Pesantren & Unit</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pengelolaan Struktural Pengurus Pondok, Madrasah Diniyyah, & MI Formal
          </p>
        </div>

        <ImportExportToolbar
          onAdd={() => showToast('info', 'Tambah Pengurus', 'Form pendataan pengurus baru.')}
          addLabel="+ Pendataan Pengurus Baru"
          onExport={() => showToast('info', 'Export Data', 'Mengeksport data pengurus.')}
          onPrint={() => showToast('info', 'Cetak Data', 'Mencetak struktur pengurus.')}
        />
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari nama pengurus atau jabatan..." />
      </div>

      {/* Data Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr>
              <th>NIK Kependudukan</th>
              <th>Nama Pengurus</th>
              <th>Jabatan Struktural</th>
              <th>Unit Instansi</th>
              <th>No. WhatsApp</th>
              <th>Status</th>
              <th className="text-right">Aksi Standards (RBAC)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80">
                <td className="font-mono text-xs font-bold text-emerald-800">{p.nik}</td>
                <td className="font-bold text-slate-900">{p.nama}</td>
                <td className="text-xs text-slate-700 font-semibold">{p.jabatan}</td>
                <td>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    {p.unit}
                  </span>
                </td>
                <td className="font-mono text-xs text-slate-600">{p.telepon}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="text-right">
                  <TableActions
                    onDetail={() => showToast('info', 'Detail Pengurus', `Detail ${p.nama}`)}
                    onEdit={() => showToast('info', 'Edit Pengurus', `Edit ${p.nama}`)}
                    onToggleStatus={() => handleToggleStatus(p.id, p.nama)}
                    statusActive={p.status === 'AKTIF'}
                    onDelete={() => {
                      setList((prev) => prev.filter((item) => item.id !== p.id));
                      showToast('success', 'Soft Delete', `Pengurus ${p.nama} dipindahkan ke Recycle Bin.`);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
