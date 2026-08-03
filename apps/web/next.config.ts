import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@darsa/auth', '@darsa/database', '@darsa/types', '@darsa/ui', '@darsa/utils'],
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
