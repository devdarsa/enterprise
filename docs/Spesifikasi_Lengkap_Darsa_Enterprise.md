# Spesifikasi Lengkap Darsa Enterprise (Official Master Document)

**Status:** Approved Official Standard  
**Versi:** 5.0.0  
**Tanggal:** 5 Agustus 2026  
**Lembaga:** Ma'had Darussa'adah Lirboyo Kota Kediri  

---

## 1. Standar Penarikan Data & Integrasi API Database (BAB I - XIV)

### A. Arsitektur Data Flow (BAB III)
```text
Frontend (Web / Mobile) ──► REST API Backend (/api/v1/*) ──► Database Engine ──► Master Single Source of Truth
```

### B. Prinsip Utama API & Database Integration:
1. **Single Source of Truth (SSOT)**: Database Pondok Pesantren merupakan satu-satunya sumber data resmi.
2. **REST API Gateway**: Frontend (Web/Mobile) **HANYA BISA** mengakses data melalui REST API `/api/v1/*`. Tidak ada akses langsung ke database.
3. **Zero Hardcoded Data**: Seluruh data disajikan, dibuat, diubah, dan dihapus secara **live / real-time**.
4. **Operasi CRUD & Recovery**: Mendukung Create, Read, Update, Soft Delete (`recycle_bin`), dan Restore.
5. **Cross-Module Sync**: Perubahan biodata santri di Pondok atau penempatan di kelas langsung tercermin secara real-time pada modul Madrasah, MI, dan Portal Wali Santri.
6. **Keamanan API**: HTTPS, Session/Token Auth, Role-Based Access Control (RBAC), Input Validation, Rate Limiting, & Immutable Audit Logging.

---

## 2. Navigasi & Standar Isi 19 Modul Menu Darsa Enterprise

### 1. DASHBOARD
- **Cards**: Total Santri Aktif, Total Guru, Total Pengurus, Total Perizinan Hari Ini, Total Pelanggaran Hari Ini, Total Kehadiran Guru Hari Ini.
- **Grafik**: Statistik Santri, Kehadiran, Pelanggaran, Perizinan.
- **Aktivitas Terbaru**: Santri Baru, Guru Baru, Login Terakhir, Aktivitas Sistem.

### 2. DATA SANTRI (DATABASE PONDOK)
- **Header**: Data Santri Pondok (Single Source of Truth).
- **Tombol**: Tambah Santri, Import, Export, Cetak, Filter, Refresh.
- **Filter**: Tahun Ajaran, Status, Asrama, Pendidikan, Kelas, Jenis Kelamin.
- **Pencarian**: Stambuk, Nama, NIK Wali, HP, Alamat.
- **Kolom Tabel**: Foto, Stambuk, Nama Lengkap, Gender, Pendidikan, Kelas, Asrama, Status, Aksi.
- **Detail Santri Tab-Multi**: Tab Identitas, Tab Orang Tua, Tab Alamat (Master Wilayah Cahyadsn), Tab Pendidikan, Tab Asrama, Tab Perizinan, Tab Pelanggaran, Tab Riwayat Akademik, Tab Dokumen.

### 3. DATA WALI SANTRI
- NIK, Nama, Hubungan, Nomor HP, Jumlah Anak, Status Akun, Login Terakhir.

### 4. DATA ASRAMA
- Nama Asrama, Pembina, Jumlah Kamar, Kapasitas, Jumlah Penghuni.

### 5. DATA PENGURUS
- Nama, Jabatan, Unit, Nomor HP, Status.

### 6. DATA PENGAJAR
- Nama Guru, Jenis Guru, Unit, Mata Pelajaran, Wali Kelas, Status.

### 7. ALUMNI
- Tahun Lulus, Nama, Stambuk, Pendidikan Terakhir, Status Alumni.

### 8. PERIZINAN (KEAMANAN)
- Nomor Izin, Nama Santri, Jenis Izin, Tanggal Keluar, Tanggal Kembali, Status, Disetujui Oleh.

### 9. PELANGGARAN (KEAMANAN)
- Nama Santri, Jenis Pelanggaran, Poin, Tanggal, Petugas.

### 10. DATA KELAS (AKADEMIK MADRASAH)
- Nama Kelas, Tingkat, Mustahiq, Jumlah Santri.

### 11. MATA PELAJARAN (AKADEMIK MADRASAH)
- Nama Mapel, Munawwib, Jumlah Kelas.

### 12. JADWAL PELAJARAN
- Hari, Jam, Mata Pelajaran, Guru, Kelas.

### 13. NILAI AKADEMIK
- Nama Santri, Mata Pelajaran, Nilai, Semester, Tahun Ajaran.

### 14. ABSENSI SANTRI
- Nama Santri, Tanggal, Status, Mata Pelajaran, Guru.

### 15. GURU MI
- Nama Guru, Jadwal Mengajar, Status Kehadiran.

### 16. REKAP ABSENSI GURU
- Nama Guru, Masuk, Pulang, Total Hadir, Total Terlambat.

### 17. QR CODE GURU
- Tombol Scan QR, Status Kehadiran Hari Ini, Riwayat Scan, Jam Masuk, Jam Pulang.

