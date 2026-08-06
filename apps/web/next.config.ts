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
};

export default nextConfig;
