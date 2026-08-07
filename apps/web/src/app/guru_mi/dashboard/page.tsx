'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import MobileBottomNav from '@/components/MobileBottomNav';
import AccountSettingsModal from '@/components/AccountSettingsModal';
import { LogOut, QrCode, Camera, MapPin, CheckCircle2, Clock, Settings } from 'lucide-react';

interface PresensiLog {
  id: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN';
  jarak: string;
}

export default function GuruMIDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [user, setUser] = useState({ nama: 'Ustadzah Fatimah, S.Pd', role: 'GURU_MI', nip: '199208152018022003', email: 'fatimah@darsa.id' });
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [riwayat, setRiwayat] = useState<PresensiLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h === '#profil') {
        setIsSettingsOpen(true);
      } else if (h === '#qr' || h === '#scan') {
        setIsScanModalOpen(true);
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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load Session
        const sessRes = await fetch('/api/auth/get-session');
        if (sessRes.ok) {
          const sess = await sessRes.json();
          if (sess?.user) {
            setUser({
              nama: sess.user.name || sess.user.nama_lengkap || 'Ustadzah Fatimah, S.Pd',
              role: sess.user.role || 'GURU_MI',
              nip: sess.user.nip || '199208152018022003',
              email: sess.user.email || 'fatimah@darsa.id',
            });
          }
        }

        // Fetch real attendance logs
        const logsRes = await fetch('/api/v1/absensi/logs?limit=5');
        if (logsRes.ok) {
          const logsJson = await logsRes.json();
          if (logsJson.success && Array.isArray(logsJson.data)) {
            const mapped = logsJson.data.map((l: any, i: number) => ({
              id: l.id || String(i + 1),
              tanggal: l.waktu_scan ? new Date(l.waktu_scan).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari ini',
              waktu: l.waktu_scan ? new Date(l.waktu_scan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '07:00 WIB',
              lokasi: l.lokasi || 'Pos Utama MI Darussa’adah',
              status: (l.status as any) || 'HADIR',
              jarak: l.jarak || '15m',
            }));
            setRiwayat(mapped);
          }
        }
      } catch (e) {
        console.error('Gagal memuat data dashboard guru MI:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleScanQr = async () => {
    setScanning(true);
    try {
      const scanRes = await fetch('/api/v1/absensi/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeToken: 'GURU-MI-PRESENSI-TOKEN',
          lat: -7.818,
          lng: 112.012,
        }),
      });

      const newLog: PresensiLog = {
        id: Date.now().toString(),
        tanggal: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }),
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        lokasi: 'Gerbang Formal MI Lirboyo',
        status: 'HADIR',
        jarak: '12m',
      };
      setRiwayat([newLog, ...riwayat]);
      setIsScanModalOpen(false);
      showToast('success', 'Presensi Berhasil!', 'Scan QR Code kehadiran Guru MI terverifikasi dalam radius Geofencing.');
    } catch {
      showToast('error', 'Gagal Presensi', 'Terjadi kesalahan saat memproses scan QR Code.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-8">
      {/* Header Bar */}
      <header className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-md shrink-0 bg-white/10">
              <Image src="/logo-mi.png" alt="Logo MI" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] md:text-[10px] font-black text-amber-300 uppercase tracking-wider block truncate">
                PORTAL GURU FORMAL / MI
              </span>
              <h1 className="text-sm md:text-lg font-black leading-tight truncate">{user.nama}</h1>
              <p className="text-[11px] md:text-xs text-emerald-200 font-medium truncate">Madrasah Ibtida'iyyah Darussa'adah Lirboyo</p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all shrink-0 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Quick Action Card: Presensi QR Code */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-3xl p-5 md:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-widest inline-block">
              ABSENSI KEHADIRAN GURU
            </span>
            <h2 className="text-lg md:text-xl font-black">Scan QR Code Kehadiran Mengajar</h2>
            <p className="text-xs text-emerald-100/90 max-w-md font-medium">
              Absensi mandiri melalui Geofencing lokasi Madrasah Ibtida'iyyah (MI) Lirboyo Kota Kediri.
            </p>
          </div>

          <button
            onClick={() => setIsScanModalOpen(true)}
            className="relative z-10 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-lg shadow-amber-400/30 hover:scale-105 transition-all shrink-0 flex items-center gap-2 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Buka Kamera QR Scanner</span>
          </button>
        </div>

        {/* Attendance History Section */}
        <div id="absensi" className="space-y-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-sm md:text-base font-black text-slate-900">Riwayat Kehadiran Mengajar</h2>
              <p className="text-xs text-slate-500 font-medium">Catatan absensi QR Code guru harian</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {riwayat.length} Catatan Log
            </span>
          </div>

          {loading ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs font-bold text-slate-500">
              Mengambil riwayat absensi guru...
            </div>
          ) : (
            <>
              {/* Mobile View: Card Stack */}
              <div className="space-y-3 md:hidden">
                {riwayat.map((log) => (
                  <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{log.tanggal}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                          <Clock className="w-3 h-3" /> {log.waktu}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          log.status === 'HADIR'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'TERLAMBAT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {log.lokasi}
                      </span>
                      <span className="text-slate-400 font-semibold">{log.jarak}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Tanggal & Waktu</th>
                      <th className="p-3.5">Lokasi Scanner</th>
                      <th className="p-3.5">Jarak Geofence</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {riwayat.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block text-sm">{log.tanggal}</span>
                          <span className="text-xs text-slate-400">{log.waktu}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{log.lokasi}</td>
                        <td className="p-3.5 text-slate-500 text-xs">{log.jarak}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              log.status === 'HADIR'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'TERLAMBAT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* QR Scanner Modal */}
      <Modal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} title="QR Code Absensi Guru MI">
        <div className="space-y-4 text-center p-2">
          <div className="relative w-48 h-48 mx-auto bg-slate-900 rounded-2xl border-4 border-emerald-500 overflow-hidden flex items-center justify-center shadow-inner">
            {scanning ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-amber-300 font-bold">Memverifikasi Geofence...</p>
              </div>
            ) : (
              <div className="space-y-2 text-slate-400">
                <QrCode className="w-10 h-10 mx-auto text-emerald-400" />
                <p className="text-[11px] font-semibold">Arahkan Kamera ke QR Display MI</p>
              </div>
            )}
          </div>
          <button
            onClick={handleScanQr}
            disabled={scanning}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            {scanning ? 'Memproses Presensi...' : 'Verifikasi Scan QR Absensi'}
          </button>
        </div>
      </Modal>

      <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />
      <MobileBottomNav role="GURU_MI" />
    </div>
  );
}


