import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, Query
from bson import ObjectId
from pymongo import UpdateOne
from pydantic import BaseModel

from app.core.database import get_db, build_school_filter
from app.core.cache import ttl_cache
from app.middleware.auth import get_current_user, require_roles, require_verified_alumni
from app.schemas.models import SponsorCreateRequest, SponsorUpdateRequest, UserSponsorCreateRequest, UserSponsorUpdateRequest
from app.services.azure_blob import blob_service
from app.api.notifications import create_notification
logger = logging.getLogger("app.sponsors")
router = APIRouter(prefix="/sponsors", tags=["Sponsors"])

ADMIN_ROLES = ["SCHOOL_ADMIN", "SUPER_ADMIN", "PRIMARY_DEVELOPER", "DEVELOPER"]


def _serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "school_id": str(doc["school_id"]) if doc.get("school_id") else None,
        "created_by": doc.get("created_by"),
        "name": doc.get("name", ""),
        "name_ta": doc.get("name_ta"),
        "description": doc.get("description"),
        "description_ta": doc.get("description_ta"),
        "logo_url": doc.get("logo_url"),
        "website_url": doc.get("website_url"),
        "financial_year": doc.get("financial_year", ""),
        "amount": doc.get("amount"),
        "sponsored_item": doc.get("sponsored_item"),
        "sponsor_tier": doc.get("sponsor_tier", "STANDARD"),
        "display_order": doc.get("display_order", 1),
        "is_published": doc.get("is_published", False),
        "status": doc.get("status", "ACTIVE"),
        # ── approval workflow fields surfaced to the admin UI
        "approval_status": doc.get("approval_status", "PUBLISHED" if doc.get("is_published") else "PENDING"),
        "created_by_role": doc.get("created_by_role"),
        "rejection_reason": doc.get("rejection_reason"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


# ---------------------------------------------------------------------------
# PUBLIC ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/public")
async def public_list_sponsors(
    financial_year: str = Query(...),
    response: Response = None,
):
    """Public published sponsors for a given financial year.

    Filters by `is_published=True` AND `status='ACTIVE'`, so pending and
    rejected sponsors (which always have is_published=False) can never
    leak publicly.
    """
    if response is not None:
        response.headers["Cache-Control"] = "public, max-age=30, stale-while-revalidate=60"

    cache_key = f"public:sponsors:{financial_year}"
    cached = ttl_cache.get(cache_key)
    if cached is not None:
        return cached

    db = get_db()
    cursor = db.sponsors.find(
        {"financial_year": financial_year, "is_published": True, "status": "ACTIVE"}
    ).sort([("display_order", 1), ("name", 1)])
    docs = await cursor.to_list(length=100)

    res = [
        {
            "id": str(d["_id"]),
            "name": d.get("name", ""),
            "name_ta": d.get("name_ta"),
            "logo_url": d.get("logo_url"),
            "website_url": d.get("website_url"),
            "description": d.get("description"),
            "description_ta": d.get("description_ta"),
            "financial_year": d.get("financial_year", ""),
            "amount": d.get("amount"),
            "sponsored_item": d.get("sponsored_item"),
            "created_at": d.get("created_at"),
            "tier": d.get("sponsor_tier", "STANDARD"),
            "display_order": d.get("display_order", 1),
        }
        for d in docs
    ]
    ttl_cache.set(cache_key, res, ttl=30)
    return res


# ---------------------------------------------------------------------------
# AUTHENTICATED ALUMNI ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/my")
async def list_my_sponsors(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.sponsors.find({"created_by": current_user["user_id"]}).sort("created_at", -1)
    docs = await cursor.to_list(length=200)
    return [_serialize(doc) for doc in docs]


@router.post("/my")
async def create_my_sponsor(
    payload: UserSponsorCreateRequest,
    current_user: dict = Depends(require_verified_alumni),
):
    """Alumni submit a sponsor. Always PENDING — admin approval required.

    `is_published` and `approval_status` are set SERVER-SIDE. Client cannot
    override them because UserSponsorCreateRequest has no such fields.
    """
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "school_id": current_user.get("school_id") or "PLATFORM",
        "created_by": current_user["user_id"],
        "created_by_role": "ALUMNI",
        "name": payload.name.strip(),
        "name_ta": payload.name_ta,
        "description": payload.description,
        "description_ta": payload.description_ta,
        "logo_url": payload.logo_url,
        "website_url": payload.website_url,
        "financial_year": payload.financial_year.strip(),
        "amount": payload.amount,
        "sponsored_item": payload.sponsored_item,
        "sponsor_tier": "STANDARD",
        "display_order": 1,
        "is_published": False,
        "approval_status": "PENDING",
        "rejection_reason": None,
        "status": "ACTIVE",
        "created_at": now,
        "updated_at": now,
    }
    result = await db.sponsors.insert_one(doc)
    ttl_cache.invalidate("public:sponsors")
    return {
        "success": True,
        "id": str(result.inserted_id),
        "message": "Sponsor submitted for review",
    }


@router.put("/my/{sponsor_id}")
async def update_my_sponsor(
    sponsor_id: str,
    payload: UserSponsorUpdateRequest,
    current_user: dict = Depends(require_verified_alumni),
):
    """Alumni editing their sponsor resets it to PENDING for re-review.

    Even if the sponsor was previously approved, editing the content
    forces a fresh admin review — this prevents a re-approved sponsor
    from being silently modified into something the admin never saw.
    """
    db = get_db()
    oid = ObjectId(sponsor_id) if ObjectId.is_valid(sponsor_id) else sponsor_id
    fields = {key: value for key, value in payload.model_dump().items() if value is not None}
    if "name" in fields:
        fields["name"] = fields["name"].strip()
    if "financial_year" in fields:
        fields["financial_year"] = fields["financial_year"].strip()
    fields["is_published"] = False
    fields["approval_status"] = "PENDING"
    fields["rejection_reason"] = None
    fields["updated_at"] = datetime.now(timezone.utc)
    result = await db.sponsors.update_one(
        {"_id": oid, "created_by": current_user["user_id"]},
        {"$set": fields},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    ttl_cache.invalidate("public:sponsors")
    return {"success": True, "message": "Sponsor updated and submitted for review"}


@router.delete("/my/{sponsor_id}")
async def delete_my_sponsor(
    sponsor_id: str,
    current_user: dict = Depends(require_verified_alumni),
):
    db = get_db()
    oid = ObjectId(sponsor_id) if ObjectId.is_valid(sponsor_id) else sponsor_id
    result = await db.sponsors.delete_one({"_id": oid, "created_by": current_user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    ttl_cache.invalidate("public:sponsors")
    return {"success": True, "message": "Sponsor deleted"}


@router.post("/my/upload-logo")
async def upload_my_sponsor_logo(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_verified_alumni),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Logo exceeds 5MB")
    main_url, thumb_url, _ = await blob_service.upload_image(
        file_content=content,
        filename=file.filename or "logo.png",
        content_type=file.content_type or "image/png",
        school_id=current_user.get("school_id") or "general",
        event_id="sponsors",
    )
    return {"success": True, "logo_url": main_url, "thumbnail_url": thumb_url}


# ---------------------------------------------------------------------------
# ADMIN ENDPOINTS
# ---------------------------------------------------------------------------
@router.get("/admin/all")
async def admin_list_sponsors(
    financial_year: str = Query(None),
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

    cursor = db.sponsors.find(query).sort([("display_order", 1), ("created_at", -1)])
    docs = await cursor.to_list(length=300)
    return [_serialize(d) for d in docs]


@router.post("/admin")
async def admin_create_sponsor(
    payload: SponsorCreateRequest,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    """Admin-created sponsors are published immediately — no approval needed.

    `is_published` and `approval_status` are set SERVER-SIDE based on role,
    so even if the client sends `is_published: false`, the record will still
    be published because admin creation short-circuits the workflow.
    """
    db = get_db()
    now = datetime.now(timezone.utc)
    school_id = current_user.get("school_id") or "PLATFORM"

    doc = {
        "school_id": school_id,
        "created_by": current_user["user_id"],
        "created_by_role": "ADMIN",
        "name": payload.name,
        "name_ta": payload.name_ta,
        "description": payload.description,
        "description_ta": payload.description_ta,
        "logo_url": payload.logo_url,
        "website_url": payload.website_url,
        "financial_year": payload.financial_year,
        "sponsor_tier": payload.sponsor_tier or "STANDARD",
        "amount": payload.amount,
        "sponsored_item": payload.sponsored_item,
        "display_order": payload.display_order,
        "is_published": True,
        "approval_status": "PUBLISHED",
        "rejection_reason": None,
        "status": payload.status or "ACTIVE",
        "created_at": now,
        "updated_at": now,
    }
    res = await db.sponsors.insert_one(doc)

    ttl_cache.invalidate("public:sponsors")

    return {"success": True, "id": str(res.inserted_id), "message": "Sponsor created"}


# ---------------------------------------------------------------------------
# REORDER — must be declared BEFORE PUT /admin/{sponsor_id} so FastAPI does not
# match the literal path segment "reorder" against the {sponsor_id} placeholder.
# ---------------------------------------------------------------------------
class SponsorReorderItem(BaseModel):
    id: str
    display_order: int


class SponsorReorderRequest(BaseModel):
    items: list[SponsorReorderItem]


@router.put("/admin/reorder")
async def admin_reorder_sponsors(
    payload: SponsorReorderRequest,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    """Bulk-update the display_order of sponsors.

    Body: {"items": [{"id": "...", "display_order": 1}, ...]}
    The frontend sends the entire renumbered list; the backend writes each
    display_order in a single bulk_write and invalidates the public cache.
    """
    db = get_db()
    if not payload.items:
        return {"success": True, "updated": 0}

    ops = []
    for entry in payload.items:
        oid = ObjectId(entry.id) if ObjectId.is_valid(entry.id) else entry.id
        ops.append(
            UpdateOne(
                {"_id": oid},
                {
                    "$set": {
                        "display_order": int(entry.display_order),
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )
        )

    result = await db.sponsors.bulk_write(ops, ordered=False)
    ttl_cache.invalidate("public:sponsors")

    return {"success": True, "updated": result.modified_count}


@router.put("/admin/{sponsor_id}")
async def admin_update_sponsor(
    sponsor_id: str,
    payload: SponsorUpdateRequest,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    """Admin update. Accepts `approval_status` to drive Approve/Reject.

    - `approval_status='PUBLISHED'` → sets is_published=True
    - `approval_status='REJECTED'`  → sets is_published=False; persists the
      rejection_reason and, if the sponsor was submitted by an alumnus
      (created_by_role == 'ALUMNI'), creates a notification for that alumnus.
    - `approval_status='PENDING'`   → sets is_published=False

    Explicit `is_published` in the payload takes priority if both are sent,
    so the two fields never disagree.
    """
    db = get_db()
    oid = ObjectId(sponsor_id) if ObjectId.is_valid(sponsor_id) else sponsor_id

    # Fetch the existing doc first so we can (a) know who submitted it, and
    # (b) preserve fields that are not present in this update.
    existing = await db.sponsors.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    update_fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_fields:
        return {"success": True, "message": "Nothing to update"}

    approval = update_fields.get("approval_status")
    if approval is not None:
        approval_upper = str(approval).upper()
        if approval_upper not in ("PENDING", "PUBLISHED", "REJECTED"):
            raise HTTPException(status_code=400, detail="Invalid approval_status")
        update_fields["approval_status"] = approval_upper
        if "is_published" not in update_fields:
            update_fields["is_published"] = (approval_upper == "PUBLISHED")

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = await db.sponsors.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    ttl_cache.invalidate("public:sponsors")

    # ── Rejection notification (alumni-submitted sponsors only) ─────────────
    was_rejected = (update_fields.get("approval_status") == "REJECTED")
    submitted_by_alumni = (existing.get("created_by_role") == "ALUMNI")
    if was_rejected and submitted_by_alumni:
        # Look up the alumni document so we can target the correct user_id.
        # The sponsor stores `created_by` as the submitting user's id.
        sponsor_creator_user_id = existing.get("created_by")
        if sponsor_creator_user_id:
            reason_text = (
                update_fields.get("rejection_reason")
                or payload.rejection_reason
                or "No reason provided."
            )
            sponsor_name = existing.get("name", "your sponsor submission")

            await create_notification(
                db=db,
                user_id=str(sponsor_creator_user_id),
                kind="SPONSOR_REJECTED",
                title="Sponsor Submission Rejected",
                body=(
                    f'Your sponsor submission "{sponsor_name}" was rejected by the school admin.\n\n'
                    f"Reason:\n{reason_text}"
                ),
                related_type="sponsor",
                related_id=str(existing["_id"]),
            )

    return {"success": True, "message": "Sponsor updated"}


@router.delete("/admin/{sponsor_id}")
async def admin_delete_sponsor(
    sponsor_id: str,
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    db = get_db()
    oid = ObjectId(sponsor_id) if ObjectId.is_valid(sponsor_id) else sponsor_id
    result = await db.sponsors.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    ttl_cache.invalidate("public:sponsors")

    return {"success": True, "message": "Sponsor deleted"}


@router.post("/admin/upload-logo")
async def admin_upload_sponsor_logo(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_roles(ADMIN_ROLES)),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Logo exceeds 5MB")

    content_type = file.content_type or "image/png"
    main_url, thumb_url, blob_path = await blob_service.upload_image(
        file_content=content,
        filename=file.filename or "logo.png",
        content_type=content_type,
        school_id=current_user.get("school_id") or "general",
        event_id="sponsors",
    )
    return {"success": True, "logo_url": main_url, "thumbnail_url": thumb_url}