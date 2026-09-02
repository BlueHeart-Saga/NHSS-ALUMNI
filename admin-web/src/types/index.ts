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
  email: string;
  mobile: string;
  school_position: SchoolPositionType;
  department?: string;
  designation?: string;
  staff_id?: string;
  profile_photo_url?: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  created_at: string;
}

export interface AssociationTeamMember {
  id: string;
  school_id: string;
  profile_type: 'alumni' | 'common';
  alumni_id?: string;
  full_name: string;
  photo_url?: string;
  email?: string;
  mobile?: string;
  location?: string;
  occupation?: string;
  batch_year?: number;
  position: string;
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
  mobile: string;
  email: string;
  profile_photo_url?: string;
  passing_year: number;
  batch_id?: string;
  admission_number: string;
  section?: string;
  current_city?: string;
  profession?: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'NOT_REGISTERED';
  verification_notes?: string;
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
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  address: string;
  registration_deadline?: string;
  guest_allowed: boolean;
  max_capacity: number;
  cover_image_url?: string;
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
  category: 'ANNUAL_DAY' | 'SPORTS_DAY' | 'CULTURAL_FEST' | 'NATIONAL_DAY' | 'EXHIBITION' | 'CELEBRATION' | 'ACADEMIC_MEET' | 'GRADUATION_DAY' | 'OTHER';
  event_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  venue: string;
  chief_guest?: string;
  target_audience?: string;
  description: string;
  cover_image_url?: string;
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
  title: string;
  content: string;
  created_by_name: string;
  created_at: string;
}

export interface Memory {
  id: string;
  school_id?: string;
  batch_id?: string;
  batch_year?: string;
  event_id?: string;
  title: string;
  album_name?: string;
  media_type?: 'IMAGE' | 'VIDEO' | 'ALBUM';
  description?: string;
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
