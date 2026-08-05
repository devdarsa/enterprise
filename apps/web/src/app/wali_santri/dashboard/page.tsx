'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast, { ToastProps } from '@/components/Toast';
import Modal from '@/components/Modal';
import MobileBottomNav from '@/components/MobileBottomNav';

interface ConnectedSantri {
  id: string;
  nisp: string;
  nisn: string;
  nama: string;
  kelas: string;
  instansi: string;
  status: string;
  hafalan_juz: number;
  nik_wali?: string;
  nama_wali?: string;
}

interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  target: string;
  instansi: string;
  tanggal: string;
  penulis: string;
  penting: boolean;
}

export default function WaliSantriDashboardPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, msg?: string) => setToast({ isOpen: true, type, title, message: msg });

  const [user, setUser] = useState({ nama: 'Bapak Hendra', nik: '3571012304850001', role: 'WALI_SANTRI', instansi: 'PONDOK' });

  const [connectedChildren, setConnectedChildren] = useState<ConnectedSantri[]>([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);

  const [isIzinModalOpen, setIsIzinModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formIzin, setFormIzin] = useState({
    jenis: 'PULANG' as 'PULANG' | 'SAKIT' | 'KEPERLUAN_KELUARGA',
    alasan: '',
    tanggalMulai: '',
    tanggalSelesai: '',
  });

  const [riwayatIzin, setRiwayatIzin] = useState([
    { id: '1', jenis: 'IZIN PULANG', alasan: 'Acara pernikahan keluarga di Surabaya', status: 'DISETUJUI', tanggal: '28 Jul 2026' },
  ]);

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        setUser({
          nama: s.nama || 'Bapak Hendra',
          nik: s.nik || '3571012304850001',
          role: s.role || 'WALI_SANTRI',
          instansi: s.instansi || 'PONDOK',
        });
      }
    } catch {}

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch connected children via NIK Wali
      const resWali = await fetch(`/api/v1/simulation/data?type=wali_santri&nik=3571012304850001`);
      const jsonWali = await resWali.json();
      if (jsonWali.success && jsonWali.data.length > 0) {
        setConnectedChildren(jsonWali.data);
      }

      // 2. Fetch live broadcast pengumuman
      const resP = await fetch(`/api/v1/simulation/data?type=pengumuman&target=WALI_SANTRI`);
      const jsonP = await resP.json();
      if (jsonP.success) {
        setPengumumanList(jsonP.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeSantri = connectedChildren[activeChildIndex] || {
    id: '1',
    nisp: 'PNDK-0012345678',
    nisn: '0012345678',
    nama: 'Muhammad Raihan',
    kelas: '10-A (Tahfidz & Diniyah)',
    instansi: 'PONDOK',
    status: 'AKTIF',
    hafalan_juz: 15,
  };

  const rekapAbsensi = [
    { bulan: 'Agustus 2026', hadir: 22, izin: 1, sakit: 0, alpha: 0, persentase: '95.6%' },
    { bulan: 'Juli 2026', hadir: 24, izin: 0, sakit: 1, alpha: 0, persentase: '96.0%' },
  ];

  const nilaiTerakhir = [
    { mapel: 'Fiqih Fathul Qarib', nilai: 88, predikat: 'A', ustadz: 'Dr. KH. Abdullah Ridwan' },
    { mapel: 'Nahwu Alfiyyah', nilai: 85, predikat: 'A', ustadz: 'Ustadz Ahmad Al-Farisi' },
    { mapel: 'Tahfidz', nilai: 92, predikat: 'Mumtaz', ustadz: 'Dr. KH. Abdullah Ridwan' },
  ];

  const handleKirimIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIzin.alasan.trim() || !formIzin.tanggalMulai) {
      showToast('warning', 'Form Belum Lengkap', 'Alasan dan tanggal izin wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_surat',
          payload: {
            nomor: `SURAT-${Date.now().toString().slice(-4)}`,
            jenis: `IZIN ${formIzin.jenis}`,
            perihal: `Pengajuan Izin Santri: ${activeSantri.nama} (${formIzin.alasan.trim()})`,
            pengirim: `${user.nama} (Wali of ${activeSantri.nama})`,
            penerima: 'Sekretariat Utama',
            tanggal: 'Hari Ini (5 Agt 2026)',
            status: 'PENDING',
            instansi: 'PONDOK',
            tahun_ajaran: '2025/2026 (Ganjil)',
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRiwayatIzin([
          {
            id: Date.now().toString(),
            jenis: `IZIN ${formIzin.jenis}`,
            alasan: formIzin.alasan.trim(),
            status: 'MENUNGGU VERIFIKASI',
            tanggal: 'Hari Ini (5 Agt 2026)',
          },
          ...riwayatIzin,
        ]);
        setIsIzinModalOpen(false);
        setFormIzin({ jenis: 'PULANG', alasan: '', tanggalMulai: '', tanggalSelesai: '' });
        showToast('success', 'Permohonan Izin Terkirim!', 'Permohonan izin santri telah dikirimkan ke Sekretariat untuk diverifikasi.');
      }
    } catch {
      showToast('error', 'Gagal Mengirimkan', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, isOpen: false }))} />

      {/* Header */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border border-emerald-600 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border-[3px] border-amber-400 overflow-hidden shadow-xl shrink-0">
              <Image src="/logo-lirboyo.png" alt="Logo Lirboyo" fill className="object-cover" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 tracking-wider block mb-0.5">
                Selamat Datang
              </span>
              <h1 className="text-xl font-black text-white leading-tight">{user.nama}</h1>
              <p className="text-xs text-emerald-100 font-medium mt-1">
                NIK Wali : <strong className="font-mono text-amber-200">{user.nik}</strong> | Santri Terhubung : <strong className="text-white">{connectedChildren.length || 1} Anak</strong>
              </p>
              <p className="text-xs text-emerald-200 font-medium mt-0.5">
                Instansi : Pondok Pesantren Ma'had Darussa'adah Lirboyo
              </p>
            </div>
          </div>
          <Link href="/login" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shrink-0">
            Keluar
          </Link>
        </div>
      </div>

      {/* Desktop Navigation Tabs */}
      <div id="beranda" className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <a href="#beranda" className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-700 text-white shadow-sm shrink-0">
          🏠 Beranda
        </a>
        <a href="#surat" className="px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0">
          ✉️ Status Izin
        </a>
        <a href="#akademik" className="px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0">
          📜 Rapor & Hafalan
        </a>
        <a href="#absensi" className="px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0">
          📊 Presensi
        </a>
        <a href="#pengumuman" className="px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0">
          📢 Informasi
        </a>
      </div>

      {/* Children Selector Tab (If Multiple Children Linked to Same NIK) */}
      {connectedChildren.length > 1 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            🔗 Santri Terhubung (Penyambungan Otomatis NIK {user.nik}):
          </span>
          <div className="flex flex-wrap gap-2">
            {connectedChildren.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setActiveChildIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeChildIndex === idx
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🎓 {c.nama} ({c.nisp})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Profile Card Santri & Action Button */}
      <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
            {activeSantri.nama.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">{activeSantri.nama}</h2>
            <p className="text-xs text-slate-500 font-medium">
              Stambuk: <strong className="font-mono text-amber-800">{activeSantri.nisp}</strong> • NISN: {activeSantri.nisn} • {activeSantri.kelas}
            </p>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
              Hafalan Al-Qur'an: <strong>{activeSantri.hafalan_juz || 15} Juz</strong> • Ma'had Darussa'adah Lirboyo
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsIzinModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
        >
          <span>✉️</span> + Ajukan Izin Santri Online
        </button>
      </div>

      {/* Riwayat Permohonan Izin Wali */}
      {riwayatIzin.length > 0 && (
        <div id="surat" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 scroll-mt-6">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span>📝</span> Status Permohonan Izin Santri
          </h2>
          <div className="divide-y divide-slate-100">
            {riwayatIzin.map((iz) => (
              <div key={iz.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">{iz.jenis} • {iz.alasan}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{iz.tanggal}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                  iz.status === 'DISETUJUI' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {iz.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nilai Akademik & Progres Hafalan */}
      <div id="akademik" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 scroll-mt-6">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <span>📜</span> Nilai Akademik & Progres Hafalan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nilaiTerakhir.map((n, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">{n.mapel}</span>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-2xl font-black text-slate-900">{n.nilai}</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">{n.predikat}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Pengampu: {n.ustadz}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rekap Absensi Bulanan */}
      <div id="absensi" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 scroll-mt-6">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <span>📊</span> Rekap Presensi Kehadiran Bulanan
        </h2>
        <div className="divide-y divide-slate-100">
          {rekapAbsensi.map((r, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">{r.bulan}</span>
              <div className="flex items-center gap-4 text-slate-600 font-semibold">
                <span>Hadir: <strong className="text-emerald-700">{r.hadir} dkk</strong></span>
                <span>Izin: {r.izin}</span>
                <span>Sakit: {r.sakit}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200">
                  {r.persentase} Kehadiran
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Broadcast Pengumuman dari Database */}
      <div id="pengumuman" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 scroll-mt-6">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <span>📢</span> Pengumuman Resmi Live dari Database
        </h2>
        <div className="space-y-3">
          {pengumumanList.length > 0 ? (
            pengumumanList.map((p) => (
              <div key={p.id} className={`p-4 rounded-2xl ${p.penting ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-200'}`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-bold text-slate-900">{p.judul}</h3>
                  <span className="text-[10px] text-amber-700 font-semibold">{p.tanggal} • {p.instansi}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.isi}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 font-medium">Belum ada pengumuman baru dari Sekretariat.</p>
          )}
        </div>
      </div>

      {/* Modal Form Izin Santri Online */}
      <Modal
        isOpen={isIzinModalOpen}
        onClose={() => setIsIzinModalOpen(false)}
        title={`Form Izin Online (${activeSantri.nama})`}
      >
        <form onSubmit={handleKirimIzin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Perizinan</label>
            <select
              value={formIzin.jenis}
              onChange={(e) => setFormIzin({ ...formIzin, jenis: e.target.value as any })}
              className="input-premium"
            >
              <option value="PULANG">Izin Pulang Ke Rumah</option>
              <option value="SAKIT">Izin Sakit / Berobat</option>
              <option value="KEPERLUAN_KELUARGA">Izin Keperluan Keluarga Urgent</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai Izin</label>
              <input
                type="date"
                required
                value={formIzin.tanggalMulai}
                onChange={(e) => setFormIzin({ ...formIzin, tanggalMulai: e.target.value })}
                className="input-premium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai / Kembali</label>
              <input
                type="date"
                required
                value={formIzin.tanggalSelesai}
                onChange={(e) => setFormIzin({ ...formIzin, tanggalSelesai: e.target.value })}
                className="input-premium"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Keperluan Izin</label>
            <textarea
              required
              rows={3}
              placeholder="Tuliskan alasan perizinan secara rinci..."
              value={formIzin.alasan}
              onChange={(e) => setFormIzin({ ...formIzin, alasan: e.target.value })}
              className="input-premium"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
          >
            {submitting ? 'Mengirimkan Permohonan...' : 'Kirim Permohonan Izin Ke Sekretariat'}
          </button>
        </form>
      </Modal>

      <MobileBottomNav role="WALI_SANTRI" />
    </div>
  );
}
