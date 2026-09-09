import asyncio
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import connect_to_mongo, get_db

# Read RAW_DATA from process_provided_alumni_strict.py
content = Path(r"c:\sagadevan\Projects\justgathernow\backend\process_provided_alumni_strict.py").read_text(encoding="utf-8")
raw = re.search(r'RAW_DATA = """(.*?)"""', content, re.DOTALL).group(1).strip()
blocks = [b for b in raw.split("\n\n") if b.strip()]

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

def parse_exact_block(b):
    lines = [l.strip() for l in b.split("\n") if l.strip()]
    if not lines:
        return None

    full_name = lines[0]
    name_ta = lines[1] if len(lines) > 1 and any('\u0b80' <= c <= '\u0bff' for c in lines[1]) else ""

    mobiles = [clean_phone(l) for l in lines if len(re.sub(r'\D', '', l)) >= 10]
    mobile = mobiles[0] if mobiles else ""
    whatsapp = mobiles[-1] if len(mobiles) > 1 else mobile

    gender = "Female" if "Female" in b else ("Male" if "Male" in b or "ஆண்" in b else "Male")

    dob_m = re.search(r'\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2}|[A-Za-z]{3}-\d{2})\b', b)
    dob = dob_m.group(1) if dob_m else ""

    bg_m = re.search(r'\b(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)\b', b, re.IGNORECASE)
    blood_group = bg_m.group(1).upper() if bg_m else ""

    years = re.findall(r'\b(19\d\d|20\d\d)\b', b)
    if dob:
        dob_yr_m = re.search(r'(19\d\d|20\d\d)', dob)
        if dob_yr_m:
            dob_yr = dob_yr_m.group(1)
            if dob_yr in years and len(years) > 1:
                years.remove(dob_yr)

    joining_year = int(years[0]) if len(years) >= 2 else None
    passing_year = int(years[-1]) if len(years) >= 1 else 1990

    leaving_class = ""
    for l in lines:
        if re.search(r'\b(12th|12 TH|12|11th|11|10th|10 TH|10|9th|9|8th|8|7th|7|6th|6)\b', l, re.I) and len(l) <= 6:
            leaving_class = l
            break

    section = ""
    for l in lines:
        if l in ["A", "B", "C", "D"]:
            section = l
            break

    no_higher_ed = ""
    for l in lines:
        if l.lower() in ["yes", "no"]:
            no_higher_ed = "YES" if l.lower() == "no" else "NO"

    degree = ""
    for l in lines:
        if any(d in l.upper() for d in ["B.SC", "B.E", "B.A", "M.A", "M.SC", "MBA", "M.COM", "DME", "DEEE", "ITI", "D.T.ED", "M.PHIL", "PH.D", "BCA", "MFSC", "D.C.E", "DGNM", "BEEE", "D.CE", "D.EEE", "PUC"]):
            degree = l
            break

    city = ""
    for c in ["Tuticorin", "Thoothukudi", "Madurai", "Chennai", "Kovilpatti", "Coimbatore", "Tirunelveli", "Salem", "Ernakulam", "Ottapidaram", "Eppothum vendran", "Eppodumvendran", "Kattunayakanpatti", "Kattunaickanpatti", "Authanoor", "Athanur", "Kumarettipuram", "Duraisamypuram", "Villathikulam"]:
        if c.lower() in b.lower():
            city = "Tuticorin" if c.lower() in ["tuticorin", "thoothukudi"] else c
            break
    if not city:
        city = "Tuticorin"

    profession = ""
    company = ""
    for l in lines:
        if any(kw in l.lower() for kw in ["teacher", "engineer", "retired", "business", "police", "farmer", "doctor", "advocate", "tailor", "officer", "secretary", "manager", "staff", "employee", "maker", "owner", "director", "superintendent", "agent", "artist", "inspector", "driver", "army", "bsnl", "rtd", "assistant", "merchant", "tailoring", "crpf", "self employment"]):
            if not profession:
                profession = l
            elif not company and l != profession:
                company = l

    return {
        "full_name": full_name,
        "name_ta": name_ta,
        "full_name_ta": name_ta,
        "mobile": mobile,
        "whatsapp_number": whatsapp,
        "country_code": "91",
        "gender": gender,
        "date_of_birth": dob,
        "dob": dob,
        "blood_group": blood_group,
        "current_city": city,
        "city": city,
        "state": "Tamil Nadu",
        "current_state": "Tamil Nadu",
        "country": "India",
        "school_name": "Natarajan Higher Secondary School",
        "joining_year": joining_year,
        "passing_year": passing_year,
        "leaving_class": leaving_class or "10th",
        "section": section,
        "no_higher_education": no_higher_ed or "NO",
        "degree": degree,
        "employment_status": "Retired" if "retired" in profession.lower() or "rtd" in profession.lower() or "ex army" in profession.lower() else "Employed",
        "company": company or profession,
        "company_name": company or profession,
        "profession": profession or "Alumnus",
        "designation": profession or "Alumnus",
        "verification_status": "APPROVED"
    }

