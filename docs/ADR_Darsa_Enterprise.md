# Dokumen Arsitektur Darsa Enterprise (Architecture Decision Record / ADR)

**Status:** Approved / Architecture Standard  
**Versi:** 1.0.0  
**Tanggal:** 2 Agustus 2026  
**Sistem:** Platform Manajemen Sistem Informasi Terpadu Enterprise Pendidikan Islam  

---

## 1. Visi Produk (Product Vision)

**Darsa Enterprise** adalah platform sistem informasi manajemen terpadu berkelas enterprise yang dirancang khusus untuk institusi pendidikan Islam (Pondok Pesantren, Madrasah, dan Madrasah Ibtidaiyah/MI). 

### Pilar utama platform:
1. **Keamanan Enterprise-Grade:** Menggunakan standar autentikasi modern (Better Auth, Passkeys/WebAuthn, Google OAuth 2.1 PKCE) dan audit log lengkap.
2. **Kinerja Tinggi & Scalability:** Dibangun di atas arsitektur Serverless (Next.js 16, Neon PostgreSQL, Cloudinary, Upstash Redis).
3. **Pengalaman Multi-Platform Seamless:** Akses seragam dari Web (`.darsa.id`), Mobile (Android/iOS via Capacitor), dan Desktop (Windows via Wails v3).
4. **Presensi Presisi Tinggi:** Menggabungkan Dinamik QR Code (Redis TOTP) dengan Geofencing GPS Google Maps.
5. **Ekosistem Modular & Multi-Tenant (SaaS Ready):** Terstruktur rapi dari versi v1.0 hingga v3.0 untuk mendukung ekspansi multi-pondok dan multi-madrasah.

---

## 2. Struktur Monorepo (Monorepo Structure)

Pengembangan menggunakan arsitektur **Monorepo** berbasis **Turborepo** dan **pnpm workspaces** untuk efisiensi berbagi kode (*code sharing*) antar platform Web, Mobile, dan Desktop.

```text
darsa-enterprise/
├── apps/
│   ├── web/                    # Next.js 16 (App Router) - Web Apps (app, admin, api, docs)
│   ├── mobile/                 # Capacitor wrapper untuk Cross-Platform Mobile (Android/iOS)
│   └── desktop/                # Wails v3 (Go Backend + Web Frontend) untuk Desktop Windows
│
├── packages/
│   ├── auth/                   # Shared Better Auth configuration, sessions, WebAuthn & OAuth handlers
│   ├── ui/                     # Design System: Tailwind CSS v4, shadcn/ui, Motion primitives, custom UI
│   ├── database/               # Prisma Schema, Neon PostgreSQL client, Seeders & Migrations
│   ├── config/                 # Shared Configurations (ESLint, tsconfig, Tailwind, Prettier)
│   ├── types/                  # Shared TypeScript types, DTOs, API Interfaces, Enums
│   ├── sdk/                    # API Client SDK untuk Wails & Capacitor
│   └── utils/                  # Shared Utility Functions (date-fns, validators, crypto, formatters)
│
├── docs/                       # Dokumentasi Arsitektur, ADR, API Specs, User Manual
├── .github/                    # GitHub Actions Workflows (CI/CD, Build, Release)
└── scripts/                    # Development scripts, database seeds, asset generators
```

---

## 3. Standar Penamaan Tabel dan API (Naming & API Standards)

### A. Standar Database & Prisma
- **Nama Tabel:** Menggunakan `snake_case` bentuk jamak (*plural*) dalam bahasa Indonesia/Inggris standar.  
  *Contoh:* `users`, `guru`, `santri`, `absensi_logs`, `audit_logs`.
- **Nama Kolom:** Menggunakan `snake_case`.  
  *Contoh:* `created_at`, `updated_at`, `deleted_at`, `wali_id`, `pondok_id`.
- **Primary Key:** `UUID v4` (`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`).
- **Foreign Key:** `nama_tabel_id` (Singular).  
  *Contoh:* `santri_id`, `guru_id`, `kelas_id`.
- **Soft Delete:** Kolom `deleted_at Timestamp?` digunakan untuk data sensitif agar dapat direcover jika diperlukan.

