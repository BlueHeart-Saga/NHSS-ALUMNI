import io
import uuid
import logging
from datetime import datetime, timezone
from typing import Tuple, Optional
from PIL import Image
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from app.core.config import settings
from app.core.database import get_db

logger = logging.getLogger("app.azure_blob")

async def save_to_gridfs(file_bytes: bytes, filename: str, content_type: str) -> str:
    """Uploads file content directly to MongoDB GridFS database storage and returns public API URL."""
    db = get_db()
    if db is None:
        raise RuntimeError("Database connection not initialized")

    fs = AsyncIOMotorGridFSBucket(db)
    grid_in = fs.open_upload_stream(
        filename,
        metadata={"contentType": content_type, "uploaded_at": datetime.now(timezone.utc)}
    )
    await grid_in.write(file_bytes)
    await grid_in.close()
    file_id = str(grid_in._id)
    return f"/api/v1/files/{file_id}"

class BlobStorageService:
    def __init__(self):
        self.connection_string = settings.AZURE_STORAGE_CONNECTION_STRING
        self.container_name = settings.AZURE_STORAGE_CONTAINER
        self.use_azure = bool(self.connection_string and self.connection_string.strip())

        if self.use_azure:
            try:
                from azure.storage.blob import BlobServiceClient
                self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
                self.container_client = self.blob_service_client.get_container_client(self.container_name)
                logger.info(f"Azure Blob Storage initialized with container: {self.container_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize Azure Blob Storage, using MongoDB GridFS database storage: {e}")
                self.use_azure = False

    def process_and_compress_image(self, file_bytes: bytes, max_dimension: int = 1600, quality: int = 85) -> Tuple[bytes, str]:
        """Resizes and compresses image to WebP format"""
        try:
            img = Image.open(io.BytesIO(file_bytes))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            output = io.BytesIO()
            img.save(output, format="WEBP", quality=quality, optimize=True)
            return output.getvalue(), "image/webp"
        except Exception as e:
            logger.error(f"Image compression failed, fallback to raw bytes: {e}")
            return file_bytes, "image/jpeg"

    async def upload_image(
        self,
        file_content: bytes,
        filename: str,
        content_type: str = "image/jpeg",
        school_id: Optional[str] = "school",
        event_id: Optional[str] = "event"
    ) -> Tuple[str, str, str]:
        """Uploads main image & thumbnail to Azure or MongoDB GridFS database (zero local disk files)."""
        
        unique_id = uuid.uuid4().hex
        main_bytes, main_mime = self.process_and_compress_image(file_content, max_dimension=1600, quality=85)
        thumb_bytes, thumb_mime = self.process_and_compress_image(file_content, max_dimension=400, quality=75)

        s_id = school_id or "general"
        e_id = event_id or "general"

        blob_path_main = f"{s_id}/{e_id}/{unique_id}.webp"
        blob_path_thumb = f"{s_id}/{e_id}/{unique_id}_thumb.webp"

        if self.use_azure:
            try:
                # Upload Main Image to Azure
                client_main = self.container_client.get_blob_client(blob_path_main)
                client_main.upload_blob(main_bytes, overwrite=True, content_type=main_mime)

                # Upload Thumbnail to Azure
                client_thumb = self.container_client.get_blob_client(blob_path_thumb)
                client_thumb.upload_blob(thumb_bytes, overwrite=True, content_type=thumb_mime)

                return client_main.url, client_thumb.url, blob_path_main
            except Exception as e:
                logger.error(f"Azure blob upload error: {e}, falling back to MongoDB GridFS database storage")

        # MongoDB GridFS Database Storage (Zero local disk file saving)
        main_url = await save_to_gridfs(main_bytes, f"{unique_id}.webp", main_mime)
        thumb_url = await save_to_gridfs(thumb_bytes, f"{unique_id}_thumb.webp", thumb_mime)

        return main_url, thumb_url, blob_path_main

blob_service = BlobStorageService()
