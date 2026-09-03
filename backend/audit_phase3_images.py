import asyncio
from app.core.database import connect_to_mongo, close_mongo_connection, get_db

async def audit_image_urls():
    db = get_db()
    print("==================================================")
    print(" PHASE 3 IMAGE URL AUDIT ACROSS ALL COLLECTIONS ")
    print("==================================================")

    url_categories = {
        "azure_cdn": 0,
        "gridfs_files": 0,
        "static_local": 0,
        "ui_avatars": 0,
        "empty_null": 0,
        "other_external": 0
    }

    total_images_found = 0

    def categorize_url(url_str: str):
        nonlocal total_images_found
        if not url_str:
            url_categories["empty_null"] += 1
            return
        
        total_images_found += 1
        url = str(url_str).strip()
        if "blob.core.windows.net" in url:
            url_categories["azure_cdn"] += 1
        elif "/api/v1/files/" in url:
            url_categories["gridfs_files"] += 1
        elif url.startswith("/assets/") or url.startswith("/school-images/") or url.startswith("/local-profiles"):
            url_categories["static_local"] += 1
        elif "ui-avatars.com" in url or "gravatar.com" in url:
            url_categories["ui_avatars"] += 1
        else:
            url_categories["other_external"] += 1

    # 1. Audit alumni collection
    alumni = await db.alumni.find({}).to_list(1000)
    print(f"\n1. Alumni Collection ({len(alumni)} documents):")
    for a in alumni:
        categorize_url(a.get("profile_photo_url"))

    # 2. Audit users collection
    users = await db.users.find({}).to_list(1000)
    print(f"2. Users Collection ({len(users)} documents):")
    for u in users:
        categorize_url(u.get("profile_photo_url"))

    # 3. Audit schools collection
    schools = await db.schools.find({}).to_list(100)
    print(f"3. Schools Collection ({len(schools)} documents):")
    for s in schools:
        categorize_url(s.get("logo_url"))
        categorize_url(s.get("cover_url"))

    # 4. Audit events collection
    events = await db.events.find({}).to_list(500)
    print(f"4. Events Collection ({len(events)} documents):")
    for e in events:
        categorize_url(e.get("cover_image_url"))
        categorize_url(e.get("cover_image_url_ta"))

    # 5. Audit memories collection
    memories = await db.memories.find({}).to_list(500)
    print(f"5. Memories Collection ({len(memories)} documents):")
    for m in memories:
        categorize_url(m.get("image_url"))
        categorize_url(m.get("cover_image_url"))
        for url in m.get("media_urls", []):
            categorize_url(url)

    # 6. Audit rank_holders collection
    rank_holders = await db.rank_holders.find({}).to_list(200)
    print(f"6. Rank Holders Collection ({len(rank_holders)} documents):")
    for r in rank_holders:
        categorize_url(r.get("photograph"))

    # 7. Audit association_team collection
    team = await db.association_team.find({}).to_list(200)
    print(f"7. Association Team Collection ({len(team)} documents):")
    for t in team:
        categorize_url(t.get("photo_url"))

    print("\n--------------------------------------------------")
    print(" SUMMARY OF IMAGE URL CATEGORIES:")
    print("--------------------------------------------------")
    print(f"  Total Image References Examined : {total_images_found}")
    print(f"  A. Direct Azure Blob / CDN URLs : {url_categories['azure_cdn']}")
    print(f"  B. MongoDB GridFS (/files/...)  : {url_categories['gridfs_files']}")
    print(f"  C. Static Local Asset URLs      : {url_categories['static_local']}")
    print(f"  D. UI Avatars Placeholder URLs  : {url_categories['ui_avatars']}")
    print(f"  E. Other External URLs          : {url_categories['other_external']}")
    print(f"  Empty / Null Fields             : {url_categories['empty_null']}")

    if total_images_found > 0:
        azure_pct = (url_categories['azure_cdn'] / total_images_found) * 100
        gridfs_pct = (url_categories['gridfs_files'] / total_images_found) * 100
        static_pct = (url_categories['static_local'] / total_images_found) * 100
        avatar_pct = (url_categories['ui_avatars'] / total_images_found) * 100
        print(f"\n  Percentage Breakdown:")
        print(f"    - Azure Blob / CDN : {azure_pct:.1f}%")
        print(f"    - GridFS Storage   : {gridfs_pct:.1f}%")
        print(f"    - Static Local     : {static_pct:.1f}%")
        print(f"    - UI Avatars       : {avatar_pct:.1f}%")
    print("==================================================")

if __name__ == "__main__":
    async def main():
        await connect_to_mongo()
        try:
            await audit_image_urls()
        finally:
            await close_mongo_connection()
    asyncio.run(main())
