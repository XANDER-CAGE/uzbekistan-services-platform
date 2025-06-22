import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { executorsService } from '../services/executors';
import { categoriesService } from '../services/categories';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  BriefcaseIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ExecutorServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      priceType: 'fixed',
      isActive: true
    }
  });

  const watchPriceType = watch('priceType');

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await executorsService.getMyServices();
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Ошибка загрузки услуг');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await categoriesService.getCategoriesTree(true);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingService) {
        await executorsService.updateService(editingService.id, data);
        toast.success('Услуга обновлена');
      } else {
        await executorsService.createService(data);
        toast.success('Услуга создана');
      }
      
      resetForm();
      loadServices();
    } catch (error) {
      console.error('Service save error:', error);
      const message = error.response?.data?.message || 'Ошибка при сохранении услуги';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    reset({
      categoryId: service.categoryId || '',
      titleUz: service.titleUz,
      titleRu: service.titleRu,
      descriptionUz: service.descriptionUz || '',
      descriptionRu: service.descriptionRu || '',
      priceFrom: service.priceFrom || '',
      priceTo: service.priceTo || '',
      priceType: service.priceType,
      unit: service.unit || '',
      isActive: service.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        await executorsService.removeService(serviceId);
        toast.success('Услуга удалена');
        loadServices();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Ошибка удаления услуги');
      }
    }
  };

  const toggleServiceStatus = async (service) => {
    try {
      await executorsService.updateService(service.id, {
        isActive: !service.isActive
      });
      toast.success(service.isActive ? 'Услуга деактивирована' : 'Услуга активирована');
      loadServices();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Ошибка изменения статуса');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingService(null);
    reset({
      categoryId: '',
      titleUz: '',
      titleRu: '',
      descriptionUz: '',
      descriptionRu: '',
      priceFrom: '',
      priceTo: '',
      priceType: 'fixed',
      unit: '',
      isActive: true
    });
  };

  const priceTypeOptions = [
    {
      value: 'fixed',
      label: 'Фиксированная цена',
      description: 'Конкретная сумма за работу'
    },
    {
      value: 'hourly',
      label: 'Почасовая оплата',
      description: 'Оплата за час работы'
    },
    {
      value: 'negotiable',
      label: 'Договорная',
      description: 'Цена обсуждается с заказчиком'
    }
  ];

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управление услугами</h1>
              <p className="text-gray-600 mt-2">
                Добавляйте и редактируйте услуги, которые вы предоставляете
              </p>
            </div>
            
            <div className="flex gap-4 mt-4 lg:mt-0">
              <Button
                variant="outline"
                onClick={() => navigate('/executor/profile')}
              >
                Вернуться к профилю
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                disabled={showForm}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Добавить услугу
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Форма добавления/редактирования */}
            {showForm && (
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {editingService ? 'Редактировать услугу' : 'Новая услуга'}
                      </h2>
                      <button
                        onClick={resetForm}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {/* Категория */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Категория
                        </label>
                        <select
                          className="form-input w-full"
                          {...register('categoryId')}
                        >
                          <option value="">Без категории</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.nameRu}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Названия */}
                      <Input
                        label="Название на русском"
                        required
                        placeholder="Ремонт кондиционеров"
                        error={errors.titleRu?.message}
                        {...register('titleRu', {
                          required: 'Введите название услуги',
                          maxLength: {
                            value: 200,
                            message: 'Название не должно превышать 200 символов'
                          }
                        })}
                      />

                      <Input
                        label="Название на узбекском"
                        required
                        placeholder="Konditsioner ta'mirlash"
                        error={errors.titleUz?.message}
                        {...register('titleUz', {
                          required: 'Введите название услуги на узбекском',
                          maxLength: {
                            value: 200,
                            message: 'Название не должно превышать 200 символов'
                          }
                        })}
                      />

                      {/* Описания */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Описание на русском
                        </label>
                        <textarea
                          className="form-input w-full"
                          rows={3}
                          placeholder="Профессиональный ремонт кондиционеров всех марок..."
                          {...register('descriptionRu')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Описание на узбекском
                        </label>
                        <textarea
                          className="form-input w-full"
                          rows={3}
                          placeholder="Barcha brenddagi konditsionerlarni professional ta'mirlash..."
                          {...register('descriptionUz')}
                        />
                      </div>

                      {/* Тип ценообразования */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Тип ценообразования
                        </label>
                        <div className="space-y-2">
                          {priceTypeOptions.map((option) => (
                            <label
                              key={option.value}
                              className={`flex cursor-pointer rounded-lg border p-3 ${
                                watchPriceType === option.value
                                  ? 'border-primary-600 bg-primary-50'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                value={option.value}
                                className="sr-only"
                                {...register('priceType')}
                              />
                              <div className="flex-1">
                                <span className="block text-sm font-medium text-gray-900">
                                  {option.label}
                                </span>
                                <span className="block text-xs text-gray-500">
                                  {option.description}
                                </span>
                              </div>
                              {watchPriceType === option.value && (
                                <CheckIcon className="w-5 h-5 text-primary-600" />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Цены */}
                      {watchPriceType !== 'negotiable' && (
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Цена от (сум)"
                            type="number"
                            min="0"
                            placeholder="100000"
                            error={errors.priceFrom?.message}
                            {...register('priceFrom', {
                              min: {
                                value: 0,
                                message: 'Цена не может быть отрицательной'
                              }
                            })}
                          />

                          <Input
                            label="Цена до (сум)"
                            type="number"
                            min="0"
                            placeholder="500000"
                            error={errors.priceTo?.message}
                            {...register('priceTo', {
                              min: {
                                value: 0,
                                message: 'Цена не может быть отрицательной'
                              }
                            })}
                          />
                        </div>
                      )}

                      {/* Единица измерения */}
                      <Input
                        label="Единица измерения"
                        placeholder="за единицу, за м², за час"
                        error={errors.unit?.message}
                        {...register('unit', {
                          maxLength: {
                            value: 50,
                            message: 'Единица измерения не должна превышать 50 символов'
                          }
                        })}
                      />

                      {/* Активность */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          {...register('isActive')}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Активная услуга
                        </label>
                      </div>

                      {/* Кнопки */}
                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={formLoading}
                        >
                          Отмена
                        </Button>
                        <Button
                          type="submit"
                          loading={formLoading}
                          disabled={formLoading}
                        >
                          {editingService ? 'Обновить' : 'Создать'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Список услуг */}
            <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
              {services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <Card key={service.id} className={!service.isActive ? 'opacity-60' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {service.titleRu}
                              </h3>
                              
                              <div className="flex items-center space-x-2">
                                {!service.isActive && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    Неактивна
                                  </span>
                                )}
                                
                                {service.category && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {service.category.nameRu}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-1">{service.titleUz}</p>
                            
                            {service.descriptionRu && (
                              <p className="text-gray-700 mb-3">{service.descriptionRu}</p>
                            )}

                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="font-semibold text-green-600">
                                {service.formattedPrice}
                              </span>
                              
                              {service.unit && (
                                <span>Единица: {service.unit}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleServiceStatus(service)}
                              className={`p-2 rounded-lg ${
                                service.isActive
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title={service.isActive ? 'Деактивировать' : 'Активировать'}
                            >
                              {service.isActive ? (
                                <EyeIcon className="w-5 h-5" />
                              ) : (
                                <EyeSlashIcon className="w-5 h-5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleEdit(service)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Редактировать"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleDelete(service.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Удалить"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BriefcaseIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Услуги не добавлены
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Добавьте свои услуги, чтобы заказчики могли найти вас
                    </p>
                    <Button onClick={() => setShowForm(true)}>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Добавить первую услугу
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExecutorServicesPage;