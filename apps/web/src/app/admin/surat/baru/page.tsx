'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function GeneratorSuratPage() {
  const [nomor, setNomor] = useState(() => `SRT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Date.now().toString().slice(-4)}`);
  const [santri, setSantri] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [instansi, setInstansi] = useState<'PONDOK' | 'MADRASAH' | 'MI'>('PONDOK');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomor_surat: nomor || `SRT-${Date.now()}`,
          jenis_surat: 'SURAT_IZIN_SANTRI',
          perihal: keperluan,
          pengirim: santri ? `Wali Santri ${santri}` : 'Wali Santri',
          penerima: 'Pengasuh Pondok',
        }),
      });

      const json = await res.json();
      setLoading(false);
      if (json.success) {
        setMessage(`✅ Surat berhasil diterbitkan! Nomor: ${nomor}`);
        setTimeout(() => {
          window.location.href = '/admin/surat';
        }, 1500);
      } else {
        setMessage(json.error || 'Gagal menerbitkan surat.');
      }
    } catch (err) {
      setLoading(false);
      setMessage('Gagal terhubung ke database.');
    }
  };


  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        icon="✍️"
        title="Generator Surat Izin Santri"
        subtitle="Penerbitan surat perizinan resmi dan penyimpanan ke Database Server"
        badge="PERSURATAN DIGITAL"
        secondaryAction={{ label: '← Kembali ke Persuratan', onClick: () => window.location.href = '/admin/surat', icon: '🔙' }}
      />

      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm">
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Surat Resmi</label>
            <input
              type="text"
              required
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Santri Yang Diberi Izin</label>
            <input
              type="text"
              required
              value={santri}
              onChange={(e) => setSantri(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Instansi</label>
            <select
              value={instansi}
              onChange={(e) => setInstansi(e.target.value as 'PONDOK' | 'MADRASAH' | 'MI')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            >
              <option value="PONDOK">Instansi Pondok Pesantren</option>
              <option value="MADRASAH">Instansi Madrasah Diniyah</option>
              <option value="MI">Instansi Madrasah / MI</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alasan / Keperluan Izin</label>
            <input
              type="text"
              required
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Menyimpan Surat ke Database Lokal...' : 'Terbitkan & Simpan Surat ke Database Lokal'}
          </button>
        </form>
      </div>
    </div>
  );
}
