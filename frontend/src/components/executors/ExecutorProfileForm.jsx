import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { executorsService } from '../../services/executors';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import FileUpload from '../ui/FileUpload';
import { 
  UserIcon, 
  MapPinIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ExecutorProfileForm = ({ existingProfile, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState(existingProfile?.portfolioImages || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: existingProfile ? {
      bio: existingProfile.bio || '',
      experienceYears: existingProfile.experienceYears || '',
      hourlyRate: existingProfile.hourlyRate || '',
      locationLat: existingProfile.locationLat || '',
      locationLng: existingProfile.locationLng || '',
      address: existingProfile.address || '',
      workRadiusKm: existingProfile.workRadiusKm || 10,
      telegramUsername: existingProfile.telegramUsername || '',
      instagramUsername: existingProfile.instagramUsername || '',
      workStartTime: existingProfile.workStartTime || '09:00',
      workEndTime: existingProfile.workEndTime || '18:00',
      workingDays: existingProfile.workingDays || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false
      },
      isAvailable: existingProfile.isAvailable !== false
    } : {
      workRadiusKm: 10,
      workStartTime: '09:00',
      workEndTime: '18:00',
      workingDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false
      },
      isAvailable: true
    }
  });

  const watchWorkingDays = watch('workingDays');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let result;
      
      if (existingProfile) {
        result = await executorsService.updateMyProfile(data);
        toast.success('Профиль обновлен');
      } else {
        result = await executorsService.createProfile(data);
        toast.success('Профиль создан');
      }

      // Загружаем портфолио если есть новые файлы
      if (portfolioFiles.length > 0) {
        await executorsService.uploadPortfolio(portfolioFiles);
        toast.success('Портфолио загружено');
      }

      onSuccess?.(result);
    } catch (error) {
      console.error('Profile save error:', error);
      const message = error.response?.data?.message || 'Ошибка при сохранении профиля';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioChange = (files) => {
    setPortfolioFiles(files);
  };

  const handleRemovePortfolioImage = async (imageUrl) => {
    try {
      await executorsService.removePortfolioImage(imageUrl);
      setPortfolioImages(prev => prev.filter(img => img !== imageUrl));
      toast.success('Фотография удалена');
    } catch (error) {
      toast.error('Ошибка удаления фотографии');
    }
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('locationLat', position.coords.latitude);
          setValue('locationLng', position.coords.longitude);
          toast.success('Местоположение определено');
        },
        (error) => {
          toast.error('Не удалось определить местоположение');
        }
      );
    } else {
      toast.error('Геолокация не поддерживается');
    }
  };

  const dayLabels = {
    monday: 'Понедельник',
    tuesday: 'Вторник', 
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Основная информация */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Основная информация</h2>
              <p className="text-sm text-gray-600">Расскажите о себе и своем опыте</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              О себе
            </label>
            <textarea
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              rows={4}
              placeholder="Опишите свой опыт, специализацию и подход к работе..."
              {...register('bio', {
                maxLength: {
                  value: 1000,
                  message: 'Описание не должно превышать 1000 символов'
                }
              })}
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Опыт работы (лет)"
              type="number"
              min="0"
              max="50"
              placeholder="5"
              error={errors.experienceYears?.message}
              {...register('experienceYears', {
                min: {
                  value: 0,
                  message: 'Опыт не может быть отрицательным'
                },
                max: {
                  value: 50,
                  message: 'Опыт не может превышать 50 лет'
                }
              })}
            />

            <Input
              label="Почасовая ставка (сум)"
              type="number"
              min="0"
              placeholder="50000"
              error={errors.hourlyRate?.message}
              {...register('hourlyRate', {
                min: {
                  value: 0,
                  message: 'Ставка не может быть отрицательной'
                }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Местоположение */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Местоположение</h2>
              <p className="text-sm text-gray-600">Укажите где вы работаете</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            label="Адрес"
            placeholder="г. Ташкент, Юнусабадский район"
            error={errors.address?.message}
            {...register('address', {
              maxLength: {
                value: 500,
                message: 'Адрес не должен превышать 500 символов'
              }
            })}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Широта"
              type="number"
              step="any"
              placeholder="41.2995"
              error={errors.locationLat?.message}
              {...register('locationLat', {
                min: {
                  value: -90,
                  message: 'Широта должна быть от -90 до 90'
                },
                max: {
                  value: 90,
                  message: 'Широта должна быть от -90 до 90'
                }
              })}
            />

            <Input
              label="Долгота"
              type="number"
              step="any"
              placeholder="69.2401"
              error={errors.locationLng?.message}
              {...register('locationLng', {
                min: {
                  value: -180,
                  message: 'Долгота должна быть от -180 до 180'
                },
                max: {
                  value: 180,
                  message: 'Долгота должна быть от -180 до 180'
                }
              })}
            />

            <Input
              label="Радиус работы (км)"
              type="number"
              min="1"
              max="100"
              placeholder="15"
              error={errors.workRadiusKm?.message}
              {...register('workRadiusKm', {
                min: {
                  value: 1,
                  message: 'Радиус должен быть от 1 км'
                },
                max: {
                  value: 100,
                  message: 'Радиус не может превышать 100 км'
                }
              })}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleLocationDetect}
            className="w-full md:w-auto"
          >
            <MapPinIcon className="w-4 h-4 mr-2" />
            Определить мое местоположение
          </Button>
        </CardContent>
      </Card>

      {/* Рабочее время */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <ClockIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Рабочее время</h2>
              <p className="text-sm text-gray-600">Когда вы доступны для работы</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Время начала работы"
              type="time"
              {...register('workStartTime')}
            />

            <Input
              label="Время окончания работы"
              type="time"
              {...register('workEndTime')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Рабочие дни
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(dayLabels).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    {...register(`workingDays.${key}`)}
                  />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('isAvailable')}
            />
            <div>
              <label className="text-sm font-medium text-gray-700">
                Доступен для заказов
              </label>
              <p className="text-sm text-gray-500">
                Отключите, если временно не принимаете заказы
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Социальные сети */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Контакты и социальные сети</h2>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telegram никнейм"
              placeholder="@username"
              error={errors.telegramUsername?.message}
              {...register('telegramUsername', {
                maxLength: {
                  value: 100,
                  message: 'Никнейм не должен превышать 100 символов'
                }
              })}
            />

            <Input
              label="Instagram никнейм"
              placeholder="@username"
              error={errors.instagramUsername?.message}
              {...register('instagramUsername', {
                maxLength: {
                  value: 100,
                  message: 'Никнейм не должен превышать 100 символов'
                }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Портфолио */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <PhotoIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Портфолио</h2>
              <p className="text-sm text-gray-600">Покажите примеры своих работ</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Текущие фотографии */}
          {portfolioImages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Текущие фотографии</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolioImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Работа ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioImage(imageUrl)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Загрузка новых фотографий */}
          <FileUpload
            multiple
            maxFiles={10}
            maxSize={5 * 1024 * 1024}
            allowedTypes={['image/*']}
            onFilesChange={handlePortfolioChange}
            label="Добавить фотографии работ"
            description="Загрузите до 10 фотографий ваших работ (до 5MB каждая)"
          />
        </CardContent>
      </Card>

      {/* Кнопки */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
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
          {loading ? 'Сохранение...' : existingProfile ? 'Обновить профиль' : 'Создать профиль'}
        </Button>
      </div>
    </form>
  );
};

export default ExecutorProfileForm;