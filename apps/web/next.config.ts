import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@darsa/database'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingIncludes: {
    '**/*': [
      '../../node_modules/.pnpm/@prisma+client*/**/*',
      '../../node_modules/.pnpm/@prisma+engines*/**/*',
      '../../node_modules/.prisma/client/**/*',
      '../../packages/database/**/*',
    ],
  },
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
