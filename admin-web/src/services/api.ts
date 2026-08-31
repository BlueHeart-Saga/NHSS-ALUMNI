import { 
  SchoolProfile, AlumniProfile, Batch, EventItem, AttendanceDashboard, 
  AttendanceRosterItem, CheckinResult, Announcement, Memory, DashboardReport 
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  private token: string | null = localStorage.getItem('alumni_access_token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('alumni_access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('alumni_access_token');
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('alumni_access_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: 'An unexpected error occurred' }));
      let detailMsg = 'An unexpected error occurred';
      if (typeof errorBody.detail === 'string') {
        detailMsg = errorBody.detail;
      } else if (Array.isArray(errorBody.detail)) {
        detailMsg = errorBody.detail.map((err: any) => err.msg || (typeof err === 'string' ? err : JSON.stringify(err))).join(', ');
      } else if (errorBody.detail) {
        detailMsg = JSON.stringify(errorBody.detail);
      }
      throw new Error(detailMsg || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  private parseIdentifier(primary: string, secondary?: string) {
    if (!primary) return { email: undefined, mobile: secondary || undefined };
    if (primary.includes('@')) {
      return { email: primary, mobile: secondary || undefined };
    }
    return { email: undefined, mobile: primary };
  }

  // Auth
  async sendOTP(identifier: string, secondaryPhone?: string, checkUser: boolean = false, password?: string, forPasswordReset: boolean = false, checkAlreadyRegistered: boolean = false, forDeveloper: boolean = false) {
    const { email, mobile } = this.parseIdentifier(identifier, secondaryPhone);
    return this.request<{ success: boolean; message: string; email?: string; mobile?: string; dev_otp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, mobile, check_user: checkUser, password, for_password_reset: forPasswordReset, check_already_registered: checkAlreadyRegistered, for_developer: forDeveloper }),
    });
  }

  async verifyOTP(identifier: string, otp: string, secondaryPhone?: string) {
    const { email, mobile } = this.parseIdentifier(identifier, secondaryPhone);
    const res = await this.request<{
      access_token: string;
      user_id: string;
      roles: string[];
      verification_status: string;
      registration_required: boolean;
      resume_step?: number;
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, mobile, otp }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  async updatePassword(password: string) {
    return this.request<{ success: boolean; message: string }>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async setPasswordWithOTP(email: string, otp: string, password: string) {
    return this.request<{ success: boolean; message: string }>('/auth/set-password-with-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password }),
    });
  }

  async verifyAdminOTP(identifier: string, otp: string, secondaryPhone?: string) {
    const { email, mobile } = this.parseIdentifier(identifier, secondaryPhone);
    const res = await this.request<{
      access_token: string;
      user_id: string;
      roles: string[];
      verification_status: string;
      registration_required: boolean;
    }>('/auth/admin/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, mobile, otp }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  async register(data: Record<string, any>) {
    return this.request<AlumniProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<AlumniProfile>('/auth/me');
  }

  async getProfile() {
    return this.getMe();
  }

  // School
  async getSchoolProfile() {
    return this.request<SchoolProfile>('/school/profile');
  }

  async updateSchoolProfile(data: Partial<SchoolProfile>) {
    return this.request<SchoolProfile>('/school/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSchoolAdmins() {
    return this.request<AlumniProfile[]>('/school/admins');
  }

  async createSchoolAdmin(data: { full_name: string; mobile: string; email?: string; role?: string; passing_year?: number }) {
    return this.request<AlumniProfile>('/school/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Platform Developer Portal API Services
  async getDeveloperInfo() {
    return this.request<{ user_id: string; mobile: string; email?: string; roles: string[] }>('/developer/info');
  }

  async getAllSchools() {
    return this.request<any[]>('/developer/schools');
  }

  async createNewSchool(schoolData: {
    name: string;
    code: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
    contact_phone?: string;
    contact_email?: string;
    established_year?: number;
    logo_url?: string;
    cover_url?: string;
    status?: string;
    admin_full_name?: string;
    admin_mobile?: string;
    admin_email?: string;
  }) {
    return this.request<SchoolProfile>('/developer/schools', {
      method: 'POST',
      body: JSON.stringify(schoolData),
    });
  }

  async provisionAdminForSchool(school_id: string, data: { full_name: string; mobile: string; email?: string }) {
    return this.request<AlumniProfile>(`/developer/schools/${school_id}/admin`, {
      method: 'POST',
      body: JSON.stringify({ school_id, ...data }),
    });
  }

  // Batches
  async getBatches() {
    return this.request<Batch[]>('/batches');
  }

  async createBatch(name: string, passing_year: number, description?: string) {
    return this.request<Batch>('/batches', {
      method: 'POST',
      body: JSON.stringify({ name, passing_year, description }),
    });
  }

  async getBatchMembers(batch_id: string) {
    return this.request<AlumniProfile[]>(`/batches/${batch_id}/members`);
  }

  async assignCoordinator(batch_id: string, alumni_id: string) {
    return this.request<{ success: boolean; message: string }>(`/batches/${batch_id}/coordinators`, {
      method: 'POST',
      body: JSON.stringify({ alumni_id }),
    });
  }

  // Alumni & Verification
  async getPendingVerifications() {
    return this.request<AlumniProfile[]>('/alumni/pending');
  }

  async verifyAlumni(alumni_id: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED', notes?: string) {
    return this.request<{ success: boolean; message: string }>(`/alumni/${alumni_id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
  }

  async searchAlumni(search?: string, batch_year?: number, status?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (batch_year) params.append('batch_year', batch_year.toString());
    if (status) params.append('status', status);
    return this.request<AlumniProfile[]>(`/alumni/directory?${params.toString()}`);
  }

  async getAlumniDirectory(search?: string) {
    return this.searchAlumni(search);
  }

  async importCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const res = await fetch(`${API_BASE}/alumni/import-csv`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error('CSV upload failed');
    return res.json();
  }

  // Events
  async getEvents(batch_id?: string) {
    const endpoint = batch_id ? `/events?batch_id=${batch_id}` : '/events';
    return this.request<EventItem[]>(endpoint);
  }

  async createEvent(eventData: any) {
    return this.request<EventItem>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async getEventDetails(event_id: string) {
    return this.request<EventItem>(`/events/${event_id}`);
  }

  async publishEvent(event_id: string) {
    return this.request<{ success: boolean; message: string }>(`/events/${event_id}/publish`, { method: 'POST' });
  }

  async cancelEvent(event_id: string) {
    return this.request<{ success: boolean; message: string }>(`/events/${event_id}/cancel`, { method: 'POST' });
  }

  // Attendance & Check-in
  async getAttendanceDashboard(event_id: string) {
    return this.request<AttendanceDashboard>(`/attendance/${event_id}/dashboard`);
  }

  async getAttendanceRoster(event_id: string) {
    return this.request<AttendanceRosterItem[]>(`/attendance/${event_id}/roster`);
  }

  async scanQRToken(qr_token: string, event_id: string) {
    return this.request<CheckinResult>('/checkins/scan', {
      method: 'POST',
      body: JSON.stringify({ qr_token, event_id }),
    });
  }

  async manualCheckin(event_id: string, alumni_id: string) {
    return this.request<CheckinResult>('/checkins/manual', {
      method: 'POST',
      body: JSON.stringify({ event_id, alumni_id }),
    });
  }

  // Announcements
  async getAnnouncements(batch_id?: string) {
    const endpoint = batch_id ? `/announcements?batch_id=${batch_id}` : '/announcements';
    return this.request<Announcement[]>(endpoint);
  }

  async createAnnouncement(target: 'SCHOOL' | 'BATCH', title: string, content: string, batch_id?: string) {
    return this.request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify({ target, title, content, batch_id }),
    });
  }

  // Memories
  async getMemories(batch_id?: string, event_id?: string) {
    const params = new URLSearchParams();
    if (batch_id) params.append('batch_id', batch_id);
    if (event_id) params.append('event_id', event_id);
    return this.request<Memory[]>(`/memories?${params.toString()}`);
  }

  async deleteMemory(memory_id: string) {
    return this.request<{ success: boolean; message: string }>(`/memories/${memory_id}`, { method: 'DELETE' });
  }

  // Reports
  async getDashboardReport() {
    return this.request<DashboardReport>('/reports/summary');
  }

  getAlumniCSVExportUrl() {
    return `${API_BASE}/reports/export-alumni`;
  }

  getAttendanceCSVExportUrl(event_id: string) {
    return `${API_BASE}/reports/export-attendance/${event_id}`;
  }

  // Public Portal (Unauthenticated)
  async getPublicStats() {
    return this.request<{
      school_name: string;
      school_code: string;
      logo_url: string;
      cover_url: string;
      description: string;
      total_alumni: number;
      total_batches: number;
      total_events: number;
      years_connected: number;
    }>('/public/stats');
  }

  async getPublicEvents() {
    return this.request<Array<{
      id: string;
      title: string;
      batch_name: string;
      description: string;
      event_date: string;
      start_time: string;
      venue: string;
      attending_count: number;
      cover_image_url: string;
    }>>('/public/events');
  }

  async getPublicBatches() {
    return this.request<Array<{
      id: string;
      name: string;
      passing_year: number;
      total_members: number;
      cities_count: number;
      upcoming_events_count: number;
    }>>('/public/batches');
  }

  async getPublicHighlights() {
    return this.request<Array<{
      id: string;
      full_name: string;
      passing_year: number;
      profession: string;
      current_city: string;
      profile_photo_url: string;
    }>>('/public/highlights');
  }

  async getPublicMemories() {
    return this.request<Array<{
      id: string;
      title: string;
      image_url: string;
      uploader_name: string;
    }>>('/public/memories');
  }

  async getPublicAnnouncements() {
    return this.request<Array<{
      id: string;
      title: string;
      content: string;
      created_at: string;
    }>>('/public/announcements');
  }

  async submitContactEnquiry(data: { full_name: string; email: string; mobile?: string; message: string }) {
    return this.request<{ success: boolean; message: string }>('/public/contact-enquiry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
