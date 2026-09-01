from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_db
from app.schemas.models import (
    CreateBatchRequest, BatchResponse, AssignCoordinatorRequest, UserProfileResponse,
    AssignCommitteeRoleRequest, CommitteeMemberResponse, BatchCommitteeRoleCount, BatchCommitteeResponse
)
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/batches", tags=["Batches Management"])

COMMITTEE_ROLES_CONFIG = {
    "PRESIDENT": {"title": "President / Chairman", "max_quota": 1},
    "VICE_PRESIDENT": {"title": "Vice President / Vice Chairman", "max_quota": 2},
    "SECRETARY": {"title": "Secretary", "max_quota": 1},
    "JOINT_SECRETARY": {"title": "Joint / Assistant Secretary", "max_quota": 2},
    "TREASURER": {"title": "Treasurer", "max_quota": 1},
    "EXECUTIVE_MEMBER": {"title": "Executive / Committee Member", "max_quota": 8},
}

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
        "committee_members": [],
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

    # Build map of committee roles from batch document
    committee_members = batch.get("committee_members", [])
    committee_map = {m["alumni_id"]: m.get("role") for m in committee_members if m.get("alumni_id")}

    res = []
    for a in alumni_list:
        a_id = str(a["_id"])

        # Check user roles
        user = await db.users.find_one({"_id": ObjectId(a["user_id"])}) if a.get("user_id") else None
        roles = user.get("roles", ["ALUMNI"]) if user else ["ALUMNI"]

        c_role = a.get("committee_role") or committee_map.get(a_id)
        c_title = COMMITTEE_ROLES_CONFIG.get(c_role, {}).get("title") if c_role else None

        res.append(UserProfileResponse(
            id=a_id,
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
            committee_role=c_role,
            committee_role_title=c_title,
            email_visible=a.get("email_visible", False),
            created_at=a.get("created_at", datetime.now(timezone.utc))
        ))
    return res

