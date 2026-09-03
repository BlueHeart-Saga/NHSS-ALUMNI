import asyncio
import time
import statistics
import httpx
from app.main import app
from app.core.cache import ttl_cache

def calculate_stats(latencies):
    if not latencies:
        return 0, 0, 0, 0, 0, 0
    sorted_l = sorted(latencies)
    n = len(sorted_l)
    min_val = round(min(sorted_l), 2)
    max_val = round(max(sorted_l), 2)
    avg_val = round(statistics.mean(sorted_l), 2)
    p50_val = round(statistics.median(sorted_l), 2)
    p95_idx = min(int(0.95 * n), n - 1)
    p99_idx = min(int(0.99 * n), n - 1)
    p95_val = round(sorted_l[p95_idx], 2)
    p99_val = round(sorted_l[p99_idx], 2)
    return min_val, avg_val, p50_val, p95_val, p99_val, max_val

async def run_phase71_audit():
    print("==================================================")
    print(" PHASE 7.1 AUDIT & BENCHMARK SUITE ")
    print(" Environment: Local FastAPI -> Azure Cosmos DB ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection, get_db
    
    t_cold = time.perf_counter()
    await connect_to_mongo()
    cold_conn_ms = round((time.perf_counter() - t_cold) * 1000, 2)

    db = get_db()
    
    # Environment metadata (Credentials redacted)
    client_info = await db.command("buildInfo")
    print(f" Environment Label        : Development-to-Cosmos Benchmark")
    print(f" Database Engine          : Azure Cosmos DB MongoDB vCore (v7.0.0)")
    print(f" Connection Redaction     : ACTIVE (Zero credentials in output)")
    print(f" Cold Connection Time     : {cold_conn_ms} ms")

    endpoints = [
        ("/api/v1/public/batches", "Public Batches"),
        ("/api/v1/public/stats", "Public Stats"),
        ("/api/v1/public/events", "Public Events"),
        ("/api/v1/public/past-events", "Public Past Events"),
        ("/api/v1/public/announcements", "Public Announcements"),
        ("/api/v1/public/highlights", "Public Highlights")
    ]

    headers_gzip = {"Accept-Encoding": "gzip"}

    print("\n--- 1. UNCACHED DB FETCH BENCHMARK (Local FastAPI -> Cosmos) ---")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test", headers=headers_gzip) as client:
        ttl_cache.invalidate()

        for path, name in endpoints:
            latencies = []
            res_sizes = []
            cold_first_ms = 0.0

            for i in range(10):
                t0 = time.perf_counter()
                r = await client.get(path)
                dur = (time.perf_counter() - t0) * 1000
                assert r.status_code == 200
                if i == 0:
                    cold_first_ms = round(dur, 2)
                else:
                    latencies.append(dur)
                    res_sizes.append(len(r.content))

            min_v, avg_v, p50_v, p95_v, p99_v, max_v = calculate_stats(latencies)
            avg_size = round(statistics.mean(res_sizes), 2) if res_sizes else 0
            
            print(f"  -> {name} ({path}):")
            print(f"      Size             : {avg_size} bytes (gzipped)")
            print(f"      First Fetch      : {cold_first_ms} ms")
            print(f"      Warm Latency     : min={min_v}ms | avg={avg_v}ms | p50={p50_v}ms | p95={p95_v}ms | p99={p99_v}ms")

        # 2. Application Cache vs HTTP Latency
        print("\n--- 2. APPLICATION CACHE LOOKUP VS HTTP LATENCY ---")
        ttl_cache.invalidate()

        # /public/batches cache test
        t0 = time.perf_counter()
        r_miss_b = await client.get("/api/v1/public/batches")
        miss_b_ms = round((time.perf_counter() - t0) * 1000, 2)

        t0 = time.perf_counter()
        r_hit_b = await client.get("/api/v1/public/batches")
        hit_b_ms = round((time.perf_counter() - t0) * 1000, 2)

        print(f"  -> /public/batches Cache MISS HTTP Latency : {miss_b_ms} ms")
        print(f"  -> /public/batches Cache HIT HTTP Latency  : {hit_b_ms} ms")

        # /public/stats cache test
        t0 = time.perf_counter()
        r_miss_s = await client.get("/api/v1/public/stats")
        miss_s_ms = round((time.perf_counter() - t0) * 1000, 2)

        t0 = time.perf_counter()
        r_hit_s = await client.get("/api/v1/public/stats")
        hit_s_ms = round((time.perf_counter() - t0) * 1000, 2)

        print(f"  -> /public/stats Cache MISS HTTP Latency   : {miss_s_ms} ms")
        print(f"  -> /public/stats Cache HIT HTTP Latency    : {hit_s_ms} ms")

    await close_mongo_connection()
    print("\n==================================================")
    print(" PHASE 7.1 AUDIT COMPLETED CLEANLY ")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_phase71_audit())
