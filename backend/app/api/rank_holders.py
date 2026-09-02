from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from bson import ObjectId
from app.core.database import get_db
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/rank-holders", tags=["Rank Holders Management"])

class CreateRankHolderRequest(BaseModel):
    alumni_id: Optional[str] = None
    student_name: str
    academic_year: str  # e.g. "2025–2026"
    class_standard: str  # e.g. "10th" or "12th"
    rank: str  # e.g. "1st Rank", "2nd Rank", "School First", "District First", "State First"
    achievement_type: Optional[str] = "SSLC / Public Examination"
    marks_percentage: Optional[str] = None  # e.g. "95.6%"
    total_marks: Optional[str] = None  # e.g. "485"
    max_marks: Optional[str] = None  # e.g. "500" or "1200"
    subject_stream: Optional[str] = None
    achievement_title: Optional[str] = "School Rank Holder"
    photograph: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "Active"

@router.get("")
async def list_rank_holders(
    search: Optional[str] = Query(None),
    academic_year: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    school_id = current_user.get("school_id")

    query = {}
    if school_id:
        query["$or"] = [{"school_id": school_id}, {"school_id": {"$exists": False}}, {"school_id": None}]
    
    if academic_year:
        query["academic_year"] = academic_year
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"student_name": {"$regex": search, "$options": "i"}},
            {"rank": {"$regex": search, "$options": "i"}},
            {"achievement_title": {"$regex": search, "$options": "i"}}
        ]

    cursor = db.rank_holders.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)

    res = []
    for d in docs:
        res.append({
            "id": str(d["_id"]),
            "school_id": d.get("school_id"),
            "alumni_id": d.get("alumni_id"),
            "student_name": d.get("student_name"),
            "academic_year": d.get("academic_year"),
            "class_standard": d.get("class_standard"),
            "rank": d.get("rank"),
            "achievement_type": d.get("achievement_type"),
            "marks_percentage": d.get("marks_percentage"),
            "total_marks": d.get("total_marks"),
            "max_marks": d.get("max_marks"),
            "subject_stream": d.get("subject_stream"),
            "achievement_title": d.get("achievement_title"),
            "photograph": d.get("photograph"),
            "description": d.get("description"),
            "status": d.get("status", "Active"),
            "created_at": d.get("created_at")
        })
    return res

@router.post("")
async def create_rank_holder(
    req: CreateRankHolderRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")
    now = datetime.now(timezone.utc)

    # Auto fill photo from alumni profile if alumni_id provided and photo missing
    photo = req.photograph
    if req.alumni_id and not photo:
        try:
            a = await db.alumni.find_one({"_id": ObjectId(req.alumni_id)})
            if a:
                photo = a.get("profile_photo_url")
        except Exception:
            pass

    doc = {
        "school_id": school_id,
        "alumni_id": req.alumni_id,
        "student_name": req.student_name.strip(),
        "academic_year": req.academic_year.strip(),
        "class_standard": req.class_standard.strip(),
        "rank": req.rank.strip(),
        "achievement_type": req.achievement_type,
        "marks_percentage": req.marks_percentage,
        "total_marks": req.total_marks,
        "max_marks": req.max_marks,
        "subject_stream": req.subject_stream,
        "achievement_title": req.achievement_title,
        "photograph": photo,
        "description": req.description,
        "status": req.status or "Active",
        "created_at": now,
        "updated_at": now
    }

    res = await db.rank_holders.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc

@router.put("/{holder_id}")
async def update_rank_holder(
    holder_id: str,
    req: CreateRankHolderRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    now = datetime.now(timezone.utc)

    update_doc = {
        "alumni_id": req.alumni_id,
        "student_name": req.student_name.strip(),
        "academic_year": req.academic_year.strip(),
        "class_standard": req.class_standard.strip(),
        "rank": req.rank.strip(),
        "achievement_type": req.achievement_type,
        "marks_percentage": req.marks_percentage,
        "total_marks": req.total_marks,
        "max_marks": req.max_marks,
        "subject_stream": req.subject_stream,
        "achievement_title": req.achievement_title,
        "photograph": req.photograph,
        "description": req.description,
        "status": req.status or "Active",
        "updated_at": now
    }

    res = await db.rank_holders.update_one(
        {"_id": ObjectId(holder_id)},
        {"$set": update_doc}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rank holder record not found")

    return {"success": True, "message": "Rank holder record updated successfully"}

@router.delete("/{holder_id}")
async def delete_rank_holder(
    holder_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    res = await db.rank_holders.delete_one({"_id": ObjectId(holder_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rank holder record not found")
    return {"success": True, "message": "Rank holder deleted successfully"}
