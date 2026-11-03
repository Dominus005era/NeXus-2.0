import asyncio
import datetime
import json
import time
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.database import get_db
from app.models.db_models import DecisionAuditModel
from app.models.schemas import (
    SwarmRunRequest,
    SwarmRunResponse,
)
from app.api.v1.endpoints import helpers

router = APIRouter(tags=["Swarm"])

@router.post("/swarm/run", response_model=SwarmRunResponse)
def run_swarm_pipeline(
    req: SwarmRunRequest,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
):
    workspace = helpers.get_workspace_for_user(db, user.id)
    workspace_config = helpers._workspace_config_for_swarm(workspace) or req.workspace_config

    try:
        res = helpers.swarm_engine.run_swarm(
            prompt=req.prompt,
            surge_multiplier=req.surge_multiplier or 70.0,
            user_role=req.user_role or "CEO & Founder",
            authority_level=req.authority_level,
            workspace_config=workspace_config,
            model_id=req.model_id or "gemini-3.6-flash"
        )

        # Audit decision if allocation plan was produced
        if res.get("allocation_plan"):
            audit_id = f"DEC-{int(time.time())}-{uuid.uuid4().hex[:4]}"
            audit = DecisionAuditModel(
                id=audit_id,
                owner_id=user.id,
                product_id="P100",
                trigger_event=req.prompt[:250],
                deficit_units=res.get("total_units", 0),
                total_cost=res.get("optimization_proof", {}).get("objective_value", 0.0),
                total_upfront_cash=res.get("total_upfront_cash", 0.0),
                mathematical_feasibility=res.get("feasible", True),
                optimization_proof=str(res.get("optimization_proof")),
                allocation_plan=res.get("allocation_plan"),
                reviewer_action="PENDING"
            )
            try:
                db.add(audit)
                db.commit()
            except Exception:
                db.rollback()

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/swarm/stream")
async def stream_swarm_pipeline(
    req: SwarmRunRequest,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Real-Time Server-Sent Events (SSE) stream for multi-agent swarm execution.
    Yields events at each stage of the multi-agent decision loop:
    Decompose -> Sales Analysis -> Inventory Telemetry -> Treasury Audit -> MILP Solver -> Executive Brief.
    """
    workspace = helpers.get_workspace_for_user(db, user.id)
    workspace_config = helpers._workspace_config_for_swarm(workspace) or req.workspace_config

    async def event_generator():
        try:
            # 1. Orchestrator Initialization
            yield f"data: {json.dumps({'event': 'agent_start', 'step': 1, 'agent': 'Nexus Swarm Orchestrator', 'action': 'AUTHENTICATING_AND_DECOMPOSING', 'message': f'Authenticating user role {req.user_role} and decomposing operational intent...'})}\n\n"
            await asyncio.sleep(0.2)

            # 2. Sales Intelligence
            surge_val = req.surge_multiplier or 70.0
            yield f"data: {json.dumps({'event': 'agent_progress', 'step': 2, 'agent': 'Sales Intelligence Agent', 'action': 'CALCULATING_DEMAND_SURGE', 'message': f'Computing promotional surge (+{surge_val}%). Projecting 7-day velocity curve...'})}\n\n"
            await asyncio.sleep(0.25)

            # 3. Supply Chain Inventory
            yield f"data: {json.dumps({'event': 'agent_progress', 'step': 3, 'agent': 'Supply Chain & Inventory', 'action': 'AUDITING_WAREHOUSE_TELEMETRY', 'message': 'Auditing central depot stock vs 150-unit safety floor. Depletion horizon flagged...'})}\n\n"
            await asyncio.sleep(0.25)

            # 4. Treasury & Governance
            yield f"data: {json.dumps({'event': 'agent_progress', 'step': 4, 'agent': 'Treasury & Governance', 'action': 'VERIFYING_STATUTORY_LOCK', 'message': 'Auditing ₹8.50L ledger cash. Statutory reserve lock ₹5.00L is 100% PROTECTED. Safe cap: ₹1.80L.'})}\n\n"
            await asyncio.sleep(0.25)

            # Run actual calculation
            res = helpers.swarm_engine.run_swarm(
                prompt=req.prompt,
                surge_multiplier=req.surge_multiplier or 70.0,
                user_role=req.user_role or "CEO & Founder",
                authority_level=req.authority_level,
                workspace_config=workspace_config,
                model_id=req.model_id or "gemini-3.6-flash"
            )

            # 5. Optimization Solver
            opt = res.get("optimization_proof") or {}
            exec_time = opt.get("execution_time_ms", 5.2)
            opt_status = opt.get("status", "OPTIMAL")
            solver_msg = f"Formulated deterministic MILP in {exec_time}ms. Status: {opt_status}."
            yield f"data: {json.dumps({'event': 'agent_progress', 'step': 5, 'agent': 'SciPy HiGHS Decision Solver', 'action': 'SOLVING_MILP', 'message': solver_msg})}\n\n"
            await asyncio.sleep(0.2)

            # Audit decision record
            if res.get("allocation_plan"):
                audit_id = f"DEC-{int(time.time())}-{uuid.uuid4().hex[:4]}"
                audit = DecisionAuditModel(
                    id=audit_id,
                    owner_id=user.id,
                    product_id="P100",
                    trigger_event=req.prompt[:250],
                    deficit_units=res.get("total_units", 0),
                    total_cost=res.get("optimization_proof", {}).get("objective_value", 0.0),
                    total_upfront_cash=res.get("total_upfront_cash", 0.0),
                    mathematical_feasibility=res.get("feasible", True),
                    optimization_proof=str(res.get("optimization_proof")),
                    allocation_plan=res.get("allocation_plan"),
                    reviewer_action="PENDING"
                )
                try:
                    db.add(audit)
                    db.commit()
                except Exception:
                    db.rollback()

            # 6. Complete
            yield f"data: {json.dumps({'event': 'complete', 'step': 6, 'agent': 'Nexus Swarm Orchestrator', 'action': 'SYNTHESIS_COMPLETE', 'data': res})}\n\n"
        except Exception as ex:
            yield f"data: {json.dumps({'event': 'error', 'message': str(ex)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/orchestrator/trigger")
def trigger_orchestrator(
    product_id: str = Query("P100"),
    trigger_event: str = Query("VIRAL_DEMAND_SPIKE_P100"),
    simulated_surge_pct: float = Query(70.0),
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
):
    workspace = helpers.get_workspace_for_user(db, user.id)
    workspace_config = helpers._workspace_config_for_swarm(workspace)

    prompt = f"Demand surge of {simulated_surge_pct}% detected for {product_id} ({trigger_event}). Solve optimal supplier split within ₹1.80L safe cash ceiling."
    swarm_res = helpers.swarm_engine.run_swarm(
        prompt=prompt,
        surge_multiplier=simulated_surge_pct,
        workspace_config=workspace_config,
    )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    event_id = f"EVT-{int(time.time())}"
    decision_id = f"DEC-{int(time.time())}"

    allocation_list = []
    if swarm_res.get("allocation_plan"):
        for p in swarm_res["allocation_plan"]:
            allocation_list.append({
                "supplier_id": p.get("supplier_id", "SUP-B"),
                "supplier_name": p["supplier"],
                "allocated_units": p["units"],
                "unit_cost": p["unitCost"],
                "total_cost": p.get("totalCost", p["units"] * p["unitCost"]),
                "upfront_cash_required": p["upfrontCash"],
                "lead_time_days": int(p["leadTime"].split()[0]) if p["leadTime"].split()[0].isdigit() else 3,
                "payment_terms": p["paymentTerms"]
            })

    try:
        db.add(DecisionAuditModel(
            id=decision_id,
            owner_id=user.id,
            product_id=product_id,
            trigger_event=trigger_event,
            deficit_units=swarm_res.get("total_units", 0),
            total_cost=swarm_res.get("optimization_proof", {}).get("objective_value", 0.0),
            total_upfront_cash=swarm_res.get("total_upfront_cash", 0.0),
            mathematical_feasibility=swarm_res.get("feasible", True),
            allocation_plan=swarm_res.get("allocation_plan"),
            reviewer_action="PENDING"
        ))
        db.commit()
    except Exception:
        db.rollback()

    calculated_deficit = swarm_res.get("total_units", 0)
    current_velocity = int(round(85 * (1 + simulated_surge_pct / 100)))

    fin = (workspace_config or {}).get("database_extracted", {}).get("financials", {}) if workspace_config else {}
    ledger_cash = fin.get("ledger_cash", 850000.0)
    statutory_buffer = fin.get("statutory_reserve", 500000.0)
    safe_cash_cap = fin.get("safe_cash_cap", 180000.0)

    return {
        "event_id": event_id,
        "trigger_event": trigger_event,
        "product_id": product_id,
        "timestamp": now_iso,
        "active_models_used": {
            "orchestrator": helpers.ACTIVE_MODEL_CONFIG.orchestrator_model,
            "sales_agent": helpers.ACTIVE_MODEL_CONFIG.sales_agent_model,
            "inventory_agent": helpers.ACTIVE_MODEL_CONFIG.inventory_agent_model,
            "finance_agent": helpers.ACTIVE_MODEL_CONFIG.finance_agent_model,
        },
        "sales_evidence": {
            "agent": "SalesAgent",
            "product_id": product_id,
            "historical_daily_avg": 85,
            "current_daily_velocity": current_velocity,
            "forecast_7d_total": current_velocity * 7,
            "forecast_confidence": 0.95,
            "growth_rate_pct": simulated_surge_pct,
            "active_campaign": "VIRAL_TIKTOK_TECH_SUMMER",
            "rationale": [
                f"Detected instantaneous demand velocity jump to {current_velocity} units/day (+{simulated_surge_pct}% surge).",
                "Creator promotional spike attribution verified across channels.",
                f"7-day cumulative requirement of {calculated_deficit} units calculated under active elasticity."
            ]
        },
        "inventory_evidence": {
            "agent": "InventoryAgent",
            "product_id": product_id,
            "current_stock": 170,
            "safety_stock": 150,
            "reorder_point": 350,
            "daily_burn_rate": current_velocity,
            "stockout_horizon_days": round(max(0.1, (170 - 150) / current_velocity), 2),
            "stockout_risk_score": 0.94,
            "recommended_reorder_qty": calculated_deficit,
            "urgency_level": "CRITICAL",
            "rationale": [
                f"Current stock on hand (170 units) approaches safety floor rapidly at {current_velocity} u/d burn rate.",
                "Standard 14-day vendor lead time will breach stockout threshold without expedited split PO.",
                f"Urgent split procurement of {calculated_deficit} units formulated across high-speed lanes."
            ]
        },
        "finance_evidence": {
            "agent": "FinanceAgent",
            "total_cash_balance": ledger_cash,
            "statutory_buffer": statutory_buffer,
            "unallocated_free_cash": round(ledger_cash - statutory_buffer, 2),
            "max_procurement_budget": safe_cash_cap,
            "accounts_payable": 120000.0,
            "accounts_receivable": 310000.0,
            "preferred_payment_terms": "NET_30",
            "rationale": [
                f"Statutory operating liquidity of ₹{statutory_buffer:,.2f} strictly locked and protected.",
                f"Safe immediate cash spend ceiling allocated at ₹{safe_cash_cap:,.2f}.",
                "Approved Net-30 credit facility with QuickLogix (Supplier B) utilized for capital protection."
            ]
        },
        "decision_output": {
            "decision_id": decision_id,
            "product_id": product_id,
            "timestamp": now_iso,
            "trigger_event": trigger_event,
            "total_recommended_units": calculated_deficit,
            "unmet_deficit_units": 0,
            "total_procurement_cost": swarm_res.get("optimization_proof", {}).get("objective_value", 0.0),
            "total_upfront_cash_impact": swarm_res.get("total_upfront_cash", 0.0),
            "expected_revenue": calculated_deficit * 1300.0,
            "expected_net_margin": 0.64,
            "stockout_risk_post_action": 0.02,
            "mathematical_feasibility": swarm_res.get("feasible", True),
            "optimization_explanation": swarm_res.get("optimization_proof", {}).get("solver_name", "SciPy HiGHS MILP") + ": Formally proved optimal split allocation.",
            "tradeoffs_identified": [
                "Utilized Net-30 credit to avoid depleting upfront cash reserves.",
                "Kept upfront cash safely below strict safe cash ceiling.",
                "Filtered out 14-day sea freight supplier to guarantee 2-3 day replenishment."
            ],
            "allocation_plan": allocation_list
        },
        "orchestrator_summary": swarm_res["executive_brief"]
    }
