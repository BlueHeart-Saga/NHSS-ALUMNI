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
    country_code: Optional[str] = "+91"
    email: EmailStr
    gender: Optional[str] = None
    dob: Optional[str] = None
    blood_group: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    profile_photo_url: Optional[str] = None
    current_city: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    address: Optional[str] = None
    password: Optional[str] = None
    
    # School Education Details
    school_name: Optional[str] = None
    joining_year: Optional[int] = None
    passing_year: Optional[int] = 2010
    leaving_class: Optional[str] = "12th"
    admission_number: Optional[str] = "N/A"
    section: Optional[str] = "A"
    
    # Higher Education / College Details
    no_higher_education: Optional[bool] = False
    college_name: Optional[str] = None
    degree: Optional[str] = None
    other_degree: Optional[str] = None
    stream: Optional[str] = None
    register_number: Optional[str] = None
    college_joining_year: Optional[int] = None
    college_passing_year: Optional[int] = None
    
    # Professional & Additional Details
    employment_status: Optional[str] = None
    chapter: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    profession: Optional[str] = None
    industry: Optional[str] = None
    total_experience: Optional[str] = None
    industries: Optional[str] = None
    skills: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    website_url: Optional[str] = None
    
    # Legacy fallbacks
    other_college: Optional[str] = None
    other_stream: Optional[str] = None
    other_passing_year: Optional[int] = None

class CreateAdminRequest(BaseModel):
    full_name: str
    mobile: str
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    roles: List[str] = ["SCHOOL_ADMIN"]
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
    blood_group: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    passing_year: Optional[int] = None
    batch_id: Optional[str] = None
    admission_number: Optional[str] = None
    section: Optional[str] = None
    current_city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    profession: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    house: Optional[str] = None
    stream: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    github_url: Optional[str] = None
    twitter_url: Optional[str] = None
    website_url: Optional[str] = None
    skills: Optional[List[str]] = []
    phone_visible: bool = False
    directory_visible: bool = True
    verification_status: Optional[str] = "PENDING"
    verification_notes: Optional[str] = None
    roles: List[str] = ["ALUMNI"]
    committee_role: Optional[str] = None
    committee_role_title: Optional[str] = None
    email_visible: bool = False
    created_at: datetime

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    blood_group: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    current_city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    profession: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    admission_number: Optional[str] = None
    passing_year: Optional[int] = None
    section: Optional[str] = None
    house: Optional[str] = None
    stream: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    github_url: Optional[str] = None
    twitter_url: Optional[str] = None
    website_url: Optional[str] = None
    profile_photo_url: Optional[str] = None
    email_visible: Optional[bool] = None
    phone_visible: Optional[bool] = None
    directory_visible: Optional[bool] = None
    skills: Optional[List[str]] = None

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
    school_type: Optional[str] = "Higher Secondary School"
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    portal_name: Optional[str] = None
    tagline: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    pin_code: Optional[str] = None
    website: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    established_year: Optional[int] = None
    status: Optional[str] = "ACTIVE"

    # Feature Toggles
    alumni_registration_enabled: bool = True
    manual_approval_enabled: bool = True
    public_directory_enabled: bool = True
    event_registration_enabled: bool = True
    announcement_notifications_enabled: bool = True

class UpdateSchoolRequest(BaseModel):
    name: Optional[str] = None
    school_type: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    portal_name: Optional[str] = None
    tagline: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    website: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    established_year: Optional[int] = None
    
    # Feature Toggles
    alumni_registration_enabled: Optional[bool] = None
    manual_approval_enabled: Optional[bool] = None
    public_directory_enabled: Optional[bool] = None
    event_registration_enabled: Optional[bool] = None
    announcement_notifications_enabled: Optional[bool] = None

