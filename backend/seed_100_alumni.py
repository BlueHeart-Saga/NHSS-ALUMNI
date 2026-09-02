# import os
# import shutil
# import random
# import asyncio
# from datetime import datetime, timezone
# from bson import ObjectId
# from app.core.database import connect_to_mongo, get_db

# # 1. Setup Image Directories
# SRC_IMAGE_DIR = r"C:\Users\mani\Downloads\profile"
# BACKEND_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads", "profiles")
# FRONTEND_UPLOAD_DIR = r"c:\sagadevan\Projects\justgathernow\admin-web\public\uploads\profiles"

# os.makedirs(BACKEND_UPLOAD_DIR, exist_ok=True)
# os.makedirs(FRONTEND_UPLOAD_DIR, exist_ok=True)

# # Copy all profile images
# image_files = os.listdir(SRC_IMAGE_DIR)
# male_images = []
# female_images = []

# for fname in image_files:
#     src_path = os.path.join(SRC_IMAGE_DIR, fname)
#     if os.path.isfile(src_path) and fname.lower().endswith(('.jpg', '.jpeg', '.png')):
#         shutil.copy(src_path, os.path.join(BACKEND_UPLOAD_DIR, fname))
#         shutil.copy(src_path, os.path.join(FRONTEND_UPLOAD_DIR, fname))
#         if fname.lower().startswith('f'):
#             female_images.append(f"/uploads/profiles/{fname}")
#         else:
#             male_images.append(f"/uploads/profiles/{fname}")

# print(f"Copied {len(male_images)} male profile photos and {len(female_images)} female profile photos.")

# # Data Lists
# MALE_NAMES = [
#     "K. Selvakumar", "S. Sundarapandian", "T. Karthikeyan", "P. Murugesan", "G. Vignesh",
#     "S. Muthuraman", "K. Balamurugan", "M. Senthilnathan", "N. Ponraj", "R. Saravanan",
#     "A. Rajkumar", "V. Marimuthu", "M. Shanmugaraj", "S. Manikandan", "P. Gurusamy",
#     "T. Vigneshwaran", "K. Pandiarajan", "R. Mahendran", "S. Thangavel", "M. Sivakumar",
#     "A. Arunkumar", "P. Vijayakumar", "G. Ramachandran", "K. Ganesan", "N. Veeramani",
#     "M. Ashok Kumar", "S. Prakashraj", "R. Dineshkumar", "T. Subbiah", "P. Soundararajan",
#     "K. Muthukrishnan", "V. Balasubramanian", "M. Kalidass", "A. Ramesh", "S. Velusamy",
#     "P. Sankaralingam", "T. Jayakumar", "K. Chandrasekar", "R. Nagarajan", "M. Perumal",
#     "S. Kumaresan", "A. Senthilkumar", "K. Mariyappan", "P. Anandakumar", "G. Kannan",
#     "M. Suresh Kumar", "N. Chellappa", "R. Thirumurugan", "S. Palanichamy", "T. Venkatesan",
#     "K. Ravichandran", "M. Jeyachandran", "A. Rajasekar", "P. Karthik", "S. Ilango"
# ]

# FEMALE_NAMES = [
#     "M. Priya", "R. Dhanalakshmi", "V. Meenakshi", "A. Kavitha", "R. Vijayalakshmi",
#     "S. Ramya", "P. Deepa", "K. Subbulakshmi", "M. Gomathi", "T. Sangeetha",
#     "S. Jayanthi", "A. Radhika", "P. Muthulakshmi", "R. Suganya", "K. Bhuvaneshwari",
#     "M. Anitha", "G. Lakshmi", "V. Revathi", "S. Karpagam", "N. Usha",
#     "P. Maheswari", "T. Shenbagavalli", "K. Rajeshwari", "M. Saranya", "A. Divya",
#     "R. Abirami", "S. Archana", "P. Malathi", "K. Ponmani", "M. Bharathi",
#     "T. Kalpana", "A. Sripriya", "S. Sudha", "P. Indumathi", "K. Vaithegi",
#     "M. Kausalya", "R. Nithya", "S. Thenmozhi", "P. Annapoorani", "T. Geetha",
#     "K. Sumathi", "M. Janaki", "A. Banumathi", "S. Vijaya", "P. Vasuki",
#     "R. Uma Maheswari", "S. Kowsalya", "K. Vanitha", "M. Amutha", "T. Prema"
# ]

