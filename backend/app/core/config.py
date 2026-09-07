import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS 2.0"
    API_V1_STR: str = "/api/v1"
    
    # Backend Developer API Keys (Configured strictly on backend server)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6Iwn8dy5gj95VOKNleCbeExj6tIQ9CJW9zp8J2ZAssXqQ")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GOOGLE_DRIVE_API_KEY: str = os.getenv("GOOGLE_DRIVE_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()