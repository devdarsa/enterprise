-- ============================================================================
-- DARSA ENTERPRISE — MASTER DATABASE RESET & SEED SCRIPT (POSTGRESQL / SUPABASE)
-- ============================================================================
-- Salin dan jalankan seluruh script ini langsung di Supabase SQL Editor.
-- Password untuk semua akun adalah: darsa25
-- ============================================================================

-- 1. BERSIHKAN SEMUA DATA TABEL (TRUNCATE CASCADE)
TRUNCATE TABLE
  "absensi_log", "qr_sessions", "perizinan", "pelanggaran", "surat", "surat_arsip",
  "nilai_akademik", "rapor_santri", "alumni_record", "penempatan_kamar_history",
  "hubungan_wali", "jadwal_pelajaran", "mata_pelajaran", "otp_verifications",
  "audit_logs", "pengumuman", "lokasi_presensi", "santri", "kamar", "gedung_asrama",
  "kelas", "guru", "pengurus", "wali_santri", "madrasah", "pondok", "tahun_ajaran",
  "passkey_credentials", "sessions", "accounts", "user_roles", "users", "roles",
  "verifications", "master_jabatan"
CASCADE;

-- ============================================================================
-- 2. MASTER ROLES
-- ============================================================================
INSERT INTO "roles" ("id", "name", "description") VALUES
  ('role-sekretariat', 'SEKRETARIAT', 'Sekretariat Utama Pondok Pesantren'),
  ('role-admin-instansi', 'ADMIN_INSTANSI', 'Admin Instansi Diniyah / Formal MI'),
  ('role-guru-madrasah', 'GURU_MADRASAH', 'Guru / Ustadz Diniyah'),
  ('role-guru-mi', 'GURU_MI', 'Ustadzah / Guru Formal MI'),
  ('role-guru', 'GURU', 'Pengajar General'),
  ('role-keamanan', 'KEAMANAN', 'Tim Keamanan & Ketertiban'),
  ('role-mustahiq', 'MUSTAHIQ', 'Mustahiq Wali Kelas Diniyah'),
  ('role-munawwib', 'MUNAWWIB', 'Munawwib Pengajar Diniyah'),
  ('role-wali-santri', 'WALI_SANTRI', 'Orang Tua / Wali Santri');

-- ============================================================================
-- 3. TAHUN AJARAN, KELEMBAGAAN & LOKASI PRESENSI
-- ============================================================================
INSERT INTO "tahun_ajaran" ("id", "nama", "semester", "tanggal_mulai", "tanggal_akhir", "is_aktif", "updated_at") VALUES
  ('ta-2025-ganjil', '2025/2026', 'GANJIL', '2025-07-01 00:00:00', '2025-12-31 23:59:59', true, NOW());

INSERT INTO "pondok" ("id", "nama", "alamat", "telepon", "updated_at") VALUES
  ('pondok-lirboyo', 'Pondok Pesantren Darussa''adah Lirboyo (DARSA)', 'Jl. KH. Abdul Karim, Lirboyo, Mojoroto, Kota Kediri, Jawa Timur', '0354-771234', NOW());

INSERT INTO "madrasah" ("id", "pondok_id", "nama", "npsn", "updated_at") VALUES
  ('madrasah-diniyah', 'pondok-lirboyo', 'Madrasah Diniyah Darussaadah Lirboyo', 'MADRASAH-DINIYAH-LIRBOYO', NOW()),
  ('madrasah-mi', 'pondok-lirboyo', 'Madrasah Ibtidaiyah Darussaadah', 'MI-FORMAL-LIRBOYO', NOW());

INSERT INTO "lokasi_presensi" ("id", "pondok_id", "nama_lokasi", "latitude", "longitude", "radius_meter") VALUES
  ('lokasi-utama', 'pondok-lirboyo', 'Gerbang Utama & Masjid Jami Lirboyo', -7.8185, 112.0125, 200);

