import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { toNextJsHandler } from 'better-auth/next-js';
import { prisma } from '@darsa/database';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    fields: {
      name: 'nama_lengkap',
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  account: {
    fields: {
      userId: 'user_id',
      providerId: 'provider',
      accountId: 'provider_account_id',
      refreshToken: 'refresh_token',
      accessToken: 'access_token',
      expiresAt: 'expires_at',
      idToken: 'id_token',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  session: {
    fields: {
      userId: 'user_id',
      token: 'session_token',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
});

export const authHandlers = toNextJsHandler(auth);

export type Session = typeof auth.$Infer.Session;
// NOTE: Do NOT re-export client here — client uses React hooks and breaks middleware/server bundles.
// Import client functions directly from '@darsa/auth/client'
