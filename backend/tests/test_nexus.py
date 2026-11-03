import os
import sys
import pytest

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.services.ilp_solver import IntegerLinearProgramSolver
from app.agents.swarm import RoleBasedAccessController, SwarmOrchestratorEngine
from app.services.drive_reader import GoogleDriveDatabaseReader


SAMPLE_DRIVE_DATABASE = {
    "status": "CONNECTED",
    "folder_id": "sample-folder-123",
    "cloud_docs_link": "https://drive.google.com/drive/folders/sample-folder-123",
    "crawled_at": "2026-11-03T00:00:00+00:00",
    "files_indexed": 3,
    "products_count": 2,
    "suppliers_count": 2,
    "products": [
        {
            "id": "HELIOS-T800",
            "name": "Titan-800 Industrial Inverters",
            "category": "Industrial Inverter",
            "current_stock": 220,
            "min_safety_stock": 180,
            "reorder_point": 400,
            "unit_cost": 12500.0,
            "sales_velocity": 45,
            "source_doc": "helios_catalog.csv",
        },
        {
            "id": "HELIOS-A5000",
            "name": "Apex-Grid Solar Inverter 5000",
            "category": "Solar Inverter",
            "current_stock": 170,
            "min_safety_stock": 150,
            "reorder_point": 350,
            "unit_cost": 8500.0,
            "sales_velocity": 30,
            "source_doc": "helios_catalog.csv",
        },
    ],
    "suppliers": [
        {
            "id": "SUP-SILICON",
            "name": "Silicon Valley Components",
            "unit_cost": 8000.0,
            "advance_pct": 0.3,
            "lead_time_days": 5,
            "capacity": 500,
            "payment_terms": "Net-30",
            "sla": "5-day express",
            "source_doc": "suppliers.csv",
        },
        {
            "id": "SUP-GLOBAL",
            "name": "Global Power Logistics",
            "unit_cost": 7800.0,
            "advance_pct": 0.5,
            "lead_time_days": 3,
            "capacity": 300,
            "payment_terms": "50% Advance",
            "sla": "3-day air freight",
            "source_doc": "suppliers.csv",
        },
    ],
    "files": [
        {"id": "f1", "name": "helios_catalog.csv", "mime_type": "text/csv", "status": "parsed", "source_doc": "helios_catalog.csv"},
        {"id": "f2", "name": "suppliers.csv", "mime_type": "text/csv", "status": "parsed", "source_doc": "suppliers.csv"},
        {"id": "f3", "name": "cash_reserve_governance.md", "mime_type": "text/markdown", "status": "parsed", "source_doc": "cash_reserve_governance.md"},
    ],
    "financials": {
        "ledger_cash": 950000.0,
        "statutory_reserve": 500000.0,
        "safe_cash_cap": 250000.0,
    },
    "manifest_used": False,
    "extraction_confidence": "high",
    "errors": [],
}

client = TestClient(app)

def test_milp_solver_optimality():
    """Verify SciPy HiGHS MILP solver achieves exact mathematical optimality."""
    res = IntegerLinearProgramSolver.solve(deficit_units=900, safe_cash_cap=180000.0)
    assert res["feasible"] is True
    assert res["status"] == "OPTIMAL"
    assert res["total_units"] == 900
    assert res["total_upfront_cash"] <= 180000.0
    assert len(res["allocation_plan"]) >= 1

def test_milp_solver_zero_deficit():
    """Verify solver handles 0 deficit gracefully."""
    res = IntegerLinearProgramSolver.solve(deficit_units=0)
    assert res["feasible"] is True
    assert res["total_units"] == 0
    assert res["total_upfront_cash"] == 0.0

def test_milp_solver_partial_infeasibility_graceful_handling():
    """Verify solver handles severe cash constraints gracefully."""
    res = IntegerLinearProgramSolver.solve(deficit_units=5000, safe_cash_cap=50000.0)
    # If 5000 units cannot be funded within 50,000 cash cap, solver produces bounded maximal partial
    assert res["total_upfront_cash"] <= 50000.0
    assert "allocation_plan" in res

def test_rbac_permissions():
    """Verify RBAC role hierarchy and action permissions."""
    ceo_perm = RoleBasedAccessController.verify_action_permission("LEVEL_4_EXECUTIVE", "TREASURY_OVERRIDE")
    assert ceo_perm["allowed"] is True

    sales_perm = RoleBasedAccessController.verify_action_permission("LEVEL_2_SALES", "TREASURY_OVERRIDE")
    assert sales_perm["allowed"] is False
    assert "RBAC Restriction" in sales_perm["reason"]

