export interface SchoolProfile {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  cover_url?: string;
  description?: string;
  address?: string;
  website?: string;
  contact_phone?: string;
  contact_email?: string;
  established_year?: number;
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
  email_visible: boolean;
  created_at: string;
}

export interface Batch {
  id: string;
  school_id: string;
  name: string;
  passing_year: number;
  description?: string;
  coordinators: string[];
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
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  attending_count: number;
  maybe_count: number;
  declined_count: number;
  total_guests: number;
  created_by: string;
  created_at: string;
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
  school_id: string;
  batch_id: string;
  event_id?: string;
  title?: string;
  image_url: string;
  uploader_name: string;
  uploader_id: string;
  created_at: string;
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
