import api from './api';

export const usersService = {
  // Получить текущий профиль
  async getCurrentProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Обновить профиль
  async updateProfile(userData) {
    const response = await api.patch('/users/me', userData);
    return response.data;
  },

  // Сменить пароль
  async changePassword(passwordData) {
    const response = await api.patch('/users/me/password', passwordData);
    return response.data;
  },

  // Загрузить аватар
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Получить статистику пользователя
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      // Возвращаем пустые данные если эндпоинт не реализован
      return {
        total: 0,
        customers: 0,
        executors: 0,
        verified: 0,
        blocked: 0
      };
    }
  }
};