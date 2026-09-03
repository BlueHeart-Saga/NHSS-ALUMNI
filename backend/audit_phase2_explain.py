import asyncio
import time
from app.core.database import connect_to_mongo, close_mongo_connection, get_db

async def run_query_audit():
    db = get_db()
    print("==================================================")
    print(" STEP 1: QUERY AUDIT & EXPLAIN PLAN INSPECTION ")
    print("==================================================")

    # 1. Query in get_public_stats: db.alumni.count_documents({"verification_status": "APPROVED"})
    start = time.perf_counter()
    docs_returned = await db.alumni.count_documents({"verification_status": "APPROVED"})
    t_stats = (time.perf_counter() - start) * 1000
    print(f"\n[QUERY 1] db.alumni.count_documents({{'verification_status': 'APPROVED'}})")
    print(f"  -> Execution Time: {t_stats:.2f} ms | Result Count: {docs_returned}")

    # Try explain() if supported
    try:
        cursor = db.alumni.find({"verification_status": "APPROVED"})
        explain_res = await cursor.explain()
        print("  -> Explain Output:", str(explain_res)[:300])
    except Exception as e:
        print(f"  -> Explain Notice: {e}")

    # 2. Query in get_public_events: db.events.find({"status": {"$in": ["PUBLISHED", "UPCOMING"]}, "event_date": {"$gte": "2026-09-03"}})
    today_str = "2026-09-03"
    start = time.perf_counter()
    events = await db.events.find({"status": {"$in": ["PUBLISHED", "UPCOMING"]}, "event_date": {"$gte": today_str}}).to_list(10)
    t_events = (time.perf_counter() - start) * 1000
    print(f"\n[QUERY 2] db.events.find({{'status': {{'$in': ['PUBLISHED', 'UPCOMING']}}, 'event_date': {{'$gte': '{today_str}'}} }})")
    print(f"  -> Execution Time: {t_events:.2f} ms | Events Returned: {len(events)}")
    try:
        cursor = db.events.find({"status": {"$in": ["PUBLISHED", "UPCOMING"]}, "event_date": {"$gte": today_str}})
        explain_res = await cursor.explain()
        print("  -> Explain Output:", str(explain_res)[:300])
    except Exception as e:
        print(f"  -> Explain Notice: {e}")

    # 3. Query in get_public_past_events: db.events.find({"event_date": {"$lt": today_str}})
    start = time.perf_counter()
    past_events = await db.events.find({"event_date": {"$lt": today_str}}).to_list(50)
    t_past = (time.perf_counter() - start) * 1000
    print(f"\n[QUERY 3] db.events.find({{'event_date': {{'$lt': '{today_str}'}} }})")
    print(f"  -> Execution Time: {t_past:.2f} ms | Past Events Returned: {len(past_events)}")

    # 4. Query in get_public_batches: db.alumni.find({"passing_year": yr, "verification_status": "APPROVED"})
    start = time.perf_counter()
    sample_members = await db.alumni.find({"passing_year": 2010, "verification_status": "APPROVED"}).to_list(6)
    t_batch_alumni = (time.perf_counter() - start) * 1000
    print(f"\n[QUERY 4] db.alumni.find({{'passing_year': 2010, 'verification_status': 'APPROVED'}})")
    print(f"  -> Execution Time: {t_batch_alumni:.2f} ms | Sample Members Returned: {len(sample_members)}")
    try:
        cursor = db.alumni.find({"passing_year": 2010, "verification_status": "APPROVED"})
        explain_res = await cursor.explain()
        print("  -> Explain Output:", str(explain_res)[:300])
    except Exception as e:
        print(f"  -> Explain Notice: {e}")

    print("\n==================================================")

if __name__ == "__main__":
    async def main():
        await connect_to_mongo()
        try:
            await run_query_audit()
        finally:
            await close_mongo_connection()
    asyncio.run(main())
