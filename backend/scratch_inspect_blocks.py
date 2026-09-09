import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

content = Path(r"c:\sagadevan\Projects\justgathernow\backend\process_provided_alumni_strict.py").read_text(encoding="utf-8")
raw = re.search(r'RAW_DATA = """(.*?)"""', content, re.DOTALL).group(1).strip()

blocks = [b for b in raw.split("\n\n") if b.strip()]

print(f"Total blocks found: {len(blocks)}")

for idx, b in enumerate(blocks[:3], 1):
    lines = b.split("\n")
    print(f"\n--- BLOCK {idx} ({len(lines)} lines) ---")
    for li, line in enumerate(lines):
        print(f"L{li:02d}: {line}")
