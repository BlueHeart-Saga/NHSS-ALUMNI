import re
import sys
import json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

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

parsed_records = []

for idx, b in enumerate(blocks, 1):
    lines = [l.strip() for l in b.split("\n") if l.strip()]
    if not lines:
        continue

    full_name = lines[0]
    name_ta = lines[1] if len(lines) > 1 and any('\u0b80' <= c <= '\u0bff' for c in lines[1]) else ""

    # Phone numbers
    mobiles = [clean_phone(l) for l in lines if len(re.sub(r'\D', '', l)) >= 10]
    mobile = mobiles[0] if mobiles else ""
    whatsapp = mobiles[-1] if len(mobiles) > 1 else mobile

    # Gender
    gender = "Female" if "Female" in b else ("Male" if "Male" in b or "ஆண்" in b else "Male")

    # DOB
    dob_m = re.search(r'\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2}|[A-Za-z]{3}-\d{2})\b', b)
    dob = dob_m.group(1) if dob_m else ""

    # Blood group
    bg_m = re.search(r'\b(A\+|A-|B\+|B-|O\+|O-|AB\+|AB-)\b', b, re.IGNORECASE)
    blood_group = bg_m.group(1).upper() if bg_m else ""

    # Years
    years = re.findall(r'\b(19\d\d|20\d\d)\b', b)
    # Remove DOB year if matches
    if dob:
        dob_yr_m = re.search(r'(19\d\d|20\d\d)', dob)
        if dob_yr_m:
            dob_yr = dob_yr_m.group(1)
            if dob_yr in years and len(years) > 1:
                years.remove(dob_yr)

    joining_year = int(years[0]) if len(years) >= 2 else None
    passing_year = int(years[-1]) if len(years) >= 1 else 1990

    # Class
    leaving_class = ""
    for l in lines:
        if re.search(r'\b(12th|12 TH|12|11th|11|10th|10 TH|10|9th|9|8th|8|7th|7|6th|6)\b', l, re.I) and len(l) <= 6:
            leaving_class = l
            break

    # Section
    section = ""
    for l in lines:
        if l in ["A", "B", "C", "D"]:
            section = l
            break

    # Higher Ed
    no_higher_ed = ""
    for l in lines:
        if l.lower() in ["yes", "no"]:
            no_higher_ed = "YES" if l.lower() == "no" else "NO"

    # Degree
    degree = ""
    for l in lines:
        if any(d in l.upper() for d in ["B.SC", "B.E", "B.A", "M.A", "M.SC", "MBA", "M.COM", "DME", "DEEE", "ITI", "D.T.ED", "M.PHIL", "PH.D", "BCA", "MFSC", "D.C.E", "DGNM", "BEEE", "D.CE", "D.EEE", "PUC"]):
            degree = l
            break

    # Location
    city = ""
    for c in ["Tuticorin", "Thoothukudi", "Madurai", "Chennai", "Kovilpatti", "Coimbatore", "Tirunelveli", "Salem", "Ernakulam", "Ottapidaram", "Eppothum vendran", "Eppodumvendran", "Kattunayakanpatti", "Kattunaickanpatti", "Authanoor", "Athanur", "Kumarettipuram", "Duraisamypuram", "Villathikulam"]:
        if c.lower() in b.lower():
            city = "Tuticorin" if c.lower() in ["tuticorin", "thoothukudi"] else c
            break
    if not city:
        city = "Tuticorin"

    # Profession & Company
    profession = ""
    company = ""
    for l in lines:
        if any(kw in l.lower() for kw in ["teacher", "engineer", "retired", "business", "police", "farmer", "doctor", "advocate", "tailor", "officer", "secretary", "manager", "staff", "employee", "maker", "owner", "director", "superintendent", "agent", "artist", "inspector", "driver", "army", "bsnl", "rtd", "assistant", "merchant", "tailoring", "crpf", "self employment"]):
            if not profession:
                profession = l
            elif not company and l != profession:
                company = l

    parsed_records.append({
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
        "father_name": "",
        "mother_name": "",
        "current_city": city,
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
    })

print(f"Parsed {len(parsed_records)} structured alumni records.")
print("\nSample Record 1:", json.dumps(parsed_records[0], indent=2, ensure_ascii=False))
print("\nSample Record 3:", json.dumps(parsed_records[2], indent=2, ensure_ascii=False))
