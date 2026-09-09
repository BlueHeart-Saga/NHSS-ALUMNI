import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import connect_to_mongo, get_db

async def dump_entire_alumni():
    await connect_to_mongo()
    db = get_db()
    
    school = await db.schools.find_one({})
    school_id = str(school["_id"]) if school else None
    
    query = {"school_id": school_id} if school_id else {}
    all_alumni = await db.alumni.find(query).to_list(5000)
    
    # Sort by passing year and full name
    all_alumni.sort(key=lambda x: (x.get("passing_year") or 0, (x.get("full_name") or "").lower()))

    artifact_path = Path(r"C:\Users\mani\.gemini\antigravity-ide\brain\131de061-d1cf-467a-9bb3-1d55f3072192\entire_db_alumni_table.md")
    
    lines = []
    lines.append("# Natarajan Higher Secondary School - Complete Database Alumni Collection\n")
    lines.append(f"**Total Records in Database (`db.alumni`)**: {len(all_alumni)}\n")
    lines.append("| # | Full Name | Name (Tamil) | Mobile | Gender | Passing Year | Class | City / Location | Profession / Role | Status |")
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
    print(f"DONE: Exported {len(all_alumni)} database alumni records!", flush=True)

if __name__ == "__main__":
    asyncio.run(dump_entire_alumni())