### B. Standar RESTful API Endpoints
- **Base URL:** `https://api.darsa.id/v1`
- **Konvensi Path:** Plural, lowercase, pemisah tanda hubung (*kebab-case*).  
  *Contoh:* `/v1/santri`, `/v1/absensi-logs`, `/v1/pondok/{id}/madrasah`.
- **HTTP Methods:**
  - `GET`: Membaca data
  - `POST`: Membuat data baru
  - `PUT / PATCH`: Memperbarui data secara penuh / parsial
  - `DELETE`: Menghapus data (soft/hard delete)

### C. Standardized API Response Payload
```json
// HTTP 200 / 201 - Success Response
{
  "success": true,
  "message": "Data santri berhasil diambil",
  "data": {
    "id": "c7b3a9e0-8f12-4e56-9a2b-3c4d5e6f7a8b",
    "nisn": "0012345678",
    "nama_lengkap": "Ahmad Fauzi",
    "kelas": "10-A"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  },
  "errors": null
}

// HTTP 400 / 422 - Error Response
{
  "success": false,
  "message": "Validasi lokasi presensi gagal",
  "data": null,
  "errors": [
    {
      "field": "gps_latitude",
      "message": "Posisi Anda berada di luar radius presensi yang diizinkan (250m dari lokasi sekolah)"
    }
  ]
}
```

---

## 4. Standar UI/UX (UI/UX Standards)

### A. Design System Stack
- **Framework UI:** Tailwind CSS v4 + **shadcn/ui** (Accessible, headless UI components).
- **Animasi:** **Motion** (Framer Motion) untuk transisi halaman dan micro-interactions.
- **Tipografi:** Google Fonts `Plus Jakarta Sans` / `Inter` (Teks Latin UI) & `Amiri` (Opsional untuk teks Arab/Pesantren).

### B. Color Palette & Dark Mode Standard
- **Primary / Brand:** Emerald & Teal Deep Tones (Menyenangkan, modern, bernuansa Islami Enterprise).
- **Neutral:** Slate / Zinc Neutral Grays.
- **Accent & Feedback:**
  - Success: Emerald Green (`#10b981`)
  - Warning: Amber Gold (`#f59e0b`)
  - Destructive: Rose Red (`#f43f5e`)
  - Info: Sky Blue (`#0284c7`)
- **Visual Styles:** Glassmorphism pada header/overlay, subtle card borders, shadow elevation halus, tanpa warna polos/generik.

### C. Aksesibilitas & Responsivitas
- Memenuhi standar **WCAG 2.1 AA** (kontras tinggi, dukungan keyboard navigation, ARIA attributes).
- Desktop-first untuk modul Admin/Keuangan, Mobile-first untuk Absensi/Portal Wali.

---

## 5. Hak Akses (Role & Permission - RBAC & ABAC)

Sistem hak akses menggunakan kombinasi **Role-Based Access Control (RBAC)** dan **Attribute-Based Access Control (ABAC)** (misalnya scope berdasarkan `pondok_id` atau `madrasah_id`).

### Matriks Peran (Role Matrix):

| Peran (Role) | Ruang Lingkup (Scope) | Deskripsi Hak Akses |
| :--- | :--- | :--- |
| **Super Admin** | Platform Level | Akses penuh seluruh tenant/pondok, konfigurasi global SaaS (v3.0). |
| **Admin Instansi** | Pondok / Sekolah Level | Kelola pengguna instansi, master data, pengaturan modul, audit log. |
| **Guru / Ustadz** | Akademik & Kelas | Input nilai, kelola absensi santri, buat jadwal, pengajuan izin. |
| **Pegawai / Staf** | Operasional | Kelola inventaris, kepegawaian, pengarsipan surat. |
| **Bendahara** | Keuangan | Pengaturan tagihan, verifikasi pembayaran, laporan keuangan. |
| **Santri / Siswa** | Personal | Lihat jadwal, riwayat absensi, nilai/rapor, status tagihan. |
| **Wali Santri** | Personal (Anak Wali) | Monitor absensi real-time, cetak rapor, bayar tagihan, notifikasi FCM. |

