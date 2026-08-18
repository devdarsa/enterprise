-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SEKRETARIAT', 'ADMIN_INSTANSI', 'GURU_MADRASAH', 'GURU_MI', 'GURU', 'PEGAWAI', 'KEAMANAN', 'MUSTAHIQ', 'MUNAWWIB', 'SANTRI', 'WALI_SANTRI');

-- CreateEnum
CREATE TYPE "StatusPegawai" AS ENUM ('AKTIF', 'CUTI', 'NON_AKTIF', 'MUTASI');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "StatusSantri" AS ENUM ('AKTIF', 'LULUS', 'MUTASI', 'DO');

-- CreateEnum
CREATE TYPE "JenjangSantri" AS ENUM ('MI', 'MADRASAH_DINIYAH', 'PONDOK');

-- CreateEnum
CREATE TYPE "StatusAbsensi" AS ENUM ('HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA');

-- CreateEnum
CREATE TYPE "StatusPerizinan" AS ENUM ('PENDING', 'MENUNGGU', 'DISETUJUI', 'DITOLAK', 'KEMBALI', 'SELESAI');

-- CreateEnum
CREATE TYPE "TingkatPelanggaran" AS ENUM ('RINGAN', 'SEDANG', 'BERAT');

-- CreateEnum
CREATE TYPE "JenisSurat" AS ENUM ('SURAT_MASUK', 'SURAT_KELUAR', 'SURAT_KEPUTUSAN', 'SURAT_KETERANGAN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL DEFAULT '',
    "foto_url" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "password" TEXT,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkey_credentials" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "device_type" TEXT NOT NULL DEFAULT 'singleDevice',
    "backed_up" BOOLEAN NOT NULL DEFAULT false,
    "transports" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passkey_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" "RoleType" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pondok" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "telepon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pondok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "madrasah" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pondok_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "npsn" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "madrasah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lokasi_presensi" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pondok_id" TEXT NOT NULL,
    "nama_lokasi" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius_meter" INTEGER NOT NULL DEFAULT 200,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lokasi_presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengurus" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nik" TEXT,
    "nama_lengkap" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'PONDOK',
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "telepon" TEXT,
    "alamat" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pengurus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengumuman" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "target" TEXT NOT NULL DEFAULT 'SEMUA',
    "instansi" TEXT NOT NULL DEFAULT 'SEMUA',
    "penulis" TEXT,
    "penting" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahun_ajaran" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nama" TEXT NOT NULL,
    "semester" TEXT NOT NULL DEFAULT 'GANJIL',
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_akhir" TIMESTAMP(3) NOT NULL,
    "is_aktif" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahun_ajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guru" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "nip" TEXT NOT NULL,
    "nik" TEXT,
    "nama_lengkap" TEXT NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL DEFAULT 'LAKI_LAKI',
    "tempat_lahir" TEXT,
    "tanggal_lahir" TIMESTAMP(3),
    "no_hp" TEXT,
    "telepon" TEXT,
    "alamat_lengkap" TEXT,
    "provinsi" TEXT,
    "kabupaten" TEXT,
    "kecamatan" TEXT,
    "desa" TEXT,
    "pendidikan_terakhir" TEXT,
    "status_pegawai" "StatusPegawai" NOT NULL DEFAULT 'AKTIF',
    "tanggal_mulai_tugas" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "santri" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "pondok_id" TEXT,
    "nisp" TEXT NOT NULL,
    "nisn" TEXT,
    "nis" TEXT,
    "nik" TEXT,
    "nama_lengkap" TEXT NOT NULL,
    "nama_panggilan" TEXT,
    "jenis_kelamin" "JenisKelamin" NOT NULL DEFAULT 'LAKI_LAKI',
    "tempat_lahir" TEXT,
    "tanggal_lahir" TIMESTAMP(3),
    "anak_ke" INTEGER,
    "jumlah_saudara" INTEGER,
    "alamat" TEXT,
    "telepon" TEXT,
    "jenjang" "JenjangSantri" NOT NULL DEFAULT 'PONDOK',
    "kelas_id" TEXT NOT NULL,
    "kamar_id" TEXT,
    "kamar" TEXT,
    "status_tempat_tinggal" TEXT,
    "status" "StatusSantri" NOT NULL DEFAULT 'AKTIF',
    "nik_wali" TEXT,
    "nama_wali" TEXT,
    "no_hp_wali" TEXT,
    "telepon_wali" TEXT,
    "hubungan_wali" TEXT,
    "alamat_wali" TEXT,
    "no_kk" TEXT,
    "provinsi" TEXT,
    "kabupaten" TEXT,
    "kecamatan" TEXT,
    "desa" TEXT,
    "hafalan_juz" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wali_santri" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "nik" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL DEFAULT '',
    "telepon" TEXT,
    "alamat_lengkap" TEXT,
    "provinsi" TEXT,
    "kabupaten" TEXT,
    "kecamatan" TEXT,
    "desa" TEXT,
    "pekerjaan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "wali_santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nik" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resend_count" INTEGER NOT NULL DEFAULT 1,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hubungan_wali" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "wali_santri_id" TEXT NOT NULL,
    "santri_id" TEXT NOT NULL,
    "hubungan" TEXT NOT NULL DEFAULT 'AYAH',
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hubungan_wali_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "madrasah_id" TEXT,
    "nama_kelas" TEXT NOT NULL,
    "jenjang" "JenjangSantri" NOT NULL DEFAULT 'PONDOK',
    "tingkat" INTEGER NOT NULL,
    "kapasitas" INTEGER NOT NULL DEFAULT 30,
    "wali_kelas_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_pelajaran" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "kode_mapel" TEXT NOT NULL,
    "nama_mapel" TEXT NOT NULL,
    "jenjang" "JenjangSantri" NOT NULL DEFAULT 'PONDOK',
    "kategori" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mata_pelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal_pelajaran" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "kelas_id" TEXT NOT NULL,
    "mata_pelajaran_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "jam_mulai" TEXT NOT NULL,
    "jam_selesai" TEXT NOT NULL,
    "ruangan" TEXT DEFAULT '-',
    "tahun_ajaran" TEXT NOT NULL DEFAULT '2025/2026',
    "semester" TEXT NOT NULL DEFAULT 'GANJIL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jadwal_pelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gedung_asrama" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nama_gedung" TEXT NOT NULL,
    "gender" "JenisKelamin" NOT NULL DEFAULT 'LAKI_LAKI',
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gedung_asrama_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kamar" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "gedung_id" TEXT NOT NULL,
    "nama_kamar" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kamar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penempatan_kamar_history" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "santri_id" TEXT NOT NULL,
    "kamar_id" TEXT NOT NULL,
    "tanggal_masuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_keluar" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penempatan_kamar_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_sessions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "qr_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi_log" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "santri_id" TEXT NOT NULL,
    "lokasi_presensi_id" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusAbsensi" NOT NULL DEFAULT 'HADIR',
    "keterangan" TEXT,
    "scan_by" TEXT,
    "latitude_scan" DOUBLE PRECISION,
    "longitude_scan" DOUBLE PRECISION,
    "distance_meters" DOUBLE PRECISION,
    "device_info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absensi_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perizinan" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "santri_id" TEXT NOT NULL,
    "jenis" TEXT,
    "alasan" TEXT NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_selesai" TIMESTAMP(3),
    "tanggal_kembali" TIMESTAMP(3),
    "status" "StatusPerizinan" NOT NULL DEFAULT 'MENUNGGU',
    "approved_by_id" TEXT,
    "disetujui_oleh" TEXT,
    "keterangan" TEXT,
    "catatan_petugas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "perizinan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelanggaran" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "santri_id" TEXT NOT NULL,
    "petugas_id" TEXT,
    "jenis" TEXT,
    "tingkat" "TingkatPelanggaran" NOT NULL DEFAULT 'RINGAN',
    "deskripsi" TEXT,
    "hukuman" TEXT,
    "tindakan" TEXT,
    "keterangan" TEXT,
    "poin_pelanggaran" INTEGER NOT NULL DEFAULT 5,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pelanggaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai_akademik" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "santri_id" TEXT NOT NULL,
    "mata_pelajaran_id" TEXT NOT NULL,
    "tahun_ajaran" TEXT NOT NULL,
    "semester" TEXT NOT NULL DEFAULT 'GANJIL',
    "nilai_harian" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilai_uts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilai_uas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nilai_akademik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapor_santri" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "santri_id" TEXT NOT NULL,
    "tahun_ajaran" TEXT NOT NULL,
    "semester" TEXT NOT NULL DEFAULT 'GANJIL',
    "hafalan_juz" INTEGER NOT NULL DEFAULT 0,
    "predikat_arab" TEXT,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rapor_santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni_record" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "santri_id" TEXT NOT NULL,
    "tahun_lulus" INTEGER NOT NULL,
    "ijazah_no" TEXT,
    "status_alumni" TEXT NOT NULL DEFAULT 'KULIAH',
    "profesi_saat_ini" TEXT,
    "kontak_alumni" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alumni_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_provinsi" (
    "kode_provinsi" TEXT NOT NULL,
    "nama_provinsi" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_provinsi_pkey" PRIMARY KEY ("kode_provinsi")
);

