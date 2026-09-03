import asyncio
import time
import statistics
import httpx
from bson import ObjectId
from app.main import app

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

async def run_sequential_batches_logic(db):
    """Exact baseline sequential execution of /public/batches without parallelization or field projections."""
    t_start = time.perf_counter()

    # Q1: Batches find (no projection)
    t0 = time.perf_counter()
    batches = await db.batches.find({}).sort("passing_year", -1).to_list(length=100)
    q1_ms = (time.perf_counter() - t0) * 1000

    # Q2: Alumni member counts & cities aggregation
    t0 = time.perf_counter()
    pipeline = [
        {"$match": {"verification_status": "APPROVED"}},
        {"$group": {
            "_id": "$passing_year",
            "count": {"$sum": 1},
            "cities": {"$addToSet": "$current_city"}
        }}
    ]
    counts_list = await db.alumni.aggregate(pipeline).to_list(length=1000)
    q2_ms = (time.perf_counter() - t0) * 1000

    # Q3: Upcoming events aggregation
    t0 = time.perf_counter()
    events_pipeline = [
        {"$match": {"status": {"$in": ["PUBLISHED", "UPCOMING"]}}},
        {"$group": {"_id": "$batch_id", "count": {"$sum": 1}}}
    ]
    events_list = await db.events.aggregate(events_pipeline).to_list(length=1000)
    q3_ms = (time.perf_counter() - t0) * 1000

    # Coordinators check
    all_coord_ids = []
    for b in batches:
        for c in b.get("coordinators", []):
            if c:
                try:
                    all_coord_ids.append(ObjectId(c) if isinstance(c, str) else c)
                except Exception:
                    all_coord_ids.append(c)

    q4_ms = 0.0
    coord_alumni = []
    if all_coord_ids:
        t0 = time.perf_counter()
        coord_alumni = await db.alumni.find({"_id": {"$in": all_coord_ids}}).to_list(length=len(all_coord_ids))
        q4_ms = (time.perf_counter() - t0) * 1000

    # Q5: Alumni samples find (no projection)
    t0 = time.perf_counter()
    passing_years = [b.get("passing_year") for b in batches if b.get("passing_year")]
    all_samples = []
    if passing_years:
        all_samples = await db.alumni.find({
            "passing_year": {"$in": passing_years},
            "verification_status": "APPROVED"
        }).to_list(length=1000)
    q5_ms = (time.perf_counter() - t0) * 1000

    total_seq_ms = (time.perf_counter() - t_start) * 1000
    return total_seq_ms, q1_ms, q2_ms, q3_ms, q4_ms, q5_ms

async def run_phase6_benchmarks():
    print("==================================================")
    print(" PHASE 6 CONTROLLED BENCHMARK & LATENCY SUITE ")
    print(" Target: GET /api/v1/public/batches ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection, get_db
    
    # 1. Cold Startup Measurement
    t_cold_start = time.perf_counter()
    await connect_to_mongo()
    cold_conn_ms = round((time.perf_counter() - t_cold_start) * 1000, 2)

    db = get_db()
    
    # Redacted info (No secrets printed)
    client_info = await db.command("buildInfo")
    print(f" Environment              : development")
    print(f" Mongo / Cosmos Version   : {client_info.get('version')}")
    print(f" Database Name            : {db.name}")
    print(f" Cold Connection Time     : {cold_conn_ms} ms")

    # 2. Sequential vs Optimized Query Stage Timings
    print("\n--- STAGE-BY-STAGE QUERY LATENCY PROFILING ---")
    seq_tot, q1, q2, q3, q4, q5 = await run_sequential_batches_logic(db)
    print(f"  Sequential Baseline Breakdown:")
    print(f"    Q1 (batches.find)           : {round(q1, 2)} ms")
    print(f"    Q2 (alumni.aggregate)       : {round(q2, 2)} ms")
    print(f"    Q3 (events.aggregate)       : {round(q3, 2)} ms")
    print(f"    Q4 (coord.find)             : {round(q4, 2)} ms")
    print(f"    Q5 (samples.find)           : {round(q5, 2)} ms")
    print(f"    SUM of Sequential DB Queries: {round(q1+q2+q3+q4+q5, 2)} ms | Total Endpoint: {round(seq_tot, 2)} ms")

    # 3. HTTP Concurrency Benchmarks across Concurrency Levels
    print("\n--- CONTROLLED HTTP LOAD TESTS FOR /public/batches ---")
    concurrency_levels = [1, 5, 10, 25, 50]

    headers_gzip = {"Accept-Encoding": "gzip"}

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test", headers=headers_gzip) as client:
        # Warmup request
        await client.get("/api/v1/public/batches")

        for conc in concurrency_levels:
            req_latencies = []
            batch_start = time.perf_counter()

            async def worker():
                t0 = time.perf_counter()
                res = await client.get("/api/v1/public/batches")
                t1 = time.perf_counter()
                req_latencies.append((t1 - t0) * 1000)
                assert res.status_code == 200

            await asyncio.gather(*[worker() for _ in range(conc)])
            batch_wall_ms = round((time.perf_counter() - batch_start) * 1000, 2)
            throughput = round(conc / (batch_wall_ms / 1000.0), 2) if batch_wall_ms > 0 else 0

            min_val, avg_val, p50_val, p95_val, p99_val, max_val = calculate_stats(req_latencies)

            print(f"\n  Concurrency Level: {conc} Concurrent Requests")
            print(f"    Per-Request Latency  : min={min_val}ms | avg={avg_val}ms | p50={p50_val}ms | p95={p95_val}ms | p99={p99_val}ms | max={max_val}ms")
            print(f"    Batch Wall-Clock Time: {batch_wall_ms} ms")
            print(f"    Throughput           : {throughput} req/sec")

    await close_mongo_connection()
    print("\n==================================================")
    print(" PHASE 6 CONTROLLED BENCHMARK COMPLETED CLEANLY ")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_phase6_benchmarks())
