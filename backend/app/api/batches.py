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

    # Single aggregation query to count approved members per passing_year (Fixes 70x N+1 queries)
    pipeline = [
        {"$match": {"school_id": school_id, "verification_status": "APPROVED"}},
        {"$group": {"_id": "$passing_year", "count": {"$sum": 1}}}
    ]
    counts_cursor = db.alumni.aggregate(pipeline)
    counts_list = await counts_cursor.to_list(length=1000)
    counts_map = {c["_id"]: c["count"] for c in counts_list if c.get("_id")}

    # Collect all coordinator alumni IDs across all batches to fetch profiles in 1 single query
    all_coord_ids = []
    for b in batches:
        for c in b.get("coordinators", []):
            if isinstance(c, str):
                try:
                    all_coord_ids.append(ObjectId(c))
                except Exception:
                    all_coord_ids.append(c)

    coords_map = {}
    if all_coord_ids:
        coord_alumni = await db.alumni.find({"_id": {"$in": all_coord_ids}}).to_list(length=len(all_coord_ids))
        for ca in coord_alumni:
            coords_map[str(ca["_id"])] = {
                "id": str(ca["_id"]),
                "full_name": ca.get("full_name", "Coordinator"),
                "profile_photo_url": ca.get("profile_photo_url"),
                "mobile": ca.get("mobile"),
                "email": ca.get("email")
            }

    result = []
    for b in batches:
        b_id = str(b["_id"])
        total_members = counts_map.get(b["passing_year"], 0)

        c_profiles = []
        for c in b.get("coordinators", []):
            cid = str(c)
            if cid in coords_map:
                c_profiles.append(coords_map[cid])

        result.append(BatchResponse(
            id=b_id,
            school_id=school_id,
            name=b["name"],
            passing_year=b["passing_year"],
            description=b.get("description"),
            coordinators=b.get("coordinators", []),
            coordinator_profiles=c_profiles,
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
        coordinator_profiles=[],
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

    c_profiles = []
    coord_ids = []
    for c in batch.get("coordinators", []):
        if isinstance(c, str):
            try:
                coord_ids.append(ObjectId(c))
            except Exception:
                coord_ids.append(c)

    if coord_ids:
        coord_alumni = await db.alumni.find({"_id": {"$in": coord_ids}}).to_list(length=len(coord_ids))
        for ca in coord_alumni:
            c_profiles.append({
                "id": str(ca["_id"]),
                "full_name": ca.get("full_name", "Coordinator"),
                "profile_photo_url": ca.get("profile_photo_url"),
                "mobile": ca.get("mobile"),
                "email": ca.get("email")
            })

    return BatchResponse(
        id=str(batch["_id"]),
        school_id=school_id,
        name=batch["name"],
        passing_year=batch["passing_year"],
        description=batch.get("description"),
        coordinators=batch.get("coordinators", []),
        coordinator_profiles=c_profiles,
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
