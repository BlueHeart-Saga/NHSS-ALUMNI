import asyncio
import time
import httpx
from app.main import app

async def test_endpoint(endpoint: str, concurrency: int = 1):
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        start = time.perf_counter()
        tasks = [client.get(endpoint) for _ in range(concurrency)]
        responses = await asyncio.gather(*tasks)
        total_duration_ms = (time.perf_counter() - start) * 1000
        for r in responses:
            assert r.status_code == 200, f"Expected 200 on {endpoint}, got {r.status_code}"
        avg_ms = round(total_duration_ms / concurrency, 2)
        total_ms = round(total_duration_ms, 2)
        return avg_ms, total_ms

async def main():
    print("==================================================")
    print(" PHASE 2 PERFORMANCE BENCHMARK & QUERY AUDIT ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection
    await connect_to_mongo()

    try:
        endpoints = [
            ("/api/v1/public/stats", "stats"),
            ("/api/v1/public/events", "events"),
            ("/api/v1/public/batches", "batches"),
            ("/api/v1/public/past-events", "past-events")
        ]

        print("\n--- 1. SINGLE REQUEST BENCHMARKS (Concurrency = 1) ---")
        for path, name in endpoints:
            avg_ms, _ = await test_endpoint(path, 1)
            print(f"   -> GET {path} ({name}): {avg_ms} ms")

        print("\n--- 2. CONCURRENCY BENCHMARKS FOR /public/batches ---")
        for conc in [1, 5, 10]:
            avg_ms, total_ms = await test_endpoint("/api/v1/public/batches", conc)
            print(f"   -> GET /public/batches ({conc} concurrent): avg={avg_ms} ms, batch total={total_ms} ms")

        print("\n==================================================")
        print(" PHASE 2 BENCHMARKS COMPLETED SUCCESSFULLY ")
        print("==================================================")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
