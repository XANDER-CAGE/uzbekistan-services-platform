import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Здесь должны быть реальные API вызовы
      // Пока используем моковые данные
      
      const mockStats = {
        users: {
          total: 1247,
          newToday: 15,
          newThisWeek: 89,
          newThisMonth: 324,
          verified: 1180,
          blocked: 12
        },
        orders: {
          total: 3856,
          active: 124,
          completed: 3421,
          cancelled: 311,
          newToday: 28,
          revenue: 45280000
        },
        executors: {
          total: 342,
          verified: 298,
          active: 267,
          newApplications: 18
        },
        complaints: {
          total: 89,
          pending: 12,
          inReview: 8,
          resolved: 69
        },
        revenue: {
          total: 45280000,
          thisMonth: 3850000,
          commission: 4528000,
          growth: 18.5
        }
      };

      const mockChartData = [
        { date: '2024-01-01', orders: 45, users: 23, revenue: 850000 },
        { date: '2024-01-02', orders: 52, users: 31, revenue: 1020000 },
        { date: '2024-01-03', orders: 48, users: 19, revenue: 920000 },
        { date: '2024-01-04', orders: 61, users: 41, revenue: 1180000 },
        { date: '2024-01-05', orders: 55, users: 35, revenue: 1050000 },
        { date: '2024-01-06', orders: 67, users: 28, revenue: 1290000 },
        { date: '2024-01-07', orders: 58, users: 33, revenue: 1110000 }
      ];

      const mockActivity = [
        {
          id: 1,
          type: 'new_user',
          title: 'Новый пользователь',
          description: 'Алишер Каримов зарегистрировался',
          time: '5 минут назад',
          icon: UsersIcon,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'order_completed',
          title: 'Заказ выполнен',
          description: 'Ремонт кондиционера #3856 завершен',
          time: '12 минут назад',
          icon: CheckCircleIcon,
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'complaint_new',
          title: 'Новая жалоба',
          description: 'Жалоба на заказ #3842 требует рассмотрения',
          time: '1 час назад',
          icon: ExclamationTriangleIcon,
          color: 'text-red-600'
        },
        {
          id: 4,
          type: 'executor_verification',
          title: 'Верификация исполнителя',
          description: 'Марат Усманов ожидает проверки документов',
          time: '2 часа назад',
          icon: UserGroupIcon,
          color: 'text-yellow-600'
        }
      ];

      setStats(mockStats);
      setChartData(mockChartData);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, trend, link }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">от прошлого месяца</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link
            to={link}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Подробнее →
          </Link>
        </div>
      )}
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick, link }) => {
    const content = (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    );

    if (link) {
      return <Link to={link}>{content}</Link>;
    }

    return <div onClick={onClick}>{content}</div>;
  };

  const ChartComponent = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Статистика за неделю</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">
            Заказы
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            Пользователи
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            Доходы
          </button>
        </div>
      </div>
      
      <div className="h-64 flex items-end justify-between space-x-2">
        {chartData.map((data, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="w-full bg-gray-100 rounded-t relative" style={{ minHeight: '200px' }}>
              <div 
                className="bg-blue-500 rounded-t transition-all duration-1000"
                style={{ 
                  height: `${(data.orders / Math.max(...chartData.map(d => d.orders))) * 180}px`,
                  width: '100%'
                }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              {new Date(data.date).toLocaleDateString('ru-RU', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            </p>
            <p className="text-sm font-medium text-gray-900">{data.orders}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600">Обзор состояния платформы</p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего пользователей"
          value={stats?.users.total}
          change={15.2}
          trend="up"
          icon={UsersIcon}
          color="bg-blue-500"
          link="/admin/users"
        />
        <StatCard
          title="Активные заказы"
          value={stats?.orders.active}
          change={8.1}
          trend="up"
          icon={ClipboardDocumentListIcon}
          color="bg-green-500"
          link="/admin/orders"
        />
        <StatCard
          title="Доходы этого месяца"
          value={`${(stats?.revenue.thisMonth / 1000000).toFixed(1)}M сум`}
          change={stats?.revenue.growth}
          trend={stats?.revenue.growth > 0 ? "up" : "down"}
          icon={CurrencyDollarIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Новые жалобы"
          value={stats?.complaints.pending}
          change={-5.4}
          trend="down"
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
          link="/admin/complaints"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Исполнители</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Всего</span>
              <span className="font-medium">{stats?.executors.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Верифицированные</span>
              <span className="font-medium text-green-600">{stats?.executors.verified}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Активные</span>
              <span className="font-medium text-blue-600">{stats?.executors.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ожидают проверки</span>
              <span className="font-medium text-yellow-600">{stats?.executors.newApplications}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Заказы по статусам</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Всего</span>
              <span className="font-medium">{stats?.orders.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Завершенные</span>
              <span className="font-medium text-green-600">{stats?.orders.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">В процессе</span>
              <span className="font-medium text-blue-600">{stats?.orders.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Отмененные</span>
              <span className="font-medium text-red-600">{stats?.orders.cancelled}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Финансы</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Общий оборот</span>
              <span className="font-medium">{(stats?.revenue.total / 1000000).toFixed(1)}M сум</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Комиссия</span>
              <span className="font-medium text-green-600">{(stats?.revenue.commission / 1000000).toFixed(1)}M сум</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Рост</span>
              <span className={`font-medium ${stats?.revenue.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.revenue.growth > 0 ? '+' : ''}{stats?.revenue.growth}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
          <div className="space-y-3">
            <QuickActionCard
              title="Проверить жалобы"
              description={`${stats?.complaints.pending} жалоб ожидают рассмотрения`}
              icon={ExclamationTriangleIcon}
              color="bg-red-500"
              link="/admin/complaints"
            />
            <QuickActionCard
              title="Верифицировать исполнителей"
              description={`${stats?.executors.newApplications} заявок на проверку`}
              icon={UserGroupIcon}
              color="bg-yellow-500"
              link="/admin/executors"
            />
            <QuickActionCard
              title="Создать отчет"
              description="Сгенерировать отчет по активности"
              icon={DocumentTextIcon}
              color="bg-blue-500"
              link="/admin/reports"
            />
            <QuickActionCard
              title="Системные настройки"
              description="Управление конфигурацией платформы"
              icon={Cog6ToothIcon}
              color="bg-gray-500"
              link="/admin/settings"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Последняя активность</h3>
          <Link to="/admin/logs" className="text-sm text-blue-600 hover:text-blue-500">
            Все логи →
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg bg-gray-100`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;