### 18. MANAJEMEN AKUN
- Nama, Username/Email, Role, Status, Login Terakhir.

### 19. AUDIT LOG & RECYCLE BIN
- Audit Log: Waktu, Pengguna, Modul, Aktivitas, IP Address, Device, Status.
- Recycle Bin: Nama Data, Jenis Data, Dihapus Oleh, Waktu Hapus, Pulihkan, Hapus Permanen.

### 20. KONFIGURASI SISTEM
- Profil Pondok, Tahun Ajaran, Konfigurasi QR Code, Pengaturan Role, API, Backup, Restore, Sinkronisasi Master Wilayah.

---

## 3. Ketentuan Tampilan Menu Berdasarkan Role (UI/UX Standard BAB I - XIV)

1. **Sekretariat Pondok (BAB III)**: Desktop/Laptop Only (`DesktopOnlyGuard`). Menu: Dashboard, Database Pondok (Santri, Wali, Asrama, Pengurus, Pengajar, Alumni), Keamanan (Perizinan, Pelanggaran), Sistem (Tahun Ajaran, Manajemen Akun, Audit Log, Recycle Bin, Konfigurasi). Karakter: Profesional, administratif, banyak data & table.
2. **Sekretariat Madrasah Diniyyah (BAB IV)**: Desktop/Laptop. Menu: Dashboard, Akademik (Kelas, Mapel, Mustahiq, Munawwib, Nilai, Absensi, Jadwal). Karakter: Fokus Akademik, cepat input nilai.
3. **Sekretariat MI (BAB V)**: Desktop/Laptop. Menu: Dashboard, Operasional MI (Kelas, Guru MI, Jadwal, Rekap Absensi Guru). Karakter: Ringan, operasional.
4. **Keamanan (BAB VI)**: Desktop/Tablet. Menu: Dashboard, Perizinan, Pelanggaran, Riwayat. Karakter: Cepat, fokus monitoring.
5. **Mustahiq (Wali Kelas) (BAB VII)**: Mobile First. Bottom Nav: 🏠 Beranda | 📅 Jadwal | 📖 Kelas | 📷 QR Absensi | 👤 Profil. Menu: Jadwal, Data Kelas, Input Absensi, Input Nilai, QR Code, Riwayat, Profil.
6. **Munawwib (BAB VIII)**: Mobile First. Bottom Nav: 🏠 Beranda | 📚 Mapel | 📷 QR | 📅 Jadwal | 👤 Profil. Menu: Jadwal, Mapel, Input Nilai, Input Absensi, QR Code, Profil.
7. **Guru MI (BAB IX)**: Mobile First. Bottom Nav: 🏠 Beranda | 📷 QR | 📅 Jadwal | 📋 Absensi | 👤 Profil. Menu: QR Code, Absensi, Jadwal, Profil (**TANPA MENU NILAI**).
8. **Wali Santri (BAB X)**: Mobile First. Bottom Nav: 🏠 Beranda | 👨‍🎓 Anak | 📢 Informasi | 🔔 Notifikasi | 👤 Profil. Menu: Profil Anak, Nilai, Absensi, Perizinan, Pelanggaran, Pengumuman (Multi-Santri NIK Link).

---

## 4. Ketentuan Database Santri (BAB I - X)

1. **Single Source of Truth**: Pondok merupakan Master Database seluruh Santri/Santriwati.
2. **Master Santri**: Hanya menyimpan identitas dasar permanen (NISP Stambuk, NISN, NIK, Nama Lengkap, Nama Panggilan, Gender, Tempat/Tgl Lahir, Anak Ke, Jumlah Saudara, Status Asrama, Foto).
3. **Tanpa Kelas pada Master Santri**: Data kelas disimpan pada tabel `PenempatanPendidikan` (`penempatan_pendidikan`).
4. **Dual-Enrollment**: Satu santri dapat bersekolah di Madrasah Diniyah, MI Formal, atau KEDUANYA sekaligus di tahun ajaran yang sama.
5. **NIK Wali Link**: Akun Wali Santri terhubung menggunakan NIK Orang Tua/Wali, mendukung Multi-Santri (1 NIK Wali -> banyak anak).
6. **Master Wilayah Indonesia**: Server-side API `/api/v1/wilayah` menyimpan `master_provinsi`, `master_kabupaten`, `master_kecamatan`, `master_desa` dengan offline fallback & auto-formatted `alamat_lengkap`.

---

## 5. Standar Tombol Aksi & UI

* **Data Grid Tabel**: `🔍 Detail`, `✏️ Edit`, `🗑️ Soft Delete` (ke Recycle Bin), `📜 Riwayat` (Audit Log), `🎓 Penempatan`, `⚡ Aktifkan/Nonaktifkan`, `📦 Arsip`.
* **Toolbar Actions**: `➕ Tambah Data`, `📥 Import`, `📊 Export`, `🖨️ Cetak`, `🔄 Sync`.
* **Form Actions**: `💾 Simpan`, `➕ Simpan & Tambah Baru`, `✅ Simpan & Tutup`, `🔄 Reset`, `❌ Batal`, `← Kembali`.
* **Mobile Standards**: Touch-friendly buttons & Mobile Bottom Navigation Bar.
