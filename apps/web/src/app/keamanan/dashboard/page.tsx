'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import MobileBottomNav from '@/components/MobileBottomNav';
import { getLocalCache, setLocalCache } from '@/lib/cache-storage';

interface PerizinanItem {
  id: string;
  santri_nama: string;
  kelas: string;
  jenis: 'PULANG' | 'KELUAR_KOMPLEK';
  alasan: string;
  tanggal_keluar: string;
  tanggal_kembali: string;
  status: 'DISETUJUI' | 'TAP_OUT' | 'TAP_IN' | 'TERLAMBAT';
}

export default function KeamananDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [user, setUser] = useState({ nama: 'Tim Keamanan & Perizinan', role: 'KEAMANAN' });
  const [qrInput, setQrInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [perizinanList, setPerizinanList] = useState<PerizinanItem[]>([
    {
      id: 'IZIN-2026-001',
      santri_nama: 'Ahmad Muzakki',
      kelas: '10-A (Diniyah)',
      jenis: 'PULANG',
      alasan: 'Keperluan Keluarga / Sakit',
      tanggal_keluar: '2026-08-06',
      tanggal_kembali: '2026-08-08',
      status: 'DISETUJUI',
    },
    {
      id: 'IZIN-2026-002',
      santri_nama: 'Muhammad Farhan',
      kelas: '11-B (Formal MI)',
      jenis: 'KELUAR_KOMPLEK',
      alasan: 'Beli Kitab & Alat Tulis',
      tanggal_keluar: '2026-08-07',
      tanggal_kembali: '2026-08-07',
      status: 'TAP_OUT',
    },
  ]);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedIzin, setSelectedIzin] = useState<PerizinanItem | null>(null);

  useEffect(() => {
    const cachedUser = getLocalCache<any>('keamanan_user_session');
    if (cachedUser) {
      setUser(cachedUser);
    }

    async function loadSession() {
      try {
        const res = await fetch('/api/auth/get-session');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const newUser = {
              nama: data.user.name || data.user.nama_lengkap || 'Tim Keamanan & Perizinan',
              role: data.user.role || 'KEAMANAN',
            };
            setUser(newUser);
            setLocalCache('keamanan_user_session', newUser);
          }
        }
      } catch (e) {
        console.error('Gagal memuat sesi keamanan:', e);
      }
    }
    loadSession();
  }, []);

  const handleVerifyPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    const found = perizinanList.find((p) => p.id.toLowerCase() === qrInput.trim().toLowerCase() || p.santri_nama.toLowerCase().includes(qrInput.trim().toLowerCase()));

    if (found) {
      setSelectedIzin(found);
      setIsScanModalOpen(true);
    } else {
      showToast('error', 'Surat Izin Tidak Ditemukan', `Kode Izin / Nama "${qrInput}" tidak terdaftar di database.`);
    }
  };

  const handleTapOut = (id: string) => {
    setPerizinanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'TAP_OUT' } : item))
    );
    setIsScanModalOpen(false);
    showToast('success', 'Verifikasi Tap Out Selesai', 'Santri dicatat telah keluar dari gerbang pondok.');
  };

  const handleTapIn = (id: string) => {
    setPerizinanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'TAP_IN' } : item))
    );
    setIsScanModalOpen(false);
    showToast('success', 'Verifikasi Tap In Selesai', 'Santri dicatat telah kembali ke asrama pondok.');
  };

  const filteredList = perizinanList.filter((item) =>
    item.santri_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 md:pb-8 font-sans">
      {/* Header Bar Keamanan */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 md:p-6 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-lg shrink-0">
              🛡️
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                PORTAL KEAMANAN & KETERTIBAN PONDOK
              </span>
              <h1 className="text-base md:text-lg font-black text-white leading-tight">{user.nama}</h1>
              <p className="text-xs text-slate-400 font-medium">Ma'had Darussa'adah Lirboyo Kota Kediri</p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all"
          >
            🚪 Keluar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
              PERIZINAN HARI INI
            </span>
            <span className="text-2xl font-black text-white">{perizinanList.length}</span>
            <p className="text-[11px] text-slate-400 mt-1">Disetujui Pengasuh/Sekretariat</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-wider block mb-1">
              SANTRI DI LUAR PONDOK
            </span>
            <span className="text-2xl font-black text-teal-300">
              {perizinanList.filter((p) => p.status === 'TAP_OUT').length}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Status Tap Out Gerbang</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
              SANTRI KEMBALI TEPAT WAKTU
            </span>
            <span className="text-2xl font-black text-emerald-300">
              {perizinanList.filter((p) => p.status === 'TAP_IN').length}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Status Tap In Gerbang</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block mb-1">
              DISIPLIN & PELANGGARAN
            </span>
            <span className="text-2xl font-black text-rose-400">0</span>
            <p className="text-[11px] text-slate-400 mt-1">Laporan Pelanggaran Hari Ini</p>
          </div>
        </div>

        {/* QR Code & Kode Izin Scanner Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-800 to-teal-950 p-6 rounded-3xl border border-emerald-800/50 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                VALIDASI SURAT IZIN GERBANG
              </span>
              <h2 className="text-base font-black text-white">Scan QR Surat Izin / Input Kode Perizinan</h2>
            </div>
            <span className="text-xs text-slate-300 font-mono bg-slate-900/60 px-3 py-1 rounded-xl border border-slate-700">
              Gerbang Utama Pos Keamanan
            </span>
          </div>

          <form onSubmit={handleVerifyPass} className="flex gap-3">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Ketik Kode Izin (Contoh: IZIN-2026-001) atau Nama Santri..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              🔍 Verifikasi
            </button>
          </form>
        </div>

        {/* Perizinan Table */}
        <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl space-y-4 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="text-sm font-black text-white">Daftar Surat Izin Aktif Santri</h3>
              <p className="text-xs text-slate-400 font-medium">Verifikasi Tap-Out (Keluar Gerbang) & Tap-In (Masuk Gerbang)</p>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri..."
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Kode & Santri</th>
                  <th className="p-3">Jenis Izin</th>
                  <th className="p-3">Jadwal Keluar/Kembali</th>
                  <th className="p-3">Status Pos Keamanan</th>
                  <th className="p-3 text-right">Aksi Gerbang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="p-3">
                      <span className="font-mono text-[10px] text-amber-400 font-bold block">{item.id}</span>
                      <span className="font-bold text-white block">{item.santri_nama}</span>
                      <span className="text-[10px] text-slate-400">{item.kelas}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 font-bold border border-teal-500/20 text-[10px]">
                        {item.jenis}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 text-[11px]">
                      <div>Keluar: {item.tanggal_keluar}</div>
                      <div>Kembali: {item.tanggal_kembali}</div>
                    </td>
                    <td className="p-3">
                      {item.status === 'DISETUJUI' && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          ⏳ Belum Keluar
                        </span>
                      )}
                      {item.status === 'TAP_OUT' && (
                        <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                          🚪 Di Luar Gerbang
                        </span>
                      )}
                      {item.status === 'TAP_IN' && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          ✅ Sudah Kembali
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleTapOut(item.id)}
                        disabled={item.status !== 'DISETUJUI'}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[11px] transition-all"
                      >
                        🚪 Tap Out
                      </button>
                      <button
                        onClick={() => handleTapIn(item.id)}
                        disabled={item.status !== 'TAP_OUT'}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[11px] transition-all"
                      >
                        ✅ Tap In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Verifikasi Scan QR */}
      <Modal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} title="Verifikasi Surat Izin Santri">
        {selectedIzin && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">DETAIL KODE PERIZINAN</span>
              <p className="text-base font-black text-amber-900">{selectedIzin.id}</p>
              <p className="text-xs font-bold text-slate-900">{selectedIzin.santri_nama} ({selectedIzin.kelas})</p>
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Jenis Perizinan:</span>
                <strong className="text-slate-900">{selectedIzin.jenis}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Alasan Izin:</span>
                <strong className="text-slate-900">{selectedIzin.alasan}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Batas Kembali:</span>
                <strong className="text-slate-900">{selectedIzin.tanggal_kembali}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleTapOut(selectedIzin.id)}
                className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold transition-all"
              >
                🚪 Verifikasi Tap Out
              </button>
              <button
                onClick={() => handleTapIn(selectedIzin.id)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all"
              >
                ✅ Verifikasi Tap In
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />
      <MobileBottomNav role="KEAMANAN" />
    </div>
  );
}
