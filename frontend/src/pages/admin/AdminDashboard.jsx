import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin';
import { 
  UsersIcon, 
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [chartPeriod, setChartPeriod] = useState('week');
  const [chartType, setChartType] = useState('orders');

  // Загрузка статистики дашборда
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
    refetchInterval: 60000, // Обновляем каждую минуту
  });

  // Загрузка данных для графика
  const { 
    data: chartData, 
    isLoading: chartLoading 
  } = useQuery({
    queryKey: ['admin-chart-data', chartType, chartPeriod],
    queryFn: () => adminService.getChartData(chartType, chartPeriod),
    enabled: !!stats, // Загружаем только после получения статистики
  });

  // Загрузка последней активности (можно добавить отдельный эндпоинт)
  const { data: systemHealth } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: () => adminService.getSystemHealth(),
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  const StatCard = ({ title, value, change, icon: Icon, color, trend, link, loading = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
          {!loading && change !== undefined && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
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
      {link && !loading && (
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

  const ChartComponent = () => {
    if (chartLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Статистика за {chartPeriod === 'week' ? 'неделю' : chartPeriod === 'month' ? 'месяц' : 'год'}
          </h3>
          <div className="flex space-x-2">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="orders">Заказы</option>
              <option value="users">Пользователи</option>
              <option value="revenue">Доходы</option>
            </select>
            <select
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="year">Год</option>
            </select>
          </div>
        </div>
        
        {chartData && chartData.length > 0 ? (
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full bg-gray-100 rounded-t relative" style={{ minHeight: '200px' }}>
                  <div 
                    className="bg-blue-500 rounded-t transition-all duration-1000"
                    style={{ 
                      height: `${(data.value / Math.max(...chartData.map(d => d.value))) * 180}px`,
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
                <p className="text-sm font-medium text-gray-900">{data.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Нет данных для отображения
          </div>
        )}
      </div>
    );
  };

  if (statsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-red-800">Ошибка загрузки данных</h3>
              <p className="text-red-600 mt-1">
                {statsError.response?.data?.message || 'Не удалось загрузить статистику дашборда'}
              </p>
            </div>
            <button
              onClick={() => refetchStats()}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
          <p className="text-gray-600">Обзор состояния платформы</p>
        </div>
        <button
          onClick={() => refetchStats()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Обновить</span>
        </button>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего пользователей"
          value={stats?.users?.total}
          change={15.2}
          trend="up"
          icon={UsersIcon}
          color="bg-blue-500"
          link="/admin/users"
          loading={statsLoading}
        />
        <StatCard
          title="Активные заказы"
          value={stats?.orders?.active}
          change={8.1}
          trend="up"
          icon={ClipboardDocumentListIcon}
          color="bg-green-500"
          link="/admin/orders"
          loading={statsLoading}
        />
        <StatCard
          title="Доходы этого месяца"
          value={stats?.revenue?.thisMonth ? `${(stats.revenue.thisMonth / 1000000).toFixed(1)}M сум` : '-'}
          change={stats?.revenue?.growth}
          trend={stats?.revenue?.growth > 0 ? "up" : "down"}
          icon={CurrencyDollarIcon}
          color="bg-purple-500"
          loading={statsLoading}
        />
        <StatCard
          title="Новые жалобы"
          value={stats?.complaints?.pending}
          change={-5.4}
          trend="down"
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
          link="/admin/complaints"
          loading={statsLoading}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Исполнители</h3>
          {statsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего</span>
                <span className="font-medium">{stats?.executors?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Верифицированные</span>
                <span className="font-medium text-green-600">{stats?.executors?.verified || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Активные</span>
                <span className="font-medium text-blue-600">{stats?.executors?.active || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ожидают проверки</span>
                <span className="font-medium text-yellow-600">{stats?.executors?.newApplications || 0}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Заказы по статусам</h3>
          {statsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего</span>
                <span className="font-medium">{stats?.orders?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Завершенные</span>
                <span className="font-medium text-green-600">{stats?.orders?.completed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">В процессе</span>
                <span className="font-medium text-blue-600">{stats?.orders?.active || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Отмененные</span>
                <span className="font-medium text-red-600">{stats?.orders?.cancelled || 0}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Финансы</h3>
          {statsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Общий оборот</span>
                <span className="font-medium">{stats?.revenue?.total ? `${(stats.revenue.total / 1000000).toFixed(1)}M сум` : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Комиссия</span>
                <span className="font-medium text-green-600">{stats?.revenue?.commission ? `${(stats.revenue.commission / 1000000).toFixed(1)}M сум` : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Рост</span>
                <span className={`font-medium ${(stats?.revenue?.growth || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.revenue?.growth || 0) > 0 ? '+' : ''}{stats?.revenue?.growth || 0}%
                </span>
              </div>
            </div>
          )}
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
              description={`${stats?.complaints?.pending || 0} жалоб ожидают рассмотрения`}
              icon={ExclamationTriangleIcon}
              color="bg-red-500"
              link="/admin/complaints"
            />
            <QuickActionCard
              title="Верифицировать исполнителей"
              description={`${stats?.executors?.newApplications || 0} заявок на проверку`}
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

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Состояние системы</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              systemHealth.status === 'healthy' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {systemHealth.status === 'healthy' ? 'Здорова' : 'Проблемы'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Время работы:</span>
              <span className="ml-2 font-medium">{Math.floor(systemHealth.uptime / 3600)} часов</span>
            </div>
            <div>
              <span className="text-gray-600">Память:</span>
              <span className="ml-2 font-medium">{Math.round(systemHealth.memory?.used / 1024 / 1024) || 0} MB</span>
            </div>
            <div>
              <span className="text-gray-600">Последнее обновление:</span>
              <span className="ml-2 font-medium">{new Date(systemHealth.timestamp).toLocaleTimeString('ru-RU')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;