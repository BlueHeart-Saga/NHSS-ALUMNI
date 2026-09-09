from fastapi import APIRouter, HTTPException, Depends, Query, Response, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.middleware.auth import get_current_user, require_roles, get_current_user_optional

router = APIRouter(prefix="/feedback", tags=["Alumni Feedback & Opinions (கருத்துகள்)"])

# -----------------------------------------------------------------------------
# PYDANTIC SCHEMAS
# -----------------------------------------------------------------------------

FEEDBACK_TYPES = [
    "WEBSITE", "MEMORIES", "ASSOCIATION", "EVENTS",
    "SUGGESTIONS", "APPRECIATION", "OTHER"
]

class FeedbackCreatePayload(BaseModel):
    alumni_name: str = Field(..., min_length=2)
    alumni_name_ta: Optional[str] = None
    batch_year: str = Field(..., min_length=2)
    photo_url: Optional[str] = None
    location: Optional[str] = None
    feedback_type: str = "SUGGESTIONS"
    feedback_text: str = Field(..., min_length=5)
    feedback_text_ta: Optional[str] = None
    rating: Optional[int] = Field(default=5, ge=1, le=5)

class FeedbackUpdatePayload(BaseModel):
    alumni_name: Optional[str] = None
    alumni_name_ta: Optional[str] = None
    batch_year: Optional[str] = None
    photo_url: Optional[str] = None
    location: Optional[str] = None
    feedback_type: Optional[str] = None
    feedback_text: Optional[str] = None
    feedback_text_ta: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    status: Optional[str] = None
    is_featured: Optional[bool] = None

class FeedbackStatusPayload(BaseModel):
    status: str  # APPROVED, REJECTED, PENDING
    admin_remarks: Optional[str] = ""

def format_feedback(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc.get("user_id", "")),
        "alumni_name": doc.get("alumni_name", "Alumnus"),
        "alumni_name_ta": doc.get("alumni_name_ta"),
        "batch_year": str(doc.get("batch_year", "N/A")),
        "photo_url": doc.get("photo_url"),
        "location": doc.get("location"),
        "feedback_type": doc.get("feedback_type", "SUGGESTIONS"),
        "feedback_text": doc.get("feedback_text", ""),
        "feedback_text_ta": doc.get("feedback_text_ta"),
        "rating": doc.get("rating", 5),
        "status": doc.get("status", "PENDING"),
        "admin_remarks": doc.get("admin_remarks", ""),
        "is_featured": doc.get("is_featured", False),
        "created_at": doc.get("created_at", datetime.now(timezone.utc)).isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at", "")
    }

# -----------------------------------------------------------------------------
# PUBLIC ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/public")
async def get_public_feedback(
    response: Response,
    feedback_type: Optional[str] = None,
    batch_year: Optional[str] = None,
    featured_only: Optional[bool] = False,
    search: Optional[str] = None
):
    """Fetch approved alumni feedback and opinions for public page display."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"
    db = get_db()

    query = {"status": "APPROVED"}
    if feedback_type and feedback_type != "ALL":
        query["feedback_type"] = feedback_type.upper()
    if batch_year and batch_year != "ALL":
        query["batch_year"] = batch_year
    if featured_only:
        query["is_featured"] = True

    if search and search.strip():
        s = search.strip()
        query["$or"] = [
            {"alumni_name": {"$regex": s, "$options": "i"}},
            {"feedback_text": {"$regex": s, "$options": "i"}},
            {"feedback_text_ta": {"$regex": s, "$options": "i"}},
            {"batch_year": {"$regex": s, "$options": "i"}},
        ]

    docs = await db.feedbacks.find(query).sort("created_at", -1).to_list(length=100)
    return [format_feedback(d) for d in docs]


# -----------------------------------------------------------------------------
# ALUMNI / LOGGED-IN ENDPOINTS
# -----------------------------------------------------------------------------

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_feedback(
    payload: FeedbackCreatePayload,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Submit new alumni feedback/opinion. Default status is PENDING for admin review."""
    db = get_db()
    now = datetime.now(timezone.utc)

    user_id = ""
    photo_url = payload.photo_url
    if current_user:
        user_id = str(current_user.get("_id", ""))
        if not photo_url:
            photo_url = current_user.get("profile_photo_url")

    doc = {
        "user_id": user_id,
        "alumni_name": payload.alumni_name.strip(),
        "alumni_name_ta": payload.alumni_name_ta.strip() if payload.alumni_name_ta else None,
        "batch_year": payload.batch_year.strip(),
        "photo_url": photo_url,
        "location": payload.location.strip() if payload.location else None,
        "feedback_type": payload.feedback_type.upper() if payload.feedback_type else "SUGGESTIONS",
        "feedback_text": payload.feedback_text.strip(),
        "feedback_text_ta": payload.feedback_text_ta.strip() if payload.feedback_text_ta else None,
        "rating": payload.rating or 5,
        "status": "PENDING",  # Always requires admin review
        "admin_remarks": "",
        "is_featured": False,
        "created_at": now,
        "updated_at": now
    }

    res = await db.feedbacks.insert_one(doc)
    doc["_id"] = res.inserted_id
    return format_feedback(doc)


@router.get("/my")
async def get_my_feedback(current_user: dict = Depends(require_roles(["ALUMNI", "SCHOOL_ADMIN"]))):
    """Fetch current user's submitted feedback records."""
    db = get_db()
    user_id = str(current_user.get("_id", ""))

    docs = await db.feedbacks.find({"user_id": user_id}).sort("created_at", -1).to_list(length=50)
    return [format_feedback(d) for d in docs]


