from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from bson import ObjectId
from app.core.database import get_db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/community", tags=["Community Forums"])

class CreateCommunityPostRequest(BaseModel):
    category: str  # General, Tech & AI, Career & Jobs, Entrepreneurship, School Nostalgia
    title: str
    content: str

@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_community_post(
    data: CreateCommunityPostRequest,
    current_user: dict = Depends(get_current_user)
):
    """Publish a new post on the alumni community forum."""
    db = get_db()
    alumni_id = current_user.get("id") or current_user.get("user_id")

    post_doc = {
        "author_id": str(alumni_id),
        "author_name": current_user.get("full_name") or current_user.get("name", "Alumni Member"),
        "author_year": current_user.get("passing_year", 2010),
        "author_photo_url": current_user.get("profile_photo_url", ""),
        "category": data.category,
        "title": data.title,
        "content": data.content,
        "likes": 0,
        "liked_by": [],
        "comments": [],
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    }

    res = await db.community_posts.insert_one(post_doc)
    post_doc["id"] = str(res.inserted_id)
    if "_id" in post_doc:
        del post_doc["_id"]
    return post_doc

@router.get("/posts")
async def list_community_posts(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """List community discussion posts."""
    db = get_db()
    query = {}
    if category and category != "ALL":
        query["category"] = category

    cursor = db.community_posts.find(query).sort("created_at", -1)
    posts = []
    user_id = str(current_user.get("id") or current_user.get("user_id"))

    async for p in cursor:
        p["id"] = str(p["_id"])
        del p["_id"]
        p["isLiked"] = user_id in p.get("liked_by", [])
        posts.append(p)
    return posts

@router.post("/posts/{post_id}/like")
async def toggle_like_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Toggle like state for a community post."""
    db = get_db()
    try:
        obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

    user_id = str(current_user.get("id") or current_user.get("user_id"))
    post = await db.community_posts.find_one({"_id": obj_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    liked_by = post.get("liked_by", [])
    if user_id in liked_by:
        liked_by.remove(user_id)
    else:
        liked_by.append(user_id)

    likes_count = len(liked_by)
    await db.community_posts.update_one(
        {"_id": obj_id},
        {"$set": {"liked_by": liked_by, "likes": likes_count}}
    )

    return {"success": True, "likes": likes_count, "isLiked": user_id in liked_by}
