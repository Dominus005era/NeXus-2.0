import datetime
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.db_models import WorkspaceModel
from app.models.schemas import (
    DriveDatabaseSummary,
    DriveProductItem,
    DriveSupplierItem,
    AgentModelConfig,
    AvailableModel,
)
from app.agents.swarm import SwarmOrchestratorEngine

swarm_engine = SwarmOrchestratorEngine()

# In-memory configuration cache with persistent default
ACTIVE_MODEL_CONFIG = AgentModelConfig()

AVAILABLE_MODELS = [
    AvailableModel(id="gemini-3.6-flash", provider="Google", description="Flagship operational reasoning & tool execution (Default)"),
    AvailableModel(id="gemini-3.8-flash", provider="Google", description="Turbo low-latency execution for high-frequency telemetry"),
    AvailableModel(id="gemini-2.5-pro", provider="Google", description="2M context window, deep balance sheet auditing"),
    AvailableModel(id="gpt-4o", provider="OpenAI", description="Multimodal reasoning and long-horizon executive strategy"),
    AvailableModel(id="gpt-4o-mini", provider="OpenAI", description="Fast, high-throughput tactical decision maker"),
    AvailableModel(id="claude-3-5-sonnet", provider="Anthropic", description="Complex policy & legal contract verification"),
    AvailableModel(id="nexus-3.1-deep-think", provider="Nexus Formal", description="Deterministic SciPy HiGHS Integer Linear Program solver"),
]

def get_workspace_for_user(db: Session, owner_id: Optional[str]) -> Optional[WorkspaceModel]:
    if not owner_id:
        return None
    return db.query(WorkspaceModel).filter(WorkspaceModel.owner_id == owner_id).first()

def _is_cache_stale(workspace: WorkspaceModel) -> bool:
    if settings.DRIVE_CACHE_TTL_SECONDS <= 0 or workspace.last_synced_at is None:
        return True
    age = (datetime.datetime.now(datetime.timezone.utc) - workspace.last_synced_at).total_seconds()
    return age > settings.DRIVE_CACHE_TTL_SECONDS

def _drive_summary_from_data(drive_data: Dict[str, Any]) -> DriveDatabaseSummary:
    return DriveDatabaseSummary(
        status=drive_data.get("status", "UNKNOWN"),
        folder_id=drive_data.get("folder_id", ""),
        cloud_docs_link=drive_data.get("cloud_docs_link", ""),
        crawled_at=drive_data.get("crawled_at", ""),
        files_indexed=drive_data.get("files_indexed", 0),
        products_count=len(drive_data.get("products", [])),
        suppliers_count=len(drive_data.get("suppliers", [])),
        products=[DriveProductItem(**p) for p in drive_data.get("products", [])],
        suppliers=[DriveSupplierItem(**s) for s in drive_data.get("suppliers", [])],
        files=drive_data.get("files", []),
        financials=drive_data.get("financials"),
        manifest_used=drive_data.get("manifest_used", False),
        extraction_confidence=drive_data.get("extraction_confidence"),
        errors=drive_data.get("errors", []),
    )

def _workspace_config_for_swarm(workspace: Optional[WorkspaceModel]) -> Optional[Dict[str, Any]]:
    if not workspace:
        return None
    return {
        "user_role": workspace.user_role,
        "company_name": workspace.company_name,
        "primary_product": workspace.primary_product,
        "cloud_docs_link": workspace.cloud_docs_link,
        "database_extracted": workspace.database_extracted,
    }
