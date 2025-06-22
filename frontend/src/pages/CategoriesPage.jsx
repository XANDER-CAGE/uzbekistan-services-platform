import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { categoriesService } from '../services/categories';
import CategoryCard from '../components/categories/CategoryCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadCategories();
    loadPopularCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategoriesTree(true);
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Ошибка загрузки категорий');
    }
  };

  const loadPopularCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesService.getPopularCategories(8);
      setPopularCategories(response);
    } catch (error) {
      console.error('Error loading popular categories:', error);
      toast.error('Ошибка загрузки популярных категорий');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    // В реальном приложении здесь будет навигация
    console.log('Category clicked:', category);
    toast.success(`Выбрана категория: ${category.nameRu}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Здесь будет поиск по категориям
      console.log('Search:', searchQuery);
      toast.info(`Поиск: ${searchQuery}`);
    }
  };

  const filteredCategories = categories.filter(category => {
    if (selectedFilter === 'popular') {
      return category.isPopular;
    }
    if (searchQuery) {
      return (
        category.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.nameUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.descriptionRu && category.descriptionRu.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Категории услуг
          </h1>
          <p className="text-lg text-gray-600">
            Выберите категорию, чтобы найти нужную услугу
          </p>
        </div>

        {/* Поиск и фильтры */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск категорий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Button onClick={handleSearch}>
              Найти
            </Button>
          </div>

          {/* Фильтры */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Все категории
            </button>
            <button
              onClick={() => setSelectedFilter('popular')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'popular'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Популярные
            </button>
          </div>
        </div>

        {/* Популярные категории */}
        {selectedFilter === 'all' && popularCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Популярные категории
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Все категории */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedFilter === 'popular' ? 'Популярные категории' : 'Все категории'}
          </h2>
          
          {filteredCategories.length > 0 ? (
            <div className="space-y-8">
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  {/* Корневая категория */}
                  <div className="mb-4">
                    <CategoryCard
                      category={category}
                      size="large"
                      onClick={handleCategoryClick}
                    />
                  </div>

                  {/* Подкатегории */}
                  {category.children && category.children.length > 0 && (
                    <div className="ml-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {category.children.map((child) => (
                        <CategoryCard
                          key={child.id}
                          category={child}
                          size="small"
                          showDescription={false}
                          onClick={handleCategoryClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Категории не найдены
              </h3>
              <p className="text-gray-600">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;