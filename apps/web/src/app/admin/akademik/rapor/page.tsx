'use client';

import Image from 'next/image';

export default function RaporDigitalPage() {
  const raporData = {
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
      hadir: '96%',
      terlambat: '2 Kali',
      izin: '1 Hari',
      alpa: '0 Hari',
    },
    catatan_wali: 'Ananda Raihan sangat tekun dalam hafalan Al-Qur\'an dan berakhlak mulia. Pertahankan prestasi ini di semester mendatang.',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cetak Rapor Digital Santri</h1>
          <p className="text-xs text-slate-500">
            Pratinjau lembar hasil belajar santri terpadu (Akademik & Tahfidz Al-Qur'an)
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <span>🖨️</span> Cetak / Unduh PDF Rapor
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-8 md:p-10 rounded-3xl bg-white border border-emerald-100 shadow-2xl space-y-8 text-slate-900 print:p-0 print:border-none print:shadow-none">
        
        {/* Document Header Logo & Institution */}
        <div className="border-b-2 border-emerald-800 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full border-2 border-gold-500 overflow-hidden shadow-md shrink-0">
              <Image
                src="/logo-lirboyo.png"
                alt="Logo Ma'had Darussa'adah Lirboyo Kota Kediri"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-emerald-900 uppercase">
                MA'HAD DARUSSA'ADAH LIRBOYO
              </h2>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-0.5">
                PONDOK PESANTREN LIRBOYO KOTA KEDIRI • JAWA TIMUR
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Jl. KH. Abdul Karim, Lirboyo, Kota Kediri • Telp: (0354) 771542
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black font-mono">
              LEMBAR RAPOR DIGITAL
            </span>
          </div>
        </div>

        {/* Student Biodata Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs">
          <div>
            <span className="block text-slate-500 font-semibold">Nama Santri:</span>
            <span className="font-bold text-slate-900 text-sm">{raporData.santri.nama_lengkap}</span>
          </div>
          <div>
            <span className="block text-slate-500 font-semibold">NISN / ID:</span>
            <span className="font-mono text-emerald-800 font-bold">{raporData.santri.nisn}</span>
          </div>
          <div>
            <span className="block text-slate-500 font-semibold">Kelas / Rombel:</span>
            <span className="font-bold text-slate-800">{raporData.santri.kelas}</span>
          </div>
          <div>
            <span className="block text-slate-500 font-semibold">Tahun Ajaran / Sem:</span>
            <span className="font-bold text-slate-800">{raporData.santri.tahun_ajaran} ({raporData.santri.semester})</span>
          </div>
        </div>

        {/* Section 1: Capaian Tahfidz Al-Qur'an */}
        <div>
          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>📖</span> I. Capaian Tahfidz & Quranic Studies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block mb-1">Capaian Hafalan:</span>
              <span className="text-lg font-black text-slate-900">{raporData.tahfidz.hafalan_juz} Juz</span>
              <span className="block text-[11px] text-slate-600 mt-1 font-medium">{raporData.tahfidz.surah_terakhir}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block mb-1">Nilai Tajwid & Makhraj:</span>
              <span className="text-lg font-black text-emerald-700">{raporData.tahfidz.nilai_tajwid} / 100</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block mb-1">Predikat Tahfidz:</span>
              <span className="text-sm font-black text-emerald-800">{raporData.tahfidz.predikat}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Nilai Akademik & Diniyah Table */}
        <div>
          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>📚</span> II. Capaian Mata Pelajaran & Diniyah
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead>
                <tr className="bg-emerald-50 border-b border-emerald-200 text-slate-900 font-bold">
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3 text-center">KKM</th>
                  <th className="p-3 text-center">Nilai Harian</th>
                  <th className="p-3 text-center">UTS</th>
                  <th className="p-3 text-center">UAS</th>
                  <th className="p-3 text-center">Nilai Akhir</th>
                  <th className="p-3 text-center">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {raporData.akademik.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{row.mata_pelajaran}</td>
                    <td className="p-3 text-center font-mono text-slate-600">{row.KKM}</td>
                    <td className="p-3 text-center font-mono text-slate-700">{row.nilai_harian}</td>
                    <td className="p-3 text-center font-mono text-slate-700">{row.UTS}</td>
                    <td className="p-3 text-center font-mono text-slate-700">{row.UAS}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-800">{row.akhir}</td>
                    <td className="p-3 text-center font-bold text-emerald-800">{row.predikat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Catatan Wali Kelas */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs">
          <span className="block font-bold text-slate-900 mb-1">Catatan Wali Kelas:</span>
          <p className="text-slate-700 italic font-medium">{raporData.catatan_wali}</p>
        </div>

        {/* Section 4: Signatures */}
        <div className="grid grid-cols-2 text-center text-xs pt-8 border-t border-slate-200">
          <div>
            <p className="text-slate-500 font-semibold mb-16">Wali Santri / Orang Tua</p>
            <p className="font-bold text-slate-900">( ........................................ )</p>
          </div>
          <div>
            <p className="text-slate-500 font-semibold mb-16">Wali Kelas 10-A</p>
            <p className="font-bold text-slate-900">{raporData.santri.wali_kelas}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
