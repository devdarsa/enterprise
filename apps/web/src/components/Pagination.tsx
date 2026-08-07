'use client';

import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  if (totalItems <= 0) return null;

  const isShowAll = itemsPerPage >= totalItems;
  const totalPages = isShowAll ? 1 : Math.ceil(totalItems / itemsPerPage);

  const startItem = isShowAll ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = isShowAll ? totalItems : Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      {/* Left: Info & Items Per Page Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span>Baris per halaman:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value={25}>25 data</option>
            <option value={50}>50 data</option>
            <option value={100}>100 data</option>
            <option value={999999}>Tampilkan Semua ({totalItems})</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          Menampilkan <strong className="text-slate-900 font-bold">{startItem}</strong> -{' '}
          <strong className="text-slate-900 font-bold">{endItem}</strong> dari{' '}
          <strong className="text-emerald-800 font-bold">{totalItems.toLocaleString('id-ID')}</strong> data
        </span>
      </div>

      {/* Right: Page Navigation Buttons */}
      {!isShowAll && totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="Halaman Pertama"
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer transition-all"
          >
            ⏮️
          </button>

          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            title="Halaman Sebelumnya"
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer transition-all"
          >
            ◀️
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  p === currentPage
                    ? 'bg-emerald-800 text-white shadow-sm border border-emerald-900'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400 font-bold">
                ...
              </span>
            )
          )}

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            title="Halaman Selanjutnya"
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer transition-all"
          >
            ▶️
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Halaman Terakhir"
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold cursor-pointer transition-all"
          >
            ⏭️
          </button>
        </div>
      )}
    </div>
  );
}
