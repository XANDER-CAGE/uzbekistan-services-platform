import api from './api';

export const adminService = {
  // === ДАШБОРД И СТАТИСТИКА ===
  async getDashboardStats(params = {}) {
    const response = await api.get('/admin/dashboard', { params });
    return response.data;
  },

  async getChartData(type, period) {
    const response = await api.get('/admin/analytics/chart-data', {
      params: { type, period }
    });
    return response.data;
  },

  // === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ===
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async verifyUser(userId) {
    const response = await api.patch(`/admin/users/${userId}/verify`);
    return response.data;
  },

  async blockUser(userId, reason) {
    const response = await api.patch(`/admin/users/${userId}/block`, { reason });
    return response.data;
  },

  async unblockUser(userId) {
    const response = await api.patch(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  // === УПРАВЛЕНИЕ ЖАЛОБАМИ ===
  async getComplaints(params = {}) {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },

  async getComplaint(id) {
    const response = await api.get(`/admin/complaints/${id}`);
    return response.data;
  },

  async updateComplaint(id, data) {
    const response = await api.patch(`/admin/complaints/${id}`, data);
    return response.data;
  },

  async assignComplaint(id, adminId) {
    const response = await api.patch(`/admin/complaints/${id}/assign`, { adminId });
    return response.data;
  },

  // === УПРАВЛЕНИЕ ОТЧЕТАМИ ===
  async getReports(params = {}) {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  async createReport(data) {
    const response = await api.post('/admin/reports', data);
    return response.data;
  },

  async getReport(id) {
    const response = await api.get(`/admin/reports/${id}`);
    return response.data;
  },

  async downloadReport(id) {
    const response = await api.get(`/admin/reports/${id}/download`);
    return response.data;
  },

  async deleteReport(id) {
    const response = await api.delete(`/admin/reports/${id}`);
    return response.data;
  },

  // === СИСТЕМНЫЕ НАСТРОЙКИ ===
  async getSettings(category) {
    const response = await api.get('/admin/settings', { 
      params: category ? { category } : {} 
    });
    return response.data;
  },

  async getSetting(key) {
    const response = await api.get(`/admin/settings/${key}`);
    return response.data;
  },

  async updateSetting(key, value) {
    const response = await api.patch(`/admin/settings/${key}`, { value });
    return response.data;
  },

  async createSetting(data) {
    const response = await api.post('/admin/settings', data);
    return response.data;
  },

  // === УПРАВЛЕНИЕ ЗАКАЗАМИ ===
  async getOrders(params = {}) {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  async resolveDispute(orderId, resolution) {
    const response = await api.patch(`/admin/orders/${orderId}/resolve-dispute`, resolution);
    return response.data;
  },

  // === УПРАВЛЕНИЕ ИСПОЛНИТЕЛЯМИ ===
  async getPendingExecutors() {
    const response = await api.get('/admin/executors/pending-verification');
    return response.data;
  },

  async verifyExecutor(executorId, verification) {
    const response = await api.patch(`/admin/executors/${executorId}/verify`, verification);
    return response.data;
  },

  // === СИСТЕМНЫЕ ОПЕРАЦИИ ===
  async createBackup() {
    const response = await api.post('/admin/system/backup');
    return response.data;
  },

  async getSystemHealth() {
    const response = await api.get('/admin/system/health');
    return response.data;
  },

  async getLogs(level, limit) {
    const response = await api.get('/admin/logs', { 
      params: { level, limit } 
    });
    return response.data;
  }
};