import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Ensure storage directory exists
storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "storage")
os.makedirs(storage_dir, exist_ok=True)

db_url = settings.DATABASE_URL
# Handle SQLite connect args
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import text
from app.models import db_models  # noqa: F401

def init_db():
    Base.metadata.create_all(bind=engine)
    # Auto-migrate columns if local SQLite table was created in an earlier build
    try:
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(workspaces)"))
            cols = [row[1] for row in result.fetchall()]
            if cols:
                if "primary_product" not in cols:
                    conn.execute(text("ALTER TABLE workspaces ADD COLUMN primary_product VARCHAR(255) DEFAULT 'P100 UltraGlide Headphones'"))
                if "industry" not in cols:
                    conn.execute(text("ALTER TABLE workspaces ADD COLUMN industry VARCHAR(100) DEFAULT 'Consumer Technology & Electronics'"))
                if "database_extracted" not in cols:
                    conn.execute(text("ALTER TABLE workspaces ADD COLUMN database_extracted TEXT"))
                if "client_token" not in cols:
                    conn.execute(text("ALTER TABLE workspaces ADD COLUMN client_token VARCHAR(64)"))
                if "last_synced_at" not in cols:
                    conn.execute(text("ALTER TABLE workspaces ADD COLUMN last_synced_at DATETIME"))
                conn.commit()
    except Exception:
        pass

# Automatically run initialization and column migrations on import
init_db()
