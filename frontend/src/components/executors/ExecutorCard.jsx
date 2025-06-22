// frontend/src/components/executors/ExecutorCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { 
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const ExecutorCard = ({ 
  executor, 
  onViewProfile, 
  onSendMessage, 
  showActions = true,
  compact = false 
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(executor);
    } else {
      navigate(`/executors/${executor.id}`);
    }
  };

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage(executor);
    } else {
      navigate(`/messages?executor=${executor.id}`);
    }
  };

  const getAvailabilityStatus = () => {
    if (!executor.isAvailable) {
      return { label: 'Недоступен', color: 'bg-red-100 text-red-800' };
    }

    // Простая проверка - можно расширить логикой рабочего времени
    return { label: 'Доступен', color: 'bg-green-100 text-green-800' };
  };

  const availability = getAvailabilityStatus();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className={compact ? "p-4" : "p-6"} onClick={handleViewProfile}>
        {/* Заголовок профиля */}
        <div className={`flex items-center space-x-${compact ? '3' : '4'} mb-4`}>
          <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0`}>
            {executor.user?.avatarUrl ? (
              <img
                src={executor.user.avatarUrl}
                alt={executor.user.firstName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-gray-400`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-900 truncate`}>
                {executor.user?.firstName} {executor.user?.lastName}
              </h3>
              
              {executor.isIdentityVerified && (
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
              
              {executor.isPremium && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex-shrink-0">
                  PRO
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">
                  {executor.rating ? executor.rating.toFixed(1) : '0.0'}
                </span>
                <span>({executor.reviewsCount || 0})</span>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs ${availability.color}`}>
                {availability.label}
              </span>
            </div>
          </div>
        </div>

        {/* Описание */}
        {!compact && executor.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {executor.bio}
          </p>
        )}

        {/* Информация */}
        <div className="space-y-2 text-sm mb-4">
          {executor.experienceYears && (
            <div className="flex items-center space-x-2 text-gray-600">
              <ClockIcon className="w-4 h-4 flex-shrink-0" />
              <span>Опыт: {executor.experienceYears} лет</span>
            </div>
          )}

          {executor.hourlyRate && (
            <div className="flex items-center space-x-2 text-gray-600">
              <CurrencyDollarIcon className="w-4 h-4 flex-shrink-0" />
              <span>От {executor.hourlyRate.toLocaleString()} сум/час</span>
            </div>
          )}

          {executor.address && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPinIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{executor.address}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-gray-600">
            <BriefcaseIcon className="w-4 h-4 flex-shrink-0" />
            <span>Заказов выполнено: {executor.completedOrders || 0}</span>
          </div>

          {/* Время отклика */}
          {executor.responseTimeMinutes && (
            <div className="flex items-center space-x-2 text-gray-600">
              <ClockIcon className="w-4 h-4 flex-shrink-0" />
              <span>Отвечает в течение {executor.responseTimeMinutes} мин</span>
            </div>
          )}
        </div>

        {/* Рабочее время */}
        {!compact && executor.workStartTime && executor.workEndTime && (
          <div className="text-sm text-gray-600 mb-4">
            <span>Рабочее время: {executor.workStartTime} - {executor.workEndTime}</span>
          </div>
        )}

        {/* Действия */}
        {showActions && (
          <div className="flex space-x-2 pt-4 border-t border-gray-200">
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleViewProfile();
              }}
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              {compact ? 'Профиль' : 'Смотреть профиль'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleSendMessage();
              }}
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              {compact ? 'Написать' : 'Сообщение'}
            </Button>
          </div>
        )}

        {/* Премиум индикатор */}
        {executor.isPremium && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              ⭐ PREMIUM
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutorCard;