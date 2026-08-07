# Ketentuan Resmi Pengembangan Native Experience

## Darsa Enterprise

### 1. Tujuan

Sistem Darsa Enterprise wajib memberikan pengalaman penggunaan (User Experience) setara dengan aplikasi native meskipun dibangun menggunakan teknologi web. Sistem harus dirancang agar dapat digunakan melalui browser, WebView Desktop, WebView Android, maupun WebView iOS tanpa perubahan arsitektur utama.

### 2. Prinsip Pengembangan

* Sistem wajib menggunakan arsitektur Single Page Application (SPA).
* Perpindahan menu tidak boleh menyebabkan reload halaman.
* Database merupakan Single Source of Truth.
* Browser berfungsi sebagai media penyimpanan cache selama pengguna masih login.
* Seluruh proses harus mengutamakan kecepatan, efisiensi, dan pengalaman pengguna seperti aplikasi native.

### 3. Perpindahan Halaman

* Perpindahan menu tidak boleh melakukan refresh browser.
* Perpindahan menu tidak boleh memuat ulang layout aplikasi.
* Navigasi harus berlangsung secara instan.
* Posisi menu aktif harus tetap dipertahankan.
* Transisi antarmenu harus berjalan dengan halus.
* Loading hanya ditampilkan apabila data belum tersedia atau sedang dilakukan sinkronisasi.

### 4. Manajemen Data

* Setelah login berhasil, sistem mengambil data sesuai hak akses pengguna.
* Data yang telah diambil disimpan pada browser perangkat.
* Seluruh menu membaca data dari cache browser.
* Database hanya diakses ketika diperlukan.
* Browser tidak menjadi sumber data utama, melainkan hanya menyimpan salinan data sementara.

### 5. Penyimpanan Lokal

* IndexedDB digunakan untuk data master dan data berukuran besar.
* localStorage digunakan untuk token, identitas pengguna, konfigurasi ringan, dan pengaturan sistem.
* sessionStorage digunakan untuk data sesi yang bersifat sementara.
* Seluruh penyimpanan lokal wajib dibersihkan ketika pengguna logout.

### 6. Sinkronisasi Data

Server hanya diakses pada kondisi berikut:

* Login.
* Menambah data.
* Mengubah data.
* Menghapus data.
* Sinkronisasi manual.
* Sinkronisasi otomatis.
* Pembaruan token autentikasi.
* Refresh penuh aplikasi.

Selain kondisi tersebut, sistem wajib menggunakan data yang telah tersimpan pada browser.

### 7. Pengalaman Pengguna

* Navigasi harus terasa instan.
* Tidak terjadi reload halaman.
* Tidak terjadi flicker saat berpindah menu.
* Tidak ada loading berulang.
* Form mempertahankan data yang belum disimpan selama pengguna masih berada dalam sesi yang sama.
* Posisi scroll dapat dipertahankan ketika pengguna kembali ke halaman sebelumnya sesuai kebutuhan.

### 8. Optimasi WebView

* Sistem harus kompatibel dengan WebView Desktop.
* Sistem harus kompatibel dengan WebView Android.
* Sistem harus kompatibel dengan WebView iOS.
* Seluruh halaman harus responsif.
* Penggunaan memori dan bandwidth harus efisien.
* Aplikasi tidak boleh bergantung pada refresh browser.

### 9. Target Performa

* Perpindahan menu kurang dari 100 milidetik apabila data tersedia pada cache.
* Dashboard terbuka kurang dari 2 detik pada kondisi jaringan normal.
* Pencarian data lokal kurang dari 50 milidetik.
* Sinkronisasi mengikuti kondisi jaringan dan ukuran data.

### 10. Larangan

* Melakukan reload halaman saat berpindah menu.
* Mengambil data dari server setiap kali menu dibuka tanpa kebutuhan.
* Menampilkan loading apabila data telah tersedia pada cache.
* Menghapus cache tanpa alasan yang sah.
* Menyimpan data pengguna setelah logout.
* Menyimpan data pengguna lain pada browser.

### 11. Standar Arsitektur

Sistem wajib menerapkan:

* Single Page Application (SPA).
* Role-Based Access Control (RBAC).
* Browser Cache Management.
* API Terpusat.
* Reusable Components.
* Sinkronisasi Data yang Efisien.
* Responsive User Interface.
* Native User Experience.

### 12. Target Implementasi

Darsa Enterprise wajib dapat dijalankan secara optimal pada:

* Browser Desktop.
* Browser Mobile.
* WebView Desktop.
* WebView Android.
* WebView iOS.

Pengguna harus memperoleh pengalaman penggunaan yang konsisten, cepat, responsif, dan menyerupai aplikasi native pada seluruh platform tersebut.

satu prinsip tambahan yang sangat penting:

"Website ini bukan dirancang sebagai website biasa, melainkan sebagai aplikasi berbasis web (Web Application) dengan pengalaman penggunaan setara aplikasi native. Oleh karena itu seluruh keputusan desain, arsitektur, manajemen data, dan navigasi harus mengutamakan performa, responsivitas, serta minim reload agar siap digunakan melalui browser maupun dikemas sebagai aplikasi WebView."