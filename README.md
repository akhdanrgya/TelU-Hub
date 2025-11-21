# 🛍️ TelU-Hub E-Commerce Platform

TelU-Hub adalah platform e-commerce modern *full-stack* yang dibangun dengan fokus pada interaksi **real-time**. Aplikasi ini menggabungkan performa tinggi Go di backend dan interaktivitas Next.js di frontend, menghadirkan pengalaman pengguna yang dinamis dan responsif.

## 🌟 Fitur Unggulan

* **🛒 Manajemen Transaksi Lengkap:**
    * Sistem Keranjang Belanja (Cart).
    * Checkout dengan ringkasan pesanan.
    * Riwayat Pesanan untuk pembeli.
    * Manajemen Status Pesanan (Paid, dll.) via Webhook.
* **💳 Payment Gateway Terintegrasi:**
    * Integrasi penuh dengan **Midtrans Snap** untuk pembayaran yang aman dan mudah.
    * Handling notifikasi pembayaran otomatis via Webhook.
* **📈 Real-time Stock Updates (gRPC):**
    * Stok produk di halaman detail diperbarui secara **instan** saat ada pembelian oleh pengguna lain.
    * Menggunakan teknologi **gRPC Server-Side Streaming** untuk performa tinggi dan latensi rendah.
* **💬 Real-time Chat (WebSocket):**
    * Fitur obrolan langsung antara pembeli dan penjual di halaman detail produk.
    * Menggunakan **WebSocket** dengan arsitektur *room* per produk.
* **🔔 Real-time Notifications (WebSocket):**
    * Sistem notifikasi global (ikon lonceng di navbar) yang menyala seketika saat ada event penting.
    * Contoh: Notifikasi pembayaran sukses untuk pembeli, notifikasi produk terjual untuk penjual.
    * Dilengkapi riwayat notifikasi di database.
* **🔐 Autentikasi & Keamanan:**
    * Sistem Login/Register dengan **JWT (JSON Web Token)**.
    * Middleware proteksi di backend dan interceptor token di frontend.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

### Backend (Folder `/backend`)

Backend dibangun dengan arsitektur modular untuk memisahkan tanggung jawab, menggunakan bahasa **Go (Golang)**.

