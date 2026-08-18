import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { no_kk, nama_ayah, email, otp, password } = body;

    const cleanKK = String(no_kk || '').trim();
    const cleanNamaAyah = String(nama_ayah || '').trim();
    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanOtp = String(otp || '').trim();

    if (!cleanKK || !cleanEmail || !cleanOtp) {
      return NextResponse.json(
        { success: false, error: 'Nomor KK, Email, dan Kode OTP wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Verifikasi OTP
    const submittedHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        nik: cleanKK,
        phone: cleanEmail,
        status: 'PENDING',
      },
      orderBy: { created_at: 'desc' },
    });

    // Validasi hash (atau bypass jika kode master 123456 untuk testing)
    const isMasterOtp = cleanOtp === '123456';
    if (!isMasterOtp) {
      if (!otpRecord) {
        return NextResponse.json(
          { success: false, error: 'Kode verifikasi tidak ditemukan atau sudah kedaluwarsa. Silakan kirim ulang OTP.' },
          { status: 400 }
        );
      }

      if (new Date() > new Date(otpRecord.expires_at)) {
        return NextResponse.json(
          { success: false, error: 'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.' },
          { status: 400 }
        );
      }

      if (otpRecord.otp_hash !== submittedHash) {
        return NextResponse.json(
          { success: false, error: 'Kode verifikasi (OTP) salah. Harap periksa kembali email Anda.' },
          { status: 400 }
        );
      }
    }

    // Tandai OTP VERIFIED
    if (otpRecord) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { status: 'VERIFIED' },
      }).catch(() => {});
    }

    // 2. Ambil seluruh data santri yang terhubung dengan KK ini
    const santriList = await prisma.santri.findMany({
      where: {
        OR: [
          { no_kk: cleanKK },
          { nik_wali: cleanKK },
          { nama_wali: { contains: cleanNamaAyah, mode: 'insensitive' } },
        ],
        deleted_at: null,
      },
      include: {
        kelas: { select: { nama_kelas: true } },
      },
    });

    const finalNamaAyah = cleanNamaAyah || santriList[0]?.nama_wali || 'Wali Santri';
    const tempPassword = password || 'darsa25';

    // 3. Buat atau perbarui Akun User
    let user = await prisma.user.findFirst({
      where: { email: cleanEmail, deleted_at: null },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          nama_lengkap: finalNamaAyah,
          email_verified: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          nama_lengkap: finalNamaAyah,
          email_verified: true,
        },
      });
    }

    // Pastikan role WALI_SANTRI terpasang
    const waliRole = await prisma.role.upsert({
      where: { name: 'WALI_SANTRI' },
      update: {},
      create: { name: 'WALI_SANTRI', description: 'Wali Santri' },
    });

    await prisma.userRole.upsert({
      where: {
        user_id_role_id: {
          user_id: user.id,
          role_id: waliRole.id,
        },
      },
      update: {},
      create: {
        user_id: user.id,
        role_id: waliRole.id,
      },
    }).catch(() => {});

    // 4. Buat / Hubungkan WaliSantri Profile
    let waliProfile = await prisma.waliSantri.findFirst({
      where: {
        OR: [
          { user_id: user.id },
          { nik: cleanKK },
        ],
      },
    });

    if (!waliProfile) {
      waliProfile = await prisma.waliSantri.create({
        data: {
          user_id: user.id,
          nik: cleanKK,
          nama_lengkap: finalNamaAyah,
          telepon: santriList[0]?.telepon_wali || '',
          no_hp: santriList[0]?.telepon_wali || '',
        },
      });
    } else {
      waliProfile = await prisma.waliSantri.update({
        where: { id: waliProfile.id },
        data: {
          user_id: user.id,
          nama_lengkap: finalNamaAyah,
          nik: cleanKK,
        },
      });
    }

    // 5. Hubungkan semua Santri pada KK ini ke WaliSantri
    for (const s of santriList) {
      await prisma.hubunganWali.upsert({
        where: {
          wali_santri_id_santri_id: {
            wali_santri_id: waliProfile.id,
            santri_id: s.id,
          },
        },
        update: { hubungan: s.hubungan_wali || 'AYAH' },
        create: {
          wali_santri_id: waliProfile.id,
          santri_id: s.id,
          hubungan: s.hubungan_wali || 'AYAH',
          is_primary: true,
        },
      }).catch(() => {});
    }

    // 6. Buat Session Payload & Cookie
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.nama_lengkap,
      role: 'WALI_SANTRI',
      instansi: 'PONDOK',
      no_kk: cleanKK,
      nik: cleanKK,
    };

    const res = NextResponse.json({
      success: true,
      message: 'Akun Wali Santri berhasil diaktifkan!',
      account: {
        email: cleanEmail,
        nama_ayah: finalNamaAyah,
        no_kk: cleanKK,
        role: 'WALI_SANTRI',
        kata_sandi: tempPassword,
        total_anak: santriList.length,
        anak: santriList.map((s) => ({
          nama: s.nama_lengkap,
          nisp: s.nisp,
          nik: s.nik || '-',
          kelas: s.kelas?.nama_kelas || s.jenjang || 'Pondok Pesantren',
        })),
      },
      redirect_url: '/wali_santri/dashboard',
    });

    res.cookies.set('darsa_session', encodeURIComponent(JSON.stringify(sessionPayload)), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 hari
    });

    return res;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat mengaktifkan akun.' },
      { status: 500 }
    );
  }
}
