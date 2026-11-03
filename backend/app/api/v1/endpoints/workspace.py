import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.database import get_db
from app.models.db_models import WorkspaceModel
from app.models.schemas import (
    OnboardRequest,
    OnboardResponse,
    WorkspacePreviewRequest,
    DynamicAgentNode,
    DriveDatabaseSummary,
)
from app.agents.swarm import RoleBasedAccessController
from app.services.drive_reader import GoogleDriveDatabaseReader
from app.api.v1.endpoints import helpers

router = APIRouter(prefix="/workspace", tags=["Workspace"])

@router.post("/onboard", response_model=OnboardResponse)
def onboard_workspace(
    req: OnboardRequest,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
):
    authority = req.authority_level or RoleBasedAccessController.get_authority_level(req.user_role)

    # Ingest Google Drive database
    drive_data = GoogleDriveDatabaseReader.ingest_drive_database(
        cloud_docs_link=req.cloud_docs_link or "",
        company_name=req.company_name,
        industry=req.industry or "Enterprise Operations",
        primary_product_hint=req.primary_product
    )

    resolved_product = req.primary_product
    if (not resolved_product or resolved_product == "P100 UltraGlide Headphones") and drive_data.get("products"):
        resolved_product = drive_data["products"][0]["name"]
    if not resolved_product:
        resolved_product = "P100 UltraGlide Headphones"

    # Each authenticated Supabase user owns exactly one workspace
    workspace = helpers.get_workspace_for_user(db, user.id)
    if workspace:
        workspace.company_name = req.company_name
        workspace.primary_product = resolved_product
        workspace.industry = req.industry or workspace.industry
        workspace.user_name = req.user_name
        workspace.user_role = req.user_role
        workspace.authority_level = authority
        workspace.cloud_docs_link = req.cloud_docs_link
        workspace.company_structure = req.company_structure
        workspace.database_extracted = drive_data
        workspace.last_synced_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
    else:
        workspace = WorkspaceModel(
            owner_id=user.id,
            company_name=req.company_name,
            primary_product=resolved_product,
            industry=req.industry or "Consumer Technology & Electronics",
            user_name=req.user_name,
            user_role=req.user_role,
            authority_level=authority,
            cloud_docs_link=req.cloud_docs_link,
            company_structure=req.company_structure,
            database_extracted=drive_data,
            last_synced_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)

    drive_summary = helpers._drive_summary_from_data(drive_data)

    folder_tag = f"Drive: {drive_summary.folder_id}" if drive_summary.folder_id else "Cloud Ingested"
    dynamic_agents = [
        DynamicAgentNode(
            id="node-orchestrator",
            name="Nexus Swarm Orchestrator",
            department="Executive Office",
            model="Gemini 3.6 Flash (Default)",
            role_description=f"Hierarchical Task Planner & Constraint Router ({folder_tag})",
            authority_access=["READ_ALL", "DISPATCH_TASKS"]
        ),
        DynamicAgentNode(
            id="node-sales",
            name="Sales Intelligence Agent",
            department="Commercial & Growth",
            model="Gemini 3.6 Flash (High-Throughput)",
            role_description=f"Demand Analytics for {workspace.primary_product} ({len(drive_summary.products)} Catalog Items)",
            authority_access=["READ_SALES", "WRITE_FORECAST"]
        ),
        DynamicAgentNode(
            id="node-inventory",
            name="Supply Chain & Inventory Agent",
            department="Logistics & Warehousing",
            model="GPT-4o Mini (Tactical)",
            role_description=f"Telemetry & Deficit for {workspace.primary_product} (Source: safety_stock_guidelines.md)",
            authority_access=["READ_WAREHOUSE", "FORMULATE_REORDER"]
        ),
        DynamicAgentNode(
            id="node-finance",
            name="Treasury & Governance Agent",
            department="Finance & Compliance",
            model="Gemini 1.5 Pro (2M Context)",
            role_description="Statutory Liquidity Guard (Source: cash_reserve_governance.md)",
            authority_access=["READ_TREASURY", "ENFORCE_LOCK"]
        ),
        DynamicAgentNode(
            id="node-solver",
            name="SciPy HiGHS Decision Solver",
            department="Operations Optimization",
            model="SciPy HiGHS MILP Engine",
            role_description=f"Deterministic Matrix Split ({len(drive_summary.suppliers)} Drive Vendors)",
            authority_access=["SOLVE_OPTIMIZATION"]
        )
    ]

    rbac_permissions = [
        f"Role: {req.user_role} ({authority})",
        f"Google Drive Database: {drive_summary.status} ({drive_summary.files_indexed} files indexed)",
        "Executive Strategy: Authorized",
        "Cross-Department Consensus: Enabled",
        "Real-Time Telemetry: Active",
    ]
    if authority in ["LEVEL_4_EXECUTIVE", "LEVEL_3_FINANCE"]:
        rbac_permissions.append("Purchase Order Execution: Authorized")
        rbac_permissions.append("Treasury Governance Audit: Authorized")
    else:
        rbac_permissions.append("Purchase Order Execution: Requires Executive Cosign")
        rbac_permissions.append("Statutory Reserve Lock: Read-Only Protected")

    return OnboardResponse(
        success=True,
        message=f"Enterprise workspace initialized successfully for {req.company_name}. Extracted {len(drive_summary.products)} products and {len(drive_summary.suppliers)} suppliers from Google Drive database.",
        workspace_id=workspace.id,
        company_name=workspace.company_name,
        primary_product=workspace.primary_product,
        industry=workspace.industry,
        user_role=workspace.user_role,
        authority_level=authority,
        cloud_docs_registered=req.cloud_docs_link,
        drive_database=drive_summary,
        dynamic_agents=dynamic_agents,
        rbac_permissions=rbac_permissions
    )

