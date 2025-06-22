import api from './api';

export const ordersService = {
  // Создать новый заказ
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Получить список заказов с фильтрацией
  async getOrders(params = {}) {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Получить мои заказы
  async getMyOrders(params = {}) {
    const response = await api.get('/orders/my', { params });
    return response.data;
  },

  // Получить заказ по ID
  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Обновить статус заказа
  async updateOrderStatus(id, statusData) {
    const response = await api.patch(`/orders/${id}/status`, statusData);
    return response.data;
  },

  // Завершить заказ с оценкой
  async completeOrder(id, completeData) {
    const response = await api.post(`/orders/${id}/complete`, completeData);
    return response.data;
  },

  // Загрузить файлы к заказу
  async uploadAttachments(id, files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('attachments', file);
    });
    
    const response = await api.post(`/orders/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // === ЗАЯВКИ НА ЗАКАЗЫ ===

  // Подать заявку на заказ
  async createApplication(orderId, applicationData) {
    const response = await api.post(`/orders/${orderId}/applications`, applicationData);
    return response.data;
  },

  // Получить заявки на заказ (для владельца заказа)
  async getOrderApplications(orderId) {
    const response = await api.get(`/orders/${orderId}/applications`);
    return response.data;
  },

  // Получить мои заявки (для исполнителя)
  async getMyApplications() {
    const response = await api.get('/orders/applications/my');
    return response.data;
  },

  // Принять заявку
  async acceptApplication(applicationId) {
    const response = await api.post(`/orders/applications/${applicationId}/accept`);
    return response.data;
  },

  // Отклонить заявку
  async rejectApplication(applicationId, reason) {
    const response = await api.post(`/orders/applications/${applicationId}/reject`, {
      reason
    });
    return response.data;
  },

// Умный поиск заказов
async smartSearch(params) {
    const response = await api.get('/orders/search/smart', { params });
    return response.data;
  },

  // Поиск заказов рядом
  async getNearbyOrders(lat, lng, radius = 10, limit = 20) {
    const response = await api.get('/orders/nearby', {
      params: { lat, lng, radius, limit }
    });
    return response.data;
  },

  // === ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ===

  // Отозвать заявку (исправленный метод)
  async withdrawMyApplication(applicationId) {
    const response = await api.post(`/orders/applications/${applicationId}/withdraw`);
    return response.data;
  },

  // Получить детальную заявку
  async getApplicationById(applicationId) {
    const response = await api.get(`/orders/applications/${applicationId}`);
    return response.data;
  },

  async uploadAttachments(orderId, files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('attachments', file);
    });
    
    const response = await api.post(`/orders/${orderId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },


  // === СТАТИСТИКА ===

  // Получить статистику дашборда
  async getDashboardStats() {
    const response = await api.get('/orders/stats/dashboard');
    return response.data;
  },

  // Получить рекомендованные заказы (для исполнителей)
  async getRecommendedOrders(limit = 10) {
    const response = await api.get('/orders/feed/recommended', {
      params: { limit }
    });
    return response.data;
  }
};