import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../services/orders';
import { categoriesService } from '../../services/categories';
import Layout from '../../components/layout/Layout';
import OrderCard from '../../components/orders/OrderCard';
import Button from '../../components/ui/Button';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  FunnelIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  
  // Состояние фильтров
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    status: searchParams.get('status') || 'open',
    urgency: searchParams.get('urgency') || '',
    priceType: searchParams.get('priceType') || '',
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    location: searchParams.get('location') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  // Пагинация
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Статистика
  const [stats, setStats] = useState({
    totalOrders: 0,
    openOrders: 0,
    averageBudget: 0,
    popularCategories: []
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategoriesTree(true);
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Убираем пустые параметры
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await ordersService.getOrders(params);
      
      setOrders(response.orders || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      }));

      // Обновляем статистику
      setStats(prev => ({
        ...prev,
        totalOrders: response.total || 0,
        openOrders: response.orders?.filter(o => o.status === 'open').length || 0
      }));
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Ошибка загрузки заказов');
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
      if (newFilters[key]) {
        newSearchParams.set(key, newFilters[key]);
      }
    });
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    setSearchParams(newSearchParams);
    window.scrollTo(0, 0);
  };

  const handleOrderClick = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleApplyClick = (order) => {
    if (!user) {
      toast.error('Войдите в систему для подачи заявки');
      navigate('/login');
      return;
    }
    navigate(`/orders/${order.id}/apply`);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      categoryId: '',
      status: 'open',
      urgency: '',
      priceType: '',
      minBudget: '',
      maxBudget: '',
      location: '',
      sortBy: 'newest',
    };
    setFilters(clearedFilters);
    setSearchParams({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'open', label: 'Открытые' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершенные' },
  ];

  const urgencyOptions = [
    { value: '', label: 'Любая срочность' },
    { value: 'low', label: 'Не срочно' },
    { value: 'medium', label: 'Обычная' },
    { value: 'high', label: 'Срочно' },
    { value: 'urgent', label: 'Очень срочно' },
  ];

  const priceTypeOptions = [
    { value: '', label: 'Любой тип цены' },
    { value: 'fixed', label: 'Фиксированная' },
    { value: 'hourly', label: 'Почасовая' },
    { value: 'negotiable', label: 'Договорная' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Сначала новые' },
    { value: 'oldest', label: 'Сначала старые' },
    { value: 'budget_high', label: 'Дорогие сверху' },
    { value: 'budget_low', label: 'Дешевые сверху' },
    { value: 'urgent', label: 'Срочные сверху' },
    { value: 'popular', label: 'Популярные' },
  ];

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'open' && v !== 'newest').length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок и статистика */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  Поиск заказов
                </h1>
                <p className="text-gray-600 mt-2">
                  {user?.userType === 'customer' || user?.userType === 'both' 
                    ? 'Найдите исполнителей для ваших задач или посмотрите активные заказы'
                    : 'Найдите подходящие заказы для выполнения'
                  }
                </p>
                
                {/* Статистика */}
                <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{stats.totalOrders} заказов найдено</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{stats.openOrders} открытых</span>
                  </div>
                </div>
              </div>
              
              {user && (user.userType === 'customer' || user.userType === 'both') && (
                <Button
                  onClick={() => navigate('/orders/create')}
                  className="mt-4 lg:mt-0"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Создать заказ
                </Button>
              )}
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
                    placeholder="Поиск заказов..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Местоположение"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full lg:w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Поиск...' : 'Найти'}
                  </Button>
                  
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    >
                      <ArrowsUpDownIcon className="w-4 h-4 mr-2" />
                      Сортировка
                    </Button>
                    
                    {sortMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              handleFilterChange('sortBy', option.value);
                              setSortMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                              filters.sortBy === option.value ? 'bg-primary-50 text-primary-600' : ''
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категория
                    </label>
                    <select
                      value={filters.categoryId}
                      onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Все категории</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.nameRu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Статус
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Срочность
                    </label>
                    <select
                      value={filters.urgency}
                      onChange={(e) => handleFilterChange('urgency', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {urgencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип цены
                    </label>
                    <select
                      value={filters.priceType}
                      onChange={(e) => handleFilterChange('priceType', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {priceTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Бюджет от (сум)
                    </label>
                    <input
                      type="number"
                      placeholder="100000"
                      value={filters.minBudget}
                      onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Бюджет до (сум)
                    </label>
                    <input
                      type="number"
                      placeholder="1000000"
                      value={filters.maxBudget}
                      onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1"
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
                `Найдено ${pagination.total} заказов`
              )}
            </div>
            
            {pagination.total > 0 && (
              <div className="text-sm text-gray-500">
                Страница {pagination.page} из {pagination.totalPages}
              </div>
            )}
          </div>

          {/* Список заказов */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOrderClick={handleOrderClick}
                    onApplyClick={handleApplyClick}
                    showApplyButton={user && (user.userType === 'executor' || user.userType === 'both')}
                  />
                ))}
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
                Заказы не найдены
              </h3>
              <p className="text-gray-600 mb-4">
                Попробуйте изменить параметры поиска или создать новый заказ
              </p>
              {user && (user.userType === 'customer' || user.userType === 'both') && (
                <Button onClick={() => navigate('/orders/create')}>
                  Создать заказ
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;