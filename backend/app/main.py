# NHSS Alumni Platform FastAPI Backend Main Module
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, get_db
from app.core.logging import setup_logging

# Routers
from app.api import auth, school, batches, alumni, events, attendance, checkins, announcements, memories, reports, developer, public, association, rank_holders, school_events, files, documents, community, mentorship, feedback

setup_logging()
logger = logging.getLogger("app.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    try:
        from app.seed_developer import seed_developer_account
        await seed_developer_account(settings.INITIAL_ADMIN_MOBILE, "developer@justgathernow.com")
    except Exception as e:
        logger.warning(f"Developer auto-seed check skipped: {e}")
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME if (settings.APP_NAME and settings.APP_NAME.strip()) else "School Alumni & Batch Get-Together Platform",
    version="1.0.0",
    description="Production-Ready B2B SaaS Architected School Alumni Platform",
    lifespan=lifespan
)

# GZip Compression Middleware (Minimum response size 500 bytes)
app.add_middleware(GZipMiddleware, minimum_size=500)

# CORS Middleware Configuration (Supporting Production & Local Origins)
# CORS Middleware Configuration
cors_origins_set = list(set([
    o.rstrip("/")
    for o in settings.CORS_ORIGINS
    if o and o != "*"
]))

cors_origin_regex = (
    r"^https://nhssalumni\.com$"
    r"|^https://www\.nhssalumni\.com$"
    r"|^https://.*\.azurewebsites\.net$"
    r"|^http://localhost(:\d+)?$"
    r"|^http://127\.0\.0\.1(:\d+)?$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_set,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


import time
from starlette.exceptions import HTTPException as StarletteHTTPException

# Terminal Request/Response Logger & Error Reporter Middleware
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    method = request.method

    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        status_code = response.status_code

        if status_code >= 400:
            logger.warning(f"⚠️ [{status_code}] {method} {path} ({process_time:.2f}ms)")
        else:
            logger.info(f"✅ [{status_code}] {method} {path} ({process_time:.2f}ms)")

        return response
    except Exception as exc:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"❌ [500 EXCEPTION] {method} {path} ({process_time:.2f}ms) - {exc}", exc_info=True)
        raise exc

# HTTPException Handler for formatted terminal error logging
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"⚠️ [HTTP {exc.status_code}] {request.method} {request.url.path} -> Detail: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers
    )

# Global Sanitized Exception Handler for Production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"❌ Unhandled Exception on {request.method} {request.url}: {exc}", exc_info=True)
    if settings.is_production:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred. Please contact the administrator."}
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)}
    )

PROFILES_DIR = r"C:\Users\mani\Downloads\profile"
if os.path.exists(PROFILES_DIR):
    app.mount("/local-profiles", StaticFiles(directory=PROFILES_DIR), name="local-profiles")

# API v1 Routers Sub-Application
api_v1 = FastAPI(title="School Alumni API v1")
api_v1.add_middleware(GZipMiddleware, minimum_size=500)

# Attach CORSMiddleware & Exception Handlers directly to api_v1 sub-application
api_v1.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_set,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api_v1.exception_handler(StarletteHTTPException)(http_exception_handler)
api_v1.exception_handler(Exception)(global_exception_handler)


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
api_v1.include_router(association.router)
api_v1.include_router(rank_holders.router)
api_v1.include_router(school_events.router)
api_v1.include_router(files.router)
api_v1.include_router(documents.router)
api_v1.include_router(community.router)
api_v1.include_router(mentorship.router)
api_v1.include_router(feedback.router)

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
    db = get_db()
    db_status = "connected" if db is not None else "connecting"
    return {"status": "healthy", "database": db_status, "environment": settings.APP_ENV}

@app.get("/ready")
async def readiness_probe():
    """Readiness probe endpoint for Azure Health Check load balancer."""
    db = get_db()
    if db is None:
        return {"ready": True, "database": "connecting", "environment": settings.APP_ENV}

    try:
        if hasattr(db, "command"):
            await db.command("ping")
        return {"ready": True, "database": "connected", "environment": settings.APP_ENV}
    except Exception as e:
        logger.warning(f"Readiness probe db ping warning: {e}")
        return {"ready": True, "database": "degraded", "reason": str(e), "environment": settings.APP_ENV}