-- ============================================================================
-- 4. GEDUNG ASRAMA & KAMAR
-- ============================================================================
INSERT INTO "gedung_asrama" ("id", "nama_gedung", "gender", "keterangan") VALUES
  ('gedung-alfath', 'Gedung Al-Fath', 'LAKI_LAKI', 'Komplek Asrama Putra Utama'),
  ('gedung-albarokah', 'Gedung Al-Barokah', 'LAKI_LAKI', 'Komplek Asrama Putra Tahfidz');

INSERT INTO "kamar" ("id", "gedung_id", "nama_kamar", "kapasitas") VALUES
  ('kamar-a01', 'gedung-alfath', 'Kamar A-01', 10),
  ('kamar-a02', 'gedung-alfath', 'Kamar A-02', 10),
  ('kamar-a03', 'gedung-alfath', 'Kamar A-03', 10),
  ('kamar-b01', 'gedung-albarokah', 'Kamar B-01', 10),
  ('kamar-b02', 'gedung-albarokah', 'Kamar B-02', 10);

-- ============================================================================
-- 5. KELAS & MATA PELAJARAN
-- ============================================================================
INSERT INTO "kelas" ("id", "madrasah_id", "nama_kelas", "jenjang", "tingkat", "kapasitas", "updated_at") VALUES
  ('kelas-mi-1a', 'madrasah-mi', 'Kelas 1-A (MI)', 'MI', 1, 30, NOW()),
  ('kelas-mi-2a', 'madrasah-mi', 'Kelas 2-A (MI)', 'MI', 2, 30, NOW()),
  ('kelas-din-1ula', 'madrasah-diniyah', '1 Ula (Diniyah)', 'MADRASAH_DINIYAH', 1, 30, NOW()),
  ('kelas-din-2ula', 'madrasah-diniyah', '2 Ula (Diniyah)', 'MADRASAH_DINIYAH', 2, 30, NOW()),
  ('kelas-tahfidz', NULL, 'Halaqah Tahfidz Al-Qur''an', 'PONDOK', 1, 25, NOW());

INSERT INTO "mata_pelajaran" ("id", "kode_mapel", "nama_mapel", "jenjang", "kategori") VALUES
  ('mapel-mtk', 'MP-MI-MTK', 'Matematika Dasar', 'MI', 'Umum'),
  ('mapel-barab-mi', 'MP-MI-BARAB', 'Bahasa Arab MI', 'MI', 'Agama'),
  ('mapel-fiqih', 'MP-MAD-FIQIH', 'Fiqih Fathul Qorib', 'MADRASAH_DINIYAH', 'Kitab Kuning'),
  ('mapel-nahwu', 'MP-MAD-NAHWU', 'Nahwu Jurumiyyah', 'MADRASAH_DINIYAH', 'Kitab Kuning');

-- ============================================================================
-- 6. USERS & ACCOUNTS AUTH (Password Hash Better Auth untuk "darsa25")
-- Hash: 6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3
-- ============================================================================
INSERT INTO "users" ("id", "email", "nama_lengkap", "email_verified", "updated_at") VALUES
  ('usr-sekretariat-pondok', 'sekretariat.pondok@darsa.my.id', 'Ust. Hamdan Baihaqi (Sekretariat)', true, NOW()),
  ('usr-sekretariat-madrasah', 'sekretariat.madrasah@darsa.my.id', 'Sekretariat Madrasah Diniyah', true, NOW()),
  ('usr-sekretariat-mi', 'sekretariat.mi@darsa.my.id', 'Sekretariat Formal MI', true, NOW()),
  ('usr-keamanan', 'keamanan@darsa.my.id', 'Ust. Ridwan Mansyur (Keamanan)', true, NOW()),
  ('usr-guru-mi-1', 'guru.mi@darsa.my.id', 'Ustadzah Siti Fatimah, S.Pd.I', true, NOW()),
  ('usr-guru-mi-2', 'guru.mi2@darsa.my.id', 'Ustadz Ahmad Dahlan, M.Pd', true, NOW()),
  ('usr-mustahiq', 'mustahiq@darsa.my.id', 'KH. M. Syukron Ma''mun', true, NOW()),
  ('usr-munawwib', 'munawwib@darsa.my.id', 'Ust. Zainal Abidin, S.Th.I', true, NOW()),
  ('usr-wali-default', 'wali@darsa.my.id', 'H. Hendra Gunawan (Wali Santri)', true, NOW()),
  ('usr-wali-1', 'wali1@darsa.my.id', 'H. Hendra Gunawan', true, NOW()),
  ('usr-wali-2', 'wali2@darsa.my.id', 'H. Bambang Sutrisno', true, NOW()),
  ('usr-wali-3', 'wali3@darsa.my.id', 'H. Abdul Qodir', true, NOW()),
  ('usr-wali-4', 'wali4@darsa.my.id', 'H. Muhammad Ridwan', true, NOW()),
  ('usr-wali-5', 'wali5@darsa.my.id', 'H. Ahmad Fauzi', true, NOW()),
  ('usr-wali-6', 'wali6@darsa.my.id', 'Hj. Siti Aminah', true, NOW()),
  ('usr-wali-7', 'wali7@darsa.my.id', 'H. Syamsul Huda', true, NOW()),
  ('usr-wali-8', 'wali8@darsa.my.id', 'H. Nur Hidayat', true, NOW());

