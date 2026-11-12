# VetCare API — Tugas 2

VetCare API adalah REST API untuk sistem manajemen klinik hewan yang dibangun menggunakan Node.js, TypeScript, Express.js, Prisma ORM, dan PostgreSQL. Pada Tugas 2, aplikasi dikembangkan menggunakan Docker Compose dan Nginx sebagai reverse proxy dengan tiga replica backend.

## 1. Arsitektur dan Konfigurasi

Arsitektur aplikasi menggunakan Nginx sebagai satu-satunya pintu masuk dari host.

- **Nginx:** menerima request dari host melalui port `80`.
- **Backend:** berjalan dengan 3 replica pada port internal `3000`.
- **Database:** menggunakan PostgreSQL pada port internal `5432`.
- **Load balancing:** menggunakan Nginx upstream dengan `zone` dan header `X-Upstream`.
- **Rate limiting:** membatasi request pada rute `/api/` dan mengembalikan HTTP `429`.
- **Security header:** menggunakan `X-Content-Type-Options: nosniff`.
- **Gzip:** mengaktifkan kompresi untuk respons JSON.

Backend dan database tidak memiliki konfigurasi `ports`, sehingga hanya Nginx yang dapat diakses langsung melalui host.

## 2. Struktur Folder

SC/
├── nginx/
│   └── nginx.conf
├── prisma/
├── src/
├── Dockerfile
├── compose.yaml
├── docker-entrypoint.sh
├── package.json
└── README.md

## 3. Cara Menjalankan Aplikasi

### Prasyarat
- Docker Desktop
- Docker Compose
- Port 80 tidak sedang digunakan aplikasi lain.

### Langkah menjalankan

Salin file environment jika belum tersedia: Copy-Item .env.example .env

Build image dan jalankan seluruh service dengan 3 replica backend:
docker compose up -d --build --scale backend=3

Periksa container: docker compose ps

Periksa jumlah replica backend:

(docker compose ps -q backend).Count

Hasil:

3

Periksa konfigurasi Nginx:

docker compose exec nginx nginx -t

Hasil:

nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

Untuk menghentikan aplikasi:

docker compose down

## 4. Bukti Pengujian

Seluruh pengujian berikut dilakukan melalui terminal menggunakan PowerShell.

### A. Load Balancing

Pengujian dilakukan untuk memastikan request didistribusikan ke tiga replica backend melalui header `X-Upstream`.

Perintah:

1..10 | ForEach-Object {
    curl.exe -sS -D - -o NUL http://localhost/health |
    Select-String -Pattern "X-Upstream"
}

Hasil pengujian:

X-Upstream: 172.19.0.5:3000
X-Upstream: 172.19.0.4:3000
X-Upstream: 172.19.0.3:3000
X-Upstream: 172.19.0.5:3000
X-Upstream: 172.19.0.4:3000
X-Upstream: 172.19.0.3:3000
X-Upstream: 172.19.0.5:3000
X-Upstream: 172.19.0.4:3000
X-Upstream: 172.19.0.3:3000
X-Upstream: 172.19.0.5:3000

Hasil menunjukkan bahwa request berhasil diarahkan secara bergantian ke ketiga replica backend.

### B. Rate Limiting (HTTP 429)

Pengujian dilakukan dengan mengirimkan 30 request secara bersamaan ke endpoint `/api/pets`.

Perintah:

$jobs = 1..30 | ForEach-Object {
    Start-Job -ScriptBlock {
        curl.exe -sS -o NUL -w "%{http_code}`n" http://localhost/api/pets
    }
}

$jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

Hasil pengujian:

200
200
200
200
200
200
200
200
200
200
200
429
200
429
200
429
200
429
200
429
200
429
200
429
200
429
200
429
200
429

Status HTTP `429` menunjukkan bahwa Nginx berhasil menolak request yang melampaui batas rate limiting.

### C. Security Header

Perintah:

curl.exe -sS -D - -o NUL http://localhost/api/pets

Hasil pengujian:

HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-Upstream: 172.19.0.5:3000

Header `X-Content-Type-Options: nosniff` berhasil dikirimkan dalam respons HTTP.

### D. Gzip Compression

Pengujian dilakukan dengan meminta respons menggunakan `Accept-Encoding: gzip`.

Perintah:

curl.exe -sS -D - -o NUL -H "Accept-Encoding: gzip" http://localhost/api/pets

Hasil pengujian:

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Vary: Accept-Encoding
X-Upstream: 172.19.0.4:3000
Content-Encoding: gzip

Header `Content-Encoding: gzip` membuktikan bahwa respons JSON berhasil dikompresi menggunakan Gzip.

### E. Isolasi Port Backend

Pengujian dilakukan untuk memastikan backend tidak dapat diakses langsung melalui host pada port `3000`.

Perintah:

Test-NetConnection localhost -Port 3000

Hasil pengujian:

ComputerName     : localhost
RemoteAddress    : ::1
RemotePort       : 3000
PingSucceeded    : True
TcpTestSucceeded : False

Nilai `TcpTestSucceeded: False` menunjukkan bahwa koneksi langsung ke port backend dari host gagal. Akses aplikasi dilakukan melalui Nginx pada port `80`.

## 5. Jawaban Pertanyaan Evaluasi

### A. Kenapa upstream perlu zone? Apa yang terjadi jika dihapus?

Direktif `zone` menyediakan shared memory agar seluruh worker process Nginx dapat berbagi informasi dan status upstream. Pada konfigurasi ini, `zone` juga diperlukan jika menggunakan fitur `resolve` untuk memperbarui alamat IP backend berdasarkan DNS Docker. Jika `zone` dihapus sementara `resolve` tetap digunakan, konfigurasi Nginx akan gagal divalidasi. Untuk upstream statis tanpa `resolve`, load balancing dasar masih dapat berjalan.

### B. Kenapa limit_req_status diganti ke 429? Apa bedanya dengan bawaan Nginx?

Secara default, Nginx menggunakan HTTP `503 Service Temporarily Unavailable` ketika request ditolak oleh modul `limit_req`. Status `429 Too Many Requests` lebih tepat untuk menunjukkan bahwa client mengirimkan terlalu banyak request dalam waktu tertentu. Dengan demikian, client dapat mengetahui bahwa permintaannya dibatasi oleh rate limiting, bukan karena server mengalami gangguan.

### C. Kenapa backend dan database tidak punya ports, dan Nginx menjangkau backend lewat apa?

Backend dan database tidak memiliki `ports` agar port internal keduanya tidak dipublikasikan secara langsung ke host. Nginx menjadi satu-satunya pintu masuk dari luar melalui port `80`. Nginx menjangkau backend melalui Docker network `vetcare-network` menggunakan DNS service name `backend:3000`, sedangkan backend mengakses database melalui `database:5432`.

---

**Repository GitHub:**  
Tambahkan link repository GitHub kamu di sini setelah repository diatur menjadi public.
