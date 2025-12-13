# 🛍️ TelU-Hub E-Commerce Platform

TelU-Hub adalah platform e-commerce modern *full-stack* yang dirancang dengan fokus pada **real-time interaction**, skalabilitas, dan arsitektur sistem yang bersih. Project ini menggabungkan **Go (Golang)** di sisi backend untuk performa tinggi dan **Next.js** di sisi frontend untuk pengalaman pengguna yang cepat, interaktif, dan SEO-friendly.

Proyek ini dibuat sebagai **platform pembelajaran** untuk mengeksplorasi integrasi multi-protokol (REST, gRPC, WebSocket) dalam satu sistem nyata.

---

## ✨ Fitur Utama

### 🛒 Manajemen Transaksi

* Keranjang Belanja (*Shopping Cart*)
* Checkout dengan ringkasan pesanan
* Riwayat pesanan pengguna
* Manajemen status pesanan (Pending, Paid, dll)
* Otomatis update status via **Payment Webhook**

### 💳 Payment Gateway

* Integrasi **Midtrans Snap** (Sandbox)
* Redirect & popup payment
* Penanganan notifikasi pembayaran otomatis (Webhook Midtrans)

### 📦 Real-time Stock Updates (gRPC)

* Update stok produk secara **instan** di halaman detail
* Menggunakan **gRPC Server-Side Streaming**
* Latensi rendah dan efisiensi tinggi (Protocol Buffers)

### 💬 Real-time Chat (WebSocket)

* Chat langsung antara pembeli dan penjual
* Arsitektur *room per product*
* Koneksi dua arah yang *persistent*

### 🔔 Real-time Notifications (WebSocket)

* Notifikasi global (ikon lonceng di navbar)
* Event penting dikirim **tanpa refresh halaman**
* Riwayat notifikasi disimpan di database

### 🔐 Autentikasi & Keamanan

* Login & Register berbasis **JWT**
* Middleware proteksi backend
* Axios interceptor untuk token handling di frontend

---

## 🧠 Arsitektur Sistem & Protokol

Project ini menggunakan **tiga protokol komunikasi berbeda**, masing-masing dipilih sesuai kebutuhan fitur.

| Kebutuhan                                   | Protokol                | Alasan                                            |
| ------------------------------------------- | ----------------------- | ------------------------------------------------- |
| CRUD Data (User, Produk, Order, Notifikasi) | REST API (HTTP + JSON)  | Sederhana, standar industri, mudah diintegrasikan |
| Live Stock Update                           | gRPC (Server Streaming) | Efisien, ringan, cocok untuk update terus-menerus |
| Chat & Notifikasi                           | WebSocket               | Komunikasi dua arah *real-time* tanpa polling     |

---

## 🛠️ Tech Stack

### Backend (`/backend`)

* **Bahasa:** Go (Golang)
* **Framework:** Fiber v2
* **ORM:** GORM
* **Database:** PostgreSQL
* **Real-time:** gRPC, WebSocket
* **Payment:** Midtrans Go SDK
* **Dev Tool:** Air (hot reload)

### Frontend (`/frontend`)

* **Framework:** Next.js (App Router)
* **Bahasa:** TypeScript
* **UI:** HeroUI (NextUI) + Tailwind CSS
* **State Management:** React Context API
* **HTTP Client:** Axios (JWT Interceptor)
* **WebSocket Client:** react-use-websocket

---

## 🚀 Getting Started

### Prasyarat

Pastikan sudah terinstall:

1. Go ≥ 1.20
2. Node.js ≥ 18 (LTS)
3. PostgreSQL
4. `protoc` (Protocol Buffers Compiler)
5. Go plugin untuk Protobuf & gRPC

```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

---

## 🔐 Environment Variables

Project ini menggunakan **dua file environment terpisah**, untuk backend dan frontend.

### Backend (`backend/.env`)

Digunakan untuk konfigurasi server, database, autentikasi, dan Midtrans.

Contoh struktur (nilai disembunyikan):

```env
APP_PORT=:XXXX

DB_HOST=localhost
DB_PORT=5432
DB_USER=****
DB_PASSWORD=****
DB_NAME=****
DB_SSLMODE=disable

JWT_SECRET=****

MIDTRANS_CLIENT_KEY=****
MIDTRANS_SERVER_KEY=****

CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

