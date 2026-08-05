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
  nisp: string; // Nomor Induk Santri Pondok (Stambuk)
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
  nik_wali?: string; // NIK Kependudukan Wali untuk penyambungan akun otomatis
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
}

export interface SuratRecord {
  id: string;
  nomor: string;
  jenis: string;
  perihal: string;
  pengirim: string;
  penerima: string;
  tanggal: string;
  status: 'DISETUJUI' | 'PENDING' | 'ARSIP';
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
      alamat: 'Jl. KH. Abdul Karim No. 12, Lirboyo, Kota Kediri',
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
      nik_wali: '3571012304850001', // Wali sama (Penyambungan 2 santri dalam 1 akun NIK Wali)
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

  // Penempatan Pendidikan Santri per Unit (BAB V - Dual Enrollment)
  private penempatanList: PenempatanPendidikanRecord[] = [
    { id: '1', santri_id: '1', nisp: 'PNDK-0012345678', tahun_ajaran: '2025/2026 (Ganjil)', semester: 'Ganjil', unit: 'MADRASAH', tingkat: 'Tsanawiyyah', kelas: '10-A (Tahfidz & Diniyah)', wali_kelas: 'Dr. KH. Abdullah Ridwan', status: 'AKTIF' },
    { id: '2', santri_id: '1', nisp: 'PNDK-0012345678', tahun_ajaran: '2025/2026 (Ganjil)', semester: 'Ganjil', unit: 'MI', tingkat: 'VI', kelas: 'VI-B', wali_kelas: 'Ustadzah Fatimah, S.Pd', status: 'AKTIF' },
    { id: '3', santri_id: '2', nisp: 'PNDK-0012345679', tahun_ajaran: '2025/2026 (Ganjil)', semester: 'Ganjil', unit: 'MADRASAH', tingkat: 'Tsanawiyyah', kelas: '10-A (Tahfidz & Diniyah)', wali_kelas: 'Dr. KH. Abdullah Ridwan', status: 'AKTIF' },
    { id: '4', santri_id: '3', nisp: 'PNDK-0012345680', tahun_ajaran: '2025/2026 (Ganjil)', semester: 'Ganjil', unit: 'MADRASAH', tingkat: 'Aliyah', kelas: '11-B (Diniyah Putri)', wali_kelas: 'Ustadz Ahmad Al-Farisi', status: 'AKTIF' },
  ];

  private guruList: GuruRecord[] = [
    {
      id: '1',
      nip: '198504122015031002',
      nama: 'Dr. KH. Abdullah Ridwan',
      tugas: 'Mustahiq Kelas 10-A & Guru Fiqih',
      telepon: '08123456789',
      instansi: 'MADRASAH',
      tahun_ajaran: '2025/2026 (Ganjil)',
    },
    {
      id: '2',
      nip: '199009182019031005',
      nama: 'Ustadz Ahmad Al-Farisi',
      tugas: 'Pengajar Nahwu Alfiyyah',
      telepon: '08198765432',
      instansi: 'MADRASAH',
      tahun_ajaran: '2025/2026 (Ganjil)',
    },
    {
      id: '3',
      nip: '199208152018022003',
      nama: 'Ustadzah Fatimah, S.Pd',
      tugas: 'Guru MI Formal & Wali Kelas 4-A',
      telepon: '08571234567',
      instansi: 'MI',
      tahun_ajaran: '2025/2026 (Ganjil)',
    },
  ];

  private suratList: SuratRecord[] = [
    {
      id: '1',
      nomor: 'SURAT-001/DARSA/VIII/2026',
      jenis: 'IZIN PULANG',
      perihal: 'Pengajuan Izin Pulang Santri: Ahmad Fauzi (Pernikahan Saudara)',
      pengirim: 'Bapak Hendra (Wali Santri)',
      penerima: 'Sekretariat Utama Pondok',
      tanggal: '3 Agt 2026',
      status: 'DISETUJUI',
      instansi: 'PONDOK',
      tahun_ajaran: '2025/2026 (Ganjil)',
    },
  ];

  private transaksiList: TransaksiRecord[] = [];
  private jadwalList: JadwalRecord[] = [];
  private setoranList: SetoranRecord[] = [];

  private pengumumanList: PengumumanRecord[] = [
    {
      id: '1',
      judul: 'Jadwal Libur Akhir Semester Diniyah & Pondok',
      isi: 'Pengumuman resmi libur akhir semester ganjil santri pesantren dan madrasah diniyah Lirboyo Kediri.',
      target: 'SEMUA',
      instansi: 'SEMUA',
      tanggal: '1 Agt 2026',
      penulis: 'Sekretariat Utama',
      penting: true,
    },
    {
      id: '2',
      judul: 'Pelaksanaan Ujian Syafahi (Lisan) Kitab Kuning',
      isi: 'Ujian syafahi hafalan Fathul Qarib dan Imrithy akan dilaksanakan serentak mulai Senin pekan depan.',
      target: 'WALI_SANTRI',
      instansi: 'MADRASAH',
      tanggal: '28 Jul 2026',
      penulis: 'Sekretariat Diniyah',
      penting: false,
    },
  ];

  // 1. Santri Queries & Mutations (BAB I & BAB VII: Single Source of Truth + Unit Placement Reference)
  getSantri(instansi?: string, tahunAjaran?: string): SantriRecord[] {
    const targetInst = instansi?.toUpperCase() || 'PONDOK';

    return this.santriList
      .filter((s) => {
        if (targetInst === 'PONDOK') return true;
        // Referensi Penempatan Pendidikan per Unit (BAB VII)
        return this.penempatanList.some(
          (p) => p.santri_id === s.id && p.unit === targetInst && p.status === 'AKTIF'
        );
      })
      .map((s) => {
        // Enriched with Dual-Enrollment Educational Placements (BAB VI)
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
    return newRecord;
  }

  updateSantri(id: string, updates: Partial<SantriRecord>): SantriRecord | null {
    const idx = this.santriList.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.santriList[idx] = { ...this.santriList[idx], ...updates };
    return this.santriList[idx];
  }

  deleteSantri(id: string): boolean {
    const initialLen = this.santriList.length;
    this.santriList = this.santriList.filter((s) => s.id !== id);
    return this.santriList.length < initialLen;
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
    return synced;
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
    return newRecord;
  }

  deleteGuru(id: string): boolean {
    const initialLen = this.guruList.length;
    this.guruList = this.guruList.filter((g) => g.id !== id);
    return this.guruList.length < initialLen;
  }

  // 3. Surat Queries & Mutations
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
    return newRecord;
  }

  deleteSurat(id: string): boolean {
    const initialLen = this.suratList.length;
    this.suratList = this.suratList.filter((s) => s.id !== id);
    return this.suratList.length < initialLen;
  }

  // 4. Pengumuman Queries & Mutations
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
    return newRecord;
  }

  // 5. Transaksi Queries & Mutations
  getTransaksi(instansi?: string, tahunAjaran?: string): TransaksiRecord[] {
    return this.transaksiList.filter((t) => {
      const matchInstansi = !instansi || t.instansi === instansi.toUpperCase();
      const matchTahun = !tahunAjaran || t.tahun_ajaran === tahunAjaran;
      return matchInstansi && matchTahun;
    });
  }

  addTransaksi(data: Omit<TransaksiRecord, 'id'>): TransaksiRecord {
    const newRecord: TransaksiRecord = {
      ...data,
      id: `TRX-${String(this.transaksiList.length + 1).padStart(3, '0')}`,
    };
    this.transaksiList.push(newRecord);
    return newRecord;
  }

  // 7. Jadwal Queries & Mutations
  getJadwal(instansi?: string): JadwalRecord[] {
    return this.jadwalList.filter((j) => {
      return !instansi || j.instansi === instansi.toUpperCase();
    });
  }

  addJadwal(data: Omit<JadwalRecord, 'id'>): JadwalRecord {
    const newRecord: JadwalRecord = {
      ...data,
      id: String(this.jadwalList.length + 1),
    };
    this.jadwalList.push(newRecord);
    return newRecord;
  }

  deleteJadwal(id: string): boolean {
    const initialLen = this.jadwalList.length;
    this.jadwalList = this.jadwalList.filter((j) => j.id !== id);
    return this.jadwalList.length < initialLen;
  }

  // 8. Setoran Tahfidz Queries & Mutations
  getSetoran(instansi?: string): SetoranRecord[] {
    return this.setoranList.filter((s) => {
      return !instansi || s.instansi === instansi.toUpperCase();
    });
  }

  addSetoran(data: Omit<SetoranRecord, 'id'>): SetoranRecord {
    const newRecord: SetoranRecord = {
      ...data,
      id: String(this.setoranList.length + 1),
    };
    this.setoranList.unshift(newRecord);
    return newRecord;
  }
}

export const simulationDb = new SimulationDatabaseStore();
