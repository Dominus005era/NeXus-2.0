import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS 2.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # Database Configuration (Defaults to local SQLite, compatible with PostgreSQL / Neon)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./storage/nexus_enterprise.db")

    # LLM API Keys - Loaded securely from environment variables (No hardcoded fallback secrets)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Optional dedicated agent keys (if multi-key rotation is configured)
    SWARM_ORCHESTRATOR_API_KEY: str = os.getenv("SWARM_ORCHESTRATOR_API_KEY", "")
    SALES_INTELLIGENCE_API_KEY: str = os.getenv("SALES_INTELLIGENCE_API_KEY", "")
    INVENTORY_SUPPLY_API_KEY: str = os.getenv("INVENTORY_SUPPLY_API_KEY", "")
    TREASURY_FINANCE_API_KEY: str = os.getenv("TREASURY_FINANCE_API_KEY", "")

    # CORS Whitelist
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://nexus-frontend-v2.vercel.app"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()