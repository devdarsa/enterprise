/**
 * Darsa Enterprise - Local Database Simulation Engine
 * Engine pengelola data lokal dinamis per instansi tanpa data statis (hardcoded).
 */

export interface SantriRecord {
  id: string;
  nisn: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  kelas: string;
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
  tahun_ajaran: string;
  status: 'AKTIF' | 'NON_AKTIF';
  hafalan_juz: number;
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

export interface InventarisRecord {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  jumlah: number;
  kondisi: 'BAIK' | 'PERBAIKAN' | 'RUSAK';
  lokasi: string;
  tahun_pengadaan: string;
  nilai_satuan: number;
  instansi: 'PONDOK' | 'MADRASAH' | 'MI';
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

// Database Store Class
class SimulationDatabaseStore {
  private santriList: SantriRecord[] = [
    { id: '1', nisn: '0012345678', nama: 'Muhammad Raihan', jenis_kelamin: 'L', kelas: '10-A (Tahfidz)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 12 },
    { id: '2', nisn: '0012345679', nama: 'Ahmad Fauzi', jenis_kelamin: 'L', kelas: '10-A (Tahfidz)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 10 },
    { id: '3', nisn: '0012345680', nama: 'Siti Aminah', jenis_kelamin: 'P', kelas: '11-B (Sains)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 8 },
    { id: '4', nisn: '0012345681', nama: 'Fajar Hidayat', jenis_kelamin: 'L', kelas: '12-C (IPS)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 15 },
    { id: '5', nisn: '0012345682', nama: 'Nurul Hidayah', jenis_kelamin: 'P', kelas: '10-A (Tahfidz)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 6 },
    { id: '6', nisn: '0012345690', nama: 'Zaidan Al-Khattab', jenis_kelamin: 'L', kelas: '7-A Diniyah', instansi: 'MADRASAH', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 3 },
    { id: '7', nisn: '0012345695', nama: 'Bilqis Humaira', jenis_kelamin: 'P', kelas: 'MI Kelas 4', instansi: 'MI', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 1 },
  ];

  private guruList: GuruRecord[] = [
    { id: '1', nip: '198501012010011001', nama: 'Dr. KH. Abdullah Ridwan', tugas: 'Pengasuh & Ustadz Hadits', telepon: '081234567890', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)' },
    { id: '2', nip: '198803152012012002', nama: 'Ustadz Ahmad Al-Farisi', tugas: 'Kepala Diniyah & Fiqih', telepon: '081298765432', instansi: 'MADRASAH', tahun_ajaran: '2025/2026 (Ganjil)' },
    { id: '3', nip: '199207202015011003', nama: 'Ust. Muhammad Zulkarnain', tugas: 'Pengajar Nahwu Saraf', telepon: '081311223344', instansi: 'MADRASAH', tahun_ajaran: '2025/2026 (Ganjil)' },
    { id: '4', nip: '199511102018012004', nama: 'Ustadzah Fatimah Azzahra', tugas: 'Guru Kelas MI & Tahfidz', telepon: '081355667788', instansi: 'MI', tahun_ajaran: '2025/2026 (Ganjil)' },
  ];

  private suratList: SuratRecord[] = [
    { id: '1', nomor: 'SRT/2026/08/001', jenis: 'SURAT_IZIN_SANTRI', perihal: 'Izin Pulang Santri (Keperluan Keluarga)', pengirim: 'Wali Santri M. Raihan', penerima: 'Pengasuh Pondok', tanggal: '02 Ags 2026', status: 'DISETUJUI', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)' },
    { id: '2', nomor: 'SRT/2026/07/042', jenis: 'SURAT_MASUK', perihal: 'Undangan Ujian Diniyah Nasional', pengirim: 'Kemenag Kediri', penerima: 'Kepala Diniyah', tanggal: '28 Jul 2026', status: 'ARSIP', instansi: 'MADRASAH', tahun_ajaran: '2025/2026 (Ganjil)' },
    { id: '3', nomor: 'SRT/2026/07/041', jenis: 'SURAT_KELUAR', perihal: 'Permohonan Bantuan Operasional MI', pengirim: 'Madrasah MI', penerima: 'Dinas Pendidikan', tanggal: '25 Jul 2026', status: 'ARSIP', instansi: 'MI', tahun_ajaran: '2025/2026 (Ganjil)' },
  ];

  private transaksiList: TransaksiRecord[] = [
    { id: 'TRX-001', santri_nisn: '0012345678', santri_nama: 'Muhammad Raihan', jenis: 'SPP_AGUSTUS_2026', nominal: 350000, metode: 'BCA_VA', status: 'LUNAS', tanggal: '03 Ags 2026', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)' },
    { id: 'TRX-002', santri_nisn: '0012345679', santri_nama: 'Ahmad Fauzi', jenis: 'SPP_AGUSTUS_2026', nominal: 350000, metode: 'MANDIRI_VA', status: 'LUNAS', tanggal: '02 Ags 2026', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)' },
    { id: 'TRX-003', santri_nisn: '0012345680', santri_nama: 'Siti Aminah', jenis: 'SPP_AGUSTUS_2026', nominal: 350000, metode: 'QRIS', status: 'PENDING', tanggal: '02 Ags 2026', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)' },
  ];

  private inventarisList: InventarisRecord[] = [
    { id: '1', kode: 'INV-PC-001', nama: 'Komputer Desktop Core i7', kategori: 'Elektronik & TI', jumlah: 25, kondisi: 'BAIK', lokasi: 'Lab Komputer 1', tahun_pengadaan: '2023', nilai_satuan: 8500000, instansi: 'PONDOK' },
    { id: '2', kode: 'INV-PJ-002', nama: 'Proyektor Epson EB-X500', kategori: 'Elektronik', jumlah: 8, kondisi: 'BAIK', lokasi: 'Ruang Kelas 10 & 11', tahun_pengadaan: '2024', nilai_satuan: 5200000, instansi: 'PONDOK' },
    { id: '3', kode: 'INV-AC-003', nama: 'AC Split Daikin 2 PK', kategori: 'Pendingin Ruang', jumlah: 12, kondisi: 'PERBAIKAN', lokasi: 'Masjid Utama & Aula', tahun_pengadaan: '2022', nilai_satuan: 4800000, instansi: 'MADRASAH' },
    { id: '4', kode: 'INV-MJ-004', nama: 'Meja & Kursi Belajar Santri Jati', kategori: 'Mebel', jumlah: 450, kondisi: 'BAIK', lokasi: 'Seluruh Kelas', tahun_pengadaan: '2021', nilai_satuan: 850000, instansi: 'PONDOK' },
    { id: '5', kode: 'INV-BK-005', nama: 'Rak Buku Kitab Kuning', kategori: 'Mebel', jumlah: 40, kondisi: 'BAIK', lokasi: 'Perpustakaan Diniyah', tahun_pengadaan: '2023', nilai_satuan: 1200000, instansi: 'MADRASAH' },
    { id: '6', kode: 'INV-CCTV-006', nama: 'Kamera CCTV Hikvision 4MP', kategori: 'Keamanan', jumlah: 16, kondisi: 'BAIK', lokasi: 'Gedung MI', tahun_pengadaan: '2025', nilai_satuan: 750000, instansi: 'MI' },
  ];

  private jadwalList: JadwalRecord[] = [
    { id: '1', hari: 'Senin', jam: '07:30 - 09:00', mapel: "Tahfidz Al-Qur'an", guru: 'Ustadzah Fatimah Azzahra', ruang: 'Ruang 10-A', kelas: '10-A', jenis: 'WAJIB', instansi: 'PONDOK' },
    { id: '2', hari: 'Senin', jam: '09:30 - 11:00', mapel: 'Bahasa Arab (Saraf)', guru: 'Ust. M. Zulkarnain', ruang: 'Ruang 10-A', kelas: '10-A', jenis: 'WAJIB', instansi: 'PONDOK' },
    { id: '3', hari: 'Selasa', jam: '07:30 - 09:00', mapel: 'Fiqih & Usul Fiqih', guru: 'Ust. Ahmad Al-Farisi', ruang: 'Ruang 10-A', kelas: '10-A', jenis: 'WAJIB', instansi: 'MADRASAH' },
    { id: '4', hari: 'Rabu', jam: '09:30 - 11:00', mapel: 'Tafsir Jalalain', guru: 'Dr. KH. A. Ridwan', ruang: 'Ruang 10-A', kelas: '10-A', jenis: 'WAJIB', instansi: 'MADRASAH' },
    { id: '5', hari: 'Kamis', jam: '07:30 - 09:00', mapel: "Hadits Arba'in", guru: 'Dr. KH. A. Ridwan', ruang: 'Masjid Utama', kelas: '10-A', jenis: 'WAJIB', instansi: 'PONDOK' },
    { id: '6', hari: 'Sabtu', jam: '15:30 - 17:00', mapel: 'Ekstrakurikuler Memanah', guru: 'Pelatih Ridho', ruang: 'Lapangan MI', kelas: '10-A', jenis: 'EKSTRAKURIKULER', instansi: 'MI' },
  ];

  private setoranList: SetoranRecord[] = [
    { id: '1', santri_nama: 'Muhammad Raihan', kelas: '10-A (Tahfidz)', juz: 15, surah: 'Al-Isra', nilai: 95, tanggal: 'Hari Ini', ustadz: 'Ust. Fatimah Azzahra', instansi: 'PONDOK' },
    { id: '2', santri_nama: 'Ahmad Fauzi', kelas: '10-A (Tahfidz)', juz: 12, surah: 'Yusuf', nilai: 88, tanggal: 'Hari Ini', ustadz: 'Ust. Fatimah Azzahra', instansi: 'PONDOK' },
    { id: '3', santri_nama: 'Siti Aminah', kelas: '11-B (Sains)', juz: 18, surah: 'Al-Kahfi', nilai: 92, tanggal: 'Kemarin', ustadz: 'Ust. Fatimah Azzahra', instansi: 'PONDOK' },
    { id: '4', santri_nama: 'Zaidan Al-Khattab', kelas: '7-A Diniyah', juz: 3, surah: 'Al-Baqarah', nilai: 90, tanggal: 'Hari Ini', ustadz: 'Ust. Ahmad Al-Farisi', instansi: 'MADRASAH' },
  ];

  // 1. Santri Queries & Mutations
  getSantri(instansi?: string, tahunAjaran?: string): SantriRecord[] {
    return this.santriList.filter((s) => {
      const matchInstansi = !instansi || s.instansi === instansi.toUpperCase();
      const matchTahun = !tahunAjaran || s.tahun_ajaran === tahunAjaran;
      return matchInstansi && matchTahun;
    });
  }

  addSantri(data: Omit<SantriRecord, 'id'>): SantriRecord {
    const newRecord: SantriRecord = {
      ...data,
      id: String(this.santriList.length + 1),
    };
    this.santriList.push(newRecord);
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
    this.guruList.push(newRecord);
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
    this.suratList.push(newRecord);
    return newRecord;
  }

  deleteSurat(id: string): boolean {
    const initialLen = this.suratList.length;
    this.suratList = this.suratList.filter((s) => s.id !== id);
    return this.suratList.length < initialLen;
  }

  // 4. Transaksi Queries & Mutations
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

  // 5. Inventaris Queries & Mutations
  getInventaris(instansi?: string): InventarisRecord[] {
    return this.inventarisList.filter((i) => {
      return !instansi || i.instansi === instansi.toUpperCase();
    });
  }

  addInventaris(data: Omit<InventarisRecord, 'id'>): InventarisRecord {
    const newRecord: InventarisRecord = {
      ...data,
      id: String(this.inventarisList.length + 1),
    };
    this.inventarisList.unshift(newRecord);
    return newRecord;
  }

  deleteInventaris(id: string): boolean {
    const initialLen = this.inventarisList.length;
    this.inventarisList = this.inventarisList.filter((i) => i.id !== id);
    return this.inventarisList.length < initialLen;
  }

  // 6. Jadwal Queries & Mutations
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

  // 7. Setoran Tahfidz Queries & Mutations
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
