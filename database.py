import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from logger import get_logger

logger = get_logger("Database")

# SQLite default database path with PostgreSQL env fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ticketiq.db")

# Fix Heroku/Railway postgres:// URL prefix if present
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    try:
        # Import models so Base.metadata contains all tables
        import models.db_models  # noqa: F401
        Base.metadata.create_all(bind=engine)
        logger.info(f"Database initialized successfully at {DATABASE_URL}")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise e

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
