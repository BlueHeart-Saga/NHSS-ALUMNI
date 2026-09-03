import asyncio
import time
from PIL import Image
import io
from app.services.azure_blob import blob_service

async def test_image_offloading():
    print("==================================================")
    print(" TESTING PILLOW & BLOB STORAGE UNBLOCKING ")
    print("==================================================")

    # Generate a sample 2000x2000 test image in memory
    img = Image.new("RGB", (2000, 2000), color="red")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    file_bytes = buf.getvalue()

    print(f"\n1. Generated 2000x2000 JPEG image ({len(file_bytes)} bytes)")
    
    start = time.perf_counter()
    image_url, thumb_url, blob_path = await blob_service.upload_image(
        file_content=file_bytes,
        filename="test_sample.jpg",
        content_type="image/jpeg",
        school_id="test_school",
        event_id="test_event"
    )
    duration_ms = round((time.perf_counter() - start) * 1000, 2)

    print(f"2. Image Upload & Dual Resizing (1600 & 400 WebP) Completed in: {duration_ms} ms")
    print(f"   -> Main URL: {image_url}")
    print(f"   -> Thumb URL: {thumb_url}")
    print(f"   -> Path: {blob_path}")

    assert image_url and len(image_url) > 0
    assert thumb_url and len(thumb_url) > 0
    print("\n==================================================")
    print(" PILLOW & BLOB STORAGE TEST PASSED SUCCESSFULLY ")
    print("==================================================")

if __name__ == "__main__":
    from app.core.database import connect_to_mongo, close_mongo_connection
    async def run():
        await connect_to_mongo()
        try:
            await test_image_offloading()
        finally:
            await close_mongo_connection()
    asyncio.run(run())
