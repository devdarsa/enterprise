'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';
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

const INITIAL_ALUMNI: Alumni[] = [
  { id: '1', nisp: 'PNDK-2022001', nama: 'Ust. Moh. Hilmi Mubarak', tahunLulus: 2024, jenjangTerakhir: 'Aliyah Diniyah', statusAlumni: 'KHIDMAH', lokasiKhidmah: 'Pondok Cabang Kediri', telepon: '081233445566' },
  { id: '2', nisp: 'PNDK-2022002', nama: 'Ahmad Zaenuri, S.Pd', tahunLulus: 2023, jenjangTerakhir: 'Tsanawiyyah', statusAlumni: 'KULIAH', lokasiKhidmah: 'UIN Sunan Ampel', telepon: '085788990011' },
  { id: '3', nisp: 'PNDK-2022003', nama: 'Fathur Rahman', tahunLulus: 2025, jenjangTerakhir: 'Aliyah Diniyah', statusAlumni: 'WIRAUSAHA', telepon: '081900112233' },
];

export default function DataAlumniPage() {
  const [alumniList, setAlumniList] = useState<Alumni[]>(INITIAL_ALUMNI);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const filtered = alumniList.filter(
    (a) => a.nama.toLowerCase().includes(search.toLowerCase()) || a.nisp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            DATABASE PONDOK
          </span>
          <h1 className="text-xl font-black text-slate-900">Data Alumni & Riwayat Kelulusan</h1>
          <p className="text-xs text-slate-500 font-medium">
            Master Arsip Data Kelulusan Santri, Status Khidmah, & Riwayat Pendidikan
          </p>
        </div>

        <ImportExportToolbar
          onAdd={() => showToast('info', 'Pendataan Alumni', 'Form alumni baru.')}
          addLabel="🎓 + Pendataan Alumni Baru"
          onExport={() => showToast('info', 'Export Data', 'Mengeksport data alumni.')}
          onPrint={() => showToast('info', 'Cetak Data', 'Mencetak direktori alumni.')}
        />
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari nama alumni atau NISP stambuk..." />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr>
              <th>NISP Stambuk</th>
              <th>Nama Alumni</th>
              <th>Tahun Lulus</th>
              <th>Jenjang Terakhir</th>
              <th>Status Alumni</th>
              <th>Catatan / Lokasi</th>
              <th className="text-right">Aksi Standards (RBAC)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/80">
                <td className="font-mono text-xs font-bold text-emerald-800">{a.nisp}</td>
                <td className="font-bold text-slate-900">{a.nama}</td>
                <td className="font-bold text-slate-700">{a.tahunLulus}</td>
                <td className="text-xs text-slate-600 font-medium">{a.jenjangTerakhir}</td>
                <td>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-extrabold text-[10px] border border-amber-200">
                    {a.statusAlumni}
                  </span>
                </td>
                <td className="text-xs text-slate-500">{a.lokasiKhidmah || '-'}</td>
                <td className="text-right">
                  <TableActions
                    onDetail={() => showToast('info', 'Detail Alumni', `Detail ${a.nama}`)}
                    onEdit={() => showToast('info', 'Edit Alumni', `Edit ${a.nama}`)}
                    onArsip={() => showToast('info', 'Arsip Alumni', `Arsip ${a.nama}`)}
                    onDelete={() => {
                      setAlumniList((prev) => prev.filter((item) => item.id !== a.id));
                      showToast('success', 'Soft Delete', `Data alumni ${a.nama} dipindahkan ke Recycle Bin.`);
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
