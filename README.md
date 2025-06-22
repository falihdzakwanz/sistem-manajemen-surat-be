# Sistem Manajemen Surat - Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.x-orange)

Backend sistem untuk manajemen surat masuk instansi pemerintah dengan fitur:
- Autentikasi berbasis role (admin/user)
- Manajemen surat digital (upload/download)
- Pelacakan status surat
- Notifikasi dan laporan

## 📋 Spesifikasi Teknis

| Komponen       | Versi       |
|----------------|-------------|
| Node.js        | 18.x        |
| TypeScript     | 5.x         |
| PostgreSQL     | 15.x        |
| Prisma ORM     | 6.x         |

## 🚀 Panduan Instalasi

### Prasyarat
- Node.js 18+
- PostgreSQL 15+
- Git (opsional)

### 1. Clone Repository
```bash
git clone https://github.com/falihdzakwanz/sistem-manajemen-surat-be.git
cd sistem-manajemen-surat-be
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
- Buat database PostgreSQL baru
- Konfigurasi connection string di .env:
- Jalankan migrasi:

```bash
npx prisma migrate dev

npx prisma generate
```

### 4. Build & Run
```bash
npm run build
npm start
```

## 🧪 Testing
```bash
npm test
```

### Dengan coverage
```bash
npm test -- --coverage
```

## 📄 Lisensi
MIT License
