'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RegionSelector from '@/components/RegionSelector';
import Toast, { ToastProps } from '@/components/Toast';
import { PageHeader } from '@/components/PageHeader';

interface SantriPondokCandidate {
  id: string;
  nisp: string;
  nisn: string;
  nik?: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
  telepon?: string;
  nik_wali?: string;
  nama_wali?: string;
  telepon_wali?: string;
  hubungan_wali?: 'AYAH' | 'IBU' | 'WALI';
  no_kk?: string;
}

export default function RegistrasiSantriBaruPage() {
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const [loading, setLoading] = useState(false);
  const [instansi, setInstansi] = useState<'PONDOK' | 'MADRASAH' | 'MI'>('PONDOK');

  // Tarik Data Santri Pondok (P3HM ➔ MPHM)
  const [showPondokPullModal, setShowPondokPullModal] = useState(false);
  const [pondokSearchQuery, setPondokSearchQuery] = useState('');
  const [pondokCandidates, setPondokCandidates] = useState<SantriPondokCandidate[]>([]);
  const [isSearchingPondok, setIsSearchingPondok] = useState(false);

  // Form States — I. Identitas Pribadi
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [telepon, setTelepon] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Form States — II. Akademis & Keasramaan
  const [nisp, setNisp] = useState('');
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [jenjang, setJenjang] = useState('Tsanawiyyah');
  const [kelas, setKelas] = useState('10-A (Tahfidz & Diniyah)');
  const [kamar, setKamar] = useState('Asrama Abu Bakar 1');
  const [statusTempatTinggal, setStatusTempatTinggal] = useState<'PONDOK_PESANTREN' | 'UNIT_LAIN'>('PONDOK_PESANTREN');
  const [hafalanJuz, setHafalanJuz] = useState(0);

  // Form States — III. Alamat Kependudukan (Wilayah Indonesia API Cahyadsn)
  const [alamatLengkap, setAlamatLengkap] = useState('');

  // Form States — IV. Data Wali & Smart KK
  const [noKk, setNoKk] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [nikWali, setNikWali] = useState('');
  const [teleponWali, setTeleponWali] = useState('');
  const [hubunganWali, setHubunganWali] = useState<'AYAH' | 'IBU' | 'WALI'>('AYAH');

  // Read session cookie for active instansi
  useEffect(() => {
    try {
      const match = document.cookie.match(/darsa_session=([^;]+)/);
      if (match) {
        const s = JSON.parse(decodeURIComponent(match[1]));
        if (s.instansi) {
          const inst = s.instansi.toUpperCase();
          if (['PONDOK', 'MADRASAH', 'MI'].includes(inst)) {
            setInstansi(inst as 'PONDOK' | 'MADRASAH' | 'MI');
          }
        }
      }
    } catch {}
  }, []);

  // Search Pondok Candidates for Pull Sync
  const handleSearchPondok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pondokSearchQuery.trim()) return;
    setIsSearchingPondok(true);
    try {
      const params = new URLSearchParams({ search: pondokSearchQuery, limit: '20' });
      const res = await fetch(`/api/v1/santri?${params}`);
      const json = await res.json();
      if (json.success) {
        const candidates = json.data.map((s: any) => ({
          id: s.id,
          nisp: s.nisp,
          nisn: s.nisn,
          nama: s.nama_lengkap,
          nik: s.nik,
          jenis_kelamin: s.jenis_kelamin,
          tempat_lahir: s.tempat_lahir,
          tanggal_lahir: s.tanggal_lahir,
          telepon: s.telepon,
          alamat: s.alamat,
          nama_wali: s.nama_wali,
          nik_wali: s.nik_wali,
          telepon_wali: s.telepon_wali,
          hubungan_wali: s.hubungan_wali,
          no_kk: s.no_kk,
        }));
        setPondokCandidates(candidates);
      } else {
        showToast('error', 'Gagal Cari', json.error || 'Tidak dapat mengambil data santri.');
      }
    } catch {
      showToast('error', 'Gagal Cari', 'Tidak dapat mengambil data santri pondok.');
    } finally {
      setIsSearchingPondok(false);
    }
  };

  const handlePullCandidate = (cand: SantriPondokCandidate) => {
    setNama(cand.nama);
    setNik(cand.nik || '');
    setJenisKelamin(cand.jenis_kelamin);
    setTempatLahir(cand.tempat_lahir || '');
    setTanggalLahir(cand.tanggal_lahir || '');
    setTelepon(cand.telepon || '');
    setNisp(cand.nisp);
    setNisn(cand.nisn);
    if (cand.alamat) setAlamatLengkap(cand.alamat);
    setNamaWali(cand.nama_wali || '');
    setNikWali(cand.nik_wali || '');
    setTeleponWali(cand.telepon_wali || '');
    setHubunganWali(cand.hubungan_wali || 'AYAH');
    if (cand.no_kk) setNoKk(cand.no_kk);

    setShowPondokPullModal(false);
    showToast('success', 'Data Santri Ditarik!', `Data ${cand.nama} (${cand.nisp}) berhasil ditarik dari Pondok Pesantren.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nisn.trim()) {
      showToast('warning', 'Form Belum Lengkap', 'Nama Santri dan NISN wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/santri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nisp: nisp.trim() || `PNDK-${Date.now()}`,
          nisn: nisn.trim(),
          nis: nis.trim() || undefined,
          nik: nik.trim() || undefined,
          nama_lengkap: nama.trim(),
          jenis_kelamin: jenisKelamin,
          tempat_lahir: tempatLahir.trim() || undefined,
          tanggal_lahir: tanggalLahir || undefined,
          alamat: alamatLengkap.trim() || undefined,
          telepon: telepon.trim() || undefined,
          avatar_url: avatarUrl.trim() || undefined,
          jenjang,
          kamar,
          status_tempat_tinggal: statusTempatTinggal,
          status: 'AKTIF',
          hafalan_juz: hafalanJuz,
          nik_wali: nikWali.trim() || undefined,
          nama_wali: namaWali.trim() || undefined,
          telepon_wali: teleponWali.trim() || undefined,
          hubungan_wali: hubunganWali,
          no_kk: noKk.trim() || undefined,
          pondok_id: process.env.NEXT_PUBLIC_PONDOK_ID || '',
          kelas_id: '',
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('success', 'Registrasi Sukses!', `Santri ${nama} berhasil didaftarkan ke Database.`);
        setTimeout(() => {
          window.location.href = '/admin/santri';
        }, 1200);
      } else {
        showToast('error', 'Gagal Mendaftar', json.error || 'Terjadi kesalahan sistem.');
      }
    } catch {
      showToast('error', 'Gagal', 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="🎓"
        title="Registrasi Santri Baru"
        subtitle="Pendaftaran Biodata Lengkap, Wilayah Indonesia API, dan Penyambungan NIK Wali"
        badge="FORMULIR REGISTRASI TERPADU MPHM / DARSA"
        primaryAction={instansi !== 'PONDOK' ? { label: '📥 Tarik Data Santri Pondok', onClick: () => setShowPondokPullModal(true) } : undefined}
        secondaryAction={{ label: '← Kembali ke Data Santri', onClick: () => window.location.href = '/admin/santri', icon: '🔙' }}
      />

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* I. Identitas Pribadi */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>👤</span> I. Identitas Pribadi Santri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Santri *</label>
              <input
                type="text"
                required
                placeholder="Muhammad Raihan"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="input-premium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NIK Santri (16 Digit KTP/KK)</label>
              <input
                type="text"
                maxLength={16}
                placeholder="3571011508080001"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="input-premium font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                className="input-premium"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  placeholder="Kediri"
                  value={tempatLahir}
                  onChange={(e) => setTempatLahir(e.target.value)}
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  className="input-premium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WhatsApp Santri</label>
              <input
                type="text"
                placeholder="081234567890"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                className="input-premium font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload Pas Foto Santri (File) *</label>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview Foto" className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600 shadow-sm shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-lg shrink-0">📷</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setAvatarUrl(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* II. Akademis & Keasramaan */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>🎓</span> II. Data Akademis & Keasramaan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stambuk / NISP</label>
              <input
                type="text"
                placeholder="PNDK-0012345678"
                value={nisp}
                onChange={(e) => setNisp(e.target.value)}
                className="input-premium font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NISN *</label>
              <input
                type="text"
                required
                placeholder="0012345678"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="input-premium font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NIS Lokal</label>
              <input
                type="text"
                placeholder="20261001"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="input-premium font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenjang Pendidikan</label>
              <select value={jenjang} onChange={(e) => setJenjang(e.target.value)} className="input-premium">
                <option value="Tsanawiyyah">Tsanawiyyah</option>
                <option value="Aliyah">Aliyah</option>
                <option value="Diniyah Ula">Diniyah Ula</option>
                <option value="Diniyah Wustho">Diniyah Wustho</option>
                <option value="MI Formal">MI Formal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kelas & Rombel</label>
              <select value={kelas} onChange={(e) => setKelas(e.target.value)} className="input-premium">
                <option value="10-A (Tahfidz & Diniyah)">10-A (Tahfidz & Diniyah)</option>
                <option value="11-B (Diniyah Putri)">11-B (Diniyah Putri)</option>
                <option value="12-C (Sains)">12-C (Sains)</option>
                <option value="MI 4-A">MI 4-A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gedung / Kamar Asrama</label>
              <select value={kamar} onChange={(e) => setKamar(e.target.value)} className="input-premium">
                <option value="Asrama Abu Bakar 1">Asrama Abu Bakar 1</option>
                <option value="Asrama Usamah 2">Asrama Usamah 2</option>
                <option value="Asrama Aisyah 3">Asrama Aisyah 3</option>
                <option value="Asrama Khadijah 1">Asrama Khadijah 1</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Keasramaan</label>
              <select
                value={statusTempatTinggal}
                onChange={(e) => setStatusTempatTinggal(e.target.value as any)}
                className="input-premium"
              >
                <option value="PONDOK_PESANTREN">Mukim / Asrama Pesantren</option>
                <option value="UNIT_LAIN">Kalong / Unit Lain</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Hafalan (Juz)</label>
              <input
                type="number"
                min={0}
                max={30}
                value={hafalanJuz}
                onChange={(e) => setHafalanJuz(parseInt(e.target.value) || 0)}
                className="input-premium"
              />
            </div>
          </div>
        </div>

        {/* III. Alamat Kependudukan (API Wilayah Indonesia Cahyadsn) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <RegionSelector
            onChange={(fullAddress) => setAlamatLengkap(fullAddress)}
          />
          {alamatLengkap && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
              📍 Terformat: {alamatLengkap}
            </div>
          )}
        </div>

        {/* IV. Data Orang Tua / Wali (Smart KK Mapping) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>👨‍👩‍👧</span> IV. Data Orang Tua / Wali (Integrasi NIK Portal Wali)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (KK)</label>
              <input
                type="text"
                maxLength={16}
                placeholder="3571019908050012"
                value={noKk}
                onChange={(e) => setNoKk(e.target.value)}
                className="input-premium font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NIK Kependudukan Wali * (16 Digit)</label>
              <input
                type="text"
                required
                maxLength={16}
                placeholder="3571012304850001"
                value={nikWali}
                onChange={(e) => setNikWali(e.target.value)}
                className="input-premium font-mono"
              />
              <span className="text-[10px] text-amber-700 font-bold block mt-1">
                * NIK Wali digunakan untuk login penyambungan akun otomatis di Portal Wali.
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Wali</label>
              <input
                type="text"
                placeholder="Bapak Hendra"
                value={namaWali}
                onChange={(e) => setNamaWali(e.target.value)}
                className="input-premium"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. HP Wali</label>
                <input
                  type="text"
                  placeholder="081399887766"
                  value={teleponWali}
                  onChange={(e) => setTeleponWali(e.target.value)}
                  className="input-premium font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hubungan</label>
                <select
                  value={hubunganWali}
                  onChange={(e) => setHubunganWali(e.target.value as any)}
                  className="input-premium"
                >
                  <option value="AYAH">Ayah Kandung</option>
                  <option value="IBU">Ibu Kandung</option>
                  <option value="WALI">Wali / Kerabat</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-xl shadow-emerald-700/20 transition-all disabled:opacity-50"
        >
          {loading ? 'Menyimpan Data Santri Complete...' : 'Simpan Data Registrasi Santri Terpadu'}
        </button>
      </form>

      {/* Modal Tarik Data Santri Pondok */}
      {showPondokPullModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">📥 Tarik Data Santri dari Database Pondok</h3>
              <button onClick={() => setShowPondokPullModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSearchPondok} className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik NIK / Nama / Stambuk Santri..."
                value={pondokSearchQuery}
                onChange={(e) => setPondokSearchQuery(e.target.value)}
                className="input-premium flex-1"
              />
              <button type="submit" className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl">
                Cari
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {isSearchingPondok ? (
                <p className="text-xs text-slate-400 py-4 text-center">Mencari santri pondok...</p>
              ) : pondokCandidates.length > 0 ? (
                pondokCandidates.map((cand) => (
                  <div key={cand.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-slate-900">{cand.nama}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">{cand.nisp} • Wali: {cand.nama_wali}</span>
                    </div>
                    <button
                      onClick={() => handlePullCandidate(cand)}
                      className="px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg hover:bg-amber-300"
                    >
                      Tarik Data
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">Ketik kata kunci untuk mencari santri pondok.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
