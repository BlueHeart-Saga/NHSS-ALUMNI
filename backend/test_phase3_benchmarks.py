import asyncio
import time
import httpx
from PIL import Image
import io
from app.main import app
from app.services.azure_blob import blob_service

async def test_gridfs_file_delivery(file_id: str, concurrency: int = 1):
    """Test latency of streaming binary image from GridFS (/api/v1/files/{file_id})."""
    limits = httpx.Limits(max_connections=50, max_keepalive_connections=20)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test", limits=limits, timeout=30.0) as client:
        start = time.perf_counter()
        tasks = [client.get(f"/api/v1/files/{file_id}") for _ in range(concurrency)]
        responses = await asyncio.gather(*tasks)
        total_duration_ms = (time.perf_counter() - start) * 1000
        for r in responses:
            assert r.status_code in [200, 404]
        return round(total_duration_ms / concurrency, 2), round(total_duration_ms, 2)

async def test_azure_direct_delivery(azure_url: str, concurrency: int = 1):
    """Test latency of fetching direct Azure Blob/CDN URL using pooled connections."""
    limits = httpx.Limits(max_connections=50, max_keepalive_connections=20)
    async with httpx.AsyncClient(limits=limits, timeout=30.0) as client:
        start = time.perf_counter()
        tasks = [client.get(azure_url) for _ in range(concurrency)]
        responses = await asyncio.gather(*tasks)
        total_duration_ms = (time.perf_counter() - start) * 1000
        for r in responses:
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        return round(total_duration_ms / concurrency, 2), round(total_duration_ms, 2)

async def main():
    print("==================================================")
    print(" PHASE 3 PERFORMANCE BENCHMARK: IMAGE DELIVERY ")
    print("==================================================")

    from app.core.database import connect_to_mongo, close_mongo_connection, get_db
    await connect_to_mongo()

    db = get_db()
    
    # 1. Upload a live test image to Azure Blob Storage to get a live URL
    img = Image.new("RGB", (800, 800), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    live_bytes = buf.getvalue()

    sample_azure_url, _, _ = await blob_service.upload_image(
        file_content=live_bytes,
        filename="benchmark_live.jpg",
        content_type="image/jpeg",
        school_id="bench_school",
        event_id="bench_event"
    )

    # 2. Find sample GridFS file_id if present
    sample_gridfs_doc = await db["fs.files"].find_one({})
    gridfs_id = str(sample_gridfs_doc["_id"]) if sample_gridfs_doc else None

    try:
        print("\n--- 1. SINGLE IMAGE DELIVERY LATENCY ---")
        if gridfs_id:
            avg_g1, _ = await test_gridfs_file_delivery(gridfs_id, 1)
            print(f"   -> GridFS Delivery (/files/{gridfs_id}): {avg_g1} ms")
        else:
            print("   -> GridFS Delivery: No files in fs.files collection")

        avg_a1, _ = await test_azure_direct_delivery(sample_azure_url, 1)
        print(f"   -> Direct Azure CDN Delivery ({sample_azure_url}): {avg_a1} ms")

        print("\n--- 2. CONCURRENT IMAGE DELIVERY (5, 10, 20 Requests) ---")
        for count in [5, 10, 20]:
            avg_a, total_a = await test_azure_direct_delivery(sample_azure_url, count)
            print(f"   -> Direct Azure CDN ({count} concurrent): avg={avg_a} ms, total batch={total_a} ms")

        print("\n==================================================")
        print(" PHASE 3 IMAGE BENCHMARKS COMPLETED SUCCESSFULLY ")
        print("==================================================")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