-- CreateTable
CREATE TABLE "master_kabupaten" (
    "kode_kabupaten" TEXT NOT NULL,
    "kode_provinsi" TEXT NOT NULL,
    "nama_kabupaten" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_kabupaten_pkey" PRIMARY KEY ("kode_kabupaten")
);

-- CreateTable
CREATE TABLE "master_kecamatan" (
    "kode_kecamatan" TEXT NOT NULL,
    "kode_kabupaten" TEXT NOT NULL,
    "nama_kecamatan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_kecamatan_pkey" PRIMARY KEY ("kode_kecamatan")
);

-- CreateTable
CREATE TABLE "master_desa" (
    "kode_desa" TEXT NOT NULL,
    "kode_kecamatan" TEXT NOT NULL,
    "nama_desa" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_desa_pkey" PRIMARY KEY ("kode_desa")
);

-- CreateTable
CREATE TABLE "surat_arsip" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nomor_surat" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "jenis" "JenisSurat" NOT NULL DEFAULT 'SURAT_MASUK',
    "pengirim" TEXT,
    "penerima" TEXT,
    "tanggal_surat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_url" TEXT,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_arsip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pondok_id" TEXT,
    "nomor_surat" TEXT NOT NULL,
    "jenis_surat" "JenisSurat" NOT NULL DEFAULT 'SURAT_MASUK',
    "perihal" TEXT NOT NULL,
    "pengirim" TEXT,
    "penerima" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_url" TEXT,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_jabatan" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nama" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'PONDOK',
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "passkey_credentials_credential_id_key" ON "passkey_credentials"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "madrasah_npsn_key" ON "madrasah"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "guru_user_id_key" ON "guru"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nip_key" ON "guru"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nik_key" ON "guru"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "santri_user_id_key" ON "santri"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "santri_nisp_key" ON "santri"("nisp");

