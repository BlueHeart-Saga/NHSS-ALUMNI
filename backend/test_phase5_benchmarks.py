import asyncio
import time
import statistics
import httpx
from app.main import app

def calculate_percentiles(latencies):
    sorted_l = sorted(latencies)
    n = len(sorted_l)
    p50 = round(statistics.median(sorted_l), 2)
    p95_idx = min(int(0.95 * n), n - 1)
    p99_idx = min(int(0.99 * n), n - 1)
    p95 = round(sorted_l[p95_idx], 2)
    p99 = round(sorted_l[p99_idx], 2)
    avg = round(statistics.mean(sorted_l), 2)
    return avg, p50, p95, p99

async def run_phase5_benchmarks():
    print("==================================================")
    print(" PHASE 5 FINAL COMPREHENSIVE BENCHMARK SUITE ")
    print(" Target: GET /api/v1/public/batches & Public APIs ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection, get_db
    await connect_to_mongo()

    db = get_db()
    
    # Redacted Environment & Database Details
    client_info = await db.command("buildInfo")
    print(f" Environment       : development")
    print(f" Database Name     : {db.name}")
    print(f" Mongo/Cosmos Ver  : {client_info.get('version')}")

    endpoints = [
        ("/api/v1/public/batches", "Public Batches"),
        ("/api/v1/public/events", "Public Events"),
        ("/api/v1/public/past-events", "Public Past Events"),
        ("/api/v1/public/stats", "Public Stats")
    ]

    headers_gzip = {"Accept-Encoding": "gzip"}

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test", headers=headers_gzip) as client:
        print("\n--- 1. SINGLE REQUEST BENCHMARKS (Cold vs Warm 1 Request: p50, p95, p99) ---")
        for path, name in endpoints:
            # Cold Warmup Request 1
            t0 = time.perf_counter()
            r_cold = await client.get(path)
            cold_ms = round((time.perf_counter() - t0) * 1000, 2)

            # 10 Consecutive Warm Requests for Percentiles
            warm_latencies = []
            for _ in range(10):
                t0 = time.perf_counter()
                r = await client.get(path)
                warm_latencies.append((time.perf_counter() - t0) * 1000)
                assert r.status_code == 200

            avg, p50, p95, p99 = calculate_percentiles(warm_latencies)
            print(f"  -> {name} ({path}):")
            print(f"      Cold First Request : {cold_ms} ms")
            print(f"      Warm Single Request : avg={avg} ms | p50={p50} ms | p95={p95} ms | p99={p99} ms")

        print("\n--- 2. CONCURRENT LOAD BENCHMARKS FOR /public/batches (5 & 10 Users) ---")
        for conc in [5, 10]:
            latencies = []
            start_batch = time.perf_counter()

            async def fetch_batch():
                t0 = time.perf_counter()
                r = await client.get("/api/v1/public/batches")
                t1 = time.perf_counter()
                latencies.append((t1 - t0) * 1000)
                assert r.status_code == 200

            await asyncio.gather(*[fetch_batch() for _ in range(conc)])
            total_batch_ms = round((time.perf_counter() - start_batch) * 1000, 2)
            avg, p50, p95, p99 = calculate_percentiles(latencies)

            print(f"  -> GET /public/batches ({conc} Concurrent Users):")
            print(f"      Avg Per Request  : {avg} ms")
            print(f"      Percentiles      : p50={p50} ms | p95={p95} ms | p99={p99} ms")
            print(f"      Total Batch Time : {total_batch_ms} ms")

    print("\n==================================================")
    print(" PHASE 5 BENCHMARKS COMPLETED CLEANLY ")
    print("==================================================")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_phase5_benchmarks())
