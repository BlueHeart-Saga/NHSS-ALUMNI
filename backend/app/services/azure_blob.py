import io
import os
import uuid
import time
import asyncio
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
        """Resizes and compresses image to WebP format with timing instrumentation."""
        start_time = time.perf_counter()
        try:
            img = Image.open(io.BytesIO(file_bytes))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            output = io.BytesIO()
            img.save(output, format="WEBP", quality=quality, optimize=True)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info(f"operation=image_resize duration_ms={duration_ms} max_dim={max_dimension}")
            return output.getvalue(), "image/webp"
        except Exception as e:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(f"operation=image_resize_error duration_ms={duration_ms} error={e}")
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
        
        # Move CPU-bound image compression off the asyncio event loop thread using asyncio.to_thread
        main_bytes, main_mime = await asyncio.to_thread(self.process_and_compress_image, file_content, 1600, 85)
        thumb_bytes, thumb_mime = await asyncio.to_thread(self.process_and_compress_image, file_content, 400, 75)

        s_id = school_id or "general"
        e_id = event_id or "general"

        blob_path_main = f"{s_id}/{e_id}/{unique_id}.webp"
        blob_path_thumb = f"{s_id}/{e_id}/{unique_id}_thumb.webp"

        if self.use_azure:
            try:
                from azure.storage.blob import ContentSettings
                start_time = time.perf_counter()
                
                cnt_settings_main = ContentSettings(content_type=main_mime, cache_control="public, max-age=31536000, immutable")
                client_main = self.container_client.get_blob_client(blob_path_main)
                await asyncio.to_thread(client_main.upload_blob, main_bytes, overwrite=True, content_settings=cnt_settings_main)

                cnt_settings_thumb = ContentSettings(content_type=thumb_mime, cache_control="public, max-age=31536000, immutable")
                client_thumb = self.container_client.get_blob_client(blob_path_thumb)
                await asyncio.to_thread(client_thumb.upload_blob, thumb_bytes, overwrite=True, content_settings=cnt_settings_thumb)

                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                logger.info(f"operation=azure_blob_upload duration_ms={duration_ms}")

                main_url = f"{settings.AZURE_CDN_URL.rstrip('/')}/{blob_path_main}" if settings.AZURE_CDN_URL else client_main.url
                thumb_url = f"{settings.AZURE_CDN_URL.rstrip('/')}/{blob_path_thumb}" if settings.AZURE_CDN_URL else client_thumb.url

                return main_url, thumb_url, blob_path_main

            except Exception as e:
                logger.error(f"Azure blob upload error: {e}, falling back to MongoDB GridFS database storage")

        # MongoDB GridFS Database Storage (Zero local disk file saving)
        main_url = await save_to_gridfs(main_bytes, f"{unique_id}.webp", main_mime)
        thumb_url = await save_to_gridfs(thumb_bytes, f"{unique_id}_thumb.webp", thumb_mime)

        return main_url, thumb_url, blob_path_main

    async def upload_raw_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str = "application/octet-stream",
        school_id: Optional[str] = "general"
    ) -> str:
        """Uploads generic raw file (videos, documents, etc.) to Azure Blob Storage or MongoDB GridFS fallback."""
        unique_id = uuid.uuid4().hex
        ext = os.path.splitext(filename)[1] or ""
        s_id = school_id or "general"
        blob_path = f"{s_id}/raw/{unique_id}{ext}"

        if self.use_azure:
            try:
                from azure.storage.blob import ContentSettings
                start_time = time.perf_counter()
                client = self.container_client.get_blob_client(blob_path)
                cnt_settings = ContentSettings(content_type=content_type, cache_control="public, max-age=31536000, immutable")
                await asyncio.to_thread(client.upload_blob, file_content, overwrite=True, content_settings=cnt_settings)
                
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                logger.info(f"operation=azure_raw_upload duration_ms={duration_ms}")

                return f"{settings.AZURE_CDN_URL.rstrip('/')}/{blob_path}" if settings.AZURE_CDN_URL else client.url
            except Exception as e:
                logger.error(f"Azure raw blob upload error: {e}, falling back to MongoDB GridFS")

        return await save_to_gridfs(file_content, f"{unique_id}{ext}", content_type)

blob_service = BlobStorageService()