# -----------------------------------------------------------------------------
# SCHOOL ADMIN ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/admin")
async def get_admin_feedback(
    status_filter: Optional[str] = Query(default="ALL"),
    feedback_type: Optional[str] = Query(default="ALL"),
    batch_year: Optional[str] = Query(default="ALL"),
    search: Optional[str] = None,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    """School Admin endpoint: List feedbacks with moderation controls and filters."""
    db = get_db()
    query = {}

    if status_filter and status_filter != "ALL":
        if status_filter == "FEATURED":
            query["is_featured"] = True
            query["status"] = "APPROVED"
        else:
            query["status"] = status_filter.upper()

    if feedback_type and feedback_type != "ALL":
        query["feedback_type"] = feedback_type.upper()

    if batch_year and batch_year != "ALL":
        query["batch_year"] = batch_year

    if search and search.strip():
        s = search.strip()
        query["$or"] = [
            {"alumni_name": {"$regex": s, "$options": "i"}},
            {"feedback_text": {"$regex": s, "$options": "i"}},
            {"batch_year": {"$regex": s, "$options": "i"}},
            {"location": {"$regex": s, "$options": "i"}},
        ]

    docs = await db.feedbacks.find(query).sort("created_at", -1).to_list(length=200)
    return [format_feedback(d) for d in docs]


@router.get("/admin/analytics")
async def get_feedback_analytics(current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))):
    """School Admin endpoint: Get analytics summary for management dashboard."""
    db = get_db()

    total = await db.feedbacks.count_documents({})
    pending = await db.feedbacks.count_documents({"status": "PENDING"})
    approved = await db.feedbacks.count_documents({"status": "APPROVED"})
    rejected = await db.feedbacks.count_documents({"status": "REJECTED"})
    featured = await db.feedbacks.count_documents({"is_featured": True})

    # Calculate average rating
    pipeline = [
        {"$match": {"rating": {"$ne": None}}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}}
    ]
    avg_res = await db.feedbacks.aggregate(pipeline).to_list(length=1)
    avg_rating = round(avg_res[0]["avg_rating"], 1) if avg_res else 5.0

    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "featured": featured,
        "average_rating": avg_rating
    }


@router.put("/{feedback_id}/status")
async def update_feedback_status(
    feedback_id: str,
    payload: FeedbackStatusPayload,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    """Admin endpoint to Approve or Reject user feedback."""
    db = get_db()
    try:
        obj_id = ObjectId(feedback_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID format")

    st = payload.status.upper()
    if st not in ["PENDING", "APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status value")

    update_fields = {
        "status": st,
        "admin_remarks": payload.admin_remarks or "",
        "updated_at": datetime.now(timezone.utc)
    }

    res = await db.feedbacks.find_one_and_update(
        {"_id": obj_id},
        {"$set": update_fields},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Feedback record not found")

    return format_feedback(res)


@router.put("/{feedback_id}/feature")
async def toggle_featured_feedback(
    feedback_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    """Admin endpoint to toggle is_featured flag."""
    db = get_db()
    try:
        obj_id = ObjectId(feedback_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID format")

    doc = await db.feedbacks.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Feedback record not found")

    new_flag = not doc.get("is_featured", False)
    res = await db.feedbacks.find_one_and_update(
        {"_id": obj_id},
        {"$set": {"is_featured": new_flag, "updated_at": datetime.now(timezone.utc)}},
        return_document=True
    )
    return format_feedback(res)


@router.put("/{feedback_id}")
async def update_feedback(
    feedback_id: str,
    payload: FeedbackUpdatePayload,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    """Admin edit feedback details."""
    db = get_db()
    try:
        obj_id = ObjectId(feedback_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID format")

    updates = {}
    if payload.alumni_name is not None: updates["alumni_name"] = payload.alumni_name.strip()
    if payload.alumni_name_ta is not None: updates["alumni_name_ta"] = payload.alumni_name_ta.strip()
    if payload.batch_year is not None: updates["batch_year"] = payload.batch_year.strip()
    if payload.photo_url is not None: updates["photo_url"] = payload.photo_url.strip()
    if payload.location is not None: updates["location"] = payload.location.strip()
    if payload.feedback_type is not None: updates["feedback_type"] = payload.feedback_type.upper()
    if payload.feedback_text is not None: updates["feedback_text"] = payload.feedback_text.strip()
    if payload.feedback_text_ta is not None: updates["feedback_text_ta"] = payload.feedback_text_ta.strip()
    if payload.rating is not None: updates["rating"] = payload.rating
    if payload.status is not None: updates["status"] = payload.status.upper()
    if payload.is_featured is not None: updates["is_featured"] = payload.is_featured

    updates["updated_at"] = datetime.now(timezone.utc)

    res = await db.feedbacks.find_one_and_update(
        {"_id": obj_id},
        {"$set": updates},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Feedback record not found")

    return format_feedback(res)


@router.delete("/{feedback_id}")
async def delete_feedback(
    feedback_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    """Admin delete feedback record."""
    db = get_db()
    try:
        obj_id = ObjectId(feedback_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID format")

    res = await db.feedbacks.delete_one({"_id": obj_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Feedback record not found")

    return {"success": True, "message": "Feedback deleted successfully"}
