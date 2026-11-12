# VetCare API — Veterinary Clinic Management System

Backend REST API untuk sistem manajemen klinik hewan (**Veterinary Clinic Management System**) yang dibangun menggunakan Node.js LTS, TypeScript, Express.js, Prisma ORM, PostgreSQL, dan Nginx Reverse Proxy dengan orkestrasi **Docker Compose**. Proyek ini dirancang secara modular, terstruktur, type-safe, serta mendukung persistensi data penuh menggunakan Docker Named Volumes.

---

## Ringkasan Pembaruan Tugas 2 (Tugas 2 Overview)

Pada **Tugas 2**, arsitektur sistem VetCare ditingkatkan dari *single-instance backend* menjadi arsitektur *production-grade reverse proxy & high-availability load balancing*:

1. **Nginx Reverse Proxy sebagai Satu-Satunya Pintu Masuk:**
   - Nginx menjadi satu-satunya service yang mengekspos port ke host machine (`0.0.0.0:80->80/tcp`).
   - Service `backend` dan `database` tidak memiliki konfigurasi `ports` (isolasi port penuh di level host).
2. **Backend 3 Replicas (High Availability):**
   - Service `backend` dijalankan sebanyak **3 replika/container** (`sc-backend-1`, `sc-backend-2`, `sc-backend-3`) menggunakan konfigurasi image yang identik.
   - Ketiga replika backend terhubung ke satu database PostgreSQL bersama (`vetcare-postgres`) melalui Docker virtual bridge network (`vetcare-network`).
3. **Round-Robin Load Balancing dengan Upstream Zone:**
   - Nginx mendistribusikan beban request secara merata ke ketiga instance backend menggunakan `upstream` dengan direktif `zone`.
   - Nginx menambahkan response header `X-Upstream: $upstream_addr` untuk membuktikan secara transparan instance backend mana yang menangani request.
4. **Rate Limiting:**
   - Diterapkan `limit_req_zone` berukuran 10MB dengan rate `5r/s` dan `burst=5 nodelay` pada rute API `/api/`.
   - Menggunakan `limit_req_status 429` (HTTP 429 Too Many Requests) sesuai standar RFC 6585.
5. **Security Headers:**
   - Header keamanan HTTP disematkan secara global dengan parameter `always`, termasuk `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, dan `X-XSS-Protection: 1; mode=block`.
6. **Kompresi Gzip Dinamis:**
   - Kompresi Gzip aktif (`gzip on;`) untuk MIME type `application/json` dengan `gzip_proxied any` dan `gzip_min_length 256` untuk menghemat bandwidth transfer data API.

---

## Daftar Isi
- [1. Arsitektur Sistem Tugas 2](#1-arsitektur-sistem-tugas-2)
- [2. Struktur Folder Proyek](#2-struktur-folder-proyek)
- [3. Panduan Menjalankan Aplikasi](#3-panduan-menjalankan-aplikasi)
- [4. Bukti Hasil Pengujian Nyata (Terminal Outputs)](#4-bukti-hasil-pengujian-nyata-terminal-outputs)
  - [A. Bukti Load Balancing (Rotasi X-Upstream)](#a-bukti-load-balancing-rotasi-x-upstream)
  - [B. Bukti Rate Limiting (HTTP 429 Too Many Requests)](#b-bukti-rate-limiting-http-429-too-many-requests)
  - [C. Bukti Security Headers (X-Content-Type-Options: nosniff)](#c-bukti-security-headers-x-content-type-options-nosniff)
  - [D. Bukti Gzip Compression (Content-Encoding: gzip)](#d-bukti-gzip-compression-content-encoding-gzip)
  - [E. Bukti Isolasi Port (Host vs Container)](#e-bukti-isolasi-port-host-vs-container)
- [5. Jawaban Pertanyaan Evaluasi Tugas 2](#5-jawaban-pertanyaan-evaluasi-tugas-2)
- [6. Fitur Utama & Modul API VetCare](#6-fitur-utama--modul-api-vetcare)
- [7. Dokumentasi Endpoint REST API](#7-dokumentasi-endpoint-rest-api)
- [8. Pengujian Persistensi Database](#8-pengujian-persistensi-database)
- [9. Referensi & Bantuan AI](#9-referensi--bantuan-ai)

---

## 1. Arsitektur Sistem Tugas 2

```
                                  +---------------------------------------+
                                  |         Host Client / Browser         |
                                  +---------------------------------------+
                                                      |
                                          HTTP Request|Port 80:80
                                          (Port 3000 & 5432 CLOSED)
                                                      v
