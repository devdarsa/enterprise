/**
 * Darsa Enterprise - Local Database Store Engine
 * Database Engine Murni per Instansi tanpa data hardcode di frontend.
 */

export interface PenempatanPendidikanRecord {
  id: string;
  santri_id: string;
  nisp: string;
  tahun_ajaran: string;
  semester: 'Ganjil' | 'Genap';
  unit: 'MADRASAH' | 'MI';
  tingkat: string;
  kelas: string;
  wali_kelas: string;
  status: 'AKTIF' | 'ALUMNI' | 'LULUS';
}

export interface SantriRecord {
  id: string;
  nisp: string;
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
  status_tempat_tinggal?: 'PONDOK_PESANTREN' | 'UNIT_LAIN';
  tahun_masuk?: number;
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
  tahun_ajaran: string;
  status: 'AKTIF' | 'NON_AKTIF' | 'CUTI' | 'ALUMNI' | 'MUTASI';
  hafalan_juz: number;
  nik_wali?: string;
  nama_wali?: string;
  telepon_wali?: string;
  hubungan_wali?: 'AYAH' | 'IBU' | 'WALI';
  no_kk?: string;
  penempatan?: PenempatanPendidikanRecord[];
}

export interface GuruRecord {
  id: string;
  nip: string;
  nama: string;
  tugas: string;
  telepon: string;
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
  tahun_ajaran: string;
  status?: 'AKTIF' | 'NON_AKTIF';
}

export interface SuratRecord {
  id: string;
  nomor: string;
  jenis: string;
  perihal: string;
  pengirim: string;
  penerima: string;
  tanggal: string;
  status: 'DISETUJUI' | 'PENDING' | 'ARSIP' | 'DITOLAK';
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
  tahun_ajaran: string;
}

export interface TransaksiRecord {
  id: string;
  santri_nisn: string;
  santri_nama: string;
  jenis: string;
  nominal: number;
  metode: string;
  status: 'LUNAS' | 'PENDING';
  tanggal: string;
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
  tahun_ajaran: string;
}

export interface JadwalRecord {
  id: string;
  hari: string;
  jam: string;
  mapel: string;
  kelas: string;
  pengajar: string;
  ruang: string;
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
}

export interface SetoranRecord {
  id: string;
  santri_nama: string;
  kelas: string;
  juz: number;
  surah: string;
  nilai: number;
  tanggal: string;
  ustadz: string;
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
}

export interface PengumumanRecord {
  id: string;
  judul: string;
  isi: string;
  target: 'SEMUA' | 'WALI_SANTRI' | 'GURU';
  instansi: 'PONDOK' | 'MADRASAH' | 'MI' | 'SEMUA';
  tanggal: string;
  penulis: string;
  penting: boolean;
}

export interface KamarAsramaRecord {
  id: string;
  gedung: string;
  nomorKamar: string;
  kapasitas: number;
  terisi: number;
  waliKamar: string;
  status: 'TERSEDIA' | 'PENUH' | 'PERBAIKAN';
}

export interface PengurusRecord {
  id: string;
  nik: string;
  nama: string;
  jabatan: string;
  unit: 'PONDOK' | 'MADRASAH' | 'MI';
  telepon: string;
  status: 'AKTIF' | 'NON_AKTIF';
}

export interface AlumniRecord {
  id: string;
  nisp: string;
  nama: string;
  tahunLulus: number;
  jenjangTerakhir: string;
  statusAlumni: 'KULIAH' | 'KHIDMAH' | 'BEKERJA' | 'WIRAUSAHA';
  lokasiKhidmah?: string;
  telepon: string;
}

export interface PelanggaranRecord {
  id: string;
  tanggal: string;
  santriNama: string;
  nisp: string;
  jenis: string;
  tingkat: 'RINGAN' | 'SEDANG' | 'BERAT';
  tindakan: string;
  petugas: string;
}

export interface TahunAjaranRecord {
  id: string;
  nama: string;
  semester: 'Ganjil' | 'Genap';
  status: 'AKTIF' | 'NON_AKTIF';
  tglMulai: string;
  tglSelesai: string;
}

