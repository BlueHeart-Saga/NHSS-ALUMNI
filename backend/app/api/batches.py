from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import CreateBatchRequest, BatchResponse, AssignCoordinatorRequest, UserProfileResponse
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/batches", tags=["Batches Management"])

@router.get("", response_model=List[BatchResponse])
async def list_batches(current_user: dict = Depends(get_current_user)):
    db = get_db()
    school_id = current_user["school_id"]

    cursor = db.batches.find({"school_id": school_id}).sort("passing_year", -1)
    batches = await cursor.to_list(length=100)

    result = []
    for b in batches:
        b_id = str(b["_id"])
        total_members = await db.alumni.count_documents({
            "school_id": school_id,
            "passing_year": b["passing_year"],
            "verification_status": "APPROVED"
        })
        result.append(BatchResponse(
            id=b_id,
            school_id=school_id,
            name=b["name"],
            passing_year=b["passing_year"],
            description=b.get("description"),
            coordinators=b.get("coordinators", []),
            total_members=total_members,
            status=b.get("status", "ACTIVE"),
            created_at=b.get("created_at", datetime.now(timezone.utc))
        ))
    return result

@router.post("", response_model=BatchResponse)
async def create_batch(
    request: CreateBatchRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    existing = await db.batches.find_one({"school_id": school_id, "passing_year": request.passing_year})
    if existing:
        raise HTTPException(status_code=400, detail=f"Batch for year {request.passing_year} already exists")

    doc = {
        "school_id": school_id,
        "name": request.name,
        "passing_year": request.passing_year,
        "description": request.description,
        "coordinators": [],
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc)
    }
    res = await db.batches.insert_one(doc)
    b_id = str(res.inserted_id)

    return BatchResponse(
        id=b_id,
        school_id=school_id,
        name=request.name,
        passing_year=request.passing_year,
        description=request.description,
        coordinators=[],
        total_members=0,
        status="ACTIVE",
        created_at=doc["created_at"]
    )

@router.get("/{batch_id}", response_model=BatchResponse)
async def get_batch_details(batch_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    school_id = current_user["school_id"]

    batch = await db.batches.find_one({"_id": ObjectId(batch_id), "school_id": school_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    total_members = await db.alumni.count_documents({
        "school_id": school_id,
        "passing_year": batch["passing_year"],
        "verification_status": "APPROVED"
    })

    return BatchResponse(
        id=str(batch["_id"]),
        school_id=school_id,
        name=batch["name"],
        passing_year=batch["passing_year"],
        description=batch.get("description"),
        coordinators=batch.get("coordinators", []),
        total_members=total_members,
        status=batch.get("status", "ACTIVE"),
        created_at=batch.get("created_at", datetime.now(timezone.utc))
    )

@router.get("/{batch_id}/members", response_model=List[UserProfileResponse])
async def list_batch_members(batch_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    school_id = current_user["school_id"]

    batch = await db.batches.find_one({"_id": ObjectId(batch_id), "school_id": school_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    cursor = db.alumni.find({
        "school_id": school_id,
        "passing_year": batch["passing_year"],
        "verification_status": "APPROVED"
    }).sort("full_name", 1)

    alumni_list = await cursor.to_list(length=500)

    res = []
    for a in alumni_list:
        # Check user roles
        user = await db.users.find_one({"_id": ObjectId(a["user_id"])}) if a.get("user_id") else None
        roles = user.get("roles", ["ALUMNI"]) if user else ["ALUMNI"]

        res.append(UserProfileResponse(
            id=str(a["_id"]),
            user_id=str(a.get("user_id", "")),
            school_id=school_id,
            full_name=a["full_name"],
            mobile=a["mobile"] if a.get("email_visible") or "SCHOOL_ADMIN" in current_user["roles"] else "***",
            email=a["email"] if a.get("email_visible") or "SCHOOL_ADMIN" in current_user["roles"] else "***",
            profile_photo_url=a.get("profile_photo_url"),
            passing_year=a["passing_year"],
            batch_id=batch_id,
            admission_number=a.get("admission_number", ""),
            section=a.get("section"),
            current_city=a.get("current_city"),
            profession=a.get("profession"),
            verification_status=a.get("verification_status", "APPROVED"),
            roles=roles,
            email_visible=a.get("email_visible", False),
            created_at=a.get("created_at", datetime.now(timezone.utc))
        ))
    return res

@router.post("/{batch_id}/coordinators")
async def assign_coordinator(
    batch_id: str,
    request: AssignCoordinatorRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    batch_query = {}
    try:
        batch_query = {"_id": ObjectId(batch_id)}
    except Exception:
        batch_query = {"_id": batch_id}

    batch = await db.batches.find_one(batch_query)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    alumni_query = {}
    try:
        alumni_query = {"_id": ObjectId(request.alumni_id)}
    except Exception:
        alumni_query = {"_id": request.alumni_id}

    alumni = await db.alumni.find_one(alumni_query)
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni record not found")

    # Add coordinator role to user if user_id exists
    u_id = alumni.get("user_id")
    if u_id:
        user_query = {}
        try:
            user_query = {"_id": ObjectId(u_id)}
        except Exception:
            user_query = {"_id": u_id}

        await db.users.update_one(
            user_query,
            {"$addToSet": {"roles": "BATCH_COORDINATOR"}}
        )

    # Add alumni_id to batch coordinators
    await db.batches.update_one(
        {"_id": batch["_id"]},
        {"$addToSet": {"coordinators": str(alumni["_id"])}}
    )

    return {"success": True, "message": f"{alumni['full_name']} is now Batch Coordinator for {batch['name']}"}
