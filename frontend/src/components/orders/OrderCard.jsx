import React from 'react';
import { 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';

const OrderCard = ({ order, onOrderClick, onApplyClick, showApplyButton = false }) => {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_confirmation: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-red-100 text-red-800'
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
      disputed: 'Спорный'
    };
    return labels[status] || status;
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

  const formatBudget = () => {
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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
  };

  const handleCardClick = () => {
    if (onOrderClick) {
      onOrderClick(order);
    }
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (onApplyClick) {
      onApplyClick(order);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Заголовок и статусы */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 mr-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {order.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {order.description}
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(order.urgency)}`}>
              {getUrgencyLabel(order.urgency)}
            </span>
          </div>
        </div>

        {/* Категория */}
        {order.category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {order.category.nameRu}
            </span>
          </div>
        )}

        {/* Основная информация */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Местоположение */}
          <div className="flex items-start space-x-2">
            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 line-clamp-2">
              {order.address}
            </span>
          </div>

          {/* Время */}
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              {formatTimeAgo(order.createdAt)}
            </span>
          </div>

          {/* Заказчик */}
          {order.customer && (
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                {order.customer.firstName} {order.customer.lastName}
              </span>
            </div>
          )}

          {/* Количество откликов */}
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              {order.applicationsCount || 0} откликов
            </span>
          </div>
        </div>

        {/* Нижняя часть: бюджет и кнопки */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-600 text-lg">
              {formatBudget()}
            </span>
          </div>

          {showApplyButton && order.status === 'open' && (
            <Button 
              size="sm"
              onClick={handleApplyClick}
            >
              Откликнуться
            </Button>
          )}
        </div>

        {/* Дедлайн если есть */}
        {order.deadline && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-orange-600">
              <ClockIcon className="w-4 h-4" />
              <span>
                Выполнить до: {new Date(order.deadline).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;