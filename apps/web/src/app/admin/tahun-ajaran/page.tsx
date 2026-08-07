'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { TableActions, ImportExportToolbar } from '@/components/TableActions';

interface TahunAjaran {
  id: string;
  nama: string;
  semester: 'Ganjil' | 'Genap';
  status: 'AKTIF' | 'NON_AKTIF';
  tglMulai: string;
  tglSelesai: string;
}

export default function TahunAjaranPage() {
  const [list, setList] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    async function fetchTahunAjaranLive() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/tahun-ajaran');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped = json.data.map((t: any) => ({
              id: t.id,
              nama: t.nama,
              semester: t.semester as 'Ganjil' | 'Genap',
              status: t.is_aktif ? 'AKTIF' : 'NON_AKTIF',
              tglMulai: t.tanggal_mulai ? new Date(t.tanggal_mulai).toLocaleDateString('id-ID') : '-',
              tglSelesai: t.tanggal_akhir ? new Date(t.tanggal_akhir).toLocaleDateString('id-ID') : '-',
            }));
            setList(mapped);
          }
        }
      } catch (e) {
        console.error('Gagal memuat tahun ajaran live:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchTahunAjaranLive();
  }, []);

  const handleSetAktif = async (id: string) => {
    try {
      const res = await fetch('/api/v1/tahun-ajaran', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        setList((prev) =>
          prev.map((item) => ({
            ...item,
            status: item.id === id ? 'AKTIF' : 'NON_AKTIF',
          }))
        );
        showToast('success', 'Tahun Ajaran Diperbarui', 'Tahun ajaran aktif sistem telah diubah.');
      } else {
        showToast('error', 'Gagal Mengubah', json.error);
      }
    } catch {
      showToast('error', 'Gagal Mengubah', 'Terjadi kesalahan jaringan.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS
          </span>
          <h1 className="text-xl font-black text-slate-900">Manajemen Tahun Ajaran & Semester</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pengaturan Periode Akademik Aktif Seluruh Unit Pesantren (Pondok, Madrasah Diniyyah, & MI Formal)
          </p>
        </div>
        <ImportExportToolbar addLabel="Tambah Tahun Ajaran" />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">Memuat tahun ajaran dari database...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Tahun Ajaran</th>
                  <th className="p-3.5">Semester</th>
                  <th className="p-3.5">Tanggal Mulai</th>
                  <th className="p-3.5">Tanggal Selesai</th>
                  <th className="p-3.5">Status Sistem</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {list.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-black text-slate-900 text-sm">{item.nama}</td>
                    <td className="p-3.5 font-bold text-slate-700">{item.semester}</td>
                    <td className="p-3.5 text-slate-600">{item.tglMulai}</td>
                    <td className="p-3.5 text-slate-600">{item.tglSelesai}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                          item.status === 'AKTIF'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {item.status !== 'AKTIF' && (
                        <button
                          type="button"
                          onClick={() => handleSetAktif(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] shadow-sm transition-all"
                        >
                          Set Aktif
                        </button>
                      )}
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
