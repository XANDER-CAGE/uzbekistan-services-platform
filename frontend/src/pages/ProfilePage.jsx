import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../services/users';
import Layout from '../components/layout/Layout';
import ProfileHeader from '../components/profile/ProfileHeader';
import EditProfileForm from '../components/profile/EditProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { 
  UserIcon, 
  LockClosedIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const userStats = await usersService.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'profile',
      name: 'Профиль',
      icon: UserIcon,
      description: 'Основная информация'
    },
    {
      id: 'security',
      name: 'Безопасность',
      icon: LockClosedIcon,
      description: 'Пароль и настройки'
    },
    {
      id: 'stats',
      name: 'Статистика',
      icon: ChartBarIcon,
      description: 'Активность и метрики'
    },
    {
      id: 'settings',
      name: 'Настройки',
      icon: Cog6ToothIcon,
      description: 'Дополнительные опции'
    }
  ];

  const StatCard = ({ title, value, description, color = "blue" }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`bg-${color}-100 p-3 rounded-lg`}>
          <ChartBarIcon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <EditProfileForm />;
        
      case 'security':
        return (
          <div className="space-y-6">
            <ChangePasswordForm />
            
            {/* Дополнительные настройки безопасности */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Дополнительная безопасность</h3>
                    <p className="text-sm text-gray-600">Настройки для защиты аккаунта</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">Двухфакторная аутентификация</h4>
                      <p className="text-sm text-gray-500">Дополнительная защита через SMS или приложение</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Настроить
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-900">История входов</h4>
                      <p className="text-sm text-gray-500">Просмотр активности вашего аккаунта</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Посмотреть
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Активные сессии</h4>
                      <p className="text-sm text-gray-500">Управление устройствами с доступом к аккаунту</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Управлять
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'stats':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <ChartBarIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Статистика активности</h3>
                    <p className="text-sm text-gray-600">Ваша активность на платформе</p>
                  </div>
                </div>
                
                {stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      title="Всего заказов" 
                      value="12" 
                      description="За все время"
                      color="blue" 
                    />
                    <StatCard 
                      title="Завершенных" 
                      value="8" 
                      description="Успешно выполнено"
                      color="green" 
                    />
                    <StatCard 
                      title="В процессе" 
                      value="2" 
                      description="Активные заказы"
                      color="yellow" 
                    />
                    <StatCard 
                      title="Рейтинг" 
                      value="4.8" 
                      description="Средняя оценка"
                      color="purple" 
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Статистика загружается...</p>
                  </div>
                )}
                
                {/* Дополнительная информация */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Активность по месяцам</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">График активности будет добавлен в следующих обновлениях</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Настройки аккаунта</h3>
                    <p className="text-sm text-gray-600">Дополнительные параметры и управление</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Уведомления */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Уведомления</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Email уведомления о новых заказах</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">SMS уведомления</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Push уведомления в браузере</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Приватность */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Приватность</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Показывать мой профиль в поиске</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Разрешить прямые сообщения</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Опасная зона */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                        <div>
                          <h4 className="font-medium text-red-900">Опасная зона</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Эти действия необратимы. Будьте осторожны.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-red-900">Деактивировать аккаунт</h5>
                            <p className="text-sm text-red-700">Временно скрыть профиль</p>
                          </div>
                          <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                            Деактивировать
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-red-900">Удалить аккаунт</h5>
                            <p className="text-sm text-red-700">Полностью удалить все данные</p>
                          </div>
                          <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок страницы */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
            <p className="text-gray-600 mt-2">
              Управляйте своим аккаунтом и настройками
            </p>
          </div>

          {/* Заголовок профиля */}
          <div className="mb-8">
            <ProfileHeader />
          </div>

          {/* Основной контент с табами */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Боковая панель с табами */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-sm text-gray-500">{tab.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Основной контент */}
            <div className="lg:col-span-3">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;