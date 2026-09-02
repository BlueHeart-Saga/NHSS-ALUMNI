const API_BASE = '/api/v1';

class MobileApiClient {
  private token: string | null = localStorage.getItem('mobile_alumni_token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('mobile_alumni_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('mobile_alumni_token');
  }

  getToken() {
    return this.token || localStorage.getItem('mobile_alumni_token');
  }

  getGoogleLoginUrl() {
    return `${API_BASE}/auth/google/login`;
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
      const err = await response.json().catch(() => ({ detail: 'Request failed' }));
      let detailMsg = 'An unexpected error occurred';
      if (typeof err.detail === 'string') {
        detailMsg = err.detail;
      } else if (Array.isArray(err.detail)) {
        detailMsg = err.detail.map((e: any) => e.msg || (typeof e === 'string' ? e : JSON.stringify(e))).join(', ');
      }
      throw new Error(detailMsg || `Error ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async sendOTP(identifier: string, secondaryPhone?: string, checkUser: boolean = false, password?: string, forPasswordReset: boolean = false) {
    const isEmail = identifier.includes('@');
    const email = isEmail ? identifier : undefined;
    const mobile = !isEmail ? identifier : secondaryPhone;
    return this.request<{ success: boolean; message: string; dev_otp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, mobile, check_user: checkUser, password, for_password_reset: forPasswordReset }),
    });
  }

  async verifyOTP(mobile: string, otp: string) {
    const isEmail = mobile.includes('@');
    const res = await this.request<{
      access_token: string;
      verification_status?: string;
      registration_required: boolean;
      user_id?: string;
      roles?: string[];
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: isEmail ? mobile : undefined, mobile: !isEmail ? mobile : undefined, otp }),
    });
    if (res.access_token) this.setToken(res.access_token);
    return res;
  }

  async register(data: any) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Password Security
  async updatePassword(password: string) {
    return this.request<{ success: boolean; message: string }>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

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

  // School Profile & Events
  async getSchoolProfile() {
    return this.request<any>('/school/profile');
  }

  async getSchoolEvents(category?: string, status?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/school-events${queryString}`).catch(() => 
      this.request<any[]>(`/public/school-events${queryString}`)
    );
  }

  // Directory & Search
  async searchAlumni(search?: string, batch_year?: number, status?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (batch_year) params.append('batch_year', batch_year.toString());
    if (status) params.append('status', status);
    return this.request<any[]>(`/alumni/directory?${params.toString()}`);
  }

  async getAlumniDirectory(search?: string) {
    return this.searchAlumni(search);
  }

  // Batches & Members
  async getBatches() {
    return this.request<any[]>('/batches');
  }

  async getBatchMembers(batchId: string) {
    return this.request<any[]>(`/batches/${batchId}/members`);
  }

  // Events & RSVP
  async getEvents(batchId?: string) {
    const ep = batchId ? `/events?batch_id=${batchId}` : '/events';
    return this.request<any[]>(ep);
  }

  async getEventDetails(eventId: string) {
    return this.request<any>(`/events/${eventId}`);
  }

  async submitRSVP(eventId: string, rsvp_status: string, adults_count: number, children_count: number) {
    return this.request<any>(`/attendance/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ rsvp_status, adults_count, children_count }),
    });
  }

  async getMyTicket(eventId: string) {
    return this.request<any>(`/attendance/${eventId}/my-ticket`);
  }

  // Document Requests
  async getDocumentRequests() {
    return this.request<any[]>('/documents/requests');
  }

  async createDocumentRequest(data: { doc_type: string; reason: string; remarks?: string }) {
    return this.request<any>('/documents/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Announcements & Memories
  async getAnnouncements(batchId?: string) {
    const ep = batchId ? `/announcements?batch_id=${batchId}` : '/announcements';
    return this.request<any[]>(ep);
  }

  async getMemories(batchId?: string) {
    const ep = batchId ? `/memories?batch_id=${batchId}` : '/memories';
    return this.request<any[]>(ep);
  }

  async uploadPhoto(batchId: string, file: File, title?: string) {
    const formData = new FormData();
    formData.append('batch_id', batchId);
    if (title) formData.append('title', title);
    formData.append('file', file);

    const token = this.getToken();
    const res = await fetch(`${API_BASE}/memories/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error('Photo upload failed');
    return res.json();
  }

  async uploadSchoolImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/school/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) throw new Error('Image upload failed');
    return response.json() as Promise<{ url: string; filename: string }>;
  }

  async updateProfile(data: any) {
    return this.request<any>('/alumni/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Community Forums
  async getCommunityPosts(category?: string) {
    const q = category && category !== 'ALL' ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<any[]>(`/community/posts${q}`);
  }

  async createCommunityPost(data: { category: string; title: string; content: string }) {
    return this.request<any>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async likeCommunityPost(postId: string) {
    return this.request<any>(`/community/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  // Mentorship Network
  async getMentors() {
    return this.request<any[]>('/mentorship/mentors');
  }

  async registerAsMentor(data: { domain: string; available_hours: string; bio: string; skills?: string[] }) {
    return this.request<any>('/mentorship/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMentorshipRequest(data: { mentor_id: string; mentor_name: string; note: string }) {
    return this.request<any>('/mentorship/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const mobileApi = new MobileApiClient();
