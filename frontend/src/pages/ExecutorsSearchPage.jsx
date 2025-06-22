import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { executorsService } from '../services/executors';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  FunnelIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ExecutorsSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [executors, setExecutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Состояние фильтров
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
    radius: searchParams.get('radius') || '10',
    minRating: searchParams.get('minRating') || '',
    onlyVerified: searchParams.get('onlyVerified') === 'true',
    onlyAvailable: searchParams.get('onlyAvailable') === 'true',
    onlyPremium: searchParams.get('onlyPremium') === 'true',
  });

  // Пагинация
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadExecutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const loadExecutors = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Убираем пустые параметры
      Object.keys(params).forEach(key => {
        if (!params[key] && params[key] !== false) delete params[key];
      });

      const response = await executorsService.getExecutors(params);
      
      setExecutors(response.executors || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      }));
    } catch (error) {
      console.error('Error loading executors:', error);
      toast.error('Ошибка загрузки исполнителей');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));

    // Обновляем URL
    const newSearchParams = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] !== '' && newFilters[key] !== false) {
        newSearchParams.set(key, newFilters[key]);
      }
    });
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadExecutors();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    setSearchParams(newSearchParams);
    window.scrollTo(0, 0);
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          }));
          toast.success('Местоположение определено');
        },
        (error) => {
          toast.error('Не удалось определить местоположение');
        }
      );
    } else {
      toast.error('Геолокация не поддерживается');
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      lat: '',
      lng: '',
      radius: '10',
      minRating: '',
      onlyVerified: false,
      onlyAvailable: false,
      onlyPremium: false,
    };
    setFilters(clearedFilters);
    setSearchParams({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getAvailabilityStatus = (executor) => {
    if (!executor.isAvailable) {
      return { label: 'Недоступен', color: 'bg-red-100 text-red-800' };
    }

    // Здесь можно добавить логику проверки рабочего времени
    return { label: 'Доступен', color: 'bg-green-100 text-green-800' };
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v && v !== '' && v !== false && v !== '10'
  ).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Поиск исполнителей
                </h1>
                <p className="text-gray-600 mt-2">
                  Найдите профессиональных исполнителей для ваших задач
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Поиск и фильтры */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Основной поиск */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по имени, специализации..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Поиск...' : 'Найти'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="relative"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                    Фильтры
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Расширенные фильтры */}
              {filtersOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  {/* Геолокация */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Местоположение
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Широта"
                        value={filters.lat}
                        onChange={(e) => handleFilterChange('lat', e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Долгота"
                        value={filters.lng}
                        onChange={(e) => handleFilterChange('lng', e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLocationDetect}
                        className="px-3"
                      >
                        <MapPinIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Радиус (км)
                    </label>
                    <select
                      value={filters.radius}
                      onChange={(e) => handleFilterChange('radius', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="5">5 км</option>
                      <option value="10">10 км</option>
                      <option value="20">20 км</option>
                      <option value="50">50 км</option>
                      <option value="100">100 км</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Минимальный рейтинг
                    </label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Любой</option>
                      <option value="3">3.0+</option>
                      <option value="4">4.0+</option>
                      <option value="4.5">4.5+</option>
                    </select>
                  </div>

                  {/* Чекбоксы */}
                  <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.onlyVerified}
                        onChange={(e) => handleFilterChange('onlyVerified', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Только верифицированные</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.onlyAvailable}
                        onChange={(e) => handleFilterChange('onlyAvailable', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Только доступные</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.onlyPremium}
                        onChange={(e) => handleFilterChange('onlyPremium', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Только премиум</span>
                    </label>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Очистить фильтры
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Результаты */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-600">
              {loading ? (
                'Загрузка...'
              ) : (
                `Найдено ${pagination.total} исполнителей`
              )}
            </div>
            
            {pagination.total > 0 && (
              <div className="text-sm text-gray-500">
                Страница {pagination.page} из {pagination.totalPages}
              </div>
            )}
          </div>

          {/* Список исполнителей */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : executors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {executors.map((executor) => {
                  const availability = getAvailabilityStatus(executor);
                  
                  return (
                    <Card key={executor.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6" onClick={() => navigate(`/executors/${executor.id}`)}>
                        {/* Заголовок профиля */}
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            {executor.user?.avatarUrl ? (
                              <img
                                src={executor.user.avatarUrl}
                                alt={executor.user.firstName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <UserIcon className="w-8 h-8 text-gray-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {executor.user?.firstName} {executor.user?.lastName}
                              </h3>
                              
                              {executor.isIdentityVerified && (
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              )}
                              
                              {executor.isPremium && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  PREMIUM
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <StarIcon className="w-4 h-4 text-yellow-500" />
                                <span className="font-medium">
                                  {executor.rating ? executor.rating.toFixed(1) : '0.0'}
                                </span>
                                <span>({executor.reviewsCount || 0})</span>
                              </div>
                              
                              <span className={`px-2 py-1 rounded-full text-xs ${availability.color}`}>
                                {availability.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Описание */}
                        {executor.bio && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {executor.bio}
                          </p>
                        )}

                        {/* Информация */}
                        <div className="space-y-2 text-sm mb-4">
                          {executor.experienceYears && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <ClockIcon className="w-4 h-4" />
                              <span>Опыт: {executor.experienceYears} лет</span>
                            </div>
                          )}

                          {executor.hourlyRate && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              <span>От {executor.hourlyRate.toLocaleString()} сум/час</span>
                            </div>
                          )}

                          {executor.address && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <MapPinIcon className="w-4 h-4" />
                              <span className="truncate">{executor.address}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-2 text-gray-600">
                            <span>✅</span>
                            <span>Заказов выполнено: {executor.completedOrders || 0}</span>
                          </div>
                        </div>

                        {/* Действия */}
                        <div className="flex space-x-2 pt-4 border-t border-gray-200">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/executors/${executor.id}`);
                            }}
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            Профиль
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/messages?executor=${executor.id}`);
                            }}
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                            Написать
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Пагинация */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Назад
                    </Button>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + Math.max(1, pagination.page - 2);
                      if (page > pagination.totalPages) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.page ? 'primary' : 'outline'}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Далее
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FunnelIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Исполнители не найдены
              </h3>
              <p className="text-gray-600 mb-4">
                Попробуйте изменить параметры поиска или очистить фильтры
              </p>
              <Button onClick={clearFilters}>
                Очистить фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExecutorsSearchPage;