import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { executorsService } from '../services/executors';
import Layout from '../components/layout/Layout';
import ExecutorProfileForm from '../components/executors/ExecutorProfileForm';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { 
  UserIcon,
  PlusIcon,
  PencilIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  CheckCircleIcon,
  EyeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ExecutorProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    totalApplications: 0,
    acceptedApplications: 0,
    completedOrders: 0,
    totalEarned: 0,
    averageRating: 0,
    reviewsCount: 0
  });

  useEffect(() => {
    loadProfile();
    loadServices();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await executorsService.getMyProfile();
      setProfile(profileData);
      setEditing(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error.response?.status === 404) {
        // Профиль не найден, показываем форму создания
        setProfile(null);
        setEditing(true);
      } else {
        toast.error('Ошибка загрузки профиля');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const servicesData = await executorsService.getMyServices();
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await executorsService.getMyStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleProfileSuccess = (updatedProfile) => {
    setProfile(updatedProfile);
    setEditing(false);
    loadStats(); // Перезагружаем статистику
  };

  const formatWorkingDays = (workingDays) => {
    if (!workingDays) return 'Не указано';
    
    const dayLabels = {
      monday: 'Пн',
      tuesday: 'Вт',
      wednesday: 'Ср',
      thursday: 'Чт',
      friday: 'Пт',
      saturday: 'Сб',
      sunday: 'Вс'
    };

    const workingDaysList = Object.entries(workingDays)
      .filter(([day, isWorking]) => isWorking)
      .map(([day]) => dayLabels[day]);

    return workingDaysList.length > 0 ? workingDaysList.join(', ') : 'Не указано';
  };

  const getAvailabilityStatus = () => {
    if (!profile) return { label: 'Неизвестно', color: 'bg-gray-100 text-gray-800' };
    
    if (!profile.isAvailable) {
      return { label: 'Недоступен', color: 'bg-red-100 text-red-800' };
    }

    // Проверяем текущее время и рабочие дни
    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (profile.workingDays && profile.workStartTime && profile.workEndTime) {
      const isDayWorking = profile.workingDays[currentDay];
      const isTimeWorking = currentTime >= profile.workStartTime && currentTime <= profile.workEndTime;

      if (isDayWorking && isTimeWorking) {
        return { label: 'Онлайн', color: 'bg-green-100 text-green-800' };
      } else {
        return { label: 'Оффлайн', color: 'bg-yellow-100 text-yellow-800' };
      }
    }

    return { label: 'Доступен', color: 'bg-green-100 text-green-800' };
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

  if (editing || !profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile ? 'Редактировать профиль исполнителя' : 'Создать профиль исполнителя'}
              </h1>
              <p className="text-gray-600 mt-2">
                {profile ? 
                  'Обновите информацию о себе и своих услугах' : 
                  'Создайте профиль исполнителя, чтобы получать заказы'
                }
              </p>
            </div>

            <ExecutorProfileForm
              existingProfile={profile}
              onSuccess={handleProfileSuccess}
            />
          </div>
        </div>
      </Layout>
    );
  }

  const availabilityStatus = getAvailabilityStatus();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Профиль исполнителя</h1>
              <p className="text-gray-600 mt-2">Управляйте своим профилем и услугами</p>
            </div>
            
            <div className="flex gap-4 mt-4 lg:mt-0">
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
              <Button onClick={() => navigate('/executor/services')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Управление услугами
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Основная информация */}
            <div className="lg:col-span-2 space-y-6">
              {/* Основные данные */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Основная информация</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${availabilityStatus.color}`}>
                      {availabilityStatus.label}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-10 h-10 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">
                            {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                          </span>
                          <span>({profile.reviewsCount || 0} отзывов)</span>
                        </div>
                        
                        {profile.experienceYears && (
                          <div className="flex items-center space-x-1">
                            <BriefcaseIcon className="w-4 h-4" />
                            <span>{profile.experienceYears} лет опыта</span>
                          </div>
                        )}

                        {profile.isIdentityVerified && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Верифицирован</span>
                          </div>
                        )}
                      </div>

                      {profile.bio && (
                        <p className="text-gray-600 mt-3">{profile.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Местоположение и рабочее время */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Местоположение</h3>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {profile.address && (
                        <p className="text-gray-600">{profile.address}</p>
                      )}
                      <p className="text-gray-500">
                        Радиус работы: {profile.workRadiusKm || 10} км
                      </p>
                      {profile.locationLat && profile.locationLng && (
                        <p className="text-gray-500 font-mono text-xs">
                          {profile.locationLat.toFixed(4)}, {profile.locationLng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Рабочее время</h3>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        {profile.workStartTime || '09:00'} - {profile.workEndTime || '18:00'}
                      </p>
                      <p className="text-gray-500">
                        Рабочие дни: {formatWorkingDays(profile.workingDays)}
                      </p>
                      {profile.hourlyRate && (
                        <p className="text-gray-600 font-medium">
                          Ставка: {profile.hourlyRate.toLocaleString()} сум/час
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Портфолио */}
              {profile.portfolioImages && profile.portfolioImages.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900">Портфолио</h3>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {profile.portfolioImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Работа ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                            <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Услуги */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Мои услуги ({services.length})</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/executor/services')}
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Добавить услугу
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {services.length > 0 ? (
                    <div className="space-y-4">
                      {services.slice(0, 3).map((service) => (
                        <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{service.titleRu}</h4>
                              {service.category && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {service.category.nameRu}
                                </p>
                              )}
                              {service.descriptionRu && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {service.descriptionRu}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-green-600">
                                {service.formattedPrice}
                              </p>
                              {!service.isActive && (
                                <span className="text-xs text-red-600">Неактивна</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {services.length > 3 && (
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => navigate('/executor/services')}
                        >
                          Показать все услуги ({services.length - 3})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BriefcaseIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Услуги не добавлены
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Добавьте услуги, чтобы получать больше заказов
                      </p>
                      <Button onClick={() => navigate('/executor/services')}>
                        Добавить первую услугу
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Боковая панель */}
            <div className="space-y-6">
              {/* Статистика */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Статистика</h3>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Всего заявок</span>
                      <span className="font-semibold">{stats.totalApplications}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Принято</span>
                      <span className="font-semibold text-green-600">{stats.acceptedApplications}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Завершено</span>
                      <span className="font-semibold">{stats.completedOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Заработано</span>
                      <span className="font-semibold">{stats.totalEarned.toLocaleString()} сум</span>
                    </div>
                    {stats.averageRating > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Рейтинг</span>
                        <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Социальные сети */}
              {(profile.telegramUsername || profile.instagramUsername) && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900">Контакты</h3>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {profile.telegramUsername && (
                        <a
                          href={`https://t.me/${profile.telegramUsername.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                        >
                          <span>📱</span>
                          <span>{profile.telegramUsername}</span>
                        </a>
                      )}
                      {profile.instagramUsername && (
                        <a
                          href={`https://instagram.com/${profile.instagramUsername.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-pink-600 hover:text-pink-700"
                        >
                          <span>📷</span>
                          <span>{profile.instagramUsername}</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Быстрые действия */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Быстрые действия</h3>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate('/orders?status=open')}
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Найти заказы
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate('/my-orders')}
                    >
                      <BriefcaseIcon className="w-4 h-4 mr-2" />
                      Мои заявки
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate('/messages')}
                    >
                      <span className="w-4 h-4 mr-2">💬</span>
                      Сообщения
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExecutorProfilePage;