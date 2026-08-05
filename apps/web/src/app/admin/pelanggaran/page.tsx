'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';
import { TableActions, ImportExportToolbar } from '@/components/TableActions';

interface Pelanggaran {
  id: string;
  tanggal: string;
  santriNama: string;
  nisp: string;
  jenis: string;
  tingkat: 'RINGAN' | 'SEDANG' | 'BERAT';
  tindakan: string;
  petugas: string;
}

const INITIAL_PELANGGARAN: Pelanggaran[] = [
  { id: '1', tanggal: '4 Agt 2026', santriNama: 'Ahmad Fauzi', nisp: 'PNDK-0012345679', jenis: 'Terlambat Berjamaah Subuh', tingkat: 'RINGAN', tindakan: 'Tazir Membaca Al-Qur\'an 1 Juz', petugas: 'Keamanan Asrama' },
  { id: '2', tanggal: '2 Agt 2026', santriNama: 'Muhammad Raihan', nisp: 'PNDK-0012345678', jenis: 'Membawa HP Tanpa Izin Sekretariat', tingkat: 'SEDANG', tindakan: 'Penyitaan HP 1 Bulan + Pengawasan', petugas: 'Ketua Keamanan Utama' },
];

export default function PelanggaranPage() {
  const [list, setList] = useState<Pelanggaran[]>(INITIAL_PELANGGARAN);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const filtered = list.filter(
    (p) => p.santriNama.toLowerCase().includes(search.toLowerCase()) || p.jenis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-widest block mb-1">
            MODUL KEAMANAN & KETERTIBAN
          </span>
          <h1 className="text-xl font-black text-slate-900">Kedisiplinan & Pelanggaran Santri</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pencatatan Jenis Pelanggaran, Tingkat Hukuman, & Riwayat Tindakan Takzir
          </p>
        </div>

        <ImportExportToolbar
          onAdd={() => showToast('warning', 'Pencatatan Pelanggaran', 'Form pencatatan pelanggaran baru.')}
          addLabel="⚠️ + Catat Pelanggaran Baru"
          onExport={() => showToast('info', 'Export Data', 'Mengeksport rekap pelanggaran.')}
          onPrint={() => showToast('info', 'Cetak Laporan', 'Mencetak laporan kedisiplinan.')}
        />
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari santri atau jenis pelanggaran..." />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nama Santri & Stambuk</th>
              <th>Jenis Pelanggaran</th>
              <th>Tingkat</th>
              <th>Tindakan / Takzir</th>
              <th>Petugas</th>
              <th className="text-right">Aksi Standards (RBAC)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80">
                <td className="text-xs text-slate-600 font-medium">{p.tanggal}</td>
                <td>
                  <div className="font-bold text-slate-900">{p.santriNama}</div>
                  <div className="text-[10px] font-mono text-emerald-800 font-bold">{p.nisp}</div>
                </td>
                <td className="text-xs font-semibold text-slate-800">{p.jenis}</td>
                <td>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black border ${
                    p.tingkat === 'RINGAN' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    p.tingkat === 'SEDANG' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                    'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {p.tingkat}
                  </span>
                </td>
                <td className="text-xs text-slate-700 font-medium">{p.tindakan}</td>
                <td className="text-xs text-slate-500">{p.petugas}</td>
                <td className="text-right">
                  <TableActions
                    onDetail={() => showToast('info', 'Detail Pelanggaran', `Detail ${p.santriNama}`)}
                    onEdit={() => showToast('info', 'Edit Pelanggaran', `Edit ${p.santriNama}`)}
                    onRiwayat={() => showToast('info', 'Riwayat Pelanggaran', `Riwayat ${p.santriNama}`)}
                    onDelete={() => {
                      setList((prev) => prev.filter((item) => item.id !== p.id));
                      showToast('success', 'Soft Delete', `Pelanggaran ${p.santriNama} dipindahkan ke Recycle Bin.`);
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
