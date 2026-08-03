'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TambahSantriPage() {
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [instansi, setInstansi] = useState<'PONDOK' | 'MADRASAH' | 'MI'>('PONDOK');
  const [kelas, setKelas] = useState('10-A (Tahfidz & Sains)');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_santri',
          payload: {
            nisn,
            nama,
            jenis_kelamin: jenisKelamin,
            kelas,
            instansi,
            tahun_ajaran: '2025/2026 (Ganjil)',
            status: 'AKTIF',
            hafalan_juz: 1,
          },
        }),
      });

      const json = await res.json();
      setLoading(false);
      if (json.success) {
        setMessage(json.message);
        setTimeout(() => {
          window.location.href = '/admin/santri';
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setMessage('Gagal menyimpan santri ke database lokal.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Registrasi Santri Baru</h1>
          <p className="text-xs text-slate-500">Pendaftaran biodata dan penambahan langsung ke Database Lokal</p>
        </div>
        <Link
          href="/admin/santri"
          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
        >
          ← Kembali ke Tabel
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm">
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Induk Santri Nasional (NISN)</label>
            <input
              type="text"
              required
              placeholder="0012345678"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Santri</label>
            <input
              type="text"
              required
              placeholder="Nama Lengkap Santri..."
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kelas & Rombel</label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
              >
                <option value="10-A (Tahfidz & Sains)">10-A (Tahfidz & Sains)</option>
                <option value="11-B (Sains)">11-B (Sains)</option>
                <option value="12-C (IPS)">12-C (IPS)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Menyimpan ke Database Lokal...' : 'Simpan Data Santri ke Database Lokal'}
          </button>
        </form>
      </div>
    </div>
  );
}
