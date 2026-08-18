import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit, RouteContext } from '@/lib/api-auth';

// GET /api/v1/santri/[id]
export const GET = withAuth(
  async (req: NextRequest, session, context?: RouteContext) => {
    const paramsResolved = (context && typeof context === 'object' && 'params' in context && context.params) ? await (context.params as Promise<{ id: string }>) : undefined;
    const id = paramsResolved?.id || req.url.split('/').slice(-1)[0];

    const santri = await prisma.santri.findFirst({
      where: { id, deleted_at: null },
      include: {
        user: { select: { foto_url: true, email: true } },
        kelas: true,
        penempatan: { orderBy: { created_at: 'desc' } },
        wali_santri: { include: { wali_santri: true } },
        nilai: { include: { mata_pelajaran: true } },
        pelanggaran: { where: { deleted_at: null }, orderBy: { tanggal: 'desc' } },
        perizinan: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
      },
    });

    if (!santri) return apiError('Data santri tidak ditemukan.', 404);

    const formatted = {
      ...santri,
      avatar_url: santri.user?.foto_url || undefined,
    };

    return apiSuccess(formatted);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'WALI_SANTRI']
);

// PUT /api/v1/santri/[id]
export const PUT = withAuth(
  async (req: NextRequest, session, context?: RouteContext) => {
    const paramsResolved = (context && typeof context === 'object' && 'params' in context && context.params) ? await (context.params as Promise<{ id: string }>) : undefined;
    const id = paramsResolved?.id || req.url.split('/').slice(-1)[0];
    const body = await req.json();

    const existing = await prisma.santri.findFirst({ where: { id, deleted_at: null } });
    if (!existing) return apiError('Data santri tidak ditemukan.', 404);

    let photoUrl = body.avatar_url || body.foto_url;
    let userId = existing.user_id;

    // Ambil foto lama untuk pembersihan Cloudinary jika diganti
    let oldPhotoUrl: string | null = null;
    if (userId) {
      const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: { foto_url: true } });
      oldPhotoUrl = existingUser?.foto_url || null;
    }

    if (photoUrl && photoUrl.startsWith('data:image/')) {
      try {
        const { uploadToCloudinary, deleteFromCloudinary } = await import('@/lib/cloudinary');
        const uploaded = await uploadToCloudinary(photoUrl, 'darsa_santri');
        photoUrl = uploaded.url;

        // Hapus foto lama dari Cloudinary jika foto baru berhasil diunggah
        if (oldPhotoUrl && oldPhotoUrl !== photoUrl && oldPhotoUrl.includes('cloudinary.com')) {
          deleteFromCloudinary(oldPhotoUrl).catch((e) => console.error('Gagal hapus foto lama Cloudinary:', e));
        }
      } catch (err) {
        console.error('Gagal upload foto santri ke Cloudinary:', err);
      }
    }

    // Sinkronisasi foto santri ke User Profile
    if (photoUrl) {
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { foto_url: photoUrl, nama_lengkap: body.nama_lengkap || existing.nama_lengkap },
        }).catch(() => {});
      } else {
        const newUser = await prisma.user.create({
          data: {
            email: `santri.${(existing.nisp || existing.id).toLowerCase()}@darsa.santri.id`,
            nama_lengkap: body.nama_lengkap || existing.nama_lengkap,
            foto_url: photoUrl,
            email_verified: false,
          },
        }).catch(() => null);
        if (newUser) {
          userId = newUser.id;
        }
      }
    }

    const updated = await prisma.santri.update({
      where: { id },
      data: {
        user_id: userId,
        nama_lengkap: body.nama_lengkap !== undefined ? body.nama_lengkap : existing.nama_lengkap,
        nama_panggilan: body.nama_panggilan !== undefined ? body.nama_panggilan : existing.nama_panggilan,
        nisp: body.nisp !== undefined ? body.nisp : existing.nisp,
        nisn: body.nisn !== undefined ? body.nisn : existing.nisn,
        nis: body.nis !== undefined ? body.nis : existing.nis,
        nik: body.nik !== undefined ? body.nik : existing.nik,
        jenis_kelamin: body.jenis_kelamin !== undefined ? body.jenis_kelamin : existing.jenis_kelamin,
        tempat_lahir: body.tempat_lahir !== undefined ? body.tempat_lahir : existing.tempat_lahir,
        tanggal_lahir: body.tanggal_lahir ? new Date(body.tanggal_lahir) : existing.tanggal_lahir,
        anak_ke: body.anak_ke !== undefined ? (Number(body.anak_ke) || null) : existing.anak_ke,
        jumlah_saudara: body.jumlah_saudara !== undefined ? (Number(body.jumlah_saudara) || null) : existing.jumlah_saudara,
        alamat: body.alamat !== undefined ? body.alamat : existing.alamat,
        telepon: body.telepon !== undefined ? body.telepon : existing.telepon,
        jenjang: body.jenjang !== undefined ? body.jenjang : existing.jenjang,
        kelas_id: body.kelas_id !== undefined ? body.kelas_id : existing.kelas_id,
        kamar: body.kamar !== undefined ? body.kamar : existing.kamar,
        status_tempat_tinggal: body.status_tempat_tinggal !== undefined ? body.status_tempat_tinggal : existing.status_tempat_tinggal,
        hafalan_juz: body.hafalan_juz !== undefined ? (Number(body.hafalan_juz) || 0) : existing.hafalan_juz,
        nik_wali: body.nik_wali !== undefined ? body.nik_wali : existing.nik_wali,
        nama_wali: body.nama_wali !== undefined ? body.nama_wali : existing.nama_wali,
        telepon_wali: body.telepon_wali !== undefined ? body.telepon_wali : existing.telepon_wali,
        hubungan_wali: body.hubungan_wali !== undefined ? body.hubungan_wali : existing.hubungan_wali,
        no_kk: body.no_kk !== undefined ? body.no_kk : existing.no_kk,
        provinsi: body.provinsi !== undefined ? body.provinsi : existing.provinsi,
        kabupaten: body.kabupaten !== undefined ? body.kabupaten : existing.kabupaten,
        kecamatan: body.kecamatan !== undefined ? body.kecamatan : existing.kecamatan,
        desa: body.desa !== undefined ? body.desa : existing.desa,
        status: body.status !== undefined ? body.status : existing.status,
        deleted_at: body.deleted_at !== undefined ? body.deleted_at : existing.deleted_at,
      },
      include: {
        user: { select: { foto_url: true } },
        kelas: true,
      },
    });

    // Auto-update / link WaliSantri & siblings based on KK & NIK Wali
    const effectiveKK = updated.no_kk || existing.no_kk;
    const effectiveNikWali = updated.nik_wali || existing.nik_wali;
    const effectiveNamaWali = updated.nama_wali || existing.nama_wali;
    const effectiveTeleponWali = updated.telepon_wali || existing.telepon_wali;

    if (effectiveKK || effectiveNikWali) {
      try {
        let wali = await prisma.waliSantri.findFirst({
          where: {
            OR: [
              ...(effectiveNikWali ? [{ nik: effectiveNikWali }] : []),
              ...(effectiveKK ? [{ nik: effectiveKK }] : []),
            ],
          },
        });

        if (!wali) {
          wali = await prisma.waliSantri.create({
            data: {
              nik: effectiveNikWali || effectiveKK || `KK-${Date.now()}`,
              nama_lengkap: effectiveNamaWali || 'Wali Santri',
              telepon: effectiveTeleponWali || '',
              no_hp: effectiveTeleponWali || '',
            },
          });
        } else if (effectiveNamaWali) {
          await prisma.waliSantri.update({
            where: { id: wali.id },
            data: {
              nama_lengkap: effectiveNamaWali,
              telepon: effectiveTeleponWali || wali.telepon,
            },
          }).catch(() => {});
        }

        await prisma.hubunganWali.upsert({
          where: {
            wali_santri_id_santri_id: {
              wali_santri_id: wali.id,
              santri_id: updated.id,
            },
          },
          update: { hubungan: updated.hubungan_wali || 'AYAH' },
          create: {
            wali_santri_id: wali.id,
            santri_id: updated.id,
            hubungan: updated.hubungan_wali || 'AYAH',
            is_primary: true,
          },
        });

        // Link all other siblings with same KK
        if (effectiveKK) {
          const siblings = await prisma.santri.findMany({
            where: { no_kk: effectiveKK, id: { not: updated.id }, deleted_at: null },
          });
          for (const sib of siblings) {
            await prisma.hubunganWali.upsert({
              where: {
                wali_santri_id_santri_id: {
                  wali_santri_id: wali.id,
                  santri_id: sib.id,
                },
              },
              update: {},
              create: {
                wali_santri_id: wali.id,
                santri_id: sib.id,
                hubungan: sib.hubungan_wali || 'AYAH',
                is_primary: false,
              },
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.error('Auto-link WaliSantri on PUT error:', e);
      }
    }

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE_SANTRI',
      entityType: 'Santri',
      entityId: id,
      metadata: { perubahan: body },
    });

    const responseData = {
      ...updated,
      avatar_url: photoUrl || updated.user?.foto_url || undefined,
    };

    return apiSuccess(responseData, 'Data santri berhasil diperbarui.');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);

// DELETE /api/v1/santri/[id] — Soft delete
export const DELETE = withAuth(
  async (req: NextRequest, session, context?: RouteContext) => {
    const paramsResolved = (context && typeof context === 'object' && 'params' in context && context.params) ? await (context.params as Promise<{ id: string }>) : undefined;
    const id = paramsResolved?.id || req.url.split('/').slice(-1)[0];

    const existing = await prisma.santri.findFirst({ where: { id, deleted_at: null } });
    if (!existing) return apiError('Data santri tidak ditemukan.', 404);

    await prisma.santri.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    await logAudit({
      userId: session.user.id,
      action: 'DELETE_SANTRI',
      entityType: 'Santri',
      entityId: id,
      metadata: { nisp: existing.nisp, nama: existing.nama_lengkap },
    });

    return apiSuccess(null, 'Data santri dipindahkan ke Recycle Bin (Soft Delete).');
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
