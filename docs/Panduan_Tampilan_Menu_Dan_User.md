# Panduan & Spesifikasi Dokumentasi Tampilan Menu dan User (Darsa Enterprise)

**Status:** Approved Documentation Standard  
**Versi:** 4.0.0  
**Tanggal:** 5 Agustus 2026  
**Sistem:** Darsa Enterprise - Platform Terpadu Pendidikan Islam  

---

## 1. Aturan Bisnis & Hierarki Sistem (System Hierarchy)

Seluruh menu, fitur, hak akses, serta data dalam sistem **Darsa Enterprise** wajib mengikuti struktur dan hierarki berikut:

$$\text{Tahun Ajaran} \longrightarrow \text{Instansi} \longrightarrow \text{Role Pengguna} \longrightarrow \text{Data (Single Source of Truth)}$$

---

## 2. Struktur Navigasi Menu Utama Darsa Enterprise

Seluruh navigasi admin dikelompokkan secara konsisten ke dalam 4 grup navigasi utama:

### 1. 📊 DASHBOARD
- **Overview Dashboard** (`/admin/dashboard`): Ringkasan informasi statistik dinamis per role pengguna dan instansi aktif.

### 2. 🏛️ DATABASE PONDOK
- **Data Santri & Wali** (`/admin/santri` & `/admin/santri/baru`): Master Single Source of Truth identitas santri, penempatan pendidikan, dan NIK Wali link.
- **Data Asrama & Pembina** (`/admin/asrama`): Master Asrama, Gedung, Kamar, Kapasitas, dan Pembina Asrama.
- **Data Pengurus** (`/admin/pengurus`): Pengelolaan struktural pengurus Pondok Pesantren, Madrasah Diniyah, & MI Formal.
- **Data Pengajar** (`/admin/guru`): Direktori pengajar, Dewan Mustahiq, Munawwib, dan Guru MI.
- **Alumni & Kelulusan** (`/admin/alumni`): Pendataan alumni, tahun kelulusan, dan status alumni (Khidmah/Kuliah/Wirausaha).

### 3. 🛡️ KEAMANAN
- **Perizinan Santri** (`/admin/surat`): Pengajuan izin pulang, izin keluar, izin kembali, dan cetak surat perizinan resmi.
- **Pelanggaran & Takzir** (`/admin/pelanggaran`): Pencatatan jenis pelanggaran, tingkat hukuman (Ringan/Sedang/Berat), dan riwayat takzir.

### 4. ⚙️ SISTEM & UTILITAS
- **Arsip Historis** (`/admin/arsip`): Dokumentasi & berkas akademik historis non-aktif.
- **Tahun Ajaran & Semester** (`/admin/tahun-ajaran`): Pengaturan periode akademik aktif dan tutup tahun ajaran.
- **Manajemen Akun & RBAC** (`/admin/akun`): Pengelolaan akun pengguna, penetapan role RBAC, dan reset password.
- **Audit Log & Recycle Bin** (`/admin/audit-log`): Jejak aktivitas perubahan data (Immutable) & pemulihan Soft Delete.
- **Panduan & SOP Sistem** (`/admin/sop`): Dokumentasi resmi SOP operasional pesantren & FAQ.
- **Konfigurasi Sistem** (`/admin/konfigurasi`): Identitas lembaga, radius QR Code presensi, dan preferensi notifikasi WA.

---

## 3. Matriks Tampilan & Hak Akses per Role (7 Roles)

### A. Sekretariat Pondok (`admin@darsa.id`)
- **Tampilan**: Desktop Sidebar Full Access.
- **Hak Akses**: Akses penuh ke seluruh menu (Dashboard, Database Pondok, Keamanan, Sistem & Utilitas).

### B. Sekretariat Madrasah Diniyyah (`sek.madrasah@darsa.id`)
- **Tampilan**: Desktop Sidebar (Restricted Scope).
- **Hak Akses**: `Dashboard`, `Data Santri` (Read-Only reference), `Data Pengajar`, `Jadwal Pelajaran`, `Keamanan`, `Arsip`, `SOP`. (Tanpa akses ke Konfigurasi Sistem Pondok).

### C. Sekretariat MI (`sek.mi@darsa.id`)
- **Tampilan**: Desktop Sidebar (Restricted Scope).
- **Hak Akses**: `Dashboard`, `Data Santri MI` (Read-Only reference), `Data Guru MI`, `Jadwal MI`, `Arsip`, `SOP`. (Tanpa menu Nilai Akademik MI).

### D. Keamanan (`keamanan@darsa.id`)
- **Tampilan**: Desktop Sidebar Restricted.
- **Hak Akses**: `Dashboard`, `Perizinan Santri`, `Pelanggaran & Kedisiplinan`, `SOP`.

### E. Mustahiq / Munawwib Guru Madrasah (`guru@darsa.id`)
- **Tampilan**: Mobile Bottom Navigation Bar (`/guru_madrasah/dashboard`).
- **Hak Akses**: `Dashboard`, `QR Code Presensi Guru`, `Absensi Guru`, `Jadwal Mengajar`, `Data Kelas`, `Data Mapel`, `Input Nilai`, `Input Absensi Santri`, `Riwayat`, `Profil`.

### F. Guru MI (`guru.mi@darsa.id`)
- **Tampilan**: Mobile Bottom Navigation Bar (`/guru_mi/dashboard`).
- **Hak Akses**: `Dashboard`, `QR Code Presensi Guru`, `Absensi Guru`, `Jadwal Mengajar`, `Profil`. (Tanpa menu Nilai / Akademik).

### G. Wali Santri (`wali@darsa.id`)
- **Tampilan**: Mobile Bottom Navigation Bar (`/wali_santri/dashboard`).
- **Hak Akses**: Read-Only Info Santri, Info Akademik, Perizinan, Pelanggaran, Pengumuman, Profil (Multi-Santri NIK Link).
