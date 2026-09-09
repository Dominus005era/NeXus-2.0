import os
import sys
import pytest

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.services.ilp_solver import IntegerLinearProgramSolver
from app.agents.swarm import RoleBasedAccessController, SwarmOrchestratorEngine

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
    """Verify workspace onboarding flow."""
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

    current = client.get("/api/v1/workspace/current")
    assert current.status_code == 200
    assert current.json()["company_name"] == "Enterprise Test Corp"

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
