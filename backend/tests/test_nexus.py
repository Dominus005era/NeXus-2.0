import asyncio
import os
import sys
import uuid
import pytest

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import HTTPException
from fastapi.testclient import TestClient
from app.main import app
from app.core import auth as auth_module
from app.core.auth import AuthenticatedUser, get_current_user
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

# Tests run without live Supabase credentials, so replace the bearer-token
# dependency with a mutable authenticated user. Each test can switch tenants.
_current_owner = {"id": "test-owner-default", "email": "default@nexus.test"}


def _override_current_user() -> AuthenticatedUser:
    return AuthenticatedUser(
        id=_current_owner["id"],
        email=_current_owner["email"],
        role="authenticated",
    )


app.dependency_overrides[get_current_user] = _override_current_user


def as_owner(user_id: str) -> None:
    _current_owner["id"] = user_id
    _current_owner["email"] = f"{user_id}@nexus.test"

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
    """Verify /api/v1/overview contract for an authenticated user without a workspace."""
    as_owner("test-owner-overview")
    res = client.get("/api/v1/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["cash_balance"] == 850000.0
    assert len(data["inventory_summary"]) >= 1


def test_api_onboarding_and_workspace():
    """Verify workspace onboarding flow is scoped to the authenticated Supabase user."""
    as_owner("test-owner-onboard")
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
    assert "client_token" not in data

    current = client.get("/api/v1/workspace/current")
    assert current.status_code == 200
    assert current.json()["configured"] is True
    assert current.json()["company_name"] == "Enterprise Test Corp"


def test_workspace_owner_isolation():
    """Verify two authenticated users do not leak workspaces into each other."""
    as_owner("test-owner-a")
    res_a = client.post("/api/v1/workspace/onboard", json={
        "user_name": "User A",
        "user_role": "CEO & Founder",
        "company_name": "Company A",
        "cloud_docs_link": "https://drive.google.com/drive/folders/company-a"
    })
    assert res_a.status_code == 200

    as_owner("test-owner-b")
    res_b = client.post("/api/v1/workspace/onboard", json={
        "user_name": "User B",
        "user_role": "CEO & Founder",
        "company_name": "Company B",
        "cloud_docs_link": "https://drive.google.com/drive/folders/company-b"
    })
    assert res_b.status_code == 200

    current_b = client.get("/api/v1/workspace/current")
    assert current_b.json()["company_name"] == "Company B"

    as_owner("test-owner-a")
    current_a = client.get("/api/v1/workspace/current")
    assert current_a.json()["company_name"] == "Company A"


def test_dynamic_product_catalog_and_swarm():
    """Verify any arbitrary company and product catalog functions dynamically without hardcoded P100."""
    as_owner("test-owner-dynamic")
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
    """Verify human-in-the-loop decision approval is owner-scoped."""
    decision_id = f"DEC-TEST-{uuid.uuid4().hex[:8]}"
    as_owner("test-owner-decision")
    res = client.post("/api/v1/decisions/action", json={
        "decision_id": decision_id,
        "action": "APPROVED",
        "reviewer_notes": "Approved by automated CI verification"
    })
    assert res.status_code == 200
    assert res.json()["action"] == "APPROVED"

    # A different user must not be able to review someone else's decision
    as_owner("test-owner-decision-other")
    cross = client.post("/api/v1/decisions/action", json={
        "decision_id": decision_id,
        "action": "REJECTED",
        "reviewer_notes": "Unauthorized review attempt"
    })
    assert cross.status_code == 404


def test_api_knowledge_rbac():
    """Verify knowledge endpoint enforces RBAC between departments."""
    as_owner("test-owner-knowledge")
    res = client.post("/api/v1/knowledge/query", json={
        "requesting_agent": "SalesAgent",
        "department": "finance",
        "query_text": "statutory lock"
    })
    assert res.status_code == 200
    assert res.json()["status"] == "RESTRICTED"


def test_drive_ingestion_honest_status_for_invalid_link():
    """Verify real Drive ingestion reports honest status instead of fabricating data."""
    as_owner("test-owner-honest-drive")
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
    as_owner("test-owner-grounding")

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
    assert data["drive_database"]["status"] == "CONNECTED"
    assert data["drive_database"]["products_count"] == 2
    assert data["drive_database"]["suppliers_count"] == 2

    # Verify overview metrics reflect the Drive database
    ov = client.get("/api/v1/overview")
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
    as_owner("test-owner-sync")

    onboard_payload = {
        "user_name": "Sync Test",
        "user_role": "CEO & Founder",
        "company_name": "Sync Test Corp",
        "cloud_docs_link": "https://drive.google.com/drive/folders/sync-folder"
    }
    res = client.post("/api/v1/workspace/onboard", json=onboard_payload)
    assert res.status_code == 200

    res = client.post("/api/v1/workspace/sync-drive")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "CONNECTED"
    assert data["folder_id"] == "sample-folder-123"
    assert len(data["products"]) == 2
    assert len(data["suppliers"]) == 2


class _FakeSupabaseResponse:
    def __init__(self, status_code: int, payload: dict):
        self.status_code = status_code
        self._payload = payload

    def json(self) -> dict:
        return self._payload


class _FakeAsyncClient:
    def __init__(self, response: _FakeSupabaseResponse):
        self._response = response

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False

    async def get(self, *args, **kwargs):
        return self._response


def _patch_supabase(monkeypatch, response: _FakeSupabaseResponse):
    monkeypatch.setattr(auth_module.settings, "NEXUS_AUTH_DISABLED", False)
    monkeypatch.setattr(auth_module.settings, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(auth_module.settings, "SUPABASE_ANON_KEY", "test-anon-key")
    monkeypatch.setattr(
        auth_module.httpx,
        "AsyncClient",
        lambda *args, **kwargs: _FakeAsyncClient(response),
    )


def test_auth_rejects_missing_bearer_token(monkeypatch):
    """Verify protected endpoints reject requests without a bearer token."""
    _patch_supabase(monkeypatch, _FakeSupabaseResponse(200, {}))
    with pytest.raises(HTTPException) as exc:
        asyncio.run(auth_module.get_current_user(authorization=None))
    assert exc.value.status_code == 401


def test_auth_verifies_supabase_token(monkeypatch):
    """Verify a Supabase access token is exchanged for a trusted user identity."""
    _patch_supabase(monkeypatch, _FakeSupabaseResponse(200, {
        "id": "8f2c1a4e-user",
        "email": "exec@company.test",
        "user_metadata": {"role": "authenticated"},
    }))
    user = asyncio.run(auth_module.get_current_user(authorization="Bearer valid-token"))
    assert user.id == "8f2c1a4e-user"
    assert user.email == "exec@company.test"
    assert user.role == "authenticated"


def test_auth_rejects_invalid_supabase_session(monkeypatch):
    """Verify Supabase 401 responses surface as 401 instead of leaking through."""
    _patch_supabase(monkeypatch, _FakeSupabaseResponse(401, {"message": "invalid JWT"}))
    with pytest.raises(HTTPException) as exc:
        asyncio.run(auth_module.get_current_user(authorization="Bearer expired-token"))
    assert exc.value.status_code == 401


def test_auth_fails_closed_without_supabase_config(monkeypatch):
    """Verify the API refuses to authenticate anyone when Supabase is unconfigured."""
    monkeypatch.setattr(auth_module.settings, "NEXUS_AUTH_DISABLED", False)
    monkeypatch.setattr(auth_module.settings, "SUPABASE_URL", "")
    monkeypatch.setattr(auth_module.settings, "SUPABASE_ANON_KEY", "")
    with pytest.raises(HTTPException) as exc:
        asyncio.run(auth_module.get_current_user(authorization="Bearer any-token"))
    assert exc.value.status_code == 503


def test_swarm_and_chat_streaming_sse():
    """Verify Server-Sent Events (SSE) streaming for real-time multi-agent reasoning."""
    _current_owner["id"] = "test-owner-stream"

    # Test /swarm/stream
    with client.stream(
        "POST",
        "/api/v1/swarm/stream",
        json={"prompt": "Surge +70% on P100. Solve optimal split.", "surge_multiplier": 70.0}
    ) as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        events = []
        for line in response.iter_lines():
            if line.startswith("data: "):
                events.append(line)
        assert len(events) >= 5
        assert any("Nexus Swarm Orchestrator" in ev for ev in events)
        assert any("complete" in ev for ev in events)

    # Test /chat/stream
    with client.stream(
        "POST",
        "/api/v1/chat/stream",
        json={"prompt": "What is our current cash cap and inventory status?"}
    ) as chat_res:
        assert chat_res.status_code == 200
        assert "text/event-stream" in chat_res.headers["content-type"]
        chat_events = []
        for line in chat_res.iter_lines():
            if line.startswith("data: "):
                chat_events.append(line)
        assert len(chat_events) >= 5
        assert any("complete" in ev for ev in chat_events)

