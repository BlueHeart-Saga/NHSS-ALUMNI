from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
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

class LoginRequest(BaseModel):
    email: Optional[str] = Field(None, example="user@school.com")
    mobile: Optional[str] = Field(None, example="+919876543210")
    password: str
    remember_me: Optional[bool] = True

class UpdatePasswordRequest(BaseModel):
    password: str

class SetPasswordWithOTPRequest(BaseModel):
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    otp: str
    password: str

# --- Invitation & Account Activation Schemas ---
class ValidateInvitationResponse(BaseModel):
    valid: bool
    name: str
    full_name: Optional[str] = None
    mobile: str
    masked_mobile: str
    school_name: Optional[str] = None
    alumni_id: Optional[str] = None
    user_id: Optional[str] = None
    expires_at: Optional[str] = None

class SendInvitationOTPRequest(BaseModel):
    token: str

class VerifyInvitationOTPRequest(BaseModel):
    token: str
    otp: str

class ActivateAccountWithInvitationRequest(BaseModel):
    token: str
    password: str

class BulkSendInvitationRequest(BaseModel):
    alumni_ids: List[str]

class SendInvitationResponse(BaseModel):
    success: bool
    message: str
    activation_url: Optional[str] = None
    alumni_id: Optional[str] = None
    mobile: Optional[str] = None
    sent: Optional[int] = None
    skipped: Optional[int] = None

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
    email: Optional[EmailStr] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    blood_group: Optional[str] = None
    is_volunteer: Optional[str] = "NO"
    willing_to_donate: Optional[str] = "NO"
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    profile_photo_url: Optional[str] = None
    current_city: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    address: Optional[str] = None
    password: Optional[str] = None
    registration_submitted: Optional[bool] = False

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

    @field_validator("email", mode="before")
    @classmethod
    def _blank_email_to_none(cls, v):
        """Treat empty/whitespace-only email strings as None so Optional[EmailStr] accepts them."""
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

class AdminCreateAlumniRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    full_name: str
    mobile: str
    email: Optional[EmailStr] = None
    name_ta: Optional[str] = None
    full_name_ta: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    dob: Optional[str] = None
    blood_group: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    profile_photo_url: Optional[str] = None
    country_code: Optional[str] = "+91"
    address: Optional[str] = None
    current_city: Optional[str] = None
    current_state: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    school_name: Optional[str] = None
    joining_year: Optional[Any] = None
    admission_year: Optional[Any] = None
    passing_year: Optional[Any] = 2010
    leaving_class: Optional[Any] = "12th"
    admission_number: Optional[Any] = "N/A"
    roll_no: Optional[Any] = None
    section: Optional[Any] = "A"
    no_higher_education: Optional[Any] = "NO"
    college_name: Optional[str] = None
    institution_name: Optional[str] = None
    degree: Optional[str] = None
    custom_degree: Optional[str] = None
    department: Optional[str] = None
    stream: Optional[str] = None
    college_register_no: Optional[Any] = None
    college_joining_year: Optional[Any] = None
    college_passing_year: Optional[Any] = None
    employment_status: Optional[str] = None
    company: Optional[str] = None
    company_name: Optional[str] = None
    profession: Optional[str] = None
    designation: Optional[str] = None
    industry: Optional[str] = None
    experience_years: Optional[Any] = None
    total_experience: Optional[Any] = None
    skills: Optional[Any] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    whatsapp_number: Optional[Any] = None
    website_url: Optional[str] = None
    is_volunteer: Optional[Any] = "NO"
    willing_to_donate: Optional[Any] = "NO"
    verification_status: Optional[str] = "APPROVED"

    @field_validator("email", mode="before")
    @classmethod
    def _blank_email_to_none(cls, v):
        """Treat empty/whitespace-only email strings as None so Optional[EmailStr] accepts them."""
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

class CreateAdminRequest(BaseModel):
    full_name: str
    mobile: str
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    roles: List[str] = ["SCHOOL_ADMIN"]
    passing_year: Optional[int] = 2005

    @field_validator("email", mode="before")
    @classmethod
    def _blank_email_to_none(cls, v):
        """Treat empty/whitespace-only email strings as None so Optional[EmailStr] accepts them."""
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

