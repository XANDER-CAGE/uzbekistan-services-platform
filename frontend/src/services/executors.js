import api from './api';

export const executorsService = {
  // === ПРОФИЛЬ ИСПОЛНИТЕЛЯ ===

  // Создать профиль исполнителя
  async createProfile(profileData) {
    const response = await api.post('/executors/profile', profileData);
    return response.data;
  },

  // Получить список исполнителей с фильтрацией
  async getExecutors(params = {}) {
    const response = await api.get('/executors', { params });
    return response.data;
  },

  // Найти исполнителей рядом
  async findNearby(lat, lng, radius = 10) {
    const response = await api.get('/executors/nearby', {
      params: { lat, lng, radius }
    });
    return response.data;
  },

  // Получить свой профиль исполнителя
  async getMyProfile() {
    const response = await api.get('/executors/profile/me');
    return response.data;
  },

  // Получить профиль исполнителя по ID
  async getProfile(id) {
    const response = await api.get(`/executors/${id}`);
    return response.data;
  },

  // Обновить свой профиль исполнителя
  async updateMyProfile(profileData) {
    const response = await api.patch('/executors/profile/me', profileData);
    return response.data;
  },

  // Загрузить фотографии портфолио
  async uploadPortfolio(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('portfolio', file);
    });
    
    const response = await api.post('/executors/profile/me/portfolio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Удалить фотографию из портфолио
  async removePortfolioImage(imageUrl) {
    const encodedUrl = encodeURIComponent(imageUrl);
    const response = await api.delete(`/executors/profile/me/portfolio/${encodedUrl}`);
    return response.data;
  },

  // === УСЛУГИ ИСПОЛНИТЕЛЯ ===

  // Создать услугу
  async createService(serviceData) {
    const response = await api.post('/executors/services', serviceData);
    return response.data;
  },

  // Получить услуги исполнителя
  async getExecutorServices(executorId) {
    const response = await api.get(`/executors/${executorId}/services`);
    return response.data;
  },

  // Получить свои услуги
  async getMyServices() {
    const response = await api.get('/executors/services/me');
    return response.data;
  },

  // Обновить услугу
  async updateService(serviceId, serviceData) {
    const response = await api.patch(`/executors/services/${serviceId}`, serviceData);
    return response.data;
  },

  // Удалить услугу
  async removeService(serviceId) {
    const response = await api.delete(`/executors/services/${serviceId}`);
    return response.data;
  },

  // === СТАТИСТИКА ===

  // Получить статистику исполнителя
  async getMyStats() {
    try {
      const response = await api.get('/executors/stats/me');
      return response.data;
    } catch (error) {
      // Возвращаем пустые данные если эндпоинт не реализован
      return {
        totalApplications: 0,
        acceptedApplications: 0,
        completedOrders: 0,
        totalEarned: 0,
        averageRating: 0,
        reviewsCount: 0
      };
    }
  }
};