+---------------------------------------------------------------------------------------------------+
| Docker Network: vetcare-network                                                                   |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                                  vetcare-nginx (Nginx 1.31)                                 |  |
|  |  - Single Entry Point (Port 80)                                                             |  |
|  |  - Rate Limiting: 5r/s (HTTP 429)                                                           |  |
|  |  - Gzip Compression: on (application/json)                                                  |  |
|  |  - Security Headers: X-Content-Type-Options: nosniff (always)                                |  |
|  |  - Header Tracking: X-Upstream: $upstream_addr                                              |  |
|  +---------------------------------------------------------------------------------------------+  |
|                            |                              |                              |        |
|             Round-Robin    |               Round-Robin    |               Round-Robin    |        |
|             Load Balance   |               Load Balance   |               Load Balance   |        |
|                            v                              v                              v        |
|               +-------------------------+    +-------------------------+    +------------------+  |
|               |      sc-backend-1       |    |      sc-backend-2       |    |   sc-backend-3   |  |
|               |    (Replica 1 : 3000)   |    |    (Replica 2 : 3000)   |    | (Replica 3: 3000)|  |
|               |    Internal Port ONLY   |    |    Internal Port ONLY   |    |Internal Port ONLY|  |
|               +-------------------------+    +-------------------------+    +------------------+  |
|                            \                              |                              /        |
|                             \                             |                             /         |
|                              +----------------------------+----------------------------+          |
|                                                           | Prisma ORM Connection                 |
|                                                           v                                       |
|                                              +-------------------------+                          |
|                                              |    vetcare-postgres     |                          |
|                                              |     (PostgreSQL 16)     |                          |
|                                              |    Internal Port 5432   |                          |
|                                              |    (No Host Port Open)  |                          |
|                                              +-------------------------+                          |
|                                                           |                                       |
|                                                           v                                       |
|                                              +-------------------------+                          |
|                                              |   Named Docker Volume   |                          |
|                                              |  vetcare_postgres_data  |                          |
|                                              +-------------------------+                          |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Struktur Folder Proyek

```
vetcare-api/
├── nginx/
│   └── nginx.conf                 # Konfigurasi Nginx: Reverse Proxy, Upstream Zone, Rate Limit, Gzip
├── prisma/
│   ├── migrations/
│   │   └── 20261112000000_init/
│   │       └── migration.sql      # DDL SQL skema database awal
│   ├── schema.prisma              # Definisi model, enum, relasi Prisma ORM
│   └── seed.ts                    # Script database seeding (idempotent)
├── src/
│   ├── config/
│   │   ├── env.ts                 # Validasi variabel lingkungan
│   │   ├── prisma.ts              # Inisialisasi Prisma Client singleton
│   │   └── swagger.ts             # Dokumentasi OpenAPI 3.0 & Swagger UI
│   ├── controllers/               # Controller HTTP request-response
│   ├── middlewares/               # Error handling terpusat, Zod validator, 404 handler
│   ├── routes/                    # Express modular router
│   ├── services/                  # Business logic & interaksi Prisma ORM
│   ├── types/                     # Antarmuka TypeScript & kontrak response API
│   ├── validations/               # Zod schema validation
│   ├── app.ts                     # Konfigurasi aplikasi Express
│   └── server.ts                  # Server entrypoint & graceful shutdown
├── .dockerignore                  # Pengecualian build image Docker
├── .env.example                   # Template variabel lingkungan
├── .gitignore
├── compose.yaml                   # Definisi Docker Compose (Nginx, 3 Backend Replicas, Postgres)
├── docker-compose.yml             # Mirror compose.yaml untuk kompatibilitas penuh
├── docker-entrypoint.sh           # Otomatisasi migrasi dan seeding container backend
├── Dockerfile                     # Multi-stage production build container backend
├── package.json
├── tsconfig.json
├── vetcare-api.postman_collection.json # Koleksi pengujian siap pakai (Postman & Thunder Client)
└── README.md                      # Dokumentasi lengkap proyek
```

---

## 3. Panduan Menjalankan Aplikasi

### A. Prasyarat
- **Docker Desktop** (dengan Docker Engine dan Docker Compose aktif).
- Port 80 host tidak sedang digunakan oleh aplikasi lain.

### B. Konfigurasi Environment File
Salin file environment template:
```bash
cp .env.example .env
```
*(Di Windows PowerShell: `Copy-Item .env.example .env`)*

### C. Build Docker Images
Bangun image backend dari source code:
```bash
docker compose build
```

### D. Menjalankan Seluruh Service (Nginx, 3 Replicas Backend, PostgreSQL)
Jalankan seluruh service dalam mode background/detached:
```bash
docker compose up -d
```
> **Catatan:** Docker Compose akan otomatis membuat 1 container database (`vetcare-postgres`), 3 container replika backend (`sc-backend-1`, `sc-backend-2`, `sc-backend-3`), dan 1 container reverse proxy (`vetcare-nginx`).

Jika Anda ingin menjalankan atau menyesuaikan jumlah replika secara eksplisit melalui terminal:
```bash
docker compose up --scale backend=3 -d
```

### E. Memeriksa Status Container
Periksa apakah seluruh service berjalan normal:
```bash
docker compose ps
```

Hasil nyata dari status container:
```text
NAME               IMAGE                COMMAND                  SERVICE    STATUS                    PORTS
sc-backend-1       sc-backend           "./docker-entrypoint…"   backend    Up (running)              3000/tcp
sc-backend-2       sc-backend           "./docker-entrypoint…"   backend    Up (running)              3000/tcp
sc-backend-3       sc-backend           "./docker-entrypoint…"   backend    Up (running)              3000/tcp
vetcare-nginx      nginx:alpine         "/docker-entrypoint.…"   nginx      Up (running)              0.0.0.0:80->80/tcp, [::]:80->80/tcp
vetcare-postgres   postgres:16-alpine   "docker-entrypoint.s…"   database   Up (healthy)              5432/tcp
```

### F. Menghentikan Seluruh Aplikasi
Untuk mematikan seluruh container secara aman tanpa menghilangkan data database:
```bash
docker compose down
```

---

## 4. Bukti Hasil Pengujian Nyata (Terminal Outputs)

Pengujian berikut dijalankan langsung pada sistem menggunakan perintah `curl`. Seluruh output di bawah ini merupakan teks hasil eksekusi terminal nyata.

### A. Bukti Load Balancing (Rotasi X-Upstream)
Nginx mendistribusikan request secara bergiliran (*round-robin*) ke ketiga alamat IP container backend (`172.19.0.3:3000`, `172.19.0.4:3000`, `172.19.0.5:3000`).

**Perintah Terminal:**
```bash
for i in {1..6}; do curl -s -I http://localhost/health | grep -i "X-Upstream"; done
```

**Output Terminal:**
```text
X-Upstream: 172.19.0.4:3000
X-Upstream: 172.19.0.3:3000
X-Upstream: 172.19.0.5:3000
X-Upstream: 172.19.0.4:3000
X-Upstream: 172.19.0.3:3000
X-Upstream: 172.19.0.5:3000
```
> **Analisis:** Header `X-Upstream` berganti secara konsisten melintasi ketiga container backend, membuktikan bahwa mekanisme load balancing Nginx berfungsi 100%.

---

