import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  transpilePackages: ['@darsa/database', '@darsa/auth', '@darsa/types', '@darsa/ui', '@darsa/utils'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
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