# LOCALITIES = [
#     "Kovilpatti", "Ettayapuram", "Kayathar", "Kalugumalai", "Vilathikulam",
#     "Sattur", "Sankarankovil", "Kadambur", "Nalattinputhur", "Pandalgudi",
#     "Ilambuvanam", "Pasuvanthanai"
# ]

# PROFESSIONS = [
#     "Software Engineer", "Assistant Manager", "Business Owner", "School Teacher",
#     "Civil Engineer", "Medical Officer", "Data Analyst", "Agricultural Officer",
#     "Bank Officer", "Pharmacist", "Electrical Engineer", "Entrepreneur",
#     "High School Teacher", "Advocate", "Mechanical Engineer", "Accountant",
#     "Village Administrative Officer", "Project Engineer", "System Administrator", "Lecturer"
# ]

# COLLEGES = [
#     "National Engineering College, Kovilpatti",
#     "G.V.N. College, Kovilpatti",
#     "Anna University Regional Campus, Tirunelveli",
#     "Government College of Engineering, Tirunelveli",
#     "V.O.Chidambaram College, Tuticorin",
#     "Government Medical College, Thoothukudi",
#     "Sattur Sri S.R.N.M. College, Sattur",
#     "St. Xavier's College, Palayamkottai",
#     "Madurai Kamaraj University, Madurai"
# ]

# DEGREES = [
#     ("B.E.", "Computer Science"),
#     ("B.Tech", "Information Technology"),
#     ("B.Sc", "Mathematics"),
#     ("B.Com", "Computer Applications"),
#     ("MBBS", "Medicine"),
#     ("B.Sc", "Agriculture"),
#     ("B.E.", "Civil Engineering"),
#     ("B.E.", "Electrical & Electronics"),
#     ("B.Pharm", "Pharmacy"),
#     ("B.A.", "Tamil Literature"),
#     ("B.B.A.", "Business Administration"),
#     ("B.L. / LL.B.", "Law")
# ]

# COMMITTEE_ROLES_SEQUENCE = [
#     ("PRESIDENT", "President / Chairman"),
#     ("VICE_PRESIDENT", "Vice President / Vice Chairman"),
#     ("SECRETARY", "Secretary"),
#     ("JOINT_SECRETARY", "Joint / Assistant Secretary"),
#     ("TREASURER", "Treasurer"),
#     ("EXECUTIVE_MEMBER", "Executive / Committee Member"),
#     ("EXECUTIVE_MEMBER", "Executive / Committee Member"),
# ]

# async def seed():
#     await connect_to_mongo()
#     db = get_db()

#     school = await db.schools.find_one({})
#     if not school:
#         print("Error: No school found in database.")
#         return

#     school_id = str(school["_id"])
#     school_name = school.get("name", "NHSS ALUMNI HIGH SCHOOL KOVILPATTI")
#     print(f"Target School: {school_name} ({school_id})")

#     batches = await db.batches.find({"school_id": school_id}).sort("passing_year", 1).to_list(100)
#     if not batches:
#         print("Error: No batches found for school.")
#         return

#     print(f"Found {len(batches)} batches: {[b['name'] for b in batches]}")

#     # Prepare password
#     hashed_pwd = "Alumni@123"

#     total_added = 0
#     batch_wise_counts = {}

#     male_idx = 0
#     female_idx = 0
#     adm_counter = 1001

#     # Distribute 105 alumni across the 10 batches (approx 10-11 per batch)
#     for b_idx, b in enumerate(batches):
#         b_id = str(b["_id"])
#         p_year = b["passing_year"]
#         b_name = b["name"]
        
#         # 10 or 11 per batch
#         target_count = 11 if b_idx < 5 else 10
#         batch_added = 0
#         committee_members_list = []
#         coordinator_ids = []

#         print(f"\n--- Seeding Batch {b_name} ({p_year}) -> Target: {target_count} Alumni ---")

#         for i in range(target_count):
#             adm_counter += 1
#             adm_no = f"NHSS-{p_year}-{adm_counter}"

#             # Alternate male/female
#             is_female = (i % 3 == 2)
#             if is_female:
#                 full_name = FEMALE_NAMES[female_idx % len(FEMALE_NAMES)]
#                 photo_url = female_images[female_idx % len(female_images)]
#                 female_idx += 1
#                 gender = "Female"
#             else:
#                 full_name = MALE_NAMES[male_idx % len(MALE_NAMES)]
#                 photo_url = male_images[male_idx % len(male_images)]
#                 male_idx += 1
#                 gender = "Male"