---

## 6. Struktur Database (Neon PostgreSQL Modules)

Sistem database dirancang modular dengan skema yang saling terintegrasi:

```text
Neon PostgreSQL Schema
├── 1. Core & Auth
│   ├── users
│   ├── accounts
│   ├── sessions
│   ├── verification_tokens
│   ├── passkey_credentials
│   ├── roles
│   ├── permissions
│   └── user_roles
│
├── 2. Kelembagaan (Pondok / Madrasah / MI)
│   ├── pondok
│   ├── madrasah
│   ├── mi
│   ├── tahun_ajaran
│   ├── semester
│   └── kelas
│
├── 3. Civitas & Kepegawaian
│   ├── guru
│   ├── pegawai
│   ├── santri
│   ├── wali_santri
│   └── hubungan_wali
│
├── 4. Presensi & Geofencing
│   ├── lokasi_presensi (GPS Center & Radius)
│   ├── qr_sessions (TOTP Token)
│   └── absensi_logs
│
├── 5. Akademik & Kurikulum
│   ├── mata_pelajaran
│   ├── jadwal_pelajaran
│   ├── nilai_komponen
│   ├── nilai_santri
│   └── rapor_santri
│
├── 6. Operasional & Keuangan
│   ├── tagihan
│   ├── pembayaran
│   ├── inventaris_barang
│   └── surat_keluar_masuk
│
└── 7. Audit & Keamanan
    └── audit_logs (Payload JSON, IP, User Agent, Action)
```

---

## 7. Alur Autentikasi (Authentication Flow)

Diselenggarakan oleh **Better Auth** dengan dukungan multi-penyedia login:

```text
[ User Login Choice ]
        │
        ├──► Google OAuth 2.1 (PKCE) ───────┐
        ├──► Email + Password (Argon2id) ───┼──► Better Auth Server ──► Generate Session Token
        └──► Passkeys / WebAuthn ───────────┘         │
             (Fingerprint / Face ID)                  │
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │ Session Token Storage       │
                                       ├─────────────────────────────┤
                                       │ Web: HttpOnly Cookie        │
                                       │ Mobile: Encrypted Storage   │
                                       │ Desktop: OS Keychain        │
                                       └─────────────────────────────┘
```

1. **Web:** Token disimpan dalam `SameSite=Strict HttpOnly Secure Cookie`.
2. **Mobile (Capacitor):** Token disimpan dalam **Capacitor Secure Storage** (`EncryptedSharedPreferences` di Android, `Keychain` di iOS).
3. **Desktop (Wails v3):** Browser OAuth Flow untuk authentication, kemudian credential disimpan di Secure OS Store.
4. **Audit Trail:** Setiap aktivitas login berhasil atau gagal dicatat dalam `audit_logs` beserta IP, koordinat (opsional), dan Device User-Agent.

---

## 8. Alur Absensi GPS + QR Code

Sistem presensi menjamin validitas lokasi dan mencegah kecurangan presensi jarak jauh atau pemalsuan QR Code.

```text
[ Admin / Guru Display ]                [ Santri / Guru App ]
      │                                         │
Generasi Dynamic QR (Redis TOTP)                │
Refresh tiap 5-10 detik                         │
      │                                         │
      ▼                                         ▼
Tampilkan QR Code ───────────────────► Scan QR Code via App
                                                │
                                       Ambil Koordinat GPS Device
                                                │
                                                ▼
                                   Kirim Payload ke Server API:
                                   (QR Token + Lat/Lng + Device ID)
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │ Validasi Server:      │
                                    │ 1. QR Token Valid?    │
                                    │ 2. Radius <= N Metres │
                                    │    (Haversine Formula)│
                                    └───────────┬───────────┘
                                                │
                                       ┌────────┴────────┐
                                       ▼                 ▼
                                    [ Valid ]       [ Gagal ]
                                       │                 │
                               Simpan AbsensiLog    Tolak Presensi
                                       │
                               Emit FCM Notif
                               ke Wali Santri
```

---

## 9. Standar Deployment & Infrastruktur

