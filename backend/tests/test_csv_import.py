import pytest
import csv
import io

def test_csv_structure_validation():
    sample_csv = """Name,Batch,Admission Number,Mobile,Email
Arun Kumar,2010,ABC-2010-042,+919876543210,arun@example.com
Priya Sharma,2010,ABC-2010-043,+919876543211,priya@example.com
,2010,ABC-2010-044,+919876543212,invalid@example.com
"""
    reader = list(csv.DictReader(io.StringIO(sample_csv)))
    assert len(reader) == 3

    valid_rows = []
    invalid_rows = []

    for idx, row in enumerate(reader, start=1):
        name = (row.get("Name") or "").strip()
        batch = (row.get("Batch") or "").strip()
        if not name or not batch:
            invalid_rows.append((idx, "Missing required Name or Batch"))
        else:
            valid_rows.append(row)

    assert len(valid_rows) == 2
    assert len(invalid_rows) == 1
    assert invalid_rows[0][0] == 3
