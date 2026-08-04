/**
 * Darsa Enterprise - Local Database Store Engine
 * Database Engine Murni per Instansi tanpa data dummy/mock.
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
  private santriList: SantriRecord[] = [];
  private guruList: GuruRecord[] = [];
  private suratList: SuratRecord[] = [];
  private transaksiList: TransaksiRecord[] = [];
  private inventarisList: InventarisRecord[] = [];
  private jadwalList: JadwalRecord[] = [];
  private setoranList: SetoranRecord[] = [];

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
