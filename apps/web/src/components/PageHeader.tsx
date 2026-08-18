'use client';

import React, { useRef } from 'react';
import { SearchBar } from './Loading';
import { Download, FileSpreadsheet, FileText, Upload, RefreshCw, Sparkles } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  badge?: string;

  infoBanner?: {
    icon?: string;
    title?: string;
    content: React.ReactNode;
    variant?: 'brand' | 'warning' | 'info' | 'gold';
  };

  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
    gold?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };

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

  canWrite?: boolean;
  toolbarExtra?: React.ReactNode;
}

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
      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a2a18] via-[#0f4928] to-[#135e35] p-5 sm:p-6 text-white shadow-lg border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Badge, Title & Subtitle */}
          <div className="space-y-1 min-w-0">
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {badge}
              </span>
            )}
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-emerald-200/90 font-medium mt-0.5">{subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition active:scale-95 flex items-center gap-1.5"
              >
                {secondaryAction.icon && <span>{secondaryAction.icon}</span>}
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && canWrite && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-900/30 transition active:scale-95 flex items-center gap-1.5"
              >
                {primaryAction.icon && <span>{primaryAction.icon}</span>}
                {primaryAction.label}
              </button>
            )}
          </div>
        </div>

        {/* Optional Info Banner */}
        {infoBanner && (
          <div className="mt-4 pt-3 border-t border-emerald-700/40 text-xs text-emerald-100 flex items-start gap-2">
            <span>{infoBanner.icon || 'ℹ️'}</span>
            <div>
              {infoBanner.title && <span className="font-bold block text-white">{infoBanner.title}</span>}
              <div>{infoBanner.content}</div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar (Search + Filters + Export) */}
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          {onSearch && (
            <div className="flex-1 min-w-0">
              <SearchBar value={search || ''} onChange={onSearch} placeholder={searchPlaceholder} />
            </div>
          )}

          {count !== undefined && (
            <span className="shrink-0 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-center sm:self-auto">
              {count.toLocaleString('id-ID')} {countLabel}
            </span>
          )}

          {toolbarExtra && <div className="shrink-0 flex items-center gap-2">{toolbarExtra}</div>}

          <div className="flex items-center gap-2 overflow-x-auto justify-end">
            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                Excel
              </button>
            )}

            {onExportPDF && (
              <button
                type="button"
                onClick={onExportPDF}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-rose-700" />
                PDF
              </button>
            )}

            {onImport && canWrite && (
              <>
                <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={() => importRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-700" />
                  Impor
                </button>
              </>
            )}

            {onDownloadTemplate && (
              <button
                type="button"
                onClick={onDownloadTemplate}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                Template
              </button>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
                title="Segarkan Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function InfoBanner({
  icon = 'ℹ️',
  title,
  children,
  variant = 'brand',
}: {
  icon?: string;
  title?: string;
  children: React.ReactNode;
  variant?: 'brand' | 'warning' | 'info' | 'gold';
}) {
  const variantStyles = {
    brand: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
    gold: 'bg-amber-50/80 text-amber-950 border-amber-300',
  };

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs ${variantStyles[variant]}`}>
      <span className="text-base shrink-0">{icon}</span>
      <div className="space-y-0.5">
        {title && <h5 className="font-bold">{title}</h5>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