### B. Bukti Rate Limiting (HTTP 429 Too Many Requests)
Rute `/api/` diproteksi dengan limit 5 request per detik dan toleransi burst 5 request (`limit_req zone=api_limit burst=5 nodelay;`). Ketika terjadi lonjakan request cepat, Nginx mengembalikan status `429 Too Many Requests`.

**Perintah Terminal (Pengujian Status Code):**
```bash
for i in {1..10}; do curl -s -o /dev/null -w "Request $i : HTTP %{http_code}\n" http://localhost/api/pets; done
```

**Output Terminal:**
```text
Request 1 : HTTP 200
Request 2 : HTTP 200
Request 3 : HTTP 200
Request 4 : HTTP 200
Request 5 : HTTP 200
Request 6 : HTTP 200
Request 7 : HTTP 429
Request 8 : HTTP 200
Request 9 : HTTP 429
Request 10 : HTTP 429
```

**Detail Response Lengkap saat Terkena Throttling (HTTP 429):**
```http
HTTP/1.1 429 Too Many Requests
Server: nginx/1.31.8
Date: Thu, 12 Nov 2026 11:50:52 GMT
Content-Type: text/html
Content-Length: 169
Connection: keep-alive
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block

<html>
<head><title>429 Too Many Requests</title></head>
<body>
<center><h1>429 Too Many Requests</h1></center>
<hr><center>nginx/1.31.8</center>
</body>
</html>
```
> **Analisis:** Nginx menolak kelebihan request dengan status HTTP 429, dan security headers tetap disertakan.

---

### C. Bukti Security Headers (X-Content-Type-Options: nosniff)
Header keamanan `X-Content-Type-Options: nosniff` selalu diberikan pada setiap respons menggunakan parameter `always`.

**Perintah Terminal:**
```bash
curl -I http://localhost/health
```

**Output Terminal:**
```http
HTTP/1.1 200 OK
Server: nginx/1.31.8
Date: Thu, 12 Nov 2026 11:51:01 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 100
Connection: keep-alive
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
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
ETag: W/"64-Zd0FqsJaA+ezC/LNnrnBFbH6B5A"
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Upstream: 172.19.0.5:3000
```
> **Analisis:** Header `X-Content-Type-Options: nosniff` berhasil diterima klien.

---

### D. Bukti Gzip Compression (Content-Encoding: gzip)
Respons payload JSON yang memenuhi syarat panjang minimum (`gzip_min_length 256`) dikompresi menjadi Gzip saat klien menyertakan header `Accept-Encoding: gzip`.

**Perintah Terminal:**
```bash
curl -I -H "Accept-Encoding: gzip" http://localhost/api/pets
```

**Output Terminal:**
```http
HTTP/1.1 200 OK
Server: nginx/1.31.8
Date: Thu, 12 Nov 2026 11:51:07 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Vary: Accept-Encoding
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
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
Content-Encoding: gzip
```
> **Analisis:** Terdapat header `Content-Encoding: gzip` dan `Vary: Accept-Encoding`, membuktikan modul gzip Nginx aktif mengompresi response backend.

---

### E. Bukti Isolasi Port (Host vs Container)
Akses langsung ke port lama backend (port 3000) dan port database (port 5432) ditolak/timeout karena port tersebut tidak lagi dipublikasikan ke host. Akses aplikasi kini hanya dapat dilakukan secara sah melalui port 80 Nginx.

**Perintah Terminal:**
```bash
# 1. Mengakses port host backend (3000) -> GAGAL / TIMEOUT
curl --connect-timeout 2 http://localhost:3000

# 2. Mengakses port host database (5432) -> GAGAL / TIMEOUT
curl --connect-timeout 2 http://localhost:5432

# 3. Mengakses port host Nginx (80) -> BERHASIL
curl -s -I http://localhost/health | grep -i "HTTP/1.1"
```