@router.post("/preview", response_model=DriveDatabaseSummary)
def preview_workspace_drive(
    req: WorkspacePreviewRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    drive_data = GoogleDriveDatabaseReader.ingest_drive_database(
        cloud_docs_link=req.cloud_docs_link or "",
        company_name=req.company_name,
        industry=req.industry or "Enterprise Operations",
        primary_product_hint=req.primary_product
    )
    return helpers._drive_summary_from_data(drive_data)

@router.get("/current")
def get_current_workspace(
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
):
    workspace = helpers.get_workspace_for_user(db, user.id)
    if not workspace:
        return {
            "configured": False,
            "company_name": "TechMart Electronics",
            "primary_product": "P100 UltraGlide Headphones",
            "industry": "Consumer Technology & Electronics",
            "user_name": "Executive User",
            "user_role": "CEO & Founder",
            "authority_level": "LEVEL_4_EXECUTIVE",
            "cloud_docs_link": "",
            "database_extracted": None
        }
    return {
        "configured": True,
        "company_name": workspace.company_name,
        "primary_product": workspace.primary_product or "P100 UltraGlide Headphones",
        "industry": workspace.industry or "Consumer Technology & Electronics",
        "user_name": workspace.user_name,
        "user_role": workspace.user_role,
        "authority_level": workspace.authority_level,
        "cloud_docs_link": workspace.cloud_docs_link,
        "database_extracted": workspace.database_extracted,
        "created_at": workspace.created_at.isoformat() if workspace.created_at else None
    }

@router.post("/sync-drive", response_model=DriveDatabaseSummary)
def sync_drive_database(
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
):
    workspace = helpers.get_workspace_for_user(db, user.id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not onboarded yet.")

    if not helpers._is_cache_stale(workspace):
        cached = workspace.database_extracted
        if cached and isinstance(cached, dict):
            return helpers._drive_summary_from_data(cached)

    drive_data = GoogleDriveDatabaseReader.ingest_drive_database(
        cloud_docs_link=workspace.cloud_docs_link or "",
        company_name=workspace.company_name,
        industry=workspace.industry or "Enterprise Operations",
        primary_product_hint=workspace.primary_product
    )
    workspace.database_extracted = drive_data
    workspace.last_synced_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()

    return helpers._drive_summary_from_data(drive_data)
