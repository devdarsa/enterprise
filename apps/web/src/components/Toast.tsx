'use client';

import React, { useEffect, useState } from 'react';

export interface ToastProps {
  id?: string;
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Toast({
  isOpen,
  type = 'success',
  title,
  message,
  onClose,
  duration = 4500,
  action,
}: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setIsLeaving(false);
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
      setIsLeaving(false);
    }, 280);
  };

  const typeConfig = {
    success: {
      wrapperBg: 'bg-white border-emerald-200',
      accentLine: 'bg-gradient-to-b from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      barBg: 'bg-emerald-500',
      titleColor: 'text-slate-900',
      messageColor: 'text-slate-600',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      wrapperBg: 'bg-white border-rose-200',
      accentLine: 'bg-gradient-to-b from-rose-500 to-rose-600',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      barBg: 'bg-rose-500',
      titleColor: 'text-slate-900',
      messageColor: 'text-slate-600',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      wrapperBg: 'bg-white border-amber-200',
      accentLine: 'bg-gradient-to-b from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      barBg: 'bg-amber-500',
      titleColor: 'text-slate-900',
      messageColor: 'text-slate-600',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    info: {
      wrapperBg: 'bg-white border-teal-200',
      accentLine: 'bg-gradient-to-b from-teal-500 to-teal-600',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      barBg: 'bg-teal-500',
      titleColor: 'text-slate-900',
      messageColor: 'text-slate-600',
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const current = typeConfig[type];

  if (!isOpen && !isLeaving) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full">
      <div
        className={`
          relative flex items-start gap-0 rounded-2xl border shadow-xl shadow-slate-200/80 overflow-hidden
          ${current.wrapperBg}
          ${isLeaving ? 'animate-slide-out-right' : 'animate-slide-in-right'}
        `}
      >
        {/* Left Accent Stripe */}
        <div className={`w-1.5 shrink-0 self-stretch ${current.accentLine}`} />

        {/* Main Content */}
        <div className="flex items-start gap-3 p-4 flex-1">
          {/* Icon */}
          <div className={`w-9 h-9 rounded-xl ${current.iconBg} ${current.iconColor} flex items-center justify-center shrink-0 shadow-sm`}>
            {current.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className={`text-sm font-bold leading-tight ${current.titleColor}`}>{title}</p>
            {message && (
              <p className={`text-xs mt-1 leading-relaxed ${current.messageColor} font-medium`}>{message}</p>
            )}
            {action && (
              <button
                type="button"
                onClick={() => { action.onClick(); handleClose(); }}
                className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors"
              >
                {action.label} →
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100 shrink-0"
            aria-label="Tutup notifikasi"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-1.5 right-0 h-0.5 bg-slate-100">
          <div
            className={`h-full ${current.barBg} opacity-50`}
            style={{ animation: `shrinkWidth ${duration}ms linear forwards` }}
          />
        </div>
      </div>
    </div>
  );
}
