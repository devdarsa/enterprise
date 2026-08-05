# Spesifikasi Lengkap Darsa Enterprise (Official Master Document)

**Status:** Approved Official Standard  
**Versi:** 3.0.0  
**Tanggal:** 5 Agustus 2026  
**Lembaga:** Ma'had Darussa'adah Lirboyo Kota Kediri  

---

## 1. Structure Navigasi Menu Darsa Enterprise

### DASHBOARD
- Overview Dashboard (Dinamis per Role & Instansi Aktif)

### DATABASE PONDOK
- Data Santri & Wali Santri
- Data Asrama & Pembina Asrama
- Data Pengurus (Pondok, Madrasah, MI)
- Data Pengajar (Madrasah & MI)
- Alumni

### KEAMANAN
- Perizinan Santri
- Pelanggaran & Kedisiplinan

### SISTEM & UTILITAS
- Arsip Historis
- Tahun Ajaran & Semester
- Manajemen Akun & Role RBAC
- Audit Log & Recycle Bin
- Panduan & SOP Sistem
- Konfigurasi Sistem

---

## 2. Ketentuan Tampilan Menu Berdasarkan Role (UI/UX Standard BAB I - XIV)

1. **Sekretariat Pondok (BAB III)**: Desktop/Laptop Only (`DesktopOnlyGuard`). Menu: Dashboard, Database Pondok (Santri, Wali, Asrama, Pengurus, Pengajar, Alumni), Keamanan (Perizinan, Pelanggaran), Sistem (Tahun Ajaran, Manajemen Akun, Audit Log, Recycle Bin, Konfigurasi). Karakter: Profesional, administratif, banyak data & table.
2. **Sekretariat Madrasah Diniyyah (BAB IV)**: Desktop/Laptop. Menu: Dashboard, Akademik (Kelas, Mapel, Mustahiq, Munawwib, Nilai, Absensi, Jadwal). Karakter: Fokus Akademik, cepat input nilai.
3. **Sekretariat MI (BAB V)**: Desktop/Laptop. Menu: Dashboard, Operasional MI (Kelas, Guru MI, Jadwal, Rekap Absensi Guru). Karakter: Ringan, operasional.
4. **Keamanan (BAB VI)**: Desktop/Tablet. Menu: Dashboard, Perizinan, Pelanggaran, Riwayat. Karakter: Cepat, fokus monitoring.
5. **Mustahiq (Wali Kelas) (BAB VII)**: Mobile First. Bottom Nav: 🏠 Beranda | 📅 Jadwal | 📖 Kelas | 📷 QR Absensi | 👤 Profil. Menu: Jadwal, Data Kelas, Input Absensi, Input Nilai, QR Code, Riwayat, Profil.
6. **Munawwib (BAB VIII)**: Mobile First. Bottom Nav: 🏠 Beranda | 📚 Mapel | 📷 QR | 📅 Jadwal | 👤 Profil. Menu: Jadwal, Mapel, Input Nilai, Input Absensi, QR Code, Profil.
7. **Guru MI (BAB IX)**: Mobile First. Bottom Nav: 🏠 Beranda | 📷 QR | 📅 Jadwal | 📋 Absensi | 👤 Profil. Menu: QR Code, Absensi, Jadwal, Profil (**TANPA MENU NILAI**).
8. **Wali Santri (BAB X)**: Mobile First. Bottom Nav: 🏠 Beranda | 👨‍🎓 Anak | 📢 Informasi | 🔔 Notifikasi | 👤 Profil. Menu: Profil Anak, Nilai, Absensi, Perizinan, Pelanggaran, Pengumuman (Multi-Santri NIK Link).

---

## 3. Ketentuan Database Santri (BAB I - X)

1. **Single Source of Truth**: Pondok merupakan Master Database seluruh Santri/Santriwati.
2. **Master Santri**: Hanya menyimpan identitas dasar permanen (NISP Stambuk, NISN, NIK, Nama Lengkap, Nama Panggilan, Gender, Tempat/Tgl Lahir, Anak Ke, Jumlah Saudara, Status Asrama, Foto).
3. **Tanpa Kelas pada Master Santri**: Data kelas disimpan pada tabel `PenempatanPendidikan` (`penempatan_pendidikan`).
4. **Dual-Enrollment**: Satu santri dapat bersekolah di Madrasah Diniyah, MI Formal, atau KEDUANYA sekaligus di tahun ajaran yang sama.
5. **NIK Wali Link**: Akun Wali Santri terhubung menggunakan NIK Orang Tua/Wali, mendukung Multi-Santri (1 NIK Wali -> banyak anak).
6. **Master Wilayah Indonesia**: Server-side API `/api/v1/wilayah` menyimpan `master_provinsi`, `master_kabupaten`, `master_kecamatan`, `master_desa` dengan offline fallback & auto-formatted `alamat_lengkap`.

---

## 4. Standar Tombol Aksi & UI

* **Data Grid Tabel**: `🔍 Detail`, `✏️ Edit`, `🗑️ Soft Delete` (ke Recycle Bin), `📜 Riwayat` (Audit Log), `🎓 Penempatan`, `⚡ Aktifkan/Nonaktifkan`, `📦 Arsip`.
* **Toolbar Actions**: `➕ Tambah Data`, `📥 Import`, `📊 Export`, `🖨️ Cetak`, `🔄 Sync`.
* **Form Actions**: `💾 Simpan`, `➕ Simpan & Tambah Baru`, `✅ Simpan & Tutup`, `🔄 Reset`, `❌ Batal`, `← Kembali`.
* **Mobile Standards**: Touch-friendly buttons & Mobile Bottom Navigation Bar.

---

## 5. Ketentuan Simulasi & API

* Zero Hardcoded Data: 100% database-driven API endpoints (`/api/v1/simulation/data` & `/api/v1/wilayah`).
* Audit Log Immutable: Seluruh aksi penting tercatat secara otomatis.
* Soft Delete Recovery: Data terhapus dapat dipulihkan melalui Recycle Bin.
