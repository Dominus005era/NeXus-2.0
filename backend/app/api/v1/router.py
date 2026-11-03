from fastapi import APIRouter

from app.api.v1.endpoints.system import router as system_router
from app.api.v1.endpoints.workspace import router as workspace_router
from app.api.v1.endpoints.swarm import router as swarm_router
from app.api.v1.endpoints.chat import router as chat_router
from app.api.v1.endpoints.decisions import router as decisions_router
from app.api.v1.endpoints.helpers import ACTIVE_MODEL_CONFIG, AVAILABLE_MODELS

# Primary API v1 Router assembling domain-specific sub-routers
api_router = APIRouter()

# Mount sub-routers with clean domain separation
api_router.include_router(system_router)
api_router.include_router(workspace_router)
api_router.include_router(swarm_router)
api_router.include_router(chat_router)
api_router.include_router(decisions_router)

__all__ = ["api_router", "ACTIVE_MODEL_CONFIG", "AVAILABLE_MODELS"]
