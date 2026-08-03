# Panduan & Spesifikasi Dokumentasi Tampilan Menu dan User (Darsa Enterprise)

**Status:** Documentation Standard  
**Versi:** 3.0.0  
**Tanggal:** 3 Agustus 2026  
**Sistem:** Darsa Enterprise - Platform Terpadu Pendidikan Islam  

---

## 1. Aturan Bisnis & Hierarki Sistem (System Hierarchy)

Seluruh menu, fitur, hak akses, serta data dalam sistem **Darsa Enterprise** wajib mengikuti struktur dan hierarki berikut:

$$\text{Tahun Ajaran} \longrightarrow \text{Instansi} \longrightarrow \text{Role Pengguna} \longrightarrow \text{Data}$$

### Ketentuan Validasi Hierarki:
1. **Tahun Ajaran:** Parameter utama. Seluruh data akademik dan administrasi terikat pada Tahun Ajaran yang dipilih (`2025/2026 Ganjil`, `2025/2026 Genap`).
2. **Instansi (Entitas Terisolasi):**
   - 🏰 **Pondok Pesantren Darussa'adah** (*Single Source of Truth* untuk Data Santri).
   - 📖 **Madrasah Diniyah Darussa'adah**.
   - 🎓 **Madrasah Ibtida'iyyah (MI) / MA Darussa'adah**.
3. **Pemisahan Menu Antarinstansi:**  
   $$\text{"Menu Mengikuti Instansi, Bukan Pengguna"}$$
   - Setiap instansi memiliki **struktur menu yang berdiri sendiri**.
   - Menu antarinstansi **TIDAK BOLEH** dicampurkan, digabungkan, atau ditampilkan bersamaan dalam satu navigasi.
   - Mengubah instansi aktif akan langsung mengganti seluruh navigasi sidebar, fitur, dashboard, dan laporan.

---

## 2. Struktur Menu Eksklusif Per Instansi (Standalone Menu Trees)

### A. Menu Eksklusif Instansi Pondok Pesantren
- 📊 **Overview Pesantren:** Statistics, Live Presensi Gerbang, & Audit Logs.
- 🎓 **Master Santri Pondok:** Data Santri Utama (*Source of Truth*).
- 👨‍🏫 **Dewan Pengasuh & Ustadz:** Pengasuh Pesantren & Pengajar.
- 📱 **Dynamic QR Display:** Screen QR Code TOTP Gerbang Pesantren.
- 📖 **Tahfidz Al-Qur'an:** Mutaba'ah & Capaian Hafalan Juz.
- 💳 **Keuangan SPP Pondok:** Kas Pesantren & Tagihan SPP.
- ✉️ **Surat Izin Santri:** Generator & Arsip Izin Pulang Santri.

### B. Menu Eksklusif Instansi Madrasah Diniyah
- 📊 **Overview Diniyah:** Statistics Diniyah & Rekapitulasi Kitab.
- 📥 **Santri Diniyah (Penarikan Data):** Data Santri hasil sinkronisasi dari Pondok.
- 👨‍🏫 **Mustahiq & Pengajar Diniyah:** Guru & Pengampu Diniyah.
- 📅 **Jadwal Pelajaran Diniyah:** Grid Jadwal Mengajar & Kitab Kuning.
- 📜 **Rapor Diniyah PDF:** Lembar Hasil Belajar Diniyah Siap Cetak.

### C. Menu Eksklusif Instansi Madrasah Ibtida'iyyah (MI / Formal)
- 📊 **Overview MI:** Statistics Sekolah Formal MI.
- 📥 **Santri MI (Penarikan Data):** Data Santri MI hasil sinkronisasi dari Pondok.
- 👨‍🏫 **Guru & Pegawai MI:** Tenaga Pendidik & Kependidikan MI.
- 📅 **Jadwal & Rapor Kurikulum MI:** Penjadwalan & Rapor Formal MI.
- 📦 **Inventaris Aset MI:** Pengelolaan Barang & Aset Sekolah MI.
