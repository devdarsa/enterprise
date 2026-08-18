import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { no_kk, email, nama_ayah } = body;

    const cleanKK = String(no_kk || '').trim();
    const cleanEmail = String(email || '').toLowerCase().trim();

    if (!cleanKK) {
      return NextResponse.json(
        { success: false, error: 'Nomor Kartu Keluarga (KK) wajib disertakan.' },
        { status: 400 }
      );
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Format email aktif tidak valid.' },
        { status: 400 }
      );
    }

    // Generate 6-digit Cryptographic OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // Simpan OTP ke tabel OtpVerification
    await prisma.otpVerification.create({
      data: {
        nik: cleanKK,
        phone: cleanEmail,
        otp_hash: otpHash,
        status: 'PENDING',
        expires_at: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Kode verifikasi telah dikirimkan ke email ${cleanEmail}.`,
      otp_preview: otp, // Untuk kemudahan verifikasi langsung
      expires_in: '10 menit',
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengirimkan kode verifikasi.' },
      { status: 500 }
    );
  }
}
