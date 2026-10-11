/* ==========================================================================
   FDMS API Client & PostgreSQL Data Synchronization Layer
   ========================================================================== */
window.FDMSApi = {
  baseUrl: window.location.origin.includes('5000') 
    ? '' 
    : (window.location.protocol.startsWith('http') ? 'http://localhost:5000' : 'http://localhost:5000'),

  getToken: function() {
    return localStorage.getItem('fdms_auth_token') || '';
  },

  setToken: function(token) {
    if (token) localStorage.setItem('fdms_auth_token', token);
    else localStorage.removeItem('fdms_auth_token');
  },

  getCurrentUser: function() {
    try {
      const stored = localStorage.getItem('fdms_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser: function(user) {
    if (user) localStorage.setItem('fdms_user_profile', JSON.stringify(user));
    else localStorage.removeItem('fdms_user_profile');
  },

  request: async function(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      return data;
    } catch (err) {
      console.warn(`[FDMS API] Request to ${endpoint} failed:`, err.message);
      throw err;
    }
  },

  // --- Health & PostgreSQL Status ---
  checkHealth: async function() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`);
      return await res.json();
    } catch (err) {
      return { status: 'offline', database: 'disconnected' };
    }
  },

  // --- Auth APIs ---
  register: async function(userData) {
    return await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async function(credentials) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (res.token) this.setToken(res.token);
    if (res.user) this.setCurrentUser(res.user);
    return res;
  },

  adminLogin: async function(credentials) {
    const res = await this.request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (res.token) this.setToken(res.token);
    if (res.user) this.setCurrentUser(res.user);
    return res;
  },

  updateProfile: async function(profileData) {
    const res = await this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (res.user) this.setCurrentUser(res.user);
    return res;
  },

  changePassword: async function(passData) {
    return await this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passData),
    });
  },

  logout: function() {
    this.setToken(null);
    this.setCurrentUser(null);
  },

  getProfile: async function() {
    return await this.request('/api/auth/me');
  },

  // --- Users Governance APIs ---
  getUsers: async function() {
    return await this.request('/api/users');
  },

  deleteUser: async function(userId) {
    return await this.request(`/api/users/${userId}`, { method: 'DELETE' });
  },

  // --- Creators APIs ---
  getCreators: async function() {
    return await this.request('/api/creators');
  },

  createCreator: async function(creator) {
    return await this.request('/api/creators', {
      method: 'POST',
      body: JSON.stringify(creator),
    });
  },

  deleteCreator: async function(id) {
    return await this.request(`/api/creators/${id}`, { method: 'DELETE' });
  },

  // --- Videos APIs ---
  getVideos: async function() {
    return await this.request('/api/videos');
  },

  deleteVideo: async function(id) {
    return await this.request(`/api/videos/${id}`, { method: 'DELETE' });
  },

  // --- Reports APIs ---
  getReports: async function() {
    return await this.request('/api/reports');
  },

  createReport: async function(report) {
    return await this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  // --- AI Detection APIs ---
  runDetection: async function(handle, platform, analyzed_by) {
    return await this.request('/api/detections/run', {
      method: 'POST',
      body: JSON.stringify({ handle, platform, analyzed_by }),
    });
  },

  getRecentDetections: async function() {
    return await this.request('/api/detections/recent');
  },

  // --- Database Architecture APIs ---
  getDatabaseOverview: async function() {
    return await this.request('/api/database/overview');
  },

  getDatabaseTableRows: async function(tableName) {
    return await this.request(`/api/database/table/${tableName}`);
  },

  // --- Notifications & Threat Alerts APIs ---
  getNotifications: async function(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.severity && filters.severity !== 'All') params.append('severity', filters.severity);
    if (filters.is_read !== undefined && filters.is_read !== '') params.append('is_read', filters.is_read);
    if (filters.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/api/notifications${query}`);
  },

  createNotification: async function(notifData) {
    return await this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notifData),
    });
  },

  markNotificationRead: async function(id, is_read = true) {
    return await this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
      body: JSON.stringify({ is_read }),
    });
  },

  markAllNotificationsRead: async function() {
    return await this.request('/api/notifications/read-all', {
      method: 'PUT',
    });
  },

  deleteNotification: async function(id) {
    return await this.request(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  clearAllNotifications: async function() {
    return await this.request('/api/notifications', {
      method: 'DELETE',
    });
  },

  // --- Real-time Alerts & Outbound Webhook APIs ---
  dispatchWebhookAlert: async function(alertData) {
    return await this.request('/api/alerts/webhook', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  testWebhookPing: async function(webhook_url, email) {
    return await this.request('/api/alerts/test', {
      method: 'POST',
      body: JSON.stringify({ webhook_url, email }),
    });
  },

  getAlertHistory: async function() {
    return await this.request('/api/alerts/history');
  }
};

