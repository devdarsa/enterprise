# 🕌 Darsa Enterprise

**Sistem Informasi Terpadu Enterprise Pendidikan Islam**  
Ma'had Darussa'adah Lirboyo Kota Kediri

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

---

## 🏛️ Ketentuan & Arsitektur Utama Darsa Enterprise

### 1. Database Centric & Single Source of Truth (SSOT)
* **Pondok Pesantren** merupakan **Master Database (Single Source of Truth)** seluruh Santri/Santriwati (BAB I - X).
* Menggunakan **NISP (Nomor Induk Santri Pondok / Stambuk)** sebagai identitas utama unik.
* Identitas Master Santri hanya disimpan 1 kali dan **TIDAK menyimpan kelas**.
* Data kelas disimpan di tabel khusus **`PenempatanPendidikan` (`penempatan_pendidikan`)** dengan dukungan **Dual-Enrollment** (Satu santri dapat bersekolah di Madrasah Diniyah, MI Formal, atau keduanya sekaligus di tahun ajaran yang sama).
* Unit **Madrasah Diniyah** dan **MI Formal** tidak membuat data santri baru, hanya melakukan pemanggilan (import/referensi) data penempatan dari Database Pondok via API.

### 2. Penyambungan Akun Wali Santri via NIK Orang Tua
* Akun Wali Santri terhubung otomatis dengan data santri menggunakan **NIK Kependudukan (`nik_wali`)** orang tua/wali di Database Pondok.
* **Support Multi-Santri**: 1 Akun Wali Santri yang memiliki NIK sama dapat terhubung otomatis dengan 1 atau lebih santri (saudara/kakak-adik) dengan sakelar tab santri di portal.

### 3. Master Wilayah Indonesia (Server Caching & API Wilayah)
* Pengelolaan data wilayah bertahap (Provinsi ➔ Kab/Kota ➔ Kecamatan ➔ Desa/Kelurahan ➔ Dusun ➔ RT/RW ➔ Jalan ➔ Kode Pos) via server-side API `/api/v1/wilayah`.
* Tersimpan di tabel `master_provinsi`, `master_kabupaten`, `master_kecamatan`, `master_desa` dengan toleransi **offline fallback** sehingga aplikasi tetap berjalan meskipun API luar tidak dapat diakses.
* Pembentukan otomatis kolom **`alamat_lengkap`** terformat resmi.

### 4. Struktur Menu & Role-Based Access Control (RBAC 7-Role)
Navigasi dikelompokkan secara konsisten ke dalam 4 kategori utama:
- 📊 **DASHBOARD**: Overview Dashboard dinamis per role.
- 🏛️ **DATABASE PONDOK**: Data Santri & Wali, Data Asrama & Pembina, Data Pengurus, Data Pengajar, Alumni.
- 🛡️ **KEAMANAN**: Perizinan Santri, Pelanggaran & Kedisiplinan.
- ⚙️ **SISTEM & UTILITAS**: Arsip Historis, Tahun Ajaran, Manajemen Akun, Audit Log & Recycle Bin, Panduan & SOP, Konfigurasi Sistem.

---

## 👥 Matriks Role & Hak Akses (RBAC Matrix)

| Role Pengguna | Modul Utama | Scope & Ketentuan Akses |
|---|---|---|
| 🏛️ **Sekretariat Pondok** | `/admin/*` | Administrator Utama. Akses penuh ke seluruh menu (Dashboard, Database Pondok, Keamanan, Sistem & Utilitas). |
| 📚 **Sekretariat Madrasah** | `/admin/*` | Admin Akademik Madrasah Diniyah. Data santri read-only, tanpa akses ke Konfigurasi Pondok. |
| 🏫 **Sekretariat MI** | `/admin/*` | Admin Operasional MI Formal. Data santri read-only, tanpa menu Nilai Akademik MI. |
| 🛡️ **Keamanan** | `/admin/surat`, `/admin/pelanggaran` | Akses khusus Perizinan, Pelanggaran, & SOP. Tanpa akses ke biodata/akademik santri. |
| 👨‍🏫 **Mustahiq / Munawwib** | `/guru_madrasah/*` | Guru Diniyah: Mustahiq (Wali Kelas) & Munawwib. Input Nilai, Absensi Santri, Jadwal, QR Presensi. |
| 🏫 **Guru MI** | `/guru_mi/*` | Presensi Guru MI via Dynamic QR Code & Jadwal Mengajar (Tanpa Menu Nilai). |
| 👨‍👩‍👧 **Wali Santri** | `/wali_santri/*` | Read-only informasi santri, akademik, perizinan, pelanggaran, pengumuman (Multi-Santri NIK Link). |

---

## 🛠️ Standar Tombol Aksi & UI

* **Data Grid Tabel**: `🔍 Detail`, `✏️ Edit`, `🗑️ Soft Delete` (ke Recycle Bin), `📜 Riwayat` (Audit Log), `🎓 Penempatan`, `⚡ Aktifkan/Nonaktifkan`, `📦 Arsip`.
* **Toolbar Actions**: `➕ Tambah Data`, `📥 Import`, `📊 Export`, `🖨️ Cetak`, `🔄 Sync`.
* **Form Actions**: `💾 Simpan`, `➕ Simpan & Tambah Baru`, `✅ Simpan & Tutup`, `🔄 Reset`, `❌ Batal`, `← Kembali`.
* **Mobile Friendly**: Touch-friendly button sizes & Mobile Bottom Navigation Bar.

---

## 📂 Struktur Folder Proyek

```text
darsa_enterprise/
├── docs/                      # Dokumentasi Spesifikasi Resmi & ADR
├── apps/
│   └── web/                   # Next.js 15 Web Application (App Router)
│       └── src/
│           ├── app/
│           │   ├── admin/             # Master Santri, Asrama, Pengurus, Guru, Alumni, Surat, Pelanggaran, Akun, Audit Log, SOP, Konfigurasi
│           │   ├── guru_madrasah/     # Portal Guru Diniyah (Mustahiq & Munawwib)
│           │   ├── guru_mi/           # Portal Presensi Guru MI
│           │   ├── wali_santri/       # Portal Wali Santri Multi-Santri
│           │   └── api/v1/            # Simulation & Wilayah API Routes
│           └── components/            # RegionSelector, TableActions, DesktopOnlyGuard, MobileBottomNav
└── packages/
    └── database/              # Prisma Schema (Master Wilayah, Santri, PenempatanPendidikan) + Simulation Database Store
```

---

## 🚀 Cara Menjalankan Aplikasi

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma Client
cd packages/database
npx prisma generate

# 3. Jalankan Server Development
cd ../../apps/web
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🎭 Akun Demo Login (RBAC Live Mode)

| Role Pengguna | Email Login | Password | Scope / Instansi |
|---|---|---|---|
| 🏛️ **Sekretariat Pondok** | `admin@darsa.id` | `admin123` | Master Single Source of Truth |
| 📚 **Sekretariat Madrasah** | `sek.madrasah@darsa.id` | `admin123` | Akademik Diniyah |
| 🏫 **Sekretariat MI** | `sek.mi@darsa.id` | `admin123` | Operasional MI |
| 🛡️ **Keamanan** | `keamanan@darsa.id` | `admin123` | Perizinan & Pelanggaran |
| 👨‍🏫 **Guru Madrasah** | `guru@darsa.id` | `guru123` | Mustahiq & Munawwib |
| 🏫 **Guru MI** | `guru.mi@darsa.id` | `guru123` | Guru MI Formal |
| 👨‍👩‍👧 **Wali Santri** | `wali@darsa.id` | `wali123` | Multi-Santri NIK Link |
