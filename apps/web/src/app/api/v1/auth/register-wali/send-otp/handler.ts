import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@darsa/database';
import { apiSuccess, apiError, logAudit } from '@/lib/api-auth';
import { waProvider } from '@/lib/wa-provider';

/**
 * POST /api/v1/auth/register-wali/send-otp
 * Membuat 6-digit OTP, menyimpan SHA-256 hash di DB, dan mengirimkan via WhatsApp Fonnte API.
 * Sesuai Ketentuan BAB VII, X, XI, XIV.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nik, phone, email } = body;

    const cleanNik = String(nik || '').trim();
    const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
    const cleanEmail = String(email || '').trim().toLowerCase();

    // 1. Validasi Input Format
    if (!cleanNik || !/^\d{16}$/.test(cleanNik)) {
      return apiError('NIK wajib berisi 16 digit angka.', 400);
    }
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15) {
      return apiError('Nomor WhatsApp wajib berisi 10-15 digit angka aktif.', 400);
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return apiError('Format Email / Username tidak valid.', 400);
    }

    // 2. Cek ketersediaan Email di tabel User
    const existingUser = await prisma.user.findFirst({
      where: { email: cleanEmail, deleted_at: null },
    });
    if (existingUser) {
      return apiError('Email / Username ini sudah digunakan oleh akun lain.', 409);
    }

    // 3. Verifikasi ulang NIK di Database Pondok
    const santriList = await prisma.santri.findMany({
      where: { nik_wali: cleanNik, deleted_at: null },
    });
    if (!santriList || santriList.length === 0) {
      return apiError('NIK tidak ditemukan pada Database Pondok.', 404);
    }

    // 4. Rate Limiting & Cooldown Check (BAB X & XI)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentOtps = await prisma.otpVerification.findMany({
      where: {
        nik: cleanNik,
        created_at: { gte: fifteenMinutesAgo },
      },
      orderBy: { created_at: 'desc' },
    });

    // Batas pengiriman ulang: max 3 kali dalam 15 menit
    if (recentOtps.length >= 3) {
      return apiError(
        'Batas pengiriman ulang OTP tercapai (maksimal 3x dalam 15 menit). Silakan tunggu 15 menit.',
        429
      );
    }

    // Jeda antar pengiriman (cooldown): minimal 60 detik
    if (recentOtps.length > 0) {
      const lastOtp = recentOtps[0];
      const secondsSinceLast = Math.floor((Date.now() - new Date(lastOtp.created_at).getTime()) / 1000);
      if (secondsSinceLast < 60) {
        const remainingCooldown = 60 - secondsSinceLast;
        return apiError(
          `Harap tunggu ${remainingCooldown} detik sebelum meminta OTP baru.`,
          429
        );
      }
    }

    // 5. Invalidate OTP PENDING sebelumnya
    await prisma.otpVerification.updateMany({
      where: {
        nik: cleanNik,
        status: 'PENDING',
      },
      data: { status: 'EXPIRED' },
    });

    // 6. Generate 6-Digit Numeric OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 1000); // 1 Menit / 60 Detik

    // 7. Simpan OTP Hash di DB
    const otpRecord = await prisma.otpVerification.create({
      data: {
        nik: cleanNik,
        phone: cleanPhone,
        otp_hash: otpHash,
        status: 'PENDING',
        resend_count: recentOtps.length + 1,
        expires_at: expiresAt,
      },
    });

    // 8. Kirim OTP via WhatsApp Provider (Fonnte API)
    const sendResult = await waProvider.sendOtp(cleanPhone, rawOtp, 1);

    if (!sendResult.success) {
      // Mark OTP record as failed
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { status: 'FAILED' },
      });

      await logAudit({
        action: 'KIRIM_OTP_GAGAL',
        entityType: 'OtpVerification',
        entityId: otpRecord.id,
        metadata: { nik: cleanNik, phone: cleanPhone, error: sendResult.error },
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      });

      return apiError(sendResult.error || 'Gagal mengirimkan pesan WhatsApp OTP.', 500);
    }

    // 9. Catat Audit Log
    await logAudit({
      action: 'KIRIM_OTP_SUKSES',
      entityType: 'OtpVerification',
      entityId: otpRecord.id,
      metadata: { nik: cleanNik, phone: cleanPhone, resendCount: recentOtps.length + 1 },
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return apiSuccess({
      sent: true,
      message: 'Kode OTP verifikasi telah dikirim ke nomor WhatsApp Anda (berlaku 1 menit / 60 detik).',
      expires_in: 60, // 1 menit (60s)
      cooldown: 60,   // 60s cooldown
    });

  } catch (err: any) {
    console.error('❌ Error send-otp:', err);
    return apiError('Terjadi kesalahan server saat mengirimkan OTP WhatsApp.', 500);
  }
}
