import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { apiSuccess, apiError, logAudit } from '@/lib/api-auth';

/**
 * POST /api/v1/auth/register-wali/check-nik
 * Validasi NIK Wali terhadap Database Pondok (Single Source of Truth).
 * Sesuai Ketentuan BAB IV, VI, XIV.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nik } = body;

    const cleanNik = String(nik || '').trim();

    // 1. Validasi format NIK 16 digit angka
    if (!cleanNik || !/^\d{16}$/.test(cleanNik)) {
      return apiError('NIK wajib berisi 16 digit angka kependudukan yang valid.', 400);
    }

    // 2. Cari santri di Database Pondok yang terhubung dengan NIK Wali ini
    const connectedSantri = await prisma.santri.findMany({
      where: {
        nik_wali: cleanNik,
        deleted_at: null,
      },
      include: {
        kelas: { select: { nama_kelas: true } },
      },
    });

    if (!connectedSantri || connectedSantri.length === 0) {
      await logAudit({
        action: 'VALIDASI_NIK_GAGAL',
        entityType: 'Santri',
        metadata: { nik: cleanNik, reason: 'NIK_TIDAK_DITEMUKAN' },
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      });

      return apiError(
        'NIK tidak ditemukan pada Database Pondok. Pendaftaran hanya dapat dilakukan oleh Wali Santri terdaftar.',
        404
      );
    }

    // 3. Cek apakah NIK ini sudah terhubung dengan akun WaliSantri aktif
    const existingWali = await prisma.waliSantri.findFirst({
      where: { nik: cleanNik },
      include: { user: { select: { email: true, deleted_at: true } } },
    });

    if (existingWali && (!existingWali.user.deleted_at)) {
      await logAudit({
        action: 'VALIDASI_NIK_TERDAFTAR',
        entityType: 'WaliSantri',
        entityId: existingWali.id,
        metadata: { nik: cleanNik, email: existingWali.user.email },
        ip: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      });

      return apiError(
        'NIK ini sudah memiliki akun aktif yang terdaftar. Silakan menuju halaman Login.',
        409
      );
    }

    // 4. Ambil data anak & wali awal (tanpa ekspos data berlebihan)
    const namaWali = connectedSantri[0].nama_wali || 'Wali Santri';
    const childrenList = connectedSantri.map((s) => ({
      id: s.id,
      nama: s.nama_lengkap,
      nisp: s.nisp,
      kelas: s.kelas?.nama_kelas || '-',
      status: s.status,
    }));

    // 5. Catat Audit Log
    await logAudit({
      action: 'VALIDASI_NIK_SUKSES',
      entityType: 'Santri',
      metadata: { nik: cleanNik, santriCount: connectedSantri.length, namaWali },
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return apiSuccess({
      valid: true,
      nik: cleanNik,
      nama_wali: namaWali,
      santri_count: connectedSantri.length,
      santri_list: childrenList,
    }, 'NIK valid dan terdaftar di Database Pondok.');

  } catch (err: any) {
    console.error('❌ Error check-nik:', err);
    return apiError('Terjadi kesalahan server saat memverifikasi NIK.', 500);
  }
}
