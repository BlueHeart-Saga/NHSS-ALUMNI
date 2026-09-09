import os
import io
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image

FOLDER_PATH = r"C:\Users\mani\Downloads\முன்னாள் மாணவர் சங்கம் துவக்க விழா 06.09.2026-1-001\முன்னாள் மாணவர் சங்கம் துவக்க விழா 06.09.2026"
BASE_URL = "http://127.0.0.1:8000/api/v1"

def compress_image(img_path, max_dim=1600, quality=80):
    try:
        with Image.open(img_path) as img:
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            out = io.BytesIO()
            img.save(out, format="JPEG", quality=quality, optimize=True)
            return out.getvalue()
    except Exception as e:
        with open(img_path, "rb") as f:
            return f.read()

def upload_single_file(img_path):
    try:
        content = compress_image(img_path)
        files = {'file': (img_path.name, content, 'image/jpeg')}
        resp = requests.post(f"{BASE_URL}/memories/upload", files=files, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            return img_path, data.get('url')
        else:
            print(f"Failed {img_path.name}: {resp.status_code}", flush=True)
            return img_path, None
    except Exception as e:
        print(f"Error {img_path.name}: {e}", flush=True)
        return img_path, None

def main():
    folder = Path(FOLDER_PATH)
    if not folder.exists():
        print("Folder not found!", flush=True)
        return

    image_files = sorted([
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']
    ])

    print(f"Found {len(image_files)} image files. Compressing & uploading with 8 threads...", flush=True)

    cover_file = None
    for f in image_files:
        if f.name.lower() == 'school.png':
            cover_file = f
            break
    if not cover_file:
        cover_file = image_files[0]

    uploaded_map = {}
    completed_count = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(upload_single_file, img_path): img_path for img_path in image_files}
        for future in as_completed(futures):
            img_path, url = future.result()
            completed_count += 1
            if url:
                uploaded_map[img_path.name] = url
                print(f"[{completed_count}/{len(image_files)}] Uploaded {img_path.name} -> {url}", flush=True)

    # Sort URLs according to original file order
    uploaded_urls = [uploaded_map[f.name] for f in image_files if f.name in uploaded_map]
    cover_url = uploaded_map.get(cover_file.name, uploaded_urls[0] if uploaded_urls else "")

    print(f"\nAll {len(uploaded_urls)} images uploaded successfully!", flush=True)
    print("Creating Album memory record in MongoDB...", flush=True)

    payload = {
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
        "status": "APPROVED"
    }

    create_resp = requests.post(f"{BASE_URL}/memories", json=payload, timeout=15)
    if create_resp.status_code == 200:
        result = create_resp.json()
        print("\n========================================================", flush=True)
        print("SUCCESS! Created Album in MongoDB via backend API!", flush=True)
        print(f"Memory Record ID: {result.get('id')}", flush=True)
        print(f"Total Photos Uploaded: {len(uploaded_urls)}", flush=True)
        print(f"Cover Photo URL: {cover_url}", flush=True)
        print("========================================================\n", flush=True)
    else:
        print(f"Failed to create memory record: {create_resp.status_code} {create_resp.text}", flush=True)

if __name__ == "__main__":
    main()
