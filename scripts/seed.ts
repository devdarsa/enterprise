declare const process: { exit: (code?: number) => never };
import { prisma } from '../packages/database/src/index';

async function main() {
  console.log('🌱 Seed Data Darsa Enterprise v1.0 dimulai...');

  // 1. Seed System Roles
  const roles = [
    { name: 'SEKRETARIAT', description: 'Administrasi Pondok, Madrasah & MI' },
    { name: 'ADMIN_INSTANSI', description: 'Administrator Pondok/Sekolah' },
    { name: 'GURU_MADRASAH', description: 'Guru / Ustadz Diniyah (Mustahiq & Munawwib)' },
    { name: 'GURU_MI', description: 'Guru MI (Khusus Absensi & Scan QR)' },
    { name: 'GURU', description: 'Tenaga Pengajar & Ustadz' },
    { name: 'PEGAWAI', description: 'Staf Operasional' },
    { name: 'SANTRI', description: 'Siswa / Santri' },
    { name: 'WALI_SANTRI', description: 'Orang Tua / Wali Santri' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name as any },
      update: { description: role.description },
      create: {
        name: role.name as any,
        description: role.description,
      },
    });
  }
  console.log('✅ Roles berhasil dibuat.');

  // 2. Seed Sample Pondok Pesantren & Madrasah
  let pondok = await prisma.pondok.findFirst({
    where: { nama: 'Pondok Pesantren Darsa Islamiyah' },
  });
  if (!pondok) {
    pondok = await prisma.pondok.create({
      data: {
        nama: 'Pondok Pesantren Darsa Islamiyah',
        alamat: 'Jl. Raya Pendidikan No. 45, Jakarta Selatan',
        telepon: '021-7890123',
      },
    });
  }

  let madrasah = await prisma.madrasah.findUnique({
    where: { npsn: '20198765' },
  });
  if (!madrasah) {
    madrasah = await prisma.madrasah.create({
      data: {
        pondok_id: pondok.id,
        nama: 'Madrasah Aliyah Darsa Enterprise',
        npsn: '20198765',
      },
    });
  }

  let kelas10 = await prisma.kelas.findFirst({
    where: { madrasah_id: madrasah.id, nama_kelas: '10-A (Tahfidz & Sains)' },
  });
  if (!kelas10) {
    kelas10 = await prisma.kelas.create({
      data: {
        madrasah_id: madrasah.id,
        nama_kelas: '10-A (Tahfidz & Sains)',
        tingkat: 10,
      },
    });
  }

  console.log('✅ Master Kelembagaan & Kelas berhasil dibuat.');

  // 3. Seed Lokasi Presensi (Geofencing GPS Radius 200m)
  let lokasi = await prisma.lokasiPresensi.findFirst({
    where: { pondok_id: pondok.id, nama_lokasi: 'Gerbang Utama & Pos Keamanan Darsa' },
  });
  if (!lokasi) {
    lokasi = await prisma.lokasiPresensi.create({
      data: {
        pondok_id: pondok.id,
        nama_lokasi: 'Gerbang Utama & Pos Keamanan Darsa',
        latitude: -6.2088,
        longitude: 106.8456,
        radius_meter: 200,
      },
    });
  }

  console.log(`✅ Lokasi Presensi Geofencing dibuat: ${lokasi.nama_lokasi} (Radius ${lokasi.radius_meter}m)`);

  // 4. Seed Admin User
  let adminUser = await prisma.user.findUnique({ where: { email: 'admin@darsa.id' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@darsa.id',
        nama_lengkap: 'Ustadz Ahmad Al-Farisi',
        email_verified: true,
      },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN_INSTANSI' } });
  if (adminRole) {
    const existingUserRole = await prisma.userRole.findFirst({
      where: { user_id: adminUser.id, role_id: adminRole.id },
    });
    if (!existingUserRole) {
      await prisma.userRole.create({
        data: {
          user_id: adminUser.id,
          role_id: adminRole.id,
        },
      });
    }
  }

  // 5. Seed Guru
  let guruUser = await prisma.user.findUnique({ where: { email: 'guru@darsa.id' } });
  if (!guruUser) {
    guruUser = await prisma.user.create({
      data: {
        email: 'guru@darsa.id',
        nama_lengkap: 'Dr. KH. Abdullah Ridwan',
        email_verified: true,
      },
    });
  }

  const existingGuru = await prisma.guru.findUnique({ where: { user_id: guruUser.id } });
  if (!existingGuru) {
    await prisma.guru.create({
      data: {
        user_id: guruUser.id,
        nip: '198501012010011001',
        nama_lengkap: guruUser.nama_lengkap,
        telepon: '081234567890',
      },
    });
  }

  // 6. Seed Santri
  let santriUser = await prisma.user.findUnique({ where: { email: 'santri@darsa.id' } });
  if (!santriUser) {
    santriUser = await prisma.user.create({
      data: {
        email: 'santri@darsa.id',
        nama_lengkap: 'Muhammad Raihan',
        email_verified: true,
      },
    });
  }

  const existingSantri = await prisma.santri.findUnique({ where: { user_id: santriUser.id } });
  if (!existingSantri) {
    await prisma.santri.create({
      data: {
        user_id: santriUser.id,
        pondok_id: pondok.id,
        kelas_id: kelas10.id,
        nisp: 'PNDK-0012345678',
        nisn: '0012345678',
        nama_lengkap: santriUser.nama_lengkap,
      },
    });
  }

  // 7. Seed 8 Akun Portal Default
  const DEFAULT_ACCOUNTS = [
    { email: 'sekretariat.pondok@darsa.my.id', nama_lengkap: 'Sekretariat Pondok Pesantren', role: 'SEKRETARIAT' as const },
    { email: 'sekretariat.madrasah@darsa.my.id', nama_lengkap: 'Sekretariat Madrasah Diniyah', role: 'ADMIN_INSTANSI' as const },
    { email: 'sekretariat.mi@darsa.my.id', nama_lengkap: 'Sekretariat Formal MI', role: 'ADMIN_INSTANSI' as const },
    { email: 'keamanan@darsa.my.id', nama_lengkap: 'Tim Keamanan & Perizinan', role: 'PEGAWAI' as const },
    { email: 'guru.mi@darsa.my.id', nama_lengkap: 'Ustadzah Guru MI', role: 'GURU_MI' as const },
    { email: 'mustahiq@darsa.my.id', nama_lengkap: 'Ustadz Mustahiq Diniyah', role: 'GURU_MADRASAH' as const },
    { email: 'munawwib@darsa.my.id', nama_lengkap: 'Ustadz Munawwib Diniyah', role: 'GURU_MADRASAH' as const },
    { email: 'wali@darsa.my.id', nama_lengkap: 'Wali Santri Lirboyo', role: 'WALI_SANTRI' as const },
  ];

  for (const acc of DEFAULT_ACCOUNTS) {
    let accUser = await prisma.user.findUnique({ where: { email: acc.email } });
    if (!accUser) {
      accUser = await prisma.user.create({
        data: {
          email: acc.email,
          nama_lengkap: acc.nama_lengkap,
          email_verified: true,
        },
      });
    }

    let roleObj = await prisma.role.findFirst({ where: { name: acc.role as any } });
    if (!roleObj) {
      roleObj = await prisma.role.create({
        data: {
          name: acc.role as any,
          description: `Role default ${acc.nama_lengkap}`,
        },
      });
    }

    const userRole = await prisma.userRole.findFirst({
      where: { user_id: accUser.id, role_id: roleObj.id },
    });
    if (!userRole) {
      await prisma.userRole.create({
        data: {
          user_id: accUser.id,
          role_id: roleObj.id,
        },
      });
    }
  }

  console.log('✅ 8 Akun Portal Default berhasil diverifikasi/dibuat.');
  console.log('🎉 Seeding Darsa Enterprise Selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
