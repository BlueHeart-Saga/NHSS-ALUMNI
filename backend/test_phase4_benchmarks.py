import asyncio
import time
import statistics
import httpx
from app.main import app
from app.core.security import create_access_token
from bson import ObjectId

async def run_phase4_benchmarks():
    print("==================================================")
    print(" PHASE 4 PERFORMANCE BENCHMARKS & COMPRESSION AUDIT ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection, get_db
    await connect_to_mongo()

    db = get_db()
    
    # Environment Check
    client_info = await db.command("buildInfo")
    print(f" Environment       : development")
    print(f" Database Name     : {db.name}")
    print(f" Mongo Version     : {client_info.get('version')}")

    # Find sample user for auth test
    user = await db.users.find_one({})
    auth_token = None
    if user:
        user_id_str = str(user["_id"])
        auth_token = create_access_token({"sub": user_id_str, "roles": ["ALUMNI"]})
        print(f" Sample Auth User  : {user_id_str} ({user.get('mobile', 'No mobile')})")

    public_endpoints = [
        ("/api/v1/public/stats", "Public Stats"),
        ("/api/v1/public/events", "Public Events"),
        ("/api/v1/public/batches", "Public Batches"),
        ("/api/v1/public/past-events", "Public Past Events"),
        ("/api/v1/public/announcements", "Public Announcements"),
        ("/api/v1/public/highlights", "Public Highlights")
    ]

    headers_gzip = {"Accept-Encoding": "gzip"}

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test", headers=headers_gzip) as client:
        print("\n--- 1. HTTP RESPONSE COMPRESSION & CACHE HEADERS ---")
        total_compressed_bytes = 0

        for path, name in public_endpoints:
            start = time.perf_counter()
            r = await client.get(path)
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            content_len = len(r.content)
            total_compressed_bytes += content_len

            encoding = r.headers.get("content-encoding", "none")
            cache_ctrl = r.headers.get("cache-control", "none")
            print(f"  -> {name} ({path}): status={r.status_code}, time={duration_ms}ms, compressed_size={content_len} bytes, encoding={encoding}, cache-control={cache_ctrl}")

        print(f"\n  Total HomePage Compressed JSON Transferred: {total_compressed_bytes} bytes")

        print("\n--- 2. AUTHENTICATION LATENCY & CONCURRENCY (get_current_user) ---")
        if auth_token:
            auth_headers = {"Authorization": f"Bearer {auth_token}", "Accept-Encoding": "gzip"}
            
            for concurrency in [1, 5, 10]:
                latencies = []
                start_batch = time.perf_counter()
                
                async def fetch_me():
                    t0 = time.perf_counter()
                    res = await client.get("/api/v1/auth/me", headers=auth_headers)
                    t1 = time.perf_counter()
                    latencies.append((t1 - t0) * 1000)
                    assert res.status_code in [200, 401]

                await asyncio.gather(*[fetch_me() for _ in range(concurrency)])
                total_batch_ms = (time.perf_counter() - start_batch) * 1000
                
                avg_ms = round(statistics.mean(latencies), 2)
                p50_ms = round(statistics.median(latencies), 2)
                p95_ms = round(sorted(latencies)[int(0.95 * len(latencies))], 2)
                print(f"   -> /auth/me ({concurrency} concurrent): avg={avg_ms}ms, p50={p50_ms}ms, p95={p95_ms}ms, batch_total={round(total_batch_ms, 2)}ms")

        print("\n--- 3. HOMEPAGE PUBLIC API WATERFALL LATENCY & PERCENTILES ---")
        for concurrency in [1, 5, 10]:
            latencies = []
            start_batch = time.perf_counter()

            async def fetch_all_public():
                t0 = time.perf_counter()
                res_list = await asyncio.gather(*[client.get(path) for path, _ in public_endpoints])
                t1 = time.perf_counter()
                latencies.append((t1 - t0) * 1000)
                for r in res_list:
                    assert r.status_code == 200

            await asyncio.gather(*[fetch_all_public() for _ in range(concurrency)])
            total_batch_ms = (time.perf_counter() - start_batch) * 1000

            avg_ms = round(statistics.mean(latencies), 2)
            p50_ms = round(statistics.median(latencies), 2)
            p95_ms = round(sorted(latencies)[int(0.95 * len(latencies))], 2)
            print(f"   -> Full HomePage API Load ({concurrency} concurrent users): avg={avg_ms}ms, p50={p50_ms}ms, p95={p95_ms}ms, batch_total={round(total_batch_ms, 2)}ms")

    print("\n==================================================")
    print(" PHASE 4 BENCHMARKS COMPLETED SUCCESSFULLY ")
    print("==================================================")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_phase4_benchmarks())
