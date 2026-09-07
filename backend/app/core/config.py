import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS 2.0"
    API_V1_STR: str = "/api/v1"

    # Dedicated Developer API Keys Per Agent Node (Loaded from Backend Secrets / Env)
    SWARM_ORCHESTRATOR_API_KEY: str = os.getenv("SWARM_ORCHESTRATOR_API_KEY", "AQ.Ab8RN6Iwn8dy5gj95VOKNleCbeExj6tIQ9CJW9zp8J2ZAssXqQ")
    SALES_INTELLIGENCE_API_KEY: str = os.getenv("SALES_INTELLIGENCE_API_KEY", "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")
    INVENTORY_SUPPLY_API_KEY: str = os.getenv("INVENTORY_SUPPLY_API_KEY", "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")
    TREASURY_FINANCE_API_KEY: str = os.getenv("TREASURY_FINANCE_API_KEY", "AQ.Ab8RN6IIIAjIQLL1B8J2M5ORfQiPlL4IjqsZEmrsf7Dhw16MNg")

    class Config:
        case_sensitive = True

settings = Settings()