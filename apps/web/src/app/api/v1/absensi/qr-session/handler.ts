import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@darsa/utils';
import crypto from 'crypto';

export async function POST() {
  // Generate 16-char random token with 10-second expiration window
  const randomHex = crypto.randomBytes(8).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 1000); // 10 seconds TOTP window

  const qrSessionPayload = {
    qr_token: `DARSA-QR-${randomHex.toUpperCase()}`,
    expires_at: expiresAt.toISOString(),
    refresh_interval_ms: 5000,
  };

  return NextResponse.json(
    createSuccessResponse(qrSessionPayload, 'Sesi Dynamic QR Presensi berhasil diperbarui')
  );
}
