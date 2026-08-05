import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@darsa/utils';

export async function GET() {
  const healthData = {
    status: 'ONLINE',
    version: '1.0.0',
    services: {
      api: 'operational',
      auth: 'operational',
      database: 'connected',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(createSuccessResponse(healthData, 'Darsa Enterprise API Engine Online'));
}
