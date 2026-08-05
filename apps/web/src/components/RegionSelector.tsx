'use client';

import { useState, useEffect } from 'react';

interface Region {
  id: string;
  name: string;
}

interface RegionSelectorProps {
  onChange: (address: string) => void;
  initialValue?: string;
}

export function RegionSelector({ onChange, initialValue }: RegionSelectorProps) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedRegency, setSelectedRegency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingPostcode, setLoadingPostcode] = useState(false);
  const [postcode, setPostcode] = useState('');
  const [detailStreet, setDetailStreet] = useState('');

  // 1. Fetch 100% Provinces (Official Cahyadsn API: https://wilayah.cahyadsn.com / github:cahyadsn/wilayah)
  useEffect(() => {
    async function fetchProvinces() {
      setLoading(true);
      try {
        let res = await fetch('https://wilayah.cahyadsn.com/api/provinces.json');
        if (!res.ok) {
          res = await fetch('https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/provinces.json');
        }
        if (!res.ok) {
          res = await fetch('https://cahyadsn.github.io/api-wilayah-indonesia/api/provinces.json');
        }
        if (!res.ok) {
          res = await fetch('/wilayah/provinces.json');
        }

        if (res.ok) {
          const data = await res.json();
          setProvinces(data || []);
        }
      } catch (err) {
        console.error('Error fetching Official Cahyadsn provinces:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProvinces();
  }, []);

  // 2. Fetch Regencies (Kabupaten / Kota) from Official Cahyadsn API
  useEffect(() => {
    if (!selectedProvince) return;
    async function fetchRegencies() {
      setLoading(true);
      try {
        const cleanProv = selectedProvince.replace(/\./g, '');
        let res = await fetch(`https://wilayah.cahyadsn.com/api/regencies/${cleanProv}.json`);
        if (!res.ok) {
          res = await fetch(`https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/regencies/${cleanProv}.json`);
        }
        if (!res.ok) {
          res = await fetch(`https://cahyadsn.github.io/api-wilayah-indonesia/api/regencies/${cleanProv}.json`);
        }
        if (!res.ok) {
          res = await fetch(`/wilayah/regencies/${cleanProv}.json`);
        }

        if (res.ok) {
          const data = await res.json();
          setRegencies(data || []);
        }
      } catch (err) {
        console.error('Error fetching Official Cahyadsn regencies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRegencies();
  }, [selectedProvince]);

  // 3. Fetch Districts (Kecamatan) from Official Cahyadsn API
  useEffect(() => {
    if (!selectedRegency) return;
    async function fetchDistricts() {
      setLoading(true);
      try {
        const cleanReg = selectedRegency.replace(/\./g, '');
        let res = await fetch(`https://wilayah.cahyadsn.com/api/districts/${cleanReg}.json`);
        if (!res.ok) {
          res = await fetch(`https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/districts/${cleanReg}.json`);
        }
        if (!res.ok) {
          res = await fetch(`https://cahyadsn.github.io/api-wilayah-indonesia/api/districts/${cleanReg}.json`);
        }
        if (!res.ok) {
          res = await fetch(`/wilayah/districts/${cleanReg}.json`);
        }

        if (res.ok) {
          const data = await res.json();
          setDistricts(data || []);
        }
      } catch (err) {
        console.error('Error fetching Official Cahyadsn districts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDistricts();
  }, [selectedRegency]);

  // 4. Fetch Villages (Desa / Kelurahan) from Official Cahyadsn API
  useEffect(() => {
    if (!selectedDistrict) return;
    async function fetchVillages() {
      setLoading(true);
      try {
        const cleanDist = selectedDistrict.replace(/\./g, '');
        let res = await fetch(`https://wilayah.cahyadsn.com/api/villages/${cleanDist}.json`);
        if (!res.ok) {
          res = await fetch(`https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/villages/${cleanDist}.json`);
        }
        if (!res.ok) {
          res = await fetch(`https://cahyadsn.github.io/api-wilayah-indonesia/api/villages/${cleanDist}.json`);
        }
        if (!res.ok) {
          res = await fetch(`/wilayah/villages/${cleanDist}.json`);
        }

        if (res.ok) {
          const data = await res.json();
          setVillages(data || []);
        }
      } catch (err) {
        console.error('Error fetching Official Cahyadsn villages:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVillages();
  }, [selectedDistrict]);

  // 5. Autocomplete Kode Pos Otomatis saat Desa / Kelurahan dipilih
  useEffect(() => {
    if (!selectedVillage) return;

    const vilName = villages.find((v) => v.id === selectedVillage)?.name || '';
    const distName = districts.find((d) => d.id === selectedDistrict)?.name || '';
    const regName = regencies.find((r) => r.id === selectedRegency)?.name || '';

    if (!vilName) return;

    let active = true;

    async function fetchPostcode() {
      setLoadingPostcode(true);
      try {
        const res = await fetch(`https://kodepos.vercel.app/search?q=${encodeURIComponent(vilName)}`);
        if (res.ok) {
          const json = await res.json();
          const cleanName = (str: string) =>
            str.toLowerCase().replace(/(kabupaten|kab\.|kota|kecamatan|kec\.|kelurahan|desa|kel\.)/g, '').trim();

          const cleanReg = cleanName(regName);
          const cleanDist = cleanName(distName);
          const cleanVil = cleanName(vilName);

          const matches = json.data || json || [];
          if (Array.isArray(matches) && active) {
            const matchedRecord =
              matches.find((m: { village?: string; district?: string; regency?: string; code?: string | number }) => {
                const mReg = cleanName(m.regency || '');
                const mDist = cleanName(m.district || '');
                const mVil = cleanName(m.village || '');
                return mVil === cleanVil && (mDist === cleanDist || mReg === cleanReg);
              }) || matches[0];

            if (matchedRecord && matchedRecord.code) {
              setPostcode(String(matchedRecord.code));
            }
          }
        }
      } catch (err) {
        console.warn('Gagal mencari kode pos otomatis:', err);
      } finally {
        if (active) setLoadingPostcode(false);
      }
    }

    fetchPostcode();
    return () => {
      active = false;
    };
  }, [selectedVillage, selectedDistrict, selectedRegency, villages, districts, regencies]);

  // 6. Combined Address Output String Format MPHM_V.02
  useEffect(() => {
    const provName = provinces.find((p) => p.id === selectedProvince)?.name || '';
    const regName = regencies.find((r) => r.id === selectedRegency)?.name || '';
    const distName = districts.find((d) => d.id === selectedDistrict)?.name || '';
    const vilName = villages.find((v) => v.id === selectedVillage)?.name || '';

    const parts = [];
    if (detailStreet.trim()) parts.push(detailStreet.trim());
    if (vilName) parts.push(`Desa/Kel. ${vilName}`);
    if (distName) parts.push(`Kec. ${distName}`);
    if (regName) parts.push(regName);
    if (provName) parts.push(`Prov. ${provName}`);
    if (postcode.trim()) parts.push(`Kode Pos ${postcode.trim()}`);

    if (parts.length > 0) {
      onChange(parts.join(', '));
    }
  }, [selectedProvince, selectedRegency, selectedDistrict, selectedVillage, detailStreet, postcode, provinces, regencies, districts, villages, onChange]);

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>📍</span> Alamat Kependudukan (Official Wilayah Cahyadsn API)
        </label>
        {loading ? (
          <span className="text-[10px] text-emerald-600 animate-pulse font-bold">Memuat Official Cahyadsn API...</span>
        ) : loadingPostcode ? (
          <span className="text-[10px] text-amber-600 animate-pulse font-bold">✨ Mencari Kode Pos Otomatis...</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Provinsi */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 block mb-1">Provinsi</span>
          <select
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setSelectedRegency('');
              setSelectedDistrict('');
              setSelectedVillage('');
              setPostcode('');
            }}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
          >
            <option value="">-- Pilih Provinsi --</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Kabupaten / Kota */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 block mb-1">Kabupaten / Kota</span>
          <select
            value={selectedRegency}
            disabled={!selectedProvince}
            onChange={(e) => {
              setSelectedRegency(e.target.value);
              setSelectedDistrict('');
              setSelectedVillage('');
              setPostcode('');
            }}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-600 disabled:opacity-50"
          >
            <option value="">-- Pilih Kab/Kota --</option>
            {regencies.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Kecamatan */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 block mb-1">Kecamatan</span>
          <select
            value={selectedDistrict}
            disabled={!selectedRegency}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedVillage('');
              setPostcode('');
            }}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-600 disabled:opacity-50"
          >
            <option value="">-- Pilih Kecamatan --</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Desa / Kelurahan */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 block mb-1">Desa / Kelurahan</span>
          <select
            value={selectedVillage}
            disabled={!selectedDistrict}
            onChange={(e) => {
              setSelectedVillage(e.target.value);
              setPostcode('');
            }}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-600 disabled:opacity-50"
          >
            <option value="">-- Pilih Desa/Kelurahan --</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="col-span-2">
          <span className="text-[11px] font-bold text-slate-600 block mb-1">Jalan / RT / RW / Dusun</span>
          <input
            type="text"
            placeholder="Jl. KH. Abdul Karim No. 12 RT 02/RW 03"
            value={detailStreet}
            onChange={(e) => setDetailStreet(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
          />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center justify-between">
            <span>Kode Pos</span>
            {loadingPostcode && <span className="text-[9px] text-amber-600 font-bold">Auto...</span>}
          </span>
          <input
            type="text"
            placeholder="64117"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-600 font-mono text-emerald-800"
          />
        </div>
      </div>
    </div>
  );
}

export default RegionSelector;
