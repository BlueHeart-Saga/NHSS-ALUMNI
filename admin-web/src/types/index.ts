export interface SchoolProfile {
  id: string;
  name: string;
  code: string;
  school_type?: string;
  logo_url?: string;
  cover_url?: string;
  description?: string;
  portal_name?: string;
  tagline?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pin_code?: string;
  website?: string;
  contact_phone?: string;
  contact_email?: string;
  established_year?: number;
  status?: string;

  // Feature Toggles
  alumni_registration_enabled?: boolean;
  manual_approval_enabled?: boolean;
  public_directory_enabled?: boolean;
  event_registration_enabled?: boolean;
  announcement_notifications_enabled?: boolean;
}

export type SchoolPositionType =
  | 'Principal'
  | 'Vice Principal'
  | 'Headmaster'
  | 'Headmistress'
  | 'Assistant Headmaster'
  | 'Assistant Headmistress'
  | 'Department Head'
  | 'Senior Teacher'
  | 'Teacher'
  | 'Administrative Staff'
  | 'Other'
  | (string & {});

export interface SchoolStaffMember {
  id: string;
  school_id: string;
  full_name: string;
  full_name_ta?: string;
  email?: string;
  mobile?: string;
  school_position: SchoolPositionType;
  school_position_ta?: string;
  department?: string;
  department_ta?: string;
  designation?: string;
  designation_ta?: string;
  staff_id?: string;
  profile_photo_url?: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  notes_ta?: string;
  staff_type?: 'CURRENT' | 'PAST';
  service_start_year?: number;
  service_end_year?: number;
  achievements?: string;
  achievements_ta?: string;
  is_former?: boolean;
  created_at: string;
}

