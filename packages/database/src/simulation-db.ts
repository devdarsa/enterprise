/**
 * Darsa Enterprise - Local Database Simulation Engine
 * Engine pengelola data lokal dinamis tanpa data statis (hardcoded).
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

// Initial Local Database State Store
class SimulationDatabaseStore {
  private santriList: SantriRecord[] = [
    { id: '1', nisn: '0012345678', nama: 'Muhammad Raihan', jenis_kelamin: 'L', kelas: '10-A (Tahfidz)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 12 },
    { id: '2', nisn: '0012345679', nama: 'Ahmad Fauzi', jenis_kelamin: 'L', kelas: '10-A (Tahfidz)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 10 },
    { id: '3', nisn: '0012345680', nama: 'Siti Aminah', jenis_kelamin: 'P', kelas: '11-B (Sains)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 8 },
    { id: '4', nisn: '0012345681', nama: 'Fajar Hidayat', jenis_kelamin: 'L', kelas: '12-C (IPS)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 15 },
    { id: '5', nisn: '0012345682', nama: 'Nurul Hidayah', jenis_kelamin: 'P', kelas: '10-A (Tahfidz)', instansi: 'PONDOK', tahun_ajaran: '2025/2026 (Ganjil)', status: 'AKTIF', hafalan_juz: 6 },
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
}

export const simulationDb = new SimulationDatabaseStore();
