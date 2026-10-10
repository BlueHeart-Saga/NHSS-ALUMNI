import pytest
from bson import ObjectId
from datetime import datetime, timezone
from app.api.programmes import CreateProgrammeRequest, RegisterProgrammeRequest, FamilyMemberSchema, CreateInviteRequest, serialize_doc

def test_serialize_doc_preserves_original_and_converts_id():
    doc = {
        "_id": ObjectId(),
        "title": "Test Programme",
        "created_at": datetime.now(timezone.utc)
    }
    original_id = doc["_id"]
    serialized = serialize_doc(doc)
    
    # Check that original doc retains _id (not mutated in place)
    assert "_id" in doc
    assert doc["_id"] == original_id

    # Check serialized dictionary has 'id' and ISO string created_at
    assert "id" in serialized
    assert serialized["id"] == str(original_id)
    assert "_id" not in serialized
    assert isinstance(serialized["created_at"], str)

def test_create_programme_request_schema():
    p = CreateProgrammeRequest(
        title="Microsoft, Google & Zoho Orientation",
        title_ta="நமது முன்னாள் மாணவர்களின் பிள்ளைகளுக்கான Microsoft, Google மற்றும் Zoho அறிமுகத் திட்டம்",
        description="Introduction to tech opportunities for alumni & families.",
        description_ta="அன்பார்ந்த NHSS முன்னாள் மாணவர்களே,\nநமது முன்னாள் மாணவர்களின் பிள்ளைகளுக்காக Microsoft, Google மற்றும் Zoho நிறுவனங்களின் மாணவர் திட்டங்கள் குறித்து அறிமுகப்படுத்தத் திட்டமிட்டுள்ளோம்.",
        category="Tech Orientation",
        mode="IN_PERSON",
        venue="NHSS Auditorium",
        visibility="PUBLIC",
        is_featured=True,
        capacity_limit=100,
        allow_family=True
    )
    assert p.title == "Microsoft, Google & Zoho Orientation"
    assert "Microsoft, Google மற்றும் Zoho" in p.title_ta
    assert "நமது முன்னாள் மாணவர்களின்" in p.description_ta
    assert p.visibility == "PUBLIC"
    assert p.allow_family is True

def test_family_member_schema():
    member = FamilyMemberSchema(
        name="Karthik S",
        relationship="SON",
        age=17,
        notes="High school student interested in Computer Science"
    )
    assert member.name == "Karthik S"
    assert member.relationship == "SON"

def test_register_programme_request_schema():
    reg = RegisterProgrammeRequest(
        notes="Attending with son",
        family_members=[
            FamilyMemberSchema(name="Karthik S", relationship="SON", age=17)
        ]
    )
    assert len(reg.family_members) == 1
    assert reg.family_members[0].name == "Karthik S"
