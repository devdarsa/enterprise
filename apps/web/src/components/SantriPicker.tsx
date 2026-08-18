'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export interface SelectedSantri {
  id: string;
  nisp?: string;
  nisn?: string;
  nama_lengkap: string;
  kelas?: string;
  kamar?: string;
}

interface SantriPickerProps {
  value?: string; // ID / Nama
  onSelect: (santri: SelectedSantri) => void;
  selectedSantriObj?: SelectedSantri | null;
  placeholder?: string;
  required?: boolean;
}

export default function SantriPicker({
  onSelect,
  selectedSantriObj,
  placeholder = 'Cari nama santri, No. Stambuk, atau NISN...',
  required = false,
}: SantriPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SelectedSantri[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedSantri | null>(selectedSantriObj || null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedSantriObj) {
      setSelected(selectedSantriObj);
    }
  }, [selectedSantriObj]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search live API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ search: query, limit: '10' });
        const res = await fetch(`/api/v1/santri?${params}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: SelectedSantri[] = json.data.map((s: any) => ({
            id: s.id,
            nisp: s.nisp,
            nisn: s.nisn,
            nama_lengkap: s.nama_lengkap,
            kelas: s.kelas?.nama_kelas || s.kelas_id || '',
            kamar: s.kamar || '',
          }));
          setResults(mapped);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Gagal memuat autocomplete santri:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSantri = (s: SelectedSantri) => {
    setSelected(s);
    setIsOpen(false);
    setQuery('');
    onSelect(s);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
  };

  if (selected) {
    return (
      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black flex items-center justify-center text-xs shrink-0">
            ✓
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-slate-900 truncate">{selected.nama_lengkap}</div>
            <div className="text-[10px] text-emerald-800 font-mono font-bold truncate">
              {selected.nisp ? `No. Stambuk: ${selected.nisp}` : ''} {selected.nisn ? `• NISN: ${selected.nisn}` : ''} {selected.kelas ? `• ${selected.kelas}` : ''}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-slate-400 hover:text-rose-600 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 text-xs shrink-0 cursor-pointer"
          title="Ganti Santri"
        >
          ✕ Ganti
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required && !selected}
          className="input-premium font-semibold text-xs"
          style={{ paddingLeft: '2.6rem' }}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-bold animate-pulse">
            Searching...
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
          {results.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSantri(s)}
              className="w-full text-left p-3 hover:bg-emerald-50/80 transition-colors flex items-center justify-between text-xs cursor-pointer"
            >
              <div>
                <span className="font-black text-slate-900 block">{s.nama_lengkap}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {s.nisp ? `No. Stambuk: ${s.nisp}` : ''} {s.nisn ? `| NISN: ${s.nisn}` : ''} {s.kelas ? `| ${s.kelas}` : ''}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                Pilih
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() !== '' && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-center text-xs text-slate-400 font-medium">
          Santri dengan kata kunci &quot;{query}&quot; tidak ditemukan.
        </div>
      )}
    </div>
  );
}
