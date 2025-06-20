import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin';
import { 
  Cog6ToothIcon,
  PlusIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingSetting, setEditingSetting] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Загрузка настроек
  const { 
    data: settings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin-settings', selectedCategory],
    queryFn: () => adminService.getSettings(selectedCategory),
  });

  // Мутации
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }) => adminService.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-settings']);
      toast.success('Настройка обновлена');
      setEditingSetting(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка обновления настройки');
    }
  });

  const createSettingMutation = useMutation({
    mutationFn: adminService.createSetting,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-settings']);
      toast.success('Настройка создана');
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка создания настройки');
    }
  });

  const categories = [
    {
      key: 'general',
      label: 'Общие',
      icon: GlobeAltIcon,
      description: 'Основные настройки платформы'
    },
    {
      key: 'payment',
      label: 'Платежи',
      icon: CurrencyDollarIcon,
      description: 'Настройки платежной системы'
    },
    {
      key: 'commission',
      label: 'Комиссии',
      icon: CurrencyDollarIcon,
      description: 'Настройки комиссий и тарифов'
    },
    {
      key: 'notification',
      label: 'Уведомления',
      icon: BellIcon,
      description: 'Настройки уведомлений'
    },
    {
      key: 'moderation',
      label: 'Модерация',
      icon: ShieldCheckIcon,
      description: 'Настройки модерации контента'
    },
    {
      key: 'security',
      label: 'Безопасность',
      icon: ShieldCheckIcon,
      description: 'Настройки безопасности'
    },
    {
      key: 'features',
      label: 'Функции',
      icon: SparklesIcon,
      description: 'Включение/отключение функций'
    }
  ];

  const getSettingTypeLabel = (type) => {
    const labels = {
      string: 'Строка',
      number: 'Число',
      boolean: 'Да/Нет',
      json: 'JSON'
    };
    return labels[type] || type;
  };

  const SettingCard = ({ setting }) => {
    const [tempValue, setTempValue] = useState(setting.value);
    const isEditing = editingSetting === setting.key;

    const handleEdit = () => {
      setTempValue(setting.value);
      setEditingSetting(setting.key);
    };

    const handleSave = () => {
      if (tempValue !== setting.value) {
        updateSettingMutation.mutate({ 
          key: setting.key, 
          value: tempValue 
        });
      } else {
        setEditingSetting(null);
      }
    };

    const handleCancel = () => {
      setTempValue(setting.value);
      setEditingSetting(null);
    };

    const renderValueInput = () => {
      if (setting.type === 'boolean') {
        return (
          <select
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!isEditing}
          >
            <option value="true">Да</option>
            <option value="false">Нет</option>
          </select>
        );
      }

      if (setting.type === 'number') {
        return (
          <input
            type="number"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!isEditing}
          />
        );
      }

      if (setting.possibleValues && setting.possibleValues.length > 0) {
        return (
          <select
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!isEditing}
          >
            {setting.possibleValues.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        );
      }

      if (setting.type === 'json') {
        return (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            disabled={!isEditing}
            placeholder='{"key": "value"}'
          />
        );
      }

      return (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={!isEditing}
        />
      );
    };

    const renderDisplayValue = () => {
      if (setting.type === 'boolean') {
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            setting.value === 'true' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {setting.value === 'true' ? 'Включено' : 'Отключено'}
          </span>
        );
      }

      if (setting.type === 'json') {
        try {
          const parsed = JSON.parse(setting.value);
          return (
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          );
        } catch {
          return <span className="text-red-600 text-sm">Некорректный JSON</span>;
        }
      }

      return <span className="text-gray-900">{setting.value}</span>;
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{setting.name}</h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {getSettingTypeLabel(setting.type)}
              </span>
              {!setting.isEditable && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Только чтение
                </span>
              )}
              {setting.requiresRestart && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Требует перезапуска
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
            <div className="text-xs text-gray-500 mb-2">
              <span className="font-medium">Ключ:</span> {setting.key}
            </div>
          </div>
          
          {setting.isEditable && (
            <div className="flex space-x-2 ml-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={updateSettingMutation.isLoading}
                    className="p-2 text-green-600 hover:text-green-700 transition-colors"
                    title="Сохранить"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Отмена"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Редактировать"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Текущее значение
            </label>
            {isEditing ? renderValueInput() : renderDisplayValue()}
          </div>
          
          {setting.defaultValue && setting.defaultValue !== setting.value && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Значение по умолчанию
              </label>
              <span className="text-sm text-gray-500">{setting.defaultValue}</span>
            </div>
          )}
          
          {setting.validation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <InformationCircleIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  Правила валидации: {setting.validation}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CreateSettingModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
      key: '',
      name: '',
      description: '',
      value: '',
      defaultValue: '',
      type: 'string',
      category: selectedCategory || 'general',
      possibleValues: '',
      validation: '',
      requiresRestart: false,
      isEditable: true,
      isPublic: false
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const submitData = {
        ...formData,
        possibleValues: formData.possibleValues 
          ? formData.possibleValues.split(',').map(v => v.trim()).filter(v => v)
          : undefined
      };
      
      createSettingMutation.mutate(submitData);
    };

    const handleChange = (key, value) => {
      setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Создать новую настройку
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ключ настройки"
                type="text"
                required
                value={formData.key}
                onChange={(e) => handleChange('key', e.target.value)}
                placeholder="setting_key"
              />
              
              <Input
                label="Название"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Название настройки"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Описание настройки"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип данных
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="string">Строка</option>
                  <option value="number">Число</option>
                  <option value="boolean">Да/Нет</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Значение"
                type="text"
                required
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="Текущее значение"
              />
              
              <Input
                label="Значение по умолчанию"
                type="text"
                required
                value={formData.defaultValue}
                onChange={(e) => handleChange('defaultValue', e.target.value)}
                placeholder="Значение по умолчанию"
              />
            </div>
            
            <Input
              label="Возможные значения (через запятую)"
              type="text"
              value={formData.possibleValues}
              onChange={(e) => handleChange('possibleValues', e.target.value)}
              placeholder="option1, option2, option3"
            />
            
            <Input
              label="Правила валидации (regex)"
              type="text"
              value={formData.validation}
              onChange={(e) => handleChange('validation', e.target.value)}
              placeholder="^[a-zA-Z0-9]+$"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requiresRestart}
                  onChange={(e) => handleChange('requiresRestart', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Требует перезапуска</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isEditable}
                  onChange={(e) => handleChange('isEditable', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Можно редактировать</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleChange('isPublic', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Публичная</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button 
                type="submit"
                loading={createSettingMutation.isLoading}
              >
                Создать настройку
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Группировка настроек по категориям
  const groupedSettings = settings?.reduce((acc, setting) => {
    const category = setting.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {}) || {};

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Ошибка загрузки настроек
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error.response?.data?.message || 'Произошла ошибка при загрузке данных'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Системные настройки</h1>
          <p className="text-gray-600">Управление конфигурацией платформы</p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Создать настройку
        </Button>
      </div>

      {/* Categories Filter */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Категории настроек</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedCategory === ''
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <WrenchScrewdriverIcon className="w-5 h-5 mb-2" />
              <div className="font-medium text-sm">Все</div>
              <div className="text-xs text-gray-500">
                {settings?.length || 0} настроек
              </div>
            </button>
            
            {categories.map((category) => {
              const Icon = category.icon;
              const count = groupedSettings[category.key]?.length || 0;
              
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedCategory === category.key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-2" />
                  <div className="font-medium text-sm">{category.label}</div>
                  <div className="text-xs text-gray-500">{count} настроек</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings List */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : settings?.length > 0 ? (
        <div className="space-y-6">
          {selectedCategory ? (
            <div>
              {groupedSettings[selectedCategory]?.map((setting) => (
                <div key={setting.id} className="mb-6">
                  <SettingCard setting={setting} />
                </div>
              ))}
            </div>
          ) : (
            Object.entries(groupedSettings).map(([categoryKey, categorySettings]) => {
              const category = categories.find(c => c.key === categoryKey);
              const Icon = category?.icon || Cog6ToothIcon;
              
              return (
                <div key={categoryKey}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category?.label || categoryKey}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category?.description || `Настройки категории ${categoryKey}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {categorySettings.map((setting) => (
                      <SettingCard key={setting.id} setting={setting} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Cog6ToothIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Настройки не найдены
            </h3>
            <p className="text-gray-600 mb-4">
              В выбранной категории нет настроек
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Создать настройку
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Setting Modal */}
      {showCreateModal && (
        <CreateSettingModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default AdminSettings;