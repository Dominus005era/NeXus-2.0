import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS 2.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # Database Configuration (Defaults to local SQLite, compatible with PostgreSQL / Neon)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./storage/nexus_enterprise.db")

    # Supabase Auth / Database
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    SUPABASE_DB_URL: str = os.getenv("SUPABASE_DB_URL", "")
    NEXUS_AUTH_DISABLED: bool = os.getenv("NEXUS_AUTH_DISABLED", "false").lower() in ("1", "true", "yes")

    # Google Drive API key for reading public/shared company folders
    GOOGLE_DRIVE_API_KEY: str = os.getenv("GOOGLE_DRIVE_API_KEY", "")

    # LLM API Keys - Loaded securely from environment variables (No hardcoded fallback secrets)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Optional dedicated agent keys (if multi-key rotation is configured)
    SWARM_ORCHESTRATOR_API_KEY: str = os.getenv("SWARM_ORCHESTRATOR_API_KEY", "")
    SALES_INTELLIGENCE_API_KEY: str = os.getenv("SALES_INTELLIGENCE_API_KEY", "")
    INVENTORY_SUPPLY_API_KEY: str = os.getenv("INVENTORY_SUPPLY_API_KEY", "")
    TREASURY_FINANCE_API_KEY: str = os.getenv("TREASURY_FINANCE_API_KEY", "")

    # Drive ingestion safety limits
    DRIVE_MAX_FILE_SIZE_BYTES: int = int(os.getenv("DRIVE_MAX_FILE_SIZE_BYTES", "20_971_520"))  # 20 MB
    DRIVE_MAX_TOTAL_SIZE_BYTES: int = int(os.getenv("DRIVE_MAX_TOTAL_SIZE_BYTES", "104_857_600"))  # 100 MB
    DRIVE_MAX_FILES: int = int(os.getenv("DRIVE_MAX_FILES", "200"))
    DRIVE_REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("DRIVE_REQUEST_TIMEOUT_SECONDS", "30"))
    DRIVE_CACHE_TTL_SECONDS: int = int(os.getenv("DRIVE_CACHE_TTL_SECONDS", "0"))  # 0 = no server cache

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

    @property
    def supabase_configured(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_ANON_KEY)

    @property
    def supabase_base_url(self) -> str:
        return self.SUPABASE_URL.rstrip("/")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()