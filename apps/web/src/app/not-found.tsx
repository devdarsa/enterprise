import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/8 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-amber-500/6 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        {/* 404 Number */}
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[160px] font-black leading-none bg-gradient-to-br from-emerald-700 via-teal-600 to-amber-600 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-float">🔍</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-slate-900 mb-3">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan. Periksa kembali URL atau kembali ke halaman utama.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link
            href="/admin/dashboard"
            className="btn-primary inline-flex items-center gap-2"
          >
            <span>🏠</span> Kembali ke Dashboard
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
          >
            ← Beranda Utama
          </Link>
        </div>

        {/* Brand Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 font-medium">
            Darsa Enterprise Engine v3.0 — Ma&apos;had Darussa&apos;adah Lirboyo Kota Kediri
          </p>
        </div>
      </div>
    </div>
  );
}
