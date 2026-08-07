# Panduan & Spesifikasi Dokumentasi Tampilan Menu dan User (Darsa Enterprise)

**Status:** Approved Documentation Standard  
**Versi:** 5.0.0  
**Tanggal:** 7 Agustus 2026  
**Sistem:** Darsa Enterprise - Platform Terpadu Pendidikan Islam  

---

## 1. Aturan Bisnis & Hierarki Sistem (System Hierarchy)

Seluruh menu, fitur, hak akses, serta data dalam sistem **Darsa Enterprise** mengikuti hierarki terpadu berikut:

$$\text{Tahun Ajaran} \longrightarrow \text{Instansi} \longrightarrow \text{Role Database (SSOT)} \longrightarrow \text{Dashboard Auto-Redirect}$$

---

## 2. Struktur Navigasi Menu Utama & Top Bar Darsa Enterprise

### A. Top Navigation Header (`admin/layout.tsx`)
- **Breadcrumb Navigasi**: Penunjuk posisi halaman yang sedang diakses.
- **Tahun Ajaran Selector**: Dropdown periode akademik aktif (`2025/2026 Ganjil / Genap`) diletakkan di sebelah lonceng notifikasi.
- **Lonceng Notifikasi Interaktif 🔔**: Badge angka merah notifikasi baru, popover daftar notifikasi live, aksi 1-klik navigasi ke surat/santri/pelanggaran, serta tombol *Tandai Dibaca* & *Bersihkan*.
- **Profil & Logout Dropdown (Paling Kanan)**: Menampilkan Avatar `SP`, Nama Pengguna, Badge Role, Tombol Buka *Pengaturan Akun & Keamanan*, serta tombol *Keluar Sistem*.

### B. Grup Navigasi Sidebar Sekretariat (4 Kategori Utama)
1. 📊 **DASHBOARD**: Overview Dashboard (`/admin/dashboard`).
2. 🏛️ **DATABASE PONDOK**: Data Santri & Wali (`/admin/santri`), Data Asrama (`/admin/asrama`), Data Pengurus (`/admin/pengurus`), Data Pengajar (`/admin/guru`), Alumni (`/admin/alumni`).
3. 🛡️ **KEAMANAN**: Perizinan Santri (`/admin/surat`), Pelanggaran & Takzir (`/admin/pelanggaran`).
4. ⚙️ **SISTEM & UTILITAS**: Arsip (`/admin/arsip`), Tahun Ajaran (`/admin/tahun-ajaran`), Manajemen Akun (`/admin/akun`), Audit Log (`/admin/audit-log`), SOP (`/admin/sop`), Konfigurasi (`/admin/konfigurasi`).

---

## 3. Matriks Tampilan & Portal Login Terpadu (Dual Unified Login)

### 📱 Portal Login Terpadu Mobile (`/login`)
- Satu pintu masuk untuk Wali Santri, Mustahiq, Munawwib, Guru MI, & Keamanan.
- Mendukung Bank-Style remembered account card, Passkeys / WebAuthn Biometrik, & Google SSO.
- Otomatis mengarahkan pengguna ke dashboard yang berhak berdasarkan tabel database `user_roles`.

### 🖥️ Portal Login Desktop Sekretariat (`/admin/login`)
- Pintu masuk khusus untuk Pengurus & Sekretariat Utama.
- Mengarahkan ke Master Dashboard `/admin/dashboard`.

---

## 4. Fitur Pengaturan Akun & Keamanan Modal (`AccountSettingsModal.tsx`)

Bisa diakses dari tombol *Profil* di Top Bar maupun Bottom Nav:
1. **Tab Profil**: Ubah Nama Lengkap, Email, & Unggah Foto Avatar (tersimpan di Local Storage & State).
2. **Tab Kata Sandi**: Formulir ubah kata sandi lama ➔ kata sandi baru.
3. **Tab Biometrik**: Aktivasi / Registrasi WebAuthn Passkeys (Touch ID, Face ID, Fingerprint).
4. **Tab Google SSO**: Tautkan / Hubungkan Akun Google untuk Single Sign-On 1-klik.
