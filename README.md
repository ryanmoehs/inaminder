# INAMINDER

Sebuah Chrome extension yang membantu mengelola pesanan dan negosiasi dari INAPROC dengan fitur tracking dan filtering.

## Fitur

### 1. **Tambahkan Pesanan Otomatis**
- Buka halaman detail pesanan/negosiasi di INAPROC
- Klik tombol "+ Tambahkan ke INAPROC Helper" yang muncul di halaman
- Atau gunakan tombol "+ Tambahkan Halaman Ini" di popup extension
- Data pesanan akan tersimpan (nomor pesanan, status, deadline, URL)

### 2. **Sorting Otomatis Berdasarkan Urgency**
- Pesanan diurutkan dari yang paling mendesak (deadline terdekat)
- **Kuning (Urgent)**: Deadline ≤ 1 hari
- **Oranye (Warning)**: Deadline ≤ 2 hari
- **Putih (Normal)**: Deadline > 2 hari

### 3. **Filter & Pencarian**
- **Cari Nomor Pesanan**: Ketik nomor pesanan (EP-...) untuk filter
- **Cari Berdasarkan Tanggal**: Pilih tanggal untuk melihat pesanan pada hari tersebut
- Kedua filter dapat digunakan bersamaan

### 4. **Hapus Pesanan**
- Klik tombol delete (ikon sampah) pada kartu pesanan untuk menghapusnya
- Pesanan akan dihapus dari penyimpanan extension

### 5. **Direct Link**
- Klik ikon link eksternal untuk membuka halaman pesanan di INAPROC
- Link akan membuka di tab baru

## Cara Kerja

### Data Yang Disimpan
Setiap pesanan menyimpan:
- `orderId`: Nomor pesanan (contoh: EP-01KDT5SGCRTYH8NV9ZKJSN4E63)
- `status`: Status pesanan (Menunggu Respon Penyedia, Menunggu Respon Pembeli, dst)
- `dueDate`: Tanggal deadline (format: DD Mon YYYY)
- `url`: URL halaman pesanan di INAPROC
- `lastChecked`: Waktu terakhir kali data diperbarui

### Penyimpanan Data
- Data disimpan di Chrome Local Storage
- Data persisten (tersimpan hingga extension dihapus atau user menghapusnya)
- Setiap tab dapat mengakses data yang sama

### Sinkronisasi Real-time
- Popup akan otomatis refresh jika ada perubahan data
- Notifikasi akan muncul jika ada perubahan status pesanan

## Instalasi

1. Clone atau download repository ini
2. Buka `chrome://extensions/` di browser
3. Aktifkan "Developer Mode" (sudut kanan atas)
4. Klik "Load unpacked"
5. Pilih folder project ini
6. Extension siap digunakan

## Struktur File

```
inaproc-ext/
├── manifest.json              # Konfigurasi extension
├── popup/
│   ├── popup.html            # UI popup
│   ├── popup.css             # Styling popup
│   └── popup.js              # Logic popup (utama)
├── content/
│   └── scrape-order.js       # Scrape data pesanan
├── background/
│   └── service-worker.js     # Background service worker
├── utils/
│   ├── storage.js            # Utility penyimpanan
│   └── parser.js             # Utility parsing
└── assets/                    # Icon dan asset lainnya
```

## Troubleshooting

### Tombol tidak muncul di halaman
- Pastikan Anda di halaman `/negotiation/` atau `/order/` di INAPROC
- Refresh halaman (F5)
- Periksa Console (F12) untuk error message

### Data tidak tersimpan
- Periksa bahwa Chrome storage bukan dalam private mode
- Buka DevTools > Application > Storage untuk lihat data tersimpan

### Filter tidak bekerja
- Format nomor pesanan: harus dimulai dengan "EP-"
- Format tanggal: gunakan date picker untuk memilih tanggal

## Permissions

Extension memerlukan permissions:
- `storage`: Untuk menyimpan data pesanan
- `notifications`: Untuk menampilkan notifikasi
- `activeTab`: Untuk mengakses tab aktif
- `scripting`: Untuk inject script di halaman INAPROC

## Note

- Nomor pesanan harus dimulai dengan "EP-" untuk dikenali
- Deadline harus mengandung "WIB" untuk dideteksi otomatis
- Semua data disimpan lokal, tidak dikirim ke server manapun
