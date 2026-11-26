# Monitoring Penghunian Rusun UNITRI — Panduan Pasang di Server

Aplikasi web untuk memantau keterhunian Rusun UNITRI (Asrama Wiyata 3 lantai):
denah per lantai, daftar penghuni, rekap keterhunian, dan riwayat perubahan.

## Akun awal

| Username    | Password    | Peran              | Bisa apa                                                     |
|-------------|-------------|--------------------|--------------------------------------------------------------|
| `admin`     | `admin123`  | Admin Balai        | Semua, termasuk kapasitas unit, password akun, reset data    |
| `pengelola` | `unitri123` | Pengelola UNITRI   | Tambah/keluarkan penghuni, kondisi & catatan unit            |
| `pimpinan`  | `lihat123`  | Pimpinan / Viewer  | Hanya lihat angka & denah (tanpa nama penghuni dan riwayat)  |

> **Penting:** password di atas sengaja dibuat mudah untuk uji coba.
> Setelah aplikasi online, login sebagai `admin` → tab **Pengaturan** → ganti semua password.

## Isi folder

```
monitoring-unitri-server/
├── server.js            ← program server (Node.js)
├── public/index.html    ← tampilan aplikasi
├── package.json
├── Dockerfile
├── docker-compose.yml
└── data/                ← dibuat otomatis saat pertama jalan (database db.json)
```

## Cara pasang (server dengan Docker)

1. **Salin folder** `monitoring-unitri-server` ke server, misalnya ke `~/apps/monitoring-unitri-server`
   (pakai WinSCP, `scp`, atau Nextcloud).

2. **Masuk ke server lewat SSH**, lalu jalankan:
   ```bash
   cd ~/apps/monitoring-unitri-server
   docker compose up -d --build
   ```

3. **Cek berjalan:** buka `http://IP-SERVER:3080` (atau lewat Tailscale).
   Harus muncul halaman login.
   Kalau port 3080 sudah dipakai, ubah angka `3080` di `docker-compose.yml`, lalu ulangi langkah 2.

4. **Supaya bisa diakses dari luar (pengelola di Malang)** — lewat Cloudflare Tunnel yang sudah ada:
   Cloudflare Zero Trust → Networks → Tunnels → pilih tunnel server → **Public Hostname** → Add:
   - Subdomain: misalnya `rusun-unitri`
   - Domain: `dataku.biz.id`
   - Service: `HTTP` → `localhost:3080`

   Aplikasi lalu bisa dibuka di `https://rusun-unitri.dataku.biz.id`.

5. **Login sebagai admin, ganti semua password**, lalu bagikan username + password baru ke pengelola.

## Perintah yang sering dipakai

| Keperluan                      | Perintah (di folder aplikasi)              |
|--------------------------------|--------------------------------------------|
| Lihat status                   | `docker compose ps`                        |
| Lihat log                      | `docker compose logs -f`                   |
| Restart                        | `docker compose restart`                   |
| Update setelah file diganti    | `docker compose up -d --build`             |
| Hentikan                       | `docker compose down`                      |

## Data & backup

- Semua data ada di **`data/db.json`** (penghuni, unit, akun, riwayat). Backup cukup salin folder `data/`.
- Password tersimpan dalam bentuk terenkripsi (hash), bukan teks biasa.
- Jangan hapus `data/secret.key` — kalau terhapus, semua pengguna cukup login ulang.

## Sebelum isi data asli

Saat ini aplikasi berisi **data contoh (dummy)**. Jika sudah siap dipakai sungguhan:
login `admin` → **Pengaturan** → **Kosongkan semua penghuni**, lalu pengelola mengisi data asli.

Data penghuni (nama, NIM) termasuk data pribadi (UU PDP): bagikan akun pengelola hanya ke petugas
yang berwenang, dan gunakan akun `pimpinan` untuk pihak yang cukup melihat angka.
