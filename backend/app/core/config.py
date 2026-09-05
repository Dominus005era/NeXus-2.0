import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = PROJECT_ROOT / "storage"
DB_DIR = STORAGE_DIR / "db"
DOCS_DIR = STORAGE_DIR / "docs"

DB_DIR.mkdir(parents=True, exist_ok=True)
DOCS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS 2.0 Autonomous AI Operating System"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DB_DIR / 'nexus.db'}")
    DOCS_PATH: Path = DOCS_DIR
    STATUTORY_CASH_BUFFER: float = 500000.0
    DEFAULT_PROCUREMENT_BUDGET_CAP: float = 180000.0

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
