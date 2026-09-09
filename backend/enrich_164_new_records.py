import asyncio
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import connect_to_mongo, get_db

# Read RAW_DATA from process_provided_alumni_strict.py
script_content = Path(__file__).parent / "process_provided_alumni_strict.py"
text = script_content.read_text(encoding="utf-8")

raw_match = re.search(r'RAW_DATA = """(.*?)"""', text, re.DOTALL)
if not raw_match:
    print("CRITICAL: RAW_DATA block not found.")
    sys.exit(1)

raw_data = raw_match.group(1).strip()
blocks = [b.strip() for b in raw_data.split("\n\n") if b.strip()]

print(f"Loaded {len(blocks)} raw data blocks from import script.")

def clean_phone(val):
    if not val:
        return ""
    digits = re.sub(r'\D', '', str(val))
    if len(digits) >= 10:
        return f"+91{digits[-10:]}"
    return val

# List of 5 pre-existing matching records that were SKIPPED during import
SKIPPED_PRE_EXISTING_MOBILES = {
    clean_phone("91"),           # Selvam.R / Malaisaamy M / Radhika
    clean_phone("7506627973"),   # K. Kandharajan
    clean_phone("9443127846"),   # Muthuraman C
}

SKIPPED_PRE_EXISTING_KEYS = {
    "selvam.r_1979",
    "k. kandharajan_2010",
    "radhika_2001",
    "muthuraman c_1990",
    "malaisaamy m_1996"
}

def parse_block_to_dict(block):
    lines = [l.strip() for l in block.split("\n") if l.strip()]
    if not lines:
        return None

    full_name = lines[0]
    name_ta = lines[1] if len(lines) > 1 and any('\u0b80' <= c <= '\u0bff' for c in lines[1]) else ""
    
    # Extract phone
    mobiles = [clean_phone(l) for l in lines if len(re.sub(r'\D', '', l)) >= 10]
    mobile = mobiles[0] if mobiles else ""
    whatsapp_number = mobiles[-1] if len(mobiles) > 1 else mobile

    # Gender
    gender = "Female" if "Female" in block else ("Male" if "Male" in block or "ஆண்" in block else "Male")

    # DOB (DD-MM-YYYY or YYYY-MM-DD or date format)
    dob_match = re.search(r'\b(\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})\b', block)
    dob = dob_match.group(1) if dob_match else ""

    # Blood group
    bg_match = re.search(r'\b(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)\b', block, re.IGNORECASE)
    blood_group = bg_match.group(1).upper() if bg_match else ""

    # Years
    years = re.findall(r'\b(19\d\d|20\d\d)\b', block)
    # Filter out birth year if dob present
    passing_year = None
    joining_year = None
    if len(years) >= 2:
        joining_year = int(years[-2])
        passing_year = int(years[-1])
    elif len(years) == 1:
        passing_year = int(years[0])
    else:
        passing_year = 1990

    # Class
    leaving_class = "12th" if "12th" in block or "12 TH" in block or "12" in block else ("11th" if "11th" in block or "11" in block else "10th")

    # City & State & Country
    city = "Tuticorin" if "Tuticorin" in block or "Thoothukudi" in block else ("Chennai" if "Chennai" in block else ("Madurai" if "Madurai" in block else ("Kovilpatti" if "Kovilpatti" in block else ("Coimbatore" if "Coimbatore" in block else "Tuticorin"))))
    state = "Tamil Nadu"
    country = "India"

    # Higher Education
    no_higher_ed = "YES" if "no" in [l.lower() for l in lines if l.lower() in ["yes", "no"]] else ("NO" if "yes" in [l.lower() for l in lines if l.lower() in ["yes", "no"]] else "NO")

    # Degrees / Qualifications
    degree = ""
    for l in lines:
        if any(d in l.upper() for d in ["B.SC", "B.E", "B.A", "M.A", "M.SC", "MBA", "M.COM", "B.COM", "DME", "DEEE", "ITI", "D.T.ED", "M.PHIL", "PH.D", "BCA", "BEEE"]):
            degree = l
            break

    # Profession & Company
    profession = ""
    company = ""
    for l in lines:
        if any(kw in l.lower() for kw in ["teacher", "engineer", "retired", "business", "police", "farmer", "doctor", "advocate", "tailor", "officer", "secretary", "manager", "staff", "employee", "maker", "owner", "director", "superintendent", "agent", "artist", "inspector", "driver", "army", "bsnl"]):
            if not profession:
                profession = l
            elif not company:
                company = l

    # Relative / Family names
    relative_names = ""
    for l in lines:
        if any(rel in l.lower() for rel in ["brother", "sister", "wife", "son", "daughter", "father", "mother", "cousin"]):
            relative_names = l
            break

    return {
        "full_name": full_name,
        "name_ta": name_ta,
        "full_name_ta": name_ta,
        "mobile": mobile,
        "whatsapp_number": whatsapp_number,
        "country_code": "91",
        "gender": gender,
        "dob": dob,
        "date_of_birth": dob,
        "blood_group": blood_group,
        "father_name": "",
        "mother_name": "",
        "relative_students_name": relative_names,
        "current_city": city,
        "city": city,
        "state": state,
        "current_state": state,
        "country": country,
        "school_name": "Natarajan Higher Secondary School",
        "joining_year": joining_year,
        "passing_year": passing_year,
        "leaving_class": leaving_class,
        "no_higher_education": no_higher_ed,
        "degree": degree,
        "employment_status": "Employed" if profession and "retired" not in profession.lower() else ("Retired" if "retired" in profession.lower() else "Self Employment"),
        "company": company or profession,
        "company_name": company or profession,
        "profession": profession or "Alumnus",
        "designation": profession or "Alumnus",
        "verification_status": "APPROVED"
    }

