import re
from pathlib import Path

# Read RAW_DATA from process_provided_alumni_strict.py
script_content = Path(r"c:\sagadevan\Projects\justgathernow\backend\process_provided_alumni_strict.py").read_text(encoding="utf-8")

# Extract RAW_DATA string content
raw_match = re.search(r'RAW_DATA = """(.*?)"""', script_content, re.DOTALL)
if not raw_match:
    print("Could not find RAW_DATA block.")
    exit(1)

raw_data = raw_match.group(1).strip()
blocks = [b.strip() for b in raw_data.split("\n\n") if b.strip()]

artifact_path = Path(r"C:\Users\mani\.gemini\antigravity-ide\brain\131de061-d1cf-467a-9bb3-1d55f3072192\alumni_import_records.md")

lines = []
lines.append("# Natarajan Higher Secondary School - Complete Provided Alumni Data List\n")
lines.append(f"**Total Provided Records**: {len(blocks)}\n")
lines.append("| # | Full Name | Name (Tamil) | Mobile | Gender | Passing Year | Leaving Class | City / Location | Profession / Details | Verification Status |")
lines.append("|---|---|---|---|---|---|---|---|---|---|")

def clean_phone(val):
    digits = re.sub(r'\D', '', str(val))
    if len(digits) >= 10:
        return f"+91{digits[-10:]}"
    return val

for idx, block in enumerate(blocks, 1):
    block_lines = [l.strip() for l in block.split("\n") if l.strip()]
    full_name = block_lines[0] if len(block_lines) > 0 else "-"
    name_ta = block_lines[1] if len(block_lines) > 1 else "-"
    raw_mobile = block_lines[2] if len(block_lines) > 2 else "-"
    mobile = clean_phone(raw_mobile)
    
    gender = "Female" if "Female" in block else ("Male" if "Male" in block or "ஆண்" in block else "-")
    
    years = re.findall(r'\b(19\d\d|20\d\d)\b', block)
    passing_year = years[-1] if len(years) >= 2 else (years[0] if len(years) == 1 else "-")
    
    leaving_class = "12th" if "12th" in block or "12" in block else ("10th" if "10th" in block or "10" in block else ("11th" if "11th" in block or "11" in block else "-"))
    
    city = "Tuticorin" if "Tuticorin" in block or "Thoothukudi" in block else ("Chennai" if "Chennai" in block else ("Madurai" if "Madurai" in block else ("Kovilpatti" if "Kovilpatti" in block else ("Coimbatore" if "Coimbatore" in block else "-"))))
    
    # Profession detection
    prof = "-"
    for l in block_lines:
        if any(kw in l.lower() for kw in ["teacher", "engineer", "retired", "business", "police", "farmer", "doctor", "advocate", "tailor", "officer", "secretary", "manager", "staff", "employee", "maker", "owner", "director", "superintendent"]):
            prof = l
            break
            
    lines.append(f"| {idx} | {full_name} | {name_ta} | `{mobile}` | {gender} | {passing_year} | {leaving_class} | {city} | {prof} | APPROVED |")

artifact_path.write_text("\n".join(lines), encoding="utf-8")
print(f"Successfully generated artifact for {len(blocks)} records!")
