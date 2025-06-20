import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../services/users';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { UserIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditProfileForm = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      userType: user?.userType || 'customer',
      language: user?.language || 'ru',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updatedUser = await usersService.updateProfile(data);
      
      // Обновляем данные пользователя в контексте
      const token = localStorage.getItem('access_token');
      await login({ user: updatedUser, access_token: token });
      
      toast.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Update error:', error);
      const message = error.response?.data?.message || 'Ошибка при обновлении профиля';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const userTypeOptions = [
    {
      value: 'customer',
      label: 'Заказчик',
      description: 'Я заказываю услуги',
      icon: '👤'
    },
    {
      value: 'executor',
      label: 'Исполнитель',
      description: 'Я выполняю заказы',
      icon: '🔧'
    },
    {
      value: 'both',
      label: 'Заказчик и исполнитель',
      description: 'Я и заказываю, и выполняю',
      icon: '👥'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Редактировать профиль</h2>
            <p className="text-sm text-gray-600">Обновите свою личную информацию</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Имя и фамилия */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Имя"
              type="text"
              required
              placeholder="Введите имя"
              error={errors.firstName?.message}
              {...register('firstName', {
                required: 'Введите имя',
                minLength: {
                  value: 2,
                  message: 'Имя должно содержать минимум 2 символа',
                },
                maxLength: {
                  value: 50,
                  message: 'Имя не должно превышать 50 символов',
                },
              })}
            />

            <Input
              label="Фамилия"
              type="text"
              required
              placeholder="Введите фамилию"
              error={errors.lastName?.message}
              {...register('lastName', {
                required: 'Введите фамилию',
                minLength: {
                  value: 2,
                  message: 'Фамилия должна содержать минимум 2 символа',
                },
                maxLength: {
                  value: 50,
                  message: 'Фамилия не должна превышать 50 символов',
                },
              })}
            />
          </div>

          {/* Email */}
          <Input
            label="Email (необязательно)"
            type="email"
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Введите корректный email адрес',
              },
            })}
          />

          {/* Тип пользователя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Тип аккаунта <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {userTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    register('userType').value === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...register('userType', { required: 'Выберите тип аккаунта' })}
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
                  <CheckIcon className="h-5 w-5 text-blue-600" />
                </label>
              ))}
            </div>
            {errors.userType && (
              <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
            )}
          </div>

          {/* Язык интерфейса */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Язык интерфейса
            </label>
            <select
              className="form-input"
              {...register('language')}
            >
              <option value="ru">Русский</option>
              <option value="uz">O'zbekcha</option>
            </select>
          </div>

          {/* Информация о телефоне */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>📱</span>
              <span>Номер телефона: <strong>{user?.phone}</strong></span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Для изменения номера телефона обратитесь в поддержку
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              Отменить
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || !isDirty}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;