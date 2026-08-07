'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  variant?: 'default' | 'white';
}

export function LoadingSpinner({ size = 'md', label, variant = 'default' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { outer: 'w-6 h-6', inner: 'w-4 h-4', border: 'border-2', dot: 'w-1.5 h-1.5' },
    md: { outer: 'w-10 h-10', inner: 'w-6 h-6', border: 'border-[2.5px]', dot: 'w-2 h-2' },
    lg: { outer: 'w-16 h-16', inner: 'w-10 h-10', border: 'border-[3.5px]', dot: 'w-2.5 h-2.5' },
  }[size];

  const colors =
    variant === 'white'
      ? { ring: 'border-white/30 border-t-white', ring2: 'border-transparent border-b-amber-300' }
      : { ring: 'border-emerald-500/20 border-t-emerald-600', ring2: 'border-transparent border-b-amber-400' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Orbital Spinner with Glowing Center Dot */}
      <div className={`relative ${sizeMap.outer} flex items-center justify-center`}>
        {/* Outer Ring */}
        <div
          className={`absolute inset-0 rounded-full ${sizeMap.border} ${colors.ring} animate-spin`}
          style={{ animationDuration: '0.8s' }}
        />
        {/* Inner Ring (Reverse Rotation) */}
        <div
          className={`absolute ${sizeMap.inner} rounded-full ${sizeMap.border} ${colors.ring2} animate-spin-slow`}
          style={{ animationDuration: '1.2s' }}
        />
        {/* Glowing Center Dot */}
        <div className={`${sizeMap.dot} rounded-full bg-emerald-500 shadow-sm shadow-emerald-400`} />
      </div>
      {label && (
        <p className={`text-xs font-bold tracking-wide animate-pulse ${variant === 'white' ? 'text-white/90' : 'text-slate-600'}`}>
          {label}
        </p>
      )}
    </div>
  );
}

export function PageLoader({ label = 'Memuat Data Database...' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md text-white">
      {/* Ambient Glow */}
      <div className="absolute w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

      <LoadingSpinner size="lg" variant="white" />
      <div className="mt-6 text-center space-y-1">
        <p className="text-sm font-black text-white tracking-wide">{label}</p>
        <p className="text-xs text-emerald-300 font-bold tracking-wider uppercase">Darsa Enterprise Ecosystem</p>
      </div>

      {/* Animated Bottom Gold Accent Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 animate-progress-bar"
          style={{ animationDuration: '1.5s', animationTimingFunction: 'ease-out' }}
        />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5, label = 'Memuat Data dari Database...' }: { rows?: number; cols?: number; label?: string }) {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/90 shadow-sm my-2">
      <LoadingSpinner size="md" label={label} />
    </div>
  );
}

export function SkeletonCard({ count = 4, label = 'Memuat Data statistik...' }: { count?: number; label?: string }) {
  return (
    <div className="w-full py-12 px-4 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/90 shadow-sm my-2">
      <LoadingSpinner size="md" label={label} />
    </div>
  );
}

export function EmptyState({
  icon = '📋',
  title = 'Belum Ada Data',
  description = 'Belum ada data yang tersedia. Tambahkan data baru untuk mulai.',
  action,
}: {
  icon?: string;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-4xl mb-5 shadow-sm animate-float">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-2">{title}</h3>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-medium mb-6">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Cari data...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
