import pytest
import io
import csv
import openpyxl
from bson import ObjectId
from app.api.alumni import _clean_cell, _normalize_row, _compute_field_updates, _is_valid_objectid_hex, _looks_like_excel_corruption

def test_clean_cell():
    assert _clean_cell('="6a9c48f1a8e1981cd71837e2"') == "6a9c48f1a8e1981cd71837e2"
    assert _clean_cell('"6a9c48f1a8e1981cd71837e2"') == "6a9c48f1a8e1981cd71837e2"
    assert _clean_cell("  6a9c48f1a8e1981cd71837e2  ") == "6a9c48f1a8e1981cd71837e2"
    assert _clean_cell(None) == ""

def test_excel_corruption_detection():
    assert _looks_like_excel_corruption("6.64829E+23") is True
    assert _looks_like_excel_corruption("6a9c48f1a8e1981cd71837e2") is False
    assert _is_valid_objectid_hex("6a9c48f1a8e1981cd71837e2") is True
    assert _is_valid_objectid_hex("6.64829E+23") is False

def test_normalize_row_aliases():
    raw_row = {
        "Alumni ID": "6a9c48f1a8e1981cd71837e2",
        "Full Name": "Karpagadevi .V",
        "Passing Year": "2010",
        "Mobile Number": "+918015391811",
        "Admission Number": "ADM100",
        "Designation": "Senior Engineer"
    }
    normalized = _normalize_row(raw_row)
    assert normalized["alumni_id"] == "6a9c48f1a8e1981cd71837e2"
    assert normalized["name"] == "Karpagadevi .V"
    assert normalized["batch_year"] == "2010"
    assert normalized["mobile"] == "+918015391811"
    assert normalized["admission_number"] == "ADM100"
    assert normalized["profession"] == "Senior Engineer"

def test_compute_field_updates():
    existing_doc = {
        "_id": ObjectId("6a9c48f1a8e1981cd71837e2"),
        "full_name": "Old Name",
        "passing_year": 2010,
        "mobile": "+918015391811",
        "current_city": "Madurai",
        "profession": "Software Engineer"
    }
    csv_row = {
        "name": "New Updated Name",
        "batch_year": "2010",
        "mobile": "+918015391811",
        "current_city": "Chennai",
        "profession": "Lead Architect"
    }
    updates = _compute_field_updates(csv_row, existing_doc, None)
    assert updates["full_name"] == "New Updated Name"
    assert updates["current_city"] == "Chennai"
    assert updates["profession"] == "Lead Architect"
    assert "mobile" not in updates  # Unchanged
    assert "passing_year" not in updates  # Unchanged
