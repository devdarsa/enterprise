# Dokumen Arsitektur Darsa Enterprise (Architecture Decision Record / ADR)

**Status:** Approved / Enterprise Architecture Standard  
**Versi:** 2.0.0  
**Tanggal:** 5 Agustus 2026  
**Sistem:** Platform Sistem Informasi Terpadu Enterprise Pendidikan Islam (Ma'had Darussa'adah Lirboyo Kota Kediri)  

---

## 1. Visi & Arsitektur Utama (Core Architecture)

Darsa Enterprise dirancang dengan arsitektur enterprise modern berstandar Single Source of Truth (SSOT), Role-Based Access Control (RBAC), dan Zero Hardcoded Data.

### Pilar Utama Platform:
1. **Master Single Source of Truth (SSOT) Pondok Pesantren (BAB I - X):**
   - Pondok Pesantren menjadi pusat data master tunggal untuk seluruh identitas santri/santriwati.
   - Menggunakan NISP (Stambuk) sebagai Kunci Utama Unik.
   - Master Santri **hanya menyimpan identitas permanen dasar** dan **tidak menyimpan kelas**.
   - Data penempatan kelas dipisahkan ke tabel `PenempatanPendidikan` (`penempatan_pendidikan`) dengan dukungan **Dual-Enrollment** (santri terdaftar di Madrasah Diniyah, MI Formal, atau keduanya sekaligus di tahun ajaran yang sama).

2. **Integrasi Master Wilayah Indonesia (Server Caching & Offline Fallback):**
   - Memiliki tabel master wilayah (`master_provinsi`, `master_kabupaten`, `master_kecamatan`, `master_desa`).
   - Frontend tidak mengakses API luar secara langsung; seluruh permintaan dikelola server-side `/api/v1/wilayah`.
   - Menggunakan mekanisme offline fallback dan auto-formatter string `alamat_lengkap`.

3. **Penyambungan Akun Wali Santri via NIK Orang Tua:**
   - Akun Wali Santri terhubung secara otomatis menggunakan `nik_wali` dari Database Pondok.
   - **Support Multi-Santri**: 1 NIK Wali dapat mengakses seluruh anak yang terdaftar pada NIK yang sama secara read-only.

4. **Presensi Dynamic QR Code & Geofencing GPS:**
   - QR Code khusus digunakan untuk presensi kehadiran Guru (Guru Madrasah & Guru MI) dengan perlindungan TOTP geolocation 200m.

5. **Struktur Navigasi & Standar Tombol Aksi:**
   - Seluruh menu dikelompokkan ke 4 kategori utama (`DASHBOARD`, `DATABASE PONDOK`, `KEAMANAN`, `SISTEM & UTILITAS`).
   - Seluruh modul menggunakan standar tombol aksi (`Detail`, `Edit`, `Soft Delete`, `Riwayat`, `Penempatan`, `Aktifkan/Nonaktifkan`, `Arsip`) dan toolbar import/export.

---

## 2. Struktur Database (Prisma PostgreSQL & Simulation Store)

Skema database dirancang modular dengan relasi Foreign Key yang ketat:

```text
Database Schema Architecture
├── 1. Core & Auth
│   ├── users
│   ├── roles & permissions
│   └── user_accounts (Manajemen Akun RBAC)
│
├── 2. Master Single Source of Truth (BAB II - V)
│   ├── santri (Identitas Dasar Permanen)
│   ├── penempatan_pendidikan (Dual-Enrollment Madrasah & MI)
│   ├── wali_santri & hubungan_wali (Penyambungan NIK Wali)
│   └── asrama & kamar (Penempatan Asrama)
│
├── 3. Master Wilayah Indonesia
│   ├── master_provinsi
│   ├── master_kabupaten
│   ├── master_kecamatan
│   └── master_desa
│
├── 4. Civitas & Kepegawaian
│   ├── pengurus (Pondok, Madrasah, MI)
│   ├── guru (Mustahiq, Munawwib, Guru MI)
│   └── alumni (Data Kelulusan & Khidmah)
│
├── 5. Keamanan & Kedisiplinan
│   ├── surat_perizinan (Izin Pulang/Keluar)
│   └── pelanggaran_santri (Tindakan & Takzir)
│
└── 6. Sistem, Audit & Recovery
    ├── tahun_ajaran & semester
    ├── audit_logs (Immutable Log Activity)
    └── recycle_bin (Soft Delete Recovery)
```

---

## 3. Matriks Hak Akses (RBAC 7-Role Matrix)

| Role | Scope Instansi | Deskripsi Hak Akses & Pembatasan |
|---|---|---|
| **Sekretariat Pondok** | Pondok | Administrator Utama. Akses penuh ke seluruh menu (`Dashboard`, `Database Pondok`, `Keamanan`, `Sistem & Utilitas`). |
| **Sekretariat Madrasah** | Madrasah Diniyah | Admin Akademik Diniyah. Santri read-only, tanpa akses ke Konfigurasi Sistem Pondok. |
| **Sekretariat MI** | MI Formal | Admin Operasional MI. Santri read-only, tanpa menu Nilai Akademik MI. |
| **Keamanan** | Pos Keamanan | Akses terbatas ke `Perizinan`, `Pelanggaran`, & `SOP`. Tidak dapat mengubah biodata/akademik. |
| **Mustahiq / Munawwib** | Guru Diniyah | Dual Role: Mustahiq (Wali Kelas) & Munawwib. Input Nilai, Input Absensi, Jadwal, QR Presensi. |
| **Guru MI** | Guru MI | Presensi Guru MI via Dynamic QR Code & Jadwal Mengajar (Tanpa Menu Nilai). |
| **Wali Santri** | Wali Santri | Read-only informasi santri, akademik, perizinan, pelanggaran, pengumuman (Multi-Santri NIK Link). |

---

## 4. Standar Tombol Aksi (Action Button Standard)

### A. Data Grid Table Buttons:
- 🔍 `Detail`: Melihat detail profil lengkap & penempatan pendidikan.
- ✏️ `Edit`: Mengubah & memperbarui data.
- 🗑️ `Soft Delete`: Mendorong data ke `recycle_bin` (dapat dipulihkan).
- 📜 `Riwayat`: Menampilkan jejak pergeseran data di Audit Log.
- 🎓 `Penempatan`: Pengelolaan unit pendidikan (Madrasah / MI).
- ⚡ `Aktifkan / Nonaktifkan`: Mengubah status aktif record.
- 📦 `Arsip`: Memindahkan data ke arsip historis.

### B. Form Action Buttons:
- 💾 `Simpan Data`: Menyimpan perubahan ke database via API.
- ➕ `Simpan & Tambah Baru`: Menyimpan & mengosongkan form untuk entry lanjutan.
- ✅ `Simpan & Tutup`: Menyimpan & menutup modal.
- 🔄 `Reset Form`: Mengembalikan form ke keadaan semula.
- ❌ `Batal` / ← `Kembali`: Membatalkan aksi tanpa menyimpan.

---

## 5. Ketentuan Simulasi & API

1. **Zero Hardcoded Data:** Seluruh data wajib diambil dari API `/api/v1/simulation/data` dan `/api/v1/wilayah`.
2. **Audit Logging Automatic:** Seluruh aksi Create, Update, Soft Delete, Restore, & Reset Password dicatat di `audit_log`.
3. **Soft Delete Standard:** Hapus data tidak langsung melenyapkan data dari database, melainkan memindahkan record ke `recycle_bin` untuk keperluan recovery.