#             city = random.choice(LOCALITIES)
#             profession = random.choice(PROFESSIONS)
#             college = random.choice(COLLEGES)
#             degree_tuple = random.choice(DEGREES)
#             section = random.choice(["A", "B", "C"])
#             mobile = f"+9194431{random.randint(10000, 99999)}"
#             email = f"alumni.{p_year}.{adm_counter}@nhssalumni.test"

#             # Create User
#             user_doc = {
#                 "school_id": school_id,
#                 "mobile": mobile,
#                 "email": email,
#                 "password_hash": hashed_pwd,
#                 "roles": ["ALUMNI"],
#                 "verification_status": "APPROVED",
#                 "is_active": True,
#                 "created_at": datetime.now(timezone.utc)
#             }

#             # Avoid mobile duplicate
#             existing_user = await db.users.find_one({"mobile": mobile})
#             if existing_user:
#                 mobile = f"+9198421{random.randint(10000, 99999)}"
#                 user_doc["mobile"] = mobile

#             user_res = await db.users.insert_one(user_doc)
#             user_id = str(user_res.inserted_id)

#             # Assign Committee Role for the first 7 alumni in each batch
#             c_role = None
#             if i < len(COMMITTEE_ROLES_SEQUENCE):
#                 c_role_key, c_role_title = COMMITTEE_ROLES_SEQUENCE[i]
#                 c_role = c_role_key

#             # Create Alumni Document
#             alumni_doc = {
#                 "user_id": user_id,
#                 "school_id": school_id,
#                 "full_name": full_name,
#                 "mobile": mobile,
#                 "email": email,
#                 "gender": gender,
#                 "profile_photo_url": photo_url,
#                 "school_name": school_name,
#                 "joining_year": p_year - 5,
#                 "passing_year": p_year,
#                 "leaving_class": "12th",
#                 "admission_number": adm_no,
#                 "section": section,
#                 "batch_id": b_id,
#                 "current_city": city,
#                 "city": city,
#                 "state": "Tamil Nadu",
#                 "country": "India",
#                 "no_higher_education": False,
#                 "college_name": college,
#                 "degree": degree_tuple[0],
#                 "stream": degree_tuple[1],
#                 "college_joining_year": p_year,
#                 "college_passing_year": p_year + 4,
#                 "profession": profession,
#                 "verification_status": "APPROVED",
#                 "email_visible": True,
#                 "created_at": datetime.now(timezone.utc)
#             }

#             if c_role:
#                 alumni_doc["committee_role"] = c_role

#             alumni_res = await db.alumni.insert_one(alumni_doc)
#             alumni_id = str(alumni_res.inserted_id)

#             if c_role:
#                 committee_members_list.append({
#                     "alumni_id": alumni_id,
#                     "role": c_role,
#                     "assigned_at": datetime.now(timezone.utc)
#                 })
#                 coordinator_ids.append(alumni_id)

#                 # Grant BATCH_COORDINATOR role to user
#                 await db.users.update_one(
#                     {"_id": ObjectId(user_id)},
#                     {"$addToSet": {"roles": "BATCH_COORDINATOR"}}
#                 )

#             batch_added += 1
#             total_added += 1

#         # Update Batch document with committee_members and coordinators
#         await db.batches.update_one(
#             {"_id": b["_id"]},
#             {
#                 "$set": {"committee_members": committee_members_list},
#                 "$addToSet": {"coordinators": {"$each": coordinator_ids}}
#             }
#         )

#         batch_wise_counts[b_name] = batch_added
#         print(f"  Completed Batch {b_name}: {batch_added} alumni added, {len(committee_members_list)} committee roles assigned.")

#     print("\n" + "="*50)
#     print("SEEDING SUMMARY RESULTS")
#     print("="*50)
#     print(f"Total Dummy Alumni Added: {total_added}")
#     print("Batch-wise Counts:")
#     for b_title, count in batch_wise_counts.items():
#         print(f"  - {b_title}: {count} records")
    
#     total_db_alumni = await db.alumni.count_documents({"school_id": school_id})
#     print(f"Total Alumni in DB for School: {total_db_alumni}")
#     print("Seeding completed successfully with zero errors!")

# if __name__ == "__main__":
#     asyncio.run(seed())