export interface AssociationTeamMember {
  id: string;
  school_id: string;
  profile_type: 'alumni' | 'common';
  alumni_id?: string;
  full_name: string;
  full_name_ta?: string;
  name_ta?: string;
  photo_url?: string;
  email?: string;
  mobile?: string;
  location?: string;
  occupation?: string;
  batch_year?: number;
  position: string;
  position_ta?: string;
  responsibility?: string;
  term_start?: string;
  term_end?: string;
  display_order: number;
  bio?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export type CommitteeRoleType =
  | 'PRESIDENT'
  | 'VICE_PRESIDENT'
  | 'SECRETARY'
  | 'JOINT_SECRETARY'
  | 'TREASURER'
  | 'EXECUTIVE_MEMBER'
  | 'NORMAL_MEMBER';

export interface CommitteeRoleConfig {
  key: CommitteeRoleType;
  title: string;
  max_quota: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export interface CommitteeMember {
  alumni_id: string;
  full_name: string;
  profile_photo_url?: string;
  mobile?: string;
  email?: string;
  role: CommitteeRoleType;
  role_title: string;
  assigned_at?: string;
}

export interface BatchCommitteeRoleCount {
  role: CommitteeRoleType;
  role_title: string;
  max_quota: number;
  filled_count: number;
}

export interface BatchCommitteeResponse {
  batch_id: string;
  batch_name: string;
  passing_year: number;
  total_positions: number;
  total_filled: number;
  roles_summary: BatchCommitteeRoleCount[];
  members: CommitteeMember[];
}

export interface AlumniProfile {
  id: string;
  user_id: string;
  school_id: string;
  full_name: string;
  name_ta?: string;
  full_name_ta?: string;
  mobile: string;
  country_code?: string;
  gender?: string;
  date_of_birth?: string;
  dob?: string;
  blood_group?: string;
  father_name?: string;
  mother_name?: string;
  current_city?: string;
  address?: string;
  state?: string;
  current_state?: string;
  country?: string;
  school_name?: string;
  joining_year?: number;
  admission_year?: number;
  passing_year: number;
  leaving_class?: string;
  no_higher_education?: string;
  college_name?: string;
  institution_name?: string;
  degree?: string;
  custom_degree?: string;
  department?: string;
  stream?: string;
  college_register_no?: string;
  college_joining_year?: number;
  college_passing_year?: number;
  employment_status?: string;
  company?: string;
  company_name?: string;
  profession?: string;
  designation?: string;
  industry?: string;
  experience_years?: number;
  total_experience?: string;
  linkedin_url?: string;
  instagram_url?: string;
  whatsapp_number?: string;
  profile_photo_url?: string;
  email: string;
  batch_id?: string;
  is_volunteer?: string;
  willing_to_donate?: string;
  phone_visible?: boolean;
  directory_visible?: boolean;
  // ✅ DRAFT is added — set on every save until Step 6 final submit
  verification_status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'NOT_REGISTERED';
  verification_notes?: string;
  account_status?: 'ACTIVE' | 'PENDING_ACTIVATION' | 'SUSPENDED';
  invitation_status?: 'PENDING' | 'SENT' | 'OPENED' | 'EXPIRED' | 'ACCEPTED';
  phone_verified?: boolean;
  is_rerequest?: boolean;
  rerequest_note?: string;
  last_contact_message?: string;
  last_contact_subject?: string;
  rerequested_at?: string;
  roles: string[];
  committee_role?: CommitteeRoleType;
  committee_role_title?: string;
  email_visible: boolean;
  created_at: string;
}

export interface CoordinatorProfile {
  id: string;
  full_name: string;
  profile_photo_url?: string;
  mobile?: string;
  email?: string;
}

export interface Batch {
  id: string;
  school_id: string;
  name: string;
  passing_year: number;
  description?: string;
  coordinators: (string | CoordinatorProfile)[];
  coordinator_profiles?: CoordinatorProfile[];
  total_members: number;
  status: string;
  created_at: string;
}

export interface EventItem {
  id: string;
  school_id: string;
  batch_id?: string;
  batch_name?: string;
  title: string;
  title_ta?: string;
  description: string;
  description_ta?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  address: string;
  registration_deadline?: string;
  guest_allowed: boolean;
  max_capacity: number;
  cover_image_url?: string;
  cover_image_url_ta?: string;
  registration_url?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  attending_count: number;
  maybe_count: number;
  declined_count: number;
  total_guests: number;
  created_by: string;
  created_at: string;
}

export interface SchoolEventItem {
  id: string;
  school_id?: string;
  title: string;
  title_ta?: string;
  category: 'ANNUAL_DAY' | 'SPORTS_DAY' | 'CULTURAL_FEST' | 'NATIONAL_DAY' | 'EXHIBITION' | 'CELEBRATION' | 'ACADEMIC_MEET' | 'GRADUATION_DAY' | 'OTHER';
  event_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  venue: string;
  chief_guest?: string;
  target_audience?: string;
  description: string;
  description_ta?: string;
  cover_image_url?: string;
  cover_image_url_ta?: string;
  gallery_urls?: string[];
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  created_at?: string;
}

export interface AttendanceRosterItem {
  alumni_id: string;
  full_name: string;
  passing_year: number;
  admission_number: string;
  rsvp_status: string;
  adults_count: number;
  children_count: number;
  total_guests: number;
  is_checked_in: boolean;
  checked_in_at?: string;
}

export interface AttendanceDashboard {
  event_id: string;
  total_rsvp_count: number;
  confirmed_alumni: number;
  maybe_alumni: number;
  declined_alumni: number;
  total_adult_guests: number;
  total_child_guests: number;
  total_expected_people: number;
  checked_in_count: number;
}

export interface CheckinResult {
  success: boolean;
  message: string;
  alumni_name: string;
  batch_name: string;
  checked_in_at: string;
  total_guests: number;
}

export interface Announcement {
  id: string;
  school_id: string;
  batch_id?: string;
  target: 'SCHOOL' | 'BATCH';
  category?: string;
  title: string;
  title_ta?: string;
  content: string;
  content_ta?: string;
  poster_url?: string;
  created_by_name: string;
  created_at: string;
  updated_at?: string;
}

export interface Memory {
  id: string;
  school_id?: string;
  batch_id?: string;
  batch_year?: string;
  event_id?: string;
  title: string;
  title_ta?: string;
  album_name?: string;
  media_type?: 'IMAGE' | 'VIDEO' | 'ALBUM';
  description?: string;
  description_ta?: string;
  target_audience?: string;
  image_url: string;
  cover_image_url?: string;
  media_urls?: string[];
  video_url?: string;
  video_thumbnail_url?: string;
  uploader_name: string;
  uploader_email?: string;
  uploader_id?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'REPORTED' | 'HIDDEN' | 'DELETED';
  admin_remarks?: string;
  created_at?: string;
}

export interface DashboardReport {
  total_alumni: number;
  verified_alumni: number;
  pending_alumni: number;
  active_batches: number;
  upcoming_events: number;
  recent_checkins_count: number;
  attendance_turnout_percentage: number;
}

export interface RankHolder {
  id: string;
  school_id?: string;
  alumni_id?: string;
  student_name: string;
  student_name_ta?: string;
  academic_year: string;
  class_standard: string;
  rank: string;
  achievement_type?: string;
  marks_percentage?: string;
  total_marks?: string;
  max_marks?: string;
  subject_stream?: string;
  achievement_title?: string;
  photograph?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  created_at?: string;
}

export interface SchoolStaff {
  id: string;
  school_id?: string;
  full_name: string;
  full_name_ta?: string;
  email?: string;
  mobile?: string;
  school_position: string;
  school_position_ta?: string;
  department?: string;
  department_ta?: string;
  designation?: string;
  designation_ta?: string;
  staff_id?: string;
  profile_photo_url?: string;
  staff_type?: 'CURRENT' | 'PAST' | 'FORMER';
  service_start_year?: number;
  service_end_year?: number;
  achievements?: string;
  achievements_ta?: string;
  is_former?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  notes_ta?: string;
  created_at?: string;
}

export interface FeedbackItem {
  id: string;
  user_id?: string;
  alumni_name: string;
  alumni_name_ta?: string;
  batch_year: string;
  photo_url?: string;
  location?: string;
  feedback_type: 'WEBSITE' | 'MEMORIES' | 'ASSOCIATION' | 'EVENTS' | 'SUGGESTIONS' | 'APPRECIATION' | 'OTHER' | string;
  feedback_text: string;
  feedback_text_ta?: string;
  rating?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_remarks?: string;
  is_featured?: boolean;
  created_at?: string;
}

export interface FeedbackAnalytics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  featured: number;
  average_rating: number;
}

export interface CreateFeedbackPayload {
  alumni_name: string;
  alumni_name_ta?: string;
  batch_year: string;
  photo_url?: string;
  location?: string;
  feedback_type: string;
  feedback_text: string;
  feedback_text_ta?: string;
  rating?: number;
}

// =============================================================================
// AUDIT & FINANCIAL STATEMENTS
// =============================================================================
export interface AuditStatement {
  id: string;
  school_id?: string;
  title: string;
  title_ta?: string;
  description?: string;
  description_ta?: string;
  financial_year: string;
  period_start: string;
  period_end: string;
  posted_date?: string;
  pdf_url?: string;
  pdf_file_name?: string;
  pdf_file_size?: number;
  is_published: boolean;
  display_order: number;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at?: string;
  updated_at?: string;
}

export type AuditStatementDetail = AuditStatement;

export interface AuditStatementListSummary {
  id: string;
  title: string;
  title_ta?: string;
  description?: string;
  description_ta?: string;
  financial_year: string;
  period_start: string;
  period_end: string;
  posted_date?: string;
}

// =============================================================================
// CONTRIBUTIONS
// =============================================================================
export type ContributionPurpose =
  | 'GENERAL'
  | 'SCHOLARSHIP'
  | 'INFRASTRUCTURE'
  | 'EVENT'
  | 'OTHER';

export type ContributionStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

export interface Contribution {
  id: string;
  school_id?: string;
  alumni_id?: string;
  user_id?: string;
  contributor_name: string;
  contributor_name_ta?: string;
  batch_year?: number;
  amount: number;
  currency: string;
  purpose: ContributionPurpose;
  purpose_note?: string;
  contribution_date?: string;
  financial_year?: string;
  payment_method?: string;
  payment_reference?: string;
  proof_url?: string;
  status: ContributionStatus;
  public_visibility: boolean;
  admin_remarks?: string;

