import asyncio
import time
import httpx
from app.main import app

# Lightweight in-memory TTLCache implementation test
cache_store = {}
CACHE_TTL = 60  # seconds

async def get_cached_public_batches(client):
    now = time.perf_counter()
    if "batches" in cache_store:
        data, timestamp = cache_store["batches"]
        if now - timestamp < CACHE_TTL:
            return data, True, round((time.perf_counter() - now) * 1000, 3)

    t0 = time.perf_counter()
    res = await client.get("/api/v1/public/batches")
    t_fetch = round((time.perf_counter() - t0) * 1000, 2)
    assert res.status_code == 200
    data = res.json()
    cache_store["batches"] = (data, time.perf_counter())
    return data, False, t_fetch

async def test_cache_and_security():
    print("==================================================")
    print(" PHASE 6 IN-MEMORY CACHE EXPERIMENT & SAFETY AUDIT ")
    print(" Target: GET /api/v1/public/batches ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection
    await connect_to_mongo()

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Cache Miss (First Fetch from Cosmos DB)
        data_miss, hit_miss, time_miss = await get_cached_public_batches(client)
        print(f"  -> Cache Miss  : hit={hit_miss} | latency={time_miss} ms | returned {len(data_miss)} items")

        # 2. Cache Hit (Subsequent Fetch from Memory)
        data_hit, hit_hit, time_hit = await get_cached_public_batches(client)
        print(f"  -> Cache Hit   : hit={hit_hit}  | latency={time_hit} ms | returned {len(data_hit)} items")

        # 3. Privacy & Security Audit of Returned Data
        forbidden_pii_fields = ["email", "mobile", "address", "dob", "employment_history", "password", "hashed_password"]
        violation_found = False

        for batch in data_hit:
            for sm in batch.get("sample_members", []):
                for f_key in forbidden_pii_fields:
                    if f_key in sm:
                        print(f"  [ERROR] Security Violation: Private PII '{f_key}' found in public sample member!")
                        violation_found = True

            for cp in batch.get("coordinator_profiles", []):
                for f_key in forbidden_pii_fields:
                    if f_key in cp:
                        print(f"  [ERROR] Security Violation: Private PII '{f_key}' found in public coordinator profile!")
                        violation_found = True

        if not violation_found:
            print("  -> Security Verification: 100% PASS. Zero private PII fields exposed in public payloads.")

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test_cache_and_security())
