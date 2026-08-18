import { PrismaClient, RoleType, JenisKelamin, StatusSantri, JenjangSantri, StatusPegawai } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Neon PostgreSQL database seeding...');

  // 1. Core Roles
  const rolesData: Array<{ name: RoleType; description: string }> = [
    { name: RoleType.SEKRETARIAT, description: 'Sekretariat Utama Pondok Pesantren' },
    { name: RoleType.ADMIN_INSTANSI, description: 'Admin Instansi Diniyah / Formal MI' },
    { name: RoleType.GURU_MADRASAH, description: 'Guru / Ustadz Diniyah' },
    { name: RoleType.GURU_MI, description: 'Ustadzah / Guru Formal MI' },
    { name: RoleType.GURU, description: 'Pengajar General' },
    { name: RoleType.KEAMANAN, description: 'Tim Keamanan & Ketertiban' },
    { name: RoleType.MUSTAHIQ, description: 'Mustahiq Wali Kelas Diniyah' },
    { name: RoleType.MUNAWWIB, description: 'Munawwib Pengajar Diniyah' },
    { name: RoleType.SANTRI, description: 'Santri / Santriwati' },
    { name: RoleType.WALI_SANTRI, description: 'Orang Tua / Wali Santri' },
  ];

  for (const r of rolesData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });
  }
  console.log('✅ Roles seeded');

  // 2. Tahun Ajaran
  const ta1 = await prisma.tahunAjaran.upsert({
    where: { id: 'ta-2025-ganjil' },
    update: { is_aktif: true },
    create: {
      id: 'ta-2025-ganjil',
      nama: '2025/2026',
      semester: 'GANJIL',
      tanggal_mulai: new Date('2025-07-01'),
      tanggal_akhir: new Date('2025-12-31'),
      is_aktif: true,
    },
  });

  await prisma.tahunAjaran.upsert({
    where: { id: 'ta-2025-genap' },
    update: {},
    create: {
      id: 'ta-2025-genap',
      nama: '2025/2026',
      semester: 'GENAP',
      tanggal_mulai: new Date('2026-01-01'),
      tanggal_akhir: new Date('2026-06-30'),
      is_aktif: false,
    },
  });

  await prisma.tahunAjaran.upsert({
    where: { id: 'ta-2026-ganjil' },
    update: {},
    create: {
      id: 'ta-2026-ganjil',
      nama: '2026/2027',
      semester: 'GANJIL',
      tanggal_mulai: new Date('2026-07-01'),
      tanggal_akhir: new Date('2026-12-31'),
      is_aktif: false,
    },
  });
  console.log('✅ Tahun Ajaran seeded (Hierarchy Root)');

  // 3. Pondok Pesantren SSOT & Instansi Unit
  const pondok = await prisma.pondok.upsert({
    where: { id: 'pondok-lirboyo' },
    update: {
      nama: "Pondok Pesantren Darussaadah Lirboyo (DARSA)",
      alamat: "Jl. KH. Abdul Karim, Lirboyo, Mojoroto, Kota Kediri, Jawa Timur",
    },
    create: {
      id: 'pondok-lirboyo',
      nama: "Pondok Pesantren Darussaadah Lirboyo (DARSA)",
      alamat: "Jl. KH. Abdul Karim, Lirboyo, Mojoroto, Kota Kediri, Jawa Timur",
      telepon: "0354-771234",
    },
  });

  const madrasahDiniyah = await prisma.madrasah.upsert({
    where: { npsn: 'MADRASAH-DINIYAH-LIRBOYO' },
    update: {
      nama: "Madrasah Diniyah Darussaadah Lirboyo",
    },
    create: {
      id: 'madrasah-diniyah',
      pondok_id: pondok.id,
      nama: "Madrasah Diniyah Darussaadah Lirboyo",
      npsn: 'MADRASAH-DINIYAH-LIRBOYO',
    },
  });

  const madrasahMI = await prisma.madrasah.upsert({
    where: { npsn: 'MI-FORMAL-LIRBOYO' },
    update: {
      nama: "MI Plus Darussaadah Lirboyo",
    },
    create: {
      id: 'madrasah-mi',
      pondok_id: pondok.id,
      nama: "MI Plus Darussaadah Lirboyo",
      npsn: 'MI-FORMAL-LIRBOYO',
    },
  });
  console.log('✅ Pondok Pesantren SSOT & Instansi Units seeded');

  // 4. Gedung Asrama & Kamar (3 Records)
  const gedung1 = await prisma.gedungAsrama.upsert({
    where: { nama_gedung: 'Gedung Al-Farabi' },
    update: {},
    create: { nama_gedung: 'Gedung Al-Farabi', gender: JenisKelamin.LAKI_LAKI, keterangan: 'Asrama Santri Putra Tingkat Ula' },
  });
  const gedung2 = await prisma.gedungAsrama.upsert({
    where: { nama_gedung: 'Gedung An-Nawawi' },
    update: {},
    create: { nama_gedung: 'Gedung An-Nawawi', gender: JenisKelamin.LAKI_LAKI, keterangan: 'Asrama Santri Putra Tahfidz' },
  });
  const gedung3 = await prisma.gedungAsrama.upsert({
    where: { nama_gedung: 'Gedung Az-Zahra' },
    update: {},
    create: { nama_gedung: 'Gedung Az-Zahra', gender: JenisKelamin.PEREMPUAN, keterangan: 'Asrama Santriwati Putri' },
  });

  const kamar1 = await prisma.kamar.upsert({
    where: { id: 'kamar-101' },
    update: {},
    create: { id: 'kamar-101', gedung_id: gedung1.id, nama_kamar: 'Kamar 101 (Al-Farabi)', kapasitas: 15 },
  });
  const kamar2 = await prisma.kamar.upsert({
    where: { id: 'kamar-201' },
    update: {},
    create: { id: 'kamar-201', gedung_id: gedung2.id, nama_kamar: 'Kamar 201 (An-Nawawi)', kapasitas: 15 },
  });
  const kamar3 = await prisma.kamar.upsert({
    where: { id: 'kamar-301' },
    update: {},
    create: { id: 'kamar-301', gedung_id: gedung3.id, nama_kamar: 'Kamar 301 (Az-Zahra)', kapasitas: 15 },
  });
  console.log('✅ Gedung & Kamar Asrama seeded');

  // 5. Kelas (3 Records)
  const kelas1 = await prisma.kelas.upsert({
    where: { id: 'kelas-10a' },
    update: {},
    create: {
      id: 'kelas-10a',
      madrasah_id: madrasahDiniyah.id,
      nama_kelas: 'Kelas 10-A (Ula Diniyah)',
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      tingkat: 10,
      kapasitas: 30,
    },
  });

  const kelas2 = await prisma.kelas.upsert({
    where: { id: 'kelas-11b' },
    update: {},
    create: {
      id: 'kelas-11b',
      madrasah_id: madrasahDiniyah.id,
      nama_kelas: 'Kelas 11-B (Wustha Diniyah)',
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      tingkat: 11,
      kapasitas: 30,
    },
  });

  const kelas3 = await prisma.kelas.upsert({
    where: { id: 'kelas-mi-5' },
    update: {},
    create: {
      id: 'kelas-mi-5',
      madrasah_id: madrasahMI.id,
      nama_kelas: 'Kelas 5-A (Formal MI)',
      jenjang: JenjangSantri.MI,
      tingkat: 5,
      kapasitas: 30,
    },
  });
  console.log('✅ Kelas Unit Pendidikan seeded');

  // 6. Mata Pelajaran (3 Records)
  const mapel1 = await prisma.mataPelajaran.upsert({
    where: { kode_mapel: 'FIQIH-01' },
    update: {},
    create: { kode_mapel: 'FIQIH-01', nama_mapel: 'Fiqih Fathul Qarib', jenjang: JenjangSantri.MADRASAH_DINIYAH, kategori: 'Diniyah' },
  });
  const mapel2 = await prisma.mataPelajaran.upsert({
    where: { kode_mapel: 'NAHWU-01' },
    update: {},
    create: { kode_mapel: 'NAHWU-01', nama_mapel: 'Nahwu Alfiyah Ibn Malik', jenjang: JenjangSantri.MADRASAH_DINIYAH, kategori: 'Diniyah' },
  });
  const mapel3 = await prisma.mataPelajaran.upsert({
    where: { kode_mapel: 'MI-MTK-05' },
    update: {},
    create: { kode_mapel: 'MI-MTK-05', nama_mapel: 'Matematika Formal MI', jenjang: JenjangSantri.MI, kategori: 'Formal' },
  });
  console.log('✅ Mata Pelajaran seeded');

  // 7. Pengurus (3 Records)
  await prisma.pengurus.upsert({
    where: { id: 'pengurus-1' },
    update: {},
    create: {
      id: 'pengurus-1',
      nama_lengkap: 'Ustadz Abdul Halim, M.Pd',
      jabatan: 'Ketua Lujnah Pengurus Utama',
      unit: 'PONDOK',
      telepon: '081234567890',
    },
  });
  await prisma.pengurus.upsert({
    where: { id: 'pengurus-2' },
    update: {},
    create: {
      id: 'pengurus-2',
      nama_lengkap: 'Ustadz Zulkifli, S.H',
      jabatan: 'Kepala Bidang Keamanan & Perizinan',
      unit: 'KEAMANAN',
      telepon: '081234567891',
    },
  });
  await prisma.pengurus.upsert({
    where: { id: 'pengurus-3' },
    update: {},
    create: {
      id: 'pengurus-3',
      nama_lengkap: 'Ustadzah Khadijah, S.Ag',
      jabatan: 'Pembina Asrama Az-Zahra',
      unit: 'PONDOK',
      telepon: '081234567892',
    },
  });
  console.log('✅ Data Pengurus seeded');

  // 8. Guru & Pengajar (3 Records)
  const guru1 = await prisma.guru.upsert({
    where: { nip: '198501012015011001' },
    update: {},
    create: {
      nip: '198501012015011001',
      nik: '3571010101850001',
      nama_lengkap: 'Ustadz Fathurrahman, M.Ag',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      no_hp: '081333444555',
      status_pegawai: StatusPegawai.AKTIF,
      pendidikan_terakhir: 'S2 Syariah & Hukum',
    },
  });

  const guru2 = await prisma.guru.upsert({
    where: { nip: '198803122017021002' },
    update: {},
    create: {
      nip: '198803122017021002',
      nik: '3571011203880002',
      nama_lengkap: 'Ustadz Hasan Basri, S.Pd.I',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      no_hp: '081333444556',
      status_pegawai: StatusPegawai.AKTIF,
      pendidikan_terakhir: 'S1 Pendidikan Islam',
    },
  });

  const guru3 = await prisma.guru.upsert({
    where: { nip: '199208152018022003' },
    update: {},
    create: {
      nip: '199208152018022003',
      nik: '3571011508920003',
      nama_lengkap: 'Ustadzah Fatimah, S.Pd',
      jenis_kelamin: JenisKelamin.PEREMPUAN,
      no_hp: '081333444557',
      status_pegawai: StatusPegawai.AKTIF,
      pendidikan_terakhir: 'S1 PGMI Formal',
    },
  });
  console.log('✅ Data Guru & Pengajar seeded');

  // 9. Master Santri SSOT (Single Source of Truth - Created at Pondok Pesantren)
  const santri1 = await prisma.santri.upsert({
    where: { nisp: '2026100845' },
    update: {},
    create: {
      pondok_id: pondok.id,
      nisp: '2026100845',
      nisn: '0085471201',
      nik: '3571011504080001',
      nama_lengkap: 'Ahmad Muzakki',
      nama_panggilan: 'Zakki',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Kediri',
      tanggal_lahir: new Date('2008-04-15'),
      alamat: 'Jl. Lirboyo Gang 2 No. 10, Kota Kediri',
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      kelas_id: kelas1.id,
      kamar_id: kamar1.id,
      kamar: 'Kamar 101 (Al-Farabi)',
      status: StatusSantri.AKTIF,
      nik_wali: '3571012304850001',
      nama_wali: 'Bapak Hendra',
      no_hp_wali: '081299887766',
      hafalan_juz: 5,
    },
  });

  const santri2 = await prisma.santri.upsert({
    where: { nisp: '2026100846' },
    update: {},
    create: {
      pondok_id: pondok.id,
      nisp: '2026100846',
      nisn: '0085471202',
      nik: '3571012005090002',
      nama_lengkap: 'Muhammad Farhan',
      nama_panggilan: 'Farhan',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Surabaya',
      tanggal_lahir: new Date('2009-05-20'),
      alamat: 'Jl. Pemuda No. 12, Surabaya',
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      kelas_id: kelas2.id,
      kamar_id: kamar2.id,
      kamar: 'Kamar 201 (An-Nawawi)',
      status: StatusSantri.AKTIF,
      nik_wali: '3571012304850001', // Multi-Santri link under same NIK!
      nama_wali: 'Bapak Hendra',
      no_hp_wali: '081299887766',
      hafalan_juz: 8,
    },
  });

  const santri3 = await prisma.santri.upsert({
    where: { nisp: '2026100847' },
    update: {},
    create: {
      pondok_id: pondok.id,
      nisp: '2026100847',
      nisn: '0085471203',
      nik: '3571011210100003',
      nama_lengkap: 'Siti Fatimah',
      nama_panggilan: 'Fatimah',
      jenis_kelamin: JenisKelamin.PEREMPUAN,
      tempat_lahir: 'Malang',
      tanggal_lahir: new Date('2010-10-12'),
      alamat: 'Jl. Soekarno Hatta No. 8, Malang',
      jenjang: JenjangSantri.MI,
      kelas_id: kelas3.id,
      kamar_id: kamar3.id,
      kamar: 'Kamar 301 (Az-Zahra)',
      status: StatusSantri.AKTIF,
      nik_wali: '3571012304850002',
      nama_wali: 'Ibu Aminah',
      no_hp_wali: '081299887767',
      hafalan_juz: 3,
    },
  });
  console.log('✅ Master Santri SSOT (Pondok Pesantren) seeded');

  // 10. Wali Santri & Hubungan Wali (Relational NIK Links)
  const wali1 = await prisma.waliSantri.upsert({
    where: { nik: '3571012304850001' },
    update: {},
    create: {
      nik: '3571012304850001',
      nama_lengkap: 'Bapak Hendra',
      no_hp: '081299887766',
      alamat_lengkap: 'Jl. Lirboyo Gang 2 No. 10, Kota Kediri',
      pekerjaan: 'Wirausaha',
    },
  });

  const wali2 = await prisma.waliSantri.upsert({
    where: { nik: '3571012304850002' },
    update: {},
    create: {
      nik: '3571012304850002',
      nama_lengkap: 'Ibu Aminah',
      no_hp: '081299887767',
      alamat_lengkap: 'Jl. Soekarno Hatta No. 8, Malang',
      pekerjaan: 'PNS',
    },
  });

  await prisma.hubunganWali.upsert({
    where: { wali_santri_id_santri_id: { wali_santri_id: wali1.id, santri_id: santri1.id } },
    update: {},
    create: { wali_santri_id: wali1.id, santri_id: santri1.id, hubungan: 'AYAH', is_primary: true },
  });

  await prisma.hubunganWali.upsert({
    where: { wali_santri_id_santri_id: { wali_santri_id: wali1.id, santri_id: santri2.id } },
    update: {},
    create: { wali_santri_id: wali1.id, santri_id: santri2.id, hubungan: 'AYAH', is_primary: true },
  });

  await prisma.hubunganWali.upsert({
    where: { wali_santri_id_santri_id: { wali_santri_id: wali2.id, santri_id: santri3.id } },
    update: {},
    create: { wali_santri_id: wali2.id, santri_id: santri3.id, hubungan: 'IBU', is_primary: true },
  });
  console.log('✅ Wali Santri & Multi-Santri NIK Links seeded');

  // 11. Perizinan & Pelanggaran Keamanan (3 Records)
  await prisma.perizinan.upsert({
    where: { id: 'izin-2026-001' },
    update: {},
    create: {
      id: 'izin-2026-001',
      santri_id: santri1.id,
      jenis: 'PULANG',
      alasan: 'Acara Pernikahan Keluarga di Surabaya',
      tanggal_mulai: new Date('2026-08-01'),
      tanggal_selesai: new Date('2026-08-03'),
      status: 'DISETUJUI',
    },
  });

  await prisma.perizinan.upsert({
    where: { id: 'izin-2026-002' },
    update: {},
    create: {
      id: 'izin-2026-002',
      santri_id: santri2.id,
      jenis: 'KELUAR_KOMPLEK',
      alasan: 'Keperluan Berobat ke Rumah Sakit',
      tanggal_mulai: new Date('2026-08-06'),
      tanggal_selesai: new Date('2026-08-06'),
      status: 'DISETUJUI',
    },
  });

  await prisma.pelanggaran.upsert({
    where: { id: 'pelanggaran-1' },
    update: {},
    create: {
      id: 'pelanggaran-1',
      santri_id: santri2.id,
      jenis: 'Terlambat Kembali ke Asrama (Overstay)',
      tingkat: 'SEDANG',
      poin_pelanggaran: 15,
      hukuman: 'Pembersihan Lingkungan Masjid Ma\'had',
      tanggal: new Date('2026-08-04'),
    },
  });
  console.log('✅ Perizinan & Pelanggaran Keamanan seeded');

  // 12. Pengumuman System (3 Records)
  await prisma.pengumuman.upsert({
    where: { id: 'pengumuman-1' },
    update: {},
    create: {
      id: 'pengumuman-1',
      judul: "Registrasi Ulang & Pembayaran Syahriyah Semester Ganjil 2025/2026",
      isi: "Diberitahukan kepada seluruh Wali Santri bahwa registrasi ulang periode ganjil dibuka hingga 15 Agustus 2025.",
      target: 'WALI_SANTRI',
      instansi: 'PONDOK',
      penulis: 'Sekretariat Utama',
      penting: true,
    },
  });

  await prisma.pengumuman.upsert({
    where: { id: 'pengumuman-2' },
    update: {},
    create: {
      id: 'pengumuman-2',
      judul: "Pelaksanaan Imtihan Syafahi & Tahriri Diniyah",
      isi: "Ujian Imtihan Diniyah akan dilaksanakan secara serentak mulai tanggal 20 Agustus 2025.",
      target: 'GURU',
      instansi: 'MADRASAH',
      penulis: 'Sekretariat Diniyah',
      penting: false,
    },
  });

  await prisma.pengumuman.upsert({
    where: { id: 'pengumuman-3' },
    update: {},
    create: {
      id: 'pengumuman-3',
      judul: "Pengumuman Presensi Lokasi Dynamic QR Code Guru MI",
      isi: "Seluruh Ustadz/Ustadzah MI wajib melakukan scan QR presensi lokasi dalam radius 200 meter dari Pos Utama MI.",
      target: 'GURU_MI',
      instansi: 'MI',
      penulis: 'Kepala MI Darussa’adah',
      penting: true,
    },
  });
  console.log('✅ Pengumuman System seeded');

  console.log('🎉 Live Neon PostgreSQL Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
