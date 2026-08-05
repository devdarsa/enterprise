import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { toNextJsHandler } from 'better-auth/next-js';
import { prisma } from '@darsa/database';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    generateId: false,
  },
});

export const authHandlers = toNextJsHandler(auth);

export type Session = typeof auth.$Infer.Session;
// NOTE: Do NOT re-export client here — client uses React hooks and breaks middleware/server bundles.
// Import client functions directly from '@darsa/auth/client'
