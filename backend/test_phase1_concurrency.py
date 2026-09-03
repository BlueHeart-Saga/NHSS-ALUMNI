import asyncio
import time
import httpx
from app.main import app

async def test_normal_get():
    """Test standard GET /api/v1/public/stats latency."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        start = time.perf_counter()
        resp = await client.get("/api/v1/public/stats")
        duration_ms = (time.perf_counter() - start) * 1000
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        return round(duration_ms, 2)

async def test_contact_enquiry():
    """Test POST /api/v1/public/contact-enquiry latency."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        start = time.perf_counter()
        payload = {
            "full_name": "Concurrency Test User",
            "email": "test_concurrency@example.com",
            "mobile": "+919876543210",
            "message": "Performance fix test for Phase 1 event loop unblocking."
        }
        resp = await client.post("/api/v1/public/contact-enquiry", json=payload)
        duration_ms = (time.perf_counter() - start) * 1000
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        assert resp.json().get("success") is True
        return round(duration_ms, 2)

async def test_concurrent_gets(n: int):
    """Test n concurrent GET requests."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        start = time.perf_counter()
        tasks = [client.get("/api/v1/public/stats") for _ in range(n)]
        responses = await asyncio.gather(*tasks)
        total_duration_ms = (time.perf_counter() - start) * 1000
        for r in responses:
            assert r.status_code == 200
        return round(total_duration_ms / n, 2), round(total_duration_ms, 2)

async def test_get_during_contact_enquiry():
    """Test GET /api/v1/public/stats responsiveness WHILE submitting a contact enquiry concurrently."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "full_name": "Concurrent Contact Test",
            "email": "contact_bg@example.com",
            "mobile": "+919876543210",
            "message": "Testing GET responsiveness during background SMTP dispatch."
        }
        start = time.perf_counter()
        # Fire contact enquiry and GET stats simultaneously
        enquiry_task = asyncio.create_task(client.post("/api/v1/public/contact-enquiry", json=payload))
        get_task = asyncio.create_task(client.get("/api/v1/public/stats"))
        
        enquiry_resp, get_resp = await asyncio.gather(enquiry_task, get_task)
        get_duration_ms = (time.perf_counter() - start) * 1000
        
        assert enquiry_resp.status_code == 200
        assert get_resp.status_code == 200
        return round(get_duration_ms, 2)

async def main():
    print("==================================================")
    print(" PHASE 1 PERFORMANCE FIX: CONCURRENCY BENCHMARK ")
    print("==================================================")

    # Initialize lifespan (Mongo connection)
    from app.core.database import connect_to_mongo, close_mongo_connection
    await connect_to_mongo()

    try:
        print("\n1. Testing single GET /api/v1/public/stats...")
        single_get_ms = await test_normal_get()
        print(f"   -> Single GET latency: {single_get_ms} ms")

        print("\n2. Testing POST /api/v1/public/contact-enquiry...")
        enquiry_ms = await test_contact_enquiry()
        print(f"   -> Contact enquiry latency (BackgroundTasks): {enquiry_ms} ms")

        print("\n3. Testing GET latency DURING Contact Enquiry execution...")
        get_during_enquiry_ms = await test_get_during_contact_enquiry()
        print(f"   -> GET latency during email dispatch: {get_during_enquiry_ms} ms")

        print("\n4. Testing 5 concurrent GET requests...")
        avg_5, total_5 = await test_concurrent_gets(5)
        print(f"   -> 5 Concurrent GETs: avg={avg_5} ms, total batch={total_5} ms")

        print("\n5. Testing 10 concurrent GET requests...")
        avg_10, total_10 = await test_concurrent_gets(10)
        print(f"   -> 10 Concurrent GETs: avg={avg_10} ms, total batch={total_10} ms")

        print("\n==================================================")
        print(" ALL TESTS & BENCHMARKS PASSED SUCCESSFULLY ")
        print("==================================================")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
