# Dokumen Arsitektur Darsa Enterprise (Architecture Decision Record / ADR)

**Status:** Approved / Enterprise Architecture Standard  
**Versi:** 7.0.0  
**Tanggal:** 7 Agustus 2026  
**Sistem:** Platform Sistem Informasi Terpadu Enterprise Pendidikan Islam (Ma'had Darussa'adah Lirboyo Kota Kediri)  

---

## 1. Visi & Arsitektur Utama (Core Architecture)

Darsa Enterprise dirancang dengan arsitektur enterprise modern berstandar Single Source of Truth (SSOT), Role-Based Access Control (RBAC), dan Zero Hardcoded Data.

### Pilar Utama Platform:
1. **Dual Unified Auth & Smart Role Routing:**
   - **Pintu 1 Mobile/Lapangan (`/login`)**: Satu pintu login pintar terpadu untuk Wali Santri, Mustahiq, Munawwib, Guru MI, & Keamanan. Menggunakan Bank-Style Remembered Account view, Passkeys / WebAuthn Biometrik, & Google SSO.
   - **Pintu 2 Desktop Sekretariat (`/admin/login`)**: Pintu masuk khusus Pengurus & Sekretariat Utama.
   - **Smart Server-Side Routing**: Menguji `user_roles` di database PostgreSQL dan mengarahkan otomatis tanpa membolehkan bypass atau privilege escalation.

2. **Master Single Source of Truth (SSOT) Pondok Pesantren:**
   - Pondok Pesantren menjadi pusat data master tunggal untuk seluruh identitas santri/santriwati.
   - Data penempatan kelas dipisahkan ke tabel `penempatan_pendidikan` dengan dukungan **Dual-Enrollment** (santri terdaftar di Diniyah, MI Formal, atau keduanya sekaligus).

3. **Pengaturan Akun & Keamanan Terpadu (`AccountSettingsModal`):**
   - Modal pengaturan profil 4-tab (Profil, Sandi, Biometrik, Google) yang terhubung di seluruh portal dashboard.
   - Mendukung unggah foto profil avatar, ubah kata sandi, aktivasi Biometrik Touch ID/Face ID/Passkeys, dan tautkan Akun Google.

4. **Desain UI Top Bar & Lonceng Notifikasi Interaktif (`admin/layout.tsx`):**
   - Selector `Tahun Ajaran` dipindahkan ke Top Header Bar di sebelah Lonceng Notifikasi.
   - Lonceng notifikasi aktif dengan badge merah `unreadCount`, dropdown popover, navigasi otomatis 1-klik, serta tombol *Tandai Dibaca* & *Bersihkan*.
   - Avatar Profil Pengguna & Tombol Keluar (Logout) diletakkan di sebelah paling kanan Top Header Bar.

5. **Mobile Navigation & Floating Central Scan QR (`MobileBottomNav.tsx`):**
   - Navigation bar bawah mobile dengan tombol tengah melayang (*Floating Scan QR*) dan cincin gradien melingkar khas aplikasi modern.

---

## 2. Struktur Database & Clean Route Topology

Skema database dirancang modular dengan relasi Foreign Key yang ketat dan konsolidasi rute Next.js App Router (10 Grup Rute Kanonikal):

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

## 3. Matriks Hak Akses (RBAC 7-Role Matrix)

| Role | Scope Instansi | Alur Login & Redirection | Deskripsi Hak Akses |
|---|---|---|---|
| **Sekretariat Pondok** | Pondok | `/admin/login` ➔ `/admin/dashboard` | Administrator Utama. Akses penuh ke seluruh menu (`Dashboard`, `Database Pondok`, `Keamanan`, `Sistem & Utilitas`). |
| **Sekretariat Madrasah** | Madrasah Diniyah | `/admin/login` ➔ `/admin/dashboard` | Admin Akademik Diniyah. Santri read-only, tanpa akses ke Konfigurasi Sistem Pondok. |
| **Sekretariat MI** | MI Formal | `/admin/login` ➔ `/admin/dashboard` | Admin Operasional MI. Santri read-only, tanpa menu Nilai Akademik MI. |
| **Keamanan** | Pos Keamanan | `/login` ➔ `/keamanan/dashboard` | Akses terbatas ke `Perizinan`, `Pelanggaran`, & `SOP`. |
| **Mustahiq / Munawwib** | Guru Diniyah | `/login` ➔ `/guru_madrasah/dashboard` | Dual Role: Mustahiq (Wali Kelas) & Munawwib. Input Nilai, Input Absensi, Jadwal, QR Presensi. |
| **Guru MI** | Guru MI | `/login` ➔ `/guru_mi/dashboard` | Presensi Guru MI via Dynamic QR Code & Jadwal Mengajar (Tanpa Menu Nilai). |
| **Wali Santri** | Wali Santri | `/login` ➔ `/wali_santri/dashboard` | Read-only informasi santri, akademik, perizinan, pelanggaran, pengumuman (Multi-Santri NIK Link). |

---

## 4. Standar Tombol Aksi & Notifikasi System

### A. Data Grid Table Buttons:
- 🔍 `Detail`: Melihat detail profil lengkap & penempatan pendidikan.
- ✏️ `Edit`: Mengubah & memperbarui data.
- 🗑️ `Soft Delete`: Mendorong data ke `recycle_bin` (dapat dipulihkan).
- 📜 `Riwayat`: Menampilkan jejak pergeseran data di Audit Log.
- 🎓 `Penempatan`: Pengelolaan unit pendidikan (Madrasah / MI).
- ⚡ `Aktifkan / Nonaktifkan`: Mengubah status aktif record.
- 📦 `Arsip`: Memindahkan data ke arsip historis.

### B. Form & Top Bar Actions:
- 🔔 `Lonceng Notifikasi`: Dynamic unread count badge + popover list + 1-click navigation.
- ⚙️ `Pengaturan Akun`: 4-tab modal (Profil, Sandi, Biometrik, Google SSO).
- 🚪 `Keluar Sistem`: Clean sign out + pembersihan cache lokal.
