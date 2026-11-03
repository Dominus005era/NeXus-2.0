import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
storage_dir = os.path.join(backend_root, "storage")
os.makedirs(storage_dir, exist_ok=True)

db_url = settings.SUPABASE_DB_URL or settings.DATABASE_URL
# Automatically resolve relative SQLite paths to backend_root/storage so working directory doesn't matter
if db_url.startswith("sqlite:///") and ":memory:" not in db_url:
    raw_path = db_url.replace("sqlite:///", "")
    if not os.path.isabs(raw_path):
        clean_rel = raw_path.lstrip("./").lstrip(".\\")
        if clean_rel.startswith("storage"):
            abs_db_path = os.path.join(backend_root, clean_rel)
        else:
            abs_db_path = os.path.join(backend_root, "storage", os.path.basename(clean_rel))
    else:
        abs_db_path = raw_path
    os.makedirs(os.path.dirname(abs_db_path), exist_ok=True)
    db_url = f"sqlite:///{abs_db_path.replace(chr(92), '/')}"

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
    if not db_url.startswith("sqlite"):
        # Supabase/Postgres schemas are managed by supabase/migrations.
        return
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
                if "last_synced_at" not in cols:
                    conn.execute(text("ALTER TABLE workspaces ADD COLUMN last_synced_at DATETIME"))
                if "owner_id" not in cols:
                    conn.execute(text("ALTER TABLE workspaces ADD COLUMN owner_id VARCHAR(36)"))
                conn.commit()

            for table in ("decision_audits", "chat_messages"):
                result = conn.execute(text(f"PRAGMA table_info({table})"))
                table_cols = [row[1] for row in result.fetchall()]
                if table_cols and "owner_id" not in table_cols:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN owner_id VARCHAR(36)"))
            conn.commit()
    except Exception:
        pass

# Automatically run initialization and column migrations on import
init_db()
