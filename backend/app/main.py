import sys
import os
from contextlib import asynccontextmanager

# Ensure backend root directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize relational database schemas on startup
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description="NEXUS 2.0: Autonomous AI Operating System for Enterprise Operations",
    lifespan=lifespan,
)

# Proper CORS Configuration
origins = settings.cors_origins_list
allow_all = "*" in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=False if allow_all else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "api_v1": "/api/v1",
    }