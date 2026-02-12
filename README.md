# Database Rumah Susun Provinsi Jawa Timur

Aplikasi web interaktif untuk mengelola database rumah susun (rusun) di Provinsi Jawa Timur dengan visualisasi peta menggunakan Leaflet.js.

## 📊 Data

- **Total Rusun**: 372
- **Dengan Koordinat GPS**: 206 (163 terverifikasi, 43 perlu validasi)
- **Belum Ada Koordinat**: 166

## 🚀 Cara Menjalankan

### Opsi 1: Python HTTP Server (Recommended)

```powershell
cd "d:\BP3KP 2026\RUSUN\DATABASE"
python -m http.server 8000
```

Kemudian buka browser: `http://localhost:8000`

### Opsi 2: Live Server (VS Code Extension)

1. Install extension "Live Server" di VS Code
2. Klik kanan pada `index.html`
3. Pilih "Open with Live Server"

## 📁 Struktur File

```
DATABASE/
├── index.html              # Halaman utama aplikasi
├── styles.css              # Styling aplikasi
├── app.js                  # JavaScript utama
├── rusun_data.json         # Data rusun hasil konversi
├── dbrusun.xlsx            # Data Excel asli
├── convert_excel_to_json.py # Script konversi Excel ke JSON
└── README.md               # Dokumentasi ini
```

## 🗺️ Fitur Aplikasi

### 1. Tab Peta
- **Peta Interaktif**: Visualisasi semua rusun dengan koordinat GPS
- **Marker Clustering**: Pengelompokan marker otomatis untuk performa optimal
- **Popup Informasi**: Detail lengkap rusun saat klik marker
- **Filter**:
  - Kabupaten/Kota
  - Tahun Anggaran (range)
  - Tipe Rusun
  - Status Koordinat (Terverifikasi/Perlu Validasi/Belum Ada)
- **Statistik**: Breakdown jumlah rusun per kabupaten/kota

### 2. Tab Data Tabel
- **Tabel Lengkap**: Semua data rusun dalam format tabel
- **Search**: Pencarian global di semua kolom
- **Pagination**: 50 baris per halaman
- **Highlight**: Baris tanpa koordinat ditandai dengan warna kuning
- **Export Excel**: Download semua data ke file Excel
- **Link Google Maps**: Untuk rusun yang sudah ada koordinat

### 3. Tab Form OSI
- **Input Koordinat**: Form untuk operator mengisi koordinat yang belum ada
- **Dropdown Rusun**: Hanya menampilkan rusun yang belum ada koordinat
- **Map Picker**: Klik pada peta untuk memilih lokasi
- **Auto-fill**: Koordinat otomatis terisi saat klik peta
- **LocalStorage**: Data tersimpan sementara di browser
- **Preview Tabel**: Lihat data yang sudah diinput
- **Export JSON**: Download data koordinat baru dalam format JSON

## 🔧 Cara Menggunakan Form OSI

1. Buka tab "Form OSI"
2. Pilih rusun dari dropdown (hanya rusun tanpa koordinat)
3. Informasi rusun akan ditampilkan
4. **Cara 1**: Klik pada peta untuk memilih lokasi (koordinat auto-fill)
5. **Cara 2**: Input manual latitude dan longitude
6. Klik "💾 Simpan Koordinat"
7. Data tersimpan di LocalStorage browser
8. Lihat preview di tabel bawah
9. Klik "📥 Export Data Baru (JSON)" untuk download file JSON

## 📤 Export Data Koordinat Baru

Setelah OSI mengisi koordinat yang belum ada:

1. Klik "📥 Export Data Baru (JSON)" di tab Form OSI
2. File JSON akan terdownload dengan format:
   ```json
   [
     {
       "id": 1,
       "lat": -7.250445,
       "lng": 112.768845,
       "nama": "Rusun Example",
       "kabkota": "Surabaya"
     }
   ]
   ```
3. File ini bisa digunakan untuk update database utama

## 🔄 Update Data dari Excel

Jika ada perubahan di file `dbrusun.xlsx`:

```powershell
python convert_excel_to_json.py
```

File `rusun_data.json` akan di-generate ulang. Refresh browser untuk melihat perubahan.

## 🎨 Legenda Peta

- 🟢 **Hijau**: Koordinat terverifikasi
- 🟠 **Oranye**: Koordinat perlu validasi
- ⚪ **Tidak tampil**: Belum ada koordinat

## 🌐 Browser Support

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari

## 📱 Responsive Design

Aplikasi fully responsive dan dapat diakses dari:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## ⚠️ Troubleshooting

### Peta tidak muncul
- Pastikan koneksi internet aktif (untuk load tile OpenStreetMap)
- Cek console browser (F12) untuk error

### Data tidak muncul
- Pastikan file `rusun_data.json` ada di folder yang sama
- Jalankan aplikasi via HTTP server, bukan dengan membuka file HTML langsung

### Filter tidak bekerja
- Refresh halaman (F5)
- Clear browser cache

## 📝 Catatan

- Data tersimpan di LocalStorage browser (Form OSI)
- LocalStorage bersifat sementara per browser
- Export JSON secara berkala untuk backup
- Koordinat menggunakan format desimal (WGS84)

## 👨‍💻 Developer

Aplikasi ini dibuat untuk BP3KP 2026 - Provinsi Jawa Timur

---

**Last Updated**: 2026-02-12
