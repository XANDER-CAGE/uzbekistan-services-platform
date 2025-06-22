import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { categoriesService } from '../services/categories';
import CategoryCard from '../components/categories/CategoryCard';
import Button from '../components/ui/Button';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularCategories, setPopularCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  useEffect(() => {
    loadPopularCategories();
  }, []);

  const loadPopularCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const categories = await categoriesService.getPopularCategories(7);
      setPopularCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategoriesError('Не удалось загрузить категории');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/orders?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/categories/${category.slug || category.id}`);
  };

  const handleRetryCategories = () => {
    loadPopularCategories();
  };

  const howItWorks = [
    {
      step: '1',
      title: 'Опишите задачу',
      description: 'Расскажите, что нужно сделать, укажите бюджет и сроки'
    },
    {
      step: '2',
      title: 'Получите отклики',
      description: 'Исполнители предложат свои услуги и цены'
    },
    {
      step: '3',
      title: 'Выберите исполнителя',
      description: 'Сравните предложения и выберите лучшего'
    },
    {
      step: '4',
      title: 'Получите результат',
      description: 'Исполнитель выполнит работу, вы оцените качество'
    }
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Безопасность',
      description: 'Все исполнители проходят проверку документов'
    },
    {
      icon: UserGroupIcon,
      title: 'Большой выбор',
      description: 'Тысячи проверенных исполнителей во всех сферах'
    },
    {
      icon: ClockIcon,
      title: 'Быстрый поиск',
      description: 'Найдите исполнителя за несколько минут'
    }
  ];

  const renderPopularCategoriesSection = () => {
    if (categoriesLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ошибка загрузки
          </h3>
          <p className="text-gray-600 mb-4">
            {categoriesError}
          </p>
          <Button onClick={handleRetryCategories}>
            Попробовать снова
          </Button>
        </div>
      );
    }

    if (popularCategories.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Категории не найдены
          </h3>
          <p className="text-gray-600 mb-4">
            В данный момент нет доступных категорий
          </p>
          <Button onClick={handleRetryCategories}>
            Обновить
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={handleCategoryClick}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/categories')}
          >
            Посмотреть все категории
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Найдите исполнителя
              <br />
              <span className="text-primary-200">для любой задачи</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Ремонт, уборка, доставка, репетиторы и многое другое. 
              Тысячи проверенных исполнителей готовы помочь вам.
            </p>
            
            {/* Search Form */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Что нужно сделать? Например: установить кондиционер"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-primary-300 text-lg"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  size="lg" 
                  className="bg-white text-primary-600 hover:bg-gray-50 px-8"
                >
                  Найти
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Популярные категории
            </h2>
            <p className="text-xl text-gray-600">
              Выберите нужную категорию или воспользуйтесь поиском
            </p>
          </div>

          {renderPopularCategoriesSection()}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Как это работает
            </h2>
            <p className="text-xl text-gray-600">
              Всего 4 простых шага до выполнения вашей задачи
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    {step.step}
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-300 transform translate-x-8"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Почему выбирают нас
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Готовы найти исполнителя?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Создайте заказ прямо сейчас и получите предложения от лучших исполнителей
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/orders/create')}
              className="bg-white text-primary-600 hover:bg-gray-50"
            >
              Создать заказ
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/executors')}
              className="border-white text-white hover:bg-white hover:text-primary-600"
            >
              Найти исполнителя
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;