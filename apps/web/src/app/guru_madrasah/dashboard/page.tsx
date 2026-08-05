'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';
import MobileBottomNav from '@/components/MobileBottomNav';

interface SetoranItem {
  id: string;
  santri_nama: string;
  kelas: string;
  juz: number;
  surah: string;
  nilai: number;
  tanggal: string;
  ustadz: string;
}

export default function GuruMadrasahDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [activeTab, setActiveTab] = useState<'mustahiq' | 'munawwib'>('mustahiq');
  const [user, setUser] = useState({ nama: 'Dr. KH. Abdullah Ridwan', role: 'GURU_MADRASAH', instansi: 'MADRASAH' });

  // Mustahiq (Wali Kelas) Data State
  const [santriKelas, setSantriKelas] = useState([
    { id: '1', nisn: '0012345678', nama: 'Muhammad Raihan', status: 'HADIR', hafalan: 'Juz 15', catatan: 'Bagus & Lancar' },
    { id: '2', nisn: '0012345679', nama: 'Ahmad Fauzi', status: 'HADIR', hafalan: 'Juz 12', catatan: 'Perlu Tartil' },
    { id: '3', nisn: '0012345680', nama: 'Zaidan Al-Khair', status: 'TERLAMBAT', hafalan: 'Juz 10', catatan: 'Izin Umat' },
    { id: '4', nisn: '0012345681', nama: 'Bilal Ramadan', status: 'HADIR', hafalan: 'Juz 18', catatan: 'Lancar Jaya' },
  ]);

  // Munawwib (Guru Mapel) Form & Setoran State
  const [setoranList, setSetoranList] = useState<SetoranItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    santri_nama: '',
    kelas: '10-A (Tahfidz & Diniyah)',
    mapel: 'Fiqih Fathul Qarib',
    juz: '15',
    surah: 'Al-Baqarah 1-50',
    nilai: '90',
  });

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setUser(prev => ({ ...prev, nama: s.nama || prev.nama }));
      }
    } catch {}
  }, []);

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setIsScanModalOpen(false);
      showToast('success', 'Presensi Guru Berhasil!', 'Scan QR Code kehadiran Ustadz/Guru Diniyah terverifikasi dalam radius Geofencing.');
    }, 1500);
  };

  const handleSaveNilai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.santri_nama.trim() || !form.surah.trim()) {
      showToast('warning', 'Form Belum Lengkap', 'Nama santri dan materi/surah wajib diisi.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsModalOpen(false);
      const newSetoran: SetoranItem = {
        id: Date.now().toString(),
        santri_nama: form.santri_nama.trim(),
        kelas: form.kelas,
        juz: parseInt(form.juz) || 1,
        surah: form.surah.trim(),
        nilai: parseInt(form.nilai) || 85,
        tanggal: 'Hari Ini',
        ustadz: user.nama,
      };
      setSetoranList([newSetoran, ...setoranList]);
      showToast('success', 'Nilai & Absensi Mapel Tersimpan', `Penilaian untuk ${form.santri_nama} berhasil diinput.`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header Profile Card */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white border border-emerald-700 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-[3px] border-amber-400 overflow-hidden shadow-xl shrink-0">
              <Image src="/logo-madrasah.png" alt="Logo Madrasah Diniyah" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">
                PORTAL GURU MADRASAH DINIYAH
              </span>
              <h1 className="text-xl font-black text-white">{user.nama}</h1>
              <p className="text-xs text-emerald-200 font-medium mt-0.5">
                Madrasah Diniyah Darussa’adah Lirboyo Kota Kediri
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-black shadow-md transition-all flex items-center gap-1.5"
            >
              <span>📱</span> Scan QR
            </button>
            <Link href="/login" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all">
              Keluar
            </Link>
          </div>
        </div>
      </div>

      {/* Role Navigation Mode Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab('mustahiq')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'mustahiq'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🕌</span> Mode Mustahiq (Wali Kelas 10-A Diniyah)
        </button>
        <button
          onClick={() => setActiveTab('munawwib')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'munawwib'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>📖</span> Mode Munawwib (Guru Mata Pelajaran)
        </button>
      </div>

      {/* Mustahiq (Wali Kelas) View */}
      {activeTab === 'mustahiq' && (
        <div id="presensi" className="space-y-5 scroll-mt-6">
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                Tugas Mustahiq Kelas
              </span>
              <h2 className="text-base font-black text-slate-900">Kelas 10-A (Ula & Wustho Diniyah)</h2>
              <p className="text-xs text-slate-600 mt-0.5">Total Santri Binaan: 32 Santri • Wali Kelas: {user.nama}</p>
            </div>
            <button
              onClick={() => showToast('info', 'Rekap Presensi Presisi', 'Rekap absensi bulanan kelas 10-A berhasil diperbarui.')}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all shrink-0"
            >
              📋 Generate Rekap Presensi Kelas
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Daftar Presensi & Catatan Santri Kelas</h3>
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>NISN</th>
                    <th>Nama Santri</th>
                    <th>Status Presensi</th>
                    <th>Hafalan/Progres</th>
                    <th>Catatan Mustahiq</th>
                  </tr>
                </thead>
                <tbody>
                  {santriKelas.map((s) => (
                    <tr key={s.id}>
                      <td className="font-mono text-xs font-bold text-slate-600">{s.nisn}</td>
                      <td className="font-bold text-slate-900">{s.nama}</td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          s.status === 'HADIR' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="text-xs font-semibold text-emerald-700">{s.hafalan}</td>
                      <td className="text-xs text-slate-500">{s.catatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Munawwib (Guru Mapel) View */}
      {activeTab === 'munawwib' && (
        <div id="nilai" className="space-y-5 scroll-mt-6">
          <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                Tugas Munawwib (Guru Mapel)
              </span>
              <h2 className="text-base font-black text-slate-900">Input Nilai & Absensi Mata Pelajaran</h2>
              <p className="text-xs text-slate-600 mt-0.5">Mengampu Mapel: Fiqih, Nahwu Sharf, & Tahfidz (Multi-Kelas)</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-all shrink-0"
            >
              + Input Nilai / Absensi Mapel
            </button>
          </div>

          <div id="jadwal" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 scroll-mt-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Jadwal Mengajar Mapel Munawwib</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">Senin, 07.30 - 09.00</span>
                <h4 className="text-sm font-black text-slate-900 mt-2">Fiqih Fathul Qarib</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Kelas 10-A • Ruang Diniyah Ula 3</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded uppercase">Selasa, 09.30 - 11.00</span>
                <h4 className="text-sm font-black text-slate-900 mt-2">Nahwu Alfiyyah Ibn Malik</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Kelas 11-B • Ruang Diniyah Wustho 1</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Input Nilai Mapel Munawwib */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Nilai / Absensi Mapel Munawwib"
      >
        <form onSubmit={handleSaveNilai} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
            <select
              value={form.mapel}
              onChange={(e) => setForm({ ...form, mapel: e.target.value })}
              className="input-premium"
            >
              <option value="Fiqih Fathul Qarib">Fiqih Fathul Qarib</option>
              <option value="Nahwu Alfiyyah">Nahwu Alfiyyah</option>
              <option value="Tahfidz Al-Qur'an">Tahfidz Al-Qur'an</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Santri</label>
            <input
              type="text"
              required
              placeholder="Contoh: Muhammad Raihan"
              value={form.santri_nama}
              onChange={(e) => setForm({ ...form, santri_nama: e.target.value })}
              className="input-premium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Materi / Surah</label>
              <input
                type="text"
                required
                placeholder="Bab Thaharah / Surah X"
                value={form.surah}
                onChange={(e) => setForm({ ...form, surah: e.target.value })}
                className="input-premium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nilai (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.nilai}
                onChange={(e) => setForm({ ...form, nilai: e.target.value })}
                className="input-premium"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
          >
            {submitting ? 'Simpan Data...' : 'Simpan Penilaian Munawwib'}
          </button>
        </form>
      </Modal>

      {/* Modal Scanner QR Code Presensi Guru */}
      <Modal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Pemindai QR Code Presensi Guru Diniyah"
      >
        <div id="scan" className="text-center py-6 space-y-4">
          <div className="w-48 h-48 mx-auto border-4 border-dashed border-emerald-500 rounded-3xl flex items-center justify-center bg-slate-900/5 relative overflow-hidden">
            {scanning ? (
              <div className="animate-spin text-4xl">⏳</div>
            ) : (
              <div className="space-y-2">
                <span className="text-5xl block animate-pulse">📷</span>
                <span className="text-[11px] text-slate-500 font-bold block">Arahkan ke Display QR Code</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Memverifikasi lokasi GPS Geofencing dan TOTP token kehadiran Guru Diniyah Lirboyo Kediri.
          </p>
          <button
            onClick={handleSimulateScan}
            disabled={scanning}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
          >
            {scanning ? 'Memverifikasi Presensi...' : 'Simulasi Scan QR Presensi'}
          </button>
        </div>
      </Modal>

      <MobileBottomNav role="GURU_MADRASAH" />
    </div>
  );
}
