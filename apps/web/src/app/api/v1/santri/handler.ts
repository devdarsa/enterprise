import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// GET /api/v1/santri — List santri dengan pagination, filter, search
export const GET = withAuth(
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const instansi = searchParams.get('instansi') || '';
    const status = searchParams.get('status') || '';
    const jenjang = searchParams.get('jenjang') || '';
    const skip = (page - 1) * limit;

    const where: Prisma.SantriWhereInput = {
      deleted_at: null,
    };

    if (search) {
      where.OR = [
        { nama_lengkap: { contains: search, mode: 'insensitive' } },
        { nisp: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
        { nama_wali: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status as Prisma.EnumStatusSantriFilter['equals'];
    if (jenjang) where.jenjang = jenjang as Prisma.EnumJenjangSantriFilter['equals'];

    const [total, santri] = await Promise.all([
      prisma.santri.count({ where }),
      prisma.santri.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { foto_url: true } },
          kelas: { select: { nama_kelas: true, tingkat: true } },
          penempatan: {
            where: { status: 'AKTIF' },
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const formattedSantri = santri.map((s) => ({
      ...s,
      avatar_url: s.user?.foto_url || undefined,
    }));

    return apiSuccess(
      formattedSantri,
      undefined,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      5
    );
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI']
);

// POST /api/v1/santri — Tambah santri baru
export const POST = withAuth(
  async (req: NextRequest, session) => {
    const body = await req.json();
    const {
      nisp, nisn, nis, nik, nama_lengkap, nama_panggilan, jenis_kelamin,
      tempat_lahir, tanggal_lahir, anak_ke, jumlah_saudara, alamat, telepon,
      jenjang, kelas_id, kamar, status_tempat_tinggal, hafalan_juz,
      nik_wali, nama_wali, telepon_wali, hubungan_wali, no_kk,
      pondok_id, user_id, avatar_url, foto_url,
    } = body;

    // Validasi minimum
    if (!nama_lengkap) {
      return apiError('Nama lengkap santri wajib diisi.');
    }

    const finalNisp = nisp || `PNDK-${Date.now().toString().slice(-8)}`;
    const finalNisn = nisn || `00${Date.now().toString().slice(-8)}`;

    // Cek duplikasi NISP/NISN jika disediakan
    const existing = await prisma.santri.findFirst({
      where: { OR: [{ nisp: finalNisp }, { nisn: finalNisn }], deleted_at: null },
    });
    if (existing) {
      return apiError(`Data santri dengan NISP ${finalNisp} atau NISN ${finalNisn} sudah terdaftar.`, 409);
    }

    // Auto-resolve pondok_id
    let finalPondokId = pondok_id;
    if (!finalPondokId) {
      let defaultPondok = await prisma.pondok.findFirst();
      if (!defaultPondok) {
        defaultPondok = await prisma.pondok.create({
          data: { nama: "Pondok Pesantren Ma'had Darussa'adah Lirboyo" },
        });
      }
      finalPondokId = defaultPondok.id;
    }

    // Auto-resolve kelas_id
    let finalKelasId = kelas_id;
    if (!finalKelasId) {
      let defaultKelas = await prisma.kelas.findFirst();
      if (!defaultKelas) {
        defaultKelas = await prisma.kelas.create({
          data: {
            nama_kelas: '10-A (Tahfidz & Diniyah)',
            jenjang: 'PONDOK',
            tingkat: 1,
            kapasitas: 30,
          },
        });
      }
      finalKelasId = defaultKelas.id;
    }

    // Jika tidak ada user_id, buat user baru dahulu
    let resolvedPhotoUrl = avatar_url || foto_url || null;
    if (resolvedPhotoUrl && resolvedPhotoUrl.startsWith('data:image/')) {
      try {
        const { uploadToCloudinary } = await import('@/lib/cloudinary');
        const uploaded = await uploadToCloudinary(resolvedPhotoUrl, 'darsa_santri');
        resolvedPhotoUrl = uploaded.url;
      } catch (err) {
        console.error('Gagal upload foto santri ke Cloudinary:', err);
      }
    }

    let finalUserId = user_id;
    if (!finalUserId) {
      const newUser = await prisma.user.create({
        data: {
          email: `${finalNisp.toLowerCase()}@darsa.santri.id`,
          nama_lengkap: nama_lengkap,
          foto_url: resolvedPhotoUrl,
          email_verified: false,
        },
      });
      finalUserId = newUser.id;
    } else if (resolvedPhotoUrl) {
      await prisma.user.update({
        where: { id: finalUserId },
        data: { foto_url: resolvedPhotoUrl },
      }).catch(() => {});
    }

    const santri = await prisma.santri.create({
      data: {
        user_id: finalUserId,
        pondok_id: finalPondokId,
        kelas_id: finalKelasId,
        nisp: finalNisp,
        nisn: finalNisn,
        nis,
        nik,
        nama_lengkap,
        nama_panggilan,
        jenis_kelamin: jenis_kelamin === 'P' || jenis_kelamin === 'PEREMPUAN' ? 'PEREMPUAN' : 'LAKI_LAKI',
        tempat_lahir,
        tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : undefined,
        anak_ke: anak_ke ? parseInt(anak_ke) : undefined,
        jumlah_saudara: jumlah_saudara ? parseInt(jumlah_saudara) : undefined,
        alamat,
        telepon,
        jenjang: jenjang === 'MI' ? 'MI' : jenjang === 'MADRASAH_DINIYAH' ? 'MADRASAH_DINIYAH' : 'PONDOK',
        kamar,
        status_tempat_tinggal,
        hafalan_juz: hafalan_juz ? parseInt(hafalan_juz) : 0,
        nik_wali,
        nama_wali,
        telepon_wali,
        hubungan_wali,
        no_kk,
        status: 'AKTIF',
      },
    });

    // Auto-create / link WaliSantri based on KK & NIK Wali
    if (no_kk || nik_wali) {
      try {
        let wali = await prisma.waliSantri.findFirst({
          where: {
            OR: [
              ...(nik_wali ? [{ nik: nik_wali }] : []),
              ...(no_kk ? [{ nik: no_kk }] : []),
            ],
          },
        });

        if (!wali) {
          wali = await prisma.waliSantri.create({
            data: {
              nik: nik_wali || no_kk || `KK-${Date.now()}`,
              nama_lengkap: nama_wali || 'Wali Santri',
              telepon: telepon_wali || '',
              no_hp: telepon_wali || '',
            },
          });
        }

        // Link hubungan wali
        await prisma.hubunganWali.upsert({
          where: {
            wali_santri_id_santri_id: {
              wali_santri_id: wali.id,
              santri_id: santri.id,
            },
          },
          update: { hubungan: hubungan_wali || 'AYAH' },
          create: {
            wali_santri_id: wali.id,
            santri_id: santri.id,
            hubungan: hubungan_wali || 'AYAH',
            is_primary: true,
          },
        });

        // Link any siblings with the same no_kk to this wali
        if (no_kk) {
          const siblings = await prisma.santri.findMany({
            where: { no_kk, id: { not: santri.id }, deleted_at: null },
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
        console.error('Auto-link WaliSantri error:', e);
      }
    }

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_SANTRI',
      entityType: 'Santri',
      entityId: santri.id,
      metadata: { nisp: finalNisp, nama: nama_lengkap },
    });

    return apiSuccess(santri, `Data santri ${nama_lengkap} berhasil disimpan ke database.`);
  },
  ['SEKRETARIAT', 'ADMIN_INSTANSI']
);
