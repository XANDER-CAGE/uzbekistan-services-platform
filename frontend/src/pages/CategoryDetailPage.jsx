import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ClockIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { categoriesService } from '../services/categories';
import CategoryCard from '../components/categories/CategoryCard';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import toast from 'react-hot-toast';

const CategoryDetailPage = () => {
  const [category, setCategory] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [relatedOrders, setRelatedOrders] = useState([]);
  const [topExecutors, setTopExecutors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // В реальном приложении получаем из URL параметров
  const categoryId = 1; // Пример

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      
      // Загружаем категорию с дочерними
      const categoryData = await categoriesService.getCategoryById(categoryId, true);
      setCategory(categoryData);

      // Загружаем хлебные крошки
      const breadcrumbsData = await categoriesService.getBreadcrumbs(categoryId);
      setBreadcrumbs(breadcrumbsData);

      // TODO: Загрузка связанных заказов и топ исполнителей
      // const ordersData = await ordersService.getOrdersByCategory(categoryId);
      // const executorsData = await executorsService.getTopByCategory(categoryId);
      
      // Мок данные для демонстрации
      setRelatedOrders([
        {
          id: 1,
          title: "Ремонт кондиционера Samsung",
          description: "Кондиционер не охлаждает, нужна диагностика",
          budgetFrom: 200000,
          budgetTo: 500000,
          urgency: "medium",
          location: "Юнусабадский район",
          createdAt: new Date(),
          applicationsCount: 5
        },
        {
          id: 2,
          title: "Установка нового кондиционера",
          description: "Нужно установить кондиционер в спальне",
          budgetFrom: 300000,
          budgetTo: 800000,
          urgency: "low",
          location: "Мирзо-Улугбекский район",
          createdAt: new Date(),
          applicationsCount: 8
        }
      ]);

      setTopExecutors([
        {
          id: 1,
          name: "Алишер Каримов",
          rating: 4.9,
          reviewsCount: 156,
          completedOrders: 200,
          specialization: "Ремонт и установка кондиционеров",
          responseTime: "30 мин",
          avatarUrl: null
        },
        {
          id: 2,
          name: "Бекзод Рахимов",
          rating: 4.8,
          reviewsCount: 89,
          completedOrders: 150,
          specialization: "Климатическая техника",
          responseTime: "1 час",
          avatarUrl: null
        }
      ]);

    } catch (error) {
      console.error('Error loading category:', error);
      toast.error('Ошибка загрузки категории');
    } finally {
      setLoading(false);
    }
  };

  const handleBreadcrumbClick = (item, index) => {
    console.log('Breadcrumb clicked:', item, index);
    // Навигация по хлебным крошкам
  };

  const handleSubcategoryClick = (subcategory) => {
    console.log('Subcategory clicked:', subcategory);
    // Переход к подкатегории
  };

  const handleOrderClick = (order) => {
    console.log('Order clicked:', order);
    toast.info(`Просмотр заказа: ${order.title}`);
  };

  const handleExecutorClick = (executor) => {
    console.log('Executor clicked:', executor);
    toast.info(`Профиль исполнителя: ${executor.name}`);
  };

  const formatBudget = (from, to) => {
    if (from && to && from !== to) {
      return `${from.toLocaleString()} - ${to.toLocaleString()} сум`;
    }
    if (from) {
      return `от ${from.toLocaleString()} сум`;
    }
    return 'Договорная';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyLabel = (urgency) => {
    const labels = {
      low: 'Не срочно',
      medium: 'Обычная',
      high: 'Срочно',
      urgent: 'Очень срочно'
    };
    return labels[urgency] || urgency;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Категория не найдена</h2>
          <p className="text-gray-600">Проверьте правильность ссылки</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Хлебные крошки */}
        <Breadcrumbs 
          items={breadcrumbs} 
          onItemClick={handleBreadcrumbClick}
        />

        {/* Заголовок категории */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start space-x-6">
            {/* Иконка категории */}
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            >
              {category.iconUrl ? (
                <span className="text-white">{category.iconUrl}</span>
              ) : (
                <span className="text-white font-bold">
                  {category.nameRu?.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category.nameRu}
              </h1>
              {category.nameUz && (
                <p className="text-lg text-gray-600 mb-4">
                  {category.nameUz}
                </p>
              )}
              {category.descriptionRu && (
                <p className="text-gray-700 mb-4">
                  {category.descriptionRu}
                </p>
              )}
              
              {/* Статистика */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>{category.servicesCount || 0} услуг</span>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4" />
                  <span>Рейтинг 4.8</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button>
                Создать заказ
              </Button>
              <Button variant="outline">
                Найти исполнителя
              </Button>
            </div>
          </div>
        </div>

        {/* Подкатегории */}
        {category.children && category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Подкатегории
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.children.map((subcategory) => (
                <CategoryCard
                  key={subcategory.id}
                  category={subcategory}
                  onClick={handleSubcategoryClick}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Актуальные заказы */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Актуальные заказы
              </h2>
              <Button variant="outline" size="sm">
                Показать все
              </Button>
            </div>

            <div className="space-y-4">
              {relatedOrders.map((order) => (
                <Card 
                  key={order.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleOrderClick(order)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {order.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {order.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(order.urgency)}`}>
                        {getUrgencyLabel(order.urgency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{order.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>2 часа назад</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatBudget(order.budgetFrom, order.budgetTo)}
                        </div>
                        <div className="text-xs text-primary-600">
                          {order.applicationsCount} откликов
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Топ исполнители */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Лучшие исполнители
            </h2>

            <div className="space-y-4">
              {topExecutors.map((executor) => (
                <Card 
                  key={executor.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleExecutorClick(executor)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {executor.avatarUrl ? (
                          <img 
                            src={executor.avatarUrl} 
                            alt={executor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {executor.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {executor.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {executor.specialization}
                        </p>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="font-medium">{executor.rating}</span>
                              <span className="text-gray-500">({executor.reviewsCount})</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{executor.completedOrders} заказов</span>
                            <span>Ответ: {executor.responseTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              Показать всех исполнителей
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;