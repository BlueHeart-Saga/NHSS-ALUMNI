import asyncio
import httpx
from app.main import app

async def run_phase5_regression_tests():
    print("==================================================")
    print(" PHASE 5 REGRESSION & API CONTRACT VERIFICATION ")
    print(" Target: GET /api/v1/public/batches ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection
    await connect_to_mongo()

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/public/batches")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        batches = res.json()
        assert isinstance(batches, list), "Expected JSON array"
        assert len(batches) > 0, "Expected non-empty batches list"

        b0 = batches[0]
        required_keys = [
            "id", "name", "passing_year", "description",
            "total_members", "cities_count", "upcoming_events_count",
            "coordinator_profiles", "sample_members"
        ]
        for key in required_keys:
            assert key in b0, f"Missing required field '{key}' in /public/batches payload"

        assert isinstance(b0["sample_members"], list)
        assert isinstance(b0["coordinator_profiles"], list)
        if b0["sample_members"]:
            sm0 = b0["sample_members"][0]
            sm_required_keys = ["id", "full_name", "profile_photo_url", "profession", "current_city", "passing_year"]
            for sm_key in sm_required_keys:
                assert sm_key in sm0, f"Missing sample member field '{sm_key}'"

        print("  -> GET /public/batches API schema contract verified 100%.")
        print(f"  -> Returned {len(batches)} batches cleanly.")

    print("\n==================================================")
    print(" ALL PHASE 5 REGRESSION TESTS PASSED CLEANLY ")
    print("==================================================")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_phase5_regression_tests())
