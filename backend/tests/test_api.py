import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_auth_me_and_switch_role():
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    assert res.json()["name"] == "Fahmi Gunawan"

    res = client.post("/api/auth/switch-role?role=citizen")
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "citizen"

    # Reset back to super_admin
    client.post("/api/auth/switch-role?role=super_admin")

def test_ai_classify():
    res = client.post("/api/ai/classify", json={"mock_type": "plastic"})
    assert res.status_code == 200
    data = res.json()
    assert data["detected_category"] == "PLASTIC"
    assert "confidence_score" in data
    assert "bounding_box" in data
    assert "purity_grade" in data

def test_ai_assistant():
    res = client.post("/api/ai/assistant", json={"message": "bin mana yang kritis?"})
    assert res.status_code == 200
    assert "Kritis" in res.json()["reply"]

def test_bins_and_simulation():
    res = client.get("/api/bins")
    assert res.status_code == 200
    bins = res.json()
    assert len(bins) > 0
    bin_id = bins[0]["id"]

    sim_res = client.post(f"/api/bins/{bin_id}/simulate", json={"fill_percentage": 92.5, "weight_kg": 45.0})
    assert sim_res.status_code == 200
    assert sim_res.json()["bin"]["fill_percentage"] == 92.5
    assert sim_res.json()["bin"]["status"] == "CRITICAL"

def test_logistics_tasks():
    res = client.get("/api/logistics/tasks")
    assert res.status_code == 200
    tasks = res.json()
    assert len(tasks) > 0

def test_marketplace():
    res = client.get("/api/marketplace/listings")
    assert res.status_code == 200
    listings = res.json()
    assert len(listings) > 0

    # Test order
    order_req = {
        "listing_id": listings[0]["id"],
        "buyer_name": "PT Daur Ulang Mandiri",
        "buyer_company": "PT Daur Ulang Mandiri",
        "weight_kg": 100.0
    }
    order_res = client.post("/api/marketplace/orders", json=order_req)
    assert order_res.status_code == 200
    assert "order" in order_res.json()

def test_waste_bank():
    res = client.get("/api/waste-bank/account")
    assert res.status_code == 200
    data = res.json()
    assert "account" in data
    assert "ledger" in data

    dep_res = client.post("/api/waste-bank/deposit", json={
        "weight_kg": 10.0,
        "material": "Plastik Botol PET",
        "price_per_kg": 4500
    })
    assert dep_res.status_code == 200
    assert dep_res.json()["new_balance"] > 0

def test_analytics():
    res = client.get("/api/analytics/overview")
    assert res.status_code == 200
    assert "city_recycling_rate_pct" in res.json()

    fc_res = client.get("/api/analytics/forecast")
    assert fc_res.status_code == 200
    assert len(fc_res.json()) == 7

def test_dumping_reports():
    res = client.get("/api/geospatial/dumping-reports")
    assert res.status_code == 200
    assert len(res.json()) > 0