@router.get("/{batch_id}/committee", response_model=BatchCommitteeResponse)
async def get_batch_committee(batch_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    school_id = current_user["school_id"]

    batch = await db.batches.find_one({"_id": ObjectId(batch_id), "school_id": school_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    committee_members_list = batch.get("committee_members", [])

    # Collect alumni details
    alumni_ids = []
    for cm in committee_members_list:
        try:
            alumni_ids.append(ObjectId(cm["alumni_id"]))
        except Exception:
            alumni_ids.append(cm["alumni_id"])

    alumni_map = {}
    if alumni_ids:
        found_alumni = await db.alumni.find({"_id": {"$in": alumni_ids}}).to_list(length=len(alumni_ids))
        for fa in found_alumni:
            alumni_map[str(fa["_id"])] = fa

    role_counts = {role_key: 0 for role_key in COMMITTEE_ROLES_CONFIG.keys()}
    member_responses = []

    for cm in committee_members_list:
        aid = str(cm["alumni_id"])
        role_key = cm.get("role")
        if role_key in role_counts:
            role_counts[role_key] += 1

        fa = alumni_map.get(aid, {})
        role_title = COMMITTEE_ROLES_CONFIG.get(role_key, {}).get("title", role_key)

        member_responses.append(CommitteeMemberResponse(
            alumni_id=aid,
            full_name=fa.get("full_name", "Committee Member"),
            profile_photo_url=fa.get("profile_photo_url"),
            mobile=fa.get("mobile") if fa.get("email_visible") or "SCHOOL_ADMIN" in current_user["roles"] else "***",
            email=fa.get("email") if fa.get("email_visible") or "SCHOOL_ADMIN" in current_user["roles"] else "***",
            role=role_key,
            role_title=role_title,
            assigned_at=cm.get("assigned_at")
        ))

    roles_summary = [
        BatchCommitteeRoleCount(
            role=r_key,
            role_title=r_info["title"],
            max_quota=r_info["max_quota"],
            filled_count=role_counts.get(r_key, 0)
        )
        for r_key, r_info in COMMITTEE_ROLES_CONFIG.items()
    ]

    total_filled = sum(role_counts.values())

    return BatchCommitteeResponse(
        batch_id=str(batch["_id"]),
        batch_name=batch["name"],
        passing_year=batch["passing_year"],
        total_positions=15,
        total_filled=total_filled,
        roles_summary=roles_summary,
        members=member_responses
    )

@router.post("/{batch_id}/committee")
async def assign_committee_role(
    batch_id: str,
    request: AssignCommitteeRoleRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    batch = await db.batches.find_one({"_id": ObjectId(batch_id), "school_id": school_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    alumni = await db.alumni.find_one({"_id": ObjectId(request.alumni_id)})
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni record not found")

    role_key = request.role
    if role_key != "NORMAL_MEMBER" and role_key not in COMMITTEE_ROLES_CONFIG:
        raise HTTPException(status_code=400, detail=f"Invalid committee role: {role_key}")

    existing_committee = batch.get("committee_members", [])

    # If assigning NORMAL_MEMBER, remove from committee
    if role_key == "NORMAL_MEMBER":
        updated_committee = [m for m in existing_committee if m.get("alumni_id") != request.alumni_id]
        await db.batches.update_one(
            {"_id": batch["_id"]},
            {"$set": {"committee_members": updated_committee}, "$pull": {"coordinators": request.alumni_id}}
        )
        await db.alumni.update_one(
            {"_id": alumni["_id"]},
            {"$unset": {"committee_role": ""}}
        )
        return {"success": True, "message": f"{alumni['full_name']} role updated to Alumni Member"}

    # Quota validation check
    role_info = COMMITTEE_ROLES_CONFIG[role_key]
    max_quota = role_info["max_quota"]
    role_title = role_info["title"]

    # Filter out current alumnus if they are being re-assigned
    other_members_in_role = [
        m for m in existing_committee
        if m.get("role") == role_key and m.get("alumni_id") != request.alumni_id
    ]

    if len(other_members_in_role) >= max_quota:
        raise HTTPException(
            status_code=400,
            detail=f"Position limit reached for '{role_title}'. Maximum allowed: {max_quota}."
        )

    # Remove previous entry for this alumnus if any
    updated_committee = [m for m in existing_committee if m.get("alumni_id") != request.alumni_id]
    updated_committee.append({
        "alumni_id": request.alumni_id,
        "role": role_key,
        "assigned_at": datetime.now(timezone.utc)
    })

    # Update Batch
    await db.batches.update_one(
        {"_id": batch["_id"]},
        {
            "$set": {"committee_members": updated_committee},
            "$addToSet": {"coordinators": request.alumni_id}
        }
    )

    # Update Alumni
    await db.alumni.update_one(
        {"_id": alumni["_id"]},
        {"$set": {"committee_role": role_key}}
    )

    # Grant User BATCH_COORDINATOR role if user_id exists
    u_id = alumni.get("user_id")
    if u_id:
        try:
            await db.users.update_one(
                {"_id": ObjectId(u_id)},
                {"$addToSet": {"roles": "BATCH_COORDINATOR"}}
            )
        except Exception:
            pass

    return {
        "success": True,
        "message": f"{alumni['full_name']} has been appointed as {role_title} for {batch['name']}"
    }

@router.delete("/{batch_id}/committee/{alumni_id}")
async def remove_committee_role(
    batch_id: str,
    alumni_id: str,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    db = get_db()
    school_id = current_user["school_id"]

    batch = await db.batches.find_one({"_id": ObjectId(batch_id), "school_id": school_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    existing_committee = batch.get("committee_members", [])
    updated_committee = [m for m in existing_committee if m.get("alumni_id") != alumni_id]

    await db.batches.update_one(
        {"_id": batch["_id"]},
        {
            "$set": {"committee_members": updated_committee},
            "$pull": {"coordinators": alumni_id}
        }
    )

    try:
        await db.alumni.update_one(
            {"_id": ObjectId(alumni_id)},
            {"$unset": {"committee_role": ""}}
        )
    except Exception:
        pass

    return {"success": True, "message": "Committee role removed successfully"}

@router.post("/{batch_id}/coordinators")
async def assign_coordinator(
    batch_id: str,
    request: AssignCoordinatorRequest,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN"]))
):
    return await assign_committee_role(
        batch_id=batch_id,
        request=AssignCommitteeRoleRequest(alumni_id=request.alumni_id, role="EXECUTIVE_MEMBER"),
        current_user=current_user
    )