| Layanan | Komponen | Peran & Pengaturan |
| :--- | :--- | :--- |
| **Vercel** | Hosting Web Apps | Split Project (`app.darsa.id`, `admin.darsa.id`, `api.darsa.id`, `docs.darsa.id`) untuk isolasi env vars & deployment. |
| **Neon PostgreSQL** | Database Serverless | Connection pooling (`pgbouncer`), auto-scaling, database branching untuk staging/prod. |
| **Cloudinary** | Asset & Media Storage | Folder terstruktur (`guru/`, `santri/`, `dokumen/`, `logo/`, `rapor/`, `surat/`, `qr/`). Auto-optimization format WebP & PDF preview. |
| **Upstash Redis** | Cache & Realtime | Redis Serverless untuk TOTP QR Code, Rate Limiting API, FCM Token Cache. |
| **Firebase FCM** | Push Notification | Notifikasi presensi, tagihan, dan pengumuman real-time ke aplikasi Mobile Android & iOS. |
| **Google Maps** | Maps & Geolocation | Static Maps API, Geocoding, & Geofencing Validation. |
| **GitHub Actions** | CI/CD Pipeline | Automated Linting, Typecheck, Unit Test, Database Migration, Build & Deploy Web ke Vercel & Release Binary Desktop ke GitHub Releases. |

---

## 10. Roadmap Modul (Version Roadmap)

```text
   ┌──────────────────────────┐
   │    Darsa Enterprise      │
   │        v1.0              │
   └────────────┬─────────────┘
                │  - Login (OAuth, Email, Passkey) & Hak Akses (RBAC)
                │  - Master Data (Pondok, Madrasah, MI, Guru, Santri, Kelas)
                │  - Absensi Dynamic QR + GPS Geofencing
                │  - Dashboard Admin Utama
                ▼
   ┌──────────────────────────┐
   │          v1.5            │
   └────────────┬─────────────┘
                │  - Modul Penilaian & Cetak Rapor Digital
                │  - Pengaturan Jadwal Pelajaran
                │  - Persuratan Digital & Template Surat
                │  - Manajemen Inventaris Sekolah/Pondok
                ▼
   ┌──────────────────────────┐
   │          v2.0            │
   └────────────┬─────────────┘
                │  - Modul Keuangan (Tagihan, SPP, Payment Gateway)
                │  - Portal Wali Santri & Push Notification FCM
                │  - Release Mobile Native (Android & iOS via Capacitor)
                │  - Release Desktop Native (Windows via Wails v3)
                ▼
   ┌──────────────────────────┐
   │          v3.0            │
   └──────────────────────────┘
                   - Support Multi-Tenant Enterprise (SaaS Model)
                   - Multi-Pondok, Multi-Madrasah, Multi-MI
                   - Custom Subdomain / Domain Routing (`tenant.darsa.id`)
                   - Super Admin Cross-Tenant Analytics
```

---

## 11. Spesifikasi Detail Modul Lanjutan (Detailed Module Specifications)

### A. Modul Penilaian & Cetak Rapor Digital (v1.5)
- **Formula Penilaian:**  
  Nilai Akhir Mata Pelajaran dihitung dengan formula terbobot yang fleksibel per instansi:  
  $$\text{Nilai Akhir} = (N_{\text{Harian}} \times 30\%) + (N_{\text{UTS}} \times 30\%) + (N_{\text{UAS}} \times 40\%)$$
- **Standar Kurikulum:** Mendukung Kurikulum Merdeka, Kurikulum Kemenag (Madrasah), dan Kurikulum Khas Pesantren (Kitab Kuning / Tahfizh).
- **Output Rapor:** Multi-halaman PDF yang dirender secara server-side via Next.js @react-pdf/renderer dengan Watermark Keamanan & QR Code Verifikasi Keaslian Rapor.

