import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../services/orders';
import OrderCard from '../../components/orders/OrderCard';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { 
  PlusIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    totalEarned: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      loadMyOrders();
    } else {
      loadMyApplications();
    }
  }, [activeTab, statusFilter]);

  const loadMyOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await ordersService.getMyOrders(params);
      setOrders(response.orders || []);
      
      // Подсчитываем статистику
      const totalOrders = response.orders?.length || 0;
      const activeOrders = response.orders?.filter(o => ['open', 'in_progress'].includes(o.status)).length || 0;
      const completedOrders = response.orders?.filter(o => o.status === 'completed').length || 0;
      const totalSpent = response.orders?.reduce((sum, o) => sum + (o.agreedPrice || 0), 0) || 0;
      
      setStats(prev => ({
        ...prev,
        totalOrders,
        activeOrders,
        completedOrders,
        totalSpent
      }));
    } catch (error) {
      console.error('Error loading my orders:', error);
      toast.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const loadMyApplications = async () => {
    try {
      setLoading(true);
      const response = await ordersService.getMyApplications();
      setApplications(response || []);
      
      // Подсчитываем статистику
      const totalApplications = response?.length || 0;
      const acceptedApplications = response?.filter(a => a.status === 'accepted').length || 0;
      const totalEarned = response?.filter(a => a.order?.status === 'completed').reduce((sum, a) => sum + (a.proposedPrice || 0), 0) || 0;
      
      setStats(prev => ({
        ...prev,
        totalApplications,
        acceptedApplications,
        totalEarned
      }));
    } catch (error) {
      console.error('Error loading my applications:', error);
      toast.error('Ошибка загрузки заявок');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const tabs = [
    {
      id: 'orders',
      name: 'Мои заказы',
      icon: ClipboardDocumentListIcon,
      show: user?.userType === 'customer' || user?.userType === 'both'
    },
    {
      id: 'applications',
      name: 'Мои заявки',
      icon: CheckCircleIcon,
      show: user?.userType === 'executor' || user?.userType === 'both'
    }
  ].filter(tab => tab.show);

  const statusOptions = [
    { value: 'all', label: 'Все' },
    { value: 'draft', label: 'Черновики' },
    { value: 'open', label: 'Открытые' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'waiting_confirmation', label: 'Ожидают подтверждения' },
    { value: 'completed', label: 'Завершенные' },
    { value: 'cancelled', label: 'Отмененные' },
  ];

  const applicationStatusOptions = [
    { value: 'all', label: 'Все' },
    { value: 'pending', label: 'Ожидают' },
    { value: 'accepted', label: 'Приняты' },
    { value: 'rejected', label: 'Отклонены' },
    { value: 'withdrawn', label: 'Отозваны' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_confirmation: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Черновик',
      open: 'Открыт',
      in_progress: 'В работе',
      waiting_confirmation: 'Ожидает подтверждения',
      completed: 'Завершен',
      cancelled: 'Отменен',
      pending: 'Ожидает',
      accepted: 'Принята',
      rejected: 'Отклонена',
      withdrawn: 'Отозвана',
    };
    return labels[status] || status;
  };

  const filteredApplications = statusFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === statusFilter);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === 'orders' ? 'Мои заказы' : 'Мои заявки'}
              </h1>
              <p className="text-gray-600 mt-2">
                {activeTab === 'orders' 
                  ? 'Управляйте своими заказами и следите за их выполнением'
                  : 'Отслеживайте статус ваших заявок на заказы'
                }
              </p>
            </div>
            
            {activeTab === 'orders' && (
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
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {activeTab === 'orders' ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Активных</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Завершено</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Потрачено</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalSpent.toLocaleString()} сум
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Всего заявок</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <EyeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Принято</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.acceptedApplications}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Заработано</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalEarned.toLocaleString()} сум
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Рейтинг</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.averageRating ? stats.averageRating.toFixed(1) : 'Нет'}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <StarIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Табы */}
        {tabs.length > 1 && (
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Фильтр по статусу */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Статус:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {(activeTab === 'orders' ? statusOptions : applicationStatusOptions).map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Контент */}
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
        ) : activeTab === 'orders' ? (
          filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onOrderClick={handleOrderClick}
                  showApplyButton={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Заказы не найдены
              </h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === 'all' 
                  ? 'У вас пока нет заказов'
                  : 'Нет заказов с выбранным статусом'
                }
              </p>
              <Button onClick={() => navigate('/orders/create')}>
                Создать первый заказ
              </Button>
            </div>
          )
        ) : (
          filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 
                            className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-primary-600"
                            onClick={() => handleOrderClick(application.order)}
                          >
                            {application.order?.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {application.message}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          {application.proposedPrice && (
                            <div>
                              <span className="text-gray-500">Предложенная цена:</span>
                              <p className="font-medium text-green-600">
                                {application.proposedPrice.toLocaleString()} сум
                              </p>
                            </div>
                          )}
                          
                          {application.proposedDurationDays && (
                            <div>
                              <span className="text-gray-500">Срок:</span>
                              <p className="font-medium">
                                {application.proposedDurationDays} дн.
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <span className="text-gray-500">Подана:</span>
                            <p className="font-medium">
                              {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOrderClick(application.order)}
                      >
                        Подробнее
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Заявки не найдены
              </h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === 'all' 
                  ? 'Вы еще не подавали заявки на заказы'
                  : 'Нет заявок с выбранным статусом'
                }
              </p>
              <Button onClick={() => navigate('/orders')}>
                Найти заказы
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;