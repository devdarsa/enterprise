import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  transpilePackages: ['@darsa/database', '@darsa/auth', '@darsa/types', '@darsa/ui', '@darsa/utils'],

  // Compress responses (Brotli/gzip) — reduces transfer size significantly
  compress: true,

  // Power-user: disable X-Powered-By header
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Aggressive image optimization
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours
  },

  async headers() {
    return [
      // Static assets — cache 1 year immutable
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Fonts — cache 1 year
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Images / icons
      {
        source: '/:path*.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
      // API routes — never cache (always fresh from DB)
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      // Security headers for all pages
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/auth/login/:portal*', destination: '/login', permanent: true },
      { source: '/auth/login', destination: '/login', permanent: true },
      { source: '/logingurumi', destination: '/login', permanent: true },
      { source: '/loginkeamanan', destination: '/login', permanent: true },
      { source: '/loginmadrasah', destination: '/login', permanent: true },
      { source: '/loginmi', destination: '/login', permanent: true },
      { source: '/loginpondok', destination: '/admin/login', permanent: true },
      { source: '/loginwali', destination: '/login', permanent: true },
      { source: '/guru', destination: '/guru_madrasah/dashboard', permanent: true },
      { source: '/guru/dashboard', destination: '/guru_madrasah/dashboard', permanent: true },
      { source: '/sekretariat', destination: '/admin/dashboard', permanent: true },
      { source: '/sekretariat/dashboard', destination: '/admin/dashboard', permanent: true },
      { source: '/wali', destination: '/wali_santri/dashboard', permanent: true },
      { source: '/wali/dashboard', destination: '/wali_santri/dashboard', permanent: true },
    ];
  },
};

export default nextConfig;

