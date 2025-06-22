import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../services/orders';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await ordersService.getOrderById(id);
      setOrder(orderData);
      
      // Если это владелец заказа, загружаем заявки
      if (user && orderData.customerId === user.id) {
        const applicationsData = await ordersService.getOrderApplications(id);
        setApplications(applicationsData);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Ошибка загрузки заказа');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setActionLoading(true);
      await ordersService.updateOrderStatus(id, { status: newStatus });
      toast.success('Статус заказа обновлен');
      loadOrder();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Ошибка обновления статуса');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      setActionLoading(true);
      await ordersService.acceptApplication(applicationId);
      toast.success('Заявка принята');
      loadOrder();
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Ошибка при принятии заявки');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      setActionLoading(true);
      await ordersService.rejectApplication(applicationId, 'Выбран другой исполнитель');
      toast.success('Заявка отклонена');
      loadOrder();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Ошибка при отклонении заявки');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
  
    try {
      setActionLoading(true);
      
      const result = await ordersService.uploadAttachments(id, Array.from(files));
      toast.success(result.message || 'Файлы загружены');
      
      // Перезагружаем заказ
      loadOrder();
    } catch (error) {
      console.error('File upload error:', error);
      
      if (error.response?.status === 400) {
        toast.error('Ошибка загрузки файлов. Проверьте формат и размер.');
      } else {
        toast.error('Ошибка загрузки файлов');
      }
    } finally {
      setActionLoading(false);
    }
  };
  

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_confirmation: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
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
    if (!order) return '';
    
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

  const isOwner = user && order && order.customerId === user.id;
  const isExecutor = user && order && order.executorId === user.id;
  const canApply = user && order && order.status === 'open' && !isOwner && !isExecutor;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Заказ не найден</h2>
            <p className="text-gray-600 mb-4">Проверьте правильность ссылки</p>
            <Button onClick={() => navigate('/orders')}>
              Вернуться к заказам
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                ← Назад
              </button>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(order.urgency)}`}>
                  {getUrgencyLabel(order.urgency)}
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{order.title}</h1>
            <p className="text-gray-600">
              Заказ №{order.id} • Создан {new Date(order.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Основная информация */}
            <div className="lg:col-span-2 space-y-6">
              {/* Описание */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Описание задачи</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{order.description}</p>
                </CardContent>
              </Card>

              {/* Детали */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Детали заказа</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Бюджет</p>
                        <p className="font-medium text-green-600">{formatBudget()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Адрес</p>
                        <p className="font-medium">{order.address}</p>
                      </div>
                    </div>

                    {order.preferredStartDate && (
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Желаемая дата начала</p>
                          <p className="font-medium">
                            {new Date(order.preferredStartDate).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.deadline && (
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Крайний срок</p>
                          <p className="font-medium text-orange-600">
                            {new Date(order.deadline).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Категория */}
                  {order.category && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Категория</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {order.category.nameRu}
                      </span>
                    </div>
                  )}

                  {/* Файлы */}
                  {order.attachments && order.attachments.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Прикрепленные файлы</p>
                      <div className="space-y-2">
                        {order.attachments.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <PaperClipIcon className="w-4 h-4 text-gray-400" />
                            <a 
                              href={file} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 text-sm"
                            >
                              Файл {index + 1}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Заявки (для владельца заказа) */}
              {isOwner && applications.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Заявки исполнителей ({applications.length})
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div 
                          key={application.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {application.executor?.user?.firstName} {application.executor?.user?.lastName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Рейтинг: {application.executor?.rating || 'Нет рейтинга'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {application.proposedPrice && (
                                <p className="font-semibold text-green-600">
                                  {application.proposedPrice.toLocaleString()} сум
                                </p>
                              )}
                              {application.proposedDurationDays && (
                                <p className="text-sm text-gray-500">
                                  {application.proposedDurationDays} дн.
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-700 mb-3">{application.message}</p>

                          {application.status === 'pending' && order.status === 'open' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptApplication(application.id)}
                                disabled={actionLoading}
                              >
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                Принять
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectApplication(application.id)}
                                disabled={actionLoading}
                              >
                                <XMarkIcon className="w-4 h-4 mr-1" />
                                Отклонить
                              </Button>
                            </div>
                          )}

                          {application.status !== 'pending' && (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className={`px-2 py-1 rounded-full ${
                                application.status === 'accepted' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {application.status === 'accepted' ? 'Принята' : 'Отклонена'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Боковая панель */}
            <div className="space-y-6">
              {/* Заказчик */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Заказчик</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        На платформе с {new Date(order.customer?.createdAt).getFullYear()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Действия */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  {canApply && (
                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/orders/${id}/apply`)}
                    >
                      Откликнуться на заказ
                    </Button>
                  )}

                  {isOwner && order.status === 'open' && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={actionLoading}
                    >
                      Отменить заказ
                    </Button>
                  )}

                  {isExecutor && order.status === 'in_progress' && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusUpdate('waiting_confirmation')}
                      disabled={actionLoading}
                    >
                      Работа завершена
                    </Button>
                  )}

                  {isOwner && order.status === 'waiting_confirmation' && (
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/orders/${id}/complete`)}
                      >
                        Подтвердить выполнение
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={actionLoading}
                      >
                        Вернуть в работу
                      </Button>
                    </div>
                  )}

                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => navigate(`/orders/${id}/messages`)}
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                    Написать сообщение
                  </Button>
                  {isOwner && order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className="mt-3">
                      <label className="w-full">
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                        <span className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                          <PaperClipIcon className="w-4 h-4 mr-2" />
                          Добавить файлы
                        </span>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Статистика */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Просмотров:</span>
                      <span className="font-medium">{order.viewsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Откликов:</span>
                      <span className="font-medium">{order.applicationsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Создан:</span>
                      <span className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailPage;