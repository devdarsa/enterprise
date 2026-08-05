/**
 * Darsa Enterprise - Local Database Store Engine
 * Database Engine Murni per Instansi tanpa data hardcode di frontend.
 */

export interface SantriRecord {
  id: string;
  nisp: string; // Nomor Induk Santri Pondok (Stambuk)
  nisn: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  kelas: string;
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
  tahun_ajaran: string;
  status: 'AKTIF' | 'NON_AKTIF';
  hafalan_juz: number;
  nik_wali?: string; // NIK Kependudukan Wali untuk penyambungan akun otomatis
  nama_wali?: string;
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
  guru: string;
  ruang: string;
  kelas: string;
  jenis: 'WAJIB' | 'SUNNAH' | 'EKSTRAKURIKULER';
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
      nama: 'Muhammad Raihan',
      jenis_kelamin: 'L',
      kelas: '10-A (Tahfidz & Diniyah)',
      instansi: 'PONDOK',
      tahun_ajaran: '2025/2026 (Ganjil)',
      status: 'AKTIF',
      hafalan_juz: 15,
      nik_wali: '3571012304850001',
      nama_wali: 'Bapak Hendra',
    },
    {
      id: '2',
      nisp: 'PNDK-0012345679',
      nisn: '0012345679',
      nama: 'Ahmad Fauzi',
      jenis_kelamin: 'L',
      kelas: '10-A (Tahfidz & Diniyah)',
      instansi: 'PONDOK',
      tahun_ajaran: '2025/2026 (Ganjil)',
      status: 'AKTIF',
      hafalan_juz: 12,
      nik_wali: '3571012304850001', // Wali sama (Penyambungan 2 santri dalam 1 akun NIK Wali)
      nama_wali: 'Bapak Hendra',
    },
    {
      id: '3',
      nisp: 'PNDK-0012345680',
      nisn: '0012345680',
      nama: 'Siti Aminah',
      jenis_kelamin: 'P',
      kelas: '11-B (Diniyah Putri)',
      instansi: 'PONDOK',
      tahun_ajaran: '2025/2026 (Ganjil)',
      status: 'AKTIF',
      hafalan_juz: 8,
      nik_wali: '3571098706900002',
      nama_wali: 'Ibu Rahmawati',
    },
  ];

  private guruList: GuruRecord[] = [
    {
      id: '1',
      nip: '198504122010011002',
      nama: 'Dr. KH. Abdullah Ridwan',
      tugas: 'Pengasuh & Mustahiq Diniyah',
      telepon: '081234567890',
      instansi: 'MADRASAH',
      tahun_ajaran: '2025/2026 (Ganjil)',
    },
    {
      id: '2',
      nip: '199008232015022003',
      nama: 'Ustadz Ahmad Al-Farisi',
      tugas: 'Guru Mapel Nahwu & Sorof',
      telepon: '081987654321',
      instansi: 'MADRASAH',
      tahun_ajaran: '2025/2026 (Ganjil)',
    },
    {
      id: '3',
      nip: '199503152020031005',
      nama: 'Ustadzah Nurul Hidayah',
      tugas: 'Guru Absensi MI',
      telepon: '085712345678',
      instansi: 'MI',
      tahun_ajaran: '2025/2026 (Ganjil)',
    },
  ];

  private suratList: SuratRecord[] = [
    {
      id: '1',
      nomor: '001/PNDK/VIII/2026',
      jenis: 'IZIN PULANG',
      perihal: 'Izin Pulang Keperluan Keluarga',
      pengirim: 'Bapak Hendra (Wali)',
      penerima: 'Sekretariat Utama',
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
      isi: 'Pengumuman resmi libur semester genap dimulai tanggal 20 Agustus 2026. Santri wajib menyelesaikan seluruh administrasi perizinan sebelum penutupan gerbang.',
      target: 'SEMUA',
      instansi: 'PONDOK',
      tanggal: '3 Agt 2026',
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

  // 1. Santri Queries & Mutations
  getSantri(instansi?: string, tahunAjaran?: string): SantriRecord[] {
    return this.santriList.filter((s) => {
      const matchInstansi = !instansi || s.instansi === instansi.toUpperCase();
      const matchTahun = !tahunAjaran || s.tahun_ajaran === tahunAjaran;
      return matchInstansi && matchTahun;
    });
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
