'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function TambahGuruPage() {
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [tugas, setTugas] = useState('');
  const [telepon, setTelepon] = useState('');
  const [instansi, setInstansi] = useState<'PONDOK' | 'MADRASAH' | 'MI'>('PONDOK');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setMessage('Nama Guru wajib diisi.');
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      // Pertama, buat user baru terlebih dahulu
      const userRes = await fetch('/api/v1/akun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${(nip || nama).toLowerCase().replace(/\s+/g, '.')}@darsa.guru.id`,
          nama_lengkap: nama.trim(),
          role: instansi === 'MI' ? 'GURU_MI' : 'GURU_MADRASAH',
          password: 'DarsaGuru2026!',
        }),
      });
      const userJson = await userRes.json();

      if (!userJson.success) {
        setMessage(userJson.error || 'Gagal membuat akun user untuk guru.');
        setLoading(false);
        return;
      }

      // Kemudian buat profil guru
      const guruRes = await fetch('/api/v1/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userJson.data.id,
          nama_lengkap: nama.trim(),
          nip: nip.trim() || undefined,
          telepon: telepon.trim() || undefined,
        }),
      });

      const guruJson = await guruRes.json();
      setLoading(false);
      if (guruJson.success) {
        setMessage(`✅ Guru ${nama} berhasil didaftarkan. Akun: ${userJson.data.email} | Password: DarsaGuru2026!`);
        setTimeout(() => {
          window.location.href = '/admin/guru';
        }, 2000);
      } else {
        setMessage(guruJson.error || 'Gagal menyimpan data guru.');
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
        icon="👨‍🏫"
        title="Registrasi Pengajar Baru"
        subtitle="Pendaftaran Tenaga Pengajar, Dewan Mustahiq Diniyah, Munawwib, & Guru MI Formal"
        badge="DATABASE PONDOK"
        secondaryAction={{ label: '← Kembali ke Data Pengajar', onClick: () => window.location.href = '/admin/guru', icon: '🔙' }}
      />

      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm">
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Induk Pegawai / Guru (NIP)</label>
            <input
              type="text"
              required
              placeholder="198501012010011001"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar Guru/Ustadz</label>
            <input
              type="text"
              required
              placeholder="Dr. KH. Abdullah Ridwan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
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
            <label className="block font-bold text-slate-700 mb-1">Bidang Tugas & Pengampu Mapel</label>
            <input
              type="text"
              required
              placeholder="Pengasuh & Ustadz Hadits Diniyah"
              value={tugas}
              onChange={(e) => setTugas(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp Aktif</label>
            <input
              type="text"
              required
              placeholder="081234567890"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Upload Foto Profil Guru (File)</label>
            <div className="flex items-center gap-3">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Preview Foto Guru" className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600 shadow-sm shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-lg shrink-0">👨‍🏫</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setFotoUrl(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Menyimpan ke Database Lokal...' : 'Simpan Data Guru ke Database Lokal'}
          </button>
        </form>
      </div>
    </div>
  );
}
