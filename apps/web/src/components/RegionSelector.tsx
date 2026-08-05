'use client';

import React, { useState, useEffect } from 'react';

export interface RegionSelectorProps {
  onAddressChange?: (fullAddress: string) => void;
  onChange?: (fullAddress: string) => void;
  initialAddress?: string;
  isReadOnly?: boolean;
}

interface RegionItem {
  id: string;
  code?: string;
  name?: string;
  kode_provinsi?: string;
  nama_provinsi?: string;
  kode_kabupaten?: string;
  nama_kabupaten?: string;
  kode_kecamatan?: string;
  nama_kecamatan?: string;
  kode_desa?: string;
  nama_desa?: string;
}

export default function RegionSelector({
  onAddressChange,
  onChange,
  initialAddress = '',
  isReadOnly = false,
}: RegionSelectorProps) {
  // Cascading Region State
  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [regencies, setRegencies] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<RegionItem[]>([]);
  const [villages, setVillages] = useState<RegionItem[]>([]);

  // Selected Values
  const [selectedProvCode, setSelectedProvCode] = useState('');
  const [selectedProvName, setSelectedProvName] = useState('');

  const [selectedRegCode, setSelectedRegCode] = useState('');
  const [selectedRegName, setSelectedRegName] = useState('');

  const [selectedDistCode, setSelectedDistCode] = useState('');
  const [selectedDistName, setSelectedDistName] = useState('');

  const [selectedVillageCode, setSelectedVillageCode] = useState('');
  const [selectedVillageName, setSelectedVillageName] = useState('');

  // Detailed Street Address Fields
  const [dusun, setDusun] = useState('');
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('');
  const [jalan, setJalan] = useState('');
  const [noRumah, setNoRumah] = useState('');
  const [kodePos, setKodePos] = useState('');

  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingVill, setLoadingVill] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // 1. Fetch Provinces from Server API /api/v1/wilayah (Server-side & Database Backup)
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoadingProv(true);
    try {
      const res = await fetch('/api/v1/wilayah?type=provinces');
      const json = await res.json();
      if (json.success && json.data) {
        setProvinces(json.data);
      }
    } catch (e) {
      console.error('Gagal mengambil daftar provinsi dari database server', e);
    } finally {
      setLoadingProv(false);
    }
  };

  // 2. Fetch Regencies
  useEffect(() => {
    if (!selectedProvCode) {
      setRegencies([]);
      setSelectedRegCode('');
      setSelectedRegName('');
      return;
    }

    const fetchRegencies = async () => {
      setLoadingReg(true);
      try {
        const res = await fetch(`/api/v1/wilayah?type=regencies&provId=${selectedProvCode}`);
        const json = await res.json();
        if (json.success && json.data) {
          setRegencies(json.data);
        }
      } catch (e) {
        console.error('Gagal mengambil kab/kota', e);
      } finally {
        setLoadingReg(false);
      }
    };

    fetchRegencies();
  }, [selectedProvCode]);

  // 3. Fetch Districts
  useEffect(() => {
    if (!selectedRegCode) {
      setDistricts([]);
      setSelectedDistCode('');
      setSelectedDistName('');
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDist(true);
      try {
        const res = await fetch(`/api/v1/wilayah?type=districts&regId=${selectedRegCode}`);
        const json = await res.json();
        if (json.success && json.data) {
          setDistricts(json.data);
        }
      } catch (e) {
        console.error('Gagal mengambil kecamatan', e);
      } finally {
        setLoadingDist(false);
      }
    };

    fetchDistricts();
  }, [selectedRegCode]);

  // 4. Fetch Villages
  useEffect(() => {
    if (!selectedDistCode) {
      setVillages([]);
      setSelectedVillageCode('');
      setSelectedVillageName('');
      return;
    }

    const fetchVillages = async () => {
      setLoadingVill(true);
      try {
        const res = await fetch(`/api/v1/wilayah?type=villages&distId=${selectedDistCode}`);
        const json = await res.json();
        if (json.success && json.data) {
          setVillages(json.data);
        }
      } catch (e) {
        console.error('Gagal mengambil desa/kelurahan', e);
      } finally {
        setLoadingVill(false);
      }
    };

    fetchVillages();
  }, [selectedDistCode]);

  // 5. Automatic Kode Pos Lookup when Village selected
  const handleVillageSelect = async (vCode: string, vName: string) => {
    setSelectedVillageCode(vCode);
    setSelectedVillageName(vName);

    if (vName) {
      try {
        const res = await fetch(`https://kodepos.vercel.app/search?q=${encodeURIComponent(vName)}`);
        const json = await res.json();
        if (json.status && json.data && json.data.length > 0) {
          setKodePos(json.data[0].code || '64117');
        }
      } catch {
        if (!kodePos) setKodePos('64117');
      }
    }
  };

  // 6. Build Official Full Address String (Alamat Lengkap Automatis)
  useEffect(() => {
    const parts: string[] = [];

    if (jalan.trim()) parts.push(jalan.trim());
    if (noRumah.trim()) parts.push(`No. ${noRumah.trim()}`);
    if (rt.trim() || rw.trim()) parts.push(`RT ${rt.trim() || '00'}/RW ${rw.trim() || '00'}`);
    if (dusun.trim()) parts.push(`Dusun ${dusun.trim()}`);
    if (selectedVillageName) parts.push(`Desa/Kel. ${selectedVillageName}`);
    if (selectedDistName) parts.push(`Kec. ${selectedDistName}`);
    if (selectedRegName) parts.push(selectedRegName);
    if (selectedProvName) parts.push(`Prov. ${selectedProvName}`);
    if (kodePos.trim()) parts.push(`Kode Pos ${kodePos.trim()}`);

    const formattedFullAddress = parts.join(', ');
    if (onAddressChange) onAddressChange(formattedFullAddress);
    if (onChange) onChange(formattedFullAddress);
  }, [
    jalan,
    noRumah,
    rt,
    rw,
    dusun,
    selectedVillageName,
    selectedDistName,
    selectedRegName,
    selectedProvName,
    kodePos,
  ]);

  const handleSyncWilayah = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/v1/wilayah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_wilayah',
          payload: [
            { id: '7', kode_provinsi: '51', nama_provinsi: 'BALI' },
            { id: '8', kode_provinsi: '13', nama_provinsi: 'SUMATERA BARAT' },
          ],
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchProvinces();
        alert(json.message);
      }
    } catch {
      alert('Gagal melakukan sinkronisasi manual.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <span>🇮🇩</span> Master Wilayah Indonesia (Server Database Sync)
        </h4>
        <button
          type="button"
          onClick={handleSyncWilayah}
          disabled={syncing}
          className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-all"
        >
          {syncing ? 'Sinkronisasi...' : '🔄 Sync Master Wilayah'}
        </button>
      </div>

      {/* Row 1: Provinsi & Kab/Kota */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Provinsi *</label>
          <select
            disabled={isReadOnly || loadingProv}
            value={selectedProvCode}
            onChange={(e) => {
              const code = e.target.value;
              const found = provinces.find((p) => (p.kode_provinsi || p.code || p.id) === code);
              setSelectedProvCode(code);
              setSelectedProvName(found?.nama_provinsi || found?.name || '');
            }}
            className="input-premium"
          >
            <option value="">-- Pilih Provinsi --</option>
            {provinces.map((p) => {
              const code = p.kode_provinsi || p.code || p.id;
              const name = p.nama_provinsi || p.name || '';
              return (
                <option key={code} value={code}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Kabupaten / Kota *</label>
          <select
            disabled={isReadOnly || !selectedProvCode || loadingReg}
            value={selectedRegCode}
            onChange={(e) => {
              const code = e.target.value;
              const found = regencies.find((r) => (r.kode_kabupaten || r.code || r.id) === code);
              setSelectedRegCode(code);
              setSelectedRegName(found?.nama_kabupaten || found?.name || '');
            }}
            className="input-premium"
          >
            <option value="">-- Pilih Kabupaten / Kota --</option>
            {regencies.map((r) => {
              const code = r.kode_kabupaten || r.code || r.id;
              const name = r.nama_kabupaten || r.name || '';
              return (
                <option key={code} value={code}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Row 2: Kecamatan & Desa/Kelurahan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Kecamatan *</label>
          <select
            disabled={isReadOnly || !selectedRegCode || loadingDist}
            value={selectedDistCode}
            onChange={(e) => {
              const code = e.target.value;
              const found = districts.find((d) => (d.kode_kecamatan || d.code || d.id) === code);
              setSelectedDistCode(code);
              setSelectedDistName(found?.nama_kecamatan || found?.name || '');
            }}
            className="input-premium"
          >
            <option value="">-- Pilih Kecamatan --</option>
            {districts.map((d) => {
              const code = d.kode_kecamatan || d.code || d.id;
              const name = d.nama_kecamatan || d.name || '';
              return (
                <option key={code} value={code}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Desa / Kelurahan *</label>
          <select
            disabled={isReadOnly || !selectedDistCode || loadingVill}
            value={selectedVillageCode}
            onChange={(e) => {
              const code = e.target.value;
              const found = villages.find((v) => (v.kode_desa || v.code || v.id) === code);
              handleVillageSelect(code, found?.nama_desa || found?.name || '');
            }}
            className="input-premium"
          >
            <option value="">-- Pilih Desa / Kelurahan --</option>
            {villages.map((v) => {
              const code = v.kode_desa || v.code || v.id;
              const name = v.nama_desa || v.name || '';
              return (
                <option key={code} value={code}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Row 3: Dusun, RT, RW, Kode Pos */}
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Dusun</label>
          <input
            type="text"
            disabled={isReadOnly}
            placeholder="Dusun Karanganyar"
            value={dusun}
            onChange={(e) => setDusun(e.target.value)}
            className="input-premium"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">RT</label>
          <input
            type="text"
            disabled={isReadOnly}
            placeholder="002"
            value={rt}
            onChange={(e) => setRt(e.target.value)}
            className="input-premium font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">RW</label>
          <input
            type="text"
            disabled={isReadOnly}
            placeholder="005"
            value={rw}
            onChange={(e) => setRw(e.target.value)}
            className="input-premium font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Kode Pos</label>
          <input
            type="text"
            disabled={isReadOnly}
            placeholder="64117"
            value={kodePos}
            onChange={(e) => setKodePos(e.target.value)}
            className="input-premium font-mono"
          />
        </div>
      </div>

      {/* Row 4: Jalan & Nomor Rumah */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Jalan / Gang</label>
          <input
            type="text"
            disabled={isReadOnly}
            placeholder="Jl. KH. Abdul Karim"
            value={jalan}
            onChange={(e) => setJalan(e.target.value)}
            className="input-premium"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">No. Rumah</label>
          <input
            type="text"
            disabled={isReadOnly}
            placeholder="No. 12"
            value={noRumah}
            onChange={(e) => setNoRumah(e.target.value)}
            className="input-premium font-mono"
          />
        </div>
      </div>
    </div>
  );
}