# --- User & Profile Schemas ---
class UserProfileResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    user_id: str
    school_id: str
    full_name: Optional[str] = "User"
    name_ta: Optional[str] = None
    full_name_ta: Optional[str] = None
    mobile: Optional[Any] = None
    country_code: Optional[Any] = None
    gender: Optional[Any] = None
    date_of_birth: Optional[Any] = None
    dob: Optional[Any] = None
    blood_group: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    relative_students_name: Optional[str] = None
    current_city: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    current_state: Optional[str] = None
    country: Optional[str] = None
    school_name: Optional[str] = None
    joining_year: Optional[Any] = None
    admission_year: Optional[Any] = None
    passing_year: Optional[Any] = 2010
    leaving_class: Optional[Any] = None
    admission_number: Optional[Any] = "N/A"
    roll_no: Optional[Any] = None
    section: Optional[Any] = "A"
    no_higher_education: Optional[Any] = "NO"
    college_name: Optional[str] = None
    institution_name: Optional[str] = None
    degree: Optional[str] = None
    custom_degree: Optional[str] = None
    department: Optional[str] = None
    stream: Optional[str] = None
    college_register_no: Optional[Any] = None
    college_joining_year: Optional[Any] = None
    college_passing_year: Optional[Any] = None
    employment_status: Optional[str] = None
    company: Optional[str] = None
    company_name: Optional[str] = None
    profession: Optional[str] = None
    designation: Optional[str] = None
    industry: Optional[str] = None
    experience_years: Optional[Any] = None
    total_experience: Optional[Any] = None
    skills: Optional[List[str]] = []
    bio: Optional[str] = None
    house: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    whatsapp_number: Optional[Any] = None
    github_url: Optional[str] = None
    twitter_url: Optional[str] = None
    website_url: Optional[str] = None
    profile_photo_url: Optional[str] = None
    phone_visible: bool = False
    directory_visible: bool = True
    verification_status: Optional[str] = "PENDING"
    verification_notes: Optional[str] = None
    account_status: Optional[str] = "ACTIVE"
    invitation_status: Optional[str] = None
    phone_verified: Optional[bool] = False
    roles: List[str] = ["ALUMNI"]
    committee_role: Optional[str] = None
    committee_role_title: Optional[str] = None
    is_volunteer: Optional[Any] = "NO"
    willing_to_donate: Optional[Any] = "NO"
    email_visible: bool = False
    registration_submitted: Optional[bool] = False
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
    is_volunteer: Optional[str] = None
    willing_to_donate: Optional[str] = None
    skills: Optional[List[str]] = None

    @field_validator("email", mode="before")
    @classmethod
    def _blank_email_to_none(cls, v):
        """Treat empty/whitespace-only email strings as None so Optional[EmailStr] accepts them."""
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

# --- Verification Schemas ---
class VerificationDecisionRequest(BaseModel):
    status: str = Field(..., example="APPROVED")
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
    updated: int = 0
    unchanged: int = 0
    created: int = 0
    failed: int = 0
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
    status: str = "PENDING"
    created_at: datetime

class EnquiryStatusUpdateRequest(BaseModel):
    status: str = Field(..., example="APPROVED")
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
    staff_type: Optional[str] = "CURRENT"
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
    role: str = Field(..., example="PRESIDENT")

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
    batch_id: Optional[str] = None
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
    status: str
    attending_count: int = 0
    maybe_count: int = 0
    declined_count: int = 0
    total_guests: int = 0
    created_by: Optional[str] = "ADMIN"
    created_at: datetime

# --- Attendance & RSVP Schemas ---
class RSVPRequest(BaseModel):
    rsvp_status: str = Field(..., example="ATTENDING")
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
    target: str = Field(..., example="SCHOOL")
    batch_id: Optional[str] = None
    category: Optional[str] = "GENERAL"
    title: str
    title_ta: Optional[str] = None
    content: str
    content_ta: Optional[str] = None
    poster_url: Optional[str] = None

class UpdateAnnouncementRequest(BaseModel):
    target: Optional[str] = None
    batch_id: Optional[str] = None
    category: Optional[str] = None
    title: Optional[str] = None
    title_ta: Optional[str] = None
    content: Optional[str] = None
    content_ta: Optional[str] = None
    poster_url: Optional[str] = None

class AnnouncementResponse(BaseModel):
    id: str
    school_id: str
    batch_id: Optional[str] = None
    target: str
    category: Optional[str] = "GENERAL"
    title: str
    title_ta: Optional[str] = None
    content: str
    content_ta: Optional[str] = None
    poster_url: Optional[str] = None
    created_by_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None

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
    model_config = ConfigDict(extra="allow")

    profile_type: str = Field(default="common", example="common")
    alumni_id: Optional[str] = None
    full_name: str = Field(..., example="K. Ravi Kumar")
    full_name_ta: Optional[str] = None
    name_ta: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    batch_year: Optional[int] = None
    position: str = Field(..., example="President")
    position_ta: Optional[str] = None
    responsibility: Optional[str] = None
    term_start: Optional[str] = "2024"
    term_end: Optional[str] = "2026"
    display_order: int = 1
    bio: Optional[str] = None
    status: str = "ACTIVE"

class UpdateAssociationTeamMemberRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    full_name: Optional[str] = None
    full_name_ta: Optional[str] = None
    name_ta: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    batch_year: Optional[int] = None
    position: Optional[str] = None
    position_ta: Optional[str] = None
    responsibility: Optional[str] = None
    term_start: Optional[str] = None
    term_end: Optional[str] = None
    display_order: Optional[int] = None
    bio: Optional[str] = None
    status: Optional[str] = None

class AssociationTeamMemberResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    school_id: str
    profile_type: str = "common"
    alumni_id: Optional[str] = None
    full_name: str
    full_name_ta: Optional[str] = None
    name_ta: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    batch_year: Optional[int] = None
    position: str
    position_ta: Optional[str] = None
    responsibility: Optional[str] = None
    term_start: Optional[str] = None
    term_end: Optional[str] = None
    display_order: int = 1
    bio: Optional[str] = None
    status: str = "ACTIVE"
    created_at: datetime

# =============================================================================
# AUDIT & FINANCIAL STATEMENTS SCHEMAS
# =============================================================================
class AuditStatementCreateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: str = Field(..., example="Auditing Statement – Academic Year (2025 - 2026)")
    title_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None

    financial_year: str = Field(..., example="2025 - 2026")
    period_start: str = Field(..., example="01.04.2025")
    period_end: str = Field(..., example="31.03.2026")
    posted_date: Optional[str] = Field(None, example="14th May, 2026")

    pdf_url: Optional[str] = None
    pdf_file_name: Optional[str] = None
    pdf_file_size: Optional[int] = None
    pdf_blob_path: Optional[str] = None

    is_published: bool = False
    display_order: int = 1
    status: str = "ACTIVE"

class AuditStatementUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: Optional[str] = None
    title_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    financial_year: Optional[str] = None
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    posted_date: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_file_name: Optional[str] = None
    pdf_file_size: Optional[int] = None
    pdf_blob_path: Optional[str] = None
    is_published: Optional[bool] = None
    display_order: Optional[int] = None
    status: Optional[str] = None

class AuditStatementResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    school_id: Optional[str] = None
    title: str
    title_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    financial_year: str
    period_start: str
    period_end: str
    posted_date: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_file_name: Optional[str] = None
    pdf_file_size: Optional[int] = None
    is_published: bool = False
    display_order: int = 1
    status: str = "ACTIVE"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
# =============================================================================
# ASSOCIATION MEETING MINUTES & RESOLUTIONS SCHEMAS
# =============================================================================
class MeetingMinuteCreateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: str = Field(..., example="First Online Meeting of NHSS Alumni Association Administrators")
    title_ta: Optional[str] = None

    meeting_date: str = Field(..., example="2026-09-20")           # ISO date
    meeting_time: Optional[str] = Field(None, example="12:00 PM – 1:45 PM")
    meeting_type: Optional[str] = Field(None, example="Online Meeting")

    notes: Optional[str] = None                                     # resolutions text, multi-line
    notes_ta: Optional[str] = None

    pdf_url: Optional[str] = None
    pdf_file_name: Optional[str] = None
    pdf_file_size: Optional[int] = None
    pdf_blob_path: Optional[str] = None

    is_published: bool = False
    display_order: int = 1
    status: str = "ACTIVE"                                          # ACTIVE | ARCHIVED


class MeetingMinuteUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: Optional[str] = None
    title_ta: Optional[str] = None
    meeting_date: Optional[str] = None
    meeting_time: Optional[str] = None
    meeting_type: Optional[str] = None
    notes: Optional[str] = None
    notes_ta: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_file_name: Optional[str] = None
    pdf_file_size: Optional[int] = None
    pdf_blob_path: Optional[str] = None
    is_published: Optional[bool] = None
    display_order: Optional[int] = None
    status: Optional[str] = None


class MeetingMinuteResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    school_id: Optional[str] = None
    title: str
    title_ta: Optional[str] = None
    meeting_date: str
    meeting_time: Optional[str] = None
    meeting_type: Optional[str] = None
    notes: Optional[str] = None
    notes_ta: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_file_name: Optional[str] = None
    pdf_file_size: Optional[int] = None
    is_published: bool = False
    display_order: int = 1
    status: str = "ACTIVE"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
