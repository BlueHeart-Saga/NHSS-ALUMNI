from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class SendOTPRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, example="admin@school.com")
    mobile: Optional[str] = Field(None, example="+919876543210")
    check_user: Optional[bool] = False
    password: Optional[str] = None
    for_password_reset: Optional[bool] = False
    check_already_registered: Optional[bool] = False
    for_developer: Optional[bool] = False

class SendOTPResponse(BaseModel):
    success: bool
    message: str
    email: Optional[str] = None
    mobile: Optional[str] = None
    dev_otp: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, example="admin@school.com")
    mobile: Optional[str] = Field(None, example="+919876543210")
    otp: str

class UpdatePasswordRequest(BaseModel):
    password: str

class SetPasswordWithOTPRequest(BaseModel):
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    otp: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    roles: List[str]
    verification_status: Optional[str] = None
    registration_required: bool = False
    resume_step: Optional[int] = 2
    alumni_id: Optional[str] = None
    school_id: Optional[str] = None

class UserRegistrationRequest(BaseModel):
    full_name: str
    mobile: str
    email: EmailStr
    gender: Optional[str] = None
    dob: Optional[str] = None
    current_city: Optional[str] = None
    password: Optional[str] = None
    
    degree: Optional[str] = None
    stream: Optional[str] = None
    joining_year: Optional[int] = None
    passing_year: int
    admission_number: Optional[str] = "N/A"
    section: Optional[str] = "A"
    
    chapter: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    profession: Optional[str] = None
    total_experience: Optional[str] = None
    industries: Optional[str] = None
    skills: Optional[str] = None
    profile_photo_url: Optional[str] = None
    
    other_college: Optional[str] = None
    other_degree: Optional[str] = None
    other_stream: Optional[str] = None
    other_passing_year: Optional[int] = None
    
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    linkedin_url: Optional[str] = None

class CreateAdminRequest(BaseModel):
    full_name: str
    mobile: str
    email: Optional[EmailStr] = None
    role: str = "SCHOOL_ADMIN"
    passing_year: Optional[int] = 2005

# --- User & Profile Schemas ---
class UserProfileResponse(BaseModel):
    id: str
    user_id: str
    school_id: str
    full_name: Optional[str] = "User"
    mobile: Optional[str] = None
    email: Optional[str] = None
    profile_photo_url: Optional[str] = None
    passing_year: Optional[int] = None
    batch_id: Optional[str] = None
    admission_number: Optional[str] = None
    section: Optional[str] = None
    current_city: Optional[str] = None
    profession: Optional[str] = None
    verification_status: Optional[str] = "PENDING"
    verification_notes: Optional[str] = None
    roles: List[str] = ["ALUMNI"]
    email_visible: bool = False
    created_at: datetime

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    current_city: Optional[str] = None
    profession: Optional[str] = None
    profile_photo_url: Optional[str] = None
    email_visible: Optional[bool] = None

# --- Verification Schemas ---
class VerificationDecisionRequest(BaseModel):
    status: str = Field(..., example="APPROVED") # APPROVED, REJECTED, SUSPENDED
    notes: Optional[str] = None

class CSVRowError(BaseModel):
    row: int
    data: Dict[str, Any]
    reason: str

class CSVImportResult(BaseModel):
    total_rows: int
    imported: int
    matched_and_approved: int
    duplicates_flagged: int
    skipped: int
    errors: List[str]
    error_details: List[CSVRowError] = []

# --- School Admin Enquiry Schemas ---
class SchoolAdminEnquiryRequest(BaseModel):
    full_name: str = Field(..., example="Dr. Ramesh Kumar")
    email: EmailStr = Field(..., example="principal@school.edu.in")
    mobile: str = Field(..., example="+919876543210")
    responsibility: str = Field(..., example="Principal")
    school_name: str = Field(..., example="St. Xavier Higher Secondary School")
    city: Optional[str] = "Madurai"
    state: Optional[str] = "Tamil Nadu"
    country: Optional[str] = "India"
    message: Optional[str] = None

class SchoolAdminEnquiryResponse(BaseModel):
    id: str
    full_name: str
    email: str
    mobile: str
    responsibility: str
    school_name: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    message: Optional[str] = None
    status: str = "PENDING" # PENDING, CONTACTED, APPROVED, REJECTED
    created_at: datetime

class EnquiryStatusUpdateRequest(BaseModel):
    status: str = Field(..., example="APPROVED") # CONTACTED, APPROVED, REJECTED
    notes: Optional[str] = None

