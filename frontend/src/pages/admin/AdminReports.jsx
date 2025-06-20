import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin';
import { 
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BugAntIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

const AdminReports = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Загрузка отчетов
  const { 
    data: reportsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin-reports', filters],
    queryFn: () => adminService.getReports(filters),
    keepPreviousData: true,
    refetchInterval: 30000, // Обновляем каждые 30 секунд для отслеживания прогресса
  });

  // Мутации
  const createReportMutation = useMutation({
    mutationFn: adminService.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reports']);
      toast.success('Отчет создан и поставлен в очередь на генерацию');
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка создания отчета');
    }
  });

  const deleteReportMutation = useMutation({
    mutationFn: adminService.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reports']);
      toast.success('Отчет удален');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка удаления отчета');
    }
  });

  const downloadReportMutation = useMutation({
    mutationFn: adminService.downloadReport,
    onSuccess: (data) => {
      // Здесь должна быть логика скачивания файла
      toast.success('Отчет скачивается...');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка скачивания отчета');
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отчет? Это действие необратимо.')) {
      deleteReportMutation.mutate(reportId);
    }
  };

  const handleDownloadReport = (reportId) => {
    downloadReportMutation.mutate(reportId);
  };

  const getReportTypeIcon = (type) => {
    const icons = {
      user_statistics: UsersIcon,
      order_statistics: DocumentChartBarIcon,
      financial_report: CurrencyDollarIcon,
      executor_performance: BuildingOfficeIcon,
      category_analysis: DocumentTextIcon,
      complaint_summary: ExclamationTriangleIcon,
      system_health: BugAntIcon,
      custom: Cog6ToothIcon
    };
    return icons[type] || DocumentTextIcon;
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      user_statistics: 'Статистика пользователей',
      order_statistics: 'Статистика заказов',
      financial_report: 'Финансовый отчет',
      executor_performance: 'Производительность исполнителей',
      category_analysis: 'Анализ категорий',
      complaint_summary: 'Сводка жалоб',
      system_health: 'Состояние системы',
      custom: 'Пользовательский отчет'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Ожидает', icon: ClockIcon },
      generating: { color: 'bg-blue-100 text-blue-800', label: 'Генерируется', icon: ClockIcon },
      completed: { color: 'bg-green-100 text-green-800', label: 'Готов', icon: CheckCircleIcon },
      failed: { color: 'bg-red-100 text-red-800', label: 'Ошибка', icon: XCircleIcon },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Истек', icon: XCircleIcon }
    };
    return badges[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: ClockIcon };
  };

  const CreateReportModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      type: 'user_statistics',
      format: 'xlsx',
      dateFrom: '',
      dateTo: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      createReportMutation.mutate(formData);
    };

    const handleChange = (key, value) => {
      setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Создать новый отчет
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <Input
              label="Название отчета"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Введите название отчета"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Опишите содержание отчета"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип отчета
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="user_statistics">Статистика пользователей</option>
                  <option value="order_statistics">Статистика заказов</option>
                  <option value="financial_report">Финансовый отчет</option>
                  <option value="executor_performance">Производительность исполнителей</option>
                  <option value="category_analysis">Анализ категорий</option>
                  <option value="complaint_summary">Сводка жалоб</option>
                  <option value="system_health">Состояние системы</option>
                  <option value="custom">Пользовательский</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Формат
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => handleChange('format', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="json">JSON (.json)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Дата начала (необязательно)"
                type="date"
                value={formData.dateFrom}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
              />
              
              <Input
                label="Дата окончания (необязательно)"
                type="date"
                value={formData.dateTo}
                onChange={(e) => handleChange('dateTo', e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button 
                type="submit"
                loading={createReportMutation.isLoading}
              >
                Создать отчет
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ReportCard = ({ report }) => {
    const TypeIcon = getReportTypeIcon(report.type);
    const statusBadge = getStatusBadge(report.status);
    const StatusIcon = statusBadge.icon;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <TypeIcon className="w-5 h-5 text-gray-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {report.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusBadge.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getReportTypeLabel(report.type)}
                  </span>
                </div>
              </div>
            </div>
            
            {report.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {report.description}
              </p>
            )}
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-2" />
                <span>Создан: {report.creator?.firstName} {report.creator?.lastName}</span>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>{new Date(report.createdAt).toLocaleString('ru-RU')}</span>
              </div>
              
              {report.status === 'generating' && (
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-blue-600">
                    Прогресс: {report.progressPercent || 0}%
                  </span>
                </div>
              )}
              
              {report.status === 'completed' && (
                <div className="space-y-1">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-green-600">
                      Размер: {report.formattedFileSize || 'N/A'}
                    </span>
                  </div>
                  {report.downloadCount > 0 && (
                    <div className="flex items-center">
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      <span>Скачиваний: {report.downloadCount}</span>
                    </div>
                  )}
                </div>
              )}
              
              {report.status === 'failed' && report.errorMessage && (
                <div className="flex items-center text-red-600">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  <span className="text-xs">{report.errorMessage}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => {
                setSelectedReport(report);
                setShowReportModal(true);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Просмотреть детали"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            
            {report.status === 'completed' && (
              <button
                onClick={() => handleDownloadReport(report.id)}
                className="p-2 text-green-400 hover:text-green-600 transition-colors"
                title="Скачать отчет"
                disabled={downloadReportMutation.isLoading}
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={() => handleDeleteReport(report.id)}
              className="p-2 text-red-400 hover:text-red-600 transition-colors"
              title="Удалить отчет"
              disabled={deleteReportMutation.isLoading}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    const TypeIcon = getReportTypeIcon(report.type);
    const statusBadge = getStatusBadge(report.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <TypeIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Отчет #{report.id}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Основная информация</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Тип:</span>
                      <span>{getReportTypeLabel(report.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Формат:</span>
                      <span className="uppercase">{report.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Статус:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Создан:</span>
                      <span>{new Date(report.createdAt).toLocaleString('ru-RU')}</span>
                    </div>
                    {report.creator && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Автор:</span>
                        <span>{report.creator.firstName} {report.creator.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {(report.dateFrom || report.dateTo) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Период отчета</h4>
                    <div className="space-y-2 text-sm">
                      {report.dateFrom && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">С:</span>
                          <span>{new Date(report.dateFrom).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                      {report.dateTo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">По:</span>
                          <span>{new Date(report.dateTo).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {report.status === 'generating' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Прогресс генерации</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Выполнено:</span>
                        <span>{report.progressPercent || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${report.progressPercent || 0}%` }}
                        />
                      </div>
                      {report.startedAt && (
                        <div className="text-xs text-gray-600">
                          Начат: {new Date(report.startedAt).toLocaleString('ru-RU')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {report.status === 'completed' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Результат</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Размер файла:</span>
                        <span>{report.formattedFileSize || 'N/A'}</span>
                      </div>
                      {report.recordsCount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Записей:</span>
                          <span>{report.recordsCount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Завершен:</span>
                        <span>{new Date(report.completedAt).toLocaleString('ru-RU')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Скачиваний:</span>
                        <span>{report.downloadCount}</span>
                      </div>
                      {report.lastDownloadedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Последнее скачивание:</span>
                          <span>{new Date(report.lastDownloadedAt).toLocaleString('ru-RU')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {report.status === 'failed' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ошибка</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">
                        {report.errorMessage || 'Произошла неизвестная ошибка'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {report.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Описание</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{report.description}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex space-x-3">
                {report.status === 'completed' && (
                  <Button
                    onClick={() => handleDownloadReport(report.id)}
                    loading={downloadReportMutation.isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Скачать
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => handleDeleteReport(report.id)}
                  loading={deleteReportMutation.isLoading}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              </div>
              
              <Button variant="outline" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Pagination = () => {
    if (!reportsData) return null;

    const { page, totalPages } = reportsData;
    const pages = [];
    
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Показано {Math.min(filters.limit, reportsData.total)} из {reportsData.total} отчетов
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          {pages.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                pageNum === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Ошибка загрузки отчетов
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
          <h1 className="text-2xl font-bold text-gray-900">Управление отчетами</h1>
          <p className="text-gray-600">Создание и управление отчетами по активности платформы</p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Создать отчет
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все типы</option>
              <option value="user_statistics">Статистика пользователей</option>
              <option value="order_statistics">Статистика заказов</option>
              <option value="financial_report">Финансовый отчет</option>
              <option value="executor_performance">Производительность исполнителей</option>
              <option value="category_analysis">Анализ категорий</option>
              <option value="complaint_summary">Сводка жалоб</option>
              <option value="system_health">Состояние системы</option>
              <option value="custom">Пользовательский</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="pending">Ожидает</option>
              <option value="generating">Генерируется</option>
              <option value="completed">Готов</option>
              <option value="failed">Ошибка</option>
              <option value="expired">Истек</option>
            </select>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DocumentTextIcon className="w-4 h-4" />
              <span>
                {reportsData ? `Найдено: ${reportsData.total} отчетов` : 'Загрузка...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : reportsData?.reports?.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportsData.reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
          
          <Pagination />
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Отчеты не найдены
            </h3>
            <p className="text-gray-600 mb-4">
              Создайте первый отчет для анализа активности платформы
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Создать отчет
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <CreateReportModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Report Details Modal */}
      {showReportModal && (
        <ReportModal
          report={selectedReport}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminReports;