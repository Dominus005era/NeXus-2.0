from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class POSplitItem(BaseModel):
    supplier: str
    units: int
    unitCost: float
    upfrontCash: float
    leadTime: str
    paymentTerms: str

class SwarmRunRequest(BaseModel):
    prompt: str
    model_id: Optional[str] = "gemini-3.6-flash"
    surge_multiplier: Optional[float] = 70.0
    workspace_config: Optional[Dict[str, Any]] = None

class SwarmRunResponse(BaseModel):
    success: bool
    status: str
    prompt: str
    executive_brief: str
    thinking_process: str
    thinking_time_sec: float
    total_upfront_cash: float
    total_units: int
    feasible: bool
    allocation_plan: List[POSplitItem]
    agent_telemetry: List[Dict[str, Any]]

class ChatMessageSchema(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    prompt: str
    history: Optional[List[ChatMessageSchema]] = []
    model_id: Optional[str] = "gemini-3.6-flash"
    api_key: Optional[str] = None

class OnboardRequest(BaseModel):
    user_name: str
    user_role: str
    company_name: str
    company_structure: str
    cloud_docs_link: str
    orchestrator_api_key: Optional[str] = None