'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SantriOption {
  nisp: string;
  nisn: string;
  nama: string;
  kelas_pondok: string;
  status_pondok: string;
}

export default function TarikDataSantriPage() {
  const [targetInstansi, setTargetInstansi] = useState('Madrasah Diniyah');
  const [selectedSantri, setSelectedSantri] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSantri, setLoadingSantri] = useState(true);
  const [availablePondokSantri, setAvailablePondokSantri] = useState<SantriOption[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPondokSantriLive() {
      setLoadingSantri(true);
      try {
        const res = await fetch('/api/v1/santri?limit=50');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped = json.data.map((s: any) => ({
              nisp: s.nisp,
              nisn: s.nisn,
              nama: s.nama_lengkap,
              kelas_pondok: s.kelas?.nama_kelas || 'Pondok Utama',
              status_pondok: s.status || 'AKTIF_TERDAFTAR',
            }));
            setAvailablePondokSantri(mapped);
          }
        }
      } catch (e) {
        console.error('Gagal memuat master santri pondok:', e);
      } finally {
        setLoadingSantri(false);
      }
    }
    fetchPondokSantriLive();
  }, []);

  const handleToggleSelect = (nisn: string) => {
    if (selectedSantri.includes(nisn)) {
      setSelectedSantri(selectedSantri.filter((id) => id !== nisn));
    } else {
      setSelectedSantri([...selectedSantri, nisn]);
    }
  };

  const handleExecutePull = async () => {
    if (selectedSantri.length === 0) {
      alert('Pilih minimal 1 santri untuk ditarik!');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/santri/pull-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetInstansi,
          santriIds: selectedSantri,
        }),
      });

      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setMessage(data.message || 'Penarikan data santri dari Pondok Pesantren SSOT berhasil.');
        setTimeout(() => {
          window.location.href = '/admin/santri';
        }, 1500);
      } else {
        setMessage(`Gagal: ${data.error || 'Terjadi kesalahan sistem'}`);
      }
    } catch {
      setLoading(false);
      setMessage('Gagal menghubungi server.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner Warning Single Source of Truth */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-semibold flex items-start gap-3 shadow-sm">
        <span className="text-xl shrink-0">🏛️</span>
        <div>
          <strong className="block font-bold mb-0.5">BAB I PASAL 1 — SINGLE SOURCE OF TRUTH (SSOT):</strong>
          Data santri Pondok Pesantren adalah Master Utama. Madrasah & MI Formal dilarang membuat data santri baru secara manual. Gunakan modul ini untuk menarik penempatan data akademik dari Pondok Pesantren SSOT.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Tarik Data Penempatan Santri Pondok</h1>
          <p className="text-xs text-slate-500 mt-1">Sinkronisasi Referensi Data Master Pondok ➔ {targetInstansi}</p>
        </div>
        <Link
          href="/admin/santri"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all"
        >
          ← Kembali ke Master Santri
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Unit Instansi Tujuan Penempatan:</label>
          <select
            value={targetInstansi}
            onChange={(e) => setTargetInstansi(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Madrasah Diniyah">Madrasah Diniyah (Ula / Wustha / Aliyah)</option>
            <option value="MI Formal">Madrasah Ibtidaiyah (MI Formal)</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-slate-900">
              Pilih Santri Master Pondok Pesantren ({selectedSantri.length} Dipilih):
            </label>
            <button
              type="button"
              onClick={() => setSelectedSantri(availablePondokSantri.map((s) => s.nisn))}
              className="text-[11px] font-bold text-emerald-700 hover:underline"
            >
              Pilih Semua Santri
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {loadingSantri ? (
              <div className="p-8 text-center text-xs font-bold text-slate-500">Memuat master santri dari Pondok Pesantren SSOT...</div>
            ) : availablePondokSantri.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400">Belum ada master santri di Pondok Pesantren SSOT.</div>
            ) : (
              availablePondokSantri.map((santri) => {
                const isSelected = selectedSantri.includes(santri.nisn);
                return (
                  <div
                    key={santri.nisn}
                    onClick={() => handleToggleSelect(santri.nisn)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected ? 'bg-emerald-50/60 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{santri.nama}</span>
                        <span className="text-[11px] text-slate-500">
                          NISP: {santri.nisp} | NISN: {santri.nisn} | {santri.kelas_pondok}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      {santri.status_pondok}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {message && (
          <div className={`p-3.5 rounded-xl text-xs font-bold ${message.startsWith('Gagal') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {message}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleExecutePull}
            disabled={loading || selectedSantri.length === 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Memproses Penarikan...' : `📥 Eksekusi Tarik ${selectedSantri.length} Santri`}
          </button>
        </div>
      </div>
    </div>
  );
}