* **Framework REST:** [Fiber v2](https://gofiber.io/) - Framework web yang sangat cepat, terinspirasi dari Express.js.
* **Database ORM:** [GORM](https://gorm.io/) - Perpustakaan ORM yang kuat untuk Go.
* **Database:** PostgreSQL - Database relasional yang handal.
* **Protokol Real-time & Komunikasi:**
    * **gRPC & Protocol Buffers:** Untuk *streaming* data stok (komunikasi efisien dan terstruktur).
    * **WebSocket (via Fiber):** Untuk fitur Chat dan Notifikasi (komunikasi dua arah *persistent*).
* **Pembayaran:** Midtrans Go SDK.
* **Tools:** Air (untuk hot reload selama development).

### Frontend (Folder `/frontend`)

Frontend dibangun menggunakan **Next.js** (App Router) untuk performa, SEO, dan pengalaman pengembang yang optimal.

* **Framework:** Next.js 14+
* **Bahasa:** TypeScript
* **UI Library:** [HeroUI](https://heroui.com/) (NextUI) + Tailwind CSS - Untuk antarmuka yang modern dan responsif.
* **State Management:** React Context API (Global state untuk Auth & Cart).
* **HTTP Client:** Axios (dengan interceptors untuk manajemen token JWT otomatis).
* **WebSocket Client:** `react-use-websocket` - Hook React untuk mengelola koneksi WebSocket dengan mudah.
* **gRPC Client:** Menggunakan *generated code* dari `protoc` untuk Go dan REST API biasa untuk inisiasi stream.

---

## 🏛️ Arsitektur Sistem & Protokol

Project ini unik karena menggunakan tiga protokol komunikasi berbeda, masing-masing untuk tujuan spesifik:

| Fitur | Protokol | Alasan Penggunaan |
| :--- | :--- | :--- |
| **CRUD Data** (Produk, User, Order, History Notif) | **REST API (HTTP JSON)** | Standar industri, mudah digunakan, kompatibel luas untuk operasi request-response biasa. |
| **Live Stock Updates** | **gRPC (Server Streaming)** | Sangat efisien untuk skenario "satu server mengirim banyak update ke banyak klien" secara terus-menerus. Format biner (Protobuf) lebih ringan dari JSON. |
| **Chat & Notifikasi Real-time** | **WebSocket** | Membutuhkan saluran komunikasi dua arah yang *persistent* (selalu nyala). Klien bisa mengirim pesan kapan saja, dan server bisa mendorong (push) pesan kapan saja tanpa diminta. |

---

## 🚀 Cara Menjalankan Project (Getting Started)

### Prasyarat Sistem

Pastikan di komputer Anda sudah terinstall:
1.  [Go](https://go.dev/dl/) (versi 1.20 ke atas)
2.  [Node.js](https://nodejs.org/) (versi 18 LTS ke atas) & npm
3.  [PostgreSQL](https://www.postgresql.org/) (pastikan service berjalan)
4.  [Protocol Buffers Compiler (`protoc`)](https://grpc.io/docs/protoc-installation/) - Diperlukan untuk generate kode gRPC.
5.  Go plugins untuk `protoc`:
    ```bash
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
    ```
    *(Pastikan folder `$GOPATH/bin` atau `$HOME/go/bin` ada di PATH sistem Anda)*

---

### 1️⃣ Setup Backend

1.  Buka terminal, masuk ke folder `backend`:
    ```bash
    cd backend
    ```
2.  Install semua dependensi Go:
    ```bash
    go mod tidy
    ```
3.  Buat database PostgreSQL kosong (misal: `teluhub_db`).
4.  Duplikasi file `.env.example` menjadi `.env` dan sesuaikan konfigurasinya:
    ```env
    PORT=:8910
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=password_database_anda
    DB_NAME=teluhub_db
    DB_PORT=5432
    JWT_SECRET=rahasia_super_aman_jangan_disebar
    MIDTRANS_SERVER_KEY=SB-Mid-server-XXXXXX (Ganti dengan Server Key Midtrans Sandbox Anda)
    CLIENT_URL=http://localhost:3000
    ```
5.  **(PENTING) Generate kode gRPC**. Jalankan perintah ini dari **root project** (`TELU-HUB/`):
    ```bash
    # Pastikan Anda di folder TELU-HUB/, bukan backend/
    protoc -I=proto \
      --go_out=./backend \
      --go_opt=paths=source_relative \
      --go-grpc_out=./backend \
      --go-grpc_opt=paths=source_relative \
      proto/stock.proto
    ```
6.  Jalankan server backend.
    * Menggunakan `air` (hot reload, direkomendasikan):
        ```bash
        air
        ```
    * Atau menggunakan `go run` biasa:
        ```bash
        go run cmd/server/main.go
        ```
    *Server akan berjalan di `http://localhost:8910` dan otomatis melakukan migrasi tabel database.*

---

### 2️⃣ Setup Frontend

1.  Buka terminal baru, masuk ke folder `frontend`:
    ```bash
    cd frontend
    ```
2.  Install dependensi Node.js:
    ```bash
    npm install
    ```
3.  Buat file `.env.local` di dalam folder `frontend/` dan isi konfigurasi:
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8910/api/v1
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXX (Ganti dengan Client Key Midtrans Sandbox Anda)
    ```
4.  Jalankan server development frontend:
    ```bash
    npm run dev
    ```
5.  Buka browser dan akses `http://localhost:3000`. Aplikasi siap digunakan! 🎉

---

## 📂 Struktur Folder Proyek

    TELU-HUB/
    ├── proto/
    │   └── stock.proto
    │
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
    │   ├── uploads/
    │   └── .env
    │
    └── frontend/
        ├── app/
        ├── components/
        ├── contexts/
        ├── hooks/
        ├── libs/
        ├── types/
        └── .env.local

---

## 👥 Kontribusi

Proyek ini dikembangkan sebagai platform pembelajaran untuk membangun aplikasi *real-time* modern yang kompleks.