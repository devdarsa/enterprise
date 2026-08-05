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

const FALLBACK_REGIONS = {
  provinces: [
    { id: "35", name: "JAWA TIMUR" },
    { id: "31", name: "DKI JAKARTA" },
    { id: "32", name: "JAWA BARAT" },
    { id: "33", name: "JAWA TENGAH" },
    { id: "73", name: "SULAWESI SELATAN" },
    { id: "11", name: "ACEH" },
    { id: "12", name: "SUMATERA UTARA" },
  ],
  regencies: {
    "35": [
      { id: "35.71", name: "KOTA KEDIRI" },
      { id: "35.06", name: "KABUPATEN KEDIRI" },
      { id: "35.78", name: "KOTA SURABAYA" },
      { id: "35.73", name: "KOTA MALANG" },
      { id: "35.07", name: "KABUPATEN MALANG" },
    ],
    "31": [
      { id: "31.71", name: "KOTA JAKARTA SELATAN" },
      { id: "31.74", name: "KOTA JAKARTA PUSAT" },
    ],
    "32": [
      { id: "32.73", name: "KOTA BANDUNG" },
      { id: "32.75", name: "KOTA BEKASI" },
    ],
  } as Record<string, Region[]>,
  districts: {
    "35.71": [
      { id: "35.71.01", name: "MOJOROTO" },
      { id: "35.71.02", name: "KOTA" },
      { id: "35.71.03", name: "PESANTREN" },
    ],
    "35.06": [
      { id: "35.06.01", name: "NGASEM" },
      { id: "35.06.02", name: "GAMPENGREJO" },
    ],
  } as Record<string, Region[]>,
  villages: {
    "35.71.01": [
      { id: "35.71.01.1001", name: "LIRBOYO" },
      { id: "35.71.01.1002", name: "CAMPUREJO" },
      { id: "35.71.01.1003", name: "TARMAS" },
    ],
  } as Record<string, Region[]>
};

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
  const [postcode, setPostcode] = useState('');
  const [detailStreet, setDetailStreet] = useState('');

  // 1. Fetch Provinces on mount (Primary Cahyadsn API)
  useEffect(() => {
    async function fetchProvinces() {
      setLoading(true);
      try {
        let res = await fetch('/wilayah/provinces.json');
        if (!res.ok) {
          res = await fetch('https://cahyadsn.github.io/api-wilayah-indonesia/api/provinces.json');
        }
        if (!res.ok) {
          res = await fetch('https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/provinces.json');
        }

        if (res.ok) {
          const data = await res.json();
          setProvinces(data || []);
        } else {
          setProvinces(FALLBACK_REGIONS.provinces);
        }
      } catch {
        setProvinces(FALLBACK_REGIONS.provinces);
      } finally {
        setLoading(false);
      }
    }
    fetchProvinces();
  }, []);

  // 2. Fetch Regencies (Cahyadsn API)
  useEffect(() => {
    if (!selectedProvince) return;
    async function fetchRegencies() {
      setLoading(true);
      try {
        const cleanProv = selectedProvince.replace(/\./g, '');
        let res = await fetch(`/wilayah/regencies/${cleanProv}.json`);
        if (!res.ok) {
          res = await fetch(`https://cahyadsn.github.io/api-wilayah-indonesia/api/regencies/${cleanProv}.json`);
        }
        if (!res.ok) {
          res = await fetch(`https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/regencies/${cleanProv}.json`);
        }

        if (res.ok) {
          const data = await res.json();
          setRegencies(data || []);
        } else {
          setRegencies(FALLBACK_REGIONS.regencies[selectedProvince] || []);
        }
      } catch {
        setRegencies(FALLBACK_REGIONS.regencies[selectedProvince] || []);
      } finally {
        setLoading(false);
      }
    }
    fetchRegencies();
  }, [selectedProvince]);

  // 3. Fetch Districts (Cahyadsn API)
  useEffect(() => {
    if (!selectedRegency) return;
    async function fetchDistricts() {
      setLoading(true);
      try {
        const cleanReg = selectedRegency.replace(/\./g, '');
        let res = await fetch(`/wilayah/districts/${cleanReg}.json`);
        if (!res.ok) {
          res = await fetch(`https://cahyadsn.github.io/api-wilayah-indonesia/api/districts/${cleanReg}.json`);
        }
        if (!res.ok) {
          res = await fetch(`https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/districts/${cleanReg}.json`);
        }

        if (res.ok) {
          const data = await res.json();
          setDistricts(data || []);
        } else {
          setDistricts(FALLBACK_REGIONS.districts[selectedRegency] || []);
        }
      } catch {
        setDistricts(FALLBACK_REGIONS.districts[selectedRegency] || []);
      } finally {
        setLoading(false);
      }
    }
    fetchDistricts();
  }, [selectedRegency]);

  // 4. Fetch Villages (Cahyadsn API)
  useEffect(() => {
    if (!selectedDistrict) return;
    async function fetchVillages() {
      setLoading(true);
      try {
        const cleanDist = selectedDistrict.replace(/\./g, '');
        let res = await fetch(`/wilayah/villages/${cleanDist}.json`);
        if (!res.ok) {
          res = await fetch(`https://cahyadsn.github.io/api-wilayah-indonesia/api/villages/${cleanDist}.json`);
        }
        if (!res.ok) {
          res = await fetch(`https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/villages/${cleanDist}.json`);
        }

        if (res.ok) {
          const data = await res.json();
          setVillages(data || []);
        } else {
          setVillages(FALLBACK_REGIONS.villages[selectedDistrict] || []);
        }
      } catch {
        setVillages(FALLBACK_REGIONS.villages[selectedDistrict] || []);
      } finally {
        setLoading(false);
      }
    }
    fetchVillages();
  }, [selectedDistrict]);

  // Combined Address Output
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
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          📍 Alamat Kependudukan (Cahyadsn API Wilayah Indonesia)
        </label>
        {loading && <span className="text-[10px] text-emerald-600 animate-pulse font-bold">Memuat Data Cahyadsn API...</span>}
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
            onChange={(e) => setSelectedVillage(e.target.value)}
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
          <span className="text-[11px] font-bold text-slate-600 block mb-1">Kode Pos</span>
          <input
            type="text"
            placeholder="64117"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-600 font-mono"
          />
        </div>
      </div>
    </div>
  );
}

export default RegionSelector;