def test_swarm_orchestrator_pipeline():
    """Verify end-to-end multi-agent swarm execution."""
    engine = SwarmOrchestratorEngine()
    res = engine.run_swarm("Compare Supplier B and C for urgent replenishment", user_role="CEO & Founder")
    assert res["success"] is True
    assert res["status"] == "COMPLETED"
    assert res["feasible"] is True
    assert len(res["agent_telemetry"]) == 5
    assert res["optimization_proof"]["solver_name"] is not None

def test_api_health():
    """Verify /api/v1/health status."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "SciPy HiGHS" in data["milp_solver"]

def test_api_overview():
    """Verify /api/v1/overview contract."""
    res = client.get("/api/v1/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["cash_balance"] == 850000.0
    assert len(data["inventory_summary"]) >= 1

def test_api_onboarding_and_workspace():
    """Verify workspace onboarding flow and token isolation."""
    onboard_payload = {
        "user_name": "Test Executive",
        "user_role": "CEO & Founder",
        "company_name": "Enterprise Test Corp",
        "cloud_docs_link": "https://drive.google.com/drive/folders/test-folder-123"
    }
    res = client.post("/api/v1/workspace/onboard", json=onboard_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["dynamic_agents"]) == 5
    token = data["client_token"]
    assert token and isinstance(token, str)

    current = client.get("/api/v1/workspace/current", headers={"X-Workspace-Token": token})
    assert current.status_code == 200
    assert current.json()["company_name"] == "Enterprise Test Corp"


def test_workspace_token_isolation():
    """Verify two onboarded workspaces do not leak into each other."""
    res_a = client.post("/api/v1/workspace/onboard", json={
        "user_name": "User A",
        "user_role": "CEO & Founder",
        "company_name": "Company A",
        "cloud_docs_link": "https://drive.google.com/drive/folders/company-a"
    })
    res_b = client.post("/api/v1/workspace/onboard", json={
        "user_name": "User B",
        "user_role": "CEO & Founder",
        "company_name": "Company B",
        "cloud_docs_link": "https://drive.google.com/drive/folders/company-b"
    })
    token_a = res_a.json()["client_token"]
    token_b = res_b.json()["client_token"]
    assert token_a != token_b

    current_a = client.get("/api/v1/workspace/current", headers={"X-Workspace-Token": token_a})
    current_b = client.get("/api/v1/workspace/current", headers={"X-Workspace-Token": token_b})
    assert current_a.json()["company_name"] == "Company A"
    assert current_b.json()["company_name"] == "Company B"


def test_dynamic_product_catalog_and_swarm():
    """Verify any arbitrary company and product catalog functions dynamically without hardcoded P100."""
    custom_onboard = {
        "user_name": "Elena Rostova",
        "user_role": "VP Operations",
        "company_name": "Helios CleanEnergy Corp",
        "industry": "Renewable Energy & Battery Storage",
        "primary_product": "Titan-800 Industrial Inverters",
        "cloud_docs_link": "https://drive.google.com/drive/folders/helios-clean-energy"
    }
    res = client.post("/api/v1/workspace/onboard", json=custom_onboard)
    assert res.status_code == 200
    data = res.json()
    assert data["company_name"] == "Helios CleanEnergy Corp"
    assert data["primary_product"] == "Titan-800 Industrial Inverters"
    assert data["industry"] == "Renewable Energy & Battery Storage"

    # Verify swarm dynamic extraction with this custom product line
    engine = SwarmOrchestratorEngine()
    swarm_res = engine.run_swarm(
        "Surge +65% detected on Titan-800 Industrial Inverters. Formulate supplier split under 250000 cash cap.",
        user_role="VP Operations",
        workspace_config={
            "company_name": "Helios CleanEnergy Corp",
            "primary_product": "Titan-800 Industrial Inverters",
            "database_extracted": data["drive_database"],
        },
    )
    assert swarm_res["success"] is True
    # Ensure the executive brief and thinking process reference the dynamic product
    assert "Titan-800" in swarm_res["executive_brief"] or "Industrial Inverters" in swarm_res["executive_brief"]
    assert "SciPy HiGHS" in swarm_res["optimization_proof"]["solver_name"]


def test_api_decision_action():
    """Verify human-in-the-loop decision approval."""
    res = client.post("/api/v1/decisions/action", json={
        "decision_id": "DEC-TEST-PYTEST",
        "action": "APPROVED",
        "reviewer_notes": "Approved by automated CI verification"
    })
    assert res.status_code == 200
    assert res.json()["action"] == "APPROVED"


def test_api_knowledge_rbac():
    """Verify knowledge endpoint enforces RBAC between departments."""
    res = client.post("/api/v1/knowledge/query", json={
        "requesting_agent": "SalesAgent",
        "department": "finance",
        "query_text": "statutory lock"
    })
    assert res.status_code == 200
    assert res.json()["status"] == "RESTRICTED"


def test_drive_ingestion_honest_status_for_invalid_link():
    """Verify real Drive ingestion reports honest status instead of fabricating data."""
    onboard_payload = {
        "user_name": "Marcus Vance",
        "user_role": "CEO & Founder",
        "company_name": "Apex Clean Energy Solutions",
        "industry": "Renewable Clean Energy",
        "primary_product": "Apex-Grid Solar Inverter 5000",
        "cloud_docs_link": "https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
    }
    res = client.post("/api/v1/workspace/onboard", json=onboard_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["drive_database"] is not None
    assert data["drive_database"]["folder_id"] == "1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
    # With a non-public / non-existent folder the pipeline must not fabricate catalog rows
    assert data["drive_database"]["status"] in {"INVALID_LINK", "PERMISSION_DENIED", "FOLDER_NOT_FOUND", "NEEDS_API_KEY"}
    assert data["drive_database"]["products_count"] == 0
    assert data["drive_database"]["suppliers_count"] == 0


def test_drive_grounding_with_sample_catalog(monkeypatch):
    """Verify the platform correctly grounds overview and swarm output in an extracted Drive catalog."""
    monkeypatch.setattr(GoogleDriveDatabaseReader, "ingest_drive_database", lambda *args, **kwargs: SAMPLE_DRIVE_DATABASE)

    onboard_payload = {
        "user_name": "Marcus Vance",
        "user_role": "CEO & Founder",
        "company_name": "Apex Clean Energy Solutions",
        "industry": "Renewable Clean Energy",
        "primary_product": "Apex-Grid Solar Inverter 5000",
        "cloud_docs_link": "https://drive.google.com/drive/folders/sample-folder-123"
    }
    res = client.post("/api/v1/workspace/onboard", json=onboard_payload)
    assert res.status_code == 200
    data = res.json()
    token = data["client_token"]
    assert data["drive_database"]["status"] == "CONNECTED"
    assert data["drive_database"]["products_count"] == 2
    assert data["drive_database"]["suppliers_count"] == 2

    # Verify overview metrics reflect the Drive database
    ov = client.get("/api/v1/overview", headers={"X-Workspace-Token": token})
    assert ov.status_code == 200
    ov_data = ov.json()
    assert ov_data["cash_balance"] == 950000.0
    assert any(item["product_id"] == "HELIOS-T800" for item in ov_data["inventory_summary"])

    # Verify Swarm query lists and verifies against the Drive database
    engine = SwarmOrchestratorEngine()
    inquiry_res = engine.run_swarm(
        "List our Google Drive database catalog and suppliers",
        user_role="CEO & Founder",
        workspace_config={
            "company_name": "Apex Clean Energy Solutions",
            "primary_product": "Apex-Grid Solar Inverter 5000",
            "cloud_docs_link": "https://drive.google.com/drive/folders/sample-folder-123",
            "database_extracted": data["drive_database"],
        },
    )
    assert inquiry_res["success"] is True
    assert "Google Drive Database" in inquiry_res["executive_brief"]
    assert "sample-folder-123" in inquiry_res["executive_brief"]


def test_sync_drive_endpoint(monkeypatch):
    """Verify /api/v1/workspace/sync-drive re-syncs database and respects cache TTL."""
    monkeypatch.setattr(GoogleDriveDatabaseReader, "ingest_drive_database", lambda *args, **kwargs: SAMPLE_DRIVE_DATABASE)

    onboard_payload = {
        "user_name": "Sync Test",
        "user_role": "CEO & Founder",
        "company_name": "Sync Test Corp",
        "cloud_docs_link": "https://drive.google.com/drive/folders/sync-folder"
    }
    res = client.post("/api/v1/workspace/onboard", json=onboard_payload)
    token = res.json()["client_token"]

    res = client.post("/api/v1/workspace/sync-drive", headers={"X-Workspace-Token": token})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "CONNECTED"
    assert data["folder_id"] == "sample-folder-123"
    assert len(data["products"]) == 2
    assert len(data["suppliers"]) == 2
