'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Modal, { ConfirmDialog } from '@/components/Modal';
import Toast, { ToastProps } from '@/components/Toast';
import { Pagination } from '@/components/Pagination';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader, InfoBanner } from '@/components/PageHeader';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

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
  jenis_kelamin: 'L' | 'P' | 'LAKI_LAKI' | 'PEREMPUAN';
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

// ─── Tipe Mutasi ─────────────────────────────────────────────────────────────
type MutasiTipe = 'BOYONG' | 'CUTI' | 'PINDAH' | 'LULUS' | 'PURGE';

const MUTASI_OPTIONS: Array<{
  tipe: MutasiTipe;
  label: string;
  desc: string;
  icon: string;
  color: string;
  group: 'pondok' | 'madrasah';
}> = [
    { tipe: 'BOYONG', label: 'Boyong', desc: 'Keluar permanen dari pondok pesantren', icon: '🚶', color: 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200', group: 'pondok' },
    { tipe: 'CUTI', label: 'Cuti', desc: 'Izin tidak hadir sementara dari pondok', icon: '⏸️', color: 'bg-amber-50  border-amber-300  text-amber-800  hover:bg-amber-100', group: 'pondok' },
    { tipe: 'PINDAH', label: 'Pindah Unit', desc: 'Pindah ke unit / madrasah / sekolah lain', icon: '🔀', color: 'bg-blue-50   border-blue-300   text-blue-800   hover:bg-blue-100', group: 'madrasah' },
    { tipe: 'LULUS', label: 'Lulus / Tamat', desc: 'Dinyatakan lulus dari madrasah / MI', icon: '🎓', color: 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100', group: 'madrasah' },
    { tipe: 'PURGE', label: 'Hapus Data', desc: 'Pindahkan ke Recycle Bin (tidak dapat dibatalkan)', icon: '🗑️', color: 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100', group: 'pondok' },
  ];

export default function MasterSantriPage() {
  const [instansiFilter, setInstansiFilter] = useState<'pondok' | 'madrasah' | 'mi'>('pondok');
  const [userRole, setUserRole] = useState<string>('ADMIN_INSTANSI');
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Mutasi state
  const [mutasiTarget, setMutasiTarget] = useState<Santri | null>(null);
  const [mutasiTipe, setMutasiTipe] = useState<MutasiTipe | null>(null);
  const [mutasiAlasan, setMutasiAlasan] = useState('');
  const [mutasiTanggal, setMutasiTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [mutasiSubmitting, setMutasiSubmitting] = useState(false);
  const [mutasiConfirmOpen, setMutasiConfirmOpen] = useState(false);

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
          if (['pondok', 'madrasah', 'mi'].includes(inst)) setInstansiFilter(inst);
        }
      }
    } catch { }
  }, []);

  useEffect(() => { fetchSantri(); }, [instansiFilter]);

  const fetchSantri = async () => {
    const cacheKey = `list_${instansiFilter}`;
    // 1. Baca cache IndexedDB lebih dulu (Zero-delay transition)
    const cached = await getIndexedDBCache<Santri[]>('santri', cacheKey);
    if (cached && cached.length > 0) {
      setSantriList(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // 2. Fetch server DB (Single Source of Truth) untuk pembaruan
    try {
      const params = new URLSearchParams({ page: '1', limit: '50', ...(search && { search }) });
      const res = await fetch(`/api/v1/santri?${params}`);
      const json = await res.json();
      if (json.success) {
        const mapped: Santri[] = json.data.map((s: any) => ({
          id: s.id,
          nisp: s.nisp,
          nisn: s.nisn,
          nis: s.nis,
          nik: s.nik,
          nama: s.nama_lengkap,
          nama_panggilan: s.nama_panggilan,
          jenis_kelamin: s.jenis_kelamin,
          tempat_lahir: s.tempat_lahir,
          tanggal_lahir: s.tanggal_lahir,
          anak_ke: s.anak_ke,
          jumlah_saudara: s.jumlah_saudara,
          alamat: s.alamat,
          telepon: s.telepon,
          jenjang: s.jenjang,
          kelas: s.kelas?.nama_kelas || s.kelas_id || '-',
          kamar: s.kamar,
          status_tempat_tinggal: s.status_tempat_tinggal,
          instansi: 'PONDOK',
          status: s.status,
          hafalan_juz: s.hafalan_juz,
          nik_wali: s.nik_wali,
          nama_wali: s.nama_wali,
          telepon_wali: s.telepon_wali,
          hubungan_wali: s.hubungan_wali,
          no_kk: s.no_kk,
          penempatan: s.penempatan,
        }));
        setSantriList(mapped);
        setIndexedDBCache('santri', cacheKey, mapped);
      }
    } catch {
      if (!cached) showToast('error', 'Gagal Memuat', 'Tidak dapat terhubung ke database.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Mutasi Handler ────────────────────────────────────────────────────────
  const openMutasi = (santri: Santri) => {
    setMutasiTarget(santri);
    setMutasiTipe(null);
    setMutasiAlasan('');
    setMutasiTanggal(new Date().toISOString().slice(0, 10));
    setMutasiConfirmOpen(false);
  };

  const handleMutasiSubmit = async () => {
    if (!mutasiTarget || !mutasiTipe) return;
    setMutasiSubmitting(true);
    try {
      const res = await fetch(`/api/v1/santri/${mutasiTarget.id}/mutasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipe: mutasiTipe, alasan: mutasiAlasan, tanggal_efektif: mutasiTanggal }),
      });
      const json = await res.json();
      if (json.success) {
        setMutasiTarget(null);
        setMutasiConfirmOpen(false);
        fetchSantri();
        showToast('success', 'Mutasi Berhasil', json.message || 'Status santri berhasil diperbarui.');
      } else {
        showToast('error', 'Gagal Mutasi', json.error);
      }
    } catch {
      showToast('error', 'Error', 'Gagal terhubung ke server.');
    } finally {
      setMutasiSubmitting(false);
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

  const paginatedList = useMemo(() => {
    if (itemsPerPage >= filtered.length) return filtered;
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const genderBadge = (g: string) =>
    g === 'L' || g === 'LAKI_LAKI'
      ? 'bg-blue-50 text-blue-700 border border-blue-200'
      : 'bg-pink-50 text-pink-700 border border-pink-200';
  const genderLabel = (g: string) =>
    g === 'L' || g === 'LAKI_LAKI' ? 'LAKI_LAKI' : 'PEREMPUAN';

  const selectedMutasiOption = MUTASI_OPTIONS.find(o => o.tipe === mutasiTipe);

  // ── Export / Import Excel (.xlsx) ──────────────────────────────────────────
  const handleExportExcel = async () => {
    const { exportToExcel } = await import('@/lib/excel-helper');
    const dataToExport = filtered.map((s) => ({
      'NISP Stambuk': s.nisp || '',
      NISN: s.nisn || '',
      'NIS Lokal': s.nis || '',
      'NIK Santri (16 Digit)': s.nik || '',
      'Nama Lengkap Santri': s.nama,
      'Nama Panggilan': s.nama_panggilan || '',
      'Jenis Kelamin': s.jenis_kelamin === 'LAKI_LAKI' || s.jenis_kelamin === 'L' ? 'L' : 'P',
      'Tempat Lahir': s.tempat_lahir || '',
      'Tanggal Lahir': s.tanggal_lahir ? s.tanggal_lahir.slice(0, 10) : '',
      'No. HP Santri': s.telepon || '',
      'Jenjang Pendidikan': s.jenjang || '',
      'Kelas & Rombel': s.kelas || '',
      'Gedung / Kamar Asrama': s.kamar || '',
      'Status Keasramaan': s.status_tempat_tinggal === 'UNIT_LAIN' ? 'Kalong / Unit Lain' : 'Mukim / Asrama Pesantren',
      'Alamat Lengkap Kependudukan': s.alamat || '',
      'Nomor Kartu Keluarga (KK)': s.no_kk || '',
      'NIK Wali (16 Digit)': s.nik_wali || '',
      'Nama Lengkap Wali': s.nama_wali || '',
      'No. HP Wali': s.telepon_wali || '',
      'Hubungan Wali': s.hubungan_wali || 'AYAH',
      'Status Keaktifan': s.status || 'AKTIF',
    }));

    exportToExcel(dataToExport, `master-santri-${new Date().toISOString().slice(0, 10)}`, 'Master Santri');
    showToast('success', 'Export Excel Berhasil', `${filtered.length} data santri diexport ke file .xlsx.`);
  };

  // State Report Validasi Import Excel
  const [validationReport, setValidationReport] = useState<any | null>(null);
  const [importingValidOnly, setImportingValidOnly] = useState(false);

  const handleDownloadTemplate = async () => {
    const { downloadOfficialSantriTemplate } = await import('@/lib/excel-helper');
    await downloadOfficialSantriTemplate();
    showToast('success', 'Template Resmi Terproteksi Diunduh', 'Gunakan template v2.4-ENTERPRISE dengan header locked & data validation.');
  };

  const handleImport = async (file: File) => {
    showToast('info', 'Validasi File Excel (31 Rule Contract)', `Menganalisis data dari file ${file.name}...`);
    try {
      const { parseAndValidateExcelFile } = await import('@/lib/excel-helper');
      const result = await parseAndValidateExcelFile(file);

      if (result.totalRows === 0) {
        showToast('error', 'File Excel Kosong', 'Tidak ada data yang ditemukan di dalam file Excel.');
        return;
      }

      if (!result.isValid) {
        setValidationReport(result);
        return;
      }

      // If 100% valid, proceed immediately
      await processExecuteImport(result.validRows);
    } catch (err: any) {
      showToast('error', 'Import Gagal', err.message || 'Format file Excel tidak dapat dibaca.');
    }
  };

  const processExecuteImport = async (rows: Record<string, any>[]) => {
    setImportingValidOnly(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      const payload = {
        nisp: row.nisp || row['NISP Stambuk'] || '',
        nisn: row.nisn || row['NISN'] || '',
        nis: row.nis || row['NIS Lokal'] || '',
        nik: row.nik || row['NIK Santri (16 Digit)'] || '',
        nama_lengkap: row.nama_lengkap || row['Nama Lengkap Santri'] || '',
        nama_panggilan: row.nama_panggilan || row['Nama Panggilan'] || '',
        jenis_kelamin: row.jenis_kelamin === 'P' || row.jenis_kelamin === 'PEREMPUAN' ? 'PEREMPUAN' : 'LAKI_LAKI',
        tempat_lahir: row.tempat_lahir || row['Tempat Lahir'] || '',
        tanggal_lahir: row.tanggal_lahir || row['Tanggal Lahir (YYYY-MM-DD)'] || '',
        telepon: row.telepon || row['No. HP Santri'] || '',
        jenjang: row.jenjang || row['Jenjang Pendidikan'] || 'PONDOK',
        kamar: row.kamar || row['Gedung / Kamar Asrama'] || '',
        status_tempat_tinggal: row.status_tempat_tinggal || 'PONDOK_PESANTREN',
        hafalan_juz: row.hafalan_juz || 0,
        alamat: row.alamat || row['Alamat Lengkap Kependudukan'] || '',
        no_kk: row.no_kk || row['Nomor Kartu Keluarga (KK)'] || '',
        nik_wali: row.nik_wali || row['NIK Wali (16 Digit)'] || '',
        nama_wali: row.nama_wali || row['Nama Lengkap Wali'] || '',
        telepon_wali: row.telepon_wali || row['No. HP Wali'] || '',
        hubungan_wali: row.hubungan_wali || 'AYAH',
      };

      if (!payload.nama_lengkap) continue;

      try {
        const res = await fetch('/api/v1/santri', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resJson = await res.json();
        if (resJson.success) successCount++;
        else errorCount++;
      } catch {
        errorCount++;
      }
    }

    setImportingValidOnly(false);
    setValidationReport(null);

    showToast(
      successCount > 0 ? 'success' : 'error',
      'Impor Data Selesai',
      `${successCount} santri berhasil dimasukkan ke database PostgreSQL.` + (errorCount > 0 ? ` (${errorCount} dilewati/duplikat)` : '')
    );

    fetchSantri();
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header + Toolbar */}
      <PageHeader
        icon="🎓"
        title={`Master Data Santri (${instansiFilter.toUpperCase()})`}
        subtitle={
          instansiFilter === 'pondok'
            ? 'Pondok Pesantren — Single Source of Truth Seluruh Siswa/Siswi'
            : `Referensi Data Akademik & Penempatan Unit ${instansiFilter.toUpperCase()}`
        }
        badge="DATABASE PONDOK"
        infoBanner={{
          icon: '🏛️',
          title: 'SINGLE SOURCE OF TRUTH:',
          content:
            'Pondok merupakan Master Database seluruh Santri/Santriwati. Identitas santri hanya dibuat 1 kali pada Database Pondok. Unit Madrasah & MI tidak membuat data santri baru, hanya memanggil/mereferensikan data penempatan pendidikan.',
          variant: 'brand',
        }}
        primaryAction={
          instansiFilter === 'pondok'
            ? { label: '📝 Registrasi Master Santri', onClick: () => (window.location.href = '/admin/santri/baru') }
            : { label: '📥 Tarik Data Santri Pondok', onClick: () => (window.location.href = '/admin/santri/tarik'), gold: true }
        }
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama, NISN, NISP stambuk, NIK Wali, atau kelas..."
        count={loading ? undefined : filtered.length}
        countLabel="santri"
        onExportExcel={handleExportExcel}
        onDownloadTemplate={instansiFilter === 'pondok' ? handleDownloadTemplate : undefined}
        onImport={instansiFilter === 'pondok' ? handleImport : undefined}
        onRefresh={fetchSantri}
      />

      {/* Table */}
      <div className="table-container overflow-x-auto">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎓"
            title={search ? 'Santri Tidak Ditemukan' : 'Belum Ada Data Santri'}
            description={
              search
                ? `Tidak ada santri yang cocok dengan pencarian "${search}".`
                : `Belum ada santri terdaftar di instansi ${instansiFilter}.`
            }
            action={instansiFilter === 'pondok'
              ? { label: '📝 Registrasi Santri Baru', onClick: () => (window.location.href = '/admin/santri/baru') }
              : undefined}
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
                {paginatedList.map((santri) => (
                  <tr key={santri.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-mono text-xs font-bold text-emerald-800">{santri.nisp || '-'}</td>
                    <td>
                      <div className="font-bold text-slate-900">{santri.nama}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NISN: {santri.nisn}</div>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${genderBadge(santri.jenis_kelamin)}`}>
                        {genderLabel(santri.jenis_kelamin)}
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
                      <div className="font-bold text-slate-800 text-xs">{santri.nama_wali || '-'}</div>
                      <div className="text-[10px] text-amber-800 font-mono font-bold">NIK: {santri.nik_wali || '-'}</div>
                    </td>

                    {/* ── AKSI KOLOM ── */}
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Detail → halaman detail */}
                        <Link
                          href={`/admin/santri/${santri.id}`}
                          className="btn-action-detail"
                          title="Lihat detail profil santri"
                        >
                          🔍 Detail
                        </Link>

                        {/* Mutasi */}
                        {instansiFilter === 'pondok' && (
                          <button
                            type="button"
                            onClick={() => openMutasi(santri)}
                            className="btn-action-mutasi"
                            title="Mutasi santri (Boyong/Cuti/Pindah/Lulus)"
                          >
                            🔄 Mutasi
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

      {/* Pagination Bar (25 / 50 / 100 / Tampilkan Semua) */}
      <Pagination
        currentPage={currentPage}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* ── MODAL MUTASI ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!mutasiTarget && !mutasiConfirmOpen}
        onClose={() => setMutasiTarget(null)}
        title={`🔄 Mutasi Santri — ${mutasiTarget?.nama ?? ''}`}
      >
        {mutasiTarget && (
          <div className="space-y-5">
            {/* Info Santri */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-black text-emerald-800 text-sm shrink-0">
                {mutasiTarget.nama.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-slate-900">{mutasiTarget.nama}</p>
                <p className="text-slate-500 font-mono">NISP: {mutasiTarget.nisp} • Status: <strong className="text-emerald-700">{mutasiTarget.status}</strong></p>
              </div>
            </div>

            {/* Pilih Tipe Mutasi */}
            <div>
              <p className="text-xs font-black text-slate-700 mb-3">Pilih Jenis Mutasi:</p>

              <div className="mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">🕌 Pondok Pesantren</p>
                <div className="grid grid-cols-1 gap-2">
                  {MUTASI_OPTIONS.filter(o => o.group === 'pondok').map(opt => (
                    <button
                      key={opt.tipe}
                      type="button"
                      onClick={() => setMutasiTipe(opt.tipe)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left text-xs font-semibold transition-all ${mutasiTipe === opt.tipe
                          ? (opt.tipe === 'PURGE' ? 'border-rose-500 bg-rose-50' : 'border-emerald-500 bg-emerald-50 text-emerald-900')
                          : opt.color
                        }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{opt.icon}</span>
                      <div>
                        <span className="font-black block">{opt.label}</span>
                        <span className="text-[10px] opacity-80">{opt.desc}</span>
                      </div>
                      {mutasiTipe === opt.tipe && (
                        <span className="ml-auto shrink-0 mt-0.5 text-emerald-600 font-black">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">📚 Madrasah & MI</p>
                <div className="grid grid-cols-2 gap-2">
                  {MUTASI_OPTIONS.filter(o => o.group === 'madrasah').map(opt => (
                    <button
                      key={opt.tipe}
                      type="button"
                      onClick={() => setMutasiTipe(opt.tipe)}
                      className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left text-xs font-semibold transition-all ${mutasiTipe === opt.tipe
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : opt.color
                        }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{opt.icon}</span>
                      <div>
                        <span className="font-black block">{opt.label}</span>
                        <span className="text-[10px] opacity-80">{opt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Mutasi — muncul setelah pilih tipe */}
            {mutasiTipe && (
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Efektif</label>
                  <input
                    type="date"
                    value={mutasiTanggal}
                    onChange={e => setMutasiTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alasan / Keterangan {mutasiTipe === 'PURGE' ? '(wajib)' : '(opsional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={mutasiAlasan}
                    onChange={e => setMutasiAlasan(e.target.value)}
                    placeholder={
                      mutasiTipe === 'BOYONG' ? 'Contoh: Pulang kampung atas permintaan keluarga...' :
                        mutasiTipe === 'CUTI' ? 'Contoh: Sakit, keperluan keluarga mendesak...' :
                          mutasiTipe === 'PINDAH' ? 'Contoh: Pindah ke MI Wahid Hasyim...' :
                            mutasiTipe === 'LULUS' ? 'Contoh: Lulus Kelas 6 Madin Ibtidaiyah...' :
                              'Wajib sebutkan alasan penghapusan data...'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                {/* Warning untuk PURGE */}
                {mutasiTipe === 'PURGE' && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>Data akan dipindahkan ke Recycle Bin. Admin dapat memulihkan dari menu Audit Log & Recycle Bin.</span>
                  </div>
                )}
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setMutasiTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!mutasiTipe || (mutasiTipe === 'PURGE' && !mutasiAlasan.trim())}
                onClick={() => setMutasiConfirmOpen(true)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${mutasiTipe === 'PURGE'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
              >
                {selectedMutasiOption ? `${selectedMutasiOption.icon} Proses ${selectedMutasiOption.label}` : 'Pilih Jenis Mutasi'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Mutasi */}
      <ConfirmDialog
        isOpen={mutasiConfirmOpen}
        onClose={() => setMutasiConfirmOpen(false)}
        onConfirm={handleMutasiSubmit}
        title={`Konfirmasi: ${selectedMutasiOption?.label ?? ''} — ${mutasiTarget?.nama ?? ''}`}
        message={`Anda akan memproses mutasi "${selectedMutasiOption?.label}" untuk santri ${mutasiTarget?.nama} (NISP: ${mutasiTarget?.nisp}). ${mutasiTipe === 'PURGE' ? 'Data meyakinkan dihapus ke Recycle Bin.' : 'Status santri akan diperbarui di database.'} Apakah Anda yakin?`}
        confirmLabel={`Ya, ${selectedMutasiOption?.label ?? 'Proses'}`}
        loading={mutasiSubmitting}
      />

      {/* ── MODAL REPORT VALIDASI IMPOR EXCEL (31 RULE CONTRACT) ───────────── */}
      {validationReport && (
        <Modal
          isOpen={!!validationReport}
          onClose={() => setValidationReport(null)}
          title="⚠️ Laporan Hasil Validasi File Excel (Standard Contract v2.4)"
          size="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header Summary Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">TOTAL BARIS</span>
                <span className="text-xl font-black text-slate-800">{validationReport.summary.total}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">VALID (MEMENUHI SYARAT)</span>
                <span className="text-xl font-black text-emerald-800">{validationReport.summary.valid}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-700 font-bold uppercase block">DITOLAK (TIDAK VALID)</span>
                <span className="text-xl font-black text-rose-800">{validationReport.summary.invalid}</span>
              </div>
            </div>

            {/* List Table Error Baris */}
            {validationReport.invalidRows.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-rose-800 flex items-center gap-1.5 text-sm">
                  <span>🛑 Rincian Baris yang Ditolak oleh Sistem:</span>
                </h4>
                <div className="max-h-60 overflow-y-auto rounded-xl border border-rose-200 bg-rose-50/50 p-2 space-y-2">
                  {validationReport.invalidRows.map((inv: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-rose-200 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-rose-800 font-mono">Baris Ke-{inv.rowNumber}</span>
                        <span className="text-slate-900 font-bold">Santri: {inv.data.nama_lengkap || '(Nama Kosong)'}</span>
                      </div>
                      <ul className="list-disc list-inside text-rose-700 space-y-0.5 pl-1">
                        {inv.issues.map((iss: any, i: number) => (
                          <li key={i} className="font-medium">
                            <strong className="font-bold">{iss.column}:</strong> {iss.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setValidationReport(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
              >
                ✖️ Batal & Perbaiki File Excel
              </button>

              {validationReport.summary.valid > 0 && (
                <button
                  type="button"
                  disabled={importingValidOnly}
                  onClick={() => processExecuteImport(validationReport.validRows)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  {importingValidOnly ? '⏳ Memproses...' : `✅ Impor ${validationReport.summary.valid} Baris Valid Saja`}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
