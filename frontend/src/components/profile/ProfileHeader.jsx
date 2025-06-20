import React, { useState, useRef } from 'react';
import { CameraIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { usersService } from '../../services/users';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const ProfileHeader = () => {
  const { user, login } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    setUploading(true);
    try {
      const updatedUser = await usersService.uploadAvatar(file);
      
      // Обновляем данные пользователя в контексте
      const token = localStorage.getItem('access_token');
      await login({ user: updatedUser, access_token: token });
      
      toast.success('Аватар успешно обновлен');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка при загрузке аватара');
    } finally {
      setUploading(false);
    }
  };

  const getUserTypeLabel = (userType) => {
    const labels = {
      customer: 'Заказчик',
      executor: 'Исполнитель',
      both: 'Заказчик и исполнитель'
    };
    return labels[userType] || userType;
  };

  const getUserTypeColor = (userType) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800',
      executor: 'bg-green-100 text-green-800',
      both: 'bg-purple-100 text-purple-800'
    };
    return colors[userType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Аватар */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user?.firstName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Кнопка загрузки аватара */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200 disabled:opacity-50"
          >
            {uploading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <CameraIcon className="w-4 h-4" />
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Информация о пользователе */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h1>
            
            {user?.isVerified && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Верифицирован</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Тип пользователя */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUserTypeColor(user?.userType)}`}>
              {getUserTypeLabel(user?.userType)}
            </span>

            {/* Язык */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {user?.language === 'uz' ? "O'zbekcha" : 'Русский'}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>{user?.phone}</span>
            </div>
            
            {user?.email && (
              <div className="flex items-center space-x-2">
                <span>📧</span>
                <span>{user.email}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span>📅</span>
              <span>
                Регистрация: {new Date(user?.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        {/* Статистика или действия */}
        <div className="flex flex-col space-y-2">
          {user?.userType === 'executor' || user?.userType === 'both' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/executor/profile'}
            >
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Профиль исполнителя
            </Button>
          ) : null}
          
          <div className="text-center">
            <div className="text-sm text-gray-500">ID пользователя</div>
            <div className="font-mono text-sm text-gray-700">#{user?.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;