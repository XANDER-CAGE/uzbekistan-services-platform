import api from './api';

export const categoriesService = {
  // Получить все категории с фильтрацией
  async getCategories(params = {}) {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // Получить дерево категорий
  async getCategoriesTree(onlyActive = true) {
    const response = await api.get('/categories/tree', { 
      params: { onlyActive } 
    });
    return response.data;
  },

  // Получить популярные категории
  async getPopularCategories(limit = 8) {
    const response = await api.get('/categories/popular', { 
      params: { limit } 
    });
    return response.data;
  },

  // Получить корневые категории
  async getRootCategories() {
    const response = await api.get('/categories/root');
    return response.data;
  },

  // Получить категорию по ID
  async getCategoryById(id, includeChildren = false) {
    const response = await api.get(`/categories/${id}`, {
      params: { includeChildren }
    });
    return response.data;
  },

  // Получить категорию по slug
  async getCategoryBySlug(slug, includeChildren = false) {
    const response = await api.get(`/categories/slug/${slug}`, {
      params: { includeChildren }
    });
    return response.data;
  },

  // Получить хлебные крошки
  async getBreadcrumbs(id, language = 'ru') {
    const response = await api.get(`/categories/${id}/breadcrumbs`, {
      params: { language }
    });
    return response.data;
  },

  // Создать категорию (только для админов)
  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Обновить категорию (только для админов)
  async updateCategory(id, categoryData) {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Удалить категорию (только для админов)
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};