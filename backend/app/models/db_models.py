import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class WorkspaceModel(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String(36), unique=True, index=True, nullable=True)
    company_name = Column(String(255), nullable=False, default="Enterprise Workspace")
    primary_product = Column(String(255), nullable=True, default="P100 UltraGlide Headphones")
    industry = Column(String(100), nullable=True, default="Consumer Technology & Electronics")
    user_name = Column(String(255), nullable=False, default="Executive User")
    user_role = Column(String(255), nullable=False, default="CEO & Founder")
    authority_level = Column(String(50), nullable=False, default="LEVEL_4_EXECUTIVE")
    cloud_docs_link = Column(String(500), nullable=True)
    company_structure = Column(Text, nullable=True)
    database_extracted = Column(JSON, nullable=True)
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    departments = relationship("DepartmentModel", back_populates="workspace", cascade="all, delete-orphan")

class DepartmentModel(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    description = Column(String(500), nullable=True)
    agent_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    workspace = relationship("WorkspaceModel", back_populates="departments")

class DecisionAuditModel(Base):
    __tablename__ = "decision_audits"

    id = Column(String(100), primary_key=True, index=True)
    owner_id = Column(String(36), index=True, nullable=True)
    product_id = Column(String(50), nullable=False, default="P100")
    trigger_event = Column(String(255), nullable=False)
    deficit_units = Column(Integer, nullable=False)
    total_cost = Column(Float, nullable=False)
    total_upfront_cash = Column(Float, nullable=False)
    mathematical_feasibility = Column(Boolean, nullable=False, default=True)
    optimization_proof = Column(Text, nullable=True)
    allocation_plan = Column(JSON, nullable=True)
    reviewer_action = Column(String(50), nullable=False, default="PENDING")  # PENDING, APPROVED, REJECTED
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

class ChatMessageRecordModel(Base):
    __tablename__ = "chat_messages"

    id = Column(String(100), primary_key=True, index=True)
    owner_id = Column(String(36), index=True, nullable=True)
    session_id = Column(String(100), index=True, nullable=False)
    role = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    thinking = Column(Text, nullable=True)
    model_used = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
