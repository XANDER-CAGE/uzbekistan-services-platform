import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading, error, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [language, setLanguage] = useState('ru');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userType: 'customer',
      language: 'ru'
    }
  });

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Аккаунт успешно создан!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(error || 'Ошибка регистрации');
    }
  };

  const userTypeOptions = [
    {
      value: 'customer',
      title: 'Заказчик',
      description: 'Я хочу заказывать услуги',
      icon: '👤'
    },
    {
      value: 'executor',
      title: 'Исполнитель',
      description: 'Я хочу выполнять заказы',
      icon: '🔧'
    },
    {
      value: 'both',
      title: 'Заказчик и исполнитель',
      description: 'Я хочу и заказывать, и выполнять',
      icon: '👥'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">У</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">УслугиУз</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Создать аккаунт
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Войти
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Тип аккаунта <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {userTypeOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                        userType === option.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        className="sr-only"
                        {...register('userType', { required: 'Выберите тип аккаунта' })}
                        onChange={(e) => setUserType(e.target.value)}
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="flex items-center text-sm font-medium text-gray-900">
                            <span className="mr-2 text-lg">{option.icon}</span>
                            {option.title}
                          </span>
                          <span className="text-sm text-gray-500">{option.description}</span>
                        </span>
                      </span>
                      {userType === option.value && (
                        <CheckIcon className="h-5 w-5 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>
                {errors.userType && (
                  <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Имя"
                  type="text"
                  required
                  placeholder="Алишер"
                  error={errors.firstName?.message}
                  {...register('firstName', {
                    required: 'Введите имя',
                    minLength: {
                      value: 2,
                      message: 'Имя должно содержать минимум 2 символа',
                    },
                  })}
                />

                <Input
                  label="Фамилия"
                  type="text"
                  required
                  placeholder="Каримов"
                  error={errors.lastName?.message}
                  {...register('lastName', {
                    required: 'Введите фамилию',
                    minLength: {
                      value: 2,
                      message: 'Фамилия должна содержать минимум 2 символа',
                    },
                  })}
                />
              </div>

              <Input
                label="Номер телефона"
                type="tel"
                required
                placeholder="+998901234567"
                error={errors.phone?.message}
                {...register('phone', {
                  required: 'Введите номер телефона',
                  pattern: {
                    value: /^\+998\d{9}$/,
                    message: 'Введите корректный номер телефона (+998XXXXXXXXX)',
                  },
                })}
              />

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

              <div className="relative">
                <Input
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Минимум 6 символов"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Введите пароль',
                    minLength: {
                      value: 6,
                      message: 'Пароль должен содержать минимум 6 символов',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <Input
                label="Подтвердите пароль"
                type="password"
                required
                placeholder="Повторите пароль"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Подтвердите пароль',
                  validate: (value) =>
                    value === password || 'Пароли не совпадают',
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Язык интерфейса
                </label>
                <select
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  {...register('language')}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="ru">Русский</option>
                  <option value="uz">O'zbekcha</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                  Я согласен с{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                    условиями использования
                  </Link>{' '}
                  и{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                    политикой конфиденциальности
                  </Link>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;