### B. Modul Persuratan & Inventaris (v1.5)
- **Surat Digital:** Dynamic template generator (Surat Keterangan Santri, Surat Izin Pulang, Surat Undangan Wali) dengan penomoran otomatis terstruktur (`/SURAT/{KODE_INSTANSI}/{TAHUN}/{NO_URUT}`).
- **Verifikasi Surat:** Setiap dokumen PDF dilengkapi dengan QR Code berisikan SHA-256 Hash Signature untuk mencegah pemalsuan dokumen fisik.
- **Inventaris Tagging:** Pelabelan aset fisik sekolah/pondok berbasis QR Code untuk memudahkan *stock opname* via aplikasi Mobile scan.

### C. Modul Keuangan & Payment Gateway (v2.0)
- **Manajemen Tagihan:** Penagihan otomatis SPP bulanan, uang gedung, seragam, dan kegiatan santri dengan mekanisme status `UNPAID`, `PARTIAL`, `PAID`, `EXPIRED`.
- **Integrasi Payment Gateway:** Mendukung Snap Midtrans / Xendit via Webhook Async Verification.
- **Keamanan Webhook:** Wajib menggunakan HMAC SHA256 Signature Header Validation & Rekonsiliasi Idempotency Key untuk mencegah *double payment processing*.
- **Portal Keuangan Wali:** Pembayaran serba instan via QRIS, Virtual Account (BCA, Mandiri, BRI, BNI, BSI), serta E-Wallet.

---

## 12. Arsitektur Multi-Tenancy & Dynamic Domain Routing (v3.0 SaaS Architecture)

### A. Strategi Isolasi Data (Database Multi-Tenancy)
- **Shared Database, Separate Schemas / Row-Level Security (RLS):** Menggunakan kolom `pondok_id` (Tenant Identifier) pada setiap tabel operasional di Neon PostgreSQL.
- **Middleware Scope Enforcement:** Semua API Query wajib menyertakan filter `pondok_id` yang divalidasi dari Session Token pengguna untuk menjamin tidak terjadinya kebocoran data antar-tenant (*cross-tenant data breach*).

### B. Dynamic Subdomain & Custom Domain Routing
- **Subdomain Routing:** Routing otomatis berdasarkan hostname request via Next.js Middleware:
  - `admin.darsa.id` ➔ Platform Admin Global & SaaS Management
  - `[tenant].darsa.id` ➔ Portal Instansi Specific (contoh: `alhikmah.darsa.id`)
- **Custom Domain Support:** Integrasi Vercel Domains API untuk mendukung domain kustom instansi (contoh: `siakad.pesantrenalhikmah.sch.id`).

```text
[ Client Request: alhikmah.darsa.id ]
                 │
                 ▼
     [ Vercel Edge / Next.js Middleware ]
                 │
                 ├── Extract Subdomain: "alhikmah"
                 ├── Lookup Tenant Context in Redis Cache
                 └── Inject `x-tenant-id` into Request Headers
                 │
                 ▼
    [ Next.js API Routes / App Router ]
                 │
                 ▼
    [ Neon PostgreSQL Query with RLS ]
    WHERE pondok_id = 'tenant_alhikmah_uuid'
```

---

## 13. Keamanan, Kepatuhan & Disaster Recovery (Security & DR)

### A. Rate Limiting & Bot Protection
- **Upstash Redis Sliding Window Algorithm:**
  - Public & Static API: Max 120 req / minute per IP.
  - Auth Endpoints (`/api/auth/*`): Max 15 req / minute per IP (Mencegah brute force).
  - Absensi Scan Endpoint (`/api/v1/absensi/scan`): Max 6 req / minute per user ID (Mencegah spamming scan).

### B. Proteksi & Enkripsi Data
- **Transport Security:** Wajib TLS 1.3 HTTPS untuk semua endpoint API.
- **Data-at-Rest Encryption:** Enkripsi PostgreSQL bawaan Neon DB (AES-256).
- **PII Data Encryption:** Data sensitif seperti NIK, Nomor Rekening, dan Telepon dienkripsi di level aplikasi menggunakan `AES-256-GCM` sebelum disimpan ke database.

### C. Backup & Disaster Recovery (DR) Strategy
- **Point-in-Time Restore (PITR):** Neon Automatic WAL Archiving dengan kemampuan pemulihan data ke detik manapun hingga 30 hari ke belakang.
- **Off-site Backup:** Daily Automated Database Dump (`pg_dump`) yang terenkripsi dan diunggah ke Google Cloud Storage (GCS) Bucket terisolasi.

