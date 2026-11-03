import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.database import get_db
from app.models.db_models import DecisionAuditModel
from app.models.schemas import (
    DecisionActionRequest,
    DecisionActionResponse,
    KnowledgeQueryRequest,
    KnowledgeQueryResponse,
)

router = APIRouter(tags=["Decisions & Governance"])

@router.post("/decisions/action", response_model=DecisionActionResponse)
def review_decision(
    req: DecisionActionRequest,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
):
    decision = db.query(DecisionAuditModel).filter(DecisionAuditModel.id == req.decision_id).first()
    if decision:
        if decision.owner_id != user.id:
            raise HTTPException(status_code=404, detail="Decision not found.")
        decision.reviewer_action = req.action
        decision.reviewer_notes = req.reviewer_notes
        db.commit()
    else:
        decision = DecisionAuditModel(
            id=req.decision_id,
            owner_id=user.id,
            product_id="P100",
            trigger_event="Manual Review Trigger",
            deficit_units=845,
            total_cost=395150.0,
            total_upfront_cash=97100.0,
            reviewer_action=req.action,
            reviewer_notes=req.reviewer_notes
        )
        db.add(decision)
        db.commit()

    return DecisionActionResponse(
        success=True,
        decision_id=req.decision_id,
        action=req.action,
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        message=f"Purchase order decision {req.decision_id} successfully marked as {req.action}."
    )

@router.post("/knowledge/query", response_model=KnowledgeQueryResponse)
def query_knowledge(
    req: KnowledgeQueryRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    dept = req.department.lower()
    agent = req.requesting_agent.lower()

    if "finance" in dept and "sales" in agent:
        return KnowledgeQueryResponse(
            requesting_agent=req.requesting_agent,
            department=req.department,
            status="RESTRICTED",
            documents_matched=["cash_reserve_governance.md"],
            snippet="RBAC Access Restriction: Sales Agent is restricted from viewing confidential banking reserves. Permitted: Safe Procurement Budget."
        )

    matched_docs = {
        "sales": ["q3_promotional_calendar.md", "creator_surge_attribution.json"],
        "inventory": ["warehouse_operating_limits.md", "bin_4b_stock_ledger.csv"],
        "finance": ["cash_reserve_governance.md", "supplier_contracts_master.json"],
    }.get(dept, ["enterprise_operating_manual.md"])

    return KnowledgeQueryResponse(
        requesting_agent=req.requesting_agent,
        department=req.department,
        status="GRANTED",
        documents_matched=matched_docs,
        snippet=f"Policy records for department '{req.department}' retrieved successfully under active governance token."
    )
