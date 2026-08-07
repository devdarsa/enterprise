'use client';

import React, { useRef } from 'react';
import { SearchBar } from './Loading';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PageHeaderProps {
  /** Judul halaman */
  title: string;
  /** Subtitle / deskripsi singkat */
  subtitle?: string;
  /** Emoji atau ikon teks */
  icon?: string;
  /** Badge label di kanan judul (misal: "DATABASE PONDOK") */
  badge?: string;

  /** Banner informasi terintegrasi di dalam header card */
  infoBanner?: {
    icon?: string;
    title?: string;
    content: React.ReactNode;
    variant?: 'brand' | 'warning' | 'info' | 'gold';
  };

  // ── Tombol Utama ──────────────────────────────────────────────────────────
  /** Tombol aksi utama (Registrasi / Tambah Baru) */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
    /** Gunakan gold style jika true */
    gold?: boolean;
  };
  /** Tombol aksi sekunder tambahan */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };

  // ── Toolbar (Search + Export/Import) ─────────────────────────────────────
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  count?: number;
  countLabel?: string;

  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onImport?: (file: File) => void;
  onDownloadTemplate?: () => void;
  onRefresh?: () => void;

  /** Apakah user bisa edit/tambah (false = read-only) */
  canWrite?: boolean;

  /** Slot custom di baris toolbar */
  toolbarExtra?: React.ReactNode;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  infoBanner,
  primaryAction,
  secondaryAction,
  search,
  onSearch,
  searchPlaceholder = 'Cari data...',
  count,
  countLabel = 'data',
  onExportExcel,
  onExportPDF,
  onImport,
  onDownloadTemplate,
  onRefresh,
  canWrite = true,
  toolbarExtra,
}: PageHeaderProps) {
  const importRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
      e.target.value = '';
    }
  };

  const hasToolbar =
    onSearch || onExportExcel || onExportPDF || onImport || onDownloadTemplate || onRefresh || toolbarExtra;

  return (
    <div className="space-y-3">
      {/* ── Hero Header Card ─────────────────────────────────────────────── */}
      <div className="page-header space-y-3">
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'rgba(245,197,24,0.18)', border: '1.5px solid rgba(245,197,24,0.4)' }}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {badge && <span className="page-header-badge mb-1 block">{badge}</span>}
              <h1 className="page-header-title">{title}</h1>
              {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1.5px solid rgba(255,255,255,0.22)',
                  color: 'rgba(255,255,255,0.92)',
                }}
              >
                {secondaryAction.icon && <span>{secondaryAction.icon}</span>}
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && canWrite && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className={primaryAction.gold ? 'btn-gold' : 'btn-primary'}
                style={
                  !primaryAction.gold
                    ? {
                        background: 'linear-gradient(135deg, #f5c518 0%, #d4a017 100%)',
                        color: '#0a3319',
                        boxShadow: '0 2px 10px rgba(245,197,24,0.4)',
                      }
                    : {}
                }
              >
                {primaryAction.icon && <span>{primaryAction.icon}</span>}
                {primaryAction.label}
              </button>
            )}
          </div>
        </div>

        {/* Integrated Info Banner */}
        {infoBanner && (
          <div className="pt-2 border-t border-white/10">
            <InfoBanner icon={infoBanner.icon} title={infoBanner.title} variant={infoBanner.variant || 'brand'}>
              {infoBanner.content}
            </InfoBanner>
          </div>
        )}
      </div>

      {/* ── Toolbar Bar (Search + Export/Import) ──────────────────────────── */}
      {hasToolbar && (
        <div className="toolbar-bar">
          {/* Search */}
          {onSearch && (
            <div className="flex-1 min-w-0 w-full">
              <SearchBar
                value={search || ''}
                onChange={onSearch}
                placeholder={searchPlaceholder}
              />
            </div>
          )}

          {/* Count Badge */}
          {count !== undefined && (
            <span className="shrink-0 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl whitespace-nowrap">
              {count.toLocaleString('id-ID')} {countLabel}
            </span>
          )}

          {/* Divider */}
          {(onSearch || count !== undefined) && (onExportExcel || onExportPDF || (onImport && canWrite) || onDownloadTemplate) && (
            <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />
          )}

          {/* Export Excel */}
          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              title="Export ke Excel (.xlsx)"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 transition-all whitespace-nowrap shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.9 19H7.5l-1.7-2.8L4.2 19H2.8l2.3-3.7L2.9 12h1.5l1.5 2.7L7.3 12h1.5l-2.2 3.3L8.9 19zm4.3 0h-3.6v-7h1.3v5.9h2.3V19zm4.4 0h-1.4l-2.2-7h1.4l1.5 5 1.5-5h1.4l-2.2 7z"/>
              </svg>
              Export Excel
            </button>
          )}

          {/* Export PDF */}
          {onExportPDF && (
            <button
              type="button"
              onClick={onExportPDF}
              title="Export ke PDF"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all whitespace-nowrap shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zm-1.5 10.3c-.1.4-.3.7-.5 1-.3.3-.6.5-1 .7-.4.1-.9.2-1.5.2H7.8v-6.4h2.8c.6 0 1.1.1 1.5.2.4.1.7.4.9.7.2.3.3.7.3 1.2v.4c0 .4-.1.7-.3 1zm-2.1-1.1c.1-.3.1-.6.1-.9v-.3c0-.3-.1-.6-.3-.8-.2-.2-.5-.3-1-.3H9.2v4.2h1.1c.5 0 .8-.1 1.1-.3.3-.2.4-.5.4-.9v-.7z"/>
              </svg>
              Export PDF
            </button>
          )}

          {/* Download Template */}
          {onDownloadTemplate && canWrite && (
            <button
              type="button"
              onClick={onDownloadTemplate}
              title="Download Template Import Excel"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all whitespace-nowrap shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Template
            </button>
          )}

          {/* Import */}
          {onImport && canWrite && (
            <>
              <input
                ref={importRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => importRef.current?.click()}
                title="Import data dari file Excel"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white border transition-all whitespace-nowrap shrink-0"
                style={{ background: 'linear-gradient(135deg,#157340 0%,#0f4928 100%)', borderColor: '#0f4928', boxShadow: '0 1px 6px rgba(21,115,64,0.3)' }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Excel
              </button>
            </>
          )}

          {/* Refresh */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {/* Extra slot */}
          {toolbarExtra}
        </div>
      )}
    </div>
  );
}

// ─── Info Banner Component ──────────────────────────────────────────────────
export function InfoBanner({
  icon = '💡',
  title,
  children,
  variant = 'brand',
}: {
  icon?: string;
  title?: string;
  children: React.ReactNode;
  variant?: 'brand' | 'warning' | 'info' | 'gold';
}) {
  const styles = {
    brand:   'bg-[#f0faf4] border-[#aee2c5] text-[#0f4928]',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info:    'bg-sky-50 border-sky-200 text-sky-900',
    gold:    'bg-yellow-50 border-yellow-200 text-yellow-900',
  }[variant];

  return (
    <div className={`p-4 rounded-2xl border text-xs font-medium flex items-start gap-3 ${styles}`}>
      <span className="text-base shrink-0">{icon}</span>
      <div>
        {title && <strong className="block font-black mb-0.5">{title}</strong>}
        {children}
      </div>
    </div>
  );
}
