from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from bson import ObjectId
from app.core.database import get_db
from app.middleware.auth import get_current_user, require_roles

router = APIRouter(prefix="/documents", tags=["Document Requests"])

class CreateDocumentRequest(BaseModel):
    doc_type: str  # Transfer Certificate (TC), Character Certificate, Marksheet Copy, Official Transcript, Alumni Membership Certificate
    reason: str
    remarks: Optional[str] = None

class UpdateDocumentRequestStatus(BaseModel):
    status: str  # PENDING, IN_REVIEW, APPROVED, COMPLETED, READY_FOR_PICKUP, REJECTED
    admin_remarks: Optional[str] = None

@router.post("/requests", status_code=status.HTTP_201_CREATED)
async def create_document_request(
    data: CreateDocumentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Submit a official document request from alumni to school administration."""
    db = get_db()
    alumni_id = current_user.get("id") or current_user.get("user_id")
    school_id = current_user.get("school_id")

    req_doc = {
        "alumni_id": str(alumni_id),
        "school_id": school_id,
        "full_name": current_user.get("full_name") or current_user.get("name", "Alumni Member"),
        "email": current_user.get("email"),
        "mobile": current_user.get("mobile"),
        "passing_year": current_user.get("passing_year"),
        "doc_type": data.doc_type,
        "reason": data.reason,
        "remarks": data.remarks,
        "status": "PENDING",
        "expected_date": "Within 5-7 Working Days",
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    }

    res = await db.document_requests.insert_one(req_doc)
    req_doc["id"] = str(res.inserted_id)
    if "_id" in req_doc:
        del req_doc["_id"]
    return req_doc

@router.get("/requests")
async def list_my_document_requests(current_user: dict = Depends(get_current_user)):
    """List document requests submitted by logged in alumnus."""
    db = get_db()
    alumni_id = current_user.get("id") or current_user.get("user_id")

    cursor = db.document_requests.find({"alumni_id": str(alumni_id)}).sort("created_at", -1)
    requests = []
    async for d in cursor:
        d["id"] = str(d["_id"])
        del d["_id"]
        requests.append(d)
    return requests

@router.get("/admin/requests")
async def list_all_document_requests(
    status: Optional[str] = Query(None),
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "DEVELOPER"]))
):
    """School Admin view of all incoming document requests from alumni."""
    db = get_db()
    school_id = current_user.get("school_id")

    query = {}
    if school_id:
        query["$or"] = [{"school_id": school_id}, {"school_id": {"$exists": False}}, {"school_id": None}]
    if status and status != "ALL":
        query["status"] = status

    cursor = db.document_requests.find(query).sort("created_at", -1)
    requests = []
    async for d in cursor:
        d["id"] = str(d["_id"])
        del d["_id"]
        requests.append(d)
    return requests

@router.put("/admin/requests/{request_id}")
async def update_document_request_status(
    request_id: str,
    data: UpdateDocumentRequestStatus,
    current_user: dict = Depends(require_roles(["SCHOOL_ADMIN", "DEVELOPER"]))
):
    """Update status of a document request (School Admin)."""
    db = get_db()
    try:
        obj_id = ObjectId(request_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request ID format")

    update_fields = {"status": data.status}
    if data.admin_remarks is not None:
        update_fields["admin_remarks"] = data.admin_remarks
    update_fields["updated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    result = await db.document_requests.update_one({"_id": obj_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document request not found")

    updated = await db.document_requests.find_one({"_id": obj_id})
    updated["id"] = str(updated["_id"])
    del updated["_id"]
    return updated
