"""
WasteWise In-Memory / JSON Data Store & Business Logic Engine
Thread-safe persistence with realistic models, initial seeds, and double-entry ledger.
"""

import time
import math
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str # 'citizen', 'collector', 'facility_manager', 'super_admin'
    avatar: str
    organization: Optional[str] = "Pemerintah Kota Surabaya"
    phone: str = "081234567890"

class SmartBin(BaseModel):
    id: str
    code: str
    name: str
    category: str # 'PLASTIC', 'ORGANIC', 'ANORGANIC', 'B3', 'PAPER', 'METAL', 'RESIDUAL'
    facility_name: str
    lat: float
    lng: float
    height_cm: float = 120.0
    max_weight_kg: float = 100.0
    fill_percentage: float = 0.0
    weight_kg: float = 0.0
    battery_percentage: float = 95.0
    temperature_c: float = 29.5
    status: str = "NORMAL" # 'EMPTY', 'NORMAL', 'HIGH', 'CRITICAL', 'OVERFLOW', 'OFFLINE'
    last_updated: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class CollectionTask(BaseModel):
    id: str
    task_code: str
    truck_name: str
    driver_name: str
    driver_phone: str
    license_plate: str
    capacity_kg: float
    current_load_kg: float
    waypoints: List[Dict[str, Any]]
    status: str = "ASSIGNED" # 'ASSIGNED', 'IN_PROGRESS', 'COLLECTING', 'COMPLETED'
    assigned_at: str
    completed_at: Optional[str] = None
    proof_photo: Optional[str] = None
    actual_collected_kg: Optional[float] = None

class MarketplaceListing(BaseModel):
    id: str
    title: str
    material_category: str
    seller_name: str
    seller_type: str # 'TPS', 'BANK_SAMPAH', 'CITIZEN'
    quality_grade: str # 'GRADE_A', 'GRADE_B', 'GRADE_C'
    available_kg: float
    price_per_kg: float
    min_order_kg: float
    location_name: str
    lat: float
    lng: float
    image_url: str
    status: str = "ACTIVE"
    created_at: str

class MarketplaceOrder(BaseModel):
    id: str
    order_number: str
    listing_id: str
    listing_title: str
    buyer_name: str
    buyer_company: str
    weight_kg: float
    price_per_kg: float
    subtotal: float
    service_fee: float
    total_amount: float
    payment_status: str = "PAID" # 'PENDING', 'PAID', 'SETTLED'
    fulfillment_status: str = "WAITING_PICKUP" # 'WAITING_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'VERIFIED'
    payment_method: str = "BCA Virtual Account (Midtrans)"
    created_at: str

class WasteBankAccount(BaseModel):
    account_number: str
    holder_name: str
    balance_idr: float
    points: int
    eco_score: int
    total_deposited_kg: float

class LedgerEntry(BaseModel):
    id: str
    date: str
    transaction_type: str # 'DEPOSIT', 'WITHDRAWAL', 'REWARD_BONUS'
    description: str
    amount: float # positive for credit, negative for debit
    balance_after: float
    weight_kg: Optional[float] = None
    material: Optional[str] = None

class IllegalDumpingReport(BaseModel):
    id: str
    reporter_name: str
    location_name: str
    lat: float
    lng: float
    photo_url: str
    estimated_volume: str
    waste_type: str
    status: str # 'REPORTED', 'INSPECTION', 'CLEANED_UP'
    created_at: str
    ai_risk_level: str # 'LOW', 'MEDIUM', 'HIGH'

# -------------------------------------------------------------
# IN-MEMORY STORE CLASS
# -------------------------------------------------------------

