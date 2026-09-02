from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from bson import ObjectId
from app.core.database import get_db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/mentorship", tags=["Mentorship Network"])

class MentorRegisterRequest(BaseModel):
    domain: str
    available_hours: str
    bio: str
    skills: List[str] = []

class MentorshipRequestInput(BaseModel):
    mentor_id: str
    mentor_name: str
    note: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_as_mentor(
    data: MentorRegisterRequest,
    current_user: dict = Depends(get_current_user)
):
    """Register alumnus as a mentor in the network."""
    db = get_db()
    alumni_id = str(current_user.get("id") or current_user.get("user_id"))

    mentor_doc = {
        "alumni_id": alumni_id,
        "name": current_user.get("full_name") or current_user.get("name", "Alumni Member"),
        "passing_year": current_user.get("passing_year", 2010),
        "designation": current_user.get("profession") or "Professional",
        "company": current_user.get("company") or "Alumni Network",
        "city": current_user.get("current_city") or "India",
        "domain": data.domain,
        "available_hours": data.available_hours,
        "bio": data.bio,
        "skills": data.skills or [current_user.get("profession") or "Career Guidance"],
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    }

    await db.mentors.update_one(
        {"alumni_id": alumni_id},
        {"$set": mentor_doc},
        upsert=True
    )
    return {"success": True, "message": "Successfully registered as mentor"}

@router.get("/mentors")
async def list_mentors(current_user: dict = Depends(get_current_user)):
    """List all registered alumni mentors."""
    db = get_db()
    cursor = db.mentors.find({}).sort("created_at", -1)
    mentors = []
    async for m in cursor:
        m["id"] = str(m["_id"])
        del m["_id"]
        mentors.append(m)

    # Fallback to directory members with professions if mentor list is empty
    if not mentors:
        alumni_cursor = db.users.find({"profession": {"$exists": True, "$ne": ""}}).limit(20)
        async for a in alumni_cursor:
            mentors.append({
                "id": str(a["_id"]),
                "name": a.get("full_name") or a.get("name", "Alumni Member"),
                "passing_year": a.get("passing_year", 2010),
                "designation": a.get("profession") or "Professional",
                "company": a.get("company") or "Alumni Network",
                "city": a.get("current_city") or "India",
                "domain": a.get("profession") or "Career Guidance",
                "available_hours": "2 hrs/week",
                "bio": a.get("bio") or f"{a.get('full_name')} is an alumnus from Class of {a.get('passing_year')}.",
                "skills": a.get("skills") or [a.get("profession") or "Mentorship"]
            })

    return mentors

@router.post("/requests")
async def send_mentorship_request(
    data: MentorshipRequestInput,
    current_user: dict = Depends(get_current_user)
):
    """Send a mentorship request to an alumnus mentor."""
    db = get_db()
    alumni_id = str(current_user.get("id") or current_user.get("user_id"))

    req_doc = {
        "mentee_id": alumni_id,
        "mentee_name": current_user.get("full_name") or "Alumni Member",
        "mentee_year": current_user.get("passing_year", 2020),
        "mentor_id": data.mentor_id,
        "mentor_name": data.mentor_name,
        "note": data.note,
        "status": "PENDING",
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    }

    res = await db.mentorship_requests.insert_one(req_doc)
    req_doc["id"] = str(res.inserted_id)
    if "_id" in req_doc:
        del req_doc["_id"]
    return req_doc
