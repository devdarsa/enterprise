'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Toast, { ToastProps } from '@/components/Toast';
import { TableActions, ImportExportToolbar } from '@/components/TableActions';

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
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) => setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    fetchGuru();
  }, [instansiFilter]);

  const fetchGuru = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=guru&instansi=${instansiFilter}`);
      const json = await res.json();
      if (json.success) {
        setGuruList(json.data);
      }
    } catch {
      showToast('error', 'Gagal Memuat Data', 'Tidak dapat mengambil data pengajar.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (id: string, name: string) => {
    setGuruList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: g.status === 'NON_AKTIF' ? 'AKTIF' : 'NON_AKTIF' } : g))
    );
    showToast('success', 'Status Pengajar Diperbarui', `Status ${name} diperbarui.`);
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
          <h1 className="text-xl font-black text-slate-900">Data Pengajar, Mustahiq & Munawwib</h1>
          <p className="text-xs text-slate-500 font-medium">
            Direktori Tenaga Pengajar, Dewan Mustahiq Diniyah, Munawwib, & Guru MI Formal
          </p>
        </div>

        <ImportExportToolbar
          onAdd={() => showToast('info', 'Tambah Guru', 'Pendaftaran pengajar baru.')}
          addLabel="+ Tambah Tenaga Pengajar Baru"
          onExport={() => showToast('info', 'Export Data', 'Mengeksport data guru.')}
          onPrint={() => showToast('info', 'Cetak Data', 'Mencetak jadwal & daftar pengajar.')}
        />
      </div>

      {/* Table Data Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr>
              <th>NIP / Kode Guru</th>
              <th>Nama Pengajar</th>
              <th>Tugas & Pengampuan</th>
              <th>No. HP</th>
              <th>Instansi</th>
              <th className="text-right">Aksi Standards (RBAC)</th>
            </tr>
          </thead>
          <tbody>
            {guruList.map((g) => (
              <tr key={g.id} className="hover:bg-slate-50/80">
                <td className="font-mono text-xs font-bold text-emerald-800">{g.nip}</td>
                <td className="font-bold text-slate-900">{g.nama}</td>
                <td className="text-xs text-slate-700 font-semibold">{g.tugas}</td>
                <td className="font-mono text-xs text-slate-600">{g.telepon}</td>
                <td>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    {g.instansi}
                  </span>
                </td>
                <td className="text-right">
                  <TableActions
                    onDetail={() => showToast('info', 'Detail Pengajar', `Detail ${g.nama}`)}
                    onEdit={() => showToast('info', 'Edit Pengajar', `Edit ${g.nama}`)}
                    onPenempatan={() => showToast('info', 'Penempatan Mengajar', `Penempatan mengajar & jadwal ${g.nama}`)}
                    onToggleStatus={() => handleToggleStatus(g.id, g.nama)}
                    statusActive={g.status !== 'NON_AKTIF'}
                    onDelete={() => {
                      setGuruList((prev) => prev.filter((item) => item.id !== g.id));
                      showToast('success', 'Soft Delete', `Data pengajar ${g.nama} dipindahkan ke Recycle Bin.`);
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
