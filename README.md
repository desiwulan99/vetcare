# VetCare API — Veterinary Clinic Management System

Backend REST API untuk sistem manajemen klinik hewan (**Veterinary Clinic Management System**) yang dibangun menggunakan Node.js LTS, TypeScript, Express.js, Prisma ORM, dan PostgreSQL dengan orkestrasi **Docker Compose**. Proyek ini dirancang secara modular, terstruktur, type-safe, serta mendukung persistensi data penuh menggunakan Docker Named Volumes.

---

## Daftar Isi
- [1. Deskripsi Proyek](#1-deskripsi-proyek)
- [2. Fitur Utama & Modul](#2-fitur-utama--modul)
- [3. Teknologi yang Digunakan](#3-teknologi-yang-digunakan)
- [4. Arsitektur Docker Compose](#4-arsitektur-docker-compose)
- [5. Struktur Folder Proyek](#5-struktur-folder-proyek)
- [6. Prasyarat Sistem](#6-prasyarat-sistem)
- [7. Instalasi & Setup Cepat](#7-instalasi--setup-cepat)
- [8. Menjalankan Aplikasi dengan Docker Compose](#8-menjalankan-aplikasi-dengan-docker-compose)
- [9. Dokumentasi API & Endpoint](#9-dokumentasi-api--endpoint)
- [10. Migrasi & Seeding Database](#10-migrasi--seeding-database)
- [11. Pengujian Persistensi Data (Persistence Testing)](#11-pengujian-persistensi-data-persistence-testing)
- [12. Troubleshooting Umum](#12-troubleshooting-umum)
- [13. Referensi & Penggunaan AI](#13-referensi--penggunaan-ai)

---

## 1. Deskripsi Proyek

**VetCare API** adalah sistem backend yang mengelola seluruh aktivitas operasional klinik hewan secara terpusat, mulai dari pencatatan data pemilik dan pasien hewan peliharaan, registrasi dokter spesialis, penjadwalan konsultasi medis, rekam resep dan diagnosis pengobatan, hingga transaksi pembayaran klinik.

### Prinsip Desain
- **Separation of Concerns:** Pemisahan ketat antara Route, Middleware, Validation, Controller, Service, dan ORM.
- **Data Integrity & Relational Safety:** Menggunakan relasi *Foreign Key* dengan constraint `onDelete: Restrict` untuk mencegah terhapusnya riwayat rekam medis dan janji temu secara tidak disengaja.
- **Zero-Crash & Centralized Error Handling:** Menangani error validasi Zod, constraint database Prisma (P2002 duplicate, P2003 foreign key, P2025 not found), dan menyamarkan credential sensitif.
- **Docker-First Architecture:** Startup otomatis dengan healthcheck dependency, otomatisasi eksekusi migrasi, dan seed saat container dijalankan pertama kali.

---

## 2. Fitur Utama & Modul

Aplikasi menyediakan 6 modul operasional utama serta endpoint monitoring:

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

## 3. Teknologi yang Digunakan

- **Runtime:** Node.js LTS (v20+ / v26+)
- **Bahasa Pemrograman:** TypeScript 5.x
- **Framework Web:** Express.js 4.x
- **ORM & Database Tooling:** Prisma ORM 5.x
- **Database Relasional:** PostgreSQL 16 (Alpine Image)
- **Validasi Data:** Zod (Type-safe runtime schema validator)
- **Keamanan & Utilitas:** Helmet, CORS, Morgan (Logger)
- **Dokumentasi API:** Swagger UI (`swagger-ui-express` & OpenAPI 3.0)
- **Containerization:** Docker (Multi-stage build)
- **Orkestrasi:** Docker Compose (v2+ / v5+)

---

## 4. Arsitektur Docker Compose

Sistem dideploy menggunakan arsitektur 2-tier container dalam satu virtual bridge network (`vetcare-network`):

```
                        +-----------------------------------------+
                        |              Host Machine               |
                        +-----------------------------------------+
                                     |                |
                       Port 3000:3000|                |Port 5432:5432
                                     v                v
+--------------------------------------------------------------------------+
| Docker Network: vetcare-network                                          |
|                                                                          |
|  +---------------------------+              +-------------------------+  |
|  |     vetcare-backend       |              |    vetcare-postgres     |  |
|  |  (Node.js / Express API)  |              |     (PostgreSQL 16)     |  |
|  |                           |  depends_on  |                         |  |
|  |   DATABASE_URL:           | -----------> |   Healthcheck:          |  |
|  |   postgresql://...        | (healthy)    |   pg_isready            |  |
|  |   @database:5432/...      |              +-------------------------+  |
|  +---------------------------+                           |               |
|                                                          v               |
|                                             +-------------------------+  |
|                                             |   Named Volume:         |  |
|                                             |   vetcare_postgres_data |  |
|                                             |   (/var/lib/postgresql) |  |
|                                             +-------------------------+  |
+--------------------------------------------------------------------------+
```

### Karakteristik Kunci:
1. **Service `database` (`vetcare-postgres`)**:
   - Menjalankan PostgreSQL 16 berbasis Alpine yang ringan.
   - Menggunakan healthcheck bawaan `pg_isready` setiap 5 detik.
   - Mengaitkan data ke **Named Volume** `vetcare_postgres_data` di host.
2. **Service `backend` (`vetcare-backend`)**:
   - Dibangun melalui multi-stage `Dockerfile` (`builder` dan `runner`).
   - Memiliki dependensi `condition: service_healthy` terhadap service `database`.
   - Menjalankan `docker-entrypoint.sh` saat booting: otomatis memverifikasi migrasi database (`prisma migrate deploy`) dan seeding data awal (`prisma:seed`) sebelum Express listening.

---

## 5. Struktur Folder Proyek

```
vetcare-api/
├── prisma/
│   ├── migrations/
│   │   └── 20261112000000_init/
│   │       └── migration.sql      # DDL SQL migrasi awal skema database
│   ├── schema.prisma              # Definisi model, relasi, dan enum Prisma
│   └── seed.ts                    # Script pengisian data contoh (idempotent)
├── src/
│   ├── config/
│   │   ├── env.ts                 # Parsing & validasi variabel lingkungan
│   │   ├── prisma.ts              # Inisialisasi Prisma Client singleton
│   │   └── swagger.ts             # Spesifikasi OpenAPI 3.0 & Swagger UI handler
│   ├── controllers/
│   │   ├── appointment.controller.ts
│   │   ├── medical-record.controller.ts
│   │   ├── owner.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── pet.controller.ts
│   │   └── veterinarian.controller.ts
│   ├── middlewares/
│   │   ├── error.middleware.ts    # Centralized error handler & Custom AppError
│   │   ├── not-found.middleware.ts# Handler 404 route tidak terdaftar
│   │   └── validate.middleware.ts # Zod schema validation middleware
│   ├── routes/
│   │   ├── appointment.routes.ts
│   │   ├── index.ts               # Agregator router utama (/api)
│   │   ├── medical-record.routes.ts
│   │   ├── owner.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── pet.routes.ts
│   │   └── veterinarian.routes.ts
│   ├── services/
│   │   ├── appointment.service.ts
│   │   ├── medical-record.service.ts
│   │   ├── owner.service.ts
│   │   ├── payment.service.ts
│   │   ├── pet.service.ts
│   │   └── veterinarian.service.ts
│   ├── types/
│   │   └── api-response.ts        # Interface kontrak standar response API
│   ├── validations/
│   │   ├── appointment.validation.ts
│   │   ├── medical-record.validation.ts
│   │   ├── owner.validation.ts
│   │   ├── payment.validation.ts
│   │   ├── pet.validation.ts
│   │   └── veterinarian.validation.ts
│   ├── app.ts                     # Konfigurasi aplikasi Express
│   └── server.ts                  # Entrypoint server & graceful shutdown
├── .dockerignore
├── .env.example                   # Template konfigurasi environment
├── .gitignore
├── docker-compose.yml             # Konfigurasi orkestrasi container & volume
├── docker-entrypoint.sh           # Script otomatisasi startup container backend
├── Dockerfile                     # Multi-stage production container build
├── package.json
├── tsconfig.json
├── vetcare-api.postman_collection.json # Koleksi pengujian siap pakai
└── README.md
```

---

## 6. Prasyarat Sistem

Sebelum menjalankan proyek, pastikan perangkat telah terpasang:
- **Docker Desktop** (dengan Docker Engine dan Docker Compose aktif).
- *(Opsional untuk dev lokal tanpa docker)*: Node.js LTS (v20+) & Git.

---

## 7. Instalasi & Setup Cepat

### Langkah 1: Clone Repository
```bash
git clone https://github.com/<username>/vetcare-api.git
cd vetcare-api
```

### Langkah 2: Salin File Environment
Salin file konfigurasi contoh `.env.example` menjadi `.env`:

**Linux/macOS:**
```bash
cp .env.example .env
```

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

Isi konfigurasi default dalam `.env`:
```env
PORT=3000
NODE_ENV=development
POSTGRES_USER=vetcare_user
POSTGRES_PASSWORD=example_password
POSTGRES_DB=vetcare_db
DATABASE_URL=postgresql://vetcare_user:example_password@database:5432/vetcare_db?schema=public
```

---

## 8. Menjalankan Aplikasi dengan Docker Compose

### Langkah 1: Build Docker Image
Bangun image backend dari source code:
```bash
docker compose build
```
*(atau `docker-compose build` jika menggunakan Compose v1)*

### Langkah 2: Jalankan Container (Detached Mode)
Nyalakan seluruh service di background:
```bash
docker compose up -d
```

### Langkah 3: Periksa Status Container
Pastikan container database dalam status `healthy` dan backend berstatus `Up`:
```bash
docker compose ps
```

Contoh output:
```text
NAME               IMAGE                COMMAND                  SERVICE    STATUS                    PORTS
vetcare-backend    sc-backend           "./docker-entrypoint…"   backend    Up 20 seconds             0.0.0.0:3000->3000/tcp
vetcare-postgres   postgres:16-alpine   "docker-entrypoint.s…"   database   Up 25 seconds (healthy)   0.0.0.0:5432->5432/tcp
```

### Langkah 4: Memeriksa Log Startup
Untuk melihat log proses migrasi, seeding, dan startup server:
```bash
docker compose logs -f backend
```

### Langkah 5: Menghentikan Container
Untuk mematikan container secara aman (tanpa menghapus data volume):
```bash
docker compose down
```

> [!WARNING]
> Jangan menambahkan flag `-v` (`docker compose down -v`) jika tidak ingin menghapus database volume dan seluruh data historis klinik hewan!

---

## 9. Dokumentasi API & Endpoint

Setelah container berjalan, API dapat diakses pada:
- **Base URL:** `http://localhost:3000`
- **Interactive Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Health Check Endpoint:** [http://localhost:3000/health](http://localhost:3000/health)

### Ringkasan Daftar Endpoint REST API:

#### 1. System Endpoints
| HTTP Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/` | Informasi nama API, versi, dokumentasi, dan tautan endpoint |
| `GET` | `/health` | Memeriksa status kesehatan server dan konektivitas database |
| `GET` | `/docs` | Halaman antarmuka interaktif Swagger UI |

#### 2. Pet Owners (Pemilik Hewan)
| HTTP Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/owners` | Menampilkan seluruh pemilik beserta daftar hewannya |
| `GET` | `/api/owners/:id` | Menampilkan detail pemilik berdasarkan ID |
| `POST` | `/api/owners` | Menambahkan pemilik hewan baru |
| `PUT` | `/api/owners/:id` | Memperbarui data pemilik berdasarkan ID |
| `DELETE` | `/api/owners/:id` | Menghapus pemilik hewan (dilindungi jika memiliki hewan) |

#### 3. Pets (Data Hewan)
| HTTP Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/pets` | Menampilkan seluruh hewan peliharaan beserta pemiliknya |
| `GET` | `/api/pets/:id` | Detail hewan beserta histori janji temu & rekam medis |
| `GET` | `/api/pets/owner/:ownerId` | Menampilkan seluruh hewan milik ID pemilik tertentu |
| `POST` | `/api/pets` | Mendaftarkan data hewan baru |
| `PUT` | `/api/pets/:id` | Memperbarui informasi hewan |
| `DELETE` | `/api/pets/:id` | Menghapus data hewan (dilindungi dari relasi aktif) |

#### 4. Veterinarians (Dokter Hewan)
| HTTP Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/veterinarians` | Menampilkan daftar seluruh dokter hewan |
| `GET` | `/api/veterinarians/:id` | Detail dokter beserta jadwal pemeriksaan |
| `POST` | `/api/veterinarians` | Menambahkan dokter baru |
| `PUT` | `/api/veterinarians/:id` | Memperbarui data dokter hewan |
| `DELETE` | `/api/veterinarians/:id` | Menghapus dokter (dilindungi dari catatan historis) |

#### 5. Appointments (Jadwal Pemeriksaan)
| HTTP Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/appointments` | Menampilkan semua jadwal pemeriksaan |
| `GET` | `/api/appointments/:id` | Detail jadwal beserta data hewan, dokter, rekam & bayar |
| `GET` | `/api/appointments/pet/:petId` | Jadwal pemeriksaan untuk hewan tertentu |
| `POST` | `/api/appointments` | Membuat jadwal konsultasi/pemeriksaan baru |
| `PUT` | `/api/appointments/:id` | Memperbarui informasi jadwal pemeriksaan |
| `PATCH` | `/api/appointments/:id/status` | Mengubah status janji temu (`SCHEDULED`, `COMPLETED`, `CANCELLED`) |

#### 6. Medical Records (Rekam Medis)
| HTTP Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/medical-records` | Menampilkan seluruh riwayat rekam medis klinik |
| `GET` | `/api/medical-records/:id` | Detail rekam medis berdasarkan ID |
| `GET` | `/api/medical-records/pet/:petId` | Rekam medis historis untuk hewan tertentu |
| `POST` | `/api/medical-records` | Mencatat diagnosa, gejala, terapi, dan resep obat |

#### 7. Payments (Pembayaran)
| HTTP Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/payments` | Menampilkan seluruh transaksi pembayaran |
| `GET` | `/api/payments/:id` | Detail transaksi pembayaran berdasarkan ID |
| `GET` | `/api/payments/owner/:ownerId` | Riwayat pembayaran berdasarkan pemilik hewan |
| `POST` | `/api/payments` | Mencatat pembayaran baru (`CASH`, `TRANSFER`, `EWALLET`) |
| `PATCH` | `/api/payments/:id/status` | Mengubah status pembayaran (`PENDING`, `PAID`, `CANCELLED`) |

---

### Contoh Format Request & Response

#### 1. Menambahkan Hewan (POST `/api/pets`)
**Request Body:**
```json
{
  "name": "Milo",
  "species": "CAT",
  "breed": "Domestic Shorthair",
  "gender": "Male",
  "dateOfBirth": "2023-04-10",
  "weight": 4.2,
  "ownerId": 1
}
```

**Response Sukses (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Pet created successfully",
  "data": {
    "id": 1,
    "name": "Milo",
    "species": "CAT",
    "breed": "Domestic Shorthair",
    "gender": "Male",
    "dateOfBirth": "2023-04-10T00:00:00.000Z",
    "weight": 4.2,
    "ownerId": 1,
    "createdAt": "2026-11-12T10:50:07.185Z",
    "updatedAt": "2026-11-12T10:50:07.185Z",
    "owner": {
      "id": 1,
      "fullName": "Andi Pratama",
      "phone": "081234567890",
      "email": "andi.pratama@example.com",
      "address": "Jl. Merdeka No. 10, Jakarta Selatan"
    }
  }
}
```

#### 2. Response Error Validasi (HTTP 400 Bad Request)
Jika request body tidak menyertakan field wajib atau format tidak valid:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.breed",
      "message": "Breed is required"
    },
    {
      "field": "body.species",
      "message": "Species must be one of: CAT, DOG, RABBIT, BIRD, OTHER"
    }
  ]
}
```

#### 3. Response Error Data Tidak Ditemukan (HTTP 404 Not Found)
```json
{
  "success": false,
  "message": "Pet with ID 999 not found"
}
```

---

## 10. Migrasi & Seeding Database

### Otomatis (Dalam Container)
Saat container backend dijalankan pertama kali melalui `docker compose up -d`, script `docker-entrypoint.sh` secara otomatis menjalankan:
1. `npx prisma migrate deploy`
2. `npm run prisma:seed`

### Manual di dalam Container
Jika ingin mengeksekusi migrasi atau seeding secara manual di dalam container backend yang sedang berjalan:
```bash
# Menjalankan migrasi database
docker compose exec backend npx prisma migrate deploy

# Menjalankan seed data contoh
docker compose exec backend npm run prisma:seed
```

### Data Contoh yang Tersedia (Seeded Data):
- **3 Pemilik Hewan:**
  - Andi Pratama (`andi.pratama@example.com`)
  - Siti Rahma (`siti.rahma@example.com`)
  - Budi Santoso (`budi.santoso@example.com`)
- **2 Dokter Hewan:**
  - drh. Sarah Wijaya, Sp.KHL (`dr.sarah@vetcare.com`)
  - drh. Hendra Kusuma (`dr.hendra@vetcare.com`)
- **5 Pasien Hewan:**
  - Milo (Kucing Shorthair - Andi)
  - Bruno (Anjing Golden Retriever - Andi)
  - Luna (Kucing Persia - Siti)
  - Choco (Kelinci Holland Lop - Siti)
  - Kiwi (Burung Lovebird - Budi)
- **3 Jadwal Pemeriksaan:** Berbagai status (`SCHEDULED`, `COMPLETED`)
- **2 Rekam Medis:** Diagnosis lengkap, gejala, terapi, dan resep obat
- **3 Transaksi Pembayaran:** Status `PAID` dan `PENDING` dengan berbagai metode bayar

*Catatan: Script seed menggunakan metode `upsert` sehingga aman dan idempotent (tidak akan menghasilkan duplikasi data bila dipanggil berulang kali).*

---

## 11. Pengujian Persistensi Data (Persistence Testing)

Pengujian ini membuktikan bahwa konfigurasi **Docker Named Volume (`vetcare_postgres_data`)** berhasil mempertahankan data PostgreSQL meskipun container backend dan container database dimatikan dan dihapus secara total (`docker compose down`).

Ikuti skenario langkah demi langkah berikut:

### Langkah 1: Pastikan Seluruh Container Aktif
```bash
docker compose up -d
docker compose ps
```

### Langkah 2: Tambahkan Hewan Baru melalui POST API
Kirim request HTTP POST untuk mendaftarkan hewan bernama **Simba**:

**Menggunakan cURL:**
```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Simba\",\"species\":\"CAT\",\"breed\":\"Persian Longhair\",\"gender\":\"Male\",\"dateOfBirth\":\"2024-02-14\",\"weight\":3.8,\"ownerId\":1}"
```

**Menggunakan PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/pets" -Method POST -ContentType "application/json" -Body '{"name":"Simba","species":"CAT","breed":"Persian Longhair","gender":"Male","dateOfBirth":"2024-02-14","weight":3.8,"ownerId":1}'
```

### Langkah 3: Ambil Data Hewan melalui GET API
Periksa bahwa **Simba** telah tersimpan:
```bash
curl http://localhost:3000/api/pets
```

### Langkah 4: Hentikan dan Hapus Container
Hentikan container tanpa menyertakan flag `-v`:
```bash
docker compose down
```
*(Seluruh container `vetcare-backend` dan `vetcare-postgres` telah dihapus dari sistem).*

### Langkah 5: Jalankan Kembali Container
Buat dan nyalakan ulang container:
```bash
docker compose up -d
```

### Langkah 6: Verifikasi Persistensi Data
Panggil kembali endpoint GET untuk mengambil data hewan:
```bash
curl http://localhost:3000/api/pets
```

**Hasil Pengujian:**
Data hewan **Simba** beserta seluruh histori transaksi lainnya tetap utuh dan tersimpan di dalam database PostgreSQL. Ini membuktikan bahwa named volume `vetcare_postgres_data` bekerja secara persisten!

---

## 12. Troubleshooting Umum

### 1. Port 3000 atau Port 5432 Sudah Digunakan
**Gejala:** Error `bind: address already in use` saat `docker compose up`.  
**Solusi:**
- Pastikan tidak ada service lokal Node.js atau PostgreSQL lokal yang sedang berjalan di port yang sama.
- Atau ubah port mapping pada `docker-compose.yml`, misalnya `"3001:3000"` untuk backend atau `"5433:5432"` untuk database.

### 2. Backend Gagal Terhubung ke Database
**Gejala:** Error Prisma connection timeout atau `P1001: Can't reach database server`.  
**Solusi:**
- Di dalam container Docker, host database **wajib** menggunakan nama service Docker Compose yaitu `database`, bukan `localhost`.
- Format koneksi di `.env` dan `docker-compose.yml`:
  `postgresql://vetcare_user:example_password@database:5432/vetcare_db?schema=public`
- Pastikan healthcheck service database telah berstatus `healthy`.

### 3. File Entrypoint Menampilkan Error Syntax pada Linux Container
**Gejala:** `exec: ./docker-entrypoint.sh: no such file or directory` atau `\r: command not found`.  
**Solusi:**
- Ini terjadi bila file dibuat di Windows dengan format baris CRLF (`\r\n`).
- Pada `Dockerfile` proyek ini telah ditambahkan perintah otomatis:
  `RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh`
  sehingga aman dari permasalahan format Windows.

---

## 13. Referensi & Penggunaan AI

- Dokumentasi Resmi Docker: [https://docs.docker.com/](https://docs.docker.com/)
- Dokumentasi Docker Compose: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
- Dokumentasi Resmi Prisma ORM: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- Dokumentasi Express.js: [https://expressjs.com/](https://expressjs.com/)
- Dokumentasi TypeScript: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
- Bantuan AI: Proyek ini disusun dan diimplementasikan dengan bantuan Antigravity AI Assistant (DeepMind) untuk perancangan arsitektur backend, validasi Zod, Docker multi-stage build, skema relasional Prisma, serta pengujian persistensi data.
