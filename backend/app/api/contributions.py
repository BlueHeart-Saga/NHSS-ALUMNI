import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, Query
from bson import ObjectId

from app.core.database import get_db, build_school_filter
from app.core.cache import ttl_cache
from app.middleware.auth import get_current_user, require_roles, require_verified_alumni
from app.schemas.models import (
    ContributionCreateRequest,
    ContributionUpdateRequest,
    AdminContributionCreateRequest,
)
from app.services.azure_blob import blob_service

logger = logging.getLogger("app.contributions")
router = APIRouter(prefix="/contributions", tags=["Alumni Contributions"])

ADMIN_ROLES = ["SCHOOL_ADMIN", "SUPER_ADMIN", "PRIMARY_DEVELOPER", "DEVELOPER"]


def _derive_financial_year(iso_date: str) -> str:
    try:
        dt = datetime.strptime(iso_date[:10], "%Y-%m-%d")
    except Exception:
        dt = datetime.now(timezone.utc)
    if dt.month >= 4:
        return f"{dt.year} - {dt.year + 1}"
    return f"{dt.year - 1} - {dt.year}"


def _serialize(doc: dict) -> dict:
    """Serialize a contribution document. Includes ALL fields needed by the
    admin View Details modal, including the alumni-form structured fields:
    contact_number, address, specific_purpose, receipt_required, remarks."""
    return {
        "id": str(doc["_id"]),
        "school_id": str(doc["school_id"]) if doc.get("school_id") else None,
        "alumni_id": str(doc["alumni_id"]) if doc.get("alumni_id") else None,
        "user_id": doc.get("user_id"),
        "contributor_name": doc.get("contributor_name", "Alumnus"),
        "contributor_name_ta": doc.get("contributor_name_ta"),
        "batch_year": doc.get("batch_year"),
        "amount": doc.get("amount", 0),
        "currency": doc.get("currency", "INR"),
        "purpose": doc.get("purpose", "GENERAL"),
        "purpose_note": doc.get("purpose_note"),
        "contribution_date": doc.get("contribution_date"),
        "financial_year": doc.get("financial_year"),
        "payment_method": doc.get("payment_method"),
        "payment_reference": doc.get("payment_reference"),
        "proof_url": doc.get("proof_url"),
        "status": doc.get("status", "PENDING"),
        "public_visibility": doc.get("public_visibility", False),
        "admin_remarks": doc.get("admin_remarks"),
        # NEW — alumni form structured fields
        "contact_number": doc.get("contact_number"),
        "address": doc.get("address"),
        "specific_purpose": doc.get("specific_purpose"),
        "receipt_required": doc.get("receipt_required"),
        "remarks": doc.get("remarks"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


# ---------------------------------------------------------------------------
# ALUMNI ENDPOINTS
# ---------------------------------------------------------------------------
@router.post("")
async def alumni_create_contribution(
    payload: ContributionCreateRequest,
    current_user: dict = Depends(require_verified_alumni),
):
    """Verified alumni submit a contribution. Defaults to PENDING for admin review."""
    db = get_db()
    now = datetime.now(timezone.utc)

    alumni = current_user.get("alumni") or {}
    alumni_id = str(alumni.get("_id")) if alumni.get("_id") else None
    school_id = current_user.get("school_id") or alumni.get("school_id") or "PLATFORM"

    contribution_date = (payload.contribution_date or now.strftime("%Y-%m-%d"))[:10]
    fy = payload.financial_year or _derive_financial_year(contribution_date)

    # Only persist `specific_purpose` when the user actually chose "OTHER".
    # This enforces the business rule at the storage layer regardless of what
    # the client sends.
    purpose_upper = (payload.purpose or "GENERAL").upper()
    specific_purpose = (
        payload.specific_purpose.strip()
        if (purpose_upper == "OTHER" and payload.specific_purpose)
        else None
    )

    doc = {
        "school_id": school_id,
        "alumni_id": alumni_id,
        "user_id": current_user.get("user_id"),
        "contributor_name": alumni.get("full_name") or current_user.get("full_name") or "Alumnus",
        "contributor_name_ta": alumni.get("full_name_ta") or alumni.get("name_ta"),
        "batch_year": alumni.get("passing_year"),
        "amount": float(payload.amount),
        "currency": payload.currency or "INR",
        "purpose": payload.purpose or "GENERAL",
        "purpose_note": payload.purpose_note,
        "contribution_date": contribution_date,
        "financial_year": fy,
        "payment_method": payload.payment_method,
        "payment_reference": payload.payment_reference,
        "proof_url": payload.proof_url,
        "status": "PENDING",
        "public_visibility": bool(payload.public_visibility),
        "remarks": payload.remarks,
        # NEW — alumni form structured fields
        "contact_number": payload.contact_number,
        "address": payload.address,
        "specific_purpose": specific_purpose,
        "receipt_required": payload.receipt_required,
        "admin_remarks": None,
        "created_at": now,
        "updated_at": now,
    }
    res = await db.contributions.insert_one(doc)

    return {
        "success": True,
        "id": str(res.inserted_id),
        "message": "Contribution submitted. Awaiting admin verification.",
        "financial_year": fy,
    }

@router.post("/admin")
async def admin_create_contribution(
    payload: AdminContributionCreateRequest,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    """
    Admin records a contribution on behalf of an alumni.

    Writes to the SAME `db.contributions` collection as the alumni flow so the
    record appears everywhere (Admin Contributions, My Contributions, Top
    Contributors, Audit, financial reports). Adds `created_by_admin` to
    distinguish the source. No separate table.
    """
    db = get_db()
    now = datetime.now(timezone.utc)

    # Resolve the alumni document server-side — the client only sends alumni_id.
    alumni_oid = (
        ObjectId(payload.alumni_id)
        if ObjectId.is_valid(payload.alumni_id)
        else payload.alumni_id
    )
    alumni = await db.alumni.find_one({"_id": alumni_oid})
    if not alumni:
        raise HTTPException(status_code=404, detail="Selected contributor not found")

    contribution_date = (payload.contribution_date or now.strftime("%Y-%m-%d"))[:10]
    fy = payload.financial_year or _derive_financial_year(contribution_date)

    purpose_upper = (payload.purpose or "GENERAL").upper()
    specific_purpose = (
        payload.specific_purpose.strip()
        if (purpose_upper == "OTHER" and payload.specific_purpose)
        else None
    )

    status_val = (payload.status or "COMPLETED").upper()
    if status_val not in ("PENDING", "COMPLETED", "REJECTED"):
        status_val = "COMPLETED"

    doc = {
        "school_id": current_user.get("school_id") or alumni.get("school_id") or "PLATFORM",
        "alumni_id": str(alumni["_id"]),
        "user_id": alumni.get("user_id"),
        "contributor_name": alumni.get("full_name", "Alumnus"),
        "contributor_name_ta": alumni.get("full_name_ta") or alumni.get("name_ta"),
        "batch_year": alumni.get("passing_year"),
        "amount": float(payload.amount),
        "currency": payload.currency or "INR",
        "purpose": payload.purpose or "GENERAL",
        "purpose_note": payload.purpose_note,
        "contribution_date": contribution_date,
        "financial_year": fy,
        "payment_method": payload.payment_method,
        "payment_reference": payload.payment_reference,
        "proof_url": payload.proof_url,
        "status": status_val,
        "public_visibility": bool(payload.public_visibility),
        "remarks": payload.remarks,
        "contact_number": payload.contact_number,
        "address": payload.address,
        "specific_purpose": specific_purpose,
        "receipt_required": payload.receipt_required,
        "admin_remarks": None,
        "created_by_admin": current_user["user_id"],
        "created_at": now,
        "updated_at": now,
    }
    res = await db.contributions.insert_one(doc)

    await db.audit_logs.insert_one({
        "school_id": current_user.get("school_id"),
        "user_id": current_user["user_id"],
        "action": "CONTRIBUTION_CREATED_BY_ADMIN",
        "resource_type": "contribution",
        "resource_id": str(res.inserted_id),
        "metadata": {"alumni_id": str(alumni["_id"]), "amount": float(payload.amount)},
        "timestamp": now,
    })

    ttl_cache.invalidate("public:contributors")
    ttl_cache.invalidate("public:contributions")

    return {
        "success": True,
        "id": str(res.inserted_id),
        "message": "Contribution recorded on behalf of the alumni.",
        "financial_year": fy,
    }

@router.get("/my")
async def alumni_get_my_contributions(
    current_user: dict = Depends(get_current_user),
):
    """Alumni contribution history."""
    db = get_db()
    alumni = current_user.get("alumni") or {}
    alumni_id = str(alumni.get("_id")) if alumni.get("_id") else None
    user_id = current_user.get("user_id")

    query = {"$or": [{"alumni_id": alumni_id}, {"user_id": user_id}]}
    cursor = db.contributions.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=200)
    return [_serialize(d) for d in docs]


@router.post("/upload-proof")
async def alumni_upload_proof(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload proof of payment (image or PDF)."""
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Proof file exceeds 15MB")

    content_type = file.content_type or "application/octet-stream"
    url = await blob_service.upload_raw_file(
        file_content=content,
        filename=file.filename or "proof.bin",
        content_type=content_type,
        school_id=current_user.get("school_id") or "general",
    )
    return {"success": True, "proof_url": url, "file_name": file.filename}


# ---------------------------------------------------------------------------
# PUBLIC ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/public/top")
async def public_top_contributors(
    financial_year: Optional[str] = Query(None),
    limit: int = Query(5, ge=1, le=1000),
    response: Response = None,
):
    """Top N contributors for a financial year. Public-safe fields only."""
    if response is not None:
        response.headers["Cache-Control"] = "public, max-age=30, stale-while-revalidate=60"

    cache_key = f"public:contributors:{financial_year or 'ALL'}:{limit}"
    cached = ttl_cache.get(cache_key)
    if cached is not None:
        return cached

    db = get_db()
    query = {"status": "COMPLETED", "public_visibility": True}
    if financial_year:
        query["financial_year"] = financial_year

    cursor = db.contributions.find(
        query,
        projection={
            "_id": 1, "contributor_name": 1, "contributor_name_ta": 1,
            "batch_year": 1, "amount": 1, "contribution_date": 1,
        },
    ).sort("amount", -1).limit(limit)

    docs = await cursor.to_list(length=limit)
    res = [
        {
            "id": str(d["_id"]),
            "name": d.get("contributor_name", "Alumnus"),
            "name_ta": d.get("contributor_name_ta"),
            "batch": d.get("batch_year"),
            "amount": d.get("amount", 0),
            "contribution_date": d.get("contribution_date"),
        }
        for d in docs
    ]
    ttl_cache.set(cache_key, res, ttl=30)
    return res


@router.get("/public/latest-fy")
async def public_latest_contribution_fy(response: Response = None):
    """
    Returns the FY that has the most recent COMPLETED + public contribution.
    Used by the public audit page to pick the FY when no audit statement exists.
    Returns {"financial_year": "YYYY - YYYY"} or {"financial_year": null}.
    """
    if response is not None:
        response.headers["Cache-Control"] = "public, max-age=30, stale-while-revalidate=60"

    cache_key = "public:contributions:latest-fy"
    cached = ttl_cache.get(cache_key)
    if cached is not None:
        return cached

    db = get_db()
    doc = await db.contributions.find_one(
        {"status": "COMPLETED", "public_visibility": True},
        projection={"financial_year": 1, "contribution_date": 1, "created_at": 1},
        sort=[("contribution_date", -1), ("created_at", -1)],
    )
    res = {"financial_year": (doc.get("financial_year") if doc else None)}
    ttl_cache.set(cache_key, res, ttl=30)
    return res


# ---------------------------------------------------------------------------
# ADMIN ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/admin/all")
async def admin_list_contributions(
    financial_year: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    batch_year: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    query = {}
    school_id = current_user.get("school_id")
    if school_id:
        school_filter = await build_school_filter(school_id)
        if school_filter:
            query.update(school_filter)

    if financial_year:
        query["financial_year"] = financial_year
    if status_filter and status_filter != "ALL":
        query["status"] = status_filter
    if batch_year:
        query["batch_year"] = batch_year
    if search:
        query["$or"] = [
            {"contributor_name": {"$regex": search, "$options": "i"}},
            {"payment_reference": {"$regex": search, "$options": "i"}},
            {"purpose": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.contributions.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=500)
    return [_serialize(d) for d in docs]


@router.get("/admin/analytics")
async def admin_contribution_analytics(
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    school_id = current_user.get("school_id")
    match = {}
    if school_id:
        match["school_id"] = school_id

    pipeline = [
        {"$match": match},
        {"$group": {
            "_id": "$financial_year",
            "total_amount": {"$sum": "$amount"},
            "count": {"$sum": 1},
            "completed": {"$sum": {"$cond": [{"$eq": ["$status", "COMPLETED"]}, 1, 0]}},
            "pending": {"$sum": {"$cond": [{"$eq": ["$status", "PENDING"]}, 1, 0]}},
        }},
        {"$sort": {"_id": -1}},
    ]
    docs = await db.contributions.aggregate(pipeline).to_list(length=50)
    return [
        {
            "financial_year": d["_id"],
            "total_amount": d.get("total_amount", 0),
            "count": d.get("count", 0),
            "completed": d.get("completed", 0),
            "pending": d.get("pending", 0),
        }
        for d in docs
    ]


@router.put("/admin/{contribution_id}")
async def admin_update_contribution(
    contribution_id: str,
    payload: ContributionUpdateRequest,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    oid = ObjectId(contribution_id) if ObjectId.is_valid(contribution_id) else contribution_id

    update_fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_fields:
        return {"success": True, "message": "Nothing to update"}
    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = await db.contributions.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contribution not found")

    await db.audit_logs.insert_one({
        "school_id": current_user.get("school_id"),
        "user_id": current_user["user_id"],
        "action": "CONTRIBUTION_UPDATED",
        "resource_type": "contribution",
        "resource_id": contribution_id,
        "metadata": {"fields": list(update_fields.keys())},
        "timestamp": datetime.now(timezone.utc),
    })

    # Invalidate server-side cache so public top-contributors refreshes immediately
    ttl_cache.invalidate("public:contributors")
    ttl_cache.invalidate("public:contributions")

    return {"success": True, "message": "Contribution updated"}


@router.delete("/admin/{contribution_id}")
async def admin_delete_contribution(
    contribution_id: str,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    oid = ObjectId(contribution_id) if ObjectId.is_valid(contribution_id) else contribution_id
    result = await db.contributions.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contribution not found")

    ttl_cache.invalidate("public:contributors")
    ttl_cache.invalidate("public:contributions")

    return {"success": True, "message": "Contribution deleted"}