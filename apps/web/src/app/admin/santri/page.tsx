'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Modal, { ConfirmDialog } from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { LoadingSpinner, SkeletonTable, EmptyState, SearchBar } from '@/components/Loading';
import RegionSelector from '@/components/RegionSelector';

interface PenempatanPendidikan {
  id: string;
  nisp: string;
  tahun_ajaran: string;
  semester: 'Ganjil' | 'Genap';
  unit: 'MADRASAH' | 'MI';
  tingkat: string;
  kelas: string;
  wali_kelas: string;
  status: string;
}

interface Santri {
  id: string;
  nisp?: string;
  nisn: string;
  nis?: string;
  nik?: string;
  nama: string;
  nama_panggilan?: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir?: string;
  tanggal_lahir?: string;
  anak_ke?: number;
  jumlah_saudara?: number;
  alamat?: string;
  telepon?: string;
  avatar_url?: string;
  jenjang?: string;
  kelas: string;
  kamar?: string;
  status_tempat_tinggal?: string;
  instansi: string;
  status: string;
  hafalan_juz?: number;
  nik_wali?: string;
  nama_wali?: string;
  telepon_wali?: string;
  hubungan_wali?: 'AYAH' | 'IBU' | 'WALI';
  no_kk?: string;
  penempatan?: PenempatanPendidikan[];
}

