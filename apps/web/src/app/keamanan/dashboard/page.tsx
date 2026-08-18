'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import MobileBottomNav from '@/components/MobileBottomNav';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import { getLocalCache, setLocalCache } from '@/lib/cache-storage';
import { Shield, LogOut, Search, QrCode, ArrowUpRight, ArrowDownLeft, CheckCircle2, AlertTriangle, UserCheck, Settings } from 'lucide-react';

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

  const [user, setUser] = useState({ nama: 'Tim Keamanan & Perizinan', role: 'KEAMANAN', email: 'keamanan@darsa.id' });
  const [qrInput, setQrInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('beranda');

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedIzin, setSelectedIzin] = useState<PerizinanItem | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'scan') {
      setIsScanModalOpen(true);
    } else if (tab === 'profil') {
      setIsSettingsOpen(true);
    } else if (tab === 'perizinan') {
      const el = document.getElementById('perizinan');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'status') {
      const el = document.getElementById('status');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h === '#profil') {
        setIsSettingsOpen(true);
        setActiveTab('profil');
      } else if (h === '#scan' || h === '#qr') {
        setIsScanModalOpen(true);
        setActiveTab('scan');
      } else if (h) {
        const target = document.querySelector(h);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  const [perizinanList, setPerizinanList] = useState<PerizinanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerizinanLive() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/perizinan');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped = json.data.map((item: any) => ({
              id: item.id,
              santri_nama: item.santri?.nama_lengkap || 'Santri Pondok',
              kelas: item.santri?.kelas?.nama_kelas || 'Kelas Pondok',
              jenis: (item.jenis as any) || 'PULANG',
              alasan: item.alasan || 'Keperluan Santri',
              tanggal_keluar: item.tanggal_mulai ? new Date(item.tanggal_mulai).toISOString().split('T')[0] : '2026-08-01',
              tanggal_kembali: item.tanggal_selesai ? new Date(item.tanggal_selesai).toISOString().split('T')[0] : '2026-08-03',
              status: (item.status as any) || 'DISETUJUI',
            }));
            setPerizinanList(mapped);
          }
        }
      } catch (e) {
        console.error('Gagal memuat perizinan live:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchPerizinanLive();
  }, []);

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
              email: data.user.email || 'keamanan@darsa.id',
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
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 md:pb-8 font-sans">
      {/* Header Bar Keamanan */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 md:p-6 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] md:text-[10px] font-black text-amber-400 uppercase tracking-widest block truncate">
                PORTAL KEAMANAN & KETERTIBAN PONDOK
              </span>
              <h1 className="text-sm md:text-lg font-black text-white leading-tight truncate">{user.nama}</h1>
              <p className="text-[11px] md:text-xs text-slate-400 font-medium truncate">Ma'had Darussa'adah Lirboyo Kota Kediri</p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all shrink-0 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-slate-800/80 p-3.5 md:p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[9px] md:text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
              PERIZINAN HARI INI
            </span>
            <span className="text-xl md:text-2xl font-black text-white">{perizinanList.length}</span>
            <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Disetujui Pengasuh/Sekretariat</p>
          </div>
          <div className="bg-slate-800/80 p-3.5 md:p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[9px] md:text-[10px] font-extrabold text-teal-400 uppercase tracking-wider block mb-1">
              SANTRI DI LUAR PONDOK
            </span>
            <span className="text-xl md:text-2xl font-black text-teal-300">
              {perizinanList.filter((p) => p.status === 'TAP_OUT').length}
            </span>
            <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Status Tap Out Gerbang</p>
          </div>
          <div className="bg-slate-800/80 p-3.5 md:p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[9px] md:text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
              SANTRI KEMBALI TEPAT WAKTU
            </span>
            <span className="text-xl md:text-2xl font-black text-emerald-300">
              {perizinanList.filter((p) => p.status === 'TAP_IN').length}
            </span>
            <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Status Tap In Gerbang</p>
          </div>
          <div className="bg-slate-800/80 p-3.5 md:p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <span className="text-[9px] md:text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block mb-1">
              DISIPLIN & PELANGGARAN
            </span>
            <span className="text-xl md:text-2xl font-black text-rose-400">0</span>
            <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Laporan Pelanggaran Hari Ini</p>
          </div>
        </div>

        {/* QR Code & Kode Izin Scanner Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-800 to-teal-950 p-4 md:p-6 rounded-3xl border border-emerald-800/50 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                VALIDASI SURAT IZIN GERBANG
              </span>
              <h2 className="text-sm md:text-base font-black text-white">Scan QR Surat Izin / Input Kode Perizinan</h2>
            </div>
            <span className="text-[11px] text-slate-300 font-mono bg-slate-900/60 px-3 py-1 rounded-xl border border-slate-700 self-start md:self-auto">
              Gerbang Utama Pos Keamanan
            </span>
          </div>

          <form onSubmit={handleVerifyPass} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Ketik Kode Izin (IZIN-2026-001) atau Nama..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 inline-flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Verifikasi</span>
            </button>
          </form>
        </div>

        {/* Perizinan Table & Card Stack */}
        <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 shadow-xl space-y-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-black text-white">Daftar Surat Izin Aktif Santri</h3>
              <p className="text-xs text-slate-400 font-medium">Verifikasi Tap-Out (Keluar Gerbang) & Tap-In (Masuk Gerbang)</p>
            </div>
            <div className="w-full sm:w-auto relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari santri..."
                className="w-full sm:w-48 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Mobile View: Card Stack */}
          <div className="space-y-3 md:hidden">
            {filteredList.map((item) => (
              <div key={item.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 block font-bold">{item.id}</span>
                    <h4 className="font-bold text-white text-sm">{item.santri_nama}</h4>
                    <p className="text-xs text-slate-400">{item.kelas}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      item.status === 'DISETUJUI'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : item.status === 'TAP_OUT'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-xl text-xs space-y-1 text-slate-300">
                  <p><strong className="text-slate-400">Jenis:</strong> {item.jenis}</p>
                  <p><strong className="text-slate-400">Alasan:</strong> {item.alasan}</p>
                  <p className="text-[11px] text-slate-400 font-mono">📅 {item.tanggal_keluar} s/d {item.tanggal_kembali}</p>
                </div>

                <div className="flex gap-2 pt-1">
                  {item.status === 'DISETUJUI' && (
                    <button
                      onClick={() => handleTapOut(item.id)}
                      className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all active:scale-95 inline-flex items-center justify-center gap-1"
                    >
                      <ArrowUpRight className="w-4 h-4" /> Tap Out (Keluar)
                    </button>
                  )}
                  {item.status === 'TAP_OUT' && (
                    <button
                      onClick={() => handleTapIn(item.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95 inline-flex items-center justify-center gap-1"
                    >
                      <ArrowDownLeft className="w-4 h-4" /> Tap In (Kembali)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block bg-slate-900 rounded-2xl border border-slate-700/80 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">ID & Santri</th>
                  <th className="p-3.5">Jenis & Alasan</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi Gerbang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50">
                    <td className="p-3.5">
                      <span className="font-mono text-[10px] text-amber-400 block font-bold">{item.id}</span>
                      <span className="font-bold text-white text-sm block">{item.santri_nama}</span>
                      <span className="text-xs text-slate-400">{item.kelas}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-200 block">{item.jenis}</span>
                      <span className="text-xs text-slate-400">{item.alasan}</span>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-slate-300">
                      {item.tanggal_keluar} s/d {item.tanggal_kembali}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          item.status === 'DISETUJUI'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : item.status === 'TAP_OUT'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {item.status === 'DISETUJUI' && (
                        <button
                          onClick={() => handleTapOut(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all active:scale-95"
                        >
                          Tap Out
                        </button>
                      )}
                      {item.status === 'TAP_OUT' && (
                        <button
                          onClick={() => handleTapIn(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95"
                        >
                          Tap In
                        </button>
                      )}
                      {item.status === 'TAP_IN' && (
                        <span className="text-xs text-slate-500 font-bold">✓ Selesai</span>
                      )}
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

      <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />
      <MobileBottomNav role="KEAMANAN" activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