# --- School Schemas ---
class SchoolProfileResponse(BaseModel):
    id: str
    name: str
    code: str
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    website: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    established_year: Optional[int] = None
    status: Optional[str] = "ACTIVE"

class UpdateSchoolRequest(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

# --- Batch Schemas ---
class CreateBatchRequest(BaseModel):
    name: str = Field(..., example="Class of 2010")
    passing_year: int = Field(..., example=2010)
    description: Optional[str] = "Cohort batch"

class BatchResponse(BaseModel):
    id: str
    school_id: str
    name: str
    passing_year: int
    description: Optional[str] = None
    coordinators: List[str] = []
    total_members: int = 0
    status: str = "ACTIVE"
    created_at: datetime

class AssignCoordinatorRequest(BaseModel):
    alumni_id: str

# --- Event Schemas ---
class MapCoordinates(BaseModel):
    lat: float
    lng: float

class CreateEventRequest(BaseModel):
    title: str = Field(..., example="2010 Batch Reunion")
    batch_id: Optional[str] = None # Null if school-wide
    description: str
    event_date: str = Field(..., example="2026-12-20")
    start_time: str = Field(..., example="10:00 AM")
    end_time: str = Field(..., example="05:00 PM")
    venue: str
    address: str
    map_coordinates: Optional[MapCoordinates] = None
    registration_deadline: Optional[str] = None
    guest_allowed: bool = True
    max_capacity: int = 300
    publish_immediately: bool = True

class EventResponse(BaseModel):
    id: str
    school_id: str
    batch_id: Optional[str] = None
    batch_name: Optional[str] = None
    title: str
    description: str
    event_date: str
    start_time: str
    end_time: str
    venue: str
    address: str
    map_coordinates: Optional[MapCoordinates] = None
    registration_deadline: Optional[str] = None
    guest_allowed: bool
    max_capacity: int
    status: str # DRAFT, PUBLISHED, CANCELLED, COMPLETED
    attending_count: int = 0
    maybe_count: int = 0
    declined_count: int = 0
    total_guests: int = 0
    created_by: str
    created_at: datetime

# --- Attendance & RSVP Schemas ---
class RSVPRequest(BaseModel):
    rsvp_status: str = Field(..., example="ATTENDING") # ATTENDING, MAYBE, DECLINED
    adults_count: int = Field(default=1, ge=1)
    children_count: int = Field(default=0, ge=0)

class RSVPResponse(BaseModel):
    event_id: str
    alumni_id: str
    rsvp_status: str
    adults_count: int
    children_count: int
    total_expected: int
    qr_token: str
    updated_at: datetime

class AttendanceSummaryResponse(BaseModel):
    event_id: str
    total_rsvp_count: int
    confirmed_alumni: int
    maybe_alumni: int
    declined_alumni: int
    total_adult_guests: int
    total_child_guests: int
    total_expected_people: int
    checked_in_count: int

# --- Check-in Schemas ---
class ScanQRRequest(BaseModel):
    qr_token: str
    event_id: str

class ManualCheckinRequest(BaseModel):
    event_id: str
    alumni_id: str

class CheckinResultResponse(BaseModel):
    success: bool
    message: str
    alumni_name: str
    batch_name: str
    checked_in_at: str
    total_guests: int

# --- Announcement Schemas ---
class CreateAnnouncementRequest(BaseModel):
    target: str = Field(..., example="BATCH") # SCHOOL, BATCH
    batch_id: Optional[str] = None
    title: str
    content: str

class AnnouncementResponse(BaseModel):
    id: str
    school_id: str
    batch_id: Optional[str] = None
    target: str
    title: str
    content: str
    created_by_name: str
    created_at: datetime

# --- Memory & Photo Schemas ---
class CreateMemoryRequest(BaseModel):
    batch_id: str
    event_id: Optional[str] = None
    title: Optional[str] = None
    image_url: str
    thumbnail_url: Optional[str] = None

class MemoryResponse(BaseModel):
    id: str
    school_id: str
    batch_id: str
    event_id: Optional[str] = None
    title: Optional[str] = None
    image_url: str
    uploader_name: str
    uploader_id: str
    created_at: datetime

# --- Report Schemas ---
class DashboardReportResponse(BaseModel):
    total_alumni: int
    verified_alumni: int
    pending_alumni: int
    active_batches: int
    upcoming_events: int
    recent_checkins_count: int
    attendance_turnout_percentage: float
