import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usersService } from '../../services/users';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await usersService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      toast.success('Пароль успешно изменен');
      reset();
    } catch (error) {
      console.error('Password change error:', error);
      const message = error.response?.data?.message || 'Ошибка при смене пароля';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    let feedback = [];

    // Длина
    if (password.length >= 8) score += 1;
    else feedback.push('минимум 8 символов');

    // Буквы разного регистра
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    else feedback.push('буквы разного регистра');

    // Цифры
    if (/\d/.test(password)) score += 1;
    else feedback.push('цифры');

    // Специальные символы
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('специальные символы');

    const strengthMap = {
      0: { label: 'Очень слабый', color: 'bg-red-500' },
      1: { label: 'Слабый', color: 'bg-red-400' },
      2: { label: 'Средний', color: 'bg-yellow-500' },
      3: { label: 'Хороший', color: 'bg-blue-500' },
      4: { label: 'Отличный', color: 'bg-green-500' },
    };

    return {
      strength: score,
      label: strengthMap[score].label,
      color: strengthMap[score].color,
      feedback: feedback.length > 0 ? `Добавьте: ${feedback.join(', ')}` : 'Пароль соответствует требованиям'
    };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <LockClosedIcon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Сменить пароль</h2>
            <p className="text-sm text-gray-600">Обновите пароль для обеспечения безопасности</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Текущий пароль */}
          <div className="relative">
            <Input
              label="Текущий пароль"
              type={showCurrentPassword ? 'text' : 'password'}
              required
              placeholder="Введите текущий пароль"
              error={errors.currentPassword?.message}
              {...register('currentPassword', {
                required: 'Введите текущий пароль',
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Новый пароль */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                label="Новый пароль"
                type={showNewPassword ? 'text' : 'password'}
                required
                placeholder="Введите новый пароль"
                error={errors.newPassword?.message}
                {...register('newPassword', {
                  required: 'Введите новый пароль',
                  minLength: {
                    value: 6,
                    message: 'Пароль должен содержать минимум 6 символов',
                  },
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Индикатор силы пароля */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {passwordStrength.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {passwordStrength.feedback}
                </p>
              </div>
            )}
          </div>

          {/* Подтверждение пароля */}
          <div className="relative">
            <Input
              label="Подтвердите новый пароль"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder="Повторите новый пароль"
              error={errors.confirmNewPassword?.message}
              {...register('confirmNewPassword', {
                required: 'Подтвердите новый пароль',
                validate: (value) =>
                  value === newPassword || 'Пароли не совпадают',
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Рекомендации по безопасности */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Рекомендации для безопасного пароля:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Минимум 8 символов</li>
              <li>• Комбинация букв, цифр и специальных символов</li>
              <li>• Не используйте личную информацию</li>
              <li>• Не повторяйте старые пароли</li>
            </ul>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => reset()}
              disabled={loading}
            >
              Очистить
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Изменение пароля...' : 'Изменить пароль'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;