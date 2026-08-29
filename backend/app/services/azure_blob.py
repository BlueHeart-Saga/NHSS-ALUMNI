import os
import io
import uuid
import logging
from typing import Tuple, Optional
from PIL import Image
from app.core.config import settings

logger = logging.getLogger("app.azure_blob")

# Local media fallback directory
MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(MEDIA_DIR, exist_ok=True)

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
                logger.warning(f"Failed to initialize Azure Blob Storage, using local fallback: {e}")
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
        """Uploads main image & thumbnail, returns (image_url, thumbnail_url, blob_path)"""
        
        unique_id = uuid.uuid4().hex
        main_bytes, main_mime = self.process_and_compress_image(file_content, max_dimension=1600, quality=85)
        thumb_bytes, thumb_mime = self.process_and_compress_image(file_content, max_dimension=400, quality=75)

        s_id = school_id or "general"
        e_id = event_id or "general"

        blob_path_main = f"{s_id}/{e_id}/{unique_id}.webp"
        blob_path_thumb = f"{s_id}/{e_id}/{unique_id}_thumb.webp"

        if self.use_azure:
            try:
                # Upload Main Image
                client_main = self.container_client.get_blob_client(blob_path_main)
                client_main.upload_blob(main_bytes, overwrite=True, content_type=main_mime)

                # Upload Thumbnail
                client_thumb = self.container_client.get_blob_client(blob_path_thumb)
                client_thumb.upload_blob(thumb_bytes, overwrite=True, content_type=thumb_mime)

                return client_main.url, client_thumb.url, blob_path_main
            except Exception as e:
                logger.error(f"Azure blob upload error: {e}, falling back to local file storage")

        # Local fallback
        local_main_filename = f"{unique_id}.webp"
        local_thumb_filename = f"{unique_id}_thumb.webp"

        file_path_main = os.path.join(MEDIA_DIR, local_main_filename)
        file_path_thumb = os.path.join(MEDIA_DIR, local_thumb_filename)

        with open(file_path_main, "wb") as f:
            f.write(main_bytes)
        with open(file_path_thumb, "wb") as f:
            f.write(thumb_bytes)

        image_url = f"http://localhost:{settings.PORT}/uploads/{local_main_filename}"
        thumbnail_url = f"http://localhost:{settings.PORT}/uploads/{local_thumb_filename}"

        return image_url, thumbnail_url, blob_path_main

blob_service = BlobStorageService()
