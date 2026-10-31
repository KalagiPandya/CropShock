"""
CropShock - FastAPI Backend Integration Tests
Tests all core analytical endpoints, health checks, and procurement simulation.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.main import app

client = TestClient(app)


def test_health_check():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["backend_status"] == "ONLINE"
    assert data["total_markets_registered"] == 40
    assert data["total_commodities_tracked"] == 40


def test_list_markets():
    resp = client.get("/api/v1/markets")
    assert resp.status_code == 200
    markets = resp.json()
    assert len(markets) == 40
    assert any(m["name"] == "Gondal APMC" for m in markets)
    assert any(m["district"] == "Chhota Udaipur" for m in markets)
    districts = set(m["district"] for m in markets)
    assert len(districts) == 33, f"Expected all 33 districts, found {len(districts)}"


def test_list_commodities():
    resp = client.get("/api/v1/commodities")
    assert resp.status_code == 200
    commodities = resp.json()
    assert len(commodities) == 40
    assert any(c["code"] == "TOM" for c in commodities)
    assert any(c["code"] == "POT" for c in commodities)
    assert any(c["code"] == "SWC" for c in commodities)
    assert any(c["code"] == "ASH" for c in commodities)
    assert any(c["code"] == "KNK" for c in commodities)


def test_analytics_overview():
    resp = client.get("/api/v1/analytics/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_tonnage_mt" in data
    assert "state_avg_modal_price" in data
    assert data["active_mandis_count"] > 0


def test_analytics_trends():
    resp = client.get("/api/v1/analytics/trends?commodity_id=1")
    assert resp.status_code == 200
    trends = resp.json()
    assert len(trends) > 0
    assert "modal_price" in trends[0]
    assert "ma_7_modal_price" in trends[0]


def test_supply_risk_scores():
    resp = client.get("/api/v1/analytics/supply-risk?limit=10")
    assert resp.status_code == 200
    risks = resp.json()
    assert len(risks) > 0
    assert "risk_score" in risks[0]
    assert "risk_level" in risks[0]


def test_compare_markets():
    resp = client.get("/api/v1/analytics/compare?commodity_id=1&market_ids=1,2,14,30")
    assert resp.status_code == 200
    data = resp.json()
    assert "markets" in data
    assert len(data["markets"]) > 0


def test_procurement_planner():
    payload = {
        "commodity_id": 1,
        "destination_district": "Ahmedabad",
        "target_quantity_mt": 50.0,
        "transport_rate_per_km_mt": 4.5
    }
    resp = client.post("/api/v1/analytics/procurement-planner", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    assert "cheapest_source_mandi" in data


def test_auth_and_schedules_lifecycle():
    # 1. Login with demo user
    login_resp = client.post("/api/v1/auth/login", json={"email": "rajesh.patel@gujaratagrifoods.com"})
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    assert token_data["user"]["role"] == "PROCUREMENT_MANAGER"

    # 2. Verify /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "rajesh.patel@gujaratagrifoods.com"

    # 3. Create a schedule
    schedule_payload = {
        "commodity_id": 1,
        "commodity_name": "Potato (બટાટા)",
        "source_mandi_id": 201,
        "source_mandi_name": "Deesa APMC",
        "destination_district": "Ahmedabad",
        "quantity_mt": 30.0,
        "transport_rate_per_km_mt": 4.5,
        "modal_price_per_qtl": 1200.0,
        "landed_cost_per_mt": 13500.0,
        "total_outlay": 405000.0,
        "arbitrage_savings": 25000.0
    }
    create_resp = client.post("/api/v1/schedules", json=schedule_payload, headers=headers)
    assert create_resp.status_code == 200
    created = create_resp.json()
    schedule_id = created["id"]
    assert created["quantity_mt"] == 30.0

    # 4. List schedules
    list_resp = client.get("/api/v1/schedules", headers=headers)
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert any(s["id"] == schedule_id for s in items)

    # 5. Delete schedule
    del_resp = client.delete(f"/api/v1/schedules/{schedule_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["success"] is True


if __name__ == "__main__":
    pytest.main(["-v", __file__])
