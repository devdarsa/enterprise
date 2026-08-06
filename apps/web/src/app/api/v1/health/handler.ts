import { NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { createSuccessResponse } from '@darsa/utils';

export async function GET() {
  let dbStatus = 'connected';
  let userCount = 0;
  let accountCount = 0;
  let sampleEmails: string[] = [];

  try {
    userCount = await prisma.user.count();
    accountCount = await prisma.account.count();
    const users = await prisma.user.findMany({ take: 5, select: { email: true } });
    sampleEmails = users.map((u) => u.email);
  } catch (e) {
    dbStatus = 'disconnected';
  }

  const rawDbUrl = process.env.DATABASE_URL || 'NOT_SET';
  const maskedDbUrl = rawDbUrl.replace(/:([^:@]+)@/, ':****@');

  const healthData = {
    status: dbStatus === 'connected' ? 'ONLINE' : 'DEGRADED',
    version: '1.0.0',
    services: {
      api: 'operational',
      auth: 'operational',
      database: dbStatus,
    },
    diagnostics: {
      userCount,
      accountCount,
      sampleEmails,
      dbHost: maskedDbUrl,
      betterAuthSecretSet: !!process.env.BETTER_AUTH_SECRET,
      betterAuthUrl: process.env.BETTER_AUTH_URL || 'NOT_SET',
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(
    createSuccessResponse(healthData, 'Darsa Enterprise API Engine Online'),
    { status: dbStatus === 'connected' ? 200 : 503 }
  );
}
