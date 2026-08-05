# Spesifikasi Lengkap Darsa Enterprise (Official Master Document)

**Status:** Approved Official Standard  
**Versi:** 2.0.0  
**Tanggal:** 5 Agustus 2026  
**Lembaga:** Ma'had Darussa'adah Lirboyo Kota Kediri  

---

## 1. Struktur Menu Darsa Enterprise

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

## 2. Role & Hak Akses (7 Roles)

1. **Sekretariat Pondok**: Administrator Utama. Akses penuh ke seluruh menu (`Dashboard`, `Database Pondok`, `Keamanan`, `Sistem & Utilitas`).
2. **Sekretariat Madrasah Diniyyah**: Admin Akademik Madrasah Diniyyah (`Dashboard`, `Akademik Madrasah`). Data santri read-only, tanpa akses ke Konfigurasi Pondok.
3. **Sekretariat MI**: Admin Operasional MI (`Dashboard`, `Operasional MI`). Data santri read-only, tanpa menu Nilai (diampu app lain).
4. **Keamanan**: Access restricted to `Dashboard`, `Perizinan`, `Pelanggaran`, `SOP`. Cannot mutate academic/biodata.
5. **Mustahiq / Munawwib (Guru Madrasah)**: `Dashboard`, `QR Code Absensi Guru`, `Absensi Guru`, `Jadwal Mengajar`, `Data Kelas`, `Data Mapel`, `Input Nilai`, `Input Absensi Santri`, `Riwayat Mengajar`, `Profil`.
6. **Guru MI**: `Dashboard`, `QR Code Absensi Guru`, `Absensi Guru`, `Jadwal Mengajar`, `Profil` (NO Nilai menu).
7. **Wali Santri**: `Dashboard` (Read-only Info Santri, Info Akademik, Perizinan, Pelanggaran, Pengumuman, Profil), multi-santri NIK link.

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
* **Mobile Standards**: Touch-friendly buttons & Mobile Bottom Navigation.

---

## 5. Ketentuan Simulasi & API

* Zero Hardcoded Data: 100% database-driven API endpoints (`/api/v1/simulation/data` & `/api/v1/wilayah`).
* Audit Log Immutable: Seluruh aksi penting tercatat secara otomatis.
* Soft Delete Recovery: Data terhapus dapat dipulihkan melalui Recycle Bin.
