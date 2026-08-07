import { NextResponse } from 'next/server';
import { POST as handlePost } from './handler';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handlePost(request);
}
