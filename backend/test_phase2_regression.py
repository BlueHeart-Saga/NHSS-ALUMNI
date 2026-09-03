import asyncio
import httpx
from app.main import app

async def run_regression_tests():
    print("==================================================")
    print(" STEP 10: REGRESSION & API COMPATIBILITY TESTING ")
    print("==================================================")

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Test /stats
        res_stats = await client.get("/api/v1/public/stats")
        assert res_stats.status_code == 200
        stats_json = res_stats.json()
        required_stats_keys = ["school_name", "total_alumni", "total_batches", "total_events", "years_connected"]
        for k in required_stats_keys:
            assert k in stats_json, f"Missing key '{k}' in /stats response"
        print("  -> GET /public/stats API contract verified.")

        # 2. Test /events
        res_events = await client.get("/api/v1/public/events")
        assert res_events.status_code == 200
        events_json = res_events.json()
        assert isinstance(events_json, list)
        if events_json:
            ev = events_json[0]
            required_ev_keys = ["id", "title", "batch_name", "event_date", "attending_count", "cover_image_url"]
            for k in required_ev_keys:
                assert k in ev, f"Missing key '{k}' in /events item"
        print(f"  -> GET /public/events API contract verified ({len(events_json)} events returned).")

        # 3. Test /past-events
        res_past = await client.get("/api/v1/public/past-events")
        assert res_past.status_code == 200
        past_json = res_past.json()
        assert isinstance(past_json, list)
        if past_json:
            ev = past_json[0]
            assert "attending_count" in ev
            assert ev.get("status") == "PAST"
        print(f"  -> GET /public/past-events API contract verified ({len(past_json)} past events returned).")

        # 4. Test /batches
        res_batches = await client.get("/api/v1/public/batches")
        assert res_batches.status_code == 200
        batches_json = res_batches.json()
        assert isinstance(batches_json, list)
        if batches_json:
            b = batches_json[0]
            required_b_keys = ["id", "name", "passing_year", "total_members", "cities_count", "upcoming_events_count", "coordinator_profiles", "sample_members"]
            for k in required_b_keys:
                assert k in b, f"Missing key '{k}' in /batches item"
            assert isinstance(b["sample_members"], list)
            assert isinstance(b["coordinator_profiles"], list)
        print(f"  -> GET /public/batches API contract verified ({len(batches_json)} batches returned).")

    print("\n==================================================")
    print(" ALL REGRESSION TESTS PASSED SUCCESSFULLY ")
    print("==================================================")

if __name__ == "__main__":
    from app.core.database import connect_to_mongo, close_mongo_connection
    async def main():
        await connect_to_mongo()
        try:
            await run_regression_tests()
        finally:
            await close_mongo_connection()
    asyncio.run(main())