-- CreateIndex
CREATE UNIQUE INDEX "santri_nisn_key" ON "santri"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "santri_nik_key" ON "santri"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "wali_santri_user_id_key" ON "wali_santri"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wali_santri_nik_key" ON "wali_santri"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "hubungan_wali_wali_santri_id_santri_id_key" ON "hubungan_wali"("wali_santri_id", "santri_id");

-- CreateIndex
CREATE UNIQUE INDEX "mata_pelajaran_kode_mapel_key" ON "mata_pelajaran"("kode_mapel");

-- CreateIndex
CREATE UNIQUE INDEX "gedung_asrama_nama_gedung_key" ON "gedung_asrama"("nama_gedung");

-- CreateIndex
CREATE UNIQUE INDEX "qr_sessions_qr_token_key" ON "qr_sessions"("qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_akademik_santri_id_mata_pelajaran_id_tahun_ajaran_sem_key" ON "nilai_akademik"("santri_id", "mata_pelajaran_id", "tahun_ajaran", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "rapor_santri_santri_id_tahun_ajaran_semester_key" ON "rapor_santri"("santri_id", "tahun_ajaran", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "alumni_record_santri_id_key" ON "alumni_record"("santri_id");

-- CreateIndex
CREATE UNIQUE INDEX "surat_arsip_nomor_surat_key" ON "surat_arsip"("nomor_surat");

-- CreateIndex
CREATE UNIQUE INDEX "surat_nomor_surat_key" ON "surat"("nomor_surat");

-- CreateIndex
CREATE UNIQUE INDEX "master_jabatan_nama_key" ON "master_jabatan"("nama");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passkey_credentials" ADD CONSTRAINT "passkey_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "madrasah" ADD CONSTRAINT "madrasah_pondok_id_fkey" FOREIGN KEY ("pondok_id") REFERENCES "pondok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lokasi_presensi" ADD CONSTRAINT "lokasi_presensi_pondok_id_fkey" FOREIGN KEY ("pondok_id") REFERENCES "pondok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru" ADD CONSTRAINT "guru_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "santri" ADD CONSTRAINT "santri_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "santri" ADD CONSTRAINT "santri_pondok_id_fkey" FOREIGN KEY ("pondok_id") REFERENCES "pondok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "santri" ADD CONSTRAINT "santri_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "santri" ADD CONSTRAINT "santri_kamar_id_fkey" FOREIGN KEY ("kamar_id") REFERENCES "kamar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wali_santri" ADD CONSTRAINT "wali_santri_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hubungan_wali" ADD CONSTRAINT "hubungan_wali_wali_santri_id_fkey" FOREIGN KEY ("wali_santri_id") REFERENCES "wali_santri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hubungan_wali" ADD CONSTRAINT "hubungan_wali_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "santri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_madrasah_id_fkey" FOREIGN KEY ("madrasah_id") REFERENCES "madrasah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_pelajaran" ADD CONSTRAINT "jadwal_pelajaran_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_pelajaran" ADD CONSTRAINT "jadwal_pelajaran_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_pelajaran" ADD CONSTRAINT "jadwal_pelajaran_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kamar" ADD CONSTRAINT "kamar_gedung_id_fkey" FOREIGN KEY ("gedung_id") REFERENCES "gedung_asrama"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penempatan_kamar_history" ADD CONSTRAINT "penempatan_kamar_history_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penempatan_kamar_history" ADD CONSTRAINT "penempatan_kamar_history_kamar_id_fkey" FOREIGN KEY ("kamar_id") REFERENCES "kamar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_log" ADD CONSTRAINT "absensi_log_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perizinan" ADD CONSTRAINT "perizinan_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perizinan" ADD CONSTRAINT "perizinan_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelanggaran" ADD CONSTRAINT "pelanggaran_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelanggaran" ADD CONSTRAINT "pelanggaran_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_akademik" ADD CONSTRAINT "nilai_akademik_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_akademik" ADD CONSTRAINT "nilai_akademik_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapor_santri" ADD CONSTRAINT "rapor_santri_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumni_record" ADD CONSTRAINT "alumni_record_santri_id_fkey" FOREIGN KEY ("santri_id") REFERENCES "santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_kabupaten" ADD CONSTRAINT "master_kabupaten_kode_provinsi_fkey" FOREIGN KEY ("kode_provinsi") REFERENCES "master_provinsi"("kode_provinsi") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_kecamatan" ADD CONSTRAINT "master_kecamatan_kode_kabupaten_fkey" FOREIGN KEY ("kode_kabupaten") REFERENCES "master_kabupaten"("kode_kabupaten") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_desa" ADD CONSTRAINT "master_desa_kode_kecamatan_fkey" FOREIGN KEY ("kode_kecamatan") REFERENCES "master_kecamatan"("kode_kecamatan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat" ADD CONSTRAINT "surat_pondok_id_fkey" FOREIGN KEY ("pondok_id") REFERENCES "pondok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

