# WASTEWISE — Smart Waste Management & Circular Economy Platform

> **AI + Computer Vision + IoT + Geospatial + Marketplace + Digital Waste Bank**  
> *Production-Oriented Enterprise Architecture for Smart City Waste Governance*

---

## 🌟 Ringkasan Eksekutif

**WasteWise** adalah platform pengelolaan sampah pintar dan ekonomi sirkular terintegrasi end-to-end yang menghubungkan **Masyarakat (Citizen)**, **Petugas Pengangkutan (Collector)**, **Pengelola TPS/TPST/Bank Sampah (Facility)**, **Industri Daur Ulang**, dan **Pemerintah / Dinas Lingkungan Hidup (Command Center)** dalam satu kesatuan sistem digital.

Platform ini mengimplementasikan fondasi penuh dari **20 Fase Masterplan WasteWise**, dilengkapi dengan modul kecerdasan buatan (Computer Vision 9 kategori limbah), telemetri IoT (ESP32 ultrasonic & load cell), algoritma rute armada pengangkutan (CVRP), pasar material daur ulang (Marketplace), buku tabungan digital bank sampah (Double-Entry Ledger), analitik prediktif (XGBoost time-series forecast), dan asisten operasional cerdas berteknologi AI.

---

## 🎨 Design System & Visual Direction

WasteWise mengadopsi palet warna resmi berstandar Enterprise Environmental:

| Design Token | Hex Code | Peruntukan |
| :--- | :--- | :--- |
| **Primary Dark** | `#123C32` | Header, Sidebar, Container Kontras Tinggi |
| **Primary Brand** | `#187B58` | Brand Identitas, Tombol Primer, Badge Status |
| **Accent Leaf** | `#35A875` | Laser Scan Kamera AI, Slider Sensor, Indikator Aktif |
| **Soft Mint** | `#DDF3E6` | Background Card, Pill Highlight, Chip Saran AI |
| **Clean Canvas** | `#F4F7F4` | Background Halaman Utama |
| **Text Carbon** | `#202B26` | Tipografi Heading & Body Text (Inter Font) |

---

## 👥 4 Antarmuka Terintegrasi (Multi-Role Switcher)

Pengguna dapat berpindah peran secara instan melalui tombol **Role Switcher** di Navbar:

### 1. WasteWise Citizen (Masyarakat)
- **📸 AI Waste Scanner**: Viewfinder kamera interaktif dengan klasifikasi 9 kategori material (Plastik PET/HDPE, Kardus/Kertas, Logam/Aluminium, Kaca, Organik, E-Waste, Tekstil, B3 Berbahaya, dan Residu TPA), estimasi persentase kontaminasi, grading kemurnian (Grade A/B/C), petunjuk pemilahan wadah, nilai keekonomian (Rp/kg), dan CO₂ yang dihindari.
- **📍 Lokasi TPS & Smart Bins Terdekat**: Peta informasi jarak, persentase keterisian bin, dan jadwal penjemputan.
- **🚚 Permintaan Pickup Sampah**: Formulir permintaan penjemputan material daur ulang langsung ke rumah tangga.
- **🏦 Buku Tabungan Bank Sampah**: Saldo riil dalam Rupiah, skor keberlanjutan (Eco-Score), dan pencairan saldo instan via VA BCA/E-Wallet.
- **🛒 Pasar Material Daur Ulang**: Pembelian dan penjualan material terkompaksi dengan kalkulasi biaya platform dan checkout invoice Midtrans.
- **⚠️ Lapor Sampah Liar (Citizen Geotag)**: Pelaporan titik tumpukan sampah ilegal dengan koordinat GPS dan penilaian risiko AI.

### 2. WasteWise Collector (Petugas Pengangkutan)
- **Konsol Logistik Armada**: Monitoring kapasitas muatan truk kompaktor (misal: Truk A-01, 3.500 kg).
- **Rute Singgah CVRP (Capacitated Vehicle Routing Problem)**: Urutan pengangkutan dinamis (*Wonokromo -> Gubeng -> Sukolilo -> TPST Benowo*).
- **Digital Proof of Collection**: Verifikasi kedatangan GPS, pemindaian QR Code Smart Bin, pengambilan foto sebelum/sesudah, dan pencatatan timbangan digital timbangan truk.