**Output Terminal:**
```text
curl: (28) Connection timed out after 2007 milliseconds
curl: (28) Connection timed out after 2013 milliseconds
HTTP/1.1 200 OK
```
> **Analisis:** Port backend 3000 dan port PostgreSQL 5432 tertutup rapat dari luar host. Nginx menjadi satu-satunya gerbang masuk aplikasi.

---

## 5. Jawaban Pertanyaan Evaluasi Tugas 2

### 1. Kenapa upstream perlu zone? Apa yang terjadi kalau dihapus?
Direktif `zone` pada blok `upstream` mendefinisikan segmen memori bersama (*shared memory*) yang dapat diakses oleh seluruh *worker process* Nginx untuk menyimpan daftar server upstream serta status dinamisnya (seperti counter pembagian beban round-robin dan tracking kegagalan koneksi). Jika direktif `zone` dihapus, setiap *worker process* Nginx akan menyimpan status upstream secara terpisah pada memori lokal masing-masing proses, yang mengakibatkan pembagian beban (*load balancing*) menjadi tidak merata dan penghitungan status kegagalan replika backend menjadi tidak konsisten antar-worker.

### 2. Kenapa limit_req_status diganti ke 429? Apa bedanya dengan bawaan Nginx?
Secara default, Nginx menggunakan HTTP status code **503 Service Temporarily Unavailable** ketika permintaan melampaui ambang batas rate limiting, yang secara semantik keliru karena kode 503 mengindikasikan gangguan atau pemeliharaan pada server itu sendiri. Mengubah `limit_req_status` ke **429 Too Many Requests** mematuhi standar RFC 6585 untuk REST API modern, yang secara eksplisit memberitahukan klien bahwa mereka telah melampaui kuota permintaan (*client-side rate limit*) sehingga aplikasi klien dapat menerapkan mekanisme *backoff* atau *retry* secara tepat.

### 3. Kenapa backend dan database tidak punya ports, dan Nginx menjangkau backend lewat apa?
Direktif `ports` pada service backend dan database dihapus untuk menerapkan prinsip *network isolation* dan *least privilege*, sehingga port internal aplikasi dan database tidak dapat diakses atau diserang langsung oleh pihak luar melalui antarmuka host. Nginx menjangkau ketiga replika backend melalui jaringan virtual internal Docker (`vetcare-network`) memanfaatkan mekanisme *embedded DNS server* Docker (`127.0.0.11`) pada nama service `backend:3000`.

---

## 6. Fitur Utama & Modul API VetCare

Seluruh fitur operasional dari Tugas 1 dipertahankan dan berjalan sempurna:

| Modul | Endpoint Prefix | Deskripsi Fitur |
|---|---|---|
| **System** | `/health`, `/`, `/docs` | Health check koneksi DB, info API, dan Swagger UI |
| **Pet Owners** | `/api/owners` | CRUD pemilik hewan, proteksi email unik |
| **Pets** | `/api/pets` | CRUD data hewan, filter berdasarkan pemilik (`/owner/:ownerId`) |
| **Veterinarians** | `/api/veterinarians` | CRUD dokter hewan, spesialisasi, dan kontak unik |
| **Appointments** | `/api/appointments` | Pembuatan jadwal kunjungan, filter per hewan, update status |
| **Medical Records** | `/api/medical-records` | Rekam medis terintegrasi dengan jadwal pemeriksaan dan dokter |
| **Payments** | `/api/payments` | Pencatatan tagihan, filter per pemilik, perubahan status bayar |

---

## 7. Dokumentasi Endpoint REST API

