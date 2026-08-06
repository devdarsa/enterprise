import { NextResponse } from 'next/server';
import { prisma } from '@darsa/database';

export async function GET() {
  try {
    const rawDbUrl = process.env.DATABASE_URL || '';
    // Mask password in DB URL for security
    const maskedUrl = rawDbUrl.replace(/:([^:@]+)@/, ':****@');

    const usersCount = await prisma.user.count();
    const accountsCount = await prisma.account.count();
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: { id: true, email: true },
    });

    return NextResponse.json({
      success: true,
      env_db_url_host: maskedUrl,
      usersCount,
      accountsCount,
      sampleUsers,
      better_auth_secret_set: !!process.env.BETTER_AUTH_SECRET,
      better_auth_url_env: process.env.BETTER_AUTH_URL || 'NOT_SET',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || 'Error querying DB',
    }, { status: 500 });
  }
}
