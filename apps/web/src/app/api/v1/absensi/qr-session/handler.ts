import { NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { createSuccessResponse, createErrorResponse } from '@darsa/utils';
import crypto from 'crypto';

export async function POST() {
  try {
    // Generate 16-char random token with 10-second expiration window
    const randomHex = crypto.randomBytes(8).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 1000); // 10 seconds TOTP window

    const qrToken = `DARSA-QR-${randomHex.toUpperCase()}`;

    // Persist QR session to database for validation during scan
    await prisma.qrSession.create({
      data: {
        qr_token: qrToken,
        expires_at: expiresAt,
      },
    });

    const qrSessionPayload = {
      qr_token: qrToken,
      expires_at: expiresAt.toISOString(),
      refresh_interval_ms: 5000,
    };

    return NextResponse.json(
      createSuccessResponse(qrSessionPayload, 'Sesi Dynamic QR Presensi berhasil diperbarui')
    );
  } catch (error) {
    console.error('[QR Session] Error:', error);
    return NextResponse.json(
      createErrorResponse('Gagal membuat sesi QR Presensi.'),
      { status: 500 }
    );
  }
}
