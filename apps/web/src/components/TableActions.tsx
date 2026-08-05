'use client';

import React from 'react';

export interface TableActionsProps {
  onDetail?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRiwayat?: () => void;
  onPenempatan?: () => void;
  onArsip?: () => void;
  onToggleStatus?: () => void;
  statusActive?: boolean;
  isReadOnly?: boolean;
}

export function TableActions({
  onDetail,
  onEdit,
  onDelete,
  onRiwayat,
  onPenempatan,
  onArsip,
  onToggleStatus,
  statusActive = true,
  isReadOnly = false,
}: TableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5 flex-wrap">
      {/* 1. Detail */}
      {onDetail && (
        <button
          type="button"
          onClick={onDetail}
          title="Lihat Detail Profil & Data Lengkap"
          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200 transition-all flex items-center gap-1"
        >
          <span>🔍</span> Detail
        </button>
      )}

      {/* 2. Penempatan Pendidikan */}
      {onPenempatan && !isReadOnly && (
        <button
          type="button"
          onClick={onPenempatan}
          title="Kelola Penempatan Pendidikan (Madrasah / MI)"
          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-bold border border-amber-200 transition-all flex items-center gap-1"
        >
          <span>🎓</span> Penempatan
        </button>
      )}

      {/* 3. Edit */}
      {onEdit && !isReadOnly && (
        <button
          type="button"
          onClick={onEdit}
          title="Ubah & Perbarui Data"
          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-bold border border-slate-200 transition-all flex items-center gap-1"
        >
          <span>✏️</span> Edit
        </button>
      )}

      {/* 4. Riwayat */}
      {onRiwayat && (
        <button
          type="button"
          onClick={onRiwayat}
          title="Lihat Riwayat Perubahan & Track Audit Log"
          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 text-[11px] font-bold border border-blue-200 transition-all flex items-center gap-1"
        >
          <span>📜</span> Riwayat
        </button>
      )}

      {/* 5. Toggle Status (Aktifkan / Nonaktifkan) */}
      {onToggleStatus && !isReadOnly && (
        <button
          type="button"
          onClick={onToggleStatus}
          title={statusActive ? 'Nonaktifkan Akun / Status' : 'Aktifkan Akun / Status'}
          className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
            statusActive
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          {statusActive ? '⚡ Nonaktif' : '⚡ Aktifkan'}
        </button>
      )}

      {/* 6. Arsipkan */}
      {onArsip && !isReadOnly && (
        <button
          type="button"
          onClick={onArsip}
          title="Pindahkan Data ke Arsip Historis"
          className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-[11px] font-bold border border-indigo-200 transition-all"
        >
          📦 Arsip
        </button>
      )}

      {/* 7. Hapus (Soft Delete ke Recycle Bin) */}
      {onDelete && !isReadOnly && (
        <button
          type="button"
          onClick={onDelete}
          title="Hapus Data (Soft Delete ke Recycle Bin)"
          className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold border border-rose-200 transition-all flex items-center gap-1"
        >
          <span>🗑️</span> Hapus
        </button>
      )}
    </div>
  );
}

export interface ImportExportToolbarProps {
  onAdd?: () => void;
  addLabel?: string;
  onImport?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onSync?: () => void;
  onRefresh?: () => void;
  isReadOnly?: boolean;
}

export function ImportExportToolbar({
  onAdd,
  addLabel = '+ Tambah Data',
  onImport,
  onExport,
  onPrint,
  onSync,
  onRefresh,
  isReadOnly = false,
}: ImportExportToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onAdd && !isReadOnly && (
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <span>➕</span> {addLabel}
        </button>
      )}

      {onImport && !isReadOnly && (
        <button
          type="button"
          onClick={onImport}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center gap-1.5"
        >
          <span>📥</span> Import Data
        </button>
      )}

      {onExport && (
        <button
          type="button"
          onClick={onExport}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center gap-1.5"
        >
          <span>📊</span> Export Excel
        </button>
      )}

      {onPrint && (
        <button
          type="button"
          onClick={onPrint}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center gap-1.5"
        >
          <span>🖨️</span> Cetak Dokumen
        </button>
      )}

      {onSync && !isReadOnly && (
        <button
          type="button"
          onClick={onSync}
          className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <span>🔄</span> Sinkronisasi Data
        </button>
      )}

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh Data Real-time"
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 transition-all"
        >
          🔄
        </button>
      )}
    </div>
  );
}

export interface FormActionsProps {
  onSave?: (e: React.FormEvent) => void;
  onSaveAndAdd?: (e: React.FormEvent) => void;
  onSaveAndClose?: (e: React.FormEvent) => void;
  onReset?: () => void;
  onCancel?: () => void;
  onBack?: () => void;
  submitting?: boolean;
}

export function FormActions({
  onSave,
  onSaveAndAdd,
  onSaveAndClose,
  onReset,
  onCancel,
  onBack,
  submitting = false,
}: FormActionsProps) {
  return (
    <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1"
          >
            ← Kembali
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
          >
            ❌ Batal
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all"
          >
            🔄 Reset Form
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onSaveAndAdd && (
          <button
            type="button"
            onClick={onSaveAndAdd}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            ➕ Simpan & Tambah Baru
          </button>
        )}
        {onSaveAndClose && (
          <button
            type="button"
            onClick={onSaveAndClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            ✅ Simpan & Tutup
          </button>
        )}
        {onSave && (
          <button
            type="submit"
            onClick={onSave}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {submitting ? '💾 Menyimpan...' : '💾 Simpan Data'}
          </button>
        )}
      </div>
    </div>
  );
}
