# 🚀 Base REST API (Ready for Vercel)

Struktur API sederhana untuk menjalankan backend REST API berbasis Node.js (tanpa Express).

## 🧩 Cara Pakai
1. Clone repo ini
2. Tambahkan fungsi scraper kamu ke dalam `api/*.js`
3. Deploy ke [Vercel](https://vercel.com)

## 📂 Struktur
- `api/index.js` → Endpoint utama
- `api/example.js` → Contoh endpoint (bisa diganti untuk scraper kamu)
- `vercel.json` → Konfigurasi routing dan build

## 🚀 Jalankan Lokal
```bash
npm install -g vercel
vercel dev