async def update_exact_164():
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    db = get_db()

    school = await db.schools.find_one({})
    if not school:
        print("CRITICAL: No school found.")
        return
    school_id = str(school["_id"])

    updated_count = 0
    skipped_count = 0

    print("\nUpdating exact fields for the 164 newly added alumni records...")

    for idx, b in enumerate(blocks, 1):
        parsed = parse_exact_block(b)
        if not parsed:
            continue

        name = parsed["full_name"]
        mob = parsed["mobile"]
        yr = parsed["passing_year"]
        name_clean = name.strip().lower()
        name_yr_key = f"{name_clean}_{yr}"

        # Skip pre-existing old records
        if mob in SKIPPED_PRE_EXISTING_MOBILES or name_yr_key in SKIPPED_PRE_EXISTING_KEYS:
            skipped_count += 1
            print(f"[{idx}/{len(blocks)}] SKIPPED (PRE-EXISTING OLD RECORD) -> {name}")
            continue

        query = {"school_id": school_id}
        if mob:
            query["mobile"] = mob
        else:
            query["full_name"] = re.compile(f"^{re.escape(name)}$", re.IGNORECASE)
            query["passing_year"] = yr

        alumni_doc = await db.alumni.find_one(query)
        if not alumni_doc:
            alumni_doc = await db.alumni.find_one({
                "school_id": school_id,
                "full_name": re.compile(f"^{re.escape(name)}$", re.IGNORECASE)
            })

        if alumni_doc:
            update_data = {
                "name_ta": parsed["name_ta"],
                "full_name_ta": parsed["full_name_ta"],
                "country_code": parsed["country_code"],
                "gender": parsed["gender"],
                "date_of_birth": parsed["date_of_birth"],
                "dob": parsed["dob"],
                "blood_group": parsed["blood_group"],
                "current_city": parsed["current_city"],
                "city": parsed["city"],
                "state": parsed["state"],
                "current_state": parsed["current_state"],
                "country": parsed["country"],
                "school_name": parsed["school_name"],
                "joining_year": parsed["joining_year"],
                "passing_year": parsed["passing_year"],
                "leaving_class": parsed["leaving_class"],
                "section": parsed["section"],
                "no_higher_education": parsed["no_higher_education"],
                "degree": parsed["degree"],
                "employment_status": parsed["employment_status"],
                "company": parsed["company"],
                "company_name": parsed["company_name"],
                "profession": parsed["profession"],
                "designation": parsed["designation"],
                "whatsapp_number": parsed["whatsapp_number"],
                "verification_status": "APPROVED",
                "updated_at": datetime.now(timezone.utc)
            }

            await db.alumni.update_one({"_id": alumni_doc["_id"]}, {"$set": update_data})
            updated_count += 1
            print(f"[{idx}/{len(blocks)}] UPDATED -> {name} ({parsed['name_ta']}) | Phone: {mob} | Pass Year: {yr}")

    print("\n" + "="*50)
    print("EXACT FIELD UPDATE COMPLETE")
    print("="*50)
    print(f"Total provided blocks: {len(blocks)}")
    print(f"164 Newly inserted records updated: {updated_count}")
    print(f"Pre-existing old records untouched: {skipped_count}")
    print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(update_exact_164())
