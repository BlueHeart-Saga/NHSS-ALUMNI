import asyncio
import time
from bson import ObjectId

async def test_batches_optimizations():
    print("==================================================")
    print(" STEP 2: PROJECTION & PARALLEL EXECUTION BENCHMARK ")
    print(" Endpoint: GET /api/v1/public/batches ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection, get_db
    await connect_to_mongo()

    db = get_db()

    # --- APPROACH A: Parallel Queries + Projections ---
    t_start = time.perf_counter()

    # Projections: Only fetch required public fields
    batch_projection = {"name": 1, "passing_year": 1, "description": 1, "coordinators": 1}
    sample_projection = {"full_name": 1, "profile_photo_url": 1, "profession": 1, "current_city": 1, "passing_year": 1}

    # Define tasks for concurrent parallel execution
    batches_task = db.batches.find({}, batch_projection).sort("passing_year", -1).to_list(length=100)
    
    counts_pipeline = [
        {"$match": {"verification_status": "APPROVED"}},
        {"$group": {
            "_id": "$passing_year",
            "count": {"$sum": 1},
            "cities": {"$addToSet": "$current_city"}
        }}
    ]
    counts_task = db.alumni.aggregate(counts_pipeline).to_list(length=1000)

    events_pipeline = [
        {"$match": {"status": {"$in": ["PUBLISHED", "UPCOMING"]}}},
        {"$group": {"_id": "$batch_id", "count": {"$sum": 1}}}
    ]
    events_task = db.events.aggregate(events_pipeline).to_list(length=1000)

    samples_task = db.alumni.find(
        {"verification_status": "APPROVED"},
        sample_projection
    ).sort("passing_year", -1).to_list(length=1000)

    # Run all 4 queries concurrently in parallel
    batches, counts_list, events_list, all_samples = await asyncio.gather(
        batches_task, counts_task, events_task, samples_task
    )

    # Coordinators check
    all_coord_ids = []
    for b in batches:
        for c in b.get("coordinators", []):
            if c:
                try:
                    all_coord_ids.append(ObjectId(c))
                except Exception:
                    all_coord_ids.append(c)

    coord_alumni = []
    if all_coord_ids:
        coord_alumni = await db.alumni.find({"_id": {"$in": all_coord_ids}}, sample_projection).to_list(length=len(all_coord_ids))

    # Formatting
    t_fmt = time.perf_counter()
    counts_map = {}
    for c in counts_list:
        if c.get("_id"):
            cities = [ct for ct in c.get("cities", []) if ct]
            counts_map[c["_id"]] = {
                "count": c.get("count", 0),
                "cities_count": len(cities)
            }

    events_map = {str(doc["_id"]): doc.get("count", 0) for doc in events_list if doc.get("_id")}

    coords_map = {
        str(ca["_id"]): {
            "id": str(ca["_id"]),
            "full_name": ca.get("full_name", "Coordinator"),
            "profile_photo_url": ca.get("profile_photo_url"),
            "profession": ca.get("profession"),
            "current_city": ca.get("current_city")
        } for ca in coord_alumni
    }

    sample_members_map = {}
    for m in all_samples:
        yr = m.get("passing_year")
        if yr not in sample_members_map:
            sample_members_map[yr] = []
        if len(sample_members_map[yr]) < 6:
            sample_members_map[yr].append({
                "id": str(m["_id"]),
                "full_name": m.get("full_name", "Alumnus"),
                "profile_photo_url": m.get("profile_photo_url"),
                "profession": m.get("profession") or "Alumnus",
                "current_city": m.get("current_city") or "Kovilpatti",
                "passing_year": yr
            })

    res = []
    for b in batches:
        b_id = str(b["_id"])
        yr = b.get("passing_year")
        stats = counts_map.get(yr, {"count": 0, "cities_count": 0})
        c_profiles = [coords_map[str(c)] for c in b.get("coordinators", []) if str(c) in coords_map]
        s_members = sample_members_map.get(yr, []) if yr else []

        res.append({
            "id": b_id,
            "name": b.get("name"),
            "passing_year": yr,
            "description": b.get("description"),
            "total_members": stats["count"],
            "cities_count": stats["cities_count"],
            "upcoming_events_count": events_map.get(b_id, 0),
            "coordinator_profiles": c_profiles,
            "sample_members": s_members
        })

    total_parallel_ms = round((time.perf_counter() - t_start) * 1000, 2)
    fmt_ms = round((time.perf_counter() - t_fmt) * 1000, 2)

    print(f"\n  Parallel + Projections Total Execution Time : {total_parallel_ms} ms")
    print(f"  Formatting Time                             : {fmt_ms} ms")
    print(f"  Batches Returned                            : {len(res)}")

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test_batches_optimizations())
