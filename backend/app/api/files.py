from fastapi import APIRouter, HTTPException, Response
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from app.core.database import get_db

router = APIRouter(prefix="/files", tags=["Database File Storage"])

@router.get("/{file_id}")
async def get_file_from_database(file_id: str):
    """Retrieve file directly from MongoDB GridFS database storage."""
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection error")

    try:
        obj_id = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file ID format")

    fs = AsyncIOMotorGridFSBucket(db)
    try:
        grid_out = await fs.open_download_stream(obj_id)
        content_type = "application/octet-stream"
        if grid_out.metadata and "contentType" in grid_out.metadata:
            content_type = grid_out.metadata["contentType"]

        contents = await grid_out.read()
        return Response(
            content=contents,
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Disposition": f'inline; filename="{grid_out.filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found in database storage")
