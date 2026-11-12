# VetCare API — Tugas 2

VetCare API adalah REST API untuk sistem manajemen klinik hewan yang dibangun menggunakan Node.js, TypeScript, Express.js, Prisma ORM, dan PostgreSQL. Pada Tugas 2, aplikasi dijalankan menggunakan Docker Compose dengan Nginx sebagai reverse proxy dan load balancer untuk tiga replica backend.

## 1. Arsitektur dan Konfigurasi

Nginx menjadi satu-satunya pintu masuk aplikasi dari host.

| Komponen | Konfigurasi |
|---|---|
| Nginx | Menerima request dari host melalui port `80` |
| Backend | Berjalan dengan 3 replica pada port internal `3000` |
| Database | PostgreSQL pada port internal `5432` |
| Load balancing | Nginx upstream menggunakan `zone`; respons menyertakan header `X-Upstream` |
| Rate limiting | Membatasi request pada rute `/api/` dan mengembalikan HTTP `429` saat batas terlampaui |
| Security header | Mengirimkan header `X-Content-Type-Options: nosniff` |
| Gzip | Mengaktifkan kompresi untuk respons JSON |

Backend dan database tidak memiliki konfigurasi `ports`, sehingga tidak dapat diakses langsung melalui port host. Akses dari host dilakukan melalui Nginx.

## 2. Struktur Folder

```text
vetcare-api/
├── nginx/
│   └── nginx.conf
├── prisma/
│   ├── migrations/
│   │   └── 20261112000000_init/
│   │       └── migration.sql
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── validations/
│   ├── app.ts
│   └── server.ts
├── .dockerignore
├── .env.example
├── .gitignore
├── compose.yaml
├── docker-entrypoint.sh
├── Dockerfile
├── package.json
├── package-lock.json
├── tsconfig.json
├── vetcare-api.postman_collection.json
└── README.md
```

## 3. Cara Menjalankan Aplikasi

### Prasyarat

- Docker Desktop
- Docker Compose
- Port `80` tidak sedang digunakan aplikasi lain

### Langkah menjalankan

1. Salin file environment jika belum tersedia:

```powershell
Copy-Item .env.example .env
```

2. Build image dan jalankan seluruh service dengan 3 replica backend:

```powershell
docker compose up -d --build --scale backend=3
```

3. Periksa container yang berjalan:

```powershell
docker compose ps
```

4. Periksa jumlah replica backend:

```powershell
(docker compose ps -q backend).Count
```

Hasil yang diharapkan:

```text
3
```

5. Periksa konfigurasi Nginx:

```powershell
docker compose exec nginx nginx -t
```

Hasil:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

6. Untuk menghentikan aplikasi:

```powershell
docker compose down
```

## 4. Bukti Pengujian

### A. Load Balancing

Pengujian dilakukan untuk memastikan request didistribusikan ke tiga replica backend. Header `X-Upstream` menunjukkan alamat backend yang menangani request.

#### Perintah

```powershell
1..10 | ForEach-Object {
    curl.exe -sS -D - -o NUL http://localhost/health |
    Select-String -Pattern "X-Upstream"
}
```

#### Hasil pengujian

```text
X-Upstream: 172.19.0.4:3000
X-Upstream: 172.19.0.3:3000
X-Upstream: 172.19.0.5:3000
X-Upstream: 172.19.0.4:3000
X-Upstream: 172.19.0.3:3000
X-Upstream: 172.19.0.5:3000
X-Upstream: 172.19.0.4:3000
X-Upstream: 172.19.0.3:3000
X-Upstream: 172.19.0.5:3000
X-Upstream: 172.19.0.4:3000
```

Hasil menunjukkan bahwa request berhasil diarahkan ke ketiga replica backend.

### B. Rate Limiting (HTTP 429)

Pengujian dilakukan dengan mengirimkan 30 request secara bersamaan ke endpoint `/api/pets`.

#### Perintah

