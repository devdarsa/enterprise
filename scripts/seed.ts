import { prisma } from '../packages/database/src/index';

async function main() {
  console.log('🌱 Seed Data Darsa Enterprise v1.0 dimulai...');

  // 1. Seed System Roles
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Super Administrator Platform SaaS' },
    { name: 'ADMIN_INSTANSI', description: 'Administrator Pondok/Sekolah' },
    { name: 'GURU', description: 'Tenaga Pengajar & Ustadz' },
    { name: 'PEGAWAI', description: 'Staf Operasional' },
    { name: 'BENDAHARA', description: 'Pengelola Keuangan' },
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
  const pondok = await prisma.pondok.create({
    data: {
      nama: 'Pondok Pesantren Darsa Islamiyah',
      alamat: 'Jl. Raya Pendidikan No. 45, Jakarta Selatan',
      telepon: '021-7890123',
    },
  });

  const madrasah = await prisma.madrasah.create({
    data: {
      pondok_id: pondok.id,
      nama: 'Madrasah Aliyah Darsa Enterprise',
      npsn: '20198765',
    },
  });

  const kelas10 = await prisma.kelas.create({
    data: {
      madrasah_id: madrasah.id,
      nama_kelas: '10-A (Tahfidz & Sains)',
      tingkat: 10,
    },
  });

  console.log('✅ Master Kelembagaan & Kelas berhasil dibuat.');

  // 3. Seed Lokasi Presensi (Geofencing GPS Radius 200m)
  const lokasi = await prisma.lokasi_presensi.create({
    data: {
      pondok_id: pondok.id,
      nama_lokasi: 'Gerbang Utama & Pos Keamanan Darsa',
      latitude: -6.2088,
      longitude: 106.8456,
      radius_meter: 200,
    },
  });

  console.log(`✅ Lokasi Presensi Geofencing dibuat: ${lokasi.nama_lokasi} (Radius ${lokasi.radius_meter}m)`);

  // 4. Seed Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@darsa.id',
      nama_lengkap: 'Ustadz Ahmad Al-Farisi',
      email_verified: true,
    },
  });

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN_INSTANSI' } });
  if (adminRole) {
    await prisma.userRole.create({
      data: {
        user_id: adminUser.id,
        role_id: adminRole.id,
      },
    });
  }

  // 5. Seed Guru
  const guruUser = await prisma.user.create({
    data: {
      email: 'guru@darsa.id',
      nama_lengkap: 'Dr. KH. Abdullah Ridwan',
      email_verified: true,
    },
  });

  await prisma.guru.create({
    data: {
      user_id: guruUser.id,
      nip: '198501012010011001',
      nama_lengkap: guruUser.nama_lengkap,
      telepon: '081234567890',
    },
  });

  // 6. Seed Santri
  const santriUser = await prisma.user.create({
    data: {
      email: 'santri@darsa.id',
      nama_lengkap: 'Muhammad Raihan',
      email_verified: true,
    },
  });

  await prisma.santri.create({
    data: {
      user_id: santriUser.id,
      pondok_id: pondok.id,
      kelas_id: kelas10.id,
      nisn: '0012345678',
      nama_lengkap: santriUser.nama_lengkap,
    },
  });

  console.log('✅ Akun Admin, Guru, dan Santri berhasil dibuat.');
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
