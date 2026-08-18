import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Always maintain singleton across all serverless & development hot-reloads
globalForPrisma.prisma = prisma;

export function getPrisma(): PrismaClient {
  return prisma;
}

export * from '@prisma/client';
