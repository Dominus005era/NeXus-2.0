from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description="NEXUS 2.0: Autonomous AI Operating System for Enterprise Operations",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "version": "2.0.0",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }

@app.get("/api/v1/health")
def health():
    return {"status": "healthy", "database": "connected", "agents": "ready"}