export interface UserAccountRecord {
  id: string;
  nama: string;
  email: string;
  role: string;
  instansi: string;
  status: 'AKTIF' | 'NON_AKTIF' | 'SUSPENDED';
}

export interface AuditLogRecord {
  id: string;
  waktu: string;
  user: string;
  aktivitas: string;
  modul: string;
  ipAddress: string;
}

export interface RecycleBinRecord {
  id: string;
  waktuHapus: string;
  dihapusOleh: string;
  tipeData: string;
  detail: string;
  originalPayload: any;
}

export interface KonfigurasiRecord {
  namaPondok: string;
  alamatPondok: string;
  radiusQr: number;
  notifWa: boolean;
}

// Master Wilayah Database Schema (Strict Foreign Key Relations & Server Caching)
export interface MasterProvinsiRecord {
  id: string;
  kode_provinsi: string;
  nama_provinsi: string;
}

export interface MasterKabupatenRecord {
  id: string;
  kode_kabupaten: string;
  kode_provinsi: string;
  nama_kabupaten: string;
}

export interface MasterKecamatanRecord {
  id: string;
  kode_kecamatan: string;
  kode_kabupaten: string;
  nama_kecamatan: string;
}

export interface MasterDesaRecord {
  id: string;
  kode_desa: string;
  kode_kecamatan: string;
  nama_desa: string;
}

// Database Store Class
class SimulationDatabaseStore {
  private santriList: SantriRecord[] = [
    {
      id: '1',
      nisp: 'PNDK-0012345678',
      nisn: '0012345678',
      nis: '20261001',
      nik: '3571011508080001',
      nama: 'Muhammad Raihan',
      nama_panggilan: 'Raihan',
      jenis_kelamin: 'L',
      tempat_lahir: 'Kediri',
      tanggal_lahir: '2008-08-15',
      anak_ke: 1,
      jumlah_saudara: 3,
      alamat: 'Jl. KH. Abdul Karim No. 12 RT 02/RW 03, Desa Lirboyo, Kecamatan Mojoroto, Kota Kediri, Provinsi Jawa Timur 64117',
      telepon: '081234567890',
      jenjang: 'Tsanawiyyah',
      kelas: '10-A (Tahfidz & Diniyah)',
      kamar: 'Asrama Abu Bakar 1',
      status_tempat_tinggal: 'PONDOK_PESANTREN',
      tahun_masuk: 2025,
      instansi: 'PONDOK',
      tahun_ajaran: '2025/2026 (Ganjil)',
      status: 'AKTIF',
      hafalan_juz: 15,
      nik_wali: '3571012304850001',
      nama_wali: 'Bapak Hendra',
      telepon_wali: '081399887766',
      hubungan_wali: 'AYAH',
      no_kk: '3571019908050012',
    },
    {
      id: '2',
      nisp: 'PNDK-0012345679',
      nisn: '0012345679',
      nis: '20261002',
      nik: '3571012010090002',
      nama: 'Ahmad Fauzi',
      nama_panggilan: 'Fauzi',
      jenis_kelamin: 'L',
      tempat_lahir: 'Surabaya',
      tanggal_lahir: '2009-10-20',
      anak_ke: 2,
      jumlah_saudara: 3,
      alamat: 'Jl. Raya Darmo No. 45, Surabaya',
      telepon: '081298765432',
      jenjang: 'Tsanawiyyah',
      kelas: '10-A (Tahfidz & Diniyah)',
      kamar: 'Asrama Usamah 2',
      status_tempat_tinggal: 'PONDOK_PESANTREN',
      tahun_masuk: 2025,
      instansi: 'PONDOK',
      tahun_ajaran: '2025/2026 (Ganjil)',
      status: 'AKTIF',
      hafalan_juz: 12,
      nik_wali: '3571012304850001',
      nama_wali: 'Bapak Hendra',
      telepon_wali: '081399887766',
      hubungan_wali: 'AYAH',
      no_kk: '3571019908050012',
    },
    {
      id: '3',
      nisp: 'PNDK-0012345680',
      nisn: '0012345680',
      nis: '20261003',
      nik: '3571016504090003',
      nama: 'Siti Aminah',
      nama_panggilan: 'Aminah',
      jenis_kelamin: 'P',
      tempat_lahir: 'Malang',
      tanggal_lahir: '2009-04-25',
      anak_ke: 1,
      jumlah_saudara: 2,
      alamat: 'Jl. Ijen No. 88, Malang',
      telepon: '085711223344',
      jenjang: 'Aliyah',
      kelas: '11-B (Diniyah Putri)',
      kamar: 'Asrama Aisyah 3',
      status_tempat_tinggal: 'PONDOK_PESANTREN',
      tahun_masuk: 2024,
      instansi: 'PONDOK',
      tahun_ajaran: '2025/2026 (Ganjil)',
      status: 'AKTIF',
      hafalan_juz: 8,
      nik_wali: '3571098706900002',
      nama_wali: 'Ibu Rahmawati',
      telepon_wali: '085799881122',
      hubungan_wali: 'IBU',
      no_kk: '3571099904090088',
    },
  ];

