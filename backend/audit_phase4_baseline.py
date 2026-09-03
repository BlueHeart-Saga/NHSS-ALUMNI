import asyncio
import time
import httpx
from app.main import app

async def run_baseline_audit():
    print("==================================================")
    print(" PHASE 4 BASELINE AUDIT & MEASUREMENTS ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection, get_db
    await connect_to_mongo()

    db = get_db()
    
    # 1. Environment & DB info
    client_info = await db.command("buildInfo")
    print(f" Environment: development")
    print(f" Database Name: {db.name}")
    print(f" Database Version: {client_info.get('version')}")

    endpoints = [
        ("/api/v1/public/stats", "Public Stats"),
        ("/api/v1/public/events", "Public Events"),
        ("/api/v1/public/batches", "Public Batches"),
        ("/api/v1/public/past-events", "Public Past Events"),
        ("/api/v1/public/announcements", "Public Announcements"),
        ("/api/v1/public/highlights", "Public Highlights")
    ]

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        print("\n--- 1. ENDPOINT BASELINE RESPONSE TIME & SIZE ---")
        total_json_bytes = 0
        largest_size = 0
        largest_name = ""

        for path, name in endpoints:
            start = time.perf_counter()
            r = await client.get(path)
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            content_len = len(r.content)
            total_json_bytes += content_len
            if content_len > largest_size:
                largest_size = content_len
                largest_name = name

            encoding = r.headers.get("content-encoding", "none")
            cache_ctrl = r.headers.get("cache-control", "none")
            print(f"  -> {name} ({path}): status={r.status_code}, time={duration_ms}ms, size={content_len} bytes, encoding={encoding}, cache={cache_ctrl}")

        print(f"\n  Total HomePage JSON transferred: {total_json_bytes} bytes")
        print(f"  Largest JSON response: {largest_name} ({largest_size} bytes)")

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_baseline_audit())