export default function MasterSantriPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [userRole, setUserRole] = useState<string>('ADMIN_INSTANSI');
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardTarget, setCardTarget] = useState<Santri | null>(null);
  const [detailTarget, setDetailTarget] = useState<Santri | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Santri | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  // Form State — Lengkap BAB II-V
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [nisp, setNisp] = useState('');
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [namaPanggilan, setNamaPanggilan] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [anakKe, setAnakKe] = useState(1);
  const [jumlahSaudara, setJumlahSaudara] = useState(1);
  const [telepon, setTelepon] = useState('');
  const [jenjang, setJenjang] = useState('Tsanawiyyah');
  const [kelas, setKelas] = useState('10-A (Tahfidz & Diniyah)');
  const [kamar, setKamar] = useState('Asrama Abu Bakar 1');
  const [hafalanJuz, setHafalanJuz] = useState(0);
  const [alamat, setAlamat] = useState('');

  // Data Wali
  const [noKk, setNoKk] = useState('');
  const [nikWali, setNikWali] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [teleponWali, setTeleponWali] = useState('');
  const [hubunganWali, setHubunganWali] = useState<'AYAH' | 'IBU' | 'WALI'>('AYAH');

  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        if (s.role) setUserRole(s.role);
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
    fetchSantri();
  }, [instansiFilter]);

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/simulation/data?type=santri&instansi=${instansiFilter}`);
      const json = await res.json();
      if (json.success) {
        setSantriList(json.data);
      } else {
        setSantriList([]);
      }
    } catch {
      showToast('error', 'Gagal Memuat', 'Tidak dapat terhubung ke database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSantri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim() || !nama.trim() || !nikWali.trim()) {
      showToast('warning', 'Form Belum Lengkap', 'NISN, Nama Santri, dan NIK Wali wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const newSantriPayload = {
        nisp: nisp.trim() || `PNDK-${nisn.trim()}`,
        nisn: nisn.trim(),
        nis: nis.trim() || undefined,
        nik: nik.trim() || undefined,
        nama: nama.trim(),
        nama_panggilan: namaPanggilan.trim(),
        jenis_kelamin: jenisKelamin,
        tempat_lahir: tempatLahir.trim(),
        tanggal_lahir: tanggalLahir,
        anak_ke: anakKe,
        jumlah_saudara: jumlahSaudara,
        alamat: alamat.trim(),
        telepon: telepon.trim(),
        jenjang,
        kelas,
        kamar,
        instansi: instansiFilter.toUpperCase(),
        tahun_ajaran: '2025/2026 (Ganjil)',
        status: 'AKTIF',
        hafalan_juz: hafalanJuz,
        nik_wali: nikWali.trim(),
        nama_wali: namaWali.trim(),
        telepon_wali: teleponWali.trim(),
        hubungan_wali: hubunganWali,
        no_kk: noKk.trim(),
      };

      const res = await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_santri',
          payload: newSantriPayload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchSantri();
        showToast('success', 'Santri Berhasil Ditambahkan', `Master Data Santri ${nama} tersimpan di Database Pondok.`);
      }
    } catch {
      showToast('error', 'Gagal Menyimpan', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch('/api/v1/simulation/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_santri',
          id: deleteTarget.id,
        }),
      });
      setSantriList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      showToast('success', 'Santri Dihapus', `Data santri ${deleteTarget.nama} dihapus.`);
    } catch {
      showToast('error', 'Gagal Menghapus', 'Tidak dapat menghapus data.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return santriList;
    const q = search.toLowerCase();
    return santriList.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        s.nisn.includes(q) ||
        (s.nisp && s.nisp.toLowerCase().includes(q)) ||
        s.kelas.toLowerCase().includes(q) ||
        (s.nik_wali && s.nik_wali.includes(q))
    );
  }, [santriList, search]);

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Single Source of Truth Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-3">
        <span className="text-base shrink-0">🏛️</span>
        <div>
          <strong className="block font-bold mb-0.5">BAB I PASAL 1 — SINGLE SOURCE OF TRUTH:</strong>
          Pondok merupakan Master Database seluruh Santri/Santriwati. Identitas santri hanya dibuat 1 kali pada Database Pondok. Unit Madrasah & MI tidak membuat data santri baru, hanya memanggil/mereferensikan data penempatan pendidikan.
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-tight">Master Data Santri ({instansiFilter.toUpperCase()})</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {instansiFilter === 'pondok'
              ? 'Pondok Pesantren - Master Single Source of Truth Seluruh Siswa/Siswi'
              : `Referensi Data Akademik & Penempatan Unit ${instansiFilter.toUpperCase()}`
            }
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {instansiFilter === 'pondok' ? (
            <Link
              href="/admin/santri/baru"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>📝</span> Registrasi Master Santri (Pondok)
            </Link>
          ) : (
            <Link
              href="/admin/santri/tarik"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>📥</span> Tarik Penempatan Data Santri Pondok
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar & Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex-1 w-full">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama, NISN, NISP stambuk, NIK Wali, atau kelas..." />
        </div>
        {!loading && (
          <span className="shrink-0 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            {filtered.length} santri
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎓"
            title={search ? 'Santri Tidak Ditemukan' : 'Belum Ada Data Santri'}
            description={search
              ? `Tidak ada santri yang cocok dengan pencarian "${search}".`
              : `Belum ada santri terdaftar di instansi ${instansiFilter}.`
            }
            action={instansiFilter === 'pondok' ? { label: '📝 Registrasi Santri Baru', onClick: () => window.location.href = '/admin/santri/baru' } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>NISP Stambuk</th>
                  <th>NISN & Nama Santri</th>
                  <th>L/P</th>
                  <th>Penempatan Pendidikan (Dual)</th>
                  <th>Asrama</th>
                  <th>Wali Santri (NIK)</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((santri) => (
                  <tr key={santri.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-mono text-xs font-bold text-emerald-800">{santri.nisp || '-'}</td>
                    <td>
                      <div className="font-bold text-slate-900">{santri.nama}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NISN: {santri.nisn}</div>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        santri.jenis_kelamin === 'L' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-pink-50 text-pink-700 border border-pink-200'
                      }`}>
                        {santri.jenis_kelamin}
                      </span>
                    </td>
                    <td>
                      {santri.penempatan && santri.penempatan.length > 0 ? (
                        <div className="space-y-1">
                          {santri.penempatan.map((p) => (
                            <span key={p.id} className="inline-block mr-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                              {p.unit}: {p.tingkat} - {p.kelas}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-700">{santri.kelas}</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-500">{santri.kamar || 'Asrama Utama'}</td>
                    <td>
                      <div className="font-bold text-slate-800 text-xs">{santri.nama_wali || 'Bapak Hendra'}</div>
                      <div className="text-[10px] text-amber-800 font-mono font-bold">NIK: {santri.nik_wali || '3571012304850001'}</div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailTarget(santri)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200 transition-all flex items-center gap-1"
                        >
                          <span>🔍</span> Detail BAB VI
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardTarget(santri)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-[11px] font-bold border border-teal-200 transition-all flex items-center gap-1"
                        >
                          <span>📱</span> Kartu
                        </button>
                        {instansiFilter === 'pondok' && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(santri)}
                            className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold border border-rose-200 transition-all"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Profil Santri & Penempatan Dual-Enrollment (BAB VI) */}
      <Modal
        isOpen={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        title="Tampilan Profil Santri & Penempatan Pendidikan (BAB VI)"
      >
        {detailTarget && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-emerald-900 text-white space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">SINGLE SOURCE OF TRUTH PONDOK</span>
                  <h3 className="text-lg font-black">{detailTarget.nama}</h3>
                  <p className="text-xs text-emerald-200 font-mono">Nomor Stambuk : {detailTarget.nisp || '240001'}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-400 text-emerald-950 font-black text-[10px]">
                  {detailTarget.status}
                </span>
              </div>
            </div>

            {/* Identitas Permanen (BAB II) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 border-b pb-1">👤 Identitas Dasar Permanen (BAB II)</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div><span className="text-slate-400">NIK Santri:</span> {detailTarget.nik || '-'}</div>
                <div><span className="text-slate-400">NISN:</span> {detailTarget.nisn || '-'}</div>
                <div><span className="text-slate-400">Jenis Kelamin:</span> {detailTarget.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                <div><span className="text-slate-400">Tempat, Tgl Lahir:</span> {detailTarget.tempat_lahir || 'Kediri'}, {detailTarget.tanggal_lahir || '2008-08-15'}</div>
                <div><span className="text-slate-400">Anak Ke / Saudara:</span> {detailTarget.anak_ke || 1} dari {detailTarget.jumlah_saudara || 3} bersaudara</div>
                <div><span className="text-slate-400">Status Asrama:</span> {detailTarget.status_tempat_tinggal || 'PONDOK_PESANTREN'}</div>
              </div>
              <div className="pt-1 text-slate-700">
                <span className="text-slate-400 block mb-0.5">Alamat Kependudukan Lengkap (BAB IV):</span>
                <strong className="block text-[11px] text-slate-900 bg-white p-2 rounded-xl border border-slate-200">
                  {detailTarget.alamat || 'Jl. KH. Abdul Karim No. 12 RT 02/RW 03, Desa/Kel. LIRBOYO, Kec. MOJOROTO, KOTA KEDIRI, Prov. JAWA TIMUR, Kode Pos 64117'}
                </strong>
              </div>
            </div>

            {/* Data Orang Tua / Wali (BAB III) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 border-b pb-1">👨‍👩‍👧 Data Orang Tua / Wali (BAB III)</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div><span className="text-slate-400">Nama Wali:</span> {detailTarget.nama_wali || 'Bapak Hendra'}</div>
                <div><span className="text-slate-400">NIK Wali (Portal Sync):</span> <strong className="font-mono text-amber-800">{detailTarget.nik_wali || '3571012304850001'}</strong></div>
                <div><span className="text-slate-400">No. HP Wali:</span> {detailTarget.telepon_wali || '081399887766'}</div>
                <div><span className="text-slate-400">Hubungan:</span> {detailTarget.hubungan_wali || 'AYAH'}</div>
                <div><span className="text-slate-400">No. KK:</span> {detailTarget.no_kk || '3571019908050012'}</div>
              </div>
            </div>

            {/* Tampilan Penempatan Pendidikan Santri (BAB VI & BAB VIII) */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                <h4 className="font-black text-emerald-950">📚 Tampilan Penempatan Pendidikan Santri (BAB VI)</h4>
                <span className="text-[10px] text-emerald-800 font-bold">Dual-Enrollment Support</span>
              </div>

              {detailTarget.penempatan && detailTarget.penempatan.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detailTarget.penempatan.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-extrabold text-[10px]">
                        Unit: {p.unit}
                      </span>
                      <div className="pt-1">
                        <span className="text-slate-500 block">Tingkat: <strong className="text-slate-800">{p.tingkat}</strong></span>
                        <span className="text-slate-500 block">Kelas: <strong className="text-slate-800">{p.kelas}</strong></span>
                        <span className="text-slate-500 block">Tahun Ajaran: <strong className="text-slate-800">{p.tahun_ajaran}</strong></span>
                        <span className="text-slate-500 block">Wali Kelas / Mustahiq: <strong className="text-slate-800">{p.wali_kelas}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-extrabold text-[10px]">
                    Unit: MADRASAH DINIYAH
                  </span>
                  <div className="pt-1">
                    <span className="text-slate-500 block">Tingkat: <strong className="text-slate-800">Tsanawiyyah</strong></span>
                    <span className="text-slate-500 block">Kelas: <strong className="text-slate-800">{detailTarget.kelas}</strong></span>
                    <span className="text-slate-500 block">Tahun Ajaran: <strong className="text-slate-800">2025/2026 (Ganjil)</strong></span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setDetailTarget(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Tutup Detail Profil
            </button>
          </div>
        )}
      </Modal>

      {/* Kartu Santri Digital Modal */}
      <Modal
        isOpen={!!cardTarget}
        onClose={() => setCardTarget(null)}
        title="Kartu Digital Santri (QR Presensi)"
      >
        {cardTarget && (
          <div className="space-y-6 text-center py-2">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white border-2 border-amber-400 shadow-2xl relative overflow-hidden text-left space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-700/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-amber-400 bg-white/10 flex items-center justify-center font-bold text-xs">
                    🕌
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest block">KARTU PRESENSI DIGITAL</span>
                    <h4 className="text-xs font-black">MA'HAD DARUSSA'ADAH LIRBOYO</h4>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-black">ACTIVE</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black shrink-0">
                  {cardTarget.nama.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-white">{cardTarget.nama}</h3>
                  <p className="text-xs text-emerald-200 font-mono">NISN: {cardTarget.nisn} • Stambuk: {cardTarget.nisp}</p>
                  <p className="text-[11px] text-amber-300 font-semibold">{cardTarget.kelas} • Wali: {cardTarget.nama_wali || 'Bapak Hendra'}</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl flex items-center justify-between gap-3 text-slate-900">
                <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white text-3xl font-black font-mono shadow-inner shrink-0">
                  QR
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                  <span className="block font-bold text-emerald-800">TOTP DYNAMIC GEOLOCATION</span>
                  <span className="block">Radius: 200 Meter Pos Utama</span>
                  <span className="block text-[9px] text-slate-400 mt-0.5">NIK Wali: {cardTarget.nik_wali || '3571012304850001'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
            >
              <span>🖨️</span> Cetak / Simpan Kartu Santri Digital
            </button>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus Santri: ${deleteTarget?.nama ?? ''}`}
        message={`Data santri ${deleteTarget?.nama ?? ''} (NISN: ${deleteTarget?.nisn ?? ''}) akan dihapus permanen dari Database Lokal. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Santri"
        loading={deleting}
      />
    </div>
  );
}
