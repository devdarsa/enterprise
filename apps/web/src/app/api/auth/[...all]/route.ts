import { auth } from '@darsa/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return auth.handler(request);
}

export async function GET(request: NextRequest) {
  return auth.handler(request);
}
