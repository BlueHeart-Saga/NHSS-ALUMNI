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
      throw new Error(err.detail || `Error ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async sendOTP(mobile: string) {
    return this.request<{ success: boolean; message: string; dev_otp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyOTP(mobile: string, otp: string) {
    const res = await this.request<{
      access_token: string;
      verification_status?: string;
      registration_required: boolean;
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
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

  // School
  async getSchoolProfile() {
    return this.request<any>('/school/profile');
  }

  // Batches & Members
  async getBatches() {
    return this.request<any[]>('/batches');
  }

  async getBatchMembers(batchId: string) {
    return this.request<any[]>(`/batches/${batchId}/members`);
  }

  // Events & RSVP
  async getEvents() {
    return this.request<any[]>('/events');
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

  async updateProfile(data: any) {
    return this.request<any>('/alumni/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const mobileApi = new MobileApiClient();
