import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // Auto-normalize database region for project mndzkrskxavewncykcgh
  if (url.includes('mndzkrskxavewncykcgh')) {
    url = url
      .replace('aws-0-ap-southeast-1.pooler.supabase.com', 'aws-0-ap-northeast-1.pooler.supabase.com')
      .replace('aws-0-me-central-1.pooler.supabase.com', 'aws-0-ap-northeast-1.pooler.supabase.com');
  }

  // Ensure connection pooling params are set for optimal serverless performance
  if (!url.includes('connection_limit') && url.includes('?')) {
    url += '&connection_limit=10&pool_timeout=15&connect_timeout=10';
  } else if (!url.includes('connection_limit') && !url.includes('?')) {
    url += '?connection_limit=10&pool_timeout=15&connect_timeout=10';
  }

  return url;
}

const resolvedDbUrl = getDatabaseUrl();
if (resolvedDbUrl) {
  process.env.DATABASE_URL = resolvedDbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedDbUrl ? { db: { url: resolvedDbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Always maintain singleton across all serverless & development hot-reloads
globalForPrisma.prisma = prisma;

export function getPrisma(): PrismaClient {
  return prisma;
}

export * from '@prisma/client';

