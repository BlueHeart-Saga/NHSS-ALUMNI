import asyncio
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.core.database import connect_to_mongo, get_db

async def dump_alumni():
    await connect_to_mongo()
    db = get_db()
    school = await db.schools.find_one({})
    school_id = str(school["_id"])
    
    alumni_cursor = db.alumni.find({"school_id": school_id})
    all_alumni = await alumni_cursor.to_list(2000)
    print(f"Total Alumni in Database: {len(all_alumni)}", flush=True)

    # Group by passing year
    all_alumni.sort(key=lambda x: (x.get("passing_year") or 0, x.get("full_name") or ""))

    artifact_path = Path(r"C:\Users\mani\.gemini\antigravity-ide\brain\131de061-d1cf-467a-9bb3-1d55f3072192\alumni_import_records.md")
    
    lines = []
    lines.append("# Natarajan Higher Secondary School - Imported Alumni Records\n")
    lines.append(f"**Total Registered Alumni**: {len(all_alumni)}\n")
    lines.append("| # | Full Name | Name (Tamil) | Mobile | Gender | Passing Year | Leaving Class | City | Occupation / Role | Status |")
    lines.append("|---|---|---|---|---|---|---|---|---|---|")

    for idx, a in enumerate(all_alumni, 1):
        name = a.get("full_name") or "-"
        name_ta = a.get("name_ta") or a.get("full_name_ta") or "-"
        mobile = a.get("mobile") or "-"
        gender = a.get("gender") or "-"
        year = a.get("passing_year") or "-"
        leaving_class = a.get("leaving_class") or "-"
        city = a.get("current_city") or a.get("city") or "-"
        profession = a.get("profession") or "-"
        status = a.get("verification_status") or "APPROVED"
        lines.append(f"| {idx} | {name} | {name_ta} | `{mobile}` | {gender} | {year} | {leaving_class} | {city} | {profession} | {status} |")

    artifact_path.write_text("\n".join(lines), encoding="utf-8")
    print("Export complete to markdown artifact!", flush=True)

if __name__ == "__main__":
    asyncio.run(dump_alumni())