class CreateSchoolStaffRequest(BaseModel):
    full_name: str = Field(..., example="Dr. S. Ramesh")
    full_name_ta: Optional[str] = Field(None, example="டாக்டர் எஸ். ரமேஷ்")
    email: Optional[EmailStr] = Field(None, example="principal@school.edu.in")
    mobile: Optional[str] = Field(None, example="+919876543210")
    school_position: str = Field(..., example="Principal")
    school_position_ta: Optional[str] = Field(None, example="முதல்வர் / தலைமை ஆசிரியர்")
    department: Optional[str] = None
    department_ta: Optional[str] = None
    designation: Optional[str] = None
    designation_ta: Optional[str] = None
    staff_id: Optional[str] = None
    profile_photo_url: Optional[str] = None
    staff_type: Optional[str] = "CURRENT" # CURRENT, PAST, FORMER
    service_start_year: Optional[int] = None
    service_end_year: Optional[int] = None
    achievements: Optional[str] = None
    achievements_ta: Optional[str] = None
    is_former: Optional[bool] = False
    status: Optional[str] = "ACTIVE"
    notes: Optional[str] = None
    notes_ta: Optional[str] = None

class UpdateSchoolStaffRequest(BaseModel):
    full_name: Optional[str] = None
    full_name_ta: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    school_position: Optional[str] = None
    school_position_ta: Optional[str] = None
    department: Optional[str] = None
    department_ta: Optional[str] = None
    designation: Optional[str] = None
    designation_ta: Optional[str] = None
    staff_id: Optional[str] = None
    profile_photo_url: Optional[str] = None
    staff_type: Optional[str] = None
    service_start_year: Optional[int] = None
    service_end_year: Optional[int] = None
    achievements: Optional[str] = None
    achievements_ta: Optional[str] = None
    is_former: Optional[bool] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    notes_ta: Optional[str] = None

class SchoolStaffResponse(BaseModel):
    id: str
    school_id: str
    full_name: str
    full_name_ta: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    school_position: str
    school_position_ta: Optional[str] = None
    department: Optional[str] = None
    department_ta: Optional[str] = None
    designation: Optional[str] = None
    designation_ta: Optional[str] = None
    staff_id: Optional[str] = None
    profile_photo_url: Optional[str] = None
    staff_type: str = "CURRENT"
    service_start_year: Optional[int] = None
    service_end_year: Optional[int] = None
    achievements: Optional[str] = None
    achievements_ta: Optional[str] = None
    is_former: bool = False
    status: str = "ACTIVE"
    notes: Optional[str] = None
    notes_ta: Optional[str] = None
    created_at: datetime

# --- Batch Schemas ---
class CreateBatchRequest(BaseModel):
    name: str = Field(..., example="Class of 2010")
    passing_year: int = Field(..., example=2010)
    description: Optional[str] = "Cohort batch"

class CoordinatorProfileResponse(BaseModel):
    id: str
    full_name: str
    profile_photo_url: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None

class BatchResponse(BaseModel):
    id: str
    school_id: str
    name: str
    passing_year: int
    description: Optional[str] = None
    coordinators: List[Any] = []
    coordinator_profiles: Optional[List[CoordinatorProfileResponse]] = []
    total_members: int = 0
    status: str = "ACTIVE"
    created_at: datetime

class AssignCoordinatorRequest(BaseModel):
    alumni_id: str

class AssignCommitteeRoleRequest(BaseModel):
    alumni_id: str
    role: str = Field(..., example="PRESIDENT") # PRESIDENT, VICE_PRESIDENT, SECRETARY, JOINT_SECRETARY, TREASURER, EXECUTIVE_MEMBER, NORMAL_MEMBER

class CommitteeMemberResponse(BaseModel):
    alumni_id: str
    full_name: str
    profile_photo_url: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    role: str
    role_title: str
    assigned_at: Optional[datetime] = None

class BatchCommitteeRoleCount(BaseModel):
    role: str
    role_title: str
    max_quota: int
    filled_count: int

class BatchCommitteeResponse(BaseModel):
    batch_id: str
    batch_name: str
    passing_year: int
    total_positions: int = 15
    total_filled: int = 0
    roles_summary: List[BatchCommitteeRoleCount] = []
    members: List[CommitteeMemberResponse] = []