  private penempatanList: PenempatanPendidikanRecord[] = [
    { id: '1', santri_id: '1', nisp: 'PNDK-0012345678', tahun_ajaran: '2025/2026 (Ganjil)', semester: 'Ganjil', unit: 'MADRASAH', tingkat: 'Tsanawiyyah', kelas: '10-A (Tahfidz & Diniyah)', wali_kelas: 'Dr. KH. Abdullah Ridwan', status: 'AKTIF' },
    { id: '2', santri_id: '1', nisp: 'PNDK-0012345678', tahun_ajaran: '2025/2026 (Ganjil)', semester: 'Ganjil', unit: 'MI', tingkat: 'VI', kelas: 'VI-B', wali_kelas: 'Ustadzah Fatimah, S.Pd', status: 'AKTIF' },
    { id: '3', santri_id: '2', nisp: 'PNDK-0012345679', tahun_ajaran: '2025/2026 (Ganjil)', semester: 'Ganjil', unit: 'MADRASAH', tingkat: 'Tsanawiyyah', kelas: '10-A (Tahfidz & Diniyah)', wali_kelas: 'Dr. KH. Abdullah Ridwan', status: 'AKTIF' },
    { id: '4', santri_id: '3', nisp: 'PNDK-0012345680', tahun_ajaran: '2025/2026 (Ganjil)', semester: 'Ganjil', unit: 'MADRASAH', tingkat: 'Aliyah', kelas: '11-B (Diniyah Putri)', wali_kelas: 'Ustadz Ahmad Al-Farisi', status: 'AKTIF' },
  ];

