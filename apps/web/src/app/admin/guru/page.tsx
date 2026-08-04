'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { LoadingSpinner, SkeletonTable } from '@/components/Loading';

interface Guru {
  id: string;
  nip: string;
  nama: string;
  tugas: string;
  telepon: string;
  instansi: string;
}

export default function MasterGuruPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State inside Modal
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [tugas, setTugas] = useState('');
  const [telepon, setTelepon] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        if (s.instansi) {
          const inst = s.instansi.toLowerCase() as 'pondok' | 'madrasah' | 'mi';
          if (['pondok', 'madrasah', 'mi'].includes(inst)) {
            setInstansiFilter(inst);
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchGuru();
  }, [instansiFilter]);

  const fetchGuru = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=guru&instansi=${instansiFilter.toUpperCase()}`);
      const json = await res.json();
      setLoading(false);
      if (json.success) {
        setGuruList(json.data);
      }
    } catch (err) {
      setLoading(false);
      showToast('error', 'Gagal Memuat Data', 'Terjadi kesalahan koneksi database lokal.');
    }
  };

  const handleAddGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_guru',
          payload: {
            nip,
            nama,
            tugas,
            telepon,
            instansi: instansiFilter.toUpperCase(),
            tahun_ajaran: '2025/2026 (Ganjil)',
          },
        }),
      });

      const json = await res.json();
      setSubmitting(false);
      if (json.success) {
        showToast('success', 'Data Guru/Ustadz Disimpan', `Ustadz ${nama} telah terdaftar.`);
        fetchGuru();
        setIsModalOpen(false);
        setNip('');
        setNama('');
        setTugas('');
        setTelepon('');
      }
    } catch (err) {
      setSubmitting(false);
      showToast('error', 'Gagal Menyimpan Guru', 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Master Data Guru & Ustadz</h1>
          <p className="text-xs text-slate-500">
            Kelola data dewan guru, NIP, dan pengampu mata pelajaran dari Database Lokal per Instansi
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all inline-block"
        >
          + Tambah Data Guru (Pop-Up Modal)
        </button>
      </div>



      {/* Table Card */}
      <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-8">
            <LoadingSpinner label="Mengunduh Data Guru dari Database Lokal..." />
            <SkeletonTable rows={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                  <th className="p-3">NIP</th>
                  <th className="p-3">Nama Lengkap Guru / Ustadz</th>
                  <th className="p-3">Bidang Tugas</th>
                  <th className="p-3">No. Telepon / WA</th>
                  <th className="p-3">Instansi</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guruList.map((guru, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-emerald-800 font-bold">{guru.nip}</td>
                    <td className="p-3 font-bold text-slate-900">{guru.nama}</td>
                    <td className="p-3 text-slate-600 font-medium">{guru.tugas}</td>
                    <td className="p-3 font-mono text-slate-600">{guru.telepon}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {guru.instansi}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button className="text-slate-500 hover:text-emerald-700 font-bold">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Premium Pop-Up Modal Form Input */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrasi Guru Baru"
        subtitle={`Instansi ${instansiFilter.toUpperCase()} • Lirboyo Kota Kediri`}
        icon="👨‍🏫"
      >
        <form onSubmit={handleAddGuru} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">NIP / ID Guru</label>
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
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
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
            <label className="block font-bold text-slate-700 mb-1">No. Telepon / WhatsApp Aktif</label>
            <input
              type="text"
              required
              placeholder="081234567890"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Simpan Data Guru'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