INSERT INTO "accounts" ("id", "user_id", "provider", "provider_account_id", "password", "updated_at") VALUES
  ('acc-sek-pondok', 'usr-sekretariat-pondok', 'credential', 'sekretariat.pondok@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-sek-madrasah', 'usr-sekretariat-madrasah', 'credential', 'sekretariat.madrasah@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-sek-mi', 'usr-sekretariat-mi', 'credential', 'sekretariat.mi@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-keamanan', 'usr-keamanan', 'credential', 'keamanan@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-guru-mi-1', 'usr-guru-mi-1', 'credential', 'guru.mi@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-guru-mi-2', 'usr-guru-mi-2', 'credential', 'guru.mi2@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-mustahiq', 'usr-mustahiq', 'credential', 'mustahiq@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-munawwib', 'usr-munawwib', 'credential', 'munawwib@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-wali-def', 'usr-wali-default', 'credential', 'wali@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-wali-1', 'usr-wali-1', 'credential', 'wali1@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-wali-2', 'usr-wali-2', 'credential', 'wali2@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-wali-3', 'usr-wali-3', 'credential', 'wali3@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-wali-4', 'usr-wali-4', 'credential', 'wali4@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-wali-5', 'usr-wali-5', 'credential', 'wali5@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-wali-6', 'usr-wali-6', 'credential', 'wali6@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-wali-7', 'usr-wali-7', 'credential', 'wali7@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW()),
  ('acc-wali-8', 'usr-wali-8', 'credential', 'wali8@darsa.my.id', '6ccbec5150e4d796f93ee52bc9fddaab:147a7a37cfd9c103b4b8a1182982e26081b4eff339f6c32f9261b89c161d711b2e605e5df64daf28054dd814e25bec4b1eb183f92541ddb2eadc158dbb93e8f3', NOW());

INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES
  ('ur-sek-pondok', 'usr-sekretariat-pondok', 'role-sekretariat'),
  ('ur-sek-madrasah', 'usr-sekretariat-madrasah', 'role-admin-instansi'),
  ('ur-sek-mi', 'usr-sekretariat-mi', 'role-admin-instansi'),
  ('ur-keamanan', 'usr-keamanan', 'role-keamanan'),
  ('ur-guru-mi-1', 'usr-guru-mi-1', 'role-guru-mi'),
  ('ur-guru-mi-2', 'usr-guru-mi-2', 'role-guru-mi'),
  ('ur-mustahiq', 'usr-mustahiq', 'role-mustahiq'),
  ('ur-munawwib', 'usr-munawwib', 'role-munawwib'),
  ('ur-wali-def', 'usr-wali-default', 'role-wali-santri'),
  ('ur-wali-1', 'usr-wali-1', 'role-wali-santri'),
  ('ur-wali-2', 'usr-wali-2', 'role-wali-santri'),
  ('ur-wali-3', 'usr-wali-3', 'role-wali-santri'),
  ('ur-wali-4', 'usr-wali-4', 'role-wali-santri'),
  ('ur-wali-5', 'usr-wali-5', 'role-wali-santri'),
  ('ur-wali-6', 'usr-wali-6', 'role-wali-santri'),
  ('ur-wali-7', 'usr-wali-7', 'role-wali-santri'),
  ('ur-wali-8', 'usr-wali-8', 'role-wali-santri');

-- ============================================================================
-- 7. GURU, PENGURUS & JADWAL PELAJARAN
-- ============================================================================
INSERT INTO "guru" ("id", "user_id", "nip", "nik", "nama_lengkap", "jenis_kelamin", "tempat_lahir", "tanggal_lahir", "telepon", "alamat_lengkap", "pendidikan_terakhir", "status_pegawai", "updated_at") VALUES
  ('guru-mi-1', 'usr-guru-mi-1', '198504122010012001', '3571014504850001', 'Ustadzah Siti Fatimah, S.Pd.I', 'PEREMPUAN', 'Kediri', '1985-04-12', '081234567801', 'Jl. KH. Wachid Hasyim No. 12, Kediri', 'S1 Pendidikan Agama Islam', 'AKTIF', NOW()),
  ('guru-mi-2', 'usr-guru-mi-2', '198807192015031002', '3571011907880002', 'Ustadz Ahmad Dahlan, M.Pd', 'LAKI_LAKI', 'Nganjuk', '1988-07-19', '081234567802', 'Jl. Supriyadi No. 45, Nganjuk', 'S2 Manajemen Pendidikan', 'AKTIF', NOW()),
  ('guru-madrasah-1', 'usr-mustahiq', 'GMD-2024-001', '3571011210750001', 'KH. M. Syukron Ma''mun', 'LAKI_LAKI', 'Kediri', '1975-10-12', '081234567803', 'Komplek Pengasuh Pondok Lirboyo', 'Pondok Pesantren Lirboyo Kediri', 'AKTIF', NOW()),
  ('guru-madrasah-2', 'usr-munawwib', 'GMD-2024-002', '3571011508820002', 'Ust. Zainal Abidin, S.Th.I', 'LAKI_LAKI', 'Jombang', '1982-08-15', '081234567804', 'Komplek Asatidz Diniyah Lirboyo', 'S1 Tafsir Hadits', 'AKTIF', NOW());

INSERT INTO "jadwal_pelajaran" ("id", "kelas_id", "mata_pelajaran_id", "guru_id", "hari", "jam_mulai", "jam_selesai", "ruangan", "tahun_ajaran") VALUES
  ('jadwal-mi-1', 'kelas-mi-1a', 'mapel-mtk', 'guru-mi-1', 'SENIN', '07:30', '09:00', 'Ruang MI 1-A', '2025/2026'),
  ('jadwal-mi-2', 'kelas-mi-2a', 'mapel-barab-mi', 'guru-mi-2', 'SELASA', '07:30', '09:00', 'Ruang MI 2-A', '2025/2026'),
  ('jadwal-din-1', 'kelas-din-1ula', 'mapel-fiqih', 'guru-madrasah-1', 'SABTU', '13:30', '15:00', 'Gedung Diniyah Lt. 2', '2025/2026'),
  ('jadwal-din-2', 'kelas-din-2ula', 'mapel-nahwu', 'guru-madrasah-2', 'AHAD', '13:30', '15:00', 'Gedung Diniyah Lt. 3', '2025/2026');

INSERT INTO "pengurus" ("id", "nik", "nama_lengkap", "jabatan", "unit", "status", "telepon", "alamat", "updated_at") VALUES
  ('pengurus-1', '3571012003800001', 'Ust. Ridwan Mansyur', 'Kabid Keamanan & Ketertiban', 'PONDOK', 'AKTIF', '081234567805', 'Komplek Pengurus Pondok', NOW()),
  ('pengurus-2', '3571011005830002', 'Ust. Hamdan Baihaqi', 'Sekretaris Utama & Kabid Asrama', 'PONDOK', 'AKTIF', '081234567806', 'Kantor Sekretariat Pondok', NOW());

-- ============================================================================
-- 8. 8 WALI SANTRI (LENGKAP NIK, KK, KONTAK)
-- ============================================================================
INSERT INTO "wali_santri" ("id", "user_id", "nik", "nama_lengkap", "telepon", "no_hp", "alamat_lengkap", "pekerjaan", "updated_at") VALUES
  ('wali-1', 'usr-wali-1', '3571010101750001', 'H. Hendra Gunawan', '081234567901', '081234567901', 'Jl. Basuki Rahmat No. 10, Surabaya', 'Wiraswasta', NOW()),
  ('wali-2', 'usr-wali-2', '3571010202780002', 'H. Bambang Sutrisno', '081234567902', '081234567902', 'Jl. Diponegoro No. 25, Malang', 'PNS', NOW()),
  ('wali-3', 'usr-wali-3', '3571010303790003', 'H. Abdul Qodir', '081234567903', '081234567903', 'Jl. Ahmad Yani No. 50, Kediri', 'Pedagang', NOW()),
  ('wali-4', 'usr-wali-4', '3571010404800004', 'H. Muhammad Ridwan', '081234567904', '081234567904', 'Jl. Pahlawan No. 14, Sidoarjo', 'Karyawan Swasta', NOW()),
  ('wali-5', 'usr-wali-5', '3571010505810005', 'H. Ahmad Fauzi', '081234567905', '081234567905', 'Jl. Veteran No. 88, Blitar', 'Guru', NOW()),
  ('wali-6', 'usr-wali-6', '3571010606820006', 'Hj. Siti Aminah', '081234567906', '081234567906', 'Jl. Gatot Subroto No. 32, Tulungagung', 'Ibu Rumah Tangga', NOW()),
  ('wali-7', 'usr-wali-7', '3571010707830007', 'H. Syamsul Huda', '081234567907', '081234567907', 'Jl. Kartini No. 5, Gresik', 'Wiraswasta', NOW()),
  ('wali-8', 'usr-wali-8', '3571010808840008', 'H. Nur Hidayat', '081234567908', '081234567908', 'Jl. Gajah Mada No. 17, Mojokerto', 'PNS', NOW());

-- ============================================================================
-- 9. 10 DATA SANTRI LENGKAP & KONEKSI HUBUNGAN WALI (100% NIK & NO_KK)
-- ============================================================================
INSERT INTO "santri" (
  "id", "pondok_id", "nisp", "nisn", "nik", "nama_lengkap", "nama_panggilan",
  "jenis_kelamin", "tempat_lahir", "tanggal_lahir", "jenjang", "kelas_id",
  "kamar_id", "kamar", "status", "status_tempat_tinggal", "hafalan_juz",
  "nik_wali", "nama_wali", "no_hp_wali", "telepon_wali", "hubungan_wali",
  "alamat_wali", "no_kk", "alamat", "provinsi", "updated_at"
) VALUES
  -- 4 Santri Formal MI
  ('santri-1', 'pondok-lirboyo', 'NISP-2025-001', '0123456781', '3571011501140001', 'Ahmad Zaki Gunawan', 'Zaki', 'LAKI_LAKI', 'Surabaya', '2014-01-15', 'MI', 'kelas-mi-1a', 'kamar-a01', 'Kamar A-01', 'AKTIF', 'MUKIM', 3, '3571010101750001', 'H. Hendra Gunawan', '081234567901', '081234567901', 'AYAH', 'Jl. Basuki Rahmat No. 10, Surabaya', '3571010101000001', 'Jl. Basuki Rahmat No. 10, Surabaya', 'Jawa Timur', NOW()),
  ('santri-2', 'pondok-lirboyo', 'NISP-2025-002', '0123456782', '3571012002140002', 'Dimas Arya Sutrisno', 'Arya', 'LAKI_LAKI', 'Malang', '2014-02-20', 'MI', 'kelas-mi-1a', 'kamar-a01', 'Kamar A-01', 'AKTIF', 'MUKIM', 2, '3571010202780002', 'H. Bambang Sutrisno', '081234567902', '081234567902', 'AYAH', 'Jl. Diponegoro No. 25, Malang', '3571010202000002', 'Jl. Diponegoro No. 25, Malang', 'Jawa Timur', NOW()),
  ('santri-3', 'pondok-lirboyo', 'NISP-2025-003', '0123456783', '3571011005130003', 'Fajar Ilham Sutrisno', 'Fajar', 'LAKI_LAKI', 'Malang', '2013-05-10', 'MI', 'kelas-mi-2a', 'kamar-a02', 'Kamar A-02', 'AKTIF', 'MUKIM', 4, '3571010202780002', 'H. Bambang Sutrisno', '081234567902', '081234567902', 'AYAH', 'Jl. Diponegoro No. 25, Malang', '3571010202000002', 'Jl. Diponegoro No. 25, Malang', 'Jawa Timur', NOW()),
  ('santri-4', 'pondok-lirboyo', 'NISP-2025-004', '0123456784', '3571012508130004', 'Muhammad Fathan Qodir', 'Fathan', 'LAKI_LAKI', 'Kediri', '2013-08-25', 'MI', 'kelas-mi-2a', 'kamar-a02', 'Kamar A-02', 'AKTIF', 'MUKIM', 5, '3571010303790003', 'H. Abdul Qodir', '081234567903', '081234567903', 'AYAH', 'Jl. Ahmad Yani No. 50, Kediri', '3571010303000003', 'Jl. Ahmad Yani No. 50, Kediri', 'Jawa Timur', NOW()),

  -- 4 Santri Madrasah Diniyah
  ('santri-5', 'pondok-lirboyo', 'NISP-2025-005', '0123456785', '3571011111110005', 'Ahmad Muzakki Ridwan', 'Zakki', 'LAKI_LAKI', 'Sidoarjo', '2011-11-11', 'MADRASAH_DINIYAH', 'kelas-din-1ula', 'kamar-a03', 'Kamar A-03', 'AKTIF', 'MUKIM', 7, '3571010404800004', 'H. Muhammad Ridwan', '081234567904', '081234567904', 'AYAH', 'Jl. Pahlawan No. 14, Sidoarjo', '3571010404000004', 'Jl. Pahlawan No. 14, Sidoarjo', 'Jawa Timur', NOW()),
  ('santri-6', 'pondok-lirboyo', 'NISP-2025-006', '0123456786', '3571011212110006', 'M. Rizky Pratama Fauzi', 'Rizky', 'LAKI_LAKI', 'Blitar', '2011-12-12', 'MADRASAH_DINIYAH', 'kelas-din-1ula', 'kamar-a03', 'Kamar A-03', 'AKTIF', 'MUKIM', 8, '3571010505810005', 'H. Ahmad Fauzi', '081234567905', '081234567905', 'AYAH', 'Jl. Veteran No. 88, Blitar', '3571010505000005', 'Jl. Veteran No. 88, Blitar', 'Jawa Timur', NOW()),
  ('santri-7', 'pondok-lirboyo', 'NISP-2025-007', '0123456787', '3571010303100007', 'Syahrul Romadhon', 'Syahrul', 'LAKI_LAKI', 'Tulungagung', '2010-03-03', 'MADRASAH_DINIYAH', 'kelas-din-2ula', 'kamar-b01', 'Kamar B-01', 'AKTIF', 'MUKIM', 10, '3571010606820006', 'Hj. Siti Aminah', '081234567906', '081234567906', 'IBU', 'Jl. Gatot Subroto No. 32, Tulungagung', '3571010606000006', 'Jl. Gatot Subroto No. 32, Tulungagung', 'Jawa Timur', NOW()),
  ('santri-8', 'pondok-lirboyo', 'NISP-2025-008', '0123456788', '3571010707100008', 'M. Bilal Al-Ghifari Huda', 'Bilal', 'LAKI_LAKI', 'Gresik', '2010-07-07', 'MADRASAH_DINIYAH', 'kelas-din-2ula', 'kamar-b01', 'Kamar B-01', 'AKTIF', 'MUKIM', 12, '3571010707830007', 'H. Syamsul Huda', '081234567907', '081234567907', 'AYAH', 'Jl. Kartini No. 5, Gresik', '3571010707000007', 'Jl. Kartini No. 5, Gresik', 'Jawa Timur', NOW()),

  -- 2 Santri Pondok Tahfidz
  ('santri-9', 'pondok-lirboyo', 'NISP-2025-009', '0123456789', '3571010909090009', 'M. Hafizh Hidayat', 'Hafizh', 'LAKI_LAKI', 'Mojokerto', '2009-09-09', 'PONDOK', 'kelas-tahfidz', 'kamar-b02', 'Kamar B-02', 'AKTIF', 'MUKIM', 25, '3571010808840008', 'H. Nur Hidayat', '081234567908', '081234567908', 'AYAH', 'Jl. Gajah Mada No. 17, Mojokerto', '3571010808000008', 'Jl. Gajah Mada No. 17, Mojokerto', 'Jawa Timur', NOW()),
  ('santri-10', 'pondok-lirboyo', 'NISP-2025-010', '0123456790', '3571011010080010', 'M. Farhan Hidayat', 'Farhan', 'LAKI_LAKI', 'Mojokerto', '2008-10-10', 'PONDOK', 'kelas-tahfidz', 'kamar-b02', 'Kamar B-02', 'AKTIF', 'MUKIM', 30, '3571010808840008', 'H. Nur Hidayat', '081234567908', '081234567908', 'AYAH', 'Jl. Gajah Mada No. 17, Mojokerto', '3571010808000008', 'Jl. Gajah Mada No. 17, Mojokerto', 'Jawa Timur', NOW());

-- HUBUNGAN WALI SANTRI (100% Junction Database)
INSERT INTO "hubungan_wali" ("id", "wali_santri_id", "santri_id", "hubungan", "is_primary") VALUES
  ('hw-1', 'wali-1', 'santri-1', 'AYAH', true),
  ('hw-2', 'wali-2', 'santri-2', 'AYAH', true),
  ('hw-3', 'wali-2', 'santri-3', 'AYAH', true),
  ('hw-4', 'wali-3', 'santri-4', 'AYAH', true),
  ('hw-5', 'wali-4', 'santri-5', 'AYAH', true),
  ('hw-6', 'wali-5', 'santri-6', 'AYAH', true),
  ('hw-7', 'wali-6', 'santri-7', 'IBU', true),
  ('hw-8', 'wali-7', 'santri-8', 'AYAH', true),
  ('hw-9', 'wali-8', 'santri-9', 'AYAH', true),
  ('hw-10', 'wali-8', 'santri-10', 'AYAH', true);

-- PENEMPATAN KAMAR HISTORY
INSERT INTO "penempatan_kamar_history" ("id", "santri_id", "kamar_id", "tanggal_masuk", "status") VALUES
  ('pkh-1', 'santri-1', 'kamar-a01', '2025-07-01', 'AKTIF'),
  ('pkh-2', 'santri-2', 'kamar-a01', '2025-07-01', 'AKTIF'),
  ('pkh-3', 'santri-3', 'kamar-a02', '2025-07-01', 'AKTIF'),
  ('pkh-4', 'santri-4', 'kamar-a02', '2025-07-01', 'AKTIF'),
  ('pkh-5', 'santri-5', 'kamar-a03', '2025-07-01', 'AKTIF'),
  ('pkh-6', 'santri-6', 'kamar-a03', '2025-07-01', 'AKTIF'),
  ('pkh-7', 'santri-7', 'kamar-b01', '2025-07-01', 'AKTIF'),
  ('pkh-8', 'santri-8', 'kamar-b01', '2025-07-01', 'AKTIF'),
  ('pkh-9', 'santri-9', 'kamar-b02', '2025-07-01', 'AKTIF'),
  ('pkh-10', 'santri-10', 'kamar-b02', '2025-07-01', 'AKTIF');

-- NILAI AKADEMIK AWAL
INSERT INTO "nilai_akademik" ("id", "santri_id", "mata_pelajaran_id", "nilai_harian", "nilai_uts", "nilai_uas", "tahun_ajaran", "semester", "updated_at") VALUES
  ('nilai-1', 'santri-1', 'mapel-mtk', 88.5, 85.0, 90.0, '2025/2026', 'GANJIL', NOW()),
  ('nilai-2', 'santri-2', 'mapel-mtk', 84.0, 80.0, 88.0, '2025/2026', 'GANJIL', NOW()),
  ('nilai-3', 'santri-3', 'mapel-barab-mi', 91.0, 90.0, 92.0, '2025/2026', 'GANJIL', NOW()),
  ('nilai-4', 'santri-4', 'mapel-barab-mi', 89.0, 87.0, 90.0, '2025/2026', 'GANJIL', NOW()),
  ('nilai-5', 'santri-5', 'mapel-fiqih', 92.0, 90.0, 95.0, '2025/2026', 'GANJIL', NOW()),
  ('nilai-6', 'santri-6', 'mapel-fiqih', 88.0, 86.0, 90.0, '2025/2026', 'GANJIL', NOW()),
  ('nilai-7', 'santri-7', 'mapel-nahwu', 95.0, 94.0, 96.0, '2025/2026', 'GANJIL', NOW()),
  ('nilai-8', 'santri-8', 'mapel-nahwu', 90.0, 88.0, 92.0, '2025/2026', 'GANJIL', NOW());

-- ABSENSI LOG AWAL
INSERT INTO "absensi_log" ("id", "santri_id", "status", "tanggal", "keterangan") VALUES
  ('abs-1', 'santri-1', 'HADIR', NOW(), 'Presensi harian terjadwal'),
  ('abs-2', 'santri-2', 'HADIR', NOW(), 'Presensi harian terjadwal'),
  ('abs-3', 'santri-3', 'HADIR', NOW(), 'Presensi harian terjadwal'),
  ('abs-4', 'santri-4', 'HADIR', NOW(), 'Presensi harian terjadwal'),
  ('abs-5', 'santri-5', 'HADIR', NOW(), 'Presensi harian terjadwal'),
  ('abs-6', 'santri-6', 'HADIR', NOW(), 'Presensi harian terjadwal'),
  ('abs-7', 'santri-7', 'HADIR', NOW(), 'Presensi harian terjadwal'),
  ('abs-8', 'santri-8', 'HADIR', NOW(), 'Presensi harian terjadwal'),
  ('abs-9', 'santri-9', 'HADIR', NOW(), 'Presensi harian terjadwal'),
  ('abs-10', 'santri-10', 'HADIR', NOW(), 'Presensi harian terjadwal');

-- ============================================================================
-- 10. PENGUMUMAN RESMI AWAL
-- ============================================================================
INSERT INTO "pengumuman" ("id", "judul", "isi", "target", "instansi", "penulis", "penting", "updated_at") VALUES
  ('peng-1', 'Selamat Datang Santri Baru Tahun Ajaran 2025/2026', 'Seluruh santri dan wali santri dimohon menyelesaikan administrasi dan melengkapi berkas digital melalui Portal Darsa Enterprise.', 'SEMUA', 'PONDOK', 'Sekretariat Utama Pondok', true, NOW()),
  ('peng-2', 'Jadwal Kuliah Diniyah Semester Ganjil', 'Kajian kitab kuning Fathul Qorib dan Jurumiyyah dimulai pukul 13.30 WIB di Gedung Diniyah.', 'GURU_MADRASAH', 'MADRASAH', 'Sekretariat Madrasah Diniyah', false, NOW()),
  ('peng-3', 'Pelaksanaan Ujian Tengah Semester MI', 'Ujian Tengah Semester Ganjil MI akan diselenggarakan serentak mulai tanggal 15 Oktober 2025.', 'GURU_MI', 'FORMAL_MI', 'Sekretariat Formal MI', false, NOW());
