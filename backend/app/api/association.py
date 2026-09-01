from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import (
    CreateAssociationTeamMemberRequest, UpdateAssociationTeamMemberRequest, AssociationTeamMemberResponse
)
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/association", tags=["Alumni Association Team"])

def format_team_response(doc: dict, school_id: str) -> AssociationTeamMemberResponse:
    return AssociationTeamMemberResponse(
        id=str(doc["_id"]),
        school_id=doc.get("school_id", school_id),
        profile_type=doc.get("profile_type", "common"),
        alumni_id=str(doc.get("alumni_id")) if doc.get("alumni_id") else None,
        full_name=doc.get("full_name", "Association Leader"),
        photo_url=doc.get("photo_url"),
        email=doc.get("email"),
        mobile=doc.get("mobile"),
        location=doc.get("location"),
        occupation=doc.get("occupation"),
        batch_year=doc.get("batch_year"),
        position=doc.get("position", "Committee Member"),
        responsibility=doc.get("responsibility"),
        term_start=doc.get("term_start"),
        term_end=doc.get("term_end"),
        display_order=doc.get("display_order", 1),
        bio=doc.get("bio"),
        status=doc.get("status", "ACTIVE"),
        created_at=doc.get("created_at", datetime.now(timezone.utc))
    )

@router.get("/team", response_model=List[AssociationTeamMemberResponse])
async def list_association_team(current_user: dict = Depends(get_current_user)):
    db = get_db()
    school_id = current_user.get("school_id")

    query = {}
    if school_id:
        query["school_id"] = school_id

    cursor = db.association_team.find(query).sort([("display_order", 1), ("created_at", 1)])
    members = await cursor.to_list(length=200)

    return [format_team_response(m, school_id or "") for m in members]

@router.post("/team", response_model=AssociationTeamMemberResponse)
async def create_association_team_member(
    request: CreateAssociationTeamMemberRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")
    now = datetime.now(timezone.utc)

    # If alumni_id is passed, copy alumni fields if not explicitly provided
    if request.alumni_id:
        try:
            alumni = await db.alumni.find_one({"_id": ObjectId(request.alumni_id)})
            if alumni:
                if not request.full_name:
                    request.full_name = alumni.get("full_name", "")
                if not request.photo_url:
                    request.photo_url = alumni.get("profile_photo_url")
                if not request.email:
                    request.email = alumni.get("email")
                if not request.mobile:
                    request.mobile = alumni.get("mobile")
                if not request.location:
                    request.location = alumni.get("current_city") or alumni.get("city")
                if not request.occupation:
                    request.occupation = alumni.get("profession")
                if not request.batch_year:
                    request.batch_year = alumni.get("passing_year")
        except Exception as e:
            print("Alumni lookup notice:", e)

    doc = {
        "school_id": school_id,
        "profile_type": request.profile_type,
        "alumni_id": request.alumni_id,
        "full_name": request.full_name,
        "photo_url": request.photo_url or f"https://ui-avatars.com/api/?name={request.full_name}&background=FFF7D6&color=854D0E",
        "email": request.email,
        "mobile": request.mobile,
        "location": request.location,
        "occupation": request.occupation,
        "batch_year": request.batch_year,
        "position": request.position,
        "responsibility": request.responsibility,
        "term_start": request.term_start or "2024",
        "term_end": request.term_end or "2026",
        "display_order": request.display_order or 1,
        "bio": request.bio,
        "status": request.status or "ACTIVE",
        "created_at": now
    }

    res = await db.association_team.insert_one(doc)
    m_id = str(res.inserted_id)

    doc["_id"] = m_id
    return format_team_response(doc, school_id or "")

@router.put("/team/{member_id}", response_model=AssociationTeamMemberResponse)
async def update_association_team_member(
    member_id: str,
    request: UpdateAssociationTeamMemberRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user.get("school_id")

    existing = await db.association_team.find_one({"_id": ObjectId(member_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Association team profile not found")

    update_fields = {k: v for k, v in request.model_dump().items() if v is not None}
    if update_fields:
        await db.association_team.update_one({"_id": ObjectId(member_id)}, {"$set": update_fields})

    updated = await db.association_team.find_one({"_id": ObjectId(member_id)})
    return format_team_response(updated, school_id or "")

@router.delete("/team/{member_id}")
async def delete_association_team_member(
    member_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    await db.association_team.delete_one({"_id": ObjectId(member_id)})
    return {"success": True, "message": "Association team profile deleted successfully"}
