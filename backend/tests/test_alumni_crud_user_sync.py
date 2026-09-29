import pytest
from app.api.auth import calculate_profile_completion_and_resume_step

def test_profile_completion_requires_mobile_and_submission():
    # Case 1: Google auth draft user with full_name but no mobile and registration_submitted is False
    google_alumni = {
        "full_name": "Google User",
        "email": "googleuser@example.com",
        "mobile": None,
        "verification_status": "DRAFT",
        "registration_submitted": False,
        "passing_year": None
    }
    google_user = {
        "full_name": "Google User",
        "email": "googleuser@example.com",
        "mobile": None
    }

    is_complete, resume_step = calculate_profile_completion_and_resume_step(google_alumni, google_user)
    assert is_complete is False
    assert resume_step == 2  # Needs personal info & mobile

def test_profile_completion_complete_when_approved():
    approved_alumni = {
        "full_name": "Approved User",
        "verification_status": "APPROVED",
        "registration_submitted": True,
        "mobile": "+919876543210",
        "passing_year": 2015
    }
    approved_user = {
        "full_name": "Approved User",
        "verification_status": "APPROVED",
        "mobile": "+919876543210"
    }

    is_complete, resume_step = calculate_profile_completion_and_resume_step(approved_alumni, approved_user)
    assert is_complete is True
    assert resume_step == 6
