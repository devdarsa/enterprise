'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TarikDataSantriPage() {
  const [targetInstansi, setTargetInstansi] = useState('Madrasah Diniyah');
  const [selectedSantri, setSelectedSantri] = useState<string[]>(['0012345678', '0012345679']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const availablePondokSantri = [
    { nisn: '0012345678', nama: 'Muhammad Raihan', kelas_pondok: 'Pesantren 10-A', status_pondok: 'AKTIF_TERDAFTAR' },
    { nisn: '0012345679', nama: 'Ahmad Fauzi', kelas_pondok: 'Pesantren 10-A', status_pondok: 'AKTIF_TERDAFTAR' },
    { nisn: '0012345680', nama: 'Siti Aminah', kelas_pondok: 'Pesantren 11-B', status_pondok: 'AKTIF_TERDAFTAR' },
    { nisn: '0012345681', nama: 'Fajar Hidayat', kelas_pondok: 'Pesantren 12-C', status_pondok: 'AKTIF_TERDAFTAR' },
  ];

  const handleToggleSelect = (nisn: string) => {
    if (selectedSantri.includes(nisn)) {
      setSelectedSantri(selectedSantri.filter((id) => id !== nisn));
    } else {
      setSelectedSantri([...selectedSantri, nisn]);
    }
  };

  const handleExecutePull = async () => {
    if (selectedSantri.length === 0) {
      alert('Pilih minimal 1 santri untuk ditarik!');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/santri/pull-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetInstansi,
          santriIds: selectedSantri,
        }),
      });

      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setMessage(data.message);
        setTimeout(() => {
          window.location.href = '/admin/santri';
        }, 2000);
      }
    } catch (err) {
      setLoading(false);
      setMessage('Gagal menarik data santri.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">📥 Penarikan Data Santri (Sinkronisasi)</h1>
          <p className="text-xs text-slate-500">
            Penarikan data Santri dari Pondok Pesantren (Source of Truth) ke {targetInstansi}
          </p>
        </div>
        <Link
          href="/admin/santri"
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
        >
          ← Kembali ke Tabel Santri
        </Link>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
        <span className="font-bold block">📌 Aturan Penarikan Data Santri:</span>
        <p>
          Sesuai aturan bisnis Darsa Enterprise, data Santri **TIDAK BISA** dibuat secara manual di Madrasah Diniyah atau MI. Seluruh data Santri wajib berasal dari proses penarikan/sinkronisasi dari **Pondok Pesantren Darussa'adah**.
        </p>
      </div>

      {/* Target Selector Card */}
      <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-700 block mb-1">Target Instansi Penerima:</span>
          <select
            value={targetInstansi}
            onChange={(e) => setTargetInstansi(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-emerald-900 font-bold focus:outline-none"
          >
            <option value="Madrasah Diniyah">Madrasah Diniyah Darussa'adah</option>
            <option value="Madrasah Ibtida'iyyah (MI)">Madrasah Ibtida'iyyah (MI) Darussa'adah</option>
          </select>
        </div>
        <div className="text-right">
          <span className="text-slate-500 font-semibold block">Santri Terpilih:</span>
          <span className="text-lg font-black text-emerald-800">{selectedSantri.length} Santri</span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
          {message}
        </div>
      )}

      {/* List of Available Pondok Santri to Pull */}
      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Daftar Santri Pondok Pesantren yang Siap Ditarik:</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="p-3 text-center">Pilih</th>
                <th className="p-3">NISN</th>
                <th className="p-3">Nama Santri</th>
                <th className="p-3">Kelas Pondok</th>
                <th className="p-3">Status Pondok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {availablePondokSantri.map((santri) => {
                const isChecked = selectedSantri.includes(santri.nisn);
                return (
                  <tr key={santri.nisn} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(santri.nisn)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-800">{santri.nisn}</td>
                    <td className="p-3 font-bold text-slate-900">{santri.nama}</td>
                    <td className="p-3 text-slate-600">{santri.kelas_pondok}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {santri.status_pondok}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleExecutePull}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all disabled:opacity-50 mt-4"
        >
          {loading ? 'Memproses Penarikan Data...' : `Eksekusi Penarikan (${selectedSantri.length} Santri) ke ${targetInstansi}`}
        </button>
      </div>
    </div>
  );
}
