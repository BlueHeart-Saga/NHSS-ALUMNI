# NHSS Alumni Platform FastAPI Backend Main Module
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, get_db
from app.core.logging import setup_logging

# Routers
from app.api import auth, school, batches, alumni, events, attendance, checkins, announcements, memories, reports, developer, public

setup_logging()
logger = logging.getLogger("app.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Production-Ready B2B SaaS Architected School Alumni Platform",
    lifespan=lifespan
)

# CORS Middleware (Restricted origins in production)
allowed_origins = settings.CORS_ORIGINS if not settings.is_production else [o for o in settings.CORS_ORIGINS if o != "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["https://alumni.abcschool.edu"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Sanitized Exception Handler for Production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.method} {request.url}: {exc}", exc_info=True)
    if settings.is_production:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred. Please contact the administrator."}
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)}
    )

# Static media fallback directory
MEDIA_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(MEDIA_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=MEDIA_DIR), name="uploads")

# API v1 Routers
api_v1 = FastAPI(title="School Alumni API v1")
api_v1.include_router(public.router)
api_v1.include_router(auth.router)
api_v1.include_router(school.router)
api_v1.include_router(batches.router)
api_v1.include_router(alumni.router)
api_v1.include_router(events.router)
api_v1.include_router(attendance.router)
api_v1.include_router(checkins.router)
api_v1.include_router(announcements.router)
api_v1.include_router(memories.router)
api_v1.include_router(reports.router)
api_v1.include_router(developer.router)

app.mount("/api/v1", api_v1)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "school": settings.INITIAL_SCHOOL_NAME,
        "environment": settings.APP_ENV,
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.APP_ENV}

@app.get("/ready")
async def readiness_probe():
    """Readiness probe endpoint checking database and storage connectivity."""
    db = get_db()
    if db is None:
        return JSONResponse(status_code=503, content={"ready": False, "reason": "Database uninitialized"})

    try:
        # Check DB ping if client supports it
        if hasattr(db, "command"):
            await db.command("ping")
        return {"ready": True, "database": "connected", "environment": settings.APP_ENV}
    except Exception as e:
        logger.error(f"Readiness probe failed: {e}")
        return JSONResponse(status_code=503, content={"ready": False, "reason": str(e)})
