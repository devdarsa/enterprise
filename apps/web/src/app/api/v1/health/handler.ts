import { NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { createSuccessResponse, createErrorResponse } from '@darsa/utils';

export async function GET() {
  let dbStatus = 'connected';

  try {
    // Real DB connectivity check
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'disconnected';
  }

  const healthData = {
    status: dbStatus === 'connected' ? 'ONLINE' : 'DEGRADED',
    version: '1.0.0',
    services: {
      api: 'operational',
      auth: 'operational',
      database: dbStatus,
    },
    timestamp: new Date().toISOString(),
  };

  const statusCode = dbStatus === 'connected' ? 200 : 503;

  return NextResponse.json(
    createSuccessResponse(healthData, 'Darsa Enterprise API Engine Online'),
    { status: statusCode }
  );
}
