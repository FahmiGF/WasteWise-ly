@echo off
title WASTEWISE - Smart Waste Management & Circular Economy Platform
color 0A
echo =====================================================================
echo         WASTEWISE: SMART WASTE MANAGEMENT & CIRCULAR ECONOMY
echo         AI + Computer Vision + IoT + Geospatial + Marketplace
echo =====================================================================
echo.

cd /d "%~dp0backend"

echo [1/2] Memeriksa Python Environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python tidak ditemukan di PATH! Silakan install Python 3.10+.
    pause
    exit /b 1
)

echo [2/2] Menjalankan server WASTEWISE (Browser akan terbuka otomatis)...
echo.
echo Role Switcher Tersedia di Navbar:
echo   - 1. Citizen (Masyarakat):        AI Camera Scanner, Bank Sampah, Pickup
echo   - 2. Collector (Petugas):         Manifest CVRP, Rute GPS, Proof of Collection
echo   - 3. Facility (TPS/TPST):         Jembatan Timbang, Sortir AI, Stockpiles
echo   - 4. Command Center (Admin/DLH):  Peta Spasial, Simulator IoT ESP32, Prediksi AI
echo.
python run.py

pause