### 3. WasteWise Facility (TPS, TPST & Bank Sampah)
- **Jembatan Timbang Digital (Weighbridge)**: Simulasi otomatis kalkulasi Berat Kotor (*Gross*), Berat Kosong (*Tare*), dan Berat Bersih (*Netto*) truk sampah masuk dengan pencetakan tiket timbangan digital DLH.
- **Gudang Material Siap Kirim (Stockpiles)**: Monitoring tonase stok bal Plastik PET, Kardus Corrugated, Kaleng Aluminium, dan Kompos Organik curah.
- **Penerbitan Surat Jalan Industri**: Pengeluaran stok material ke pabrik daur ulang mitra.

### 4. WasteWise Command Center (Pemerintah / Super Admin)
- **City-Scale KPI Overview**: 12.840 kg sampah terkelola, 68.4% tingkat daur ulang kota, 248 smart bins aktif, dan 32 tugas pengangkutan.
- **Peta Geospasial Interaktif Surabaya**: Titik sebaran smart bin dengan visualisasi status klaster (*Empty*, *Normal*, *High*, *Critical*, *Overflow*).
- **Simulator Telemetri IoT ESP32**: Slider langsung untuk memanipulasi sensor ketinggian ultrasonik (%) dan sensor bobot load cell HX711 (kg) untuk menguji pemicu alarm otomatis (*auto-task generation*).
- **AI 7-Day Waste Volume Forecast**: Grafik estimasi volume sampah 7 hari ke depan dengan batas atas dan batas bawah serta peringatan risiko lonjakan akhir pekan.

### 🤖 WasteWise AI Operational Assistant (Floating Drawer)
Tersedia tombol mengambang di pojok kanan bawah setiap halaman untuk memanggil asisten cerdas yang terhubung ke live tools:
- *Cek Bin Kritis*: Memanggil tool `query_critical_bins()` dan menampilkan daftar tempat sampah darurat.
- *Cek Harga Pasar*: Memanggil tool `query_market_rates()` dengan harga terkini PET, kardus, aluminium, dan minyak jelantah.
- *Dampak Lingkungan*: Menghitung total pengurangan emisi karbon dan tonase sampah terdiversi dari TPA.

---

## 🚀 Cara Menjalankan Aplikasi (1-Klik)

### Cara 1: Menggunakan Launcher Batch (Paling Mudah)
Cukup klik dua kali file berikut:
```bash
Buka_WasteWise.bat
```
*(File ini tersedia di folder `wastewise-platform/` dan di root direktori kerja)*.  
Browser Anda akan otomatis membuka: **`http://127.0.0.1:8000`**

### Cara 2: Menjalankan Manual via Terminal
1. **Backend Server & Web App**:
   ```powershell
   cd "C:\Kuliah Sisfor\Github Project\wastewise-platform\backend"
   python run.py
   ```
2. **Frontend Mode Hot-Reload Development (Opsional)**:
   ```powershell
   cd "C:\Kuliah Sisfor\Github Project\wastewise-platform\frontend"
   npm run dev
   ```

---

## 🧪 Pengujian Otomatis (Automated Testing)

Seluruh endpoint backend telah diuji dengan **pytest**:
```powershell
pytest "C:\Kuliah Sisfor\Github Project\wastewise-platform\backend\tests\test_api.py" -v
```
Hasil uji: **10 passed in 1.43s (100% OK)**.

---

## 📂 Struktur Direktori Proyek

```
wastewise-platform/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI Core Router & Static SPA Mount
│   │   └── store.py         # Business Engine, Models, & Double-Entry Ledger
│   ├── tests/
│   │   └── test_api.py      # Automated Pytest Suite
│   ├── requirements.txt     # Python Dependencies
│   └── run.py               # Auto-port & Browser Launcher
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Icons, AIAssistantDrawer
│   │   ├── lib/             # API Client (FastAPI Connection)
│   │   ├── pages/           # CitizenView, CollectorView, FacilityView, CommandCenterView
│   │   ├── App.jsx          # Master View Orchestrator
│   │   ├── main.jsx         # React Entry Point
│   │   └── index.css        # Tailwind Base & Custom Scanner Animations
│   ├── dist/                # Pre-built Production Bundle
│   ├── tailwind.config.js   # Official Design Tokens (#123C32, #187B58, dll)
│   ├── vite.config.js       # Vite Configuration
│   └── package.json
├── Buka_WasteWise.bat       # 1-Click Windows Launcher
└── README.md                # Dokumentasi Lengkap Sistem
```

---
*Dikembangkan dengan standar arsitektur anti-lag, zero dead buttons, dan kesiapan operasional kota cerdas.*