# =============================================================================
# CONTRIBUTIONS SCHEMAS
# =============================================================================
class ContributionCreateRequest(BaseModel):
    """Alumni contribution creation payload.

    `extra="allow"` ensures that any future form fields are not silently
    dropped by Pydantic's default `extra="ignore"` behaviour. All alumni-form
    fields below are optional to keep backwards compatibility with older
    clients that only send `amount`/`purpose`.
    """
    model_config = ConfigDict(extra="allow")

    amount: float = Field(..., gt=0, example=5000)
    currency: str = "INR"
    purpose: Optional[str] = Field("GENERAL", example="SCHOLARSHIP")  # GENERAL | SCHOLARSHIP | INFRASTRUCTURE | EVENT | OTHER
    purpose_note: Optional[str] = None
    contribution_date: Optional[str] = None   # ISO date; defaults to today if omitted
    financial_year: Optional[str] = None      # auto-derived if omitted
    # Legacy payment fields retained for backwards compatibility but no
    # longer sent by the alumni form.
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    proof_url: Optional[str] = None
    public_visibility: bool = False           # conservative default
    remarks: Optional[str] = None

    # --- NEW alumni-form structured fields ---
    contact_number: Optional[str] = None
    address: Optional[str] = None
    specific_purpose: Optional[str] = None    # only meaningful when purpose == "OTHER"
    receipt_required: Optional[bool] = None

class ContributionUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    amount: Optional[float] = None
    purpose: Optional[str] = None
    purpose_note: Optional[str] = None
    contribution_date: Optional[str] = None
    financial_year: Optional[str] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    proof_url: Optional[str] = None
    status: Optional[str] = None              # PENDING | COMPLETED | REJECTED
    public_visibility: Optional[bool] = None
    admin_remarks: Optional[str] = None

    # --- NEW alumni-form structured fields (editable by admin) ---
    contact_number: Optional[str] = None
    address: Optional[str] = None
    specific_purpose: Optional[str] = None
    receipt_required: Optional[bool] = None
    remarks: Optional[str] = None

class ContributionResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    school_id: Optional[str] = None
    alumni_id: Optional[str] = None
    user_id: Optional[str] = None
    contributor_name: str
    contributor_name_ta: Optional[str] = None
    batch_year: Optional[int] = None
    amount: float
    currency: str = "INR"
    purpose: Optional[str] = "GENERAL"
    purpose_note: Optional[str] = None
    contribution_date: Optional[str] = None
    financial_year: Optional[str] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    proof_url: Optional[str] = None
    status: str = "PENDING"
    public_visibility: bool = False
    admin_remarks: Optional[str] = None

    # --- NEW alumni-form structured fields ---
    contact_number: Optional[str] = None
    address: Optional[str] = None
    specific_purpose: Optional[str] = None
    receipt_required: Optional[bool] = None
    remarks: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class AdminContributionCreateRequest(ContributionCreateRequest):
    """Admin-entered contribution recorded on behalf of an alumni.

    Inherits every field from ContributionCreateRequest (amount, purpose,
    purpose_note, contribution_date, contact_number, address,
    specific_purpose, receipt_required, public_visibility, remarks) and
    adds:
      - alumni_id: the alumni the contribution belongs to (required)
      - status: defaults to COMPLETED since admin is recording money
                already received.
    """
    model_config = ConfigDict(extra="allow")

    alumni_id: str
    status: Optional[str] = "COMPLETED"    # PENDING | COMPLETED | REJECTED
# =============================================================================
# SPONSORS SCHEMAS
# =============================================================================
class SponsorCreateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str = Field(..., example="TCS")
    name_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    financial_year: str = Field(..., example="2025 - 2026")
    amount: Optional[float] = Field(None, ge=0, example=50000)
    sponsored_item: Optional[str] = None
    sponsor_tier: Optional[str] = "STANDARD"    # PLATINUM | GOLD | SILVER | STANDARD
    display_order: int = 1
    is_published: bool = False
    status: str = "ACTIVE"

class SponsorUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: Optional[str] = None
    name_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    financial_year: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0, example=50000)
    sponsored_item: Optional[str] = None
    sponsor_tier: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[bool] = None
    status: Optional[str] = None
    approval_status: Optional[str] = None          # PENDING | PUBLISHED | REJECTED
    rejection_reason: Optional[str] = None 

class UserSponsorCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    name_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    financial_year: str = Field(..., min_length=1)
    amount: Optional[float] = Field(None, ge=0)
    sponsored_item: Optional[str] = None

class UserSponsorUpdateRequest(BaseModel):
    name: Optional[str] = None
    name_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    financial_year: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    sponsored_item: Optional[str] = None

class SponsorResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    school_id: Optional[str] = None
    name: str
    name_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    financial_year: str
    amount: Optional[float] = None
    sponsored_item: Optional[str] = None
    sponsor_tier: Optional[str] = "STANDARD"
    display_order: int = 1
    is_published: bool = False
    status: str = "ACTIVE"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None