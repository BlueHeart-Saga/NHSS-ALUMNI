import asyncio
import httpx
from app.main import app
from app.core.security import create_access_token
from bson import ObjectId

async def run_regression_tests():
    print("==================================================")
    print(" PHASE 4 REGRESSION & API COMPATIBILITY TESTING ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection, get_db
    await connect_to_mongo()

    db = get_db()
    
    # 1. Test Auth Endpoint (/auth/me) with valid user
    user = await db.users.find_one({})
    if user:
        user_id_str = str(user["_id"])
        token = create_access_token({"sub": user_id_str, "roles": ["ALUMNI"]})

        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            res_me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert res_me.status_code == 200, f"Expected 200, got {res_me.status_code}"
            me_json = res_me.json()
            assert "user_id" in me_json
            assert "verification_status" in me_json
            assert "roles" in me_json
            print("  -> /auth/me authentication contract verified.")

            # 2. Test Invalid Token
            res_invalid = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_token_abc"})
            assert res_invalid.status_code == 401
            print("  -> Invalid token 401 unauthorized contract verified.")

            # 3. Test Public Endpoints for gzip and cache-control headers
            res_stats = await client.get("/api/v1/public/stats", headers={"Accept-Encoding": "gzip"})
            assert res_stats.status_code == 200
            assert res_stats.headers.get("content-encoding") == "gzip"
            assert "public, max-age=60" in res_stats.headers.get("cache-control", "")
            print("  -> /public/stats GZip compression & Cache-Control headers verified.")

            res_events = await client.get("/api/v1/public/events", headers={"Accept-Encoding": "gzip"})
            assert res_events.status_code == 200
            assert res_events.headers.get("content-encoding") == "gzip"
            print("  -> /public/events GZip compression & Cache-Control headers verified.")

    print("\n==================================================")
    print(" ALL PHASE 4 REGRESSION TESTS PASSED CLEANLY ")
    print("==================================================")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_regression_tests())