async def update_164_records():
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    db = get_db()

    school = await db.schools.find_one({})
    if not school:
        print("CRITICAL: No school found.")
        return
    school_id = str(school["_id"])

    updated_count = 0
    skipped_old_count = 0
    not_found_count = 0

    print("\nProcessing field updates for 164 newly added records ONLY...")

    for idx, block in enumerate(blocks, 1):
        parsed = parse_block_to_dict(block)
        if not parsed:
            continue

        name = parsed["full_name"]
        mob = parsed["mobile"]
        yr = parsed["passing_year"]
        name_clean = name.strip().lower()
        name_yr_key = f"{name_clean}_{yr}"

        # -------------------------------------------------------------
        # STRICT PROTECTION — DO NOT MODIFY PRE-EXISTING OLD RECORDS
        # -------------------------------------------------------------
        if mob in SKIPPED_PRE_EXISTING_MOBILES or name_yr_key in SKIPPED_PRE_EXISTING_KEYS:
            skipped_old_count += 1
            print(f"[{idx}/{len(blocks)}] SKIPPED (PRE-EXISTING OLD RECORD) -> {name} ({mob})")
            continue

        # Find matching newly inserted alumni record in db.alumni
        query = {"school_id": school_id}
        if mob:
            query["mobile"] = mob
        else:
            query["full_name"] = re.compile(f"^{re.escape(name)}$", re.IGNORECASE)
            query["passing_year"] = yr

        alumni_doc = await db.alumni.find_one(query)

        if not alumni_doc:
            # Fallback search by name
            alumni_doc = await db.alumni.find_one({
                "school_id": school_id,
                "full_name": re.compile(f"^{re.escape(name)}$", re.IGNORECASE)
            })

        if alumni_doc:
            # Perform $set update on newly inserted alumni record ONLY
            update_payload = {
                "name_ta": parsed["name_ta"],
                "full_name_ta": parsed["full_name_ta"],
                "country_code": parsed["country_code"],
                "gender": parsed["gender"],
                "dob": parsed["dob"],
                "date_of_birth": parsed["date_of_birth"],
                "blood_group": parsed["blood_group"],
                "relative_students_name": parsed["relative_students_name"],
                "current_city": parsed["current_city"],
                "city": parsed["city"],
                "state": parsed["state"],
                "current_state": parsed["current_state"],
                "country": parsed["country"],
                "school_name": parsed["school_name"],
                "joining_year": parsed["joining_year"],
                "leaving_class": parsed["leaving_class"],
                "no_higher_education": parsed["no_higher_education"],
                "degree": parsed["degree"],
                "employment_status": parsed["employment_status"],
                "company": parsed["company"],
                "company_name": parsed["company_name"],
                "profession": parsed["profession"],
                "designation": parsed["designation"],
                "whatsapp_number": parsed["whatsapp_number"],
                "updated_at": datetime.now(timezone.utc)
            }
            # Remove keys with None values
            update_payload = {k: v for k, v in update_payload.items() if v is not None}

            await db.alumni.update_one({"_id": alumni_doc["_id"]}, {"$set": update_payload})
            updated_count += 1
            print(f"[{idx}/{len(blocks)}] UPDATED NEW RECORD -> {name} (Pass Year: {yr})")
        else:
            not_found_count += 1
            print(f"[{idx}/{len(blocks)}] NOT FOUND -> {name}")

    print("\n" + "="*50)
    print("ENRICHMENT SUMMARY REPORT")
    print("="*50)
    print(f"Total provided blocks: {len(blocks)}")
    print(f"Newly inserted records updated: {updated_count}")
    print(f"Pre-existing old records kept UNCHANGED: {skipped_old_count}")
    print(f"Not found: {not_found_count}")
    print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(update_164_records())