  private guruList: GuruRecord[] = [
    { id: '1', nip: '198504122015031002', nama: 'Dr. KH. Abdullah Ridwan', tugas: 'Mustahiq Kelas 10-A & Guru Fiqih', telepon: '08123456789', instansi: 'MADRASAH', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF' },
    { id: '2', nip: '199009182019031005', nama: 'Ustadz Ahmad Al-Farisi', tugas: 'Pengajar Nahwu Alfiyyah', telepon: '08198765432', instansi: 'MADRASAH', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF' },
    { id: '3', nip: '199208152018022003', nama: 'Ustadzah Fatimah, S.Pd', tugas: 'Guru MI Formal & Wali Kelas 4-A', telepon: '08571234567', instansi: 'MI', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF' },
  ];

  private suratList: SuratRecord[] = [
    { id: '1', nomor: 'SURAT-001/DARSA/VIII/2026', jenis: 'IZIN PULANG', perihal: 'Pengajuan Izin Pulang Santri: Ahmad Fauzi (Pernikahan Saudara)', pengirim: 'Bapak Hendra (Wali Santri)', penerima: 'Sekretariat Utama Pondok', tanggal: '3 Agt 2026', status: 'DISETUJUI', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)' },
  ];

  private transaksiList: TransaksiRecord[] = [];
  private jadwalList: JadwalRecord[] = [];
  private setoranList: SetoranRecord[] = [];

  private pengumumanList: PengumumanRecord[] = [
    { id: '1', judul: 'Jadwal Libur Akhir Semester Diniyah & Pondok', isi: 'Pengumuman resmi libur akhir semester ganjil santri pesantren dan madrasah diniyah Lirboyo Kediri.', target: 'SEMUA', instansi: 'SEMUA', tanggal: '1 Agt 2026', penulis: 'Sekretariat Utama', penting: true },
  ];

  private asramaList: KamarAsramaRecord[] = [
    { id: '1', gedung: 'Gedung A (Al-Farabi)', nomorKamar: 'A-101', kapasitas: 8, terisi: 8, waliKamar: 'Ustadz Ahmad Fauzan', status: 'PENUH' },
    { id: '2', gedung: 'Gedung A (Al-Farabi)', nomorKamar: 'A-102', kapasitas: 8, terisi: 6, waliKamar: 'Ustadz Ahmad Fauzan', status: 'TERSEDIA' },
  ];

  private pengurusList: PengurusRecord[] = [
    { id: '1', nik: '3571011205800001', nama: 'Ust. H. Abdul Hamid, M.Pd', jabatan: 'Ketua Umum Pengurus Pondok', unit: 'PONDOK', telepon: '081234567890', status: 'AKTIF' },
    { id: '2', nik: '3571011809850002', nama: 'Ust. Moh. Kholil', jabatan: 'Kepala Sekretariat Diniyyah', unit: 'MADRASAH', telepon: '085712345678', status: 'AKTIF' },
  ];

  private alumniList: AlumniRecord[] = [
    { id: '1', nisp: 'PNDK-2022001', nama: 'Ust. Moh. Hilmi Mubarak', tahunLulus: 2024, jenjangTerakhir: 'Aliyah Diniyah', statusAlumni: 'KHIDMAH', lokasiKhidmah: 'Pondok Cabang Kediri', telepon: '081233445566' },
  ];

  private pelanggaranList: PelanggaranRecord[] = [
    { id: '1', tanggal: '4 Agt 2026', santriNama: 'Ahmad Fauzi', nisp: 'PNDK-0012345679', jenis: 'Terlambat Berjamaah Subuh', tingkat: 'RINGAN', tindakan: 'Tazir Membaca Al-Qur\'an 1 Juz', petugas: 'Keamanan Asrama' },
  ];

  private tahunAjaranList: TahunAjaranRecord[] = [
    { id: '1', nama: '2025/2026', semester: 'Ganjil', status: 'AKTIF', tglMulai: '15 Jul 2025', tglSelesai: '20 Des 2025' },
    { id: '2', nama: '2025/2026', semester: 'Genap', status: 'NON_AKTIF', tglMulai: '05 Jan 2026', tglSelesai: '20 Jun 2026' },
  ];

  private akunList: UserAccountRecord[] = [
    { id: '1', nama: 'Sekretariat Utama Darsa', email: 'admin@darsa.id', role: 'SEKRETARIAT', instansi: 'PONDOK', status: 'AKTIF' },
    { id: '2', nama: 'Dr. KH. Abdullah Ridwan', email: 'guru.madrasah@darsa.id', role: 'GURU_MADRASAH', instansi: 'MADRASAH', status: 'AKTIF' },
  ];

  private auditLogList: AuditLogRecord[] = [
    { id: '1', waktu: '05 Agt 2026 17:05', user: 'admin@darsa.id', aktivitas: 'Registrasi Santri Baru: Muhammad Raihan', modul: 'SANTRI', ipAddress: '182.253.12.9' },
  ];

  private recycleBinList: RecycleBinRecord[] = [];

  private konfigurasi: KonfigurasiRecord = {
    namaPondok: "Ma'had Darussa'adah Lirboyo",
    alamatPondok: "Jl. KH. Abdul Karim No. 12, Lirboyo, Kota Kediri",
    radiusQr: 200,
    notifWa: true,
  };

  // Master Wilayah Data Store (Cached in Database Store)
  private masterProvinsi: MasterProvinsiRecord[] = [
    { id: '1', kode_provinsi: '35', nama_provinsi: 'JAWA TIMUR' },
    { id: '2', kode_provinsi: '33', nama_provinsi: 'JAWA TENGAH' },
    { id: '3', kode_provinsi: '32', nama_provinsi: 'JAWA BARAT' },
    { id: '4', kode_provinsi: '31', nama_provinsi: 'DKI JAKARTA' },
    { id: '5', kode_provinsi: '36', nama_provinsi: 'BANTEN' },
    { id: '6', kode_provinsi: '34', nama_provinsi: 'DI YOGYAKARTA' },
  ];

  private masterKabupaten: MasterKabupatenRecord[] = [
    { id: '1', kode_kabupaten: '35.71', kode_provinsi: '35', nama_kabupaten: 'KOTA KEDIRI' },
    { id: '2', kode_kabupaten: '35.06', kode_provinsi: '35', nama_kabupaten: 'KABUPATEN KEDIRI' },
    { id: '3', kode_kabupaten: '35.78', kode_provinsi: '35', nama_kabupaten: 'KOTA SURABAYA' },
    { id: '4', kode_kabupaten: '35.07', kode_provinsi: '35', nama_kabupaten: 'KABUPATEN MALANG' },
  ];

  private masterKecamatan: MasterKecamatanRecord[] = [
    { id: '1', kode_kecamatan: '35.71.01', kode_kabupaten: '35.71', nama_kecamatan: 'MOJOROTO' },
    { id: '2', kode_kecamatan: '35.71.02', kode_kabupaten: '35.71', nama_kecamatan: 'KOTA' },
    { id: '3', kode_kecamatan: '35.71.03', kode_kabupaten: '35.71', nama_kecamatan: 'PESANTREN' },
  ];

  private masterDesa: MasterDesaRecord[] = [
    { id: '1', kode_desa: '35.71.01.1001', kode_kecamatan: '35.71.01', nama_desa: 'LIRBOYO' },
    { id: '2', kode_desa: '35.71.01.1002', kode_kecamatan: '35.71.01', nama_desa: 'CAMPUREJO' },
    { id: '3', kode_desa: '35.71.01.1003', kode_kecamatan: '35.71.01', nama_desa: 'BANDAR KIDUL' },
  ];

  // Helper Audit Logging
  public logAudit(user: string, aktivitas: string, modul: string) {
    const newRecord: AuditLogRecord = {
      id: String(this.auditLogList.length + 1),
      waktu: new Date().toLocaleString('id-ID'),
      user: user || 'admin@darsa.id',
      aktivitas,
      modul,
      ipAddress: '182.253.12.9',
    };
    this.auditLogList.unshift(newRecord);
  }

  // Master Wilayah Server Queries (Read from Local Database Store)
  getProvinces(): MasterProvinsiRecord[] {
    return this.masterProvinsi;
  }

  getRegencies(kodeProvinsi: string): MasterKabupatenRecord[] {
    return this.masterKabupaten.filter((k) => k.kode_provinsi === kodeProvinsi);
  }

  getDistricts(kodeKabupaten: string): MasterKecamatanRecord[] {
    return this.masterKecamatan.filter((k) => k.kode_kabupaten === kodeKabupaten);
  }

  getVillages(kodeKecamatan: string): MasterDesaRecord[] {
    return this.masterDesa.filter((d) => d.kode_kecamatan === kodeKecamatan);
  }

  syncWilayahData(newProvinces: MasterProvinsiRecord[]): number {
    let updated = 0;
    for (const p of newProvinces) {
      const idx = this.masterProvinsi.findIndex((x) => x.kode_provinsi === p.kode_provinsi);
      if (idx === -1) {
        this.masterProvinsi.push(p);
        updated++;
      }
    }
    this.logAudit('admin@darsa.id', `Sinkronisasi Master Wilayah Indonesia (${updated} provinsi baru)`, 'WILAYAH');
    return updated;
  }

  pullSyncSantri(targetInstansi: 'MADRASAH' | 'MI', santriIds: string[], tahunAjaran: string): number {
    let synced = 0;
    for (const nisn of santriIds) {
      const pondokSantri = this.santriList.find((s) => s.nisn === nisn && s.instansi === 'PONDOK');
      if (pondokSantri) {
        const alreadyExists = this.santriList.some((s) => s.nisn === nisn && s.instansi === targetInstansi);
        if (!alreadyExists) {
          this.santriList.push({
            ...pondokSantri,
            id: String(this.santriList.length + 1),
            instansi: targetInstansi,
            tahun_ajaran: tahunAjaran,
          });
          synced++;
        }
      }
    }
    this.logAudit('admin@darsa.id', `Pull-Sync Data Santri ke ${targetInstansi}: ${synced} santri`, 'PULL_SYNC');
    return synced;
  }

  // 1. Santri Queries & Mutations
  getSantri(instansi?: string, tahunAjaran?: string): SantriRecord[] {
    const targetInst = instansi?.toUpperCase() || 'PONDOK';

    return this.santriList
      .filter((s) => {
        if (targetInst === 'PONDOK') return true;
        return this.penempatanList.some(
          (p) => p.santri_id === s.id && p.unit === targetInst && p.status === 'AKTIF'
        );
      })
      .map((s) => {
        const santriPenempatan = this.penempatanList.filter((p) => p.santri_id === s.id);
        return {
          ...s,
          penempatan: santriPenempatan,
        };
      });
  }

  getPenempatanBySantri(santriId: string): PenempatanPendidikanRecord[] {
    return this.penempatanList.filter((p) => p.santri_id === santriId);
  }

  getSantriByNikWali(nikWali: string): SantriRecord[] {
    if (!nikWali) return this.santriList.slice(0, 1);
    const matched = this.santriList.filter((s) => s.nik_wali === nikWali);
    return matched.length > 0 ? matched : this.santriList.slice(0, 1);
  }

  addSantri(data: Omit<SantriRecord, 'id'>): SantriRecord {
    const newRecord: SantriRecord = {
      ...data,
      id: String(this.santriList.length + 1),
      nisp: data.nisp || `PNDK-${data.nisn}`,
    };
    this.santriList.unshift(newRecord);
    this.logAudit('admin@darsa.id', `Tambah Santri: ${newRecord.nama} (${newRecord.nisp})`, 'SANTRI');
    return newRecord;
  }

  updateSantri(id: string, updates: Partial<SantriRecord>): SantriRecord | null {
    const idx = this.santriList.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.santriList[idx] = { ...this.santriList[idx], ...updates };
    this.logAudit('admin@darsa.id', `Update Santri: ${this.santriList[idx].nama}`, 'SANTRI');
    return this.santriList[idx];
  }

  deleteSantri(id: string): boolean {
    const target = this.santriList.find((s) => s.id === id);
    if (target) {
      this.recycleBinList.unshift({
        id: Date.now().toString(),
        waktuHapus: new Date().toLocaleString('id-ID'),
        dihapusOleh: 'admin@darsa.id',
        tipeData: 'Data Santri',
        detail: `Santri: ${target.nama} (${target.nisp})`,
        originalPayload: target,
      });
      this.santriList = this.santriList.filter((s) => s.id !== id);
      this.logAudit('admin@darsa.id', `Soft Delete Santri: ${target.nama}`, 'SANTRI');
      return true;
    }
    return false;
  }

  // 2. Guru Queries & Mutations
  getGuru(instansi?: string, tahunAjaran?: string): GuruRecord[] {
    return this.guruList.filter((g) => {
      const matchInstansi = !instansi || g.instansi === instansi.toUpperCase();
      const matchTahun = !tahunAjaran || g.tahun_ajaran === tahunAjaran;
      return matchInstansi && matchTahun;
    });
  }

  addGuru(data: Omit<GuruRecord, 'id'>): GuruRecord {
    const newRecord: GuruRecord = {
      ...data,
      id: String(this.guruList.length + 1),
    };
    this.guruList.unshift(newRecord);
    this.logAudit('admin@darsa.id', `Tambah Pengajar: ${newRecord.nama}`, 'GURU');
    return newRecord;
  }

  deleteGuru(id: string): boolean {
    const target = this.guruList.find((g) => g.id === id);
    if (target) {
      this.recycleBinList.unshift({
        id: Date.now().toString(),
        waktuHapus: new Date().toLocaleString('id-ID'),
        dihapusOleh: 'admin@darsa.id',
        tipeData: 'Data Guru',
        detail: `Guru: ${target.nama}`,
        originalPayload: target,
      });
      this.guruList = this.guruList.filter((g) => g.id !== id);
      this.logAudit('admin@darsa.id', `Soft Delete Guru: ${target.nama}`, 'GURU');
      return true;
    }
    return false;
  }

  // 3. Surat / Perizinan Queries & Mutations
  getSurat(instansi?: string, tahunAjaran?: string): SuratRecord[] {
    return this.suratList.filter((s) => {
      const matchInstansi = !instansi || s.instansi === instansi.toUpperCase();
      const matchTahun = !tahunAjaran || s.tahun_ajaran === tahunAjaran;
      return matchInstansi && matchTahun;
    });
  }

  addSurat(data: Omit<SuratRecord, 'id'>): SuratRecord {
    const newRecord: SuratRecord = {
      ...data,
      id: String(this.suratList.length + 1),
    };
    this.suratList.unshift(newRecord);
    this.logAudit('admin@darsa.id', `Penerbitan Surat: ${newRecord.nomor}`, 'KEAMANAN');
    return newRecord;
  }

  deleteSurat(id: string): boolean {
    const target = this.suratList.find((s) => s.id === id);
    if (target) {
      this.recycleBinList.unshift({
        id: Date.now().toString(),
        waktuHapus: new Date().toLocaleString('id-ID'),
        dihapusOleh: 'admin@darsa.id',
        tipeData: 'Data Perizinan',
        detail: `Surat: ${target.nomor}`,
        originalPayload: target,
      });
      this.suratList = this.suratList.filter((s) => s.id !== id);
      this.logAudit('admin@darsa.id', `Soft Delete Surat: ${target.nomor}`, 'KEAMANAN');
      return true;
    }
    return false;
  }

  // 4. Asrama Queries & Mutations
  getAsrama(): KamarAsramaRecord[] {
    return this.asramaList;
  }

  addAsrama(data: Omit<KamarAsramaRecord, 'id'>): KamarAsramaRecord {
    const record: KamarAsramaRecord = { ...data, id: String(this.asramaList.length + 1) };
    this.asramaList.unshift(record);
    this.logAudit('admin@darsa.id', `Tambah Kamar Asrama: ${record.nomorKamar}`, 'ASRAMA');
    return record;
  }

  // 5. Pengurus Queries & Mutations
  getPengurus(): PengurusRecord[] {
    return this.pengurusList;
  }

  addPengurus(data: Omit<PengurusRecord, 'id'>): PengurusRecord {
    const record: PengurusRecord = { ...data, id: String(this.pengurusList.length + 1) };
    this.pengurusList.unshift(record);
    this.logAudit('admin@darsa.id', `Tambah Pengurus: ${record.nama}`, 'PENGURUS');
    return record;
  }

  // 6. Alumni Queries & Mutations
  getAlumni(): AlumniRecord[] {
    return this.alumniList;
  }

  addAlumni(data: Omit<AlumniRecord, 'id'>): AlumniRecord {
    const record: AlumniRecord = { ...data, id: String(this.alumniList.length + 1) };
    this.alumniList.unshift(record);
    this.logAudit('admin@darsa.id', `Pendataan Alumni: ${record.nama}`, 'ALUMNI');
    return record;
  }

  // 7. Pelanggaran Queries & Mutations
  getPelanggaran(): PelanggaranRecord[] {
    return this.pelanggaranList;
  }

  addPelanggaran(data: Omit<PelanggaranRecord, 'id'>): PelanggaranRecord {
    const record: PelanggaranRecord = { ...data, id: String(this.pelanggaranList.length + 1) };
    this.pelanggaranList.unshift(record);
    this.logAudit('admin@darsa.id', `Catat Pelanggaran: ${record.santriNama}`, 'KEAMANAN');
    return record;
  }

  // 8. Tahun Ajaran Queries & Mutations
  getTahunAjaran(): TahunAjaranRecord[] {
    return this.tahunAjaranList;
  }

  // 9. Audit Log & Recycle Bin
  getAuditLog(): AuditLogRecord[] {
    return this.auditLogList;
  }

  getRecycleBin(): RecycleBinRecord[] {
    return this.recycleBinList;
  }

  restoreRecycleBin(id: string): boolean {
    const target = this.recycleBinList.find((r) => r.id === id);
    if (target) {
      if (target.tipeData === 'Data Santri') {
        this.santriList.unshift(target.originalPayload);
      } else if (target.tipeData === 'Data Guru') {
        this.guruList.unshift(target.originalPayload);
      } else if (target.tipeData === 'Data Perizinan') {
        this.suratList.unshift(target.originalPayload);
      }
      this.recycleBinList = this.recycleBinList.filter((r) => r.id !== id);
      this.logAudit('admin@darsa.id', `Restore Data: ${target.detail}`, 'RECYCLE_BIN');
      return true;
    }
    return false;
  }

  permanentDeleteRecycleBin(id: string): boolean {
    const target = this.recycleBinList.find((r) => r.id === id);
    if (target) {
      this.recycleBinList = this.recycleBinList.filter((r) => r.id !== id);
      this.logAudit('admin@darsa.id', `Hapus Permanen: ${target.detail}`, 'RECYCLE_BIN');
      return true;
    }
    return false;
  }

  // 10. Konfigurasi Sistem
  getKonfigurasi(): KonfigurasiRecord {
    return this.konfigurasi;
  }

  updateKonfigurasi(updates: Partial<KonfigurasiRecord>): KonfigurasiRecord {
    this.konfigurasi = { ...this.konfigurasi, ...updates };
    this.logAudit('admin@darsa.id', 'Perubahan Konfigurasi Sistem', 'CONFIG');
    return this.konfigurasi;
  }

  // 11. Broadcast Pengumuman, Transaksi, Jadwal, & Setoran
  getPengumuman(instansi?: string, target?: string): PengumumanRecord[] {
    return this.pengumumanList.filter((p) => {
      const matchInstansi = !instansi || p.instansi === 'SEMUA' || p.instansi === instansi.toUpperCase();
      const matchTarget = !target || p.target === 'SEMUA' || p.target === target.toUpperCase();
      return matchInstansi && matchTarget;
    });
  }

  addPengumuman(data: Omit<PengumumanRecord, 'id'>): PengumumanRecord {
    const newRecord: PengumumanRecord = {
      ...data,
      id: String(this.pengumumanList.length + 1),
    };
    this.pengumumanList.unshift(newRecord);
    this.logAudit('admin@darsa.id', `Broadcast Pengumuman: ${newRecord.judul}`, 'PENGUMUMAN');
    return newRecord;
  }

  getTransaksi(instansi?: string, tahunAjaran?: string): TransaksiRecord[] {
    return this.transaksiList.filter((t) => {
      const matchInstansi = !instansi || t.instansi === instansi.toUpperCase();
      const matchTahun = !tahunAjaran || t.tahun_ajaran === tahunAjaran;
      return matchInstansi && matchTahun;
    });
  }

  addTransaksi(data: Omit<TransaksiRecord, 'id'>): TransaksiRecord {
    const record: TransaksiRecord = { ...data, id: String(this.transaksiList.length + 1) };
    this.transaksiList.unshift(record);
    this.logAudit('admin@darsa.id', `Transaksi SPP: ${record.santri_nama}`, 'TRANSAKSI');
    return record;
  }

  getJadwal(instansi?: string): JadwalRecord[] {
    return this.jadwalList.filter((j) => !instansi || j.instansi === instansi.toUpperCase());
  }

  addJadwal(data: Omit<JadwalRecord, 'id'>): JadwalRecord {
    const record: JadwalRecord = { ...data, id: String(this.jadwalList.length + 1) };
    this.jadwalList.unshift(record);
    this.logAudit('admin@darsa.id', `Tambah Slot Jadwal: ${record.mapel} (${record.kelas})`, 'JADWAL');
    return record;
  }

  deleteJadwal(id: string): boolean {
    const initialLen = this.jadwalList.length;
    this.jadwalList = this.jadwalList.filter((j) => j.id !== id);
    return this.jadwalList.length < initialLen;
  }

  getSetoran(instansi?: string): SetoranRecord[] {
    return this.setoranList.filter((s) => !instansi || s.instansi === instansi.toUpperCase());
  }

  addSetoran(data: Omit<SetoranRecord, 'id'>): SetoranRecord {
    const record: SetoranRecord = { ...data, id: String(this.setoranList.length + 1) };
    this.setoranList.unshift(record);
    this.logAudit('admin@darsa.id', `Setoran Tahfidz: ${record.santri_nama} - Juz ${record.juz}`, 'SETORAN');
    return record;
  }
}

export const simulationDb = new SimulationDatabaseStore();
