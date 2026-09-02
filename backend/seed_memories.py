# import asyncio
# import os
# import sys
# from datetime import datetime, timezone
# from motor.motor_asyncio import AsyncIOMotorClient

# # Add project root to sys.path
# sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
# from app.core.config import settings

# REAL_MEMORIES = [
#     {
#         "title": "70s Batch Alumni Heritage Meetup",
#         "description": "Historic batch reunion of 1970s school graduates reconnecting on campus.",
#         "image_url": "/school-images/alumni-memories/70smeet.jpg",
#         "batch_year": "1975",
#         "uploader_name": "S. Annamalai",
#         "uploader_email": "annamalai@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "Alumni Annual Conference & Development Assembly",
#         "description": "Annual alumni conference discussing school infrastructure and student scholarship funds.",
#         "image_url": "/school-images/alumni-memories/confreacemeet.jpg",
#         "batch_year": "1990",
#         "uploader_name": "M. Murugaboopathy",
#         "uploader_email": "boopathy@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "Silver Jubilee Grand Alumni Reunion Dinner",
#         "description": "25th anniversary celebration dinner with batchmates, family, and senior teachers.",
#         "image_url": "/school-images/alumni-memories/dinnermeet.jpg",
#         "batch_year": "1998",
#         "uploader_name": "K. Balamurugan",
#         "uploader_email": "balamurugan@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "Girls Batchmate Reunion & Campus Nostalgia",
#         "description": "Special batch reunion gathering of women alumni sharing school memories.",
#         "image_url": "/school-images/alumni-memories/girl-meet.jpg",
#         "batch_year": "2005",
#         "uploader_name": "P. Selvalingam",
#         "uploader_email": "selvalingam@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "Alumni Batchmate Marriage Celebration Meetup",
#         "description": "Alumni batchmates gathering to celebrate our school classmate wedding.",
#         "image_url": "/school-images/alumni-memories/marriagemeet.jpg",
#         "batch_year": "2010",
#         "uploader_name": "R. Vignesh",
#         "uploader_email": "vignesh@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "Friendship Visit at Alumni House & Reunion",
#         "description": "Batchmates visiting fellow alumni home during annual festival holidays.",
#         "image_url": "/school-images/alumni-memories/meetmyfriendhome.jpg",
#         "batch_year": "2002",
#         "uploader_name": "V. Veera Kesavan",
#         "uploader_email": "veerakesavan@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "Our People - Heritage Batch Get-Together",
#         "description": "Warm get-together celebration honoring senior alumni members.",
#         "image_url": "/school-images/alumni-memories/our-people.jpg",
#         "batch_year": "1985",
#         "uploader_name": "C. Balamurugan",
#         "uploader_email": "balamurugan@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "We Are Family - Alumni Reunion Gathering",
#         "description": "Campus reunion celebration showing unity and lifelong alumni bonds.",
#         "image_url": "/school-images/alumni-memories/wearefamily.jpg",
#         "batch_year": "1995",
#         "uploader_name": "K.V. Arunagiri",
#         "uploader_email": "arunagiri@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "School Archives Heritage Campus Photos",
#         "description": "Vintage campus memories preserved from early school archives.",
#         "image_url": "/school-images/alumni-memories/2.jpg",
#         "batch_year": "1980",
#         "uploader_name": "M. Katakkaraindram",
#         "uploader_email": "katakkaraindram@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "Republic Day Celebrations & Heritage Parade 2025",
#         "description": "NCC cadetted flag hoisting ceremony and student parade.",
#         "image_url": "/school-images/Republic-Day.png",
#         "batch_year": "2025",
#         "uploader_name": "K. Balamurugan",
#         "uploader_email": "balamurugan@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "Free Bicycle Distribution Welfare Scheme",
#         "description": "State welfare scheme bicycle distribution for high school students.",
#         "image_url": "/school-images/give-cycle.png",
#         "batch_year": "2024",
#         "uploader_name": "R. Vignesh",
#         "uploader_email": "vignesh@gmail.com",
#         "status": "APPROVED"
#     },
#     {
#         "title": "Golden Jubilee Alumni Reunion Selfie",
#         "description": "Heartwarming selfie moment of batchmates catching up at campus reunion.",
#         "image_url": "/school-images/old-students-selfie.png",
#         "batch_year": "1988",
#         "uploader_name": "S. Annamalai",
#         "uploader_email": "annamalai@gmail.com",
#         "status": "APPROVED"
#     }
# ]

# async def seed_memories():
#     client = AsyncIOMotorClient(settings.MONGODB_URI)
#     db = client[settings.MONGODB_DATABASE]

#     # Clear existing memories
#     await db.memories.delete_many({})
#     print("Cleared existing memories collection.")

#     now = datetime.now(timezone.utc)
#     docs = []
#     for m in REAL_MEMORIES:
#         docs.append({
#             "title": m["title"],
#             "description": m["description"],
#             "image_url": m["image_url"],
#             "batch_year": m["batch_year"],
#             "batch_id": m["batch_year"],
#             "uploader_name": m["uploader_name"],
#             "uploader_email": m["uploader_email"],
#             "status": m["status"],
#             "admin_remarks": "",
#             "created_at": now,
#             "updated_at": now
#         })

#     res = await db.memories.insert_many(docs)
#     print(f"Successfully seeded {len(res.inserted_ids)} real approved memories into MongoDB!")
#     client.close()

# if __name__ == "__main__":
#     asyncio.run(seed_memories())
