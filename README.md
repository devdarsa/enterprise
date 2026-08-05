# 🕌 Darsa Enterprise

**Sistem Informasi Terpadu Enterprise Pendidikan Islam**  
Ma'had Darussa'adah Lirboyo Kota Kediri

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

---

## 🏛️ Ketentuan & Prinsip Arsitektur Utama

### 1. Database Centric (Zero Hardcoded Data)
* Seluruh data dalam Darsa Enterprise **bermuara pada Database** (`simulationDb` / Prisma).
* **Tidak ada data hardcode** di dalam kode program, baik data pengguna, data master, konfigurasi operasional, maupun transaksi.
* Seluruh data dibuat, diubah, dihapus, dan disajikan secara **live / real-time**.

### 2. Single Source of Truth (SSOT) Pondok Pesantren
* **Pondok Pesantren** merupakan **Master Database (Single Source of Truth)** seluruh Siswa/Siswi.
* Menggunakan **NISP (Nomor Induk Santri Pondok / Stambuk)** sebagai identitas utama unik.
* Perubahan biodata siswa hanya diizinkan melalui modul Pondok Pesantren.
* Modul **Madrasah Diniyah** dan **MI Formal** hanya melakukan **pemanggilan (import/referensi)** data dari Database Pondok via NISP tanpa membuat data siswa baru.

### 3. Penyambungan Akun Wali Santri via NIK Orang Tua
* Akun Wali Santri terhubung otomatis dengan data santri menggunakan **NIK Kependudukan (`nik_wali`)** orang tua/wali di Database Pondok.
* **Support Multi-Santri**: 1 Akun Wali Santri yang memiliki NIK sama dapat terhubung otomatis dengan 1 atau lebih santri (saudara/kakak-adik) dengan sakelar tab santri di portal.

### 4. Interface Berdasarkan Role (Role-Based Interface)
* **🖥️ Sekretariat (Desktop-Only Guard)**: Halaman administrasi (`/admin/*` & `/sekretariat/*`) khusus untuk perangkat berlayar besar ($\ge 1024\text{px}$). Akses dari smartphone diblokir otomatis demi integritas data.
* **📱 Guru, Pengasuh, & Wali Santri (Mobile-First)**: Menggunakan antarmuka Native App dengan **Bottom Navigation Bar** (Beranda, QR Code, Absensi, Informasi, Akun) yang ramah penggunaan satu tangan.

### 5. QR Code Khusus Absensi Guru
* Fitur scan QR Code **hanya digunakan sebagai media presensi kehadiran Guru** (Guru Madrasah & Guru MI) untuk Absensi Masuk dan Pulang.
* Fitur QR Code **TIDAK** digunakan oleh Wali Santri, Sekretariat, Pengasuh, maupun Santri.
* Setiap scan mencatat `guru_id`, `nama_guru`, `unit_guru`, `timestamp`, dan geofencing radius (200m) ke database.

---

## 👥 Hak Akses Role Pengguna

| Role Pengguna | Akses Modul | Navigasi UI | Deskripsi Hak Akses |
|---|---|---|---|
| 🏛️ **Sekretariat** | `/admin/*`, `/sekretariat/*` | Desktop Sidebar | Administrasi Master Data Pondok, Madrasah, MI, Asrama, Pengumuman, Surat, Jadwal |
| 👳 **Pengasuh** | `/pengasuh/*` | Mobile Bottom Nav | Monitoring Pesantren, Hafalan Tahfidz, & Kebijakan |
| 👨‍🏫 **Guru Madrasah** | `/guru_madrasah/*` | Mobile Bottom Nav | Dual Mode: Mustahiq (Wali Kelas) & Munawwib (Input Nilai Diniyah) + Scan QR Presensi |
| 🏫 **Guru MI** | `/guru_mi/*` | Mobile Bottom Nav | Presensi Guru MI via Scan QR Code & Jadwal Mengajar (Tanpa Input Nilai) |
| 👨‍👩‍👧 **Wali Santri** | `/wali_santri/*` | Mobile Bottom Nav | Read-only informasi nilai, presensi, pengumuman, & Pengajuan Izin Santri Online |

---

## 📂 Struktur Folder Proyek

```text
users/
├── sekretariat/       # Administrasi Pondok, Madrasah, & MI (Desktop Only)
├── wali_santri/       # Portal Informasi Wali Santri (Mobile First)
├── guru_madrasah/     # Portal Mustahiq & Munawwib (Mobile First)
├── guru_mi/           # Portal Presensi Guru MI (Mobile First)
└── shared/            # Utility & Shared Components
```

---

## 🏗️ Struktur Monorepo

```text
darsa_enterprise/
├── apps/
│   └── web/               # Next.js 15 Web Application (App Router)
│       ├── public/        # Manifest.json PWA & Static Assets
│       └── src/
│           ├── app/
│           │   ├── admin/             # Master Santri, Asrama, Guru, Pengumuman, Surat
│           │   ├── guru_madrasah/     # Portal Guru Madrasah (Mustahiq & Munawwib)
│           │   ├── guru_mi/           # Portal Presensi Guru MI
│           │   ├── wali_santri/       # Portal Wali Santri & Pengajuan Izin
│           │   └── api/v1/            # Real-Time Simulation API Routes
│           └── components/            # DesktopOnlyGuard, MobileBottomNav, Modal, Toast
├── packages/
│   ├── database/          # Prisma Schema + Simulation Database Engine Store
│   ├── types/             # TypeScript Shared Types
│   ├── ui/                # Shared UI Tokens
│   └── utils/             # Haversine Distance & Response Utilities
└── scripts/
    └── seed.ts            # Database Seeder
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

## 🎭 Akun Demo Login (Live Simulation Mode)

| Role Pengguna | Username / Email | Password | Direct Portal |
|---|---|---|---|
| 🏛️ **Sekretariat** | `admin@darsa.id` | `admin123` | `/admin/dashboard` |
| 👨‍🏫 **Guru Madrasah** | `guru@darsa.id` | `guru123` | `/guru_madrasah/dashboard` |
| 🏫 **Guru MI** | `gurumi@darsa.id` | `guru123` | `/guru_mi/dashboard` |
| 👨‍👩‍👧 **Wali Santri** | `wali@darsa.id` | `wali123` | `/wali_santri/dashboard` |
