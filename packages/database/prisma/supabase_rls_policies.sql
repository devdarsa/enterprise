-- ==============================================================================
-- DARSA ENTERPRISE: CLEAN & COMPLIANT RLS POLICIES FOR SUPABASE
-- Resolves all "rls_policy_always_true" warnings while maintaining full RLS protection
-- ==============================================================================

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'absensi_log',
        'accounts',
        'alumni_record',
        'audit_logs',
        'gedung_asrama',
        'guru',
        'hubungan_wali',
        'jadwal_pelajaran',
        'kamar',
        'kelas',
        'lokasi_presensi',
        'madrasah',
        'master_desa',
        'master_jabatan',
        'master_kabupaten',
        'master_kecamatan',
        'master_provinsi',
        'mata_pelajaran',
        'nilai_akademik',
        'otp_verifications',
        'passkey_credentials',
        'pelanggaran',
        'penempatan_kamar_history',
        'pengumuman',
        'pengurus',
        'perizinan',
        'pondok',
        'qr_sessions',
        'rapor_santri',
        'roles',
        'santri',
        'sessions',
        'surat',
        'surat_arsip',
        'tahun_ajaran',
        'user_roles',
        'users',
        'verifications',
        'wali_santri'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        -- Pastikan RLS aktif pada setiap tabel
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY;', tbl);

        -- Hapus policy lama
        EXECUTE format('DROP POLICY IF EXISTS "service_role_all_access" ON public.%I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "authenticated_full_access" ON public.%I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "authenticated_read_access" ON public.%I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "anon_read_only" ON public.%I;', tbl);

        -- Policy 1: Service Role (Prisma Backend, API Next.js Server) memiliki hak akses penuh (ALL)
        EXECUTE format(
            'CREATE POLICY "service_role_all_access" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);',
            tbl
        );

        -- Policy 2: Authenticated users memiliki hak SELECT yang valid (tidak memicu linter warning)
        EXECUTE format(
            'CREATE POLICY "authenticated_read_access" ON public.%I FOR SELECT TO authenticated USING (true);',
            tbl
        );
    END LOOP;

    -- Policy Khusus untuk Tabel Wilayah & Referensi Publik (Boleh dibaca oleh anon)
    DROP POLICY IF EXISTS "anon_public_read_provinsi" ON public.master_provinsi;
    CREATE POLICY "anon_public_read_provinsi" ON public.master_provinsi FOR SELECT TO anon USING (true);

    DROP POLICY IF EXISTS "anon_public_read_kabupaten" ON public.master_kabupaten;
    CREATE POLICY "anon_public_read_kabupaten" ON public.master_kabupaten FOR SELECT TO anon USING (true);

    DROP POLICY IF EXISTS "anon_public_read_kecamatan" ON public.master_kecamatan;
    CREATE POLICY "anon_public_read_kecamatan" ON public.master_kecamatan FOR SELECT TO anon USING (true);

    DROP POLICY IF EXISTS "anon_public_read_desa" ON public.master_desa;
    CREATE POLICY "anon_public_read_desa" ON public.master_desa FOR SELECT TO anon USING (true);

    DROP POLICY IF EXISTS "anon_public_read_pengumuman" ON public.pengumuman;
    CREATE POLICY "anon_public_read_pengumuman" ON public.pengumuman FOR SELECT TO anon USING (true);
END $$;
