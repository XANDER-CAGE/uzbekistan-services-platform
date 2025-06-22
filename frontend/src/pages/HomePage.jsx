// frontend/src/pages/HomePage.jsx - ОБНОВЛЕННАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoriesService } from '../services/categories';
import { ordersService } from '../services/orders';
import { executorsService } from '../services/executors';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import ExecutorCard from '../components/executors/ExecutorCard';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topExecutors, setTopExecutors] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalExecutors: 0,
    completedOrders: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Загружаем все данные параллельно
      const [categoriesData, ordersData, executorsData] = await Promise.all([
        categoriesService.getPopularCategories(8),
        ordersService.getOrders({ page: 1, limit: 6, status: 'open' }),
        executorsService.getExecutors({ page: 1, limit: 6, onlyVerified: true, minRating: 4.0 })
      ]);

      setCategories(categoriesData);
      setRecentOrders(ordersData.orders || []);
      setTopExecutors(executorsData.executors || []);
      
      // Устанавливаем статистику (можно получить с бэкенда)
      setStats({
        totalOrders: ordersData.total || 150,
        totalExecutors: executorsData.total || 85,
        completedOrders: 125,
        averageRating: 4.7
      });
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');
    
    if (search.trim()) {
      navigate(`/orders?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/orders');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50">
        {/* Hero секция */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                  Найдите идеального исполнителя для любой задачи
                </h1>
                <p className="text-xl lg:text-2xl opacity-90 mb-8">
                  Тысячи проверенных мастеров готовы помочь с ремонтом, уборкой, 
                  курьерскими услугами и многим другим в Узбекистане
                </p>
                
                {/* Поиск */}
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="search"
                      placeholder="Что нужно сделать? Например: ремонт кондиционера"
                      className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <Button type="submit" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                    Найти исполнителя
                  </Button>
                </form>

                {/* Быстрые действия */}
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/orders/create')}
                    className="border-white text-white hover:bg-white hover:text-primary-600"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать заказ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/executors')}
                    className="border-white text-white hover:bg-white hover:text-primary-600"
                  >
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    Найти исполнителей
                  </Button>
                </div>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2">{stats.totalOrders}+</div>
                  <div className="text-sm opacity-90">Активных заказов</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2">{stats.totalExecutors}+</div>
                  <div className="text-sm opacity-90">Исполнителей</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2">{stats.completedOrders}+</div>
                  <div className="text-sm opacity-90">Выполнено заказов</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center space-x-1 text-3xl font-bold mb-2">
                    <StarIcon className="w-8 h-8 text-yellow-300" />
                    <span>{stats.averageRating}</span>
                  </div>
                  <div className="text-sm opacity-90">Средний рейтинг</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Популярные категории */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Популярные категории услуг
            </h2>
            <p className="text-xl text-gray-600">
              Выберите категорию и найдите подходящего исполнителя
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/orders?categoryId=${category.id}`)}
              >
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  >
                    <span className="text-white">{category.iconUrl || '🔧'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.nameRu}</h3>
                  <p className="text-sm text-gray-500">{category.servicesCount || 0} услуг</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/categories')}
            >
              Все категории
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Топ исполнители */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Лучшие исполнители
                </h2>
                <p className="text-xl text-gray-600">
                  Проверенные специалисты с высоким рейтингом
                </p>
              </div>
              
              <div className="mt-4 lg:mt-0">
                <Button onClick={() => navigate('/executors')}>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Все исполнители
                </Button>
              </div>
            </div>

            {topExecutors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topExecutors.map((executor) => (
                  <ExecutorCard
                    key={executor.id}
                    executor={executor}
                    onViewProfile={() => navigate(`/executors/${executor.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Исполнители загружаются
                </h3>
                <p className="text-gray-600">
                  Пожалуйста, подождите немного
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Последние заказы */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Свежие заказы
              </h2>
              <p className="text-xl text-gray-600">
                Новые возможности для исполнителей
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Button onClick={() => navigate('/orders')}>
                <BriefcaseIcon className="w-4 h-4 mr-2" />
                Все заказы
              </Button>
            </div>
          </div>

          {recentOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {order.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {order.description}
                        </p>
                      </div>
                      
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Открыт
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Бюджет:</span>
                        <span className="font-medium text-green-600">
                          {order.formattedBudget}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Откликов:</span>
                        <span className="font-medium">{order.applicationsCount || 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Размещен:</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>

                    {order.category && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.category.nameRu}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BriefcaseIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Заказы загружаются
              </h3>
              <p className="text-gray-600">
                Новые заказы появятся здесь
              </p>
            </div>
          )}
        </div>

        {/* Призыв к действию */}
        <div className="bg-primary-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Готовы начать?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Присоединяйтесь к тысячам довольных пользователей УслугиУз
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/orders/create')}
                    className="bg-white text-primary-600 hover:bg-gray-100"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Создать заказ
                  </Button>
                  
                  {(user.userType === 'executor' || user.userType === 'both') && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/executor/profile')}
                      className="border-white text-white hover:bg-white hover:text-primary-600"
                    >
                      <UserGroupIcon className="w-5 h-5 mr-2" />
                      Мой профиль исполнителя
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="bg-white text-primary-600 hover:bg-gray-100"
                  >
                    Начать работу
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-white text-white hover:bg-white hover:text-primary-600"
                  >
                    Войти
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;