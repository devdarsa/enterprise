import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@darsa/utils';

export async function GET() {
  const sampleRapor = {
    santri: {
      nisn: '0012345678',
      nama_lengkap: 'Muhammad Raihan',
      kelas: '10-A (Tahfidz & Sains)',
      tahun_ajaran: '2025/2026',
      semester: 'Ganjil',
      wali_kelas: 'Dr. KH. Abdullah Ridwan',
    },
    tahfidz: {
      hafalan_juz: 12,
      surah_terakhir: 'Surah Al-Isra (Juz 15)',
      predikat: 'MUMTAZ (Sangat Baik)',
      nilai_tajwid: 95,
      nilai_makhraj: 92,
    },
    akademik: [
      { mata_pelajaran: 'Fiqih & Usul Fiqih', KKM: 75, nilai_harian: 88, UTS: 90, UAS: 92, akhir: 90, predikat: 'A' },
      { mata_pelajaran: 'Bahasa Arab (Nahu-Saraf)', KKM: 75, nilai_harian: 85, UTS: 88, UAS: 90, akhir: 88, predikat: 'A' },
      { mata_pelajaran: 'Hadits & Mustalah Hadits', KKM: 75, nilai_harian: 92, UTS: 95, UAS: 94, akhir: 94, predikat: 'A' },
      { mata_pelajaran: 'Matematika Terapan', KKM: 70, nilai_harian: 80, UTS: 82, UAS: 85, akhir: 83, predikat: 'B+' },
    ],
    kehadiran: {
      hadir: 94,
      terlambat: 2,
      izin: 1,
      alpa: 0,
    },
    catatan_wali: 'Ananda Raihan sangat tekun dalam hafalan Al-Qur\'an dan berakhlak mulia. Pertahankan prestasi ini.',
  };

  return NextResponse.json(
    createSuccessResponse(sampleRapor, 'Data Rapor Santri Digital berhasil diambil')
  );
}
