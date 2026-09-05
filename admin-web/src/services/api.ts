import { 
  SchoolProfile, AlumniProfile, Batch, EventItem, SchoolEventItem, AttendanceDashboard, 
  AttendanceRosterItem, CheckinResult, Announcement, Memory, DashboardReport,
  BatchCommitteeResponse, SchoolStaffMember, AssociationTeamMember, RankHolder, SchoolStaff
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  private token: string | null = sessionStorage.getItem('alumni_access_token') || localStorage.getItem('alumni_access_token');
  private cacheMap = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingPromises = new Map<string, Promise<any>>();
  private defaultCacheTTL = 20000; // 20 seconds default TTL

  setToken(token: string) {
    this.token = token;
    sessionStorage.setItem('alumni_access_token', token);
    localStorage.setItem('alumni_access_token', token);
    this.clearCache();
  }

  clearToken() {
    this.token = null;
    sessionStorage.removeItem('alumni_access_token');
    localStorage.removeItem('alumni_access_token');
    this.clearCache();
  }

  clearCache() {
    this.cacheMap.clear();
    this.pendingPromises.clear();
  }

  getToken(): string | null {
    return this.token || sessionStorage.getItem('alumni_access_token') || localStorage.getItem('alumni_access_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    const isGet = method === 'GET';
    const cacheKey = `${endpoint}`;

    if (isGet) {
      // 1. Return cached response if within TTL
      const cached = this.cacheMap.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < cached.ttl)) {
        return cached.data as T;
      }

      // 2. In-flight Promise Deduplication: Return ongoing promise if duplicate request fired simultaneously
      if (this.pendingPromises.has(cacheKey)) {
        return this.pendingPromises.get(cacheKey) as Promise<T>;
      }
    } else {
      // Invalidate cache on state-changing mutations
      this.clearCache();
    }

    const requestPromise = (async () => {
      try {
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
          if (response.status === 401) {
            this.clearToken();
          }
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

        const data = await response.json();
        if (isGet) {
          // Public endpoints get 60s stale time, user endpoints get 20s
          const ttl = endpoint.startsWith('/public') ? 60000 : this.defaultCacheTTL;
          this.cacheMap.set(cacheKey, { data, timestamp: Date.now(), ttl });
        }
        return data as T;
      } finally {
        if (isGet) {
          this.pendingPromises.delete(cacheKey);
        }
      }
    })();

    if (isGet) {
      this.pendingPromises.set(cacheKey, requestPromise);
    }

    return requestPromise;
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

  async updateAlumniProfile(data: Record<string, any>) {
    return this.request<AlumniProfile>('/alumni/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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

  async uploadSchoolImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    const response = await fetch(`${API_BASE_URL}/school/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: 'Image upload failed' }));
      throw new Error(errorBody.detail || 'Image upload failed');
    }

    return response.json() as Promise<{ url: string; filename: string }>;
  }

  async getSchoolStaff() {
    return this.request<SchoolStaffMember[]>('/school/staff');
  }

  async createSchoolStaff(data: Partial<SchoolStaffMember>) {
    return this.request<SchoolStaffMember>('/school/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSchoolStaff(staff_id: string, data: Partial<SchoolStaffMember>) {
    return this.request<SchoolStaffMember>(`/school/staff/${staff_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSchoolStaff(staff_id: string) {
    return this.request<{ success: boolean; message: string }>(`/school/staff/${staff_id}`, {
      method: 'DELETE',
    });
  }

  // Alumni Association Management Team
  async getAssociationTeam() {
    return this.request<AssociationTeamMember[]>('/association/team');
  }

  async createAssociationTeamMember(data: Partial<AssociationTeamMember>) {
    return this.request<AssociationTeamMember>('/association/team', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAssociationTeamMember(id: string, data: Partial<AssociationTeamMember>) {
    return this.request<AssociationTeamMember>(`/association/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAssociationTeamMember(id: string) {
    return this.request<{ success: boolean; message: string }>(`/association/team/${id}`, {
      method: 'DELETE',
    });
  }

  // School Rank Holders Management
  async getRankHolders(search?: string, academic_year?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (academic_year) params.append('academic_year', academic_year);
    return this.request<RankHolder[]>(`/rank-holders?${params.toString()}`);
  }

  async createRankHolder(data: Partial<RankHolder>) {
    return this.request<RankHolder>('/rank-holders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRankHolder(id: string, data: Partial<RankHolder>) {
    return this.request<{ success: boolean; message: string }>(`/rank-holders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRankHolder(id: string) {
    return this.request<{ success: boolean; message: string }>(`/rank-holders/${id}`, {
      method: 'DELETE',
    });
  }

  async getPublicRankHolders() {
    return this.request<RankHolder[]>('/public/rank-holders');
  }

  // School Events & Celebrations
  async getSchoolEvents(category?: string, status?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<SchoolEventItem[]>(`/school-events${queryString}`);
  }

  async createSchoolEvent(data: Partial<SchoolEventItem>) {
    return this.request<SchoolEventItem>('/school-events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSchoolEvent(id: string, data: Partial<SchoolEventItem>) {
    return this.request<SchoolEventItem>(`/school-events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSchoolEvent(id: string) {
    return this.request<{ success: boolean; message: string }>(`/school-events/${id}`, {
      method: 'DELETE',
    });
  }

  async seedSchoolEvents() {
    return this.request<{ success: boolean; message: string }>('/school-events/seed', {
      method: 'POST',
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

  async updateSchool(id: string, schoolData: any) {
    return this.request<SchoolProfile>(`/developer/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schoolData),
    });
  }

  async deleteSchool(id: string) {
    return this.request<{ success: boolean; message: string }>(`/developer/schools/${id}`, {
      method: 'DELETE',
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
    return this.assignCommitteeRole(batch_id, alumni_id, 'EXECUTIVE_MEMBER');
  }

  async getBatchCommittee(batch_id: string) {
    return this.request<BatchCommitteeResponse>(`/batches/${batch_id}/committee`);
  }

  async assignCommitteeRole(batch_id: string, alumni_id: string, role: string) {
    return this.request<{ success: boolean; message: string }>(`/batches/${batch_id}/committee`, {
      method: 'POST',
      body: JSON.stringify({ alumni_id, role }),
    });
  }

  async removeCommitteeRole(batch_id: string, alumni_id: string) {
    return this.request<{ success: boolean; message: string }>(`/batches/${batch_id}/committee/${alumni_id}`, {
      method: 'DELETE',
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

  async updateEvent(event_id: string, eventData: any) {
    return this.request<EventItem>(`/events/${event_id}`, {
      method: 'PUT',
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

  async deleteEvent(event_id: string) {
    return this.request<{ success: boolean; message: string }>(`/events/${event_id}`, { method: 'DELETE' });
  }

  async getPublicPastEvents() {
    return this.request<any[]>('/public/past-events');
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

  // Memories & Photos Management
  async getMemories(status?: string, media_type?: string, album_name?: string, search?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (media_type) params.append('media_type', media_type);
    if (album_name) params.append('album_name', album_name);
    if (search) params.append('search', search);
    return this.request<Memory[]>(`/memories?${params.toString()}`);
  }

  async getMemoryAlbums() {
    return this.request<{ album_name: string; count: number; cover_image_url: string; last_updated: string }[]>('/memories/albums');
  }

  async uploadMemoryFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/memories/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: 'File upload failed' }));
      throw new Error(errorBody.detail || 'File upload failed');
    }

    return response.json() as Promise<{ url: string; filename: string; media_type: string }>;
  }

  async uploadMultipleMemoryFiles(files: FileList | File[]) {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/memories/upload-multiple`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: 'Files upload failed' }));
      throw new Error(errorBody.detail || 'Files upload failed');
    }

    return response.json() as Promise<{ urls: string[]; files: any[] }>;
  }

  async createMemory(data: Partial<Memory>) {
    return this.request<Memory>('/memories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMemoryStatus(id: string, status: string, admin_remarks?: string) {
    return this.request<Memory>(`/memories/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_remarks }),
    });
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
    return this.request<Memory[]>('/public/memories');
  }

  async getPublicSchoolEvents() {
    return this.request<SchoolEventItem[]>('/public/school-events');
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

  async getPublicAssociationTeam() {
    return this.request<AssociationTeamMember[]>('/public/association-team');
  }

  async getPublicSchoolStaff() {
    return this.request<SchoolStaff[]>('/public/school-staff');
  }

  async getPublicOldStaff() {
    return this.request<SchoolStaff[]>('/public/old-staff');
  }

  // --- Document Requests API ---
  async getDocumentRequests() {
    return this.request<any[]>('/documents/requests');
  }

  async createDocumentRequest(data: { doc_type: string; reason: string; remarks?: string }) {
    return this.request<any>('/documents/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllDocumentRequestsAdmin(status?: string) {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<any[]>(`/documents/admin/requests${q}`);
  }

  async updateDocumentRequestAdmin(id: string, status: string, admin_remarks?: string) {
    return this.request<any>(`/documents/admin/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_remarks }),
    });
  }

  // --- Password Management API ---
  async changePassword(current_password: string, new_password: string) {
    return this.request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  }

  async resetPasswordWithOTP(email: string | undefined, mobile: string | undefined, otp: string, new_password: string) {
    return this.request<{ success: boolean; message: string }>('/auth/reset-password-with-otp', {
      method: 'POST',
      body: JSON.stringify({ email, mobile, otp, new_password }),
    });
  }
}

export const api = new ApiClient();
