# Spesifikasi Lengkap Darsa Enterprise (Official Master Document)

**Status:** Approved Official Standard  
**Versi:** 6.0.0  
**Tanggal:** 5 Agustus 2026  
**Lembaga:** Ma'had Darussa'adah Lirboyo Kota Kediri  

---

## 1. Standar Pembuatan Akun & Pendaftaran (BAB I - X)

### A. Prinsip Utama Pembuatan Akun (BAB I & II)
1. **Mandatori Master Database**: Seluruh akun (Guru, Pengurus, Wali Santri) **WAJIB BERASAL DARI MASTER DATABASE** (`Data Pengajar`, `Data Pengurus`, `Database Santri / NIK Wali`). Tidak diperbolehkan membuat akun tanpa data induk.
2. **Satu Identitas Satu Akun**: Perubahan nama, HP, atau jabatan dilakukan pada Master Database, bukan pada tabel akun.
3. **Audit Logging Automatic**: Seluruh proses pembuatan akun, registrasi, aktivasi, perubahan status, dan reset password dicatat ke Audit Log.

### B. Pembuatan Akun Guru & Pengurus (BAB III & IV)
- Sekretariat membuka `Manajemen Akun` ➔ Tambah Akun ➔ Pilih Guru / Pengurus dari dropdown Master Database yang belum berakun ➔ Sistem mengisi data otomatis ➔ Set Username & Role RBAC ➔ Pengguna **WAJIB mengganti password** pada login pertama.

### C. Pendaftaran Akun Wali Santri (BAB V - Multi-Santri Automatic NIK Link)
- Akun Wali Santri **TIDAK dibuat oleh Sekretariat**, melainkan didaftarkan sendiri oleh Wali Santri via form `Daftar Akun`.
- Form mengisi NIK (Ayah / Ibu / Wali), Tgl Lahir, HP, Email, Username, Password.
- Sistem mencocokkan NIK Kependudukan ke Database Pondok. Jika NIK ditemukan, sistem **secara otomatis menghubungkan SELURUH ANAK** yang terdaftar di bawah NIK tersebut (Multi-Santri: 1 NIK -> banyak anak). Jika NIK tidak ditemukan, pendaftaran ditolak.

### D. Keamanan Kredensial & Reset Password (BAB VI - X)
- Password wajib di-hash menggunakan Argon2 atau bcrypt (plain text dilarang).
- Reset password oleh Admin atau Mandatori Reset tercatat di Audit Log.

---

## 2. Standar Penarikan Data & Integrasi API Database (BAB I - XIV)

### A. Arsitektur Data Flow
```text
Frontend (Web / Mobile) ──► REST API Backend (/api/v1/*) ──► Database Engine ──► Master Single Source of Truth
```

### B. Prinsip Utama API & Database Integration:
1. **Single Source of Truth (SSOT)**: Database Pondok Pesantren merupakan satu-satunya sumber data resmi.
2. **REST API Gateway**: Frontend (Web/Mobile) **HANYA BISA** mengakses data melalui REST API `/api/v1/*`. Tidak ada akses langsung ke database.
3. **Zero Hardcoded Data**: Seluruh data disajikan, dibuat, diubah, dan dihapus secara **live / real-time**.
4. **Operasi CRUD & Recovery**: Mendukung Create, Read, Update, Soft Delete (`recycle_bin`), dan Restore.
5. **Cross-Module Sync**: Perubahan biodata santri di Pondok atau penempatan di kelas langsung tercermin secara real-time pada modul Madrasah, MI, dan Portal Wali Santri.

---

## 3. Navigasi & Standar Isi 19 Modul Menu Darsa Enterprise

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

## 4. Ketentuan Tampilan Menu Berdasarkan Role (UI/UX Standard BAB I - XIV)

1. **Sekretariat Pondok (BAB III)**: Desktop/Laptop Only (`DesktopOnlyGuard`). Menu: Dashboard, Database Pondok (Santri, Wali, Asrama, Pengurus, Pengajar, Alumni), Keamanan (Perizinan, Pelanggaran), Sistem (Tahun Ajaran, Manajemen Akun, Audit Log, Recycle Bin, Konfigurasi). Karakter: Profesional, administratif, banyak data & table.
2. **Sekretariat Madrasah Diniyyah (BAB IV)**: Desktop/Laptop. Menu: Dashboard, Akademik (Kelas, Mapel, Mustahiq, Munawwib, Nilai, Absensi, Jadwal). Karakter: Fokus Akademik, cepat input nilai.
3. **Sekretariat MI (BAB V)**: Desktop/Laptop. Menu: Dashboard, Operasional MI (Kelas, Guru MI, Jadwal, Rekap Absensi Guru). Karakter: Ringan, operasional.
4. **Keamanan (BAB VI)**: Desktop/Tablet. Menu: Dashboard, Perizinan, Pelanggaran, Riwayat. Karakter: Cepat, fokus monitoring.
5. **Mustahiq (Wali Kelas) (BAB VII)**: Mobile First. Bottom Nav: 🏠 Beranda | 📅 Jadwal | 📖 Kelas | 📷 QR Absensi | 👤 Profil. Menu: Jadwal, Data Kelas, Input Absensi, Input Nilai, QR Code, Riwayat, Profil.
6. **Munawwib (BAB VIII)**: Mobile First. Bottom Nav: 🏠 Beranda | 📚 Mapel | 📷 QR | 📅 Jadwal | 👤 Profil. Menu: Jadwal, Mapel, Input Nilai, Input Absensi, QR Code, Profil.
7. **Guru MI (BAB IX)**: Mobile First. Bottom Nav: 🏠 Beranda | 📷 QR | 📅 Jadwal | 📋 Absensi | 👤 Profil. Menu: QR Code, Absensi, Jadwal, Profil (**TANPA MENU NILAI**).
8. **Wali Santri (BAB X)**: Mobile First. Bottom Nav: 🏠 Beranda | 👨‍🎓 Anak | 📢 Informasi | 🔔 Notifikasi | 👤 Profil. Menu: Profil Anak, Nilai, Absensi, Perizinan, Pelanggaran, Pengumuman (Multi-Santri NIK Link).

---

## 5. Standar Tombol Aksi & UI

* **Data Grid Tabel**: `🔍 Detail`, `✏️ Edit`, `🗑️ Soft Delete` (ke Recycle Bin), `📜 Riwayat` (Audit Log), `🎓 Penempatan`, `⚡ Aktifkan/Nonaktifkan`, `📦 Arsip`.
* **Toolbar Actions**: `➕ Tambah Data`, `📥 Import`, `📊 Export`, `🖨️ Cetak`, `🔄 Sync`.
* **Form Actions**: `💾 Simpan`, `➕ Simpan & Tambah Baru`, `✅ Simpan & Tutup`, `🔄 Reset`, `❌ Batal`, `← Kembali`.
* **Mobile Standards**: Touch-friendly buttons & Mobile Bottom Navigation Bar.
