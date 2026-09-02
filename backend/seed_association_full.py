# import asyncio
# from datetime import datetime, timezone
# from app.core.database import connect_to_mongo, get_db

# async def seed_full_association_team():
#     await connect_to_mongo()
#     db = get_db()
#     school = await db.schools.find_one({})
#     if not school:
#         print("No school profile found.")
#         return
#     school_id = str(school["_id"])

#     # Clear existing to populate a complete, realistic board across all roles (Patron removed)
#     await db.association_team.delete_many({"school_id": school_id})

#     # Fetch alumni records for realistic photo & profile links
#     alumni_list = await db.alumni.find({"school_id": school_id}).to_list(length=20)

#     def get_alumni_data(index, fallback_name, fallback_batch, fallback_occupation, fallback_city):
#         if index < len(alumni_list):
#             a = alumni_list[index]
#             return {
#                 "alumni_id": str(a["_id"]),
#                 "full_name": a.get("full_name", fallback_name),
#                 "photo_url": a.get("profile_photo_url") or f"https://ui-avatars.com/api/?name={a.get('full_name', fallback_name)}&background=FFF7D6&color=854D0E",
#                 "email": a.get("email", "alumni@nhssalumni.com"),
#                 "mobile": a.get("mobile", "+91 94431 10000"),
#                 "location": a.get("current_city") or fallback_city,
#                 "occupation": a.get("profession") or fallback_occupation,
#                 "batch_year": a.get("passing_year") or fallback_batch,
#                 "profile_type": "alumni"
#             }
#         return {
#             "alumni_id": None,
#             "full_name": fallback_name,
#             "photo_url": f"https://ui-avatars.com/api/?name={fallback_name}&background=FFF7D6&color=854D0E",
#             "email": f"{fallback_name.lower().replace(' ', '')}@nhssalumni.com",
#             "mobile": "+91 94431 99887",
#             "location": fallback_city,
#             "occupation": fallback_occupation,
#             "batch_year": fallback_batch,
#             "profile_type": "common"
#         }

#     full_team = [
#         # 1. President (#1 FIRST IN THE LIST)
#         {
#             **get_alumni_data(0, "Er. S. Marimuthu", 1995, "Managing Director, Sri Ram Textiles", "Kovilpatti"),
#             "school_id": school_id,
#             "position": "President",
#             "responsibility": "Overall Executive Leadership & Strategic Initiatives",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 1,
#             "bio": "Distinguished alumnus leading executive board operations and annual silver jubilee reunions.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 2. Vice President 1
#         {
#             **get_alumni_data(1, "Dr. K. Arumugam", 1998, "Senior Orthopedic Surgeon", "Chennai"),
#             "school_id": school_id,
#             "position": "Vice President",
#             "responsibility": "Alumni Medical Camps & Emergency Welfare Fund",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 2,
#             "bio": "Coordinates healthcare initiatives, medical camps, and student health checkups.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 3. Vice President 2
#         {
#             **get_alumni_data(2, "Mrs. P. Revathi", 2000, "Associate Professor, Physics", "Madurai"),
#             "school_id": school_id,
#             "position": "Vice President",
#             "responsibility": "Women Alumni Network & Academic Career Mentorship",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 3,
#             "bio": "Drives academic mentoring programs and career counseling for outgoing students.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 4. Secretary
#         {
#             **get_alumni_data(3, "Mr. T. Karthikeyan", 2002, "High Court Advocate", "Kovilpatti"),
#             "school_id": school_id,
#             "position": "Secretary",
#             "responsibility": "General Administration & Legal Compliance",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 4,
#             "bio": "Manages official correspondence, general body meetings, and association documentation.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 5. Joint Secretary 1
#         {
#             **get_alumni_data(4, "Er. S. Balasubramanian", 2005, "Principal Software Engineer", "Bengaluru"),
#             "school_id": school_id,
#             "position": "Joint Secretary",
#             "responsibility": "Digital Portal & Global Overseas Alumni Chapters",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 5,
#             "bio": "Leads digital portal development and international alumni chapter expansion.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 6. Joint Secretary 2
#         {
#             **get_alumni_data(5, "Mrs. M. Shenbagam", 2006, "Senior Auditor & CPA", "Coimbatore"),
#             "school_id": school_id,
#             "position": "Joint Secretary",
#             "responsibility": "Event Coordination & Registration Desk",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 6,
#             "bio": "Coordinates annual general meetings, cultural events, and registration operations.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 7. Treasurer
#         {
#             **get_alumni_data(6, "Er. V. Gurusamy", 1999, "Chartered Engineer & Builder", "Kovilpatti"),
#             "school_id": school_id,
#             "position": "Treasurer",
#             "responsibility": "Financial Audit, Corpus Fund & Scholarship Disbursement",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 7,
#             "bio": "Manages association finances, annual audits, and merit scholarship fund disbursement.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 8. Executive Committee Member 1
#         {
#             **get_alumni_data(7, "Mr. R. Vignesh", 2008, "Entrepreneur & Merchant", "Sattur"),
#             "school_id": school_id,
#             "position": "Executive Committee Member",
#             "responsibility": "Sports & Cultural Event Committee",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 8,
#             "bio": "Organizes annual alumni sports tournaments and cultural meets.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 9. Executive Committee Member 2
#         {
#             **get_alumni_data(8, "Mrs. S. Deepa", 2010, "High School Teacher", "Ettayapuram"),
#             "school_id": school_id,
#             "position": "Executive Committee Member",
#             "responsibility": "Student Career Guidance & Library Project",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 9,
#             "bio": "Drives library expansion and student book bank initiatives.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 10. Executive Committee Member 3
#         {
#             **get_alumni_data(9, "Er. P. Sundaram", 2012, "Civil Engineer", "Kayathar"),
#             "school_id": school_id,
#             "position": "Executive Committee Member",
#             "responsibility": "Campus Infrastructure & Campus Greenery",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 10,
#             "bio": "Manages campus beautification and tree plantation drives.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         },

#         # 11. Executive Committee Member 4
#         {
#             **get_alumni_data(10, "Mr. K. Velmurugan", 2014, "Government Revenue Inspector", "Sankarankovil"),
#             "school_id": school_id,
#             "position": "Executive Committee Member",
#             "responsibility": "Batch Representative Network & Public Relations",
#             "term_start": "2024",
#             "term_end": "2026",
#             "display_order": 11,
#             "bio": "Coordinates batch coordinators and public outreach programs.",
#             "status": "ACTIVE",
#             "created_at": datetime.now(timezone.utc)
#         }
#     ]

#     await db.association_team.insert_many(full_team)
#     print(f"Successfully seeded {len(full_team)} association leadership profiles (President #1, Patron removed).")

# asyncio.run(seed_full_association_team())
