import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@darsa/database';
import { apiSuccess, apiError, logAudit } from '@/lib/api-auth';
import { auth } from '@darsa/auth';

/**
 * POST /api/v1/auth/register-wali/verify-otp
 * Verifikasi 6-digit OTP WhatsApp, Pembuatan Akun Wali Santri & Penyambungan Otomatis Data Anak.
 * Sesuai Ketentuan BAB VIII, IX, XI, XII, XIV.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nik, phone, email, password, otp } = body;

    const cleanNik = String(nik || '').trim();
    const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();
    const cleanPassword = String(password || '');

    // 1. Validasi Input Format
    if (!cleanNik || !/^\d{16}$/.test(cleanNik)) {
      return apiError('NIK wajib berisi 16 digit angka.', 400);
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      return apiError('Nomor WhatsApp tidak valid.', 400);
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return apiError('Format Email / Username tidak valid.', 400);
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return apiError('Password minimal 6 karakter.', 400);
    }
    if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      return apiError('Kode OTP wajib berisi 6 digit angka.', 400);
    }

    // 2. Ambil record OTP PENDING terbaru untuk NIK & Nomor HP ini
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        nik: cleanNik,
        phone: cleanPhone,
        status: 'PENDING',
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRecord) {
      return apiError('Kode OTP tidak ditemukan atau sudah tidak berlaku. Silakan kirim ulang OTP.', 400);
    }

    // 3. Cek Masa Berlaku (Max 1 Menit / 60 Detik)
    if (new Date() > new Date(otpRecord.expires_at)) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { status: 'EXPIRED' },
      });

      await logAudit({
        action: 'VERIFIKASI_OTP_KEDALUWARSA',
        entityType: 'OtpVerification',
        entityId: otpRecord.id,
        metadata: { nik: cleanNik, phone: cleanPhone },
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      });

      return apiError('Kode OTP sudah kedaluwarsa (berlaku 1 menit / 60 detik). Silakan minta OTP baru.', 400);
    }

    // 4. Cek Maksimal Percobaan (Max 5x Percobaan Salah sesuai BAB XI)
    if (otpRecord.attempts >= 5) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { status: 'FAILED' },
      });

      await logAudit({
        action: 'VERIFIKASI_OTP_MAX_ATTEMPTS',
        entityType: 'OtpVerification',
        entityId: otpRecord.id,
        metadata: { nik: cleanNik, phone: cleanPhone, attempts: otpRecord.attempts },
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      });

      return apiError('Batas percobaan OTP (5 kali) terlampaui. Silakan minta OTP baru.', 400);
    }

    // 5. Verifikasi Hash SHA-256 OTP
    const submittedOtpHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');

    if (submittedOtpHash !== otpRecord.otp_hash) {
      const newAttempts = otpRecord.attempts + 1;
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: {
          attempts: newAttempts,
          status: newAttempts >= 5 ? 'FAILED' : 'PENDING',
        },
      });

      await logAudit({
        action: 'VERIFIKASI_OTP_GAGAL',
        entityType: 'OtpVerification',
        entityId: otpRecord.id,
        metadata: { nik: cleanNik, phone: cleanPhone, attempts: newAttempts, attemptsRemaining: Math.max(0, 5 - newAttempts) },
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      });

      return apiError(`Kode OTP salah. Sisa percobaan: ${Math.max(0, 5 - newAttempts)} kali.`, 400);
    }

    // 6. OTP Valid — Update Status ke VERIFIED
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { status: 'VERIFIED' },
    });

    await logAudit({
      action: 'VERIFIKASI_OTP_SUKSES',
      entityType: 'OtpVerification',
      entityId: otpRecord.id,
      metadata: { nik: cleanNik, phone: cleanPhone },
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    // 7. Cari data Santri terhubung di Database Pondok (SSOT)
    const connectedSantri = await prisma.santri.findMany({
      where: { nik_wali: cleanNik, deleted_at: null },
    });

    if (!connectedSantri || connectedSantri.length === 0) {
      return apiError('Data Santri untuk NIK ini tidak ditemukan pada Database Pondok.', 404);
    }

    const namaWali = connectedSantri[0].nama_wali || connectedSantri[0].nama_lengkap + ' (Wali)';

    // 8. Buat Akun User via Better Auth
    let newUser: any;
    try {
      // Better Auth Sign Up API
      const authResult = await auth.api.signUpEmail({
        body: {
          email: cleanEmail,
          password: cleanPassword,
          name: namaWali,
        },
      });
      if (authResult?.user) {
        newUser = authResult.user;
      }
    } catch (authErr: any) {
      console.warn('⚠️ Better Auth API signup note:', authErr.message || authErr);
    }

    // Fallback jika user belum dibuat oleh Better Auth API call
    if (!newUser) {
      newUser = await prisma.user.findFirst({ where: { email: cleanEmail } });
    }
    if (!newUser) {
      newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          nama_lengkap: namaWali,
          email_verified: true,
        },
      });
    } else {
      // Pastikan email_verified true
      await prisma.user.update({
        where: { id: newUser.id },
        data: { email_verified: true },
      });
    }

    // 9. Attach Role WALI_SANTRI
    const waliRole = await prisma.role.upsert({
      where: { name: 'WALI_SANTRI' },
      update: {},
      create: { name: 'WALI_SANTRI', description: 'Orang Tua / Wali Santri' },
    });

    await prisma.userRole.upsert({
      where: {
        user_id_role_id: {
          user_id: newUser.id,
          role_id: waliRole.id,
        },
      },
      update: {},
      create: {
        user_id: newUser.id,
        role_id: waliRole.id,
      },
    });

    // 10. Buat Profil WaliSantri
    const waliSantriRecord = await prisma.waliSantri.upsert({
      where: { user_id: newUser.id },
      update: {
        nik: cleanNik,
        nama_lengkap: namaWali,
        telepon: cleanPhone,
      },
      create: {
        user_id: newUser.id,
        nik: cleanNik,
        nama_lengkap: namaWali,
        telepon: cleanPhone,
      },
    });

    // 11. BAB IX: Hubungan Otomatis Seluruh Santri dengan NIK Wali Ini
    for (const santri of connectedSantri) {
      await prisma.hubunganWali.upsert({
        where: {
          santri_id_wali_santri_id: {
            santri_id: santri.id,
            wali_santri_id: waliSantriRecord.id,
          },
        },
        update: {
          hubungan: santri.hubungan_wali || 'WALI',
        },
        create: {
          santri_id: santri.id,
          wali_santri_id: waliSantriRecord.id,
          hubungan: santri.hubungan_wali || 'WALI',
        },
      });
    }

    // 12. Catat Audit Log Pembuatan Akun & Login Pertama
    await logAudit({
      userId: newUser.id,
      action: 'PEMBUATAN_AKUN_WALI',
      entityType: 'WaliSantri',
      entityId: waliSantriRecord.id,
      metadata: {
        nik: cleanNik,
        email: cleanEmail,
        namaWali,
        santriCount: connectedSantri.length,
        connectedSantriIds: connectedSantri.map((s: any) => s.id),
      },
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return apiSuccess({
      registered: true,
      email: cleanEmail,
      nama_wali: namaWali,
      santri_count: connectedSantri.length,
      redirect_url: '/login',
    }, `Akun Wali Santri untuk ${namaWali} berhasil dibuat dan diaktifkan. Silakan login.`);

  } catch (err: any) {
    console.error('❌ Error verify-otp:', err);
    return apiError('Terjadi kesalahan server saat memverifikasi OTP dan membuat akun.', 500);
  }
}
