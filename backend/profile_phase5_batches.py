import asyncio
import time
import statistics
from bson import ObjectId

async def profile_public_batches_deep():
    print("==================================================")
    print(" STEP 1: DEEP OPERATION-BY-OPERATION PROFILING ")
    print(" Endpoint: GET /api/v1/public/batches ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection, get_db
    await connect_to_mongo()

    db = get_db()
    
    # Redacted Environment Logging (No secrets printed)
    client_info = await db.command("buildInfo")
    print(f" Environment       : development")
    print(f" Database Name     : {db.name}")
    print(f" Database Version  : {client_info.get('version')}")

    # Step 1: Profile current sequential implementation query by query
    t_start = time.perf_counter()

    # Query 1: Fetch batches
    t0 = time.perf_counter()
    batches = await db.batches.find({}).sort("passing_year", -1).to_list(length=100)
    q1_ms = round((time.perf_counter() - t0) * 1000, 2)

    # Query 2: Aggregate member counts & cities per passing_year
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
    q2_ms = round((time.perf_counter() - t0) * 1000, 2)

    # Query 3: Aggregate upcoming events per batch_id
    t0 = time.perf_counter()
    events_pipeline = [
        {"$match": {"status": {"$in": ["PUBLISHED", "UPCOMING"]}}},
        {"$group": {"_id": "$batch_id", "count": {"$sum": 1}}}
    ]
    events_list = await db.events.aggregate(events_pipeline).to_list(length=1000)
    q3_ms = round((time.perf_counter() - t0) * 1000, 2)

    # Coordinator IDs extraction
    all_coord_ids = []
    for b in batches:
        for c in b.get("coordinators", []):
            if c:
                try:
                    all_coord_ids.append(ObjectId(c))
                except Exception:
                    all_coord_ids.append(c)

    # Query 4: Fetch coordinator profiles
    t0 = time.perf_counter()
    coord_alumni = []
    if all_coord_ids:
        coord_alumni = await db.alumni.find({"_id": {"$in": all_coord_ids}}).to_list(length=len(all_coord_ids))
    q4_ms = round((time.perf_counter() - t0) * 1000, 2)

    # Query 5: Fetch sample alumni members for passing years
    t0 = time.perf_counter()
    passing_years = [b.get("passing_year") for b in batches if b.get("passing_year")]
    all_samples = []
    if passing_years:
        all_samples = await db.alumni.find({
            "passing_year": {"$in": passing_years},
            "verification_status": "APPROVED"
        }).to_list(length=1000)
    q5_ms = round((time.perf_counter() - t0) * 1000, 2)

    # Python data formatting & in-memory grouping
    t0 = time.perf_counter()
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

    python_formatting_ms = round((time.perf_counter() - t0) * 1000, 2)
    total_sequential_ms = round((time.perf_counter() - t_start) * 1000, 2)

    print("\n--------------------------------------------------")
    print(" QUERY-BY-QUERY TIMING BREAKDOWN (SEQUENTIAL):")
    print("--------------------------------------------------")
    print(f"  Q1: db.batches.find({len(batches)} batches)           : {q1_ms} ms")
    print(f"  Q2: db.alumni.aggregate(counts/cities)              : {q2_ms} ms")
    print(f"  Q3: db.events.aggregate(upcoming events)            : {q3_ms} ms")
    print(f"  Q4: db.alumni.find(coordinators: {len(all_coord_ids)})          : {q4_ms} ms")
    print(f"  Q5: db.alumni.find(samples: {len(all_samples)} docs)         : {q5_ms} ms")
    print(f"  Python In-Memory Formatting & Mapping             : {python_formatting_ms} ms")
    print(f"  ------------------------------------------------")
    print(f"  TOTAL SEQUENTIAL DB + PYTHON TIMING               : {total_sequential_ms} ms")

    print("\n--------------------------------------------------")
    print(" DATA VOLUME & FIELD AUDIT:")
    print("--------------------------------------------------")
    print(f"  Batches Returned           : {len(batches)}")
    print(f"  Coordinator IDs Searched   : {len(all_coord_ids)}")
    print(f"  Alumni Samples Transferred : {len(all_samples)} documents")
    if all_samples:
        first_doc = all_samples[0]
        fields_in_sample = list(first_doc.keys())
        print(f"  Sample Alumni Doc Fields   : {len(fields_in_sample)} fields -> {fields_in_sample[:8]}...")
        print(f"  Required Fields in API     : ['full_name', 'profile_photo_url', 'profession', 'current_city', 'passing_year']")

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(profile_public_batches_deep())