```powershell
$jobs = 1..30 | ForEach-Object {
    Start-Job -ScriptBlock {
        curl.exe -sS -o NUL -w "%{http_code}`n" http://localhost/api/pets
    }
}
$jobs | Wait-Job | Receive-Job
$jobs | Remove-Job
```

#### Hasil pengujian

```text
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
429
200
429
200
200
429
```

Status HTTP `429` menunjukkan bahwa request yang melampaui batas rate limiting ditolak oleh Nginx.

### C. Security Header

#### Perintah

```powershell
curl.exe -sS -D - -o NUL http://localhost/api/pets
```

#### Hasil pengujian

```text
HTTP/1.1 200 OK
Server: nginx/1.31.8
Date: Thu, 12 Nov 2026 15:40:09 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 2756
Connection: keep-alive
Vary: Accept-Encoding
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-a[...]
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Access-Control-Allow-Origin: *
ETag: W/"ac4-0GuXztp/h/qFrCfA2cLtNd/pqew"
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Upstream: 172.19.0.4:3000
```

Header `X-Content-Type-Options: nosniff` berhasil dikirimkan dalam respons HTTP. Hasil pengujian juga menunjukkan beberapa header muncul lebih dari satu kali.

### D. Gzip Compression

Pengujian dilakukan dengan meminta respons menggunakan header `Accept-Encoding: gzip`.

#### Perintah

```powershell
curl.exe -sS -D - -o NUL -H "Accept-Encoding: gzip" http://localhost/api/pets
```

#### Hasil pengujian

```text
HTTP/1.1 200 OK
Server: nginx/1.31.8
Date: Thu, 12 Nov 2026 15:41:52 GMT
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
Connection: keep-alive
Vary: Accept-Encoding
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-a[...]
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Access-Control-Allow-Origin: *
ETag: W/"ac4-0GuXztp/h/qFrCfA2cLtNd/pqew"
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Upstream: 172.19.0.3:3000
Content-Encoding: gzip
```

Header `Content-Encoding: gzip` menunjukkan bahwa respons berhasil dikompresi menggunakan Gzip.

### E. Isolasi Port Backend

Pengujian dilakukan untuk memastikan backend tidak dapat diakses langsung melalui host pada port `3000`.

#### Perintah

```powershell
Test-NetConnection localhost -Port 3000
```

#### Hasil pengujian

```text
ComputerName     : localhost
RemoteAddress    : ::1
RemotePort       : 3000
PingSucceeded    : True
TcpTestSucceeded : False
```

Nilai `TcpTestSucceeded: False` menunjukkan bahwa koneksi langsung dari host ke port backend gagal. Akses aplikasi dilakukan melalui Nginx pada port `80`.

## 5. Jawaban Pertanyaan

### A. Kenapa upstream perlu `zone`? Apa yang terjadi jika dihapus?

Zone digunakan sebagai shared memory agar seluruh worker Nginx dapat berbagi informasi tentang upstream. Dengan adanya zone, pengelolaan informasi backend menjadi lebih terpusat dan mendukung fitur upstream dinamis. Jika zone dihapus, load balancing dasar masih dapat berjalan, tetapi fitur tertentu yang membutuhkan shared memory tidak dapat digunakan.

### B. Kenapa `limit_req_status` diganti ke `429`? Apa bedanya dengan bawaan Nginx?

Secara default, Nginx menggunakan status 503 saat request terkena rate limit. Status 429 Too Many Requests lebih sesuai karena menunjukkan bahwa client mengirim terlalu banyak request dalam waktu tertentu.

Karena itu, `429` memberikan informasi yang lebih sesuai untuk kondisi rate limiting.

### C. Kenapa backend dan database tidak punya `ports`, dan Nginx menjangkau backend lewat apa?

Backend dan database tidak menggunakan ports agar tidak bisa diakses langsung dari luar. Nginx menjadi satu-satunya pintu masuk melalui port 80. Nginx mengakses backend melalui Docker network menggunakan backend:3000, sedangkan backend mengakses database melalui database:5432.