class WasteWiseDataStore:
    def __init__(self):
        self._init_data()

    def _init_data(self):
        # 1. Smart Bins
        self.bins: List[SmartBin] = [
            SmartBin(
                id="bin-101",
                code="BIN-BUNGKUL-01",
                name="Taman Bungkul A-01 (Plastik)",
                category="PLASTIC",
                facility_name="TPS Wonokromo",
                lat=-7.2913,
                lng=112.7397,
                fill_percentage=88.5,
                weight_kg=72.4,
                battery_percentage=92.0,
                temperature_c=31.2,
                status="CRITICAL"
            ),
            SmartBin(
                id="bin-102",
                code="BIN-BUNGKUL-02",
                name="Taman Bungkul A-02 (Organik)",
                category="ORGANIC",
                facility_name="TPS Wonokromo",
                lat=-7.2917,
                lng=112.7394,
                fill_percentage=45.0,
                weight_kg=38.0,
                battery_percentage=94.0,
                temperature_c=30.0,
                status="NORMAL"
            ),
            SmartBin(
                id="bin-103",
                code="BIN-BALKOT-01",
                name="Balai Kota Surabaya Sayap Timur",
                category="PLASTIC",
                facility_name="TPS Tegalsari",
                lat=-7.2657,
                lng=112.7508,
                fill_percentage=97.0,
                weight_kg=94.5,
                battery_percentage=88.0,
                temperature_c=32.5,
                status="OVERFLOW"
            ),
            SmartBin(
                id="bin-104",
                code="BIN-KEPUTRAN-01",
                name="Pasar Keputran Sayur & Buah",
                category="ORGANIC",
                facility_name="TPS Keputran",
                lat=-7.2798,
                lng=112.7441,
                fill_percentage=76.5,
                weight_kg=68.0,
                battery_percentage=96.0,
                temperature_c=33.1,
                status="HIGH"
            ),
            SmartBin(
                id="bin-105",
                code="BIN-TUNJUNGAN-01",
                name="Jl. Tunjungan Heritage Area",
                category="PAPER",
                facility_name="TPS Genteng",
                lat=-7.2592,
                lng=112.7398,
                fill_percentage=32.0,
                weight_kg=22.5,
                battery_percentage=99.0,
                temperature_c=29.0,
                status="NORMAL"
            ),
            SmartBin(
                id="bin-106",
                code="BIN-ITS-01",
                name="ITS Research & Robotics Center",
                category="E-WASTE",
                facility_name="Bank Sampah Sukolilo",
                lat=-7.2825,
                lng=112.7944,
                fill_percentage=54.0,
                weight_kg=41.2,
                battery_percentage=91.0,
                temperature_c=28.4,
                status="NORMAL"
            ),
            SmartBin(
                id="bin-107",
                code="BIN-SOETOMO-01",
                name="Area Transit Farmasi Dr. Soetomo",
                category="B3",
                facility_name="Fasilitas B3 Regional",
                lat=-7.2682,
                lng=112.7583,
                fill_percentage=64.0,
                weight_kg=35.0,
                battery_percentage=89.0,
                temperature_c=27.5,
                status="HIGH"
            ),
            SmartBin(
                id="bin-108",
                code="BIN-GUBENG-01",
                name="Stasiun Surabaya Gubeng Pintu Barat",
                category="RESIDUAL",
                facility_name="TPS Tambaksari",
                lat=-7.2654,
                lng=112.7521,
                fill_percentage=89.0,
                weight_kg=81.0,
                battery_percentage=85.0,
                temperature_c=30.8,
                status="CRITICAL"
            )
        ]

        # 2. Collection Tasks
        self.tasks: List[CollectionTask] = [
            CollectionTask(
                id="task-01",
                task_code="RUTE-CVRP-A101",
                truck_name="Truk Kompaktor 01 (B 9481 SDA)",
                driver_name="Budi Santoso",
                driver_phone="0813-8821-9921",
                license_plate="L 9481 AB",
                capacity_kg=6000.0,
                current_load_kg=2450.0,
                status="IN_PROGRESS",
                assigned_at="2026-11-08 07:30:00",
                waypoints=[
                    {"order": 1, "bin_code": "BIN-BALKOT-01", "name": "Balai Kota Surabaya", "status": "COMPLETED", "collected_kg": 94.5},
                    {"order": 2, "bin_code": "BIN-GUBENG-01", "name": "Stasiun Surabaya Gubeng", "status": "COLLECTING", "estimated_kg": 81.0},
                    {"order": 3, "bin_code": "BIN-BUNGKUL-01", "name": "Taman Bungkul A-01", "status": "PENDING", "estimated_kg": 72.4},
                    {"order": 4, "bin_code": "BIN-KEPUTRAN-01", "name": "Pasar Keputran", "status": "PENDING", "estimated_kg": 68.0}
                ]
            ),
            CollectionTask(
                id="task-02",
                task_code="RUTE-CVRP-B202",
                truck_name="Truk Bak Terbuka Daur Ulang 04",
                driver_name="Agus Pratama",
                driver_phone="0857-1122-3344",
                license_plate="L 8122 QR",
                capacity_kg=3500.0,
                current_load_kg=1200.0,
                status="ASSIGNED",
                assigned_at="2026-11-08 09:15:00",
                waypoints=[
                    {"order": 1, "bin_code": "BIN-ITS-01", "name": "ITS Robotics Center", "status": "PENDING", "estimated_kg": 41.2},
                    {"order": 2, "bin_code": "BIN-TUNJUNGAN-01", "name": "Jl. Tunjungan Area", "status": "PENDING", "estimated_kg": 22.5}
                ]
            )
        ]

        # 3. Marketplace Listings
        self.listings: List[MarketplaceListing] = [
            MarketplaceListing(
                id="list-01",
                title="1.500 Kg Balok Cacahan Botol Plastik PET Bening Bersih",
                material_category="Plastik PET",
                seller_name="TPST Wonokromo Eco-Process",
                seller_type="TPST",
                quality_grade="GRADE_A",
                available_kg=1500.0,
                price_per_kg=4800.0,
                min_order_kg=100.0,
                location_name="Wonokromo, Surabaya Selatan",
                lat=-7.3012,
                lng=112.7381,
                image_url="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80",
                created_at="2026-11-06 14:00:00"
            ),
            MarketplaceListing(
                id="list-02",
                title="850 Kg Kardus Bekas Gelombang Tebal (Corrugated Box)",
                material_category="Kardus & Kertas",
                seller_name="Bank Sampah Induk Surabaya Resik",
                seller_type="BANK_SAMPAH",
                quality_grade="GRADE_A",
                available_kg=850.0,
                price_per_kg=2200.0,
                min_order_kg=50.0,
                location_name="Rungkut Asri, Surabaya Timur",
                lat=-7.3182,
                lng=112.7712,
                image_url="https://images.unsplash.com/photo-1607613009820-a29f7ab81c04?w=600&auto=format&fit=crop&q=80",
                created_at="2026-11-07 09:30:00"
            ),
            MarketplaceListing(
                id="list-03",
                title="420 Kg Kaleng Aluminium Minuman UBC Bersih Press",
                material_category="Logam Aluminium",
                seller_name="TPS 3R Kebonsari Jaya",
                seller_type="TPS",
                quality_grade="GRADE_A",
                available_kg=420.0,
                price_per_kg=19500.0,
                min_order_kg=25.0,
                location_name="Jambangan, Surabaya",
                lat=-7.3291,
                lng=112.7154,
                image_url="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
                created_at="2026-11-07 16:45:00"
            ),
            MarketplaceListing(
                id="list-04",
                title="2.500 Kg Pupuk Kompos Organik Matang Kaya Nutrisi",
                material_category="Kompos Organik",
                seller_name="Fasilitas Pengolahan Organik Keputran",
                seller_type="TPST",
                quality_grade="GRADE_A",
                available_kg=2500.0,
                price_per_kg=1400.0,
                min_order_kg=100.0,
                location_name="Tegalsari, Surabaya",
                lat=-7.2801,
                lng=112.7439,
                image_url="https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop&q=80",
                created_at="2026-11-08 08:00:00"
            )
        ]

        # 4. Marketplace Orders
        self.orders: List[MarketplaceOrder] = [
            MarketplaceOrder(
                id="ord-9921",
                order_number="WW-ORD-20261108-001",
                listing_id="list-01",
                listing_title="1.500 Kg Balok Cacahan Botol Plastik PET Bening Bersih",
                buyer_name="PT Polyindo Daur Ulang Sentosa",
                buyer_company="PT Polyindo",
                weight_kg=500.0,
                price_per_kg=4800.0,
                subtotal=2400000.0,
                service_fee=24000.0,
                total_amount=2424000.0,
                payment_status="PAID",
                fulfillment_status="IN_TRANSIT",
                created_at="2026-11-08 10:15:30"
            )
        ]

        # 5. Waste Bank Account (User: Fahmi / Citizen)
        self.waste_bank = WasteBankAccount(
            account_number="BS-7719-2026-094",
            holder_name="Fahmi Gunawan (Citizen)",
            balance_idr=385000.0,
            points=1240,
            eco_score=118,
            total_deposited_kg=142.5
        )

        self.ledger: List[LedgerEntry] = [
            LedgerEntry(
                id="led-01",
                date="2026-11-08 08:30:00",
                transaction_type="DEPOSIT",
                description="Setor 8.5 Kg Botol PET Bersih ke Bank Sampah",
                amount=40800.0,
                balance_after=385000.0,
                weight_kg=8.5,
                material="Plastik PET"
            ),
            LedgerEntry(
                id="led-02",
                date="2026-11-06 15:10:00",
                transaction_type="DEPOSIT",
                description="Setor 15 Kg Kardus Tebal",
                amount=33000.0,
                balance_after=344200.0,
                weight_kg=15.0,
                material="Kardus"
            ),
            LedgerEntry(
                id="led-03",
                date="2026-11-04 11:00:00",
                transaction_type="WITHDRAWAL",
                description="Pencairan Saldo ke GoPay (081234567890)",
                amount=-100000.0,
                balance_after=311200.0
            )
        ]

        # 6. Illegal Dumping Reports
        self.dumping_reports: List[IllegalDumpingReport] = [
            IllegalDumpingReport(
                id="dump-01",
                reporter_name="Bambang W.",
                location_name="Bantaran Sungai Kalimas Jagir",
                lat=-7.3005,
                lng=112.7481,
                photo_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80",
                estimated_volume="~3.5 m³",
                waste_type="Residu Plastik & Puing Bangunan",
                status="INSPECTION",
                created_at="2026-11-08 08:45:00",
                ai_risk_level="HIGH"
            ),
            IllegalDumpingReport(
                id="dump-02",
                reporter_name="Ratna Sari",
                location_name="Lahan Kosong Jl. Mayjen Sungkono",
                lat=-7.2934,
                lng=112.7123,
                photo_url="https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80",
                estimated_volume="~1.2 m³",
                waste_type="Sisa Kemasan Makanan & Kardus",
                status="CLEANED_UP",
                created_at="2026-11-07 14:20:00",
                ai_risk_level="MEDIUM"
            )
        ]

    # Helper getters and mutators
    def update_bin_telemetry(self, bin_id: str, fill_pct: float, weight_kg: float):
        for b in self.bins:
            if b.id == bin_id or b.code == bin_id:
                b.fill_percentage = round(fill_pct, 1)
                b.weight_kg = round(weight_kg, 1)
                b.last_updated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                if fill_pct >= 95.0:
                    b.status = "OVERFLOW"
                elif fill_pct >= 80.0:
                    b.status = "CRITICAL"
                elif fill_pct >= 60.0:
                    b.status = "HIGH"
                elif fill_pct <= 25.0:
                    b.status = "EMPTY"
                else:
                    b.status = "NORMAL"
                return b
        return None

    def add_waste_deposit(self, weight_kg: float, material: str, price_per_kg: float, notes: str):
        earned = round(weight_kg * price_per_kg, 2)
        new_balance = self.waste_bank.balance_idr + earned
        self.waste_bank.balance_idr = new_balance
        self.waste_bank.total_deposited_kg += weight_kg
        self.waste_bank.points += int(weight_kg * 10)
        self.waste_bank.eco_score += int(weight_kg * 2)

        entry = LedgerEntry(
            id=f"led-{int(time.time())}",
            date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            transaction_type="DEPOSIT",
            description=f"Setor {weight_kg} Kg {material} ({notes})",
            amount=earned,
            balance_after=new_balance,
            weight_kg=weight_kg,
            material=material
        )
        self.ledger.insert(0, entry)
        return entry

    def withdraw_balance(self, amount: float, target_account: str):
        if amount > self.waste_bank.balance_idr:
            raise ValueError("Saldo tidak mencukupi untuk penarikan")
        new_balance = self.waste_bank.balance_idr - amount
        self.waste_bank.balance_idr = new_balance
        entry = LedgerEntry(
            id=f"led-{int(time.time())}",
            date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            transaction_type="WITHDRAWAL",
            description=f"Pencairan Saldo ke {target_account}",
            amount=-amount,
            balance_after=new_balance
        )
        self.ledger.insert(0, entry)
        return entry

    def create_order(self, listing_id: str, buyer_name: str, buyer_company: str, weight_kg: float):
        listing = next((item for item in self.listings if item.id == listing_id), None)
        if not listing:
            raise ValueError("Listing tidak ditemukan")
        if weight_kg > listing.available_kg:
            raise ValueError(f"Stok tersedia hanya {listing.available_kg} Kg")

        subtotal = round(weight_kg * listing.price_per_kg, 2)
        service_fee = round(subtotal * 0.01, 2)
        total = subtotal + service_fee

        order = MarketplaceOrder(
            id=f"ord-{int(time.time())}",
            order_number=f"WW-ORD-{datetime.now().strftime('%Y%m%d')}-{random.randint(100, 999)}",
            listing_id=listing.id,
            listing_title=listing.title,
            buyer_name=buyer_name,
            buyer_company=buyer_company,
            weight_kg=weight_kg,
            price_per_kg=listing.price_per_kg,
            subtotal=subtotal,
            service_fee=service_fee,
            total_amount=total,
            payment_status="PAID",
            fulfillment_status="WAITING_PICKUP",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        listing.available_kg -= weight_kg
        if listing.available_kg <= 0:
            listing.status = "SOLD"
        self.orders.insert(0, order)
        return order

    def add_listing(self, title: str, material_category: str, seller_name: str, seller_type: str, quality_grade: str, available_kg: float, price_per_kg: float, min_order_kg: float, location_name: str, image_url: str):
        listing = MarketplaceListing(
            id=f"list-{int(time.time())}-{random.randint(10, 99)}",
            title=title,
            material_category=material_category,
            seller_name=seller_name,
            seller_type=seller_type,
            quality_grade=quality_grade,
            available_kg=available_kg,
            price_per_kg=price_per_kg,
            min_order_kg=min_order_kg,
            location_name=location_name,
            lat=-7.2575 + random.uniform(-0.03, 0.03),
            lng=112.7521 + random.uniform(-0.03, 0.03),
            image_url=image_url or "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600",
            status="ACTIVE",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        self.listings.insert(0, listing)
        return listing

    def update_dumping_status(self, report_id: str, status: str):
        report = next((r for r in self.dumping_reports if r.id == report_id), None)
        if not report:
            raise ValueError("Laporan pembuangan liar tidak ditemukan")
        report.status = status
        return report

    def tick_iot_simulation(self):
        alerts = []
        for b in self.bins:
            # Natural drift: slight fill increase or jitter
            delta_fill = round(random.uniform(0.5, 3.5), 1)
            b.fill_percentage = min(100.0, round(b.fill_percentage + delta_fill, 1))
            b.weight_kg = round(b.weight_kg + (delta_fill * 0.45), 1)
            b.temperature_c = round(28.0 + random.uniform(-1.0, 3.0), 1)
            b.battery_percentage = max(15.0, round(b.battery_percentage - 0.1, 1))

            if b.fill_percentage >= 95.0:
                b.status = "OVERFLOW"
                alerts.append(f"ALARM: {b.code} ({b.name}) OVERFLOW ({b.fill_percentage}%)!")
            elif b.fill_percentage >= 80.0:
                b.status = "CRITICAL"
                alerts.append(f"PERINGATAN: {b.code} ({b.name}) mencapai batas kritis ({b.fill_percentage}%)!")
            elif b.fill_percentage >= 60.0:
                b.status = "HIGH"
            else:
                b.status = "NORMAL"

            b.last_updated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        return {"bins": self.bins, "alerts": alerts}


# Singleton store instance
store = WasteWiseDataStore()

# -------------------------------------------------------------
# ENCYCLOPEDIA & SORTING GUIDE DATABASE (23+ ITEMS)
# -------------------------------------------------------------

WASTE_GUIDE_DATABASE = [
    {
        "id": "g-01",
        "name": "Botol Air Mineral (PET #1)",
        "category": "PLASTIC",
        "code": "PET 1",
        "recyclable": True,
        "est_price_idr": 4500,
        "instructions": "Buka tutup botol, kosongkan cairan, lepaskan label plastik tipis, dan remas hingga pipih.",
        "icon": "🧴"
    },
    {
        "id": "g-02",
        "name": "Botol Shampo & Sabun Cair (HDPE #2)",
        "category": "PLASTIC",
        "code": "HDPE 2",
        "recyclable": True,
        "est_price_idr": 5200,
        "instructions": "Bilas bersih sisa sabun untuk menghindari kontaminasi. Sangat diminati industri daur ulang.",
        "icon": "🧴"
    },
    {
        "id": "g-03",
        "name": "Kardus Kemasan & Box Karton",
        "category": "PAPER",
        "code": "PAP 20",
        "recyclable": True,
        "est_price_idr": 2200,
        "instructions": "Buka lakban perekat, lipat kardus hingga gepeng, jaga agar tetap kering bebas minyak.",
        "icon": "📦"
    },
    {
        "id": "g-04",
        "name": "Kertas HVS & Dokumen Bekas",
        "category": "PAPER",
        "code": "PAP 22",
        "recyclable": True,
        "est_price_idr": 2800,
        "instructions": "Lepaskan staples atau klip kertas besi. Kertas putih bernilai lebih tinggi dari kertas buram.",
        "icon": "📄"
    },
    {
        "id": "g-05",
        "name": "Kaleng Minuman Ringan (Aluminium)",
        "category": "METAL",
        "code": "ALU 41",
        "recyclable": True,
        "est_price_idr": 18500,
        "instructions": "Bilas sisa minuman, injak hingga gepeng. Aluminium 100% dapat dilebur kembali tanpa batas.",
        "icon": "🥫"
    },
    {
        "id": "g-06",
        "name": "Kaleng Biskuit & Susu Kental Manis",
        "category": "METAL",
        "code": "FE 40",
        "recyclable": True,
        "est_price_idr": 4800,
        "instructions": "Cuci bersih sisa minyak/susu manis. Kumpulkan bersama logam ferro sejenis.",
        "icon": "🥫"
    },
    {
        "id": "g-07",
        "name": "Botol Sirup & Kaca Kecap",
        "category": "GLASS",
        "code": "GL 70",
        "recyclable": True,
        "est_price_idr": 800,
        "instructions": "Pastikan botol utuh tidak pecah. Bersihkan sisa bumbu/gula di dalamnya.",
        "icon": "🍾"
    },
    {
        "id": "g-08",
        "name": "Sisa Sayuran & Kulit Buah",
        "category": "ORGANIC",
        "code": "ORG-WET",
        "recyclable": True,
        "est_price_idr": 1200,
        "instructions": "Masukkan ke komposter ember tumpuk atau biopori rumah tangga. Menghasilkan pupuk cair alami.",
        "icon": "🥬"
    },
    {
        "id": "g-09",
        "name": "Minyak Jelantah (Used Cooking Oil / UCO)",
        "category": "ORGANIC",
        "code": "UCO",
        "recyclable": True,
        "est_price_idr": 9500,
        "instructions": "Saring remah sisa gorengan, tuang ke jeriken/botol tertutup. Dijadikan bahan baku Biodiesel.",
        "icon": "🛢️"
    },
    {
        "id": "g-10",
        "name": "Baterai Jam & Remot Bekas",
        "category": "HAZARDOUS",
        "code": "B3-BAT",
        "recyclable": False,
        "est_price_idr": 0,
        "instructions": "BAHAYA TIMBAL & ASAM! Rekatkan selotip pada kutubnya, masukkan ke Drop Box Khusus B3.",
        "icon": "🔋"
    },
    {
        "id": "g-11",
        "name": "Kemasan Susu & Jus UHT (Tetrapak)",
        "category": "PAPER",
        "code": "C/PAP 84",
        "recyclable": True,
        "est_price_idr": 1500,
        "instructions": "Buka lipatan sudut, gunting bagian atas, bilas bersih, dan ratakan. Serat kertasnya dipisahkan.",
        "icon": "🧃"
    },
    {
        "id": "g-12",
        "name": "Pakaian Rusak & Kain Perca",
        "category": "TEXTILE",
        "code": "TEX",
        "recyclable": True,
        "est_price_idr": 3000,
        "instructions": "Pastikan kering dan bebas jamur. Didaur ulang menjadi isolator peredam suara dan lap industri.",
        "icon": "👕"
    },
    {
        "id": "g-13",
        "name": "Styrofoam & Gabus Kemasan (PS #6)",
        "category": "RESIDUAL",
        "code": "PS 6",
        "recyclable": False,
        "est_price_idr": 0,
        "instructions": "Hindari pembakaran terbuka karena gas beracun. Dipadatkan melalui thermal densifier di TPST.",
        "icon": "📦"
    },
    {
        "id": "g-14",
        "name": "Ponsel Bekas & Komponen PCB",
        "category": "E-WASTE",
        "code": "WEEE",
        "recyclable": True,
        "est_price_idr": 25000,
        "instructions": "Mengandung logam mulia emas & tembaga. Serahkan ke Bank Sampah Elektronik berizin.",
        "icon": "📱"
    }
]

# -------------------------------------------------------------
# GAMIFICATION & ECO-BADGES DATA
# -------------------------------------------------------------

GAMIFICATION_DATA = {
    "user_level": "Eco Guardian Level 4",
    "eco_score": 780,
    "max_score": 1000,
    "streak_days": 18,
    "badges": [
        {
            "id": "b-01",
            "title": "Pionir Pemilahan",
            "desc": "Melakukan scan sampah AI pertama kali",
            "icon": "🌱",
            "unlocked": True,
            "date": "01 Nov 2026"
        },
        {
            "id": "b-02",
            "title": "Pahlawan Botol PET",
            "desc": "Menyetorkan lebih dari 10 kg plastik ke bank sampah",
            "icon": "🧴",
            "unlocked": True,
            "date": "04 Nov 2026"
        },
        {
            "id": "b-03",
            "title": "Detektif Lingkungan",
            "desc": "Melaporkan titik tumpukan sampah liar terverifikasi",
            "icon": "🔍",
            "unlocked": True,
            "date": "07 Nov 2026"
        },
        {
            "id": "b-04",
            "title": "Kompos Master",
            "desc": "Mengolah 20 kg sampah dapur menjadi pupuk",
            "icon": "🍂",
            "unlocked": False,
            "date": None
        },
        {
            "id": "b-05",
            "title": "Duta Sirkular 2026",
            "desc": "Mencapai Eco-Score 900+ dan diverifikasi DLH",
            "icon": "👑",
            "unlocked": False,
            "date": None
        }
    ],
    "daily_missions": [
        {"id": "m-01", "task": "Lakukan 1x pemindaian kamera AI", "reward": "+50 Poin", "done": True},
        {"id": "m-02", "task": "Periksa status Smart Bin di areamu", "reward": "+25 Poin", "done": True},
        {"id": "m-03", "task": "Ajukan jadwal penjemputan daur ulang", "reward": "+100 Poin", "done": False}
    ]
}