Setelah container berjalan, API dapat diakses pada:
- **Base URL:** `http://localhost`
- **Interactive Swagger UI:** [http://localhost/docs](http://localhost/docs)
- **Health Check Endpoint:** [http://localhost/health](http://localhost/health)

### Ringkasan Endpoint

#### 1. System Endpoints
- `GET /` — Informasi sistem & daftar modul
- `GET /health` — Status kesehatan database & uptime
- `GET /docs` — Swagger UI API Documentation

#### 2. Pet Owners
- `GET /api/owners` — Mengambil seluruh pemilik
- `GET /api/owners/:id` — Detail pemilik berdasarkan ID
- `POST /api/owners` — Mendaftarkan pemilik baru
- `PUT /api/owners/:id` — Memperbarui data pemilik
- `DELETE /api/owners/:id` — Menghapus pemilik

#### 3. Pets
- `GET /api/pets` — Mengambil seluruh hewan
- `GET /api/pets/:id` — Detail hewan
- `GET /api/pets/owner/:ownerId` — Daftar hewan berdasarkan ID pemilik
- `POST /api/pets` — Mendaftarkan hewan baru
- `PUT /api/pets/:id` — Memperbarui data hewan
- `DELETE /api/pets/:id` — Menghapus data hewan

#### 4. Veterinarians
- `GET /api/veterinarians` — Mengambil seluruh dokter hewan
- `GET /api/veterinarians/:id` — Detail dokter
- `POST /api/veterinarians` — Mendaftarkan dokter baru
- `PUT /api/veterinarians/:id` — Memperbarui informasi dokter
- `DELETE /api/veterinarians/:id` — Menghapus data dokter

#### 5. Appointments
- `GET /api/appointments` — Mengambil seluruh jadwal
- `GET /api/appointments/:id` — Detail jadwal kunjungan
- `GET /api/appointments/pet/:petId` — Jadwal untuk hewan tertentu
- `POST /api/appointments` — Membuat jadwal kunjungan
- `PUT /api/appointments/:id` — Memperbarui jadwal
- `PATCH /api/appointments/:id/status` — Memperbarui status jadwal (`SCHEDULED`, `COMPLETED`, `CANCELLED`)

#### 6. Medical Records
- `GET /api/medical-records` — Mengambil seluruh rekam medis
- `GET /api/medical-records/:id` — Detail rekam medis
- `GET /api/medical-records/pet/:petId` — Rekam medis untuk hewan tertentu
- `POST /api/medical-records` — Membuat rekam medis

#### 7. Payments
- `GET /api/payments` — Mengambil seluruh transaksi pembayaran
- `GET /api/payments/:id` — Detail transaksi
- `GET /api/payments/owner/:ownerId` — Pembayaran berdasarkan ID pemilik
- `POST /api/payments` — Mencatat transaksi baru
- `PATCH /api/payments/:id/status` — Memperbarui status bayar (`PENDING`, `PAID`, `CANCELLED`)

---

## 8. Pengujian Persistensi Database

Data operasional klinik disimpan secara aman pada named volume Docker `vetcare_postgres_data`.

Untuk menguji bahwa data tidak hilang saat container dibuat ulang:
1. Daftarkan hewan baru:
   ```bash
   curl -X POST http://localhost/api/pets \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"Simba\",\"species\":\"CAT\",\"breed\":\"Persian\",\"gender\":\"Male\",\"dateOfBirth\":\"2024-02-14\",\"weight\":3.8,\"ownerId\":1}"
   ```
2. Hentikan container:
   ```bash
   docker compose down
   ```
3. Jalankan kembali:
   ```bash
   docker compose up -d
   ```
4. Cek kembali data:
   ```bash
   curl http://localhost/api/pets
   ```
   Data **Simba** tetap tersedia dan tidak hilang.

---

## 9. Referensi & Bantuan AI

- Dokumentasi Resmi Nginx: [https://nginx.org/en/docs/](https://nginx.org/en/docs/)
- Dokumentasi Docker Compose Specification: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
- Dokumentasi Prisma ORM: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- RFC 6585 (Additional HTTP Status Codes - 429 Too Many Requests): [https://datatracker.ietf.org/doc/html/rfc6585](https://datatracker.ietf.org/doc/html/rfc6585)
- Bantuan AI: Disusun dan diimplementasikan dengan bantuan Antigravity AI Assistant (DeepMind) untuk konfigurasi Nginx reverse proxy, load balancing shared zone, rate limiting Zod/Nginx, dan verifikasi terminal testing.
