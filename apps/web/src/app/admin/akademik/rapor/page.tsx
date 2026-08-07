'use client';

import { useState, useEffect } from 'react';

interface RaporData {
  santri: {
    nisn: string;
    nama_lengkap: string;
    kelas: string;
    tahun_ajaran: string;
    semester: string;
    wali_kelas: string;
  };
  tahfidz: {
    hafalan_juz: number;
    surah_terakhir: string;
    predikat: string;
  };
  akademik: {
    mata_pelajaran: string;
    nilai_akhir: number;
    predikat: string;
  }[];
  kehadiran: {
    izin: number;
    pelanggaran: number;
  };
  catatan_wali: string;
}

export default function RaporDigitalPage() {
  const [raporData, setRaporData] = useState<RaporData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRaporLive() {
      setLoading(true);
      try {
        const resList = await fetch('/api/v1/santri?limit=1');
        if (resList.ok) {
          const jsonList = await resList.json();
          if (jsonList.success && jsonList.data && jsonList.data.length > 0) {
            const firstSantri = jsonList.data[0];
            const resDetail = await fetch(`/api/v1/santri/${firstSantri.id}`);
            if (resDetail.ok) {
              const jsonDetail = await resDetail.json();
              if (jsonDetail.success && jsonDetail.data) {
                const s = jsonDetail.data;
                const mappedNilai = (s.nilai || []).map((n: any) => ({
                  mata_pelajaran: n.mata_pelajaran?.nama_mapel || 'Mata Pelajaran',
                  nilai_akhir: n.nilai_akhir || n.nilai_uas || n.nilai_uts || 85,
                  predikat: (n.nilai_akhir || 85) >= 90 ? 'A' : (n.nilai_akhir || 85) >= 80 ? 'B' : 'C',
                }));

                setRaporData({
                  santri: {
                    nisn: s.nisn || s.nisp,
                    nama_lengkap: s.nama_lengkap,
                    kelas: s.kelas?.nama_kelas || 'Kelas Pesantren',
                    tahun_ajaran: '2025/2026',
                    semester: 'Ganjil',
                    wali_kelas: s.nama_wali || 'Mustahiq Diniyah',
                  },
                  tahfidz: {
                    hafalan_juz: s.hafalan_juz || 0,
                    surah_terakhir: s.hafalan_juz > 0 ? `Juz ${s.hafalan_juz}` : 'Al-Fatihah',
                    predikat: (s.hafalan_juz || 0) >= 10 ? 'MUMTAZ' : 'JAYYID',
                  },
                  akademik: mappedNilai,
                  kehadiran: {
                    izin: s.perizinan?.length || 0,
                    pelanggaran: s.pelanggaran?.length || 0,
                  },
                  catatan_wali: `Santri ${s.nama_lengkap} (NISP: ${s.nisp}) terdaftar aktif pada ${s.kelas?.nama_kelas || 'Pesantren'}.`,
                });
              }
            }
          }
        }
      } catch (e) {
        console.error('Gagal memuat rapor live:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchRaporLive();
  }, []);

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
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-500 bg-white rounded-3xl border border-slate-200">
          Memuat data rapor santri dari database...
        </div>
      ) : !raporData ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white rounded-3xl border border-slate-200">
          Belum ada data santri untuk dicetak rapornya.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 print:shadow-none print:border-none print:p-0">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6 text-center space-y-1">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
              PONDOK PESANTREN MA'HAD DARUSSA'ADAH
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              LEMBAR HASIL EVALUASI AKADEMIK & TAHFIDZ SANTRI (RAPOR DIGITAL)
            </p>
            <p className="text-[11px] text-slate-500">
              Tahun Ajaran {raporData.santri.tahun_ajaran} — Semester {raporData.santri.semester}
            </p>
          </div>

          {/* Student Metadata Header */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="space-y-1">
              <p><span className="font-bold text-slate-700">Nama Santri:</span> {raporData.santri.nama_lengkap}</p>
              <p><span className="font-bold text-slate-700">NISN / NISP:</span> {raporData.santri.nisn}</p>
              <p><span className="font-bold text-slate-700">Kelas / Jenjang:</span> {raporData.santri.kelas}</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-bold text-slate-700">Tahun Ajaran:</span> {raporData.santri.tahun_ajaran}</p>
              <p><span className="font-bold text-slate-700">Semester:</span> {raporData.santri.semester}</p>
              <p><span className="font-bold text-slate-700">Wali Santri / Kelas:</span> {raporData.santri.wali_kelas}</p>
            </div>
          </div>

          {/* Table Akademik */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">I. Capaian Pembelajaran Kitab & Akademik</h3>
            {raporData.akademik.length === 0 ? (
              <div className="p-4 text-center text-xs font-medium text-slate-400 bg-slate-50 rounded-xl border">
                Belum ada nilai akademik yang diinputkan untuk santri ini.
              </div>
            ) : (
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-700 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Mata Pelajaran / Kitab</th>
                    <th className="p-2.5">Nilai Akhir</th>
                    <th className="p-2.5">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {raporData.akademik.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{item.mata_pelajaran}</td>
                      <td className="p-2.5 font-bold text-emerald-700">{item.nilai_akhir}</td>
                      <td className="p-2.5 font-bold">{item.predikat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Catatan Wali */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80">
            <h3 className="text-xs font-bold text-emerald-900 mb-1">Catatan Wali Kelas / Pembimbing:</h3>
            <p className="text-xs text-emerald-800 italic">{raporData.catatan_wali}</p>
          </div>
        </div>
      )}
    </div>
  );
}
