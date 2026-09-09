import os
import requests
from pathlib import Path

FOLDER_PATH = r"C:\Users\mani\Downloads\முன்னாள் மாணவர் சங்கம் துவக்க விழா 06.09.2026-1-001\முன்னாள் மாணவர் சங்கம் துவக்க விழா 06.09.2026"
BASE_URL = "http://127.0.0.1:8000/api/v1"

def main():
    folder = Path(FOLDER_PATH)
    if not folder.exists():
        print("Folder not found!")
        return

    image_files = sorted([
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']
    ])

    print(f"Found {len(image_files)} image files.")

    # Find cover image
    cover_file = None
    for f in image_files:
        if f.name.lower() == 'school.png':
            cover_file = f
            break
    if not cover_file:
        cover_file = image_files[0]

    uploaded_urls = []
    cover_url = ""

    print("Uploading images via backend API...")
    for idx, img_path in enumerate(image_files, 1):
        try:
            with open(img_path, 'rb') as f:
                ext = img_path.suffix.lower()
                mime = "image/png" if ext == ".png" else "image/jpeg"
                files = {'file': (img_path.name, f, mime)}
                resp = requests.post(f"{BASE_URL}/memories/upload", files=files, timeout=30)
                if resp.status_code == 200:
                    data = resp.json()
                    url = data.get('url')
                    uploaded_urls.append(url)
                    if img_path == cover_file:
                        cover_url = url
                    print(f"[{idx}/{len(image_files)}] Uploaded {img_path.name} -> {url}")
                else:
                    print(f"[{idx}/{len(image_files)}] Failed {img_path.name}: {resp.status_code} {resp.text}")
        except Exception as e:
            print(f"[{idx}/{len(image_files)}] Error {img_path.name}: {e}")

    if not cover_url and uploaded_urls:
        cover_url = uploaded_urls[0]

    # Create memory document via API
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
        print("\n========================================================")
        print("SUCCESS! Created Album in MongoDB via backend API!")
        print(f"Memory Record ID: {result.get('id')}")
        print(f"Total Photos Uploaded: {len(uploaded_urls)}")
        print(f"Cover Photo URL: {cover_url}")
        print("========================================================\n")
    else:
        print(f"Failed to create memory record: {create_resp.status_code} {create_resp.text}")

if __name__ == "__main__":
    main()