# --- Event Schemas ---
class MapCoordinates(BaseModel):
    lat: float
    lng: float

class CreateEventRequest(BaseModel):
    title: str = Field(..., example="2010 Batch Reunion")
    title_ta: Optional[str] = None
    batch_id: Optional[str] = None # Null if school-wide
    description: str
    description_ta: Optional[str] = None
    event_date: str = Field(..., example="2026-12-20")
    start_time: str = Field(..., example="10:00 AM")
    end_time: str = Field(..., example="05:00 PM")
    venue: str
    address: str
    map_coordinates: Optional[MapCoordinates] = None
    registration_deadline: Optional[str] = None
    guest_allowed: bool = True
    max_capacity: int = 300
    cover_image_url: Optional[str] = None
    cover_image_url_ta: Optional[str] = None
    registration_url: Optional[str] = None
    publish_immediately: bool = True

class UpdateEventRequest(BaseModel):
    title: Optional[str] = None
    title_ta: Optional[str] = None
    batch_id: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    event_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    address: Optional[str] = None
    map_coordinates: Optional[MapCoordinates] = None
    registration_deadline: Optional[str] = None
    guest_allowed: Optional[bool] = None
    max_capacity: Optional[int] = None
    cover_image_url: Optional[str] = None
    cover_image_url_ta: Optional[str] = None
    registration_url: Optional[str] = None
    status: Optional[str] = None

class EventResponse(BaseModel):
    id: str
    school_id: str
    batch_id: Optional[str] = None
    batch_name: Optional[str] = None
    title: str
    title_ta: Optional[str] = None
    description: str
    description_ta: Optional[str] = None
    event_date: str
    start_time: str
    end_time: Optional[str] = None
    venue: str
    address: Optional[str] = None
    map_coordinates: Optional[MapCoordinates] = None
    registration_deadline: Optional[str] = None
    guest_allowed: bool = True
    max_capacity: int = 300
    cover_image_url: Optional[str] = None
    cover_image_url_ta: Optional[str] = None
    registration_url: Optional[str] = None
    status: str # DRAFT, PUBLISHED, CANCELLED, COMPLETED
    attending_count: int = 0
    maybe_count: int = 0
    declined_count: int = 0
    total_guests: int = 0
    created_by: Optional[str] = "ADMIN"
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

class ContactEnquiryRequest(BaseModel):
    full_name: str
    email: EmailStr
    mobile: Optional[str] = None
    message: str

# --- Association Team Schemas ---
class CreateAssociationTeamMemberRequest(BaseModel):
    profile_type: str = Field(default="common", example="common") # alumni, common
    alumni_id: Optional[str] = None
    full_name: str = Field(..., example="K. Ravi Kumar")
    photo_url: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    batch_year: Optional[int] = None
    position: str = Field(..., example="President")
    responsibility: Optional[str] = None
    term_start: Optional[str] = "2024"
    term_end: Optional[str] = "2026"
    display_order: int = 1
    bio: Optional[str] = None
    status: str = "ACTIVE"

class UpdateAssociationTeamMemberRequest(BaseModel):
    full_name: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    batch_year: Optional[int] = None
    position: Optional[str] = None
    responsibility: Optional[str] = None
    term_start: Optional[str] = None
    term_end: Optional[str] = None
    display_order: Optional[int] = None
    bio: Optional[str] = None
    status: Optional[str] = None

class AssociationTeamMemberResponse(BaseModel):
    id: str
    school_id: str
    profile_type: str = "common"
    alumni_id: Optional[str] = None
    full_name: str
    photo_url: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    batch_year: Optional[int] = None
    position: str
    responsibility: Optional[str] = None
    term_start: Optional[str] = None
    term_end: Optional[str] = None
    display_order: int = 1
    bio: Optional[str] = None
    status: str = "ACTIVE"
    created_at: datetime
