import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { categoriesService } from '../../services/categories';
import { ordersService } from '../../services/orders';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  PhotoIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      priceType: 'fixed',
      urgency: 'medium',
      publish: true
    }
  });

  const watchPriceType = watch('priceType');
  const watchBudgetFrom = watch('budgetFrom');

  // Проверяем права доступа при загрузке компонента
  useEffect(() => {
    console.log('CreateOrderPage mounted. User:', user);
    
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
  
    // ИСПРАВЛЕНИЕ: Добавляем поддержку администраторов
    const hasAccess = user.userType === 'customer' || 
                     user.userType === 'both' || 
                     user.userType === 'admin' ||
                     user.role === 'admin' ||
                     user.role === 'super_admin';
  
    if (!hasAccess) {
      console.log('User type not allowed:', user.userType);
      toast.error('У вас нет прав для создания заказов');
      navigate('/');
      return;
    }
  
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Loading categories...');
      
      const response = await categoriesService.getCategoriesTree(true);
      console.log('Categories loaded:', response);
      
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Ошибка загрузки категорий');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedCategory) {
      toast.error('Выберите категорию услуги');
      return;
    }

    console.log('Submitting order:', { ...data, categoryId: selectedCategory.id });
    setLoading(true);
    
    try {
      const orderData = {
        ...data,
        categoryId: selectedCategory.id,
        budgetFrom: data.budgetFrom ? Number(data.budgetFrom) : undefined,
        budgetTo: data.budgetTo ? Number(data.budgetTo) : undefined,
      };

      const response = await ordersService.createOrder(orderData);
      console.log('Order created successfully:', response);
      
      toast.success('Заказ успешно создан!');
      navigate(`/orders/${response.id}`);
    } catch (error) {
      console.error('Create order error:', error);
      const message = error.response?.data?.message || 'Ошибка при создании заказа';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    console.log('Category selected:', category);
    setSelectedCategory(category);
    setStep(2);
  };

  const priceTypeOptions = [
    {
      value: 'fixed',
      label: 'Фиксированная цена',
      description: 'Конкретная сумма за работу',
      icon: '💰'
    },
    {
      value: 'hourly',
      label: 'Почасовая оплата',
      description: 'Оплата за час работы',
      icon: '⏰'
    },
    {
      value: 'negotiable',
      label: 'Договорная',
      description: 'Цена обсуждается с исполнителем',
      icon: '🤝'
    }
  ];

  const urgencyOptions = [
    {
      value: 'low',
      label: 'Не срочно',
      description: 'В течение недели',
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      value: 'medium',
      label: 'Обычная срочность',
      description: 'В течение 1-3 дней',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      value: 'high',
      label: 'Срочно',
      description: 'В течение дня',
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    {
      value: 'urgent',
      label: 'Очень срочно',
      description: 'Как можно скорее',
      color: 'text-red-600 bg-red-50 border-red-200'
    }
  ];

  const renderCategoryStep = () => {
    if (categoriesLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Загрузка категорий...
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="p-6 border border-gray-200 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Выберите категорию услуги
            </h2>
            <p className="text-gray-600">
              Категории недоступны. Попробуйте обновить страницу.
            </p>
            <Button 
              onClick={loadCategories}
              className="mt-4"
            >
              Обновить
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Выберите категорию услуги
          </h2>
          <p className="text-gray-600">
            Это поможет исполнителям лучше понять, какая помощь вам нужна
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className="p-6 text-left border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: category.color || '#3B82F6' }}
                >
                  <span className="text-white">{category.iconUrl || '🔧'}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{category.nameRu}</h3>
                  <p className="text-sm text-gray-500">{category.servicesCount || 0} услуг</p>
                </div>
              </div>
              {category.descriptionRu && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {category.descriptionRu}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderOrderForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Выбранная категория */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: selectedCategory?.color || '#3B82F6' }}
              >
                <span className="text-white">{selectedCategory?.iconUrl || '🔧'}</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedCategory?.nameRu}</h3>
                <p className="text-sm text-gray-500">Выбранная категория</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
            >
              Изменить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Основная информация */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Описание задачи</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Заголовок заказа"
            placeholder="Например: Ремонт кондиционера Samsung"
            required
            error={errors.title?.message}
            {...register('title', {
              required: 'Введите заголовок заказа',
              minLength: {
                value: 10,
                message: 'Заголовок должен содержать минимум 10 символов'
              },
              maxLength: {
                value: 200,
                message: 'Заголовок не должен превышать 200 символов'
              }
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подробное описание <span className="text-red-500">*</span>
            </label>
            <textarea
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              rows={4}
              placeholder="Опишите детально, что нужно сделать. Чем подробнее описание, тем точнее будут предложения исполнителей."
              {...register('description', {
                required: 'Введите описание заказа',
                minLength: {
                  value: 20,
                  message: 'Описание должно содержать минимум 20 символов'
                },
                maxLength: {
                  value: 2000,
                  message: 'Описание не должно превышать 2000 символов'
                }
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Бюджет */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Бюджет</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Тип ценообразования
            </label>
            <div className="space-y-3">
              {priceTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    watchPriceType === option.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...register('priceType')}
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="flex items-center text-sm font-medium text-gray-900">
                        <span className="mr-2 text-lg">{option.icon}</span>
                        {option.label}
                      </span>
                      <span className="text-sm text-gray-500">{option.description}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {watchPriceType !== 'negotiable' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Бюджет от (сум)"
                type="number"
                placeholder="200000"
                min="1000"
                error={errors.budgetFrom?.message}
                {...register('budgetFrom', {
                  min: {
                    value: 1000,
                    message: 'Минимальный бюджет 1000 сум'
                  }
                })}
              />
              <Input
                label="Бюджет до (сум)"
                type="number"
                placeholder="500000"
                min={watchBudgetFrom || "1000"}
                error={errors.budgetTo?.message}
                {...register('budgetTo', {
                  min: {
                    value: watchBudgetFrom || 1000,
                    message: 'Максимальный бюджет должен быть больше минимального'
                  }
                })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Местоположение */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Местоположение</h3>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            label="Адрес выполнения работ"
            placeholder="г. Ташкент, Юнусабадский район, ул. Амира Темура 15"
            required
            error={errors.address?.message}
            {...register('address', {
              required: 'Укажите адрес',
              minLength: {
                value: 10,
                message: 'Адрес должен содержать минимум 10 символов'
              }
            })}
          />
        </CardContent>
      </Card>

      {/* Сроки */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Сроки выполнения</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Срочность
            </label>
            <div className="space-y-3">
              {urgencyOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    watch('urgency') === option.value
                      ? `border-current ${option.color}`
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...register('urgency')}
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {option.label}
                      </span>
                      <span className="text-sm text-gray-500">{option.description}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Желаемая дата начала"
              type="datetime-local"
              {...register('preferredStartDate')}
            />
            <Input
              label="Крайний срок"
              type="datetime-local"
              {...register('deadline')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Действия */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="px-8"
        >
          {loading ? 'Создание заказа...' : 'Создать заказ'}
        </Button>
      </div>
    </form>
  );

  // Если пользователь не загружен, показываем загрузку
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Создать заказ</h1>
          <p className="text-gray-600 mt-2">
            Опишите задачу, и исполнители предложат свои услуги
          </p>
        </div>

        {/* Индикатор шагов */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Категория</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Детали заказа</span>
            </div>
          </div>
        </div>

        {/* Контент */}
        {step === 1 ? renderCategoryStep() : renderOrderForm()}
      </div>
    </div>
  );
};

export default CreateOrderPage;