  // NEW — alumni-form structured fields (returned by admin list API)
  contact_number?: string;
  address?: string;
  specific_purpose?: string;
  receipt_required?: boolean;
  remarks?: string;

  created_at?: string;
  updated_at?: string;
}

export interface TopContributor {
  id: string;
  name: string;
  name_ta?: string;
  batch?: number;
  amount: number;
  contribution_date?: string;
}

export interface CreateContributionPayload {
  amount: number;
  currency?: string;
  purpose?: ContributionPurpose;
  purpose_note?: string;
  contribution_date?: string;
  financial_year?: string;
  payment_method?: string;
  payment_reference?: string;
  proof_url?: string;
  public_visibility?: boolean;
  remarks?: string;

  // NEW — alumni-form structured fields
  contact_number?: string;
  address?: string;
  specific_purpose?: string;
  receipt_required?: boolean;
}

export interface ContributionAnalyticsRow {
  financial_year: string;
  total_amount: number;
  count: number;
  completed: number;
  pending: number;
}

export interface AdminCreateContributionPayload extends CreateContributionPayload {
  alumni_id: string;
  status?: 'PENDING' | 'COMPLETED' | 'REJECTED';
}

// =============================================================================
// SPONSORS
// =============================================================================
export type SponsorTier = 'PLATINUM' | 'GOLD' | 'SILVER' | 'STANDARD';

export interface Sponsor {
  id: string;
  school_id?: string;
  created_by?: string;
  name: string;
  name_ta?: string;
  description?: string;
  description_ta?: string;
  logo_url?: string;
  website_url?: string;
  financial_year: string;
  amount?: number;
  sponsored_item?: string;
  sponsor_tier?: SponsorTier;
  display_order?: number;
  is_published: boolean;
  status: 'ACTIVE' | 'INACTIVE';

  // ── Approval workflow ──────────────────────────────────────────────────
  // PENDING   = alumni-submitted, awaiting admin review
  // PUBLISHED = visible on the public Audit / Sponsors page
  // REJECTED  = admin declined; not publicly visible
  approval_status?: 'PENDING' | 'PUBLISHED' | 'REJECTED';

  // ── Source of submission ───────────────────────────────────────────────
  // ALUMNI = created by an alumnus via /sponsors/my (starts as PENDING)
  // ADMIN  = created by a school admin via /sponsors/admin (starts as PUBLISHED)
  created_by_role?: 'ALUMNI' | 'ADMIN';

  // ── Rejection metadata ─────────────────────────────────────────────────
  // Populated when the admin rejects the sponsor; also becomes the body of
  // the alumni notification for alumni-submitted sponsors.
  rejection_reason?: string;

  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================
export interface Notification {
  id: string;
  user_id?: string;
  kind?: string;                 // 'SPONSOR_REJECTED' | 'GENERAL' | etc.
  title: string;
  body: string;
  related_type?: string;         // 'sponsor' | 'contribution' | ...
  related_id?: string;
  is_read: boolean;
  created_at?: string;
  read_at?: string;
}
// =============================================================================
// ASSOCIATION MEETING MINUTES
// =============================================================================
export interface MeetingMinute {
  id: string;
  school_id?: string;
  title: string;
  title_ta?: string;
  meeting_date: string;              // ISO "YYYY-MM-DD"
  meeting_time?: string;
  meeting_type?: string;
  notes?: string;                    // multi-line resolutions
  notes_ta?: string;
  pdf_url?: string;
  pdf_file_name?: string;
  pdf_file_size?: number;
  is_published: boolean;
  display_order: number;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at?: string;
  updated_at?: string;
}