Digunakan untuk konfigurasi publik frontend.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:XXXX/api/v1
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=****
```

> ⚠️ Jangan pernah commit file `.env` atau `.env.local` ke repository publik

---

## ⚙️ Setup Backend

```bash
cd backend
go mod tidy
```

1. Buat database PostgreSQL kosong
2. Sesuaikan konfigurasi di file `.env`
3. Generate kode gRPC (jalankan dari root project)

```bash
protoc -I=proto \
  --go_out=./backend \
  --go_opt=paths=source_relative \
  --go-grpc_out=./backend \
  --go-grpc_opt=paths=source_relative \
  proto/stock.proto
```

4. Jalankan server

```bash
air
# atau
go run cmd/server/main.go
```

Backend berjalan di `http://localhost:8910`

---

## 🎨 Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dapat diakses di `http://localhost:3000`

---

## 🌐 Setup Webhook Midtrans (Local) dengan Ngrok

Karena Midtrans **tidak bisa mengirim webhook ke localhost**, project ini menggunakan **ngrok** saat development lokal.

### Langkah-langkah

1. Install ngrok
2. Jalankan backend secara lokal
3. Jalankan ngrok pada port backend

```bash
ngrok http 8910
```

4. Salin **Forwarding HTTPS URL** dari ngrok, contoh:

```
https://xxxx-xx-xx-xx.ngrok-free.app
```

5. Masukkan URL tersebut ke **Dashboard Midtrans Sandbox**

* Payment Notification URL:

```
https://xxxx-xx-xx-xx.ngrok-free.app/api/v1/payments/midtrans/webhook
```

6. Pastikan backend menerima event `transaction_status`

> ⚠️ URL ngrok berubah setiap restart (kecuali akun berbayar)

---

## 📁 Struktur Folder

```text
TELU-HUB/
├── proto/
│   └── stock.proto
├── backend/
│   ├── cmd/server/
│   ├── config/
│   ├── internal/
│   │   ├── database/
│   │   ├── models/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   ├── grpc_service/
│   │   ├── chat/
│   │   └── notification/
│   └── uploads/
└── frontend/
    ├── app/
    ├── components/
    ├── contexts/
    ├── hooks/
    ├── libs/
    └── types/
```

---

## 🧩 Diagram Arsitektur Sistem (ASCII)

Diagram berikut menggambarkan alur komunikasi antar komponen utama di TelU-Hub dan bagaimana tiap protokol digunakan sesuai perannya.

```text
                         ┌────────────────────┐
                         │      Browser       │
                         │  Next.js Frontend  │
                         └─────────┬──────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────────┐      ┌──────────────────┐      ┌───────────────────┐
│  REST API       │      │  WebSocket       │      │   gRPC Stream     │
│  (HTTP + JSON)  │      │  (Persistent)    │      │ (Server Streaming)│
│                 │      │                  │      │                   │
│ - Auth          │      │ - Chat            │      │ - Live Stock      │
│ - Produk        │      │ - Notifications   │      │ - Stock Sync      │
│ - Order         │      │                  │      │                   │
└────────┬────────┘      └─────────┬────────┘      └─────────┬─────────┘
         │                           │                           │
         └──────────────┬────────────┴────────────┬─────────────┘
                        ▼                           ▼
                ┌────────────────────────────────────────┐
                │        Go Backend (Fiber)               │
                │----------------------------------------│
                │ - REST Controllers                     │
                │ - JWT Middleware                       │
                │ - WebSocket Hub (Chat & Notif)         │
                │ - gRPC Stock Service                   │
                │ - Midtrans Webhook Handler             │
                └──────────────┬─────────────────────────┘
                               │
                               ▼
                     ┌──────────────────────┐
                     │    PostgreSQL DB     │
                     │----------------------│
                     │ - Users              │
                     │ - Products           │
                     │ - Orders             │
                     │ - Notifications      │
                     └──────────────────────┘
                               ▲
                               │
                     ┌──────────────────────┐
                     │     Midtrans         │
                     │  Payment Gateway     │
                     │----------------------│
                     │  Webhook via Ngrok   │
                     └──────────────────────┘
```

### 📌 Penjelasan Singkat

* **REST API** → komunikasi standar untuk operasi CRUD
* **WebSocket** → koneksi dua arah terus-menerus untuk chat & notifikasi
* **gRPC Streaming** → server mendorong update stok secara real-time
* **Ngrok** → menjembatani webhook Midtrans ke backend lokal

---

## 🤝 Kontribusi

Project ini terbuka untuk eksplorasi dan pengembangan lebih lanjut sebagai bahan pembelajaran sistem terdistribusi, real-time architecture, dan integrasi payment gateway
