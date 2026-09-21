import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, Query
from bson import ObjectId

from app.core.database import get_db, build_school_filter
from app.core.cache import ttl_cache
from app.middleware.auth import get_current_user, require_roles
from app.schemas.models import (
    AuditStatementCreateRequest,
    AuditStatementUpdateRequest,
)
from app.services.azure_blob import blob_service

logger = logging.getLogger("app.audit")
router = APIRouter(prefix="/audit", tags=["Audit & Financial Statements"])

ADMIN_ROLES = ["SCHOOL_ADMIN", "SUPER_ADMIN", "PRIMARY_DEVELOPER", "DEVELOPER"]


def _serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "school_id": str(doc["school_id"]) if doc.get("school_id") else None,
        "title": doc.get("title", ""),
        "title_ta": doc.get("title_ta"),
        "description": doc.get("description"),
        "description_ta": doc.get("description_ta"),
        "financial_year": doc.get("financial_year", ""),
        "period_start": doc.get("period_start", ""),
        "period_end": doc.get("period_end", ""),
        "posted_date": doc.get("posted_date"),
        "pdf_url": doc.get("pdf_url"),
        "pdf_file_name": doc.get("pdf_file_name"),
        "pdf_file_size": doc.get("pdf_file_size"),
        "is_published": doc.get("is_published", False),
        "display_order": doc.get("display_order", 1),
        "status": doc.get("status", "ACTIVE"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def _derive_financial_year(iso_date: str) -> str:
    """Given 'YYYY-MM-DD', return fiscal year like '2025 - 2026' (Indian FY starts Apr 1)."""
    try:
        dt = datetime.strptime(iso_date[:10], "%Y-%m-%d")
    except Exception:
        dt = datetime.now(timezone.utc)
    if dt.month >= 4:
        return f"{dt.year} - {dt.year + 1}"
    return f"{dt.year - 1} - {dt.year}"


# ---------------------------------------------------------------------------
# PUBLIC ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/public/statements")
async def get_public_audit_statements(response: Response):
    """Public list of published audit statements — summary only (no PDF metadata)."""
    response.headers["Cache-Control"] = "no-store"

    cached = ttl_cache.get("public:audit:list")
    if cached is not None:
        return cached

    db = get_db()
    cursor = db.audit_statements.find(
        {"is_published": True, "status": "ACTIVE"}
    ).sort([("display_order", 1), ("posted_date", -1), ("created_at", -1)])
    docs = await cursor.to_list(length=100)

    res = [
        {
            "id": str(d["_id"]),
            "title": d.get("title", ""),
            "title_ta": d.get("title_ta"),
            "description": d.get("description"),
            "description_ta": d.get("description_ta"),
            "financial_year": d.get("financial_year", ""),
            "period_start": d.get("period_start", ""),
            "period_end": d.get("period_end", ""),
            "posted_date": d.get("posted_date"),
        }
        for d in docs
    ]
    ttl_cache.set("public:audit:list", res, ttl=30)
    return res


@router.get("/public/statements/{statement_id}")
async def get_public_audit_statement_detail(
    statement_id: str,
    response: Response,
):
    """Public detail of one published audit statement."""
    response.headers["Cache-Control"] = "no-store"

    db = get_db()
    oid = ObjectId(statement_id) if ObjectId.is_valid(statement_id) else statement_id

    doc = await db.audit_statements.find_one({"_id": oid, "is_published": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Audit statement not found")

    return _serialize(doc)


# ---------------------------------------------------------------------------
# ADMIN ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/admin/statements")
async def admin_list_audit_statements(
    current_user: dict = Depends(require_roles(ADMIN_ROLES))
):
    db = get_db()
    school_id = current_user.get("school_id")

    query = {}
    if school_id:
        school_filter = await build_school_filter(school_id)
        if school_filter:
            query.update(school_filter)

    cursor = db.audit_statements.find(query).sort([("display_order", 1), ("created_at", -1)])
    docs = await cursor.to_list(length=200)
    return [_serialize(d) for d in docs]


@router.get("/admin/statements/{statement_id}")
async def admin_get_audit_statement(
    statement_id: str,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    oid = ObjectId(statement_id) if ObjectId.is_valid(statement_id) else statement_id
    doc = await db.audit_statements.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Audit statement not found")
    return _serialize(doc)


@router.post("/admin/statements")
async def admin_create_audit_statement(
    payload: AuditStatementCreateRequest,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    school_id = current_user.get("school_id") or "PLATFORM"
    now = datetime.now(timezone.utc)

    # Auto-derive FY if missing/blank
    fy = payload.financial_year or _derive_financial_year(
        datetime.now(timezone.utc).strftime("%Y-%m-%d")
    )

    doc = {
        "school_id": school_id,
        "title": payload.title,
        "title_ta": payload.title_ta,
        "description": payload.description,
        "description_ta": payload.description_ta,
        "financial_year": fy,
        "period_start": payload.period_start,
        "period_end": payload.period_end,
        "posted_date": payload.posted_date,
        "pdf_url": payload.pdf_url,
        "pdf_file_name": payload.pdf_file_name,
        "pdf_file_size": payload.pdf_file_size,
        "pdf_blob_path": payload.pdf_blob_path,
        "is_published": payload.is_published,
        "display_order": payload.display_order,
        "status": payload.status,
        "created_at": now,
        "updated_at": now,
    }
    res = await db.audit_statements.insert_one(doc)

    await db.audit_logs.insert_one({
        "school_id": school_id,
        "user_id": current_user["user_id"],
        "action": "AUDIT_STATEMENT_CREATED",
        "resource_type": "audit_statement",
        "resource_id": str(res.inserted_id),
        "timestamp": now,
    })

    # Invalidate only audit list data; contributors and sponsors are separate modules.
    ttl_cache.invalidate("public:audit:list")

    return {"success": True, "id": str(res.inserted_id), "message": "Audit statement created"}


@router.put("/admin/statements/{statement_id}")
async def admin_update_audit_statement(
    statement_id: str,
    payload: AuditStatementUpdateRequest,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    oid = ObjectId(statement_id) if ObjectId.is_valid(statement_id) else statement_id

    update_fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_fields:
        return {"success": True, "message": "Nothing to update"}

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = await db.audit_statements.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Audit statement not found")

    await db.audit_logs.insert_one({
        "school_id": current_user.get("school_id"),
        "user_id": current_user["user_id"],
        "action": "AUDIT_STATEMENT_UPDATED",
        "resource_type": "audit_statement",
        "resource_id": statement_id,
        "metadata": {"fields": list(update_fields.keys())},
        "timestamp": datetime.now(timezone.utc),
    })

    # Invalidate only audit list data; contributors and sponsors are separate modules.
    ttl_cache.invalidate("public:audit:list")

    return {"success": True, "message": "Audit statement updated"}


@router.delete("/admin/statements/{statement_id}")
async def admin_delete_audit_statement(
    statement_id: str,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    oid = ObjectId(statement_id) if ObjectId.is_valid(statement_id) else statement_id
    result = await db.audit_statements.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Audit statement not found")

    await db.audit_logs.insert_one({
        "school_id": current_user.get("school_id"),
        "user_id": current_user["user_id"],
        "action": "AUDIT_STATEMENT_DELETED",
        "resource_type": "audit_statement",
        "resource_id": statement_id,
        "timestamp": datetime.now(timezone.utc),
    })

    # Audit deletion must not affect independent contributor or sponsor data.
    ttl_cache.invalidate("public:audit:list")

    return {"success": True, "message": "Audit statement deleted"}


@router.post("/admin/upload-pdf")
async def admin_upload_audit_pdf(
    file: UploadFile = File(...),
    school_id: Optional[str] = Form(None),
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    """Upload an audit PDF. Reuses existing blob_service (Azure Blob / GridFS fallback)."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(content) > 30 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="PDF exceeds 30MB limit")

    effective_school_id = school_id or current_user.get("school_id") or "general"

    url = await blob_service.upload_raw_file(
        file_content=content,
        filename=file.filename,
        content_type="application/pdf",
        school_id=effective_school_id,
    )

    return {
        "success": True,
        "pdf_url": url,
        "file_name": file.filename,
        "file_size": len(content),
    }