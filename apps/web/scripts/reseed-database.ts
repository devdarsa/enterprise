import { RoleType, JenisKelamin, StatusSantri, JenjangSantri, StatusPegawai, StatusAbsensi } from '@prisma/client';
import { prisma } from '@darsa/database';
import { hashPassword } from 'better-auth/crypto';

async function main() {
  console.log('🔄 [1/7] Menghapus seluruh data lama dari database...');

  // 1. Wipe seluruh tabel menggunakan TRUNCATE CASCADE atomic
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "absensi_log", "qr_sessions", "perizinan", "pelanggaran", "surat", "surat_arsip",
      "nilai_akademik", "rapor_santri", "alumni_record", "penempatan_kamar_history",
      "hubungan_wali", "jadwal_pelajaran", "mata_pelajaran", "otp_verifications",
      "audit_logs", "pengumuman", "lokasi_presensi", "santri", "kamar", "gedung_asrama",
      "kelas", "guru", "pengurus", "wali_santri", "madrasah", "pondok", "tahun_ajaran",
      "passkey_credentials", "sessions", "accounts", "user_roles", "users", "roles",
      "verifications", "master_jabatan"
    CASCADE;
  `);

  console.log('✅ [1/7] Database lama berhasil dibersihkan total.');

  // =========================================================================
  // 1. SEED ROLES
  // =========================================================================
  console.log('🌱 [2/7] Menyiapkan Master Roles...');
  const rolesData: Array<{ name: RoleType; description: string }> = [
    { name: RoleType.SEKRETARIAT, description: 'Sekretariat Utama Pondok Pesantren' },
    { name: RoleType.ADMIN_INSTANSI, description: 'Admin Instansi Diniyah / Formal MI' },
    { name: RoleType.GURU_MADRASAH, description: 'Guru / Ustadz Diniyah' },
    { name: RoleType.GURU_MI, description: 'Ustadzah / Guru Formal MI' },
    { name: RoleType.GURU, description: 'Pengajar General' },
    { name: RoleType.KEAMANAN, description: 'Tim Keamanan & Ketertiban' },
    { name: RoleType.MUSTAHIQ, description: 'Mustahiq Wali Kelas Diniyah' },
    { name: RoleType.MUNAWWIB, description: 'Munawwib Pengajar Diniyah' },
    { name: RoleType.WALI_SANTRI, description: 'Orang Tua / Wali Santri' },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of rolesData) {
    const roleRecord = await prisma.role.create({
      data: { name: r.name, description: r.description },
    });
    roleMap[r.name] = roleRecord.id;
  }

  // =========================================================================
  // 2. SEED TAHUN AJARAN & KELEMBAGAAN PONDOK
  // =========================================================================
  console.log('🌱 [3/7] Menyiapkan Kelembagaan & Tahun Ajaran...');
  await prisma.tahunAjaran.create({
    data: {
      id: 'ta-2025-ganjil',
      nama: '2025/2026',
      semester: 'GANJIL',
      tanggal_mulai: new Date('2025-07-01'),
      tanggal_akhir: new Date('2025-12-31'),
      is_aktif: true,
    },
  });

  const pondok = await prisma.pondok.create({
    data: {
      id: 'pondok-lirboyo',
      nama: "Pondok Pesantren Darussa'adah Lirboyo (DARSA)",
      alamat: 'Jl. KH. Abdul Karim, Lirboyo, Mojoroto, Kota Kediri, Jawa Timur',
      telepon: '0354-771234',
    },
  });

  const madrasahDiniyah = await prisma.madrasah.create({
    data: {
      id: 'madrasah-diniyah',
      pondok_id: pondok.id,
      nama: 'Madrasah Diniyah Darussaadah Lirboyo',
      npsn: 'MADRASAH-DINIYAH-LIRBOYO',
    },
  });

  const madrasahMI = await prisma.madrasah.create({
    data: {
      id: 'madrasah-mi',
      pondok_id: pondok.id,
      nama: 'Madrasah Ibtidaiyah Darussaadah',
      npsn: 'MI-FORMAL-LIRBOYO',
    },
  });

  await prisma.lokasiPresensi.create({
    data: {
      pondok_id: pondok.id,
      nama_lokasi: 'Gerbang Utama & Masjid Jami Lirboyo',
      latitude: -7.8185,
      longitude: 112.0125,
      radius_meter: 200,
    },
  });

  // =========================================================================
  // 3. SEED ASRAMA & KAMAR
  // =========================================================================
  const gedungA = await prisma.gedungAsrama.create({
    data: {
      nama_gedung: 'Gedung Al-Fath',
      gender: JenisKelamin.LAKI_LAKI,
      keterangan: 'Komplek Asrama Putra Utama',
    },
  });

  const gedungB = await prisma.gedungAsrama.create({
    data: {
      nama_gedung: 'Gedung Al-Barokah',
      gender: JenisKelamin.LAKI_LAKI,
      keterangan: 'Komplek Asrama Putra Tahfidz',
    },
  });

  const kamarA1 = await prisma.kamar.create({
    data: { gedung_id: gedungA.id, nama_kamar: 'Kamar A-01', kapasitas: 10 },
  });
  const kamarA2 = await prisma.kamar.create({
    data: { gedung_id: gedungA.id, nama_kamar: 'Kamar A-02', kapasitas: 10 },
  });
  const kamarA3 = await prisma.kamar.create({
    data: { gedung_id: gedungA.id, nama_kamar: 'Kamar A-03', kapasitas: 10 },
  });
  const kamarB1 = await prisma.kamar.create({
    data: { gedung_id: gedungB.id, nama_kamar: 'Kamar B-01', kapasitas: 10 },
  });
  const kamarB2 = await prisma.kamar.create({
    data: { gedung_id: gedungB.id, nama_kamar: 'Kamar B-02', kapasitas: 10 },
  });

  // =========================================================================
  // 4. SEED KELAS & MATA PELAJARAN
  // =========================================================================
  const kelasMI1A = await prisma.kelas.create({
    data: {
      madrasah_id: madrasahMI.id,
      nama_kelas: 'Kelas 1-A (MI)',
      jenjang: JenjangSantri.MI,
      tingkat: 1,
      kapasitas: 30,
    },
  });

  const kelasMI2A = await prisma.kelas.create({
    data: {
      madrasah_id: madrasahMI.id,
      nama_kelas: 'Kelas 2-A (MI)',
      jenjang: JenjangSantri.MI,
      tingkat: 2,
      kapasitas: 30,
    },
  });

  const kelasDiniyah1Ula = await prisma.kelas.create({
    data: {
      madrasah_id: madrasahDiniyah.id,
      nama_kelas: '1 Ula (Diniyah)',
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      tingkat: 1,
      kapasitas: 30,
    },
  });

  const kelasDiniyah2Ula = await prisma.kelas.create({
    data: {
      madrasah_id: madrasahDiniyah.id,
      nama_kelas: '2 Ula (Diniyah)',
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      tingkat: 2,
      kapasitas: 30,
    },
  });

  const kelasTahfidz = await prisma.kelas.create({
    data: {
      nama_kelas: 'Halaqah Tahfidz Al-Qur\'an',
      jenjang: JenjangSantri.PONDOK,
      tingkat: 1,
      kapasitas: 25,
    },
  });

  const mapelMTK = await prisma.mataPelajaran.create({
    data: { kode_mapel: 'MP-MI-MTK', nama_mapel: 'Matematika Dasar', jenjang: JenjangSantri.MI, kategori: 'Umum' },
  });
  const mapelBArabMI = await prisma.mataPelajaran.create({
    data: { kode_mapel: 'MP-MI-BARAB', nama_mapel: 'Bahasa Arab MI', jenjang: JenjangSantri.MI, kategori: 'Agama' },
  });
  const mapelFiqih = await prisma.mataPelajaran.create({
    data: { kode_mapel: 'MP-MAD-FIQIH', nama_mapel: 'Fiqih Fathul Qorib', jenjang: JenjangSantri.MADRASAH_DINIYAH, kategori: 'Kitab Kuning' },
  });
  const mapelNahwu = await prisma.mataPelajaran.create({
    data: { kode_mapel: 'MP-MAD-NAHWU', nama_mapel: 'Nahwu Jurumiyyah', jenjang: JenjangSantri.MADRASAH_DINIYAH, kategori: 'Kitab Kuning' },
  });

  const createAuthUser = async (rawEmail: string, password: string, name: string, roleName: RoleType) => {
    const email = rawEmail.trim().toLowerCase();
    const hashedPassword = await hashPassword(password);
    const roleObj = await prisma.role.findUnique({ where: { name: roleName } });

    // 1. Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { nama_lengkap: name, email_verified: true },
      });
    } else {
      user = await prisma.user.create({
        data: { email, nama_lengkap: name, email_verified: true },
      });
    }

    // 2. Find or create account
    const existingAccount = await prisma.account.findFirst({
      where: { user_id: user.id, provider: 'credential' },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.account.create({
        data: {
          user_id: user.id,
          provider: 'credential',
          provider_account_id: email,
          password: hashedPassword,
        },
      });
    }

    // 3. UserRole
    if (roleObj) {
      const existingUserRole = await prisma.userRole.findFirst({
        where: { user_id: user.id, role_id: roleObj.id },
      });
      if (!existingUserRole) {
        await prisma.userRole.create({
          data: { user_id: user.id, role_id: roleObj.id },
        });
      }
    }

    return user;
  };

  // =========================================================================
  // 5. SEED GURU & PENGURUS
  // =========================================================================
  console.log('🌱 [4/7] Menyiapkan 2 Guru MI, 2 Guru Madrasah, dan 2 Pengurus...');

  // --- 2 GURU MI ---
  const userGuruMI1 = await createAuthUser('guru.mi@darsa.my.id', 'darsa25', 'Ustadzah Siti Fatimah, S.Pd.I', RoleType.GURU_MI);
  const guruMI1 = await prisma.guru.upsert({
    where: { nip: '198504122010012001' },
    update: {
      user_id: userGuruMI1.id,
      nama_lengkap: 'Ustadzah Siti Fatimah, S.Pd.I',
      status_pegawai: StatusPegawai.AKTIF,
    },
    create: {
      user_id: userGuruMI1.id,
      nip: '198504122010012001',
      nik: '3571014504850001',
      nama_lengkap: 'Ustadzah Siti Fatimah, S.Pd.I',
      jenis_kelamin: JenisKelamin.PEREMPUAN,
      tempat_lahir: 'Kediri',
      tanggal_lahir: new Date('1985-04-12'),
      telepon: '081234567801',
      alamat_lengkap: 'Jl. KH. Wachid Hasyim No. 12, Kediri',
      pendidikan_terakhir: 'S1 Pendidikan Agama Islam',
      status_pegawai: StatusPegawai.AKTIF,
    },
  });
  console.log('   ✅ Guru MI 1 created:', guruMI1.nama_lengkap);

  const userGuruMI2 = await createAuthUser('guru.mi2@darsa.my.id', 'darsa25', 'Ustadz Ahmad Dahlan, M.Pd', RoleType.GURU_MI);
  const guruMI2 = await prisma.guru.upsert({
    where: { nip: '198807192015031002' },
    update: {
      user_id: userGuruMI2.id,
      nama_lengkap: 'Ustadz Ahmad Dahlan, M.Pd',
      status_pegawai: StatusPegawai.AKTIF,
    },
    create: {
      user_id: userGuruMI2.id,
      nip: '198807192015031002',
      nik: '3571011907880002',
      nama_lengkap: 'Ustadz Ahmad Dahlan, M.Pd',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Nganjuk',
      tanggal_lahir: new Date('1988-07-19'),
      telepon: '081234567802',
      alamat_lengkap: 'Jl. Supriyadi No. 45, Nganjuk',
      pendidikan_terakhir: 'S2 Manajemen Pendidikan',
      status_pegawai: StatusPegawai.AKTIF,
    },
  });
  console.log('   ✅ Guru MI 2 created:', guruMI2.nama_lengkap);

  // Jadwal Guru MI ke Kelas MI
  await prisma.jadwalPelajaran.create({
    data: {
      kelas_id: kelasMI1A.id,
      mata_pelajaran_id: mapelMTK.id,
      guru_id: guruMI1.id,
      hari: 'SENIN',
      jam_mulai: '07:30',
      jam_selesai: '09:00',
      ruangan: 'Ruang MI 1-A',
      tahun_ajaran: '2025/2026',
    },
  });

  await prisma.jadwalPelajaran.create({
    data: {
      kelas_id: kelasMI2A.id,
      mata_pelajaran_id: mapelBArabMI.id,
      guru_id: guruMI2.id,
      hari: 'SELASA',
      jam_mulai: '07:30',
      jam_selesai: '09:00',
      ruangan: 'Ruang MI 2-A',
      tahun_ajaran: '2025/2026',
    },
  });

  // --- 2 GURU MADRASAH (MUSTAHIQ & MUNAWWIB) ---
  const userMustahiq = await createAuthUser('mustahiq@darsa.my.id', 'darsa25', 'KH. M. Syukron Ma\'mun', RoleType.MUSTAHIQ);
  const guruMadrasah1 = await prisma.guru.upsert({
    where: { nip: 'GMD-2024-001' },
    update: {
      user_id: userMustahiq.id,
      nama_lengkap: 'KH. M. Syukron Ma\'mun',
      status_pegawai: StatusPegawai.AKTIF,
    },
    create: {
      user_id: userMustahiq.id,
      nip: 'GMD-2024-001',
      nik: '3571011210750001',
      nama_lengkap: 'KH. M. Syukron Ma\'mun',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Kediri',
      tanggal_lahir: new Date('1975-10-12'),
      telepon: '081234567803',
      alamat_lengkap: 'Komplek Pengasuh Pondok Lirboyo',
      pendidikan_terakhir: 'Pondok Pesantren Lirboyo Kediri',
      status_pegawai: StatusPegawai.AKTIF,
    },
  });
  console.log('   ✅ Guru Madrasah 1 (Mustahiq) created:', guruMadrasah1.nama_lengkap);

  const userMunawwib = await createAuthUser('munawwib@darsa.my.id', 'darsa25', 'Ust. Zainal Abidin, S.Th.I', RoleType.MUNAWWIB);
  const guruMadrasah2 = await prisma.guru.upsert({
    where: { nip: 'GMD-2024-002' },
    update: {
      user_id: userMunawwib.id,
      nama_lengkap: 'Ust. Zainal Abidin, S.Th.I',
      status_pegawai: StatusPegawai.AKTIF,
    },
    create: {
      user_id: userMunawwib.id,
      nip: 'GMD-2024-002',
      nik: '3571011508820002',
      nama_lengkap: 'Ust. Zainal Abidin, S.Th.I',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Jombang',
      tanggal_lahir: new Date('1982-08-15'),
      telepon: '081234567804',
      alamat_lengkap: 'Komplek Asatidz Diniyah Lirboyo',
      pendidikan_terakhir: 'S1 Tafsir Hadits',
      status_pegawai: StatusPegawai.AKTIF,
    },
  });
  console.log('   ✅ Guru Madrasah 2 (Munawwib) created:', guruMadrasah2.nama_lengkap);

  // Jadwal Guru Madrasah ke Kelas Diniyah
  await prisma.jadwalPelajaran.create({
    data: {
      kelas_id: kelasDiniyah1Ula.id,
      mata_pelajaran_id: mapelFiqih.id,
      guru_id: guruMadrasah1.id,
      hari: 'SABTU',
      jam_mulai: '13:30',
      jam_selesai: '15:00',
      ruangan: 'Gedung Diniyah Lt. 2',
      tahun_ajaran: '2025/2026',
    },
  });

  await prisma.jadwalPelajaran.create({
    data: {
      kelas_id: kelasDiniyah2Ula.id,
      mata_pelajaran_id: mapelNahwu.id,
      guru_id: guruMadrasah2.id,
      hari: 'AHAD',
      jam_mulai: '13:30',
      jam_selesai: '15:00',
      ruangan: 'Gedung Diniyah Lt. 3',
      tahun_ajaran: '2025/2026',
    },
  });

  // --- 2 PENGURUS ---
  const userKeamanan = await createAuthUser('keamanan@darsa.my.id', 'darsa25', 'Ust. Ridwan Mansyur', RoleType.KEAMANAN);
  await prisma.pengurus.create({
    data: {
      nik: '3571012003800001',
      nama_lengkap: 'Ust. Ridwan Mansyur',
      jabatan: 'Kabid Keamanan & Ketertiban',
      unit: 'PONDOK',
      status: 'AKTIF',
      telepon: '081234567805',
      alamat: 'Komplek Pengurus Pondok',
    },
  });
  console.log('   ✅ Pengurus 1 created: Ust. Ridwan Mansyur');

  const userSekretariat = await createAuthUser('sekretariat.pondok@darsa.my.id', 'darsa25', 'Ust. Hamdan Baihaqi', RoleType.SEKRETARIAT);
  await prisma.pengurus.create({
    data: {
      nik: '3571011005830002',
      nama_lengkap: 'Ust. Hamdan Baihaqi',
      jabatan: 'Sekretaris Utama & Kabid Asrama',
      unit: 'PONDOK',
      status: 'AKTIF',
      telepon: '081234567806',
      alamat: 'Kantor Sekretariat Pondok',
    },
  });
  console.log('   ✅ Pengurus 2 created: Ust. Hamdan Baihaqi');

  // Admin Instansi Madrasah & MI
  await createAuthUser('sekretariat.madrasah@darsa.my.id', 'darsa25', 'Sekretariat Madrasah Diniyah', RoleType.ADMIN_INSTANSI);
  await createAuthUser('sekretariat.mi@darsa.my.id', 'darsa25', 'Sekretariat Formal MI', RoleType.ADMIN_INSTANSI);
  console.log('   ✅ Admin Instansi Madrasah & MI created');

  // =========================================================================
  // 6. SEED 8 WALI SANTRI (100% KONEKSI NIK & NO_KK)
  // =========================================================================
  console.log('🌱 [5/7] Menyiapkan 8 Wali Santri dengan NIK dan KK...');

  const waliSeedData = [
    {
      email: 'wali1@darsa.my.id',
      nama: 'H. Hendra Gunawan',
      nik: '3571010101750001',
      no_kk: '3571010101000001',
      telepon: '081234567901',
      alamat: 'Jl. Basuki Rahmat No. 10, Surabaya',
      pekerjaan: 'Wiraswasta',
      hubungan: 'AYAH',
    },
    {
      email: 'wali2@darsa.my.id',
      nama: 'H. Bambang Sutrisno',
      nik: '3571010202780002',
      no_kk: '3571010202000002',
      telepon: '081234567902',
      alamat: 'Jl. Diponegoro No. 25, Malang',
      pekerjaan: 'PNS',
      hubungan: 'AYAH',
    },
    {
      email: 'wali3@darsa.my.id',
      nama: 'H. Abdul Qodir',
      nik: '3571010303790003',
      no_kk: '3571010303000003',
      telepon: '081234567903',
      alamat: 'Jl. Ahmad Yani No. 50, Kediri',
      pekerjaan: 'Pedagang',
      hubungan: 'AYAH',
    },
    {
      email: 'wali4@darsa.my.id',
      nama: 'H. Muhammad Ridwan',
      nik: '3571010404800004',
      no_kk: '3571010404000004',
      telepon: '081234567904',
      alamat: 'Jl. Pahlawan No. 14, Sidoarjo',
      pekerjaan: 'Karyawan Swasta',
      hubungan: 'AYAH',
    },
    {
      email: 'wali5@darsa.my.id',
      nama: 'H. Ahmad Fauzi',
      nik: '3571010505810005',
      no_kk: '3571010505000005',
      telepon: '081234567905',
      alamat: 'Jl. Veteran No. 88, Blitar',
      pekerjaan: 'Guru',
      hubungan: 'AYAH',
    },
    {
      email: 'wali6@darsa.my.id',
      nama: 'Hj. Siti Aminah',
      nik: '3571010606820006',
      no_kk: '3571010606000006',
      telepon: '081234567906',
      alamat: 'Jl. Gatot Subroto No. 32, Tulungagung',
      pekerjaan: 'Ibu Rumah Tangga',
      hubungan: 'IBU',
    },
    {
      email: 'wali7@darsa.my.id',
      nama: 'H. Syamsul Huda',
      nik: '3571010707830007',
      no_kk: '3571010707000007',
      telepon: '081234567907',
      alamat: 'Jl. Kartini No. 5, Gresik',
      pekerjaan: 'Wiraswasta',
      hubungan: 'AYAH',
    },
    {
      email: 'wali8@darsa.my.id',
      nama: 'H. Nur Hidayat',
      nik: '3571010808840008',
      no_kk: '3571010808000008',
      telepon: '081234567908',
      alamat: 'Jl. Gajah Mada No. 17, Mojokerto',
      pekerjaan: 'PNS',
      hubungan: 'AYAH',
    },
  ];

  // Alias default wali@darsa.my.id
  await createAuthUser('wali@darsa.my.id', 'darsa25', 'H. Hendra Gunawan (Wali Santri)', RoleType.WALI_SANTRI);

  const waliRecordList: any[] = [];
  for (const w of waliSeedData) {
    const userWali = await createAuthUser(w.email, 'darsa25', w.nama, RoleType.WALI_SANTRI);
    const waliRec = await prisma.waliSantri.upsert({
      where: { nik: w.nik },
      update: {
        user_id: userWali.id,
        nama_lengkap: w.nama,
        telepon: w.telepon,
        no_hp: w.telepon,
        alamat_lengkap: w.alamat,
        pekerjaan: w.pekerjaan,
      },
      create: {
        user_id: userWali.id,
        nik: w.nik,
        nama_lengkap: w.nama,
        telepon: w.telepon,
        no_hp: w.telepon,
        alamat_lengkap: w.alamat,
        pekerjaan: w.pekerjaan,
      },
    });
    waliRecordList.push({ ...waliRec, no_kk: w.no_kk, hubungan: w.hubungan });
  }

  // =========================================================================
  // 7. SEED 10 DATA SANTRI LENGKAP & KONEKSI KE WALI
  // =========================================================================
  console.log('🌱 [6/7] Menyiapkan 10 Data Santri Lengkap dengan HubunganWali 100%...');

  const santriSeedData = [
    // --- 4 Santri MI ---
    {
      nisp: 'NISP-2025-001',
      nisn: '0123456781',
      nik: '3571011501140001',
      nama_lengkap: 'Ahmad Zaki Gunawan',
      nama_panggilan: 'Zaki',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Surabaya',
      tanggal_lahir: new Date('2014-01-15'),
      jenjang: JenjangSantri.MI,
      kelas_id: kelasMI1A.id,
      kamar_id: kamarA1.id,
      kamar: 'Kamar A-01',
      waliIndex: 0, // Wali 1: Hendra Gunawan
      hafalan_juz: 3,
    },
    {
      nisp: 'NISP-2025-002',
      nisn: '0123456782',
      nik: '3571012002140002',
      nama_lengkap: 'Dimas Arya Sutrisno',
      nama_panggilan: 'Arya',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Malang',
      tanggal_lahir: new Date('2014-02-20'),
      jenjang: JenjangSantri.MI,
      kelas_id: kelasMI1A.id,
      kamar_id: kamarA1.id,
      kamar: 'Kamar A-01',
      waliIndex: 1, // Wali 2: Bambang Sutrisno (Anak ke-1)
      hafalan_juz: 2,
    },
    {
      nisp: 'NISP-2025-003',
      nisn: '0123456783',
      nik: '3571011005130003',
      nama_lengkap: 'Fajar Ilham Sutrisno',
      nama_panggilan: 'Fajar',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Malang',
      tanggal_lahir: new Date('2013-05-10'),
      jenjang: JenjangSantri.MI,
      kelas_id: kelasMI2A.id,
      kamar_id: kamarA2.id,
      kamar: 'Kamar A-02',
      waliIndex: 1, // Wali 2: Bambang Sutrisno (Anak ke-2, Kakak-Adik 1 KK)
      hafalan_juz: 4,
    },
    {
      nisp: 'NISP-2025-004',
      nisn: '0123456784',
      nik: '3571012508130004',
      nama_lengkap: 'Muhammad Fathan Qodir',
      nama_panggilan: 'Fathan',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Kediri',
      tanggal_lahir: new Date('2013-08-25'),
      jenjang: JenjangSantri.MI,
      kelas_id: kelasMI2A.id,
      kamar_id: kamarA2.id,
      kamar: 'Kamar A-02',
      waliIndex: 2, // Wali 3: Abdul Qodir
      hafalan_juz: 5,
    },

    // --- 4 Santri Madrasah Diniyah ---
    {
      nisp: 'NISP-2025-005',
      nisn: '0123456785',
      nik: '3571011111110005',
      nama_lengkap: 'Ahmad Muzakki Ridwan',
      nama_panggilan: 'Zakki',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Sidoarjo',
      tanggal_lahir: new Date('2011-11-11'),
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      kelas_id: kelasDiniyah1Ula.id,
      kamar_id: kamarA3.id,
      kamar: 'Kamar A-03',
      waliIndex: 3, // Wali 4: Muhammad Ridwan
      hafalan_juz: 7,
    },
    {
      nisp: 'NISP-2025-006',
      nisn: '0123456786',
      nik: '3571011212110006',
      nama_lengkap: 'M. Rizky Pratama Fauzi',
      nama_panggilan: 'Rizky',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Blitar',
      tanggal_lahir: new Date('2011-12-12'),
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      kelas_id: kelasDiniyah1Ula.id,
      kamar_id: kamarA3.id,
      kamar: 'Kamar A-03',
      waliIndex: 4, // Wali 5: Ahmad Fauzi
      hafalan_juz: 8,
    },
    {
      nisp: 'NISP-2025-007',
      nisn: '0123456787',
      nik: '3571010303100007',
      nama_lengkap: 'Syahrul Romadhon',
      nama_panggilan: 'Syahrul',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Tulungagung',
      tanggal_lahir: new Date('2010-03-03'),
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      kelas_id: kelasDiniyah2Ula.id,
      kamar_id: kamarB1.id,
      kamar: 'Kamar B-01',
      waliIndex: 5, // Wali 6: Hj. Siti Aminah
      hafalan_juz: 10,
    },
    {
      nisp: 'NISP-2025-008',
      nisn: '0123456788',
      nik: '3571010707100008',
      nama_lengkap: 'M. Bilal Al-Ghifari Huda',
      nama_panggilan: 'Bilal',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Gresik',
      tanggal_lahir: new Date('2010-07-07'),
      jenjang: JenjangSantri.MADRASAH_DINIYAH,
      kelas_id: kelasDiniyah2Ula.id,
      kamar_id: kamarB1.id,
      kamar: 'Kamar B-01',
      waliIndex: 6, // Wali 7: Syamsul Huda
      hafalan_juz: 12,
    },

    // --- 2 Santri Pondok Tahfidz ---
    {
      nisp: 'NISP-2025-009',
      nisn: '0123456789',
      nik: '3571010909090009',
      nama_lengkap: 'M. Hafizh Hidayat',
      nama_panggilan: 'Hafizh',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Mojokerto',
      tanggal_lahir: new Date('2009-09-09'),
      jenjang: JenjangSantri.PONDOK,
      kelas_id: kelasTahfidz.id,
      kamar_id: kamarB2.id,
      kamar: 'Kamar B-02',
      waliIndex: 7, // Wali 8: Nur Hidayat (Anak ke-1)
      hafalan_juz: 25,
    },
    {
      nisp: 'NISP-2025-010',
      nisn: '0123456790',
      nik: '3571011010080010',
      nama_lengkap: 'M. Farhan Hidayat',
      nama_panggilan: 'Farhan',
      jenis_kelamin: JenisKelamin.LAKI_LAKI,
      tempat_lahir: 'Mojokerto',
      tanggal_lahir: new Date('2008-10-10'),
      jenjang: JenjangSantri.PONDOK,
      kelas_id: kelasTahfidz.id,
      kamar_id: kamarB2.id,
      kamar: 'Kamar B-02',
      waliIndex: 7, // Wali 8: Nur Hidayat (Anak ke-2, Kakak-Adik 1 KK)
      hafalan_juz: 30,
    },
  ];

  for (const s of santriSeedData) {
    const parent = waliRecordList[s.waliIndex];

    const santriRec = await prisma.santri.upsert({
      where: { nisp: s.nisp },
      update: {
        pondok_id: pondok.id,
        nisn: s.nisn,
        nik: s.nik,
        nama_lengkap: s.nama_lengkap,
        nama_panggilan: s.nama_panggilan,
        jenis_kelamin: s.jenis_kelamin,
        tempat_lahir: s.tempat_lahir,
        tanggal_lahir: s.tanggal_lahir,
        jenjang: s.jenjang,
        kelas_id: s.kelas_id,
        kamar_id: s.kamar_id,
        kamar: s.kamar,
        status: StatusSantri.AKTIF,
        status_tempat_tinggal: 'MUKIM',
        hafalan_juz: s.hafalan_juz,
        nik_wali: parent.nik,
        nama_wali: parent.nama_lengkap,
        no_hp_wali: parent.telepon,
        telepon_wali: parent.telepon,
        hubungan_wali: parent.hubungan,
        alamat_wali: parent.alamat_lengkap,
        no_kk: parent.no_kk,
        alamat: parent.alamat_lengkap,
        provinsi: 'Jawa Timur',
      },
      create: {
        pondok_id: pondok.id,
        nisp: s.nisp,
        nisn: s.nisn,
        nik: s.nik,
        nama_lengkap: s.nama_lengkap,
        nama_panggilan: s.nama_panggilan,
        jenis_kelamin: s.jenis_kelamin,
        tempat_lahir: s.tempat_lahir,
        tanggal_lahir: s.tanggal_lahir,
        jenjang: s.jenjang,
        kelas_id: s.kelas_id,
        kamar_id: s.kamar_id,
        kamar: s.kamar,
        status: StatusSantri.AKTIF,
        status_tempat_tinggal: 'MUKIM',
        hafalan_juz: s.hafalan_juz,
        nik_wali: parent.nik,
        nama_wali: parent.nama_lengkap,
        no_hp_wali: parent.telepon,
        telepon_wali: parent.telepon,
        hubungan_wali: parent.hubungan,
        alamat_wali: parent.alamat_lengkap,
        no_kk: parent.no_kk,
        alamat: parent.alamat_lengkap,
        provinsi: 'Jawa Timur',
      },
    });

    // 100% HubunganWali Database Junction
    await prisma.hubunganWali.upsert({
      where: {
        wali_santri_id_santri_id: {
          wali_santri_id: parent.id,
          santri_id: santriRec.id,
        },
      },
      update: {
        hubungan: parent.hubungan,
        is_primary: true,
      },
      create: {
        wali_santri_id: parent.id,
        santri_id: santriRec.id,
        hubungan: parent.hubungan,
        is_primary: true,
      },
    });

    // Penempatan Kamar History
    await prisma.penempatanKamarHistory.create({
      data: {
        santri_id: santriRec.id,
        kamar_id: s.kamar_id,
        tanggal_masuk: new Date('2025-07-01'),
        status: 'AKTIF',
      },
    });

    // Initial Absensi Log
    await prisma.absensiLog.create({
      data: {
        santri_id: santriRec.id,
        status: StatusAbsensi.HADIR,
        tanggal: new Date(),
        keterangan: 'Presensi harian terjadwal',
      },
    });

    // Initial Nilai Akademik
    if (s.jenjang === JenjangSantri.MI) {
      await prisma.nilaiAkademik.create({
        data: {
          santri_id: santriRec.id,
          mata_pelajaran_id: mapelMTK.id,
          nilai_harian: 88.5,
          nilai_uts: 85.0,
          nilai_uas: 90.0,
          tahun_ajaran: '2025/2026',
          semester: 'GANJIL',
        },
      });
    } else if (s.jenjang === JenjangSantri.MADRASAH_DINIYAH) {
      await prisma.nilaiAkademik.create({
        data: {
          santri_id: santriRec.id,
          mata_pelajaran_id: mapelFiqih.id,
          nilai_harian: 92.0,
          nilai_uts: 90.0,
          nilai_uas: 95.0,
          tahun_ajaran: '2025/2026',
          semester: 'GANJIL',
        },
      });
    }
  }

  // =========================================================================
  // 8. SEED PENGUMUMAN RESMI AWAL
  // =========================================================================
  console.log('🌱 [7/7] Menyiapkan Pengumuman Resmi...');
  await prisma.pengumuman.create({
    data: {
      judul: 'Selamat Datang Santri Baru Tahun Ajaran 2025/2026',
      isi: 'Seluruh santri dan wali santri dimohon menyelesaikan administrasi dan melengkapi berkas digital melalui Portal Darsa Enterprise.',
      target: 'SEMUA',
      instansi: 'PONDOK',
      penulis: 'Sekretariat Utama Pondok',
      penting: true,
    },
  });

  await prisma.pengumuman.create({
    data: {
      judul: 'Jadwal Kuliah Diniyah Semester Ganjil',
      isi: 'Kajian kitab kuning Fathul Qorib dan Jurumiyyah dimulai pukul 13.30 WIB di Gedung Diniyah.',
      target: 'GURU_MADRASAH',
      instansi: 'MADRASAH',
      penulis: 'Sekretariat Madrasah Diniyah',
      penting: false,
    },
  });

  await prisma.pengumuman.create({
    data: {
      judul: 'Pelaksanaan Ujian Tengah Semester MI',
      isi: 'Ujian Tengah Semester Ganjil MI akan diselenggarakan serentak mulai tanggal 15 Oktober 2025.',
      target: 'GURU_MI',
      instansi: 'FORMAL_MI',
      penulis: 'Sekretariat Formal MI',
      penting: false,
    },
  });

  console.log('✨ [SUKSES] Seluruh data berhasil dibuat ulang 100%!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
