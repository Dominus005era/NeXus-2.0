from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class POSplitItem(BaseModel):
    supplier: str
    units: int
    unitCost: float
    upfrontCash: float
    leadTime: str
    paymentTerms: str

class OptimizationProof(BaseModel):
    solver_name: str
    status: str
    objective_value: float
    total_upfront_cash: float
    feasible: bool
    iterations: int
    execution_time_ms: float
    constraints_evaluated: List[str]

class SwarmRunRequest(BaseModel):
    prompt: str
    model_id: Optional[str] = "gemini-3.6-flash"
    surge_multiplier: Optional[float] = 70.0
    user_role: Optional[str] = "CEO & Founder"
    authority_level: Optional[str] = "LEVEL_4_EXECUTIVE"
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
    allocation_plan: Optional[List[POSplitItem]] = None
    agent_telemetry: List[Dict[str, Any]]
    optimization_proof: Optional[OptimizationProof] = None
    rbac_status: Optional[str] = "AUTHORIZED"

class ChatMessageSchema(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    prompt: str
    history: Optional[List[ChatMessageSchema]] = []
    model_id: Optional[str] = "gemini-3.6-flash"
    user_role: Optional[str] = "CEO & Founder"
    authority_level: Optional[str] = "LEVEL_4_EXECUTIVE"
    workspace_config: Optional[Dict[str, Any]] = None

class OnboardRequest(BaseModel):
    user_name: str
    user_role: str
    authority_level: Optional[str] = "LEVEL_4_EXECUTIVE"
    company_name: str
    primary_product: Optional[str] = "P100 UltraGlide Headphones"
    industry: Optional[str] = "Consumer Technology & Electronics"
    company_structure: Optional[str] = None
    cloud_docs_link: Optional[str] = None

class DynamicAgentNode(BaseModel):
    id: str
    name: str
    department: str
    model: str
    role_description: str
    authority_access: List[str]

class DriveProductItem(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    current_stock: int
    min_safety_stock: int
    reorder_point: int
    unit_cost: float
    sales_velocity: int
    source_doc: Optional[str] = None

class DriveSupplierItem(BaseModel):
    id: str
    name: str
    unit_cost: float
    advance_pct: float
    lead_time_days: int
    capacity: int
    payment_terms: str
    sla: str
    source_doc: Optional[str] = None

class DriveDatabaseSummary(BaseModel):
    status: str
    folder_id: str
    cloud_docs_link: str
    crawled_at: str
    files_indexed: int
    products_count: int
    suppliers_count: int
    products: List[DriveProductItem] = []
    suppliers: List[DriveSupplierItem] = []

class OnboardResponse(BaseModel):
    success: bool
    message: str
    workspace_id: int
    company_name: str
    primary_product: Optional[str] = None
    industry: Optional[str] = None
    user_role: str
    authority_level: str
    cloud_docs_registered: Optional[str] = None
    drive_database: Optional[DriveDatabaseSummary] = None
    dynamic_agents: List[DynamicAgentNode]
    rbac_permissions: List[str]

class InventoryItemSchema(BaseModel):
    product_id: str
    product_name: str
    current_stock: int
    min_safety_stock: int
    reorder_point: int
    is_critical: bool

class OverviewMetricsResponse(BaseModel):
    cash_balance: float
    safe_procurement_budget: float
    revenue_7d: float
    critical_stock_risks: int
    active_campaigns_count: int
    inventory_summary: List[InventoryItemSchema]

class DecisionActionRequest(BaseModel):
    decision_id: str
    action: str  # APPROVED, REJECTED, MODIFIED
    reviewer_notes: Optional[str] = None

class DecisionActionResponse(BaseModel):
    success: bool
    decision_id: str
    action: str
    timestamp: str
    message: str

class KnowledgeQueryRequest(BaseModel):
    requesting_agent: str
    department: str
    query_text: str
    cross_domain_reason: Optional[str] = None

class KnowledgeQueryResponse(BaseModel):
    requesting_agent: str
    department: str
    status: str  # GRANTED, DENIED, RESTRICTED
    documents_matched: List[str]
    snippet: str

class AgentModelConfig(BaseModel):
    sales_agent_model: str = "gemini-3.6-flash"
    inventory_agent_model: str = "gpt-4o-mini"
    finance_agent_model: str = "gemini-1.5-pro"
    orchestrator_model: str = "gemini-3.6-flash"
    temperature: float = 0.2

class AvailableModel(BaseModel):
    id: str
    provider: str
    description: str

class AgentModelConfigResponse(BaseModel):
    active_config: AgentModelConfig
    available_models: List[AvailableModel]