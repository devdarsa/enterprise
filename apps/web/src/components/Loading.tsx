'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  variant?: 'default' | 'white';
}

export function LoadingSpinner({ size = 'md', label, variant = 'default' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { outer: 'w-6 h-6', inner: 'w-4 h-4', border: 'border-2', dot: 'w-1 h-1' },
    md: { outer: 'w-10 h-10', inner: 'w-6 h-6', border: 'border-2', dot: 'w-1.5 h-1.5' },
    lg: { outer: 'w-16 h-16', inner: 'w-10 h-10', border: 'border-[3px]', dot: 'w-2 h-2' },
  }[size];

  const colors =
    variant === 'white'
      ? { ring: 'border-white/30 border-t-white', ring2: 'border-transparent border-b-white/60' }
      : { ring: 'border-emerald-200 border-t-emerald-600', ring2: 'border-transparent border-b-amber-400' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Orbital Spinner */}
      <div className={`relative ${sizeMap.outer} flex items-center justify-center`}>
        {/* Outer ring */}
        <div
          className={`absolute inset-0 rounded-full ${sizeMap.border} ${colors.ring} animate-spin`}
          style={{ animationDuration: '0.9s' }}
        />
        {/* Inner ring - reverse */}
        <div
          className={`absolute ${sizeMap.inner} rounded-full ${sizeMap.border} ${colors.ring2} animate-spin-slow`}
          style={{ animationDuration: '1.4s' }}
        />
        {/* Center dot */}
        <div className={`${sizeMap.dot} rounded-full bg-emerald-600 opacity-80`} />
      </div>
      {label && (
        <p className={`text-xs font-semibold animate-pulse ${variant === 'white' ? 'text-white/80' : 'text-slate-500'}`}>
          {label}
        </p>
      )}
    </div>
  );
}

export function PageLoader({ label = 'Memuat Data...' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
      {/* Ambient Glow */}
      <div className="absolute w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

      <LoadingSpinner size="lg" />
      <div className="mt-6 text-center">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-1 font-medium">Darsa Enterprise — Mohon tunggu sebentar</p>
      </div>

      {/* Animated Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 animate-progress-bar"
          style={{ animationDuration: '2s', animationTimingFunction: 'ease-out' }}
        />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-0">
      {/* Header row */}
      <div className="flex gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded shimmer"
            style={{ width: `${60 + Math.random() * 80}px`, flex: i === 1 ? '2' : '1' }}
          />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 px-4 py-3.5 border-b border-slate-100 items-center"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-3.5 rounded-lg shimmer"
              style={{ flex: j === 1 ? '2' : '1', opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
          <div className="flex justify-between items-start">
            <div className="h-3 w-24 rounded shimmer" />
            <div className="w-8 h-8 rounded-xl shimmer" />
          </div>
          <div className="h-8 w-20 rounded-lg shimmer" />
          <div className="h-2.5 w-32 rounded shimmer" />
        </div>
      ))}
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
