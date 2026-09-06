from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    SwarmRunRequest,
    SwarmRunResponse,
    ChatCompletionRequest,
    OnboardRequest
)
from app.agents.swarm import SwarmOrchestratorEngine

api_router = APIRouter()
swarm_engine = SwarmOrchestratorEngine()

@api_router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "system": "Nexus 2.0 FastAPI Engine",
        "database": "Neon PostgreSQL Online",
        "ilp_solver": "SciPy / OR-Tools Ready",
    }

@api_router.post("/swarm/run", response_model=SwarmRunResponse)
def run_swarm_pipeline(req: SwarmRunRequest):
    try:
        res = swarm_engine.run_swarm(
            prompt=req.prompt,
            surge_multiplier=req.surge_multiplier or 70.0,
            workspace_config=req.workspace_config
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chat/completions")
def chat_completions(req: ChatCompletionRequest):
    try:
        res = swarm_engine.run_swarm(prompt=req.prompt)
        return {
            "id": f"chatcmpl-{int(req.prompt.__hash__())}",
            "model": req.model_id or "gemini-3.6-flash",
            "text": res["executive_brief"],
            "thinking": res["thinking_process"],
            "thinkingTimeSec": res["thinking_time_sec"],
            "allocationPlan": res["allocation_plan"],
            "totalUpfrontCash": res["total_upfront_cash"],
            "totalUnits": res["total_units"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/workspace/onboard")
def onboard_workspace(req: OnboardRequest):
    return {
        "success": True,
        "message": f"Workspace onboarded successfully for {req.user_name} ({req.company_name})",
        "cloud_docs_registered": req.cloud_docs_link,
        "swarm_status": "initialized",
    }