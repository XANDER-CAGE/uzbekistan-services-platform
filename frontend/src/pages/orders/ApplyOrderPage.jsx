import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../services/orders';
import { executorsService } from '../../services/executors.js';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { 
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ApplyOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [executorProfile, setExecutorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      proposedPrice: '',
      proposedDurationDays: '',
      message: '',
      availableFrom: new Date().toISOString().slice(0, 16),
    }
  });

  const watchPrice = watch('proposedPrice');

  useEffect(() => {
    loadOrderAndProfile();
  }, [id]);

  const loadOrderAndProfile = async () => {
    try {
      setLoading(true);
      
      // Загружаем заказ
      const orderData = await ordersService.getOrderById(id);
      setOrder(orderData);

      // Проверяем права доступа
      if (!user || (user.userType !== 'executor' && user.userType !== 'both')) {
        toast.error('Только исполнители могут подавать заявки');
        navigate('/orders');
        return;
      }

      if (orderData.customerId === user.id) {
        toast.error('Нельзя подавать заявку на собственный заказ');
        navigate(`/orders/${id}`);
        return;
      }

      if (orderData.status !== 'open') {
        toast.error('Заказ не принимает заявки');
        navigate(`/orders/${id}`);
        return;
      }

      // Загружаем профиль исполнителя
      try {
        const profileData = await executorsService.getMyProfile();
        setExecutorProfile(profileData);
        
        // Устанавливаем значения по умолчанию на основе профиля
        if (profileData.hourlyRate) {
          setValue('proposedPrice', profileData.hourlyRate.toString());
        }
      } catch (error) {
        toast.error('Создайте профиль исполнителя для подачи заявок');
        navigate('/profile');
        return;
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Ошибка загрузки заказа');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const applicationData = {
        proposedPrice: data.proposedPrice ? Number(data.proposedPrice) : undefined,
        proposedDurationDays: data.proposedDurationDays ? Number(data.proposedDurationDays) : undefined,
        message: data.message,
        availableFrom: data.availableFrom || undefined,
      };
  
      // ИСПРАВЛЕНИЕ: Убираем пустые поля
      Object.keys(applicationData).forEach(key => {
        if (applicationData[key] === undefined || applicationData[key] === '') {
          delete applicationData[key];
        }
      });
  
      console.log('Submitting application:', applicationData);
  
      await ordersService.createApplication(id, applicationData);
      
      toast.success('Заявка успешно подана!');
      navigate(`/orders/${id}`);
    } catch (error) {
      console.error('Submit application error:', error);
      
      // ИСПРАВЛЕНИЕ: Улучшенная обработка ошибок
      if (error.response?.status === 404) {
        toast.error('Заказ не найден');
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Заказ не принимает заявки';
        toast.error(message);
      } else if (error.response?.status === 409) {
        toast.error('Вы уже подавали заявку на этот заказ');
      } else if (error.response?.status === 403) {
        toast.error('У вас нет прав для подачи заявки');
      } else {
        toast.error('Ошибка при подаче заявки');
      }
    } finally {
      setSubmitting(false);
    }
  };
  

  const formatBudget = () => {
    if (!order) return '';
    
    if (order.priceType === 'negotiable') {
      return 'Договорная';
    }
    
    if (order.budgetFrom && order.budgetTo && order.budgetFrom !== order.budgetTo) {
      return `${order.budgetFrom.toLocaleString()} - ${order.budgetTo.toLocaleString()} сум`;
    }
    
    if (order.budgetFrom) {
      return `от ${order.budgetFrom.toLocaleString()} сум`;
    }
    
    return 'Не указан';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Заказ не найден</h2>
          <p className="text-gray-600 mb-4">Проверьте правильность ссылки</p>
          <Button onClick={() => navigate('/orders')}>
            Вернуться к заказам
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/orders/${id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Назад к заказу
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Подача заявки на заказ
          </h1>
          <p className="text-gray-600">
            Опишите, как вы планируете выполнить эту работу
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма заявки */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Информация о заказе */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">О заказе</h2>
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium text-gray-900 mb-2">{order.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {order.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Бюджет:</span>
                      <span className="font-medium text-green-600">{formatBudget()}</span>
                    </div>
                    
                    {order.deadline && (
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Срок до:</span>
                        <span className="font-medium">
                          {new Date(order.deadline).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Предложение */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Ваше предложение</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Предлагаемая цена (сум)"
                      type="number"
                      placeholder="200000"
                      min="1000"
                      error={errors.proposedPrice?.message}
                      {...register('proposedPrice', {
                        min: {
                          value: 1000,
                          message: 'Минимальная цена 1000 сум'
                        }
                      })}
                    />
                    
                    <Input
                      label="Срок выполнения (дней)"
                      type="number"
                      placeholder="3"
                      min="1"
                      max="365"
                      error={errors.proposedDurationDays?.message}
                      {...register('proposedDurationDays', {
                        min: {
                          value: 1,
                          message: 'Минимальный срок 1 день'
                        },
                        max: {
                          value: 365,
                          message: 'Максимальный срок 365 дней'
                        }
                      })}
                    />
                  </div>

                  <Input
                    label="Когда готовы начать"
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    {...register('availableFrom')}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Комментарий к заявке <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      rows={4}
                      placeholder="Опишите, как вы планируете выполнить эту работу, ваш опыт в данной области и почему заказчик должен выбрать именно вас."
                      {...register('message', {
                        required: 'Добавьте комментарий к заявке',
                        minLength: {
                          value: 20,
                          message: 'Комментарий должен содержать минимум 20 символов'
                        },
                        maxLength: {
                          value: 1000,
                          message: 'Комментарий не должен превышать 1000 символов'
                        }
                      })}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Предупреждения */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>Важно:</strong> После подачи заявки вы сможете отозвать её только до принятия заказчиком. 
                          Укажите реальные сроки и стоимость работ.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Кнопки */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/orders/${id}`)}
                  disabled={submitting}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                  className="px-8"
                >
                  {submitting ? 'Подача заявки...' : 'Подать заявку'}
                </Button>
              </div>
            </form>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Мой профиль */}
            {executorProfile && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Мой профиль</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Рейтинг: {executorProfile.rating || 'Нет рейтинга'} 
                        ({executorProfile.reviewsCount || 0} отзывов)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Опыт:</span>
                      <span className="font-medium">
                        {executorProfile.experienceYears ? 
                          `${executorProfile.experienceYears} лет` : 
                          'Не указан'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Выполнено заказов:</span>
                      <span className="font-medium">{executorProfile.completedOrders || 0}</span>
                    </div>
                    {executorProfile.hourlyRate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Почасовая ставка:</span>
                        <span className="font-medium">
                          {executorProfile.hourlyRate.toLocaleString()} сум/ч
                        </span>
                      </div>
                    )}
                  </div>

                  {executorProfile.isIdentityVerified && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Личность подтверждена</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Советы */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Советы</h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Укажите реалистичную цену, основываясь на сложности работы</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Опишите детально план выполнения работы</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Укажите свой опыт в данной области</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Будьте вежливы и профессиональны</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyOrderPage;