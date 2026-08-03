'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';

export default function WaliDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [user, setUser] = useState({ nama: 'Bapak Hendra', role: 'WALI_SANTRI', instansi: 'PONDOK' });
  const [santriData, setSantriData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setUser({ nama: s.nama, role: s.role, instansi: s.instansi || 'PONDOK' });
      }
    } catch {}
  }, []);

  useEffect(() => { fetchWaliData(); }, [user.instansi]);

  const fetchWaliData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=santri&instansi=${user.instansi}`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setSantriData(json.data[0]); // First matching santri for this wali
      }
    } catch {
      showToast('error', 'Gagal Memuat', 'Tidak dapat terhubung ke database.');
    } finally {
      setLoading(false);
    }
  };

  const childName = santriData ? santriData.nama : 'Muhammad Raihan';
  const childClass = santriData ? santriData.kelas : '10-A (Tahfidz)';
  const childNisn = santriData ? santriData.nisn : '0012345678';
  const childJuz = santriData ? santriData.hafalan_juz || 12 : 12;

  const riwayatPresensi = [
    { tanggal: 'Senin, 4 Agt 2026', status: 'HADIR', waktu: '06:45 WIB', jarak: '28m' },
    { tanggal: 'Selasa, 5 Agt 2026', status: 'HADIR', waktu: '06:52 WIB', jarak: '35m' },
    { tanggal: 'Rabu, 6 Agt 2026', status: 'TERLAMBAT', waktu: '07:18 WIB', jarak: '62m' },
    { tanggal: 'Kamis, 7 Agt 2026', status: 'HADIR', waktu: '06:48 WIB', jarak: '30m' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border border-emerald-600 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-[3px] border-amber-400 overflow-hidden shadow-xl shrink-0">
              <Image src="/logo-lirboyo.png" alt="Logo" fill className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">
                PORTAL WALI SANTRI • {user.instansi}
              </span>
              <h1 className="text-xl font-black text-white">{user.nama}</h1>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Orang Tua / Wali dari: <strong>{childName}</strong> • Kelas {childClass}
              </p>
            </div>
          </div>
          <Link href="/login" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shrink-0">
            Keluar
          </Link>
        </div>
      </div>

      {/* Child Profile Card */}
      <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
            {childName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">{childName}</h2>
            <p className="text-xs text-slate-500 font-medium">NISN: {childNisn} • {childClass}</p>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Ma'had Darussa'adah Lirboyo Kota Kediri</p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              ✅ Santri Terverifikasi
            </span>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Presensi */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Presensi Hari Ini</span>
            <span className="text-xl">📍</span>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              HADIR
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-1 font-medium">
            <p>⏰ 06:45 WIB</p>
            <p>📡 Radius GPS: 28m (Valid)</p>
          </div>
        </div>

        {/* Hafalan */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Capaian Hafalan</span>
            <span className="text-xl">📖</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{childJuz} Juz</div>
            <div className="text-xs text-slate-500 font-medium">Surah: Al-Isra</div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              ⭐ MUMTAZ
            </span>
            <span className="text-lg font-black text-emerald-700">95/100</span>
          </div>
        </div>

        {/* SPP */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pembayaran SPP</span>
            <span className="text-xl">💳</span>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              ✅ LUNAS
            </span>
            <p className="text-xs text-slate-500 font-medium mt-2">Bulan: Agustus 2026</p>
          </div>
          <button
            onClick={() => showToast('info', 'Payment Gateway', 'Fitur pembayaran online siap digunakan.')}
            className="w-full py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm"
          >
            💳 Bayar Online
          </button>
        </div>
      </div>

      {/* Riwayat Presensi */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Riwayat Presensi GPS</h3>
          <p className="text-xs text-slate-500 mt-0.5">Catatan kehadiran presisi tinggi dari Database</p>
        </div>
        <div className="divide-y divide-slate-100">
          {riwayatPresensi.map((p, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">{p.tanggal}</p>
                <p className="text-[11px] text-slate-400 font-medium">⏰ {p.waktu} • 📡 {p.jarak}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                p.status === 'HADIR'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
