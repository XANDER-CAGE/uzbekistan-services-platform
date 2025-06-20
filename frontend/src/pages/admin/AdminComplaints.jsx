import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  HandRaisedIcon,
  ShieldExclamationIcon,
  CurrencyDollarIcon,
  BugAntIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

const AdminComplaints = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    assignedAdminId: '',
    page: 1,
    limit: 20
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // Загрузка жалоб
  const { 
    data: complaintsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin-complaints', filters],
    queryFn: () => adminService.getComplaints(filters),
    keepPreviousData: true,
  });

  // Мутации для управления жалобами
  const updateComplaintMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updateComplaint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-complaints']);
      toast.success('Жалоба обновлена');
      setShowComplaintModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка обновления жалобы');
    }
  });

  const assignComplaintMutation = useMutation({
    mutationFn: ({ id, adminId }) => adminService.assignComplaint(id, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-complaints']);
      toast.success('Жалоба назначена');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ошибка назначения жалобы');
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleAssignToMe = (complaintId) => {
    assignComplaintMutation.mutate({ id: complaintId, adminId: null }); // null означает назначить текущему админу
  };

  const getComplaintTypeIcon = (type) => {
    const icons = {
      user_behavior: HandRaisedIcon,
      quality_issue: ExclamationTriangleIcon,
      payment_issue: CurrencyDollarIcon,
      fraud: ShieldExclamationIcon,
      inappropriate_content: ChatBubbleLeftEllipsisIcon,
      technical_issue: BugAntIcon,
      other: QuestionMarkCircleIcon
    };
    return icons[type] || QuestionMarkCircleIcon;
  };

  const getComplaintTypeLabel = (type) => {
    const labels = {
      user_behavior: 'Поведение пользователя',
      quality_issue: 'Проблемы с качеством',
      payment_issue: 'Проблемы с оплатой',
      fraud: 'Мошенничество',
      inappropriate_content: 'Неподходящий контент',
      technical_issue: 'Технические проблемы',
      other: 'Другое'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Ожидает' },
      in_review: { color: 'bg-blue-100 text-blue-800', label: 'Рассматривается' },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Решена' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Отклонена' },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Закрыта' }
    };
    return badges[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Низкий' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Средний' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'Высокий' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Срочный' }
    };
    return badges[priority] || { color: 'bg-gray-100 text-gray-800', label: priority };
  };

  const ComplaintCard = ({ complaint }) => {
    const TypeIcon = getComplaintTypeIcon(complaint.type);
    const statusBadge = getStatusBadge(complaint.status);
    const priorityBadge = getPriorityBadge(complaint.priority);

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
                  {complaint.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.color}`}>
                    {priorityBadge.label}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {complaint.description}
            </p>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-2" />
                <span>От: {complaint.reporter?.firstName} {complaint.reporter?.lastName}</span>
              </div>
              
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-2" />
                <span>На: {complaint.reportedUser?.firstName} {complaint.reportedUser?.lastName}</span>
              </div>
              
              {complaint.order && (
                <div className="flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  <span>Заказ: #{complaint.order.id}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>{new Date(complaint.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
              
              {complaint.assignedAdmin && (
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-blue-600">
                    Назначен: {complaint.assignedAdmin.firstName} {complaint.assignedAdmin.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => {
                setSelectedComplaint(complaint);
                setShowComplaintModal(true);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Просмотреть детали"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            
            {!complaint.assignedAdmin && complaint.status === 'pending' && (
              <button
                onClick={() => handleAssignToMe(complaint.id)}
                className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                title="Взять в работу"
                disabled={assignComplaintMutation.isLoading}
              >
                <HandRaisedIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ComplaintModal = ({ complaint, onClose }) => {
    const [status, setStatus] = useState(complaint?.status || '');
    const [priority, setPriority] = useState(complaint?.priority || '');
    const [adminComment, setAdminComment] = useState(complaint?.adminComment || '');
    const [resolution, setResolution] = useState(complaint?.resolution || '');

    if (!complaint) return null;

    const handleSave = () => {
      const updates = {};
      
      if (status !== complaint.status) updates.status = status;
      if (priority !== complaint.priority) updates.priority = priority;
      if (adminComment !== (complaint.adminComment || '')) updates.adminComment = adminComment;
      if (resolution !== (complaint.resolution || '')) updates.resolution = resolution;

      if (Object.keys(updates).length > 0) {
        updateComplaintMutation.mutate({ id: complaint.id, data: updates });
      } else {
        onClose();
      }
    };

    const TypeIcon = getComplaintTypeIcon(complaint.type);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <TypeIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {complaint.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getComplaintTypeLabel(complaint.type)} • Жалоба #{complaint.id}
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
            {/* Информация о жалобе */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">От кого жалоба</h4>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{complaint.reporter?.firstName} {complaint.reporter?.lastName}</p>
                      <p className="text-sm text-gray-600">{complaint.reporter?.phone}</p>
                      {complaint.reporter?.email && (
                        <p className="text-sm text-gray-600">{complaint.reporter.email}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">На кого жалоба</h4>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <UserIcon className="w-8 h-8 text-red-400" />
                    <div>
                      <p className="font-medium">{complaint.reportedUser?.firstName} {complaint.reportedUser?.lastName}</p>
                      <p className="text-sm text-gray-600">{complaint.reportedUser?.phone}</p>
                      {complaint.reportedUser?.email && (
                        <p className="text-sm text-gray-600">{complaint.reportedUser.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Детали</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Дата создания:</span>
                      <span>{new Date(complaint.createdAt).toLocaleString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Тип:</span>
                      <span>{getComplaintTypeLabel(complaint.type)}</span>
                    </div>
                    {complaint.order && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Связанный заказ:</span>
                        <span className="text-blue-600">#{complaint.order.id}</span>
                      </div>
                    )}
                    {complaint.assignedAdmin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Назначен:</span>
                        <span>{complaint.assignedAdmin.firstName} {complaint.assignedAdmin.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Прикрепленные файлы</h4>
                    <div className="space-y-2">
                      {complaint.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <PaperClipIcon className="w-4 h-4 text-gray-400" />
                          <a href={attachment} className="text-blue-600 hover:underline">
                            Файл {index + 1}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Описание жалобы */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Описание жалобы</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>
            </div>
            
            {/* Форма обновления */}
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">Обновить жалобу</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Ожидает рассмотрения</option>
                    <option value="in_review">Рассматривается</option>
                    <option value="resolved">Решена</option>
                    <option value="rejected">Отклонена</option>
                    <option value="closed">Закрыта</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Приоритет
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочный</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий администратора
                </label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Добавьте комментарий..."
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Решение по жалобе
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Опишите принятое решение..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleSave}
                  loading={updateComplaintMutation.isLoading}
                >
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Pagination = () => {
    if (!complaintsData) return null;

    const { page, totalPages } = complaintsData;
    const pages = [];
    
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Показано {Math.min(filters.limit, complaintsData.total)} из {complaintsData.total} жалоб
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
                Ошибка загрузки жалоб
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Управление жалобами</h1>
        <p className="text-gray-600">Рассмотрение и решение жалоб пользователей</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="pending">Ожидает рассмотрения</option>
              <option value="in_review">Рассматривается</option>
              <option value="resolved">Решена</option>
              <option value="rejected">Отклонена</option>
              <option value="closed">Закрыта</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все типы</option>
              <option value="user_behavior">Поведение пользователя</option>
              <option value="quality_issue">Проблемы с качеством</option>
              <option value="payment_issue">Проблемы с оплатой</option>
              <option value="fraud">Мошенничество</option>
              <option value="inappropriate_content">Неподходящий контент</option>
              <option value="technical_issue">Технические проблемы</option>
              <option value="other">Другое</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все приоритеты</option>
              <option value="urgent">Срочный</option>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FunnelIcon className="w-4 h-4" />
              <span>
                {complaintsData ? `Найдено: ${complaintsData.total} жалоб` : 'Загрузка...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
      ) : complaintsData?.complaints?.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {complaintsData.complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
          
          <Pagination />
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Жалобы не найдены
            </h3>
            <p className="text-gray-600">
              Нет жалоб, соответствующих выбранным фильтрам
            </p>
          </CardContent>
        </Card>
      )}

      {/* Complaint Modal */}
      {showComplaintModal && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowComplaintModal(false);
            setSelectedComplaint(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminComplaints;