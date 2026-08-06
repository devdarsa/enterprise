import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@darsa/database'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@darsa/auth', '@darsa/types', '@darsa/ui', '@darsa/utils'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
