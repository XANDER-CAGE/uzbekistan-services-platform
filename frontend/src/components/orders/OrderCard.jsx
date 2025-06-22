import React from 'react';
import { 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';

const OrderCard = ({ order, onOrderClick, onApplyClick, showApplyButton = false }) => {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      open: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      waiting_confirmation: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      disputed: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
      low: 'bg-green-50 text-green-700 border-green-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      high: 'bg-orange-50 text-orange-700 border-orange-200',
      urgent: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[urgency] || 'bg-gray-50 text-gray-700 border-gray-200';
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

  const isUrgent = order.urgency === 'urgent' || order.urgency === 'high';
  const isDeadlineSoon = order.deadline && new Date(order.deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000);

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
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Urgent indicator */}
      {isUrgent && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-red-500">
          <ExclamationTriangleIcon className="absolute -top-8 -right-2 w-4 h-4 text-white transform rotate-45" />
        </div>
      )}

      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 mr-4">
            <div className="flex items-start space-x-3 mb-2">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {order.title}
              </h3>
              {isDeadlineSoon && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Срочно
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {order.description}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(order.urgency)}`}>
            {getUrgencyLabel(order.urgency)}
          </span>
        </div>

        {/* Category */}
        {order.category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {order.category.nameRu}
            </span>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {/* Location */}
          <div className="flex items-start space-x-2">
            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 line-clamp-2">
              {order.address}
            </span>
          </div>

          {/* Time info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">
                {formatTimeAgo(order.createdAt)}
              </span>
            </div>
            
            {order.deadline && (
              <div className="flex items-center space-x-1 text-orange-600">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-xs">
                  до {new Date(order.deadline).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>

          {/* Customer info */}
          {order.customer && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">
                  {order.customer.firstName} {order.customer.lastName}
                </span>
              </div>
              
              {/* Stats */}
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-3 h-3" />
                  <span>{order.viewsCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftRightIcon className="w-3 h-3" />
                  <span>{order.applicationsCount || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Budget and Actions */}
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
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              Откликнуться
            </Button>
          )}
        </div>

        {/* Work schedule if specified */}
        {order.preferredStartDate && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <CalendarIcon className="w-4 h-4" />
              <span>
                Начать: {new Date(order.preferredStartDate).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;