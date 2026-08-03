# 🕌 Darsa Enterprise

**Sistem Informasi Terpadu Enterprise Pendidikan Islam**  
Ma'had Darussa'adah Lirboyo Kota Kediri

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange?logo=pnpm)](https://pnpm.io)

---

## 🏛️ Tentang Sistem

**Darsa Enterprise** adalah platform enterprise terintegrasi yang dirancang khusus untuk mengelola tiga instansi utama dalam naungan Ma'had Darussa'adah Lirboyo:

| Instansi | Keterangan |
|---|---|
| 🕌 **Pondok Pesantren** | Source of Truth — Master data santri, ustadz, keuangan SPP |
| 📚 **Madrasah Diniyah** | Sinkronisasi dari Pondok — jadwal kitab kuning, rapor diniyah |
| 🏫 **Madrasah Ibtida'iyyah (MI)** | Sinkronisasi — kurikulum formal, inventaris, rapor MI |

---

## ✨ Fitur Utama

- 🔐 **Multi-Auth** — Email/Password, Google OAuth 2.1, WebAuthn Passkeys (Biometrik)
- 📍 **Presensi GPS Geofencing** — Dynamic TOTP QR Code + Haversine radius validation
- 👥 **6 Role Hierarki** — Super Admin, Admin Instansi, Guru, Bendahara, Santri, Wali Santri
- 🏛️ **Menu Isolasi Per Instansi** — Menu antar instansi tidak boleh bercampur
- 📅 **Jadwal KBM** — Grid mingguan + list view, CRUD, color-coded per jenis
- 📦 **Inventaris Aset** — Full CRUD dengan summary nilai total aset
- 💳 **Keuangan SPP** — Payment gateway (BCA/Mandiri/QRIS)
- 📜 **Rapor Digital PDF** — Laporan hasil belajar & tahfidz
- 🔔 **Notifikasi Premium** — Toast slide-in, modal glassmorphism, loading orbital
- 📱 **Responsive** — Mobile-first dengan hamburger sidebar

---

## 🏗️ Arsitektur Monorepo

```
darsa_enterprise/
├── apps/
│   └── web/               # Next.js 15 Web Application
│       ├── src/
│       │   ├── app/       # App Router pages & API routes
│       │   │   ├── admin/     # Dashboard, Santri, Guru, Keuangan, dst.
│       │   │   ├── guru/      # Portal Guru & Ustadz
│       │   │   ├── wali/      # Portal Wali Santri
│       │   │   ├── santri/    # Portal Santri Mandiri
│       │   │   └── super-admin/  # SaaS Multi-Tenant Control
│       │   ├── components/    # Modal, Toast, Loading, SearchBar
│       │   └── middleware.ts  # Auth route guard
│       └── next.config.ts
├── packages/
│   ├── database/          # Prisma Schema + Simulation DB Engine
│   ├── auth/              # Better Auth Configuration
│   ├── types/             # Shared TypeScript types
│   ├── ui/                # Shared UI components
│   └── utils/             # Shared utilities
└── turbo.json             # Turborepo pipeline
```

---

## 🚀 Cara Menjalankan (Development)

### Prasyarat
- Node.js `>= 20.0.0`
- pnpm `>= 9.0.0`

```bash
# 1. Clone repository
git clone https://github.com/devdarsa/enterprise.git
cd enterprise

# 2. Install semua dependencies
pnpm install

# 3. Salin file environment
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local sesuai konfigurasi Anda

# 4. Jalankan development server
pnpm --filter @darsa/web dev -- -p 3005
```

Buka [http://localhost:3005](http://localhost:3005)

---

## 🎭 Akun Demo (Simulation Mode)

| Email | Password | Role | Redirect |
|---|---|---|---|
| `admin@darsa.id` | `admin123` | Admin Instansi | `/admin/dashboard` |
| `guru@darsa.id` | `guru123` | Guru / Ustadz | `/guru/dashboard` |
| `wali@darsa.id` | `wali123` | Wali Santri | `/wali/dashboard` |
| `santri@darsa.id` | `santri123` | Santri | `/santri/dashboard` |
| `bendahara@darsa.id` | `bendahara123` | Bendahara | `/admin/keuangan` |
| `super@darsa.id` | `super123` | Super Admin | `/super-admin/dashboard` |

> ⚠️ Akun ini hanya untuk simulasi/demo. Ganti dengan autentikasi nyata di produksi.

---

## 🌐 Deployment ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy (dari root folder)
vercel --cwd apps/web
```

**Environment Variables yang wajib diisi di Vercel:**
- `DATABASE_URL` — Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Random 32+ karakter
- `BETTER_AUTH_URL` — URL produksi (misal: `https://darsa.vercel.app`)
- `NEXT_PUBLIC_APP_URL` — URL produksi

---

## 🔒 Keamanan

- Semua file `.env*` dikecualikan dari Git (lihat `.gitignore`)
- Route `/admin`, `/guru`, `/wali`, `/santri`, `/super-admin` dilindungi middleware
- Session berbasis cookie HttpOnly dengan validasi role
- Tidak ada hardcoded secret di source code

---

## 📄 Lisensi

Proyek ini adalah hak milik **Ma'had Darussa'adah Lirboyo Kota Kediri**.  
Dibangun dengan ❤️ oleh tim Darsa Developer.

---

*Darsa Enterprise Engine v3.0 — © 2026 Ma'had Darussa'adah Lirboyo Kota Kediri*
