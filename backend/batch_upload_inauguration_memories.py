import os
import sys
import asyncio
from datetime import datetime, timezone
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import get_db, connect_to_mongo
from app.services.azure_blob import blob_service

FOLDER_PATH = r"C:\Users\mani\Downloads\முன்னாள் மாணவர் சங்கம் துவக்க விழா 06.09.2026-1-001\முன்னாள் மாணவர் சங்கம் துவக்க விழா 06.09.2026"

async def batch_upload():
    print("Connecting to MongoDB...", flush=True)
    await connect_to_mongo()
    db = get_db()

    folder = Path(FOLDER_PATH)
    if not folder.exists():
        print(f"Error: Folder {FOLDER_PATH} does not exist!", flush=True)
        return

    # Gather all image files (.jpg, .jpeg, .png, .webp)
    image_files = sorted([
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']
    ])

    print(f"Found {len(image_files)} image files to upload.", flush=True)

    if not image_files:
        print("No image files found.", flush=True)
        return

    # Find cover image (e.g. School.png if available, else first file)
    cover_file = None
    for f in image_files:
        if f.name.lower() == 'school.png':
            cover_file = f
            break
    if not cover_file:
        cover_file = image_files[0]

    print(f"Using cover image: {cover_file.name}", flush=True)

    uploaded_urls = []
    cover_url = ""

    # Process and upload files concurrently in chunks of 5
    chunk_size = 5
    for i in range(0, len(image_files), chunk_size):
        chunk = image_files[i:i+chunk_size]

        async def upload_single(img_path):
            try:
                with open(img_path, 'rb') as f:
                    content = f.read()
                ext = img_path.suffix.lower()
                mime = "image/png" if ext == ".png" else "image/jpeg"
                main_url, thumb_url, _ = await blob_service.upload_image(
                    content,
                    filename=img_path.name,
                    content_type=mime,
                    school_id="school",
                    event_id="inauguration_2026"
                )
                return img_path, main_url
            except Exception as e:
                print(f"Failed {img_path.name}: {e}", flush=True)
                return img_path, None

        results = await asyncio.gather(*[upload_single(p) for p in chunk])
        for img_path, url in results:
            if url:
                uploaded_urls.append(url)
                if img_path == cover_file:
                    cover_url = url
                print(f"Uploaded [{len(uploaded_urls)}/{len(image_files)}] {img_path.name}", flush=True)

    if not cover_url and uploaded_urls:
        cover_url = uploaded_urls[0]

    now = datetime.now(timezone.utc)
    memory_doc = {
        "title": "நடராஜன் மேல்நிலைப்பள்ளி முன்னாள் மாணவர் சங்க தொடக்க விழா",
        "title_ta": "நடராஜன் மேல்நிலைப்பள்ளி முன்னாள் மாணவர் சங்க தொடக்க விழா",
        "album_name": "Natarajan Higher Secondary School Alumni Association Inauguration 2026",
        "media_type": "ALBUM",
        "image_url": cover_url,
        "cover_image_url": cover_url,
        "media_urls": uploaded_urls,
        "description": "Natarajan Higher Secondary School Alumni Association inauguration event news published and celebration photo gallery.",
        "description_ta": "நடராஜன் மேல்நிலைப்பள்ளி முன்னாள் மாணவர் சங்க தொடக்க விழா புகைப்படங்கள் மற்றும் செய்திக் குறிப்பு.",
        "target_audience": "PUBLIC",
        "batch_year": "2026",
        "uploader_name": "School Admin",
        "uploader_email": "admin@school.edu",
        "status": "APPROVED",
        "admin_remarks": "Batch uploaded by School Admin",
        "created_at": now,
        "updated_at": now
    }

    res = await db.memories.insert_one(memory_doc)
    print("\n========================================================", flush=True)
    print(f"SUCCESS! Created Alumni Association Inauguration Album in DB!", flush=True)
    print(f"Memory Record ID: {res.inserted_id}", flush=True)
    print(f"Total Photos Uploaded: {len(uploaded_urls)}", flush=True)
    print(f"Cover Photo URL: {cover_url}", flush=True)
    print("========================================================\n", flush=True)

if __name__ == "__main__":
    asyncio.run(batch_upload())
