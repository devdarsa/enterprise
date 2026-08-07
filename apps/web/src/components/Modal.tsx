'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  variant?: 'default' | 'danger' | 'success';
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = '✨',
  size = 'md',
  variant = 'default',
  children,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-7xl',
  }[size];

  const gradientClass = {
    default: 'from-emerald-800 via-emerald-700 to-teal-800 border-emerald-600',
    danger: 'from-rose-800 via-rose-700 to-rose-800 border-rose-600',
    success: 'from-teal-800 via-emerald-700 to-emerald-800 border-emerald-600',
  }[variant];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      {/* Glassmorphism Backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Tutup modal"
      />

      {/* Floating Orb Decorations */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Modal Window */}
      <div
        ref={contentRef}
        className={`relative w-full ${sizeClass} bg-white border border-slate-200/80 rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden z-10 animate-scale-up`}
      >
        {/* Top Decorative Line */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 w-full" />

        {/* Header */}
        <div className={`p-5 bg-gradient-to-r ${gradientClass} text-white flex items-center justify-between relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute right-0 top-0 w-32 h-32 rounded-full border-2 border-white translate-x-12 -translate-y-8" />
            <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full border border-white translate-y-8" />
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="relative w-10 h-10 rounded-full border-2 border-amber-400/80 overflow-hidden shadow-md shadow-black/20 shrink-0">
              <Image
                src="/logo-pondok.png"
                alt="Logo Lirboyo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{icon}</span>
                <h3 className="text-sm font-black text-white leading-tight tracking-tight uppercase">
                  {title}
                </h3>
              </div>
              {subtitle && (
                <p className="text-[10px] text-amber-300 font-semibold mt-0.5 uppercase tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white font-bold text-sm flex items-center justify-center transition-all duration-200 border border-white/20 hover:border-white/40"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-7 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CONFIRM DIALOG (for delete confirmations)
   ============================================================ */

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Ya, Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      iconBg: 'bg-rose-100',
      icon: '🗑️',
      btnClass: 'from-rose-500 to-rose-600 shadow-rose-500/30 hover:from-rose-600 hover:to-rose-700',
    },
    warning: {
      iconBg: 'bg-amber-100',
      icon: '⚠️',
      btnClass: 'from-amber-500 to-amber-600 shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700',
    },
  }[variant];

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden z-10 animate-scale-up">
        <div className="h-1 bg-gradient-to-r from-rose-500 to-amber-500 w-full" />

        <div className="p-7 text-center">
          {/* Icon Circle */}
          <div className={`w-16 h-16 ${variantConfig.iconBg} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm`}>
            {variantConfig.icon}
          </div>

          <h3 className="text-base font-black text-slate-900 mb-2">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">{message}</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all duration-200 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${variantConfig.btnClass} shadow-md transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Memproses...
                </>
              ) : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
