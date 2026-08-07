# Spesifikasi Lengkap Darsa Enterprise (Official Master Document)

**Status:** Approved Official Standard  
**Versi:** 7.0.0  
**Tanggal:** 7 Agustus 2026  
**Lembaga:** Ma'had Darussa'adah Lirboyo Kota Kediri  

---

## 1. Standar Pembuatan Akun & Pendaftaran (BAB I - X)

### A. Dual Unified Authentication System
1. **Pintu Login Mobile & Lapangan (`/login`)**:
   - Satu pintu masuk terpadu untuk Wali Santri, Mustahiq, Munawwib, Guru MI, Keamanan, & Asatidz.
   - Tampilan Bank-Style: Mengingat akun (Avatar, Nama, Masked Email), opsi 1-klik kata sandi, Biometrik (Passkeys), & Google SSO.
   - Smart Auto-Routing: Membaca `user_roles` di database PostgreSQL dan mengarahkan otomatis ke dashboard masing-masing (`/wali_santri/dashboard`, `/guru_madrasah/dashboard`, `/guru_mi/dashboard`, `/keamanan/dashboard`).

2. **Pintu Login Desktop Sekretariat (`/admin/login`)**:
   - Pintu masuk khusus Pengurus Utama & Sekretariat Instansi.
   - Otomatis mengarahkan ke `/admin/dashboard`.

### B. Fitur Pengaturan Akun & Keamanan Modal (`AccountSettingsModal.tsx`)
- Pengguna di seluruh portal dapat mengelola keamanan akun mereka melalui Modal 4-Tab:
  - **Profil**: Perbarui Nama, Email, & Unggah Foto Profil Avatar.
  - **Kata Sandi**: Ubah kata sandi sistem.
  - **Biometrik**: Registrasi Passkeys WebAuthn (Touch ID, Face ID, Sidik Jari).
  - **Google**: Tautkan akun Google untuk SSO.

---

## 2. Standar Top Bar & Notifikasi Sistem (`admin/layout.tsx`)

1. **Relokasi Tahun Ajaran**: Pilihan `Tahun Ajaran` dipindahkan ke Top Navigation Header di samping Lonceng Notifikasi.
2. **Lonceng Notifikasi Interaktif**:
   - Badge angka merah penghitung notifikasi belum dibaca.
   - Dropdown Popover dengan kartu notifikasi (Surat Perizinan, Scan QR, Pelanggaran).
   - Klik kartu langsung menandai dibaca & me-redirect ke halaman target (`/admin/surat`, `/admin/santri`, `/admin/pelanggaran`).
   - Aksion kontrol: *Tandai Semua Dibaca* & *Bersihkan*.
3. **Menu Akun Far Right**: Avatar `SP`, Nama, Role, Modal Pengaturan Akun, & Logout diletakkan di sudut kanan atas header.

---

## 3. Matriks Navigasi & App Router Topology (10 Rute Kanonikal)

```text
Kanonikal App Router Topology (/src/app)
├── /admin             (Portal Sekretariat Utama & Desktop Admin)
├── /admin/login       (Pintu Login Desktop Sekretariat)
├── /login             (Pintu Login Pintar Terpadu Mobile & Lapangan)
├── /guru_madrasah     (Dashboard Mustahiq, Munawwib, & Guru Diniyah)
├── /guru_mi           (Dashboard Ustadz & Guru Formal MI)
├── /keamanan          (Dashboard Tim Keamanan & Perizinan)
├── /wali_santri       (Dashboard Orang Tua / Wali Santri)
├── /register/wali     (Wizard Pendaftaran Wali Santri)
├── /docs              (Dokumentasi Resmi & ADR)
└── /api/v1/*          (REST API Gateway Services)
```

---

## 4. Standar Tombol Aksi & UI/UX Mobile

* **Floating Scan QR FAB (`MobileBottomNav.tsx`)**: Tombol Scan QR tengah melayang di navigation bar mobile dengan gradien melingkar khas aplikasi QR modern.
* **Data Grid Tabel**: `🔍 Detail`, `✏️ Edit`, `🗑️ Soft Delete` (ke Recycle Bin), `📜 Riwayat` (Audit Log), `🎓 Penempatan`, `⚡ Aktifkan/Nonaktifkan`, `📦 Arsip`.
* **Toolbar Actions**: `➕ Tambah Data`, `📥 Import`, `📊 Export`, `{1} Cetak`, `🔄 Sync`.
* **Infrastructure Redirects (`next.config.ts`)**: 0ms performance redirects dari rute lama ke rute resmi kanonikal.