---

## 14. Standar Penanganan Error & Kode Status (Standardized Error Codes)

Semua error yang dikembalikan oleh API wajib menggunakan struktur standar dengan kode error aplikasi yang terprediksi:

| Kategori Error | Kode Error (Application Code) | HTTP Status | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Autentikasi** | `ERR_AUTH_UNAUTHORIZED` | 401 | User belum login atau session expired |
| | `ERR_AUTH_INVALID_CREDENTIALS` | 400 | Email / password / passkey salah |
| **Otorisasi** | `ERR_PERM_DENIED` | 403 | Peran user tidak memiliki izin akses |
| | `ERR_PERM_TENANT_MISMATCH` | 403 | User mencoba mengakses tenant lain |
| **Presensi** | `ERR_PRESENSI_OUT_OF_BOUNDS` | 422 | Posisi GPS di luar radius geofence |
| | `ERR_PRESENSI_QR_EXPIRED` | 400 | Token QR TOTP sudah kadaluarsa |
| | `ERR_PRESENSI_DUPLICATE` | 409 | Presensi sudah tercatat untuk sesi ini |
| **Validasi** | `ERR_VALIDATION_FAILED` | 422 | Format input Zod schema tidak valid |
| **Sistem** | `ERR_SERVER_DATABASE` | 500 | Kegagalan koneksi / query database |
| | `ERR_SERVER_THIRD_PARTY` | 502 | Kegagalan respon dari Cloudinary/FCM/Payment Gateway |

---

## 15. Observabilitas, Monitoring & Logging

### A. Centralized Logging Trait
- **Structured JSON Logging:** Menggunakan logger terstruktur (`pino`) untuk mencatat log aplikasi dalam format JSON agar mudah diurai oleh log aggregator.
- **Audit Logging Layer:** Setiap operasi mutating data (`CREATE`, `UPDATE`, `DELETE`) dan aktivitas keamanan wajib memanggil fungsi `auditLog()` untuk mencatat event di tabel `audit_logs`.

### B. Error Tracking & Application Performance Monitoring (APM)
- **Sentry Integration:** Pelaporan uncaught exceptions real-time pada Next.js Web, Mobile (Capacitor), dan Desktop (Wails v3).
- **Health Check Endpoints:**
  - `GET /api/health` ➔ Status umum server
  - `GET /api/ready` ➔ Cek konektivitas Neon DB, Upstash Redis, & Cloudinary API.

---

## 16. Strategi Testing & Penjaminan Kualitas (QA Standards)

Untuk menjamin keandalan sistem enterprise, alur kerja CI/CD menjalankan pengujian otomatis secara bertahap:

1. **Unit Testing (Vitest):** Pengujian fungsi utilitas di `@darsa/utils`, kalkulasi geofencing Haversine, validasi token TOTP, dan modul SDK `@darsa/sdk`.
2. **Integration & API Testing (Vitest + Supertest):** Pengujian endpoint API Next.js Route Handlers dengan database Neon PostgreSQL Staging/Test Branch.
3. **End-to-End (E2E) Testing (Playwright):** Pengujian skenario utama antarmuka pengguna:
   - Alur Login (Email, Google OAuth, Passkey)
   - Alur Dashboard Admin Instansi & Pengelolaan Santri
   - Alur Presensi Dynamic QR Code
4. **Static Code Analysis:** ESLint v9, TypeScript Strict Mode (`tsc --noEmit`), dan Prettier Formatting.

---

## 17. Kesimpulan & Penutup

Dokumen Architecture Decision Record (ADR) ini menjadi acuan tunggal (*single source of truth*) dalam pengembangan platform **Darsa Enterprise**. Semua kontribusi kode, pembuatan tabel database, pembuatan API endpoint, serta perancangan antarmuka pengguna wajib mematuhi standar yang telah disepakati dalam dokumen ini. Dokumen ini bersifat dinamis dan dapat diperbarui seiring perkembangan skala dan kebutuhan sistem.
