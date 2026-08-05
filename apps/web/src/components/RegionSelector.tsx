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
  const [postcode, setPostcode] = useState('');
  const [detailStreet, setDetailStreet] = useState('');

  // 1. Fetch 100% Provinces from Cahyadsn API
  useEffect(() => {
    async function fetchProvinces() {
      setLoading(true);
      try {
        let res = await fetch('https://cahyadsn.github.io/api-wilayah-indonesia/api/provinces.json');
        if (!res.ok) {
          res = await fetch('https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/provinces.json');
        }
        if (!res.ok) {
          res = await fetch('/wilayah/provinces.json');
        }

        if (res.ok) {
          const data = await res.json();
          setProvinces(data || []);
        }
      } catch (err) {
        console.error('Error fetching Cahyadsn provinces:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProvinces();
  }, []);

  // 2. Fetch Regencies (Kabupaten / Kota) from Cahyadsn API
  useEffect(() => {
    if (!selectedProvince) return;
    async function fetchRegencies() {
      setLoading(true);
      try {
        const cleanProv = selectedProvince.replace(/\./g, '');
        let res = await fetch(`https://cahyadsn.github.io/api-wilayah-indonesia/api/regencies/${cleanProv}.json`);
        if (!res.ok) {
          res = await fetch(`https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/regencies/${cleanProv}.json`);
        }
        if (!res.ok) {
          res = await fetch(`/wilayah/regencies/${cleanProv}.json`);
        }

        if (res.ok) {
          const data = await res.json();
          setRegencies(data || []);
        }
      } catch (err) {
        console.error('Error fetching Cahyadsn regencies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRegencies();
  }, [selectedProvince]);

  // 3. Fetch Districts (Kecamatan) from Cahyadsn API
  useEffect(() => {
    if (!selectedRegency) return;
    async function fetchDistricts() {
      setLoading(true);
      try {
        const cleanReg = selectedRegency.replace(/\./g, '');
        let res = await fetch(`https://cahyadsn.github.io/api-wilayah-indonesia/api/districts/${cleanReg}.json`);
        if (!res.ok) {
          res = await fetch(`https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/districts/${cleanReg}.json`);
        }
        if (!res.ok) {
          res = await fetch(`/wilayah/districts/${cleanReg}.json`);
        }

        if (res.ok) {
          const data = await res.json();
          setDistricts(data || []);
        }
      } catch (err) {
        console.error('Error fetching Cahyadsn districts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDistricts();
  }, [selectedRegency]);

  // 4. Fetch Villages (Desa / Kelurahan) from Cahyadsn API
  useEffect(() => {
    if (!selectedDistrict) return;
    async function fetchVillages() {
      setLoading(true);
      try {
        const cleanDist = selectedDistrict.replace(/\./g, '');
        let res = await fetch(`https://cahyadsn.github.io/api-wilayah-indonesia/api/villages/${cleanDist}.json`);
        if (!res.ok) {
          res = await fetch(`https://raw.githubusercontent.com/cahyadsn/wilayah/main/api/villages/${cleanDist}.json`);
        }
        if (!res.ok) {
          res = await fetch(`/wilayah/villages/${cleanDist}.json`);
        }

        if (res.ok) {
          const data = await res.json();
          setVillages(data || []);
        }
      } catch (err) {
        console.error('Error fetching Cahyadsn villages:', err);
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
          📍 Alamat Kependudukan (Cahyadsn API Wilayah Indonesia 100